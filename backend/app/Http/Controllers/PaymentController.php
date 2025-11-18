<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Services\NotificationService;

class PaymentController extends Controller
{
    /**
     * معالجة دفع العربون
     */
    public function processDeposit(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|in:cash_on_delivery,vodafone_cash,instapay,bank_transfer,credit_card',
            'conversation_id' => 'required|string',
            'product_id' => 'required|exists:products,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // التحقق من أن الطلب يخصّ المستخدم الحالي
        $order = Order::where('id', $request->order_id)
            ->where('user_id', Auth::id())
            ->first();
            
        if (!$order) {
            return response()->json(['error' => 'الطلب غير موجود أو غير مصرح بالوصول إليه'], 404);
        }

        // التأكد من أن العربون لم يُدفع سابقاً
        if ($order->deposit_status === 'paid') {
            return response()->json(['error' => 'تم دفع العربون بالفعل'], 400);
        }

        // التأكد من أن قيمة العربون لا تتجاوز 80% من قيمة المنتج
        $maxDepositAmount = $order->total_price * 0.8;
        if ($request->amount > $maxDepositAmount) {
            return response()->json(['error' => 'قيمة العربون لا يمكن أن تتجاوز 80% من قيمة المنتج الأصلي'], 400);
        }

        try {
            // في تطبيق حقيقي سيتم تمرير الدفع إلى بوابة دفع
            // هنا نفترض أن عملية الدفع نجحت
            
            // تسجيل عملية الدفع
            $payment = new Payment([
                'order_id' => $order->id,
                'user_id' => Auth::id(),
                'payment_type' => 'deposit',
                'payment_method' => $request->payment_method,
                'amount' => $request->amount,
                'status' => 'completed',
                'transaction_id' => 'tx_' . uniqid(),
                'notes' => 'تم دفع العربون عن طريق المحادثة'
            ]);
            
            $payment->save();
            
            // تحديث بيانات الطلب
            $order->deposit_amount = $request->amount;
            $order->deposit_status = 'paid';
            $order->status = 'in_progress'; // تغيير حالة الطلب إلى "قيد التنفيذ"
            $order->chat_conversation_id = $request->conversation_id;
            $order->save();
            
            // إرسال إشعار للبائع بوصول العربون
            if ($order->seller && $order->seller->user_id) {
                NotificationService::depositReceived(
                    $order->seller->user_id,
                    $request->amount,
                    $order->id
                );
            }
            
            return response()->json([
                'success' => true,
                'message' => 'تمت معالجة دفع العربون بنجاح',
                'payment' => $payment,
                'order' => $order
            ]);
            
        } catch (\Exception $e) {
            Log::error('حدث خطأ أثناء معالجة العربون: ' . $e->getMessage());
            return response()->json(['error' => 'حدث خطأ أثناء معالجة الدفع'], 500);
        }
    }
    
    /**
     * معالجة دفع المبلغ المتبقي بعد العربون
     */
    public function processRemainingPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'payment_method' => 'required|in:cash_on_delivery,vodafone_cash,instapay,bank_transfer,credit_card',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // التحقق من أن الطلب يخصّ المستخدم الحالي
        $order = Order::where('id', $request->order_id)
            ->where('user_id', Auth::id())
            ->first();
            
        if (!$order) {
            return response()->json(['error' => 'الطلب غير موجود أو غير مصرح بالوصول إليه'], 404);
        }

        // التأكد من أن العربون تم دفعه بالفعل
        if ($order->requires_deposit && $order->deposit_status !== 'paid') {
            return response()->json(['error' => 'يجب دفع العربون أولاً'], 400);
        }
        
        // حساب المبلغ المتبقي
        $remainingAmount = $order->getRemainingAmount();

        try {
            // في تطبيق حقيقي سيتم تمرير الدفع إلى بوابة دفع
            // هنا نفترض أن عملية الدفع نجحت
            
            // تسجيل عملية الدفع
            $payment = new Payment([
                'order_id' => $order->id,
                'user_id' => Auth::id(),
                'payment_type' => 'remaining_payment',
                'payment_method' => $request->payment_method,
                'amount' => $remainingAmount,
                'status' => 'completed',
                'transaction_id' => 'tx_' . uniqid(),
                'notes' => 'دفع المبلغ المتبقي'
            ]);
            
            $payment->save();
            
            // تحديث بيانات الطلب
            $order->payment_status = 'paid'; // تأكيد أن الطلب بالكامل أصبح مدفوعاً
            $order->save();
            
            return response()->json([
                'success' => true,
                'message' => 'تمت معالجة دفع المبلغ المتبقي بنجاح',
                'payment' => $payment,
                'order' => $order
            ]);
            
        } catch (\Exception $e) {
            Log::error('حدث خطأ أثناء معالجة دفع المبلغ المتبقي: ' . $e->getMessage());
            return response()->json(['error' => 'حدث خطأ أثناء معالجة الدفع'], 500);
        }
    }
    
    /**
     * الحصول على معلومات المدفوعات الخاصة بطلب معيّن
     */
    public function getOrderPayments($orderId)
    {
        $order = Order::with('payments')->where('id', $orderId)->where('user_id', Auth::id())->first();
        
        if (!$order) {
            return response()->json(['error' => 'الطلب غير موجود أو غير مصرح بالوصول إليه'], 404);
        }
        
        return response()->json([
            'order' => $order,
            'payments' => $order->payments,
            'remaining_amount' => $order->getRemainingAmount(),
        ]);
    }
}
