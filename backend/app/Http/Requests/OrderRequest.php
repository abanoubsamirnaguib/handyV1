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
                'status' => 'in:pending,admin_approved,seller_approved,in_progress,ready_for_delivery,out_for_delivery,delivered,completed,cancelled',
                'total_price' => 'required|numeric',
                'order_date' => 'required|date',
                'delivery_date' => 'nullable|date',
                'requirements' => 'nullable|string',
                'customer_name' => 'required|string|max:100',
                'customer_phone' => 'required|string|max:20',
                'delivery_address' => 'required|string',
                'payment_method' => 'in:cash_on_delivery,bank_transfer,credit_card,vodafone_cash,instapay',
                'payment_status' => 'in:pending,partial,paid,refunded',
                'requires_deposit' => 'boolean',
                'deposit_amount' => 'nullable|numeric',
                'deposit_status' => 'in:not_paid,paid,refunded',
                'deposit_notes' => 'nullable|string',
                'chat_conversation_id' => 'nullable|exists:conversations,id',
                'payment_proof' => 'nullable|string',
                'admin_notes' => 'nullable|string',
                'seller_notes' => 'nullable|string',
                'delivery_notes' => 'nullable|string',
                'delivery_person_id' => 'nullable|exists:users,id',
                'city_id' => 'nullable|exists:cities,id',
                'platform_commission_percent' => 'nullable|numeric|min:0|max:100',
                'platform_commission_amount' => 'nullable|numeric|min:0',
                'buyer_total' => 'nullable|numeric|min:0',
                'seller_net_amount' => 'nullable|numeric|min:0',
            ];
        }
        // PATCH/PUT (update)
        return [
            'status' => 'in:pending,admin_approved,seller_approved,in_progress,ready_for_delivery,out_for_delivery,delivered,completed,cancelled',
            'total_price' => 'sometimes|required|numeric',
            'order_date' => 'sometimes|required|date',
            'delivery_date' => 'nullable|date',
            'requirements' => 'nullable|string',
            'customer_name' => 'sometimes|required|string|max:100',
            'customer_phone' => 'sometimes|required|string|max:20',
            'delivery_address' => 'sometimes|required|string',
            'payment_method' => 'in:cash_on_delivery,bank_transfer,credit_card,vodafone_cash,instapay',
            'payment_status' => 'in:pending,partial,paid,refunded',
            'requires_deposit' => 'boolean',
            'deposit_amount' => 'nullable|numeric',
            'deposit_status' => 'in:not_paid,paid,refunded',
            'deposit_notes' => 'nullable|string',
            'chat_conversation_id' => 'nullable|exists:conversations,id',
            'payment_proof' => 'nullable|string',
            'admin_notes' => 'nullable|string',
            'seller_notes' => 'nullable|string',
            'delivery_notes' => 'nullable|string',
            'delivery_person_id' => 'nullable|exists:users,id',
            'city_id' => 'nullable|exists:cities,id',
            'platform_commission_percent' => 'nullable|numeric|min:0|max:100',
            'platform_commission_amount' => 'nullable|numeric|min:0',
            'buyer_total' => 'nullable|numeric|min:0',
            'seller_net_amount' => 'nullable|numeric|min:0',
        ];
    }
}
