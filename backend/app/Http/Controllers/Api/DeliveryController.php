<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryPersonnel;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class DeliveryController extends Controller
{
    // تسجيل الدخول
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        $deliveryPerson = DeliveryPersonnel::where('email', $request->email)->first();

        if (!$deliveryPerson || !$deliveryPerson->password || !Hash::check($request->password, $deliveryPerson->password)) {
            return response()->json([
                'success' => false,
                'message' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            ], 401);
        }

        if (!$deliveryPerson->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'حسابك غير نشط، يرجى التواصل مع الإدارة'
            ], 403);
        }

        // Use delivery guard for token creation
        $token = $deliveryPerson->createToken('delivery-token')->plainTextToken;
        $deliveryPerson->updateLastLogin();
        $deliveryPerson->updateLastSeen();

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الدخول بنجاح',
            'data' => [
                'delivery_person' => $deliveryPerson,
                'token' => $token
            ]
        ]);
    }

    // تسجيل الخروج
    public function logout(Request $request)
    {
        // Get the current delivery person using the delivery guard
        $deliveryPerson = Auth::guard('delivery')->user();
        
        if ($deliveryPerson) {
            // Revoke the current access token
            $deliveryPerson->currentAccessToken()->delete();
        }
        
        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الخروج بنجاح'
        ]);
    }

    // الحصول على معلومات الدليفري
    public function profile(Request $request)
    {
        $deliveryPerson = Auth::guard('delivery')->user();
        $deliveryPerson->updateLastSeen();

        return response()->json([
            'success' => true,
            'data' => [
                'delivery_person' => $deliveryPerson,
                'stats' => [
                    'trips_count' => $deliveryPerson->trips_count,
                    'is_available' => $deliveryPerson->isAvailable()
                ]
            ]
        ]);
    }

    // الحصول على الإحصائيات
    public function stats(Request $request)
    {
        $deliveryPerson = Auth::guard('delivery')->user();
        $deliveryPerson->updateLastSeen();

        return response()->json([
            'success' => true,
            'data' => [
                'trips_count' => $deliveryPerson->trips_count,
                'pending_pickups' => $deliveryPerson->ordersToPickup()->count(),
                'pending_deliveries' => $deliveryPerson->ordersToDeliver()->count(),
                'is_available' => $deliveryPerson->isAvailable(),
            ]
        ]);
    }

    // تغيير حالة التوفر
    public function toggleAvailability(Request $request)
    {
        $deliveryPerson = Auth::guard('delivery')->user();
        $deliveryPerson->updateLastSeen();

        if ($deliveryPerson->isAvailable()) {
            $deliveryPerson->markAsUnavailable();
            $message = 'تم تعيين حالتك إلى غير متاح';
        } else {
            $deliveryPerson->markAsAvailable();
            $message = 'تم تعيين حالتك إلى متاح';
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'is_available' => $deliveryPerson->isAvailable()
            ]
        ]);
    }



    // الحصول على الطلبات المطلوب استلامها (المخصصة للدليفري الحالي)
    public function ordersToPickup(Request $request)
    {
        $deliveryPerson = Auth::guard('delivery')->user();
        $deliveryPerson->updateLastSeen();

        $query = Order::with(['user', 'seller.user', 'items.product'])
            ->where('pickup_person_id', $deliveryPerson->id)
            ->where('status', 'ready_for_delivery')
            ->whereNull('delivery_picked_up_at'); // لم يتم الاستلام بعد

        // فلترة حسب تاريخ التسليم المجدول (الطلبات تظهر في الأيام المكتوبة في التسليم)
        if ($request->has('date')) {
            $query->whereDate('delivery_scheduled_at', $request->date);
        } else {
            // عرض طلبات اليوم والأيام القادمة فقط
            $query->where('delivery_scheduled_at', '>=', now()->startOfDay());
        }

        $orders = $query->orderBy('delivery_scheduled_at', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    // الحصول على الطلبات المطلوب تسليمها
    public function ordersToDeliver(Request $request)
    {
        $deliveryPerson = Auth::guard('delivery')->user();
        $deliveryPerson->updateLastSeen();

        $query = Order::with(['user', 'seller.user', 'items.product'])
            ->where('delivery_person_id', $deliveryPerson->id)
            ->where('status', 'out_for_delivery')
            ->whereNotNull('delivery_picked_up_at'); // تم الاستلام من البائع

        // فلترة حسب تاريخ الاستلام أو التسليم المطلوب
        if ($request->has('date')) {
            $query->where(function($q) use ($request) {
                $q->whereDate('delivery_picked_up_at', $request->date)
                  ->orWhereDate('work_completed_at', $request->date);
            });
        }

        $orders = $query->orderBy('work_completed_at', 'asc')
                       ->orderBy('delivery_picked_up_at', 'asc')
                       ->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }
    // استلام الطلب من البائع (بدون كود)
    public function pickupOrder(Request $request, $orderId)
    {
        $deliveryPerson = Auth::guard('delivery')->user();
        $deliveryPerson->updateLastSeen();

        $order = Order::findOrFail($orderId);

        // التحقق من أن الدليفري معين للاستلام
        if ($order->pickup_person_id !== $deliveryPerson->id) {
            return response()->json([
                'success' => false,
                'message' => 'هذا الطلب غير مخصص لك للاستلام'
            ], 403);
        }

        // التحقق من أنه لم يتم الاستلام مسبقاً
        if ($order->delivery_picked_up_at) {
            return response()->json([
                'success' => false,
                'message' => 'تم استلام هذا الطلب مسبقاً'
            ], 400);
        }

        if ($order->status !== 'ready_for_delivery') {
            return response()->json([
                'success' => false,
                'message' => 'هذا الطلب غير جاهز للاستلام'
            ], 400);
        }

        try {
            // استخدام الدالة الجديدة التي تتعامل مع النظام المحدث
            $order->pickUpByDelivery($deliveryPerson->id, 'تم استلام الطلب من البائع');

            // زيادة عدد المشاوير
            $deliveryPerson->increment('trips_count');

            $message = 'تم استلام الطلب بنجاح';
            
            // إذا لم يتم تعيين موظف التسليم، أضف تنبيه
            if (!$order->delivery_person_id || $order->delivery_person_id != $deliveryPerson->id) {
                $message .= '. الطلب بانتظار تعيين موظف التسليم من الأدمن.';
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $order->fresh() // تحديث البيانات
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء استلام الطلب'
            ], 500);
        }
    }

    // تسليم الطلب للعميل (بدون كود)
    public function deliverOrder(Request $request, $orderId)
    {
        $deliveryPerson = Auth::guard('delivery')->user();
        $deliveryPerson->updateLastSeen();

        $order = Order::findOrFail($orderId);

        if ($order->delivery_person_id !== $deliveryPerson->id) {
            return response()->json([
                'success' => false,
                'message' => 'هذا الطلب غير مخصص لك'
            ], 403);
        }

        if ($order->status !== 'out_for_delivery') {
            return response()->json([
                'success' => false,
                'message' => 'هذا الطلب غير جاهز للتسليم'
            ], 400);
        }

        try {
            $order->update([
                'status' => 'delivered',
                'delivered_at' => now(),
            ]);

            $order->addToHistory('delivered', null, 'delivery', 'تم تسليم الطلب للعميل بواسطة الدليفري');

            // زيادة عدد المشاوير
            $deliveryPerson->increment('trips_count');

            return response()->json([
                'success' => true,
                'message' => 'تم تسليم الطلب بنجاح',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تسليم الطلب'
            ], 500);
        }
    }

    // تفاصيل الطلب
    public function orderDetails(Request $request, $orderId)
    {
        $deliveryPerson = Auth::guard('delivery')->user();
        $deliveryPerson->updateLastSeen();

        $order = Order::with(['user', 'seller.user', 'items.product'])
            ->findOrFail($orderId);

        if ($order->delivery_person_id !== $deliveryPerson->id && $order->pickup_person_id !== $deliveryPerson->id) {
            return response()->json([
                'success' => false,
                'message' => 'هذا الطلب غير مخصص لك'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    // الحصول على جميع الطلبات المخصصة للدليفري (باستثناء المعلقة)
    public function myOrders(Request $request)
    {
        $deliveryPerson = Auth::guard('delivery')->user();
        $deliveryPerson->updateLastSeen();

        // طلبات الاستلام: الطلبات التي لم يتم استلامها بعد وهو مسؤول عن استلامها
        $pickupOrders = Order::with(['user', 'seller.user', 'items.product'])
            ->where('pickup_person_id', $deliveryPerson->id)
            ->where('status', 'ready_for_delivery')
            ->whereNull('delivery_picked_up_at')
            ->orderBy('delivery_scheduled_at', 'asc');

        // طلبات التسليم: الطلبات التي تم استلامها وهو مسؤول عن تسليمها
        $deliveryOrders = Order::with(['user', 'seller.user', 'items.product'])
            ->where('delivery_person_id', $deliveryPerson->id)
            ->where('status', 'out_for_delivery')
            ->whereNotNull('delivery_picked_up_at')
            ->whereNull('delivered_at')
            ->orderBy('delivery_picked_up_at', 'asc');

        // دمج النتائج
        $orders = $pickupOrders->get()->merge($deliveryOrders->get());

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }



    // تعليق الطلب عند عدم تمكن الدليفري من الوصول للعميل
    public function suspendOrder(Request $request, $orderId)
    {
        $deliveryPerson = Auth::guard('delivery')->user();
        $deliveryPerson->updateLastSeen();

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        $order = Order::findOrFail($orderId);

        if ($order->delivery_person_id !== $deliveryPerson->id) {
            return response()->json([
                'success' => false,
                'message' => 'هذا الطلب غير مخصص لك'
            ], 403);
        }

        if ($order->status !== 'out_for_delivery') {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن تعليق هذا الطلب في الحالة الحالية'
            ], 400);
        }

        try {
            $order->suspend($deliveryPerson->id, $request->reason);

            return response()->json([
                'success' => true,
                'message' => 'تم تعليق الطلب بنجاح',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تعليق الطلب: ' . $e->getMessage()
            ], 500);
        }
    }

    // الحصول على الطلبات المعلقة للدليفري
    public function suspendedOrders(Request $request)
    {
        $deliveryPerson = Auth::guard('delivery')->user();
        $deliveryPerson->updateLastSeen();

        $orders = Order::with(['user', 'seller.user', 'items.product'])
            ->where('delivery_person_id', $deliveryPerson->id)
            ->where('status', 'suspended')
            ->orderBy('suspended_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }
}