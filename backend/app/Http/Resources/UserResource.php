<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'role' => $this->role,
            'active_role' => $this->active_role,
            'is_seller' => $this->is_seller,
            'is_buyer' => $this->is_buyer,
            'status' => $this->status,
            'bio' => $this->bio,
            'location' => $this->location,
            'skills' => $this->skills,
        ];
    }
}
