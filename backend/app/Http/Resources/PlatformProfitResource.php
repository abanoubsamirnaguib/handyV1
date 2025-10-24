<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PlatformProfitResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'city' => new CityResource($this->whenLoaded('city')),
            'seller_id' => $this->seller_id,
            'amount' => $this->amount,
            'commission_percent' => $this->commission_percent,
            'calculated_on' => $this->calculated_on,
            'created_at' => $this->created_at,
        ];
    }
}
