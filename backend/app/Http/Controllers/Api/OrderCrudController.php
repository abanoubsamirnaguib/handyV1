<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use Illuminate\Http\Request;
use App\Http\Resources\OrderResource;
use App\Http\Requests\OrderRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\Notification;
use App\Services\NotificationService;
use App\Models\City;

class OrderCrudController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['user', 'seller', 'items.product', 'adminApprover', 'deliveryPerson', 'city', 'history.actionUser']);
        
        // فلترة حسب المستخدم
        if ($request->has('user_orders')) {
            $query->where('user_id', Auth::id());
        }
        
        // فلترة حسب البائع
        if ($request->has('seller_orders')) {
            $sellerId = Auth::user()->seller?->id;
            if ($sellerId) {
                $query->where('seller_id', $sellerId);
            } else {
                return response()->json(['message' => 'غير مصرح لك بالوصول لطلبات البائعين'], 403);
            }
        }
        
        // فلترة حسب الحالة
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        // فلترة حسب طريقة الدفع
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }
        
        // ترتيب حسب التاريخ
        $query->orderBy('created_at', 'desc');
        
        $orders = $query->paginate($request->per_page ?? 15);
        
        return OrderResource::collection($orders);
    }
    
    public function store(Request $request)
    {
        // تحويل cart_items من JSON string إلى array إذا لزم الأمر
        $cartItems = $request->input('cart_items');
        if (is_string($cartItems)) {
            $cartItems = json_decode($cartItems, true);
            $request->merge(['cart_items' => $cartItems]);
        }
        
        // Check if this is a service order
        $isServiceOrder = $request->has('is_service_order') && $request->boolean('is_service_order');
        
        if ($isServiceOrder) {
            $validated = $request->validate([
                'service_id' => 'required|exists:products,id',
                'seller_id' => 'required|exists:users,id',
                'customer_name' => 'required|string|max:100',
                'customer_phone' => 'required|string|max:20',
                'delivery_address' => 'required|string',
                'service_requirements' => 'nullable|string',
                'deposit_amount' => 'required|numeric|min:1|max:' . ($request->total_price * 0.8),
                'payment_method' => 'required|in:cash_on_delivery,bank_transfer,credit_card,vodafone_cash,instapay',
                'deposit_image' => 'required|image|max:2048',
                'total_price' => 'required|numeric|min:0',
                'buyer_proposed_price' => 'nullable|numeric|min:1',
                'city_id' => 'required|exists:cities,id',
            ]);
        } else {
            $validated = $request->validate([
                'cart_items' => 'required|array',
                'cart_items.*.product_id' => 'required|exists:products,id',
                'cart_items.*.quantity' => 'required|integer|min:1',
                'customer_name' => 'required|string|max:100',
                'customer_phone' => 'required|string|max:20',
                'delivery_address' => 'required|string',
                'payment_method' => 'required|in:cash_on_delivery,bank_transfer,credit_card,vodafone_cash,instapay',
                'requirements' => 'nullable|string',
                'payment_proof' => 'nullable|image|max:2048', // صورة إثبات الدفع
                'city_id' => 'required|exists:cities,id',
            ]);
        }

        try {
            DB::beginTransaction();
            
            \Log::info('Starting order creation process');
            \Log::info('Validated data: ', $validated);
            \Log::info('Is service order: ', [$isServiceOrder]);
            
            if ($isServiceOrder) {
                // Handle service order
                $service = \App\Models\Product::findOrFail($validated['service_id']);
                
                // Convert user_id to seller_id from sellers table
                // The request might send either user_id or seller_id, we need to get the actual seller.id
                $user = \App\Models\User::findOrFail($validated['seller_id']);
                if (!$user->seller) {
                    throw new \Exception('المستخدم المحدد ليس بائعاً');
                }
                $seller_id = $user->seller->id;
                
                // Verify service belongs to seller
                if ($service->seller_id != $seller_id) {
                    throw new \Exception('الخدمة لا تنتمي لهذا البائع');
                }
                
                // تحديد السعر الفعلي المستخدم
                $hasBuyerProposedPrice = isset($validated['buyer_proposed_price']) && 
                                         $validated['buyer_proposed_price'] > 0 &&
                                         $validated['buyer_proposed_price'] != $validated['total_price'];
                
                $finalPrice = $hasBuyerProposedPrice ? $validated['buyer_proposed_price'] : $validated['total_price'];
                
                // إذا السعر الأصلي 0 ولا يوجد سعر مقترح، نرفض الطلب
                if ($validated['total_price'] == 0 && !$hasBuyerProposedPrice) {
                    throw new \Exception('يجب إدخال سعر مقترح للخدمات القابلة للتفاوض');
                }
                
                // التحقق من أن العربون لا يتجاوز 80% من قيمة المنتج
                $maxDepositAmount = $finalPrice * 0.8;
                if ($validated['deposit_amount'] > $maxDepositAmount) {
                    throw new \Exception('قيمة العربون لا يمكن أن تتجاوز 80% من قيمة المنتج الأصلي');
                }
                
                // Upload deposit image
                $depositImagePath = null;
                if ($request->hasFile('deposit_image')) {
                    $depositImagePath = $request->file('deposit_image')->store('deposit_images', 'public');
                }
                
                // Create service order
                $orderData = [
                    'user_id' => Auth::id(),
                    'seller_id' => $seller_id,
                    'status' => 'pending',
                    'total_price' => $validated['total_price'], // السعر الأصلي
                    'original_service_price' => $service->price, // حفظ سعر الخدمة الأصلي
                    'order_date' => now(),
                    'customer_name' => $validated['customer_name'],
                    'customer_phone' => $validated['customer_phone'],
                    'delivery_address' => $validated['delivery_address'],
                    'payment_method' => $validated['payment_method'],
                    'payment_status' => 'partial', // partial because deposit is paid
                    'requires_deposit' => true,
                    'deposit_amount' => $validated['deposit_amount'],
                    'deposit_status' => 'paid',
                    'deposit_image' => $depositImagePath,
                    'is_service_order' => true,
                    'service_requirements' => $validated['service_requirements'] ?? null,
                    'city_id' => $validated['city_id'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                
                // إذا كان هناك سعر مقترح من المشتري، نضيفه ونضع حالة انتظار موافقة البائع
                if ($hasBuyerProposedPrice) {
                    $orderData['buyer_proposed_price'] = $validated['buyer_proposed_price'];
                    $orderData['price_approval_status'] = 'pending_approval';
                }
                
                $order = Order::create($orderData);
                
                // Add service as order item
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $service->id,
                    'quantity' => 1,
                    'price' => $service->price,
                    'subtotal' => $service->price,
                    'created_at' => now(),
                ]);
                
                // Add order history
                if ($hasBuyerProposedPrice) {
                    $order->addToHistory('pending', Auth::id(), 'service_order_created', 
                        "تم إنشاء طلب خدمة مع دفع العربون - السعر المقترح: {$validated['buyer_proposed_price']} ج.م (في انتظار موافقة البائع)");
                } else {
                    $order->addToHistory('pending', Auth::id(), 'service_order_created', 'تم إنشاء طلب خدمة مع دفع العربون');
                }
                
                // Send notification to seller
                if ($order->seller && $order->seller->user_id) {
                    if ($hasBuyerProposedPrice) {
                        // إشعار بطلب جديد يحتوي على سعر مقترح
                        NotificationService::create(
                            $order->seller->user_id,
                            'new_price_proposal',
                            "طلب خدمة جديد #{$order->id} يحتوي على سعر مقترح {$validated['buyer_proposed_price']} ج.م (السعر الأصلي: {$validated['total_price']} ج.م). يرجى مراجعة الطلب والموافقة على السعر.",
                            "/orders/{$order->id}"
                        );
                    } else {
                        // إشعار عادي بدفع عربون
                        NotificationService::depositReceived(
                            $order->seller->user_id,
                            $order->deposit_amount,
                            $order->id
                        );
                    }
                }
                
            } else {
                // Handle regular product order
                // حساب إجمالي السعر
                $totalPrice = 0;
                $sellerId = null;
                
                foreach ($validated['cart_items'] as $item) {
                    \Log::info('Processing cart item: ', $item);
                    
                    $product = \App\Models\Product::findOrFail($item['product_id']);
                    \Log::info('Found product: ', ['id' => $product->id, 'title' => $product->title, 'seller_id' => $product->seller_id]);
                    
                    $totalPrice += $product->price * $item['quantity'];
                    
                    // تأكد من أن جميع المنتجات من نفس البائع
                    if (!$sellerId) {
                        $sellerId = $product->seller_id;
                        \Log::info('Set seller ID: ' . $sellerId);
                    } elseif ($sellerId !== $product->seller_id) {
                        throw new \Exception('لا يمكن أن تحتوي الطلبية على منتجات من بائعين مختلفين');
                    }
                }
                
                \Log::info('Total price calculated: ' . $totalPrice);
                \Log::info('Seller ID: ' . $sellerId);
                
                // رفع صورة إثبات الدفع إذا وجدت
                $paymentProofPath = null;
                if ($request->hasFile('payment_proof')) {
                    $paymentProofPath = $request->file('payment_proof')->store('payment_proofs', 'public');
                }
                
                // إنشاء الطلب
                $order = Order::create([
                    'user_id' => Auth::id(),
                    'seller_id' => $sellerId,
                    'status' => 'pending',
                    'total_price' => $totalPrice,
                    'order_date' => now(),
                    'customer_name' => $validated['customer_name'],
                    'customer_phone' => $validated['customer_phone'],
                    'delivery_address' => $validated['delivery_address'],
                    'payment_method' => $validated['payment_method'],
                    'payment_status' => 'pending',
                    'requirements' => $validated['requirements'] ?? null,
                    'payment_proof' => $paymentProofPath,
                    'is_service_order' => false,
                    'city_id' => $validated['city_id'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                // إضافة عناصر الطلب
                foreach ($validated['cart_items'] as $item) {
                    $product = \App\Models\Product::findOrFail($item['product_id']);
                    
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'price' => $product->price,
                        'subtotal' => $product->price * $item['quantity'],
                        'created_at' => now(),
                    ]);
                }
                
                // حذف عناصر السلة
                CartItem::where('user_id', Auth::id())->delete();
                
                // إضافة سجل في تاريخ الطلب
                $order->addToHistory('pending', Auth::id(), 'order_created', 'تم إنشاء الطلب');
            }
            
            // بعد إنشاء الطلب، تعيين delivery_fee و commission percent من المدينة
            $city = City::find($order->city_id);
            if ($city) {
                $order->delivery_fee = $city->delivery_fee;
                $order->platform_commission_percent = $city->platform_commission_percent;
                $order->buyer_total = round(($order->total_price ?? 0) + ($order->delivery_fee ?? 0), 2);
                $order->save();
            }
            
            // تسجيل ID الطلب للتحقق
            \Log::info('Order created with ID: ' . $order->id);
            
            DB::commit();
            
            $order->load(['user', 'seller', 'items.product', 'city']);
            
            // تسجيل البيانات المرجعة للتحقق
            \Log::info('Returning order data: ', $order->toArray());
            
            // Create notifications for buyer and seller
            Notification::create([
                'user_id' => $order->user_id,
                'notification_type' => 'order_created',
                'message' => 'تم إنشاء طلب جديد بنجاح. رقم الطلب: ' . $order->id,
                'is_read' => false,
                'link' => '/orders/' . $order->id,
                'created_at' => now(),
            ]);
            if ($order->seller && $order->seller->user_id) {
                Notification::create([
                    'user_id' => $order->seller->user_id,
                    'notification_type' => 'order_created',
                    'message' => 'تم استلام طلب جديد من عميل. رقم الطلب: ' . $order->id,
                    'is_read' => false,
                    'link' => '/orders/' . $order->id,
                    'created_at' => now(),
                ]);
            }
            
            return new OrderResource($order);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Order creation error: ' . $e->getMessage());
            return response()->json(['message' => 'خطأ في إنشاء الطلب: ' . $e->getMessage()], 500);
        }
    }

    public function update(OrderRequest $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->update($request->validated());
        $order->load(['user', 'seller', 'items']);
        return new OrderResource($order);
    }

    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();
        return response()->json(['message' => 'تم حذف الطلب بنجاح']);
    }

    public function show($id)
    {
        \Log::info('Fetching order with ID: ' . $id . ' for user: ' . Auth::id());
        
        try {
            $order = Order::with([
                'user', 
                'seller.user', 
                'items.product.images',
                'adminApprover',
                'deliveryPerson',
                'history.actionUser',
                'city'
            ])->findOrFail($id);
            
            // التحقق من صلاحية الوصول للطلب
            $currentUser = Auth::user();
            $canAccess = false;
            
            if ($order->user_id == Auth::id()) {
                // المالك الأصلي للطلب
                $canAccess = true;
            } elseif ($currentUser && $currentUser->seller && $order->seller_id == $currentUser->seller->id) {
                // البائع المسؤول عن الطلب
                $canAccess = true;
            } elseif ($currentUser && $currentUser->role == 'admin') {
                // الأدمن
                $canAccess = true;
            } elseif ($currentUser && $order->delivery_person_id == Auth::id()) {
                // شخص التوصيل
                $canAccess = true;
            }
            
            if (!$canAccess) {
                \Log::warning('Unauthorized access attempt to order: ' . $id . ' by user: ' . Auth::id());
                return response()->json(['message' => 'غير مصرح لك بالوصول لهذا الطلب'], 403);
            }
            
            \Log::info('Order found: ', ['id' => $order->id, 'status' => $order->status, 'user_id' => $order->user_id]);
            
            $resource = new OrderResource($order);
            \Log::info('OrderResource created successfully');
            
            return $resource;
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('Order not found: ' . $id);
            return response()->json(['message' => 'الطلب غير موجود'], 404);
        } catch (\Exception $e) {
            \Log::error('Error fetching order: ' . $e->getMessage());
            return response()->json(['message' => 'خطأ في جلب تفاصيل الطلب: ' . $e->getMessage()], 500);
        }
    }
    
    // موافقة الأدمن على الطلب
    public function adminApprove(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:500'
        ]);
        
        $order = Order::findOrFail($id);
        
        try {
            $order->approveByAdmin(Auth::id(), $request->notes);
            // Notify buyer and seller
            Notification::create([
                'user_id' => $order->user_id,
                'notification_type' => 'order_status_changed',
                'message' => 'تمت موافقة الإدارة على طلبك رقم: ' . $order->id,
                'is_read' => false,
                'link' => '/orders/' . $order->id,
                'created_at' => now(),
            ]);
            if ($order->seller && $order->seller->user_id) {
                Notification::create([
                    'user_id' => $order->seller->user_id,
                    'notification_type' => 'order_status_changed',
                    'message' => 'تمت موافقة الإدارة على الطلب رقم: ' . $order->id,
                    'is_read' => false,
                    'link' => '/orders/' . $order->id,
                    'created_at' => now(),
                ]);
            }
            return response()->json([
                'message' => 'تمت الموافقة على الطلب بنجاح',
                'order' => new OrderResource($order->fresh())
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
    
    // موافقة البائع على الطلب
    public function sellerApprove(Request $request, $id)
    {
        $validator = \Validator::make($request->all(), [
            'notes' => 'nullable|string|max:500',
            'seller_address' => 'required|string|max:1000',
            'completion_deadline' => 'required|date|after:now'
        ], [
            'completion_deadline.after' => 'يجب أن يكون الموعد النهائي للإنجاز في المستقبل',
            'completion_deadline.required' => 'الموعد النهائي للإنجاز مطلوب',
            'completion_deadline.date' => 'تنسيق التاريخ غير صحيح',
            'seller_address.required' => 'عنوان البائع مطلوب',
            'seller_address.max' => 'عنوان البائع لا يمكن أن يتجاوز 1000 حرف',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $order = Order::findOrFail($id);
        
        // التحقق من أن البائع يملك هذا الطلب
        if ($order->seller->user_id !== Auth::id()) {
            return response()->json(['message' => 'غير مصرح لك بهذا الإجراء'], 403);
        }
        
        try {
            $order->approveBySeller(
                $request->notes, 
                $request->seller_address, 
                $request->completion_deadline
            );
            // Notify buyer and seller
            Notification::create([
                'user_id' => $order->user_id,
                'notification_type' => 'order_status_changed',
                'message' => 'تمت موافقة البائع على طلبك رقم: ' . $order->id,
                'is_read' => false,
                'link' => '/orders/' . $order->id,
                'created_at' => now(),
            ]);
            if ($order->seller && $order->seller->user_id) {
                Notification::create([
                    'user_id' => $order->seller->user_id,
                    'notification_type' => 'order_status_changed',
                    'message' => 'لقد وافقت على الطلب رقم: ' . $order->id,
                    'is_read' => false,
                    'link' => '/orders/' . $order->id,
                    'created_at' => now(),
                ]);
            }
            return response()->json([
                'message' => 'تمت الموافقة على الطلب بنجاح',
                'order' => new OrderResource($order->fresh())
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
    
    // موافقة البائع على السعر المقترح
    public function approveProposedPrice(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:500'
        ]);
        
        $order = Order::findOrFail($id);
        
        // التحقق من أن البائع يملك هذا الطلب
        if ($order->seller->user_id !== Auth::id()) {
            return response()->json(['message' => 'غير مصرح لك بهذا الإجراء'], 403);
        }
        
        try {
            $order->approveProposedPrice($request->notes);
            
            // إرسال إشعار للمشتري
            Notification::create([
                'user_id' => $order->user_id,
                'notification_type' => 'price_approved',
                'message' => "وافق البائع على السعر المقترح ({$order->buyer_proposed_price} ج.م) للطلب #{$order->id}. الطلب الآن قيد مراجعة الإدارة.",
                'is_read' => false,
                'link' => '/orders/' . $order->id,
                'created_at' => now(),
            ]);
            
            // إرسال إشعار للإدارة
            $admins = \App\Models\User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'notification_type' => 'order_pending_admin',
                    'message' => "طلب خدمة جديد #{$order->id} بسعر متفاوض عليه ({$order->buyer_proposed_price} ج.م) في انتظار موافقتك.",
                    'is_read' => false,
                    'link' => '/orders/' . $order->id,
                    'created_at' => now(),
                ]);
            }
            
            return response()->json([
                'message' => 'تمت الموافقة على السعر المقترح بنجاح',
                'order' => new OrderResource($order->fresh())
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
    
    // رفض البائع للسعر المقترح
    public function rejectProposedPrice(Request $request, $id)
    {
        $request->validate([
            'reason' => 'nullable|string|max:500'
        ]);
        
        $order = Order::findOrFail($id);
        
        // التحقق من أن البائع يملك هذا الطلب
        if ($order->seller->user_id !== Auth::id()) {
            return response()->json(['message' => 'غير مصرح لك بهذا الإجراء'], 403);
        }
        
        try {
            $order->rejectProposedPrice($request->reason);
            
            // إرسال إشعار للمشتري
            Notification::create([
                'user_id' => $order->user_id,
                'notification_type' => 'price_rejected',
                'message' => "رفض البائع السعر المقترح للطلب #{$order->id}. يمكنك إنشاء طلب جديد بسعر آخر." . ($request->reason ? " السبب: {$request->reason}" : ""),
                'is_read' => false,
                'link' => '/orders/' . $order->id,
                'created_at' => now(),
            ]);
            
            return response()->json([
                'message' => 'تم رفض السعر المقترح وإلغاء الطلب',
                'order' => new OrderResource($order->fresh())
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
    
    // بدء العمل على الطلب
    public function startWork($id)
    {
        $order = Order::findOrFail($id);
        
        // التحقق من أن البائع يملك هذا الطلب
        if ($order->seller->user_id !== Auth::id()) {
            return response()->json(['message' => 'غير مصرح لك بهذا الإجراء'], 403);
        }
        
        try {
            $order->startWork();
            // Notify buyer and seller
            Notification::create([
                'user_id' => $order->user_id,
                'notification_type' => 'order_status_changed',
                'message' => 'بدأ البائع العمل على طلبك رقم: ' . $order->id,
                'is_read' => false,
                'link' => '/orders/' . $order->id,
                'created_at' => now(),
            ]);
            if ($order->seller && $order->seller->user_id) {
                Notification::create([
                    'user_id' => $order->seller->user_id,
                    'notification_type' => 'order_status_changed',
                    'message' => 'لقد بدأت العمل على الطلب رقم: ' . $order->id,
                    'is_read' => false,
                    'link' => '/orders/' . $order->id,
                    'created_at' => now(),
                ]);
            }
            return response()->json([
                'message' => 'تم بدء العمل على الطلب بنجاح',
                'order' => new OrderResource($order->fresh())
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
    
    // إكمال العمل على الطلب
    public function completeWork(Request $request, $id)
    {
        $request->validate([
            'delivery_scheduled_at' => 'nullable|date|after:now'
        ]);
        
        $order = Order::findOrFail($id);
        
        // التحقق من أن البائع يملك هذا الطلب
        if ($order->seller->user_id !== Auth::id()) {
            return response()->json(['message' => 'غير مصرح لك بهذا الإجراء'], 403);
        }
        
        try {
            $deliveryTime = $request->delivery_scheduled_at ? 
                \Carbon\Carbon::parse($request->delivery_scheduled_at) : 
                now()->addDays(1); // افتراضي: يوم واحد
                
            $order->completeWork($deliveryTime);
            // Notify buyer and seller
            Notification::create([
                'user_id' => $order->user_id,
                'notification_type' => 'order_status_changed',
                'message' => 'تم إكمال العمل على طلبك رقم: ' . $order->id . ' وجاري جدولة التوصيل.',
                'is_read' => false,
                'link' => '/orders/' . $order->id,
                'created_at' => now(),
            ]);
            if ($order->seller && $order->seller->user_id) {
                Notification::create([
                    'user_id' => $order->seller->user_id,
                    'notification_type' => 'order_status_changed',
                    'message' => 'تم إكمال العمل على الطلب رقم: ' . $order->id . ' وجاري جدولة التوصيل.',
                    'is_read' => false,
                    'link' => '/orders/' . $order->id,
                    'created_at' => now(),
                ]);
            }
            return response()->json([
                'message' => 'تم إكمال العمل وجدولة التوصيل بنجاح',
                'order' => new OrderResource($order->fresh())
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
    
    // استلام الطلب من قبل الدليفري
    public function pickupByDelivery(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:500'
        ]);
        
        $order = Order::findOrFail($id);
        
        try {
            $order->pickUpByDelivery(Auth::id(), $request->notes);
            return response()->json([
                'message' => 'تم استلام الطلب للتوصيل بنجاح',
                'order' => new OrderResource($order->fresh())
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
    
    // تسليم الطلب
    public function markAsDelivered(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:500'
        ]);
        
        $order = Order::findOrFail($id);
        
        // التحقق من أن المستخدم هو الدليفري المسؤول عن هذا الطلب
        if ($order->delivery_person_id !== Auth::id()) {
            return response()->json(['message' => 'غير مصرح لك بهذا الإجراء'], 403);
        }
        
        try {
            $order->markAsDelivered($request->notes);
            return response()->json([
                'message' => 'تم تسليم الطلب بنجاح',
                'order' => new OrderResource($order->fresh())
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
    
    // إكمال الطلب من قبل العميل
    public function completeOrder($id)
    {
        $order = Order::findOrFail($id);
        
        // التحقق من أن المستخدم هو صاحب الطلب
        if ($order->user_id !== Auth::id()) {
            return response()->json(['message' => 'غير مصرح لك بهذا الإجراء'], 403);
        }
        
        try {
            $order->markAsCompleted();
            return response()->json([
                'message' => 'تم إكمال الطلب بنجاح',
                'order' => new OrderResource($order->fresh())
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
    
    // إلغاء الطلب
    public function cancelOrder(Request $request, $id)
    {
        $request->validate([
            'reason' => 'nullable|string|max:500'
        ]);
        
        $order = Order::findOrFail($id);
        
        // التحقق من الصلاحيات (صاحب الطلب، البائع، أو الأدمن)
        $user = Auth::user();
        
        // منطق الإلغاء الجديد
        // The new cancellation logic
        if ($order->user_id === $user->id) {
            // المشتري: يمكنه الإلغاء فقط إذا لم يصل الطلب إلى مرحلة "جاهز للتوصيل"
            // Buyer: can only cancel if the order has not reached "ready_for_delivery"
            if (!$order->canBeCancelledByUser()) {
                return response()->json(['message' => 'لا يمكن إلغاء الطلب في هذه المرحلة'], 403);
            }
        } elseif ($order->seller->user_id !== $user->id && $user->role !== 'admin') {
            // إذا لم يكن المشتري أو البائع أو الأدمن، لا يمكنه الإلغاء
            // If not the buyer, seller, or admin, they cannot cancel
            return response()->json(['message' => 'غير مصرح لك بهذا الإجراء'], 403);
        }
        // البائع والأدمن يمكنهما الإلغاء في أي وقت (حسب المنطق الحالي)
        // Seller and Admin can cancel anytime (based on current logic)

        try {
            // إرجاع العربون للطلبات التي تتطلب عربون
            if ($order->requires_deposit && $order->hasDepositPaid()) {
                $wasAdminApproved = !is_null($order->admin_approved_at) || in_array($order->status, [
                    'admin_approved', 'seller_approved', 'in_progress', 'ready_for_delivery', 'out_for_delivery', 'delivered'
                ]);
                if($wasAdminApproved) {
                    $order->user->addToBuyerWallet($order->deposit_amount);
                    $order->addToHistory('refunded', Auth::id(), 'deposit_refunded', 'تم رد العربون إلى محفظة المشتري بسبب الإلغاء');
                    $order->update(['deposit_status' => 'refunded']);
                }
            }
            
            // إرجاع المبلغ الكامل للطلبات العادية (غير الخدمات) التي دفع فيها المشتري والإدارة وافقت
            if (!$order->is_service_order && 
                $order->payment_method !== 'cash_on_delivery' && 
                !is_null($order->admin_approved_at)) {
                
                // إرجاع فقط تمن المنتج بدون مصاريف التوصيل
                $refundAmount = $order->total_price;
                $order->user->addToBuyerWallet($refundAmount);
                $order->addToHistory('refunded', Auth::id(), 'order_refunded', "تم رد المبلغ ({$refundAmount} جنيه) إلى محفظة المشتري بسبب الإلغاء (بدون مصاريف التوصيل)");
            }
            
            $order->cancel(Auth::id(), $request->input('reason'));
            // Notify buyer and seller
            Notification::create([
                'user_id' => $order->user_id,
                'notification_type' => 'order_status_changed',
                'message' => 'تم إلغاء طلبك رقم: ' . $order->id,
                'is_read' => false,
                'link' => '/orders/' . $order->id,
                'created_at' => now(),
            ]);
            if ($order->seller && $order->seller->user_id) {
                Notification::create([
                    'user_id' => $order->seller->user_id,
                    'notification_type' => 'order_status_changed',
                    'message' => 'تم إلغاء الطلب رقم: ' . $order->id,
                    'is_read' => false,
                    'link' => '/orders/' . $order->id,
                    'created_at' => now(),
                ]);
            }
            return response()->json(['message' => 'تم إلغاء الطلب بنجاح' , 'order' => new OrderResource($order->fresh())]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
    
    // رفع إثبات الدفع
    public function uploadPaymentProof(Request $request, $id)
    {
        $request->validate([
            'payment_proof' => 'required|image|max:2048',
            'payment_type' => 'nullable|in:regular,remaining' // نوع الدفع: عادي أو باقي المبلغ
        ]);
        
        $order = Order::findOrFail($id);
        
        // التحقق من أن المستخدم هو صاحب الطلب
        if ($order->user_id !== Auth::id()) {
            return response()->json(['message' => 'غير مصرح لك بهذا الإجراء'], 403);
        }
        
        $paymentType = $request->input('payment_type', 'regular');
        
        try {
            if ($paymentType === 'remaining') {
                // رفع صورة إثبات دفع باقي المبلغ
                
                // التحقق من أن الطلب يتطلب عربون وتم دفع العربون
                if (!$order->requires_deposit || !$order->hasDepositPaid()) {
                    return response()->json(['message' => 'هذا الطلب لا يتطلب دفع باقي المبلغ'], 400);
                }
                
                // التحقق من أن رفع صورة باقي المبلغ مسموح في الحالة الحالية
                if (!$order->canUploadRemainingPayment()) {
                    return response()->json(['message' => 'لا يمكن رفع صورة باقي المبلغ في الحالة الحالية للطلب'], 400);
                }
                
                // التحقق من أنه لم يرفع صورة باقي المبلغ من قبل
                if ($order->remaining_payment_proof) {
                    return response()->json(['message' => 'تم رفع صورة إثبات باقي المبلغ مسبقاً'], 400);
                }
                
                // حذف الصورة القديمة إذا وجدت
                if ($order->remaining_payment_proof) {
                    Storage::disk('public')->delete($order->remaining_payment_proof);
                }
                
                // رفع الصورة الجديدة
                $paymentProofPath = $request->file('payment_proof')->store('remaining_payment_proofs', 'public');
                
                // حفظ الحالة الحالية قبل تغييرها
                $currentStatus = $order->status;
                
                $order->update([
                    'remaining_payment_proof' => $paymentProofPath,
                    'previous_status' => $currentStatus, // حفظ الحالة السابقة
                    'status' => 'pending', // إرجاع الطلب لحالة بانتظار موافقة الإدارة
                    'payment_status' => 'pending' // تغيير حالة الدفع لبانتظار الموافقة
                ]);
                
                return response()->json([
                    'message' => 'تم رفع إثبات دفع باقي المبلغ بنجاح وسيتم مراجعته من قبل الإدارة',
                    'remaining_payment_proof_url' => asset('storage/' . $paymentProofPath)
                ]);
                
            } else {
                // رفع صورة إثبات الدفع العادي
                
                // حذف إثبات الدفع القديم إذا وجد
                if ($order->payment_proof) {
                    Storage::disk('public')->delete($order->payment_proof);
                }
                
                // رفع إثبات الدفع الجديد
                $paymentProofPath = $request->file('payment_proof')->store('payment_proofs', 'public');
                
                $order->update([
                    'payment_proof' => $paymentProofPath
                ]);
                
                return response()->json([
                    'message' => 'تم رفع إثبات الدفع بنجاح',
                    'payment_proof_url' => asset('storage/' . $paymentProofPath)
                ]);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'خطأ في رفع إثبات الدفع'], 500);
        }
    }
    
    // الحصول على طلبات تحتاج موافقة الأدمن
    public function getPendingApproval()
    {
        $orders = Order::with(['user', 'seller.user', 'items.product'])
            ->where('status', 'pending')
            ->whereNotNull('payment_proof')
            ->orderBy('created_at', 'asc')
            ->paginate(10);
            
        return OrderResource::collection($orders);
    }
    
    // الحصول على طلبات جاهزة للتوصيل
    public function getReadyForDelivery()
    {
        $orders = Order::with(['user', 'seller.user', 'items.product'])
            ->where('status', 'ready_for_delivery')
            ->orderBy('delivery_scheduled_at', 'asc')
            ->paginate(10);
            
        return OrderResource::collection($orders);
    }
    
    // فحص الطلبات المتأخرة
    public function checkLateOrders()
    {
        $orders = Order::whereNotNull('completion_deadline')
                      ->whereNotIn('status', ['completed', 'cancelled', 'delivered'])
                      ->where('completion_deadline', '<', now())
                      ->where('is_late', false)
                      ->get();

        $updatedCount = 0;

        foreach ($orders as $order) {
            if ($order->checkIfLate()) {
                $updatedCount++;
            }
        }

        return response()->json([
            'message' => "Updated {$updatedCount} orders as late",
            'updated_count' => $updatedCount
        ]);
    }
    
    // Check late status for individual order
    public function checkLateStatus($id)
    {
        $order = Order::findOrFail($id);
        
        // Check if order is late and update if needed
        $wasLate = $order->is_late;
        $isLate = $order->checkIfLate();
        
        if ($isLate && !$wasLate) {
            // Order just became late
            // You can add notifications here if needed
            \Log::info("Order #{$order->id} marked as late");
        }
        
        return response()->json([
            'message' => $isLate ? 'Order is late' : 'Order is not late',
            'is_late' => $isLate,
            'was_updated' => $isLate && !$wasLate,
            'order' => new OrderResource($order->fresh())
        ]);
    }

    // تحديث حالة الطلب يدوياً من قبل الأدمن
    public function adminUpdateStatus(Request $request, $id)
    {
        // التحقق من أن المستخدم أدمن
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'message' => 'غير مصرح لك بهذا الإجراء. الصلاحية مطلوبة: مدير'
            ], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,admin_approved,seller_approved,in_progress,ready_for_delivery,out_for_delivery,delivered,completed,cancelled,suspended',
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            $order = Order::findOrFail($id);
            $oldStatus = $order->status;
            $newStatus = $request->status;
            $notes = $request->notes;
            $adminId = Auth::id();

            // Update order status (and refund deposit if cancelling)
            $order->update([
                'status' => $newStatus,
                'updated_at' => now()
            ]);

            // معالجة الإرجاع عند الإلغاء
            if ($newStatus === 'cancelled') {
                // إرجاع العربون للطلبات التي تتطلب عربون
                if ($order->requires_deposit && $order->hasDepositPaid() && $order->deposit_amount > 0) {
                    $order->user->addToBuyerWallet($order->deposit_amount);
                    $order->update(['deposit_status' => 'refunded']);
                    $order->addToHistory('refunded', $adminId, 'deposit_refunded', 'تم رد العربون إلى محفظة المشتري بعد إلغاء الطلب بواسطة الأدمن');
                }
                
                // إرجاع المبلغ الكامل للطلبات العادية (غير الخدمات) التي دفع فيها المشتري والإدارة وافقت
                if (!$order->is_service_order && 
                    $order->payment_method !== 'cash_on_delivery' && 
                    !is_null($order->admin_approved_at)) {
                    
                    // إرجاع فقط تمن المنتج بدون مصاريف التوصيل
                    $refundAmount = $order->total_price;
                    $order->user->addToBuyerWallet($refundAmount);
                    $order->addToHistory('refunded', $adminId, 'order_refunded', "تم رد المبلغ ({$refundAmount} جنيه) إلى محفظة المشتري بعد إلغاء الطلب بواسطة الأدمن (بدون مصاريف التوصيل)");
                }
            }

            // Record in order history
            $noteText = $notes ? "تم تغيير الحالة من '{$this->getStatusInArabic($oldStatus)}' إلى '{$this->getStatusInArabic($newStatus)}'. ملاحظات: {$notes}" : "تم تغيير الحالة من '{$this->getStatusInArabic($oldStatus)}' إلى '{$this->getStatusInArabic($newStatus)}'.";
            
            $order->history()->create([
                'status' => $newStatus,
                'action_by' => $adminId,
                'action_type' => 'status_changed_by_admin',
                'note' => $noteText,
                'created_at' => now()
            ]);

            // Send notifications to buyer and seller
            $buyerMessage = "تم تحديث حالة طلبك رقم {$order->id} إلى: " . $this->getStatusInArabic($newStatus);
            if ($notes) {
                $buyerMessage .= "\nملاحظات: " . $notes;
            }

            Notification::create([
                'user_id' => $order->user_id,
                'notification_type' => 'order_status_changed',
                'message' => $buyerMessage,
                'is_read' => false,
                'link' => '/orders/' . $order->id,
                'created_at' => now(),
            ]);

            if ($order->seller && $order->seller->user_id) {
                $sellerMessage = "تم تحديث حالة الطلب رقم {$order->id} إلى: " . $this->getStatusInArabic($newStatus);
                if ($notes) {
                    $sellerMessage .= "\nملاحظات: " . $notes;
                }

                Notification::create([
                    'user_id' => $order->seller->user_id,
                    'notification_type' => 'order_status_changed',
                    'message' => $sellerMessage,
                    'is_read' => false,
                    'link' => '/orders/' . $order->id,
                    'created_at' => now(),
                ]);
            }

            return response()->json([
                'message' => 'تم تحديث حالة الطلب بنجاح',
                'order' => new OrderResource($order->fresh())
            ]);

        } catch (\Exception $e) {
            \Log::error('Error updating order status by admin: ' . $e->getMessage());
            return response()->json([
                'message' => 'حدث خطأ أثناء تحديث حالة الطلب: ' . $e->getMessage()
            ], 500);
        }
    }

    // Helper method to get status in Arabic
    private function getStatusInArabic($status)
    {
        $statusMap = [
            'pending' => 'بانتظار المراجعة',
            'admin_approved' => 'معتمد من الإدارة',
            'seller_approved' => 'مقبول من البائع',
            'in_progress' => 'جاري العمل',
            'ready_for_delivery' => 'جاهز للتوصيل',
            'out_for_delivery' => 'في الطريق',
            'delivered' => 'تم التوصيل',
            'completed' => 'مكتمل',
            'cancelled' => 'ملغى',
            'suspended' => 'معلق'
        ];

        return $statusMap[$status] ?? $status;
    }
}
