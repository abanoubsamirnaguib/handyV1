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
use App\Models\Notification;

class OrderCrudController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['user', 'seller', 'items.product', 'adminApprover', 'deliveryPerson']);
        
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
                'seller_id' => 'required|exists:sellers,id',
                'customer_name' => 'required|string|max:100',
                'customer_phone' => 'required|string|max:20',
                'delivery_address' => 'required|string',
                'service_requirements' => 'nullable|string',
                'deposit_amount' => 'required|numeric|min:1',
                'payment_method' => 'required|in:cash_on_delivery,bank_transfer,credit_card,vodafone_cash,instapay',
                'deposit_image' => 'required|image|max:2048',
                'total_price' => 'required|numeric|min:1',
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
                
                // Verify service belongs to seller
                if ($service->seller_id != $validated['seller_id']) {
                    throw new \Exception('الخدمة لا تنتمي لهذا البائع');
                }
                
                // Upload deposit image
                $depositImagePath = null;
                if ($request->hasFile('deposit_image')) {
                    $depositImagePath = $request->file('deposit_image')->store('deposit_images', 'public');
                }
                
                // Create service order
                $order = Order::create([
                    'user_id' => Auth::id(),
                    'seller_id' => $validated['seller_id'],
                    'status' => 'pending',
                    'total_price' => $validated['total_price'],
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
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
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
                $order->addToHistory('pending', Auth::id(), 'service_order_created', 'تم إنشاء طلب خدمة مع دفع العربون');
                
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
            
            // تسجيل ID الطلب للتحقق
            \Log::info('Order created with ID: ' . $order->id);
            
            DB::commit();
            
            $order->load(['user', 'seller', 'items.product']);
            
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
                'history.actionUser'
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
        $request->validate([
            'notes' => 'nullable|string|max:500'
        ]);
        
        $order = Order::findOrFail($id);
        
        // التحقق من أن البائع يملك هذا الطلب
        if ($order->seller->user_id !== Auth::id()) {
            return response()->json(['message' => 'غير مصرح لك بهذا الإجراء'], 403);
        }
        
        try {
            $order->approveBySeller($request->notes);
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
            'payment_proof' => 'required|image|max:2048'
        ]);
        
        $order = Order::findOrFail($id);
        
        // التحقق من أن المستخدم هو صاحب الطلب
        if ($order->user_id !== Auth::id()) {
            return response()->json(['message' => 'غير مصرح لك بهذا الإجراء'], 403);
        }
        
        try {
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
                'payment_proof_url' => Storage::disk('public')->url($paymentProofPath)
            ]);
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
}
