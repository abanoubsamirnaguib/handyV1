<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SellerResource extends JsonResource
{
    public function toArray($request)
    {
        // Get skills directly from the seller_skills table only
        $skills = $this->whenLoaded('skills', function() {
            return $this->skills->pluck('skill_name')->toArray();
        }, []);
        
        return [
            'id' => $this->id,
            'user' => new UserResource($this->whenLoaded('user')),
            'name' => $this->user->name ?? null,
            'phone' => $this->whenLoaded('user', function() {
                return $this->user->phone ?? null;
            }),
            'bio' => $this->user->bio ?? null,
            'location' => $this->user->location ?? null,
            'status' => $this->user->status ?? null,
            'member_since' => $this->member_since,
            'rating' => $this->rating,
            'review_count' => $this->review_count,
            'completed_orders' => $this->completed_orders,
            'in_progress_orders_count' => $this->in_progress_orders_count ?? 0,
            'skills' => $skills,
            'products' => $this->relationLoaded('products')
                ? ProductResource::collection($this->products->active()->map(function ($product) {
                    return $product->load(['images', 'category']);
                }))
                : [],
        ];
    }
}
