<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PostCommentResource extends JsonResource
{
    public function toArray($request)
    {
        $loadedReplies = $this->relationLoaded('replies') ? $this->replies : collect();

        return [
            'id' => $this->id,
            'body' => $this->body,
            'created_at' => $this->created_at,
            'author' => $this->whenLoaded('author', function () {
                return [
                    'id' => $this->author->id,
                    'name' => $this->author->name,
                    'avatar_url' => $this->author->avatar_url,
                ];
            }),
            'replies' => PostCommentResource::collection($loadedReplies),
            'replies_count' => $this->replies_count ?? $loadedReplies->count(),
        ];
    }
}
