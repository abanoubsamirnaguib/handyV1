<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SellerResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user' => new UserResource($this->whenLoaded('user')),
            'bio' => $this->bio,
            'location' => $this->location,
            'member_since' => $this->member_since,
            'rating' => $this->rating,
            'review_count' => $this->review_count,
            'completed_orders' => $this->completed_orders,
            'response_time' => $this->response_time,
            'skills' => SellerSkillResource::collection($this->whenLoaded('skills')),
        ];
    }
}
