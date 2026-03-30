<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray($request)
    {
        $sharedReview = null;
        $sharedProduct = null;

        if ($this->type === 'review_share' && $this->relationLoaded('sharedReview')) {
            if ($this->sharedReview && $this->sharedReview->status === 'published') {
                $sharedReview = new ReviewResource($this->sharedReview);
            } else {
                $sharedReview = [
                    'id' => null,
                    'unavailable' => true,
                ];
            }
        }

        if ($this->relationLoaded('sharedProduct') && $this->sharedProduct && $this->sharedProduct->status === 'active') {
            $sharedProduct = [
                'id' => $this->sharedProduct->id,
                'title' => $this->sharedProduct->title,
                'name' => $this->sharedProduct->title,
                'price' => $this->sharedProduct->price,
                'type' => $this->sharedProduct->type,
                'status' => $this->sharedProduct->status,
                'image' => optional($this->sharedProduct->images->first())->image_url,
                'category_name' => optional($this->sharedProduct->category)->name,
                'seller_name' => optional(optional($this->sharedProduct->seller)->user)->name,
            ];
        }

        return [
            'id' => $this->id,
            'type' => $this->type,
            'body' => $this->body,
            'status' => $this->status,
            'author' => $this->whenLoaded('author', function () {
                $sellerId = $this->author->seller_id;

                return [
                    'id' => $this->author->id,
                    'name' => $this->author->name,
                    'avatar_url' => $this->author->avatar_url,
                    'active_role' => $this->author->active_role,
                    'seller_id' => $sellerId,
                    'profile_url' => $sellerId ? "/sellers/{$sellerId}" : "/profile/{$this->author->id}",
                    'followed_by_viewer' => (bool) ($this->author_followed_by_viewer ?? false),
                ];
            }),
            'media' => $this->whenLoaded('media', function () {
                return $this->media->map(function ($media) {
                    return [
                        'id' => $media->id,
                        'file_url' => $media->file_url,
                        'sort_order' => $media->sort_order,
                    ];
                })->values();
            }, []),
            'embed' => $this->whenLoaded('embed', function () {
                if (!$this->embed) {
                    return null;
                }

                return [
                    'provider' => $this->embed->provider,
                    'embed_url' => $this->embed->embed_url,
                    'thumbnail_url' => $this->embed->thumbnail_url,
                ];
            }),
            'shared_review' => $sharedReview,
            'shared_product' => $sharedProduct,
            'counts' => [
                'comments' => (int) $this->comments_count,
                'reactions' => (int) $this->reactions_count,
            ],
            'viewer_reaction' => $this->viewer_reaction ?? null,
            'created_at' => $this->created_at,
        ];
    }
}
