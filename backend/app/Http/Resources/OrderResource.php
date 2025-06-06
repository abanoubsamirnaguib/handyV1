<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user' => new UserResource($this->whenLoaded('user')),
            'seller' => new SellerResource($this->whenLoaded('seller')),
            'items' => $this->items,
            'status' => $this->status,
            'total_price' => $this->total_price,
            'order_date' => $this->order_date,
            'delivery_date' => $this->delivery_date,
            'requirements' => $this->requirements,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'delivery_address' => $this->delivery_address,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'requires_deposit' => $this->requires_deposit,
            'deposit_amount' => $this->deposit_amount,
            'deposit_status' => $this->deposit_status,
            'deposit_notes' => $this->deposit_notes,
            'chat_conversation_id' => $this->chat_conversation_id,
            'conversation' => $this->whenLoaded('conversation'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
