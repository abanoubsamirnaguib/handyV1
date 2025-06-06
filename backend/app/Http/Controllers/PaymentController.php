<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    /**
     * Procesar el pago de un depósito
     */
    public function processDeposit(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|in:credit_card,bank_transfer,wallet',
            'conversation_id' => 'required|string',
            'product_id' => 'required|exists:products,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verificar que el pedido pertenece al usuario actual
        $order = Order::where('id', $request->order_id)
            ->where('user_id', Auth::id())
            ->first();
            
        if (!$order) {
            return response()->json(['error' => 'Pedido no encontrado o no autorizado'], 404);
        }

        // Verificar que el depósito no haya sido pagado ya
        if ($order->deposit_status === 'paid') {
            return response()->json(['error' => 'El depósito ya ha sido pagado'], 400);
        }

        try {
            // En una aplicación real, aquí se procesaría el pago con un gateway de pago
            // Simulamos que el pago fue exitoso
            
            // Registrar el pago
            $payment = new Payment([
                'order_id' => $order->id,
                'user_id' => Auth::id(),
                'payment_type' => 'deposit',
                'payment_method' => $request->payment_method,
                'amount' => $request->amount,
                'status' => 'completed',
                'transaction_id' => 'tx_' . uniqid(),
                'notes' => 'Depósito pagado a través del chat'
            ]);
            
            $payment->save();
            
            // Actualizar el pedido
            $order->deposit_amount = $request->amount;
            $order->deposit_status = 'paid';
            $order->status = 'in_progress'; // Cambiar estado del pedido a "en progreso"
            $order->chat_conversation_id = $request->conversation_id;
            $order->save();
            
            // Registrar en el historial del pedido
            // (esto requeriría un modelo OrderHistory que no implementamos aquí)
            
            return response()->json([
                'success' => true,
                'message' => 'Depósito procesado exitosamente',
                'payment' => $payment,
                'order' => $order
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error al procesar el depósito: ' . $e->getMessage());
            return response()->json(['error' => 'Error al procesar el pago'], 500);
        }
    }
    
    /**
     * Procesar el pago del resto del monto después del depósito
     */
    public function processRemainingPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'payment_method' => 'required|in:credit_card,bank_transfer,wallet',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verificar que el pedido pertenece al usuario actual
        $order = Order::where('id', $request->order_id)
            ->where('user_id', Auth::id())
            ->first();
            
        if (!$order) {
            return response()->json(['error' => 'Pedido no encontrado o no autorizado'], 404);
        }

        // Verificar que el depósito ya fue pagado
        if ($order->requires_deposit && $order->deposit_status !== 'paid') {
            return response()->json(['error' => 'Debe pagar el depósito primero'], 400);
        }
        
        // Calcular el monto restante
        $remainingAmount = $order->getRemainingAmount();

        try {
            // En una aplicación real, aquí se procesaría el pago con un gateway de pago
            // Simulamos que el pago fue exitoso
            
            // Registrar el pago
            $payment = new Payment([
                'order_id' => $order->id,
                'user_id' => Auth::id(),
                'payment_type' => 'remaining_payment',
                'payment_method' => $request->payment_method,
                'amount' => $remainingAmount,
                'status' => 'completed',
                'transaction_id' => 'tx_' . uniqid(),
                'notes' => 'Pago del monto restante'
            ]);
            
            $payment->save();
            
            // Actualizar el pedido
            $order->status = 'paid'; // Cambiar estado del pedido a "pagado"
            $order->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Pago restante procesado exitosamente',
                'payment' => $payment,
                'order' => $order
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error al procesar el pago restante: ' . $e->getMessage());
            return response()->json(['error' => 'Error al procesar el pago'], 500);
        }
    }
    
    /**
     * Obtener información sobre los pagos de una orden específica
     */
    public function getOrderPayments($orderId)
    {
        $order = Order::with('payments')->where('id', $orderId)->where('user_id', Auth::id())->first();
        
        if (!$order) {
            return response()->json(['error' => 'Pedido no encontrado o no autorizado'], 404);
        }
        
        return response()->json([
            'order' => $order,
            'payments' => $order->payments,
            'remaining_amount' => $order->getRemainingAmount(),
        ]);
    }
}
