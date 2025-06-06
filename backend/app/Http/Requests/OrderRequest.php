<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        if ($this->isMethod('post')) {
            return [
                'user_id' => 'required|exists:users,id',
                'seller_id' => 'required|exists:sellers,id',
                'status' => 'in:pending,paid,in_progress,completed,cancelled,refunded',
                'total_price' => 'required|numeric',
                'order_date' => 'required|date',
                'delivery_date' => 'nullable|date',
                'requirements' => 'nullable|string',
                'customer_name' => 'required|string|max:100',
                'customer_phone' => 'required|string|max:20',
                'delivery_address' => 'required|string',
                'payment_method' => 'in:cash_on_delivery,bank_transfer,credit_card',
                'payment_status' => 'in:pending,partial,paid,refunded',
                'requires_deposit' => 'boolean',
                'deposit_amount' => 'nullable|numeric',
                'deposit_status' => 'in:not_paid,paid,refunded',
                'deposit_notes' => 'nullable|string',
                'chat_conversation_id' => 'nullable|exists:conversations,id',
            ];
        }
        // PATCH/PUT (update)
        return [
            'status' => 'in:pending,paid,in_progress,completed,cancelled,refunded',
            'total_price' => 'sometimes|required|numeric',
            'order_date' => 'sometimes|required|date',
            'delivery_date' => 'nullable|date',
            'requirements' => 'nullable|string',
            'customer_name' => 'sometimes|required|string|max:100',
            'customer_phone' => 'sometimes|required|string|max:20',
            'delivery_address' => 'sometimes|required|string',
            'payment_method' => 'in:cash_on_delivery,bank_transfer,credit_card',
            'payment_status' => 'in:pending,partial,paid,refunded',
            'requires_deposit' => 'boolean',
            'deposit_amount' => 'nullable|numeric',
            'deposit_status' => 'in:not_paid,paid,refunded',
            'deposit_notes' => 'nullable|string',
            'chat_conversation_id' => 'nullable|exists:conversations,id',
        ];
    }
}
