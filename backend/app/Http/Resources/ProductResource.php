<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\WishlistItem;
use Illuminate\Support\Facades\Auth;

class ProductResource extends JsonResource
{
    public function toArray($request)
    {
        // Check if product is in user's wishlist if user is authenticated
        $inWishlist = false;
        
        if (Auth::check()) {
            $userId = Auth::id();
            $inWishlist = WishlistItem::isInWishlist($userId, $this->id);
        }

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
            'seller_name' => $this->whenLoaded('seller.user', function() {
                return $this->seller->user->name ?? null;
            }),
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
            'orders_count' => $this->orders_count ?? $this->orderItems()->count(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'in_wishlist' => $inWishlist,
        ];
    }
}
