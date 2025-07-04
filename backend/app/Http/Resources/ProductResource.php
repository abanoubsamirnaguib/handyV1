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
            'name' => $this->title, // For frontend compatibility
            'description' => $this->description,
            'price' => $this->price,
            'category_name' => $this->category->name?? '',
            'category' => new CategoryResource($this->whenLoaded('category')),
            'seller' => new SellerResource($this->whenLoaded('seller')),
            'sellerId' => $this->seller_id,
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'image' => $this->images->first()?->image_url ?? 'https://via.placeholder.com/100',
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
