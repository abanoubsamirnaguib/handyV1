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
            'items' => $this->items, // You may want to create OrderItemResource if needed
            'status' => $this->status,
            'total_price' => $this->total_price,
            'order_date' => $this->order_date,
            'delivery_date' => $this->delivery_date,
            'requirements' => $this->requirements,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
