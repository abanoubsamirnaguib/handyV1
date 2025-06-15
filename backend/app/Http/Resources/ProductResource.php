<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'price' => $this->price,
            'category_id' => $this->category_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'category_name' => $this->whenLoaded('category', function() {
                return $this->category->name ?? null;
            }),
            'seller' => new SellerResource($this->whenLoaded('seller')),
            'sellerId' => $this->seller_id,
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'tags' => ProductTagResource::collection($this->whenLoaded('tags')),
            'rating' => $this->rating,
            'reviewCount' => $this->review_count,
            'review_count' => $this->review_count,
            'featured' => $this->featured,
            'status' => $this->status,
            'delivery_time' => $this->delivery_time,
            'type' => $this->type,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
