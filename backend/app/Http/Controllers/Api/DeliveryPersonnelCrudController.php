<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryPersonnel;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Traits\EmailTrait;
class DeliveryPersonnelCrudController extends Controller
{
    use EmailTrait;
    // الحصول على جميع الدليفري
    public function index(Request $request)
    {
        $query = DeliveryPersonnel::with(['createdBy']);
        
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('is_available')) {
            $query->where('is_available', $request->boolean('is_available'));
        }
        
        $deliveryPersonnel = $query->orderBy('created_at', 'desc')->paginate(15);
        
        return response()->json([
            'success' => true,
            'data' => $deliveryPersonnel
        ]);
    }

    // إنشاء حساب دليفري جديد
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:delivery_personnel,email',
            'phone' => 'required|string|max:20',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        // إنشاء كلمة مرور عشوائية
        $password = Str::random(8);
        
        $deliveryPerson = DeliveryPersonnel::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($password),
            'notes' => $request->notes,
            'created_by' => Auth::id(),
            'status' => 'active'
        ]);

        // إرسال بيانات الحساب عبر البريد الإلكتروني
        try {
            $this->sendMail(
                'تم إنشاء حساب الدليفري - منصة بازار',
                $deliveryPerson->email,
                [
                    'name' => $deliveryPerson->name,
                    'email' => $deliveryPerson->email,
                    'password' => $password,
                    'login_url' => env('FRONT_URL', url('/')) . '/delivery'
                ],
                'emails.delivery-account-created'
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send delivery account email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء حساب الدليفري بنجاح وإرسال البيانات عبر البريد الإلكتروني',
            'data' => $deliveryPerson
        ]);
    }

    // عرض تفاصيل الدليفري
    public function show($id)
    {
        $deliveryPerson = DeliveryPersonnel::with(['createdBy'])->findOrFail($id);
        
        $stats = [
            'total_orders' => $deliveryPerson->orders()->count(),
            'total_pickups' => $deliveryPerson->getPickupCount(),
            'total_deliveries' => $deliveryPerson->getDeliveryCount(),
            'today_pickups' => $deliveryPerson->getTodayPickupCount(),
            'today_deliveries' => $deliveryPerson->getTodayDeliveryCount(),
            'pending_pickups' => $deliveryPerson->ordersToPickup()->count(),
            'pending_deliveries' => $deliveryPerson->ordersToDeliver()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'delivery_person' => $deliveryPerson,
                'stats' => $stats
            ]
        ]);
    }

    // تحديث معلومات الدليفري
    public function update(Request $request, $id)
    {
        $deliveryPerson = DeliveryPersonnel::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:delivery_personnel,email,' . $id,
            'phone' => 'sometimes|required|string|max:20',
            'status' => 'sometimes|required|in:active,inactive,suspended',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        $deliveryPerson->update($request->only([
            'name', 'email', 'phone', 'status', 'notes'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث معلومات الدليفري بنجاح',
            'data' => $deliveryPerson
        ]);
    }

    // إعادة تعيين كلمة المرور
    public function resetPassword(Request $request, $id)
    {
        $deliveryPerson = DeliveryPersonnel::findOrFail($id);
        info('Resetting password for delivery person: ' . $deliveryPerson->email);
        info('Resetting password for delivery person name: ' . $deliveryPerson->name);
        $newPassword = Str::random(8);
        info('new password ' . $newPassword);
        $deliveryPerson->update([
            'password' => Hash::make($newPassword)
        ]);

        // إرسال كلمة المرور الجديدة عبر البريد الإلكتروني
        try {
            $this->sendMail(
                'إعادة تعيين كلمة المرور - منصة بازار',
                $deliveryPerson->email,
                [
                    'name' => $deliveryPerson->name,
                    'password' => $newPassword,
                    'login_url' => url('/delivery')
                ],
                'emails.delivery-password-reset'
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send password reset email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'تم إعادة تعيين كلمة المرور وإرسالها عبر البريد الإلكتروني'
        ]);
    }

    // حذف الدليفري
    public function destroy($id)
    {
        $deliveryPerson = DeliveryPersonnel::findOrFail($id);
        
        // التحقق من وجود طلبات نشطة
        $activeOrders = $deliveryPerson->orders()
            ->whereIn('status', ['ready_for_delivery', 'out_for_delivery'])
            ->count();

        if ($activeOrders > 0) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن حذف الدليفري لوجود طلبات نشطة'
            ], 400);
        }

        $deliveryPerson->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الدليفري بنجاح'
        ]);
    }

    // الحصول على الطلبات المتاحة للتوصيل
    public function availableOrders(Request $request)
    {
        $orders = Order::with(['user', 'seller', 'items.product'])
            ->where('status', 'ready_for_delivery')
            ->whereNull('delivery_person_id')
            ->orderBy('delivery_scheduled_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    // تعيين طلب لدليفري
    public function assignOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'delivery_person_id' => 'required|exists:delivery_personnel,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        $order = Order::findOrFail($request->order_id);
        $deliveryPerson = DeliveryPersonnel::findOrFail($request->delivery_person_id);

        if (!$deliveryPerson->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'الدليفري غير نشط'
            ], 400);
        }

        if (!$order->isReadyForDelivery()) {
            return response()->json([
                'success' => false,
                'message' => 'الطلب غير جاهز للتوصيل'
            ], 400);
        }

        try {
            $order->assignToDelivery($deliveryPerson->id);

            return response()->json([
                'success' => true,
                'message' => 'تم تعيين الطلب للدليفري بنجاح',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    // الحصول على الدليفري المتاحين
    public function availableDeliveryPersonnel(Request $request)
    {
        $deliveryPersonnel = DeliveryPersonnel::where('status', 'active')
            ->where('is_available', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $deliveryPersonnel
        ]);
    }

    // تعيين موظف الاستلام للطلب
    public function assignPickupPerson(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'pickup_person_id' => 'required|exists:delivery_personnel,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        $order = Order::findOrFail($request->order_id);
        $pickupPerson = DeliveryPersonnel::findOrFail($request->pickup_person_id);

        if (!$pickupPerson->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'موظف الاستلام غير نشط'
            ], 400);
        }

        if ($order->status !== 'ready_for_delivery') {
            return response()->json([
                'success' => false,
                'message' => 'الطلب غير جاهز للاستلام'
            ], 400);
        }

        try {
            $order->update([
                'pickup_person_id' => $pickupPerson->id,
                'delivery_scheduled_at' => now()
            ]);

            $order->addToHistory(
                'assigned_to_pickup', 
                Auth::id(), 
                'assigned_to_pickup', 
                'تم تعيين موظف الاستلام من قبل الأدمن'
            );

            return response()->json([
                'success' => true,
                'message' => 'تم تعيين موظف الاستلام بنجاح',
                'data' => $order->load(['pickupPerson', 'deliveryPerson'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء التعيين: ' . $e->getMessage()
            ], 500);
        }
    }

    // تعيين موظف التسليم للطلب
    public function assignDeliveryPerson(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'delivery_person_id' => 'required|exists:delivery_personnel,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        $order = Order::findOrFail($request->order_id);
        $deliveryPerson = DeliveryPersonnel::findOrFail($request->delivery_person_id);

        if (!$deliveryPerson->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'موظف التسليم غير نشط'
            ], 400);
        }

        if ($order->status !== 'ready_for_delivery') {
            return response()->json([
                'success' => false,
                'message' => 'الطلب غير جاهز للتسليم'
            ], 400);
        }

        try {
            $order->update([
                'delivery_person_id' => $deliveryPerson->id
            ]);

            $order->addToHistory(
                'assigned_to_delivery', 
                Auth::id(), 
                'assigned_to_delivery', 
                'تم تعيين موظف التسليم من قبل الأدمن'
            );

            return response()->json([
                'success' => true,
                'message' => 'تم تعيين موظف التسليم بنجاح',
                'data' => $order->load(['pickupPerson', 'deliveryPerson'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء التعيين: ' . $e->getMessage()
            ], 500);
        }
    }

    // تعيين طلبات متعددة لدليفري واحد
    public function bulkAssignOrders(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'required|exists:orders,id',
            'delivery_person_id' => 'required|exists:delivery_personnel,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        $deliveryPerson = DeliveryPersonnel::findOrFail($request->delivery_person_id);

        if (!$deliveryPerson->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'الدليفري غير نشط'
            ], 400);
        }

        $orders = Order::whereIn('id', $request->order_ids)
            ->where('status', 'ready_for_delivery')
            ->whereNull('delivery_person_id')
            ->get();

        // if ($orders->count() !== count($request->order_ids)) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'بعض الطلبات غير متاحة للتعيين'
        //     ], 400);
        // }

        try {
            $assignedCount = 0;
            
            foreach ($orders as $order) {
                $order->update([
                    'delivery_person_id' => $deliveryPerson->id,
                    'delivery_scheduled_at' => now()
                ]);

                $order->addToHistory(
                    'assigned_to_delivery', 
                    Auth::id(), 
                    'assigned_to_delivery', 
                    'تم تعيين الطلب للدليفري من قبل الأدمن'
                );

                $assignedCount++;
            }

            return response()->json([
                'success' => true,
                'message' => "تم تعيين {$assignedCount} طلب للدليفري {$deliveryPerson->name} بنجاح",
                'data' => [
                    'assigned_count' => $assignedCount,
                    'delivery_person' => $deliveryPerson,
                    'orders' => $orders
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تعيين الطلبات: ' . $e->getMessage()
            ], 500);
        }
    }

    // الحصول على الطلبات الجاهزة للتوصيل (للأدمن)
    public function getOrdersReadyForDelivery(Request $request)
    {
        $query = Order::with(['user', 'seller.user', 'items.product', 'pickupPerson', 'deliveryPerson'])
            ->where('status', 'ready_for_delivery')
            ->where(function($q) {
                // إظهار الطلبات التي تحتاج تعيين موظف استلام أو تسليم
                $q->whereNull('pickup_person_id')
                  ->orWhereNull('delivery_person_id')
                  // أو الطلبات التي تم استلامها ولكن لم يتم تعيين موظف التسليم
                  ->orWhere(function($subQuery) {
                      $subQuery->whereNotNull('delivery_picked_up_at')
                               ->whereNull('delivery_person_id');
                  });
            });

        // فلترة حسب التاريخ
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('work_completed_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('work_completed_at', '<=', $request->date_to);
        }

        // فلترة حسب البحث
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('phone', 'like', "%{$search}%");
                  })
                  ->orWhereHas('seller.user', function($sellerQuery) use ($search) {
                      $sellerQuery->where('name', 'like', "%{$search}%")
                                 ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $query->orderBy('work_completed_at', 'asc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    // الحصول على الطلبات التي تم استلامها وتحتاج تعيين موظف تسليم
    public function getPickedUpOrdersAwaitingDeliveryAssignment(Request $request)
    {
        $query = Order::with(['user', 'seller.user', 'items.product', 'pickupPerson'])
            ->where('status', 'ready_for_delivery')
            ->whereNotNull('delivery_picked_up_at')
            ->whereNull('delivery_person_id');

        // فلترة حسب التاريخ
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('delivery_picked_up_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('delivery_picked_up_at', '<=', $request->date_to);
        }

        $orders = $query->orderBy('delivery_picked_up_at', 'asc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }
} 