<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{    public function toArray($request)
    {
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar_url,
            'cover_image' => $this->cover_image_url,
            'role' => $this->role,
            'active_role' => $this->active_role,
            'is_seller' => $this->is_seller,
            'is_buyer' => $this->is_buyer,
            'status' => $this->status,
            'bio' => $this->bio,
            'location' => $this->location,
            'phone' => $this->phone,
            'seller_id' => $this->seller_id, // ID from sellers table (null if not a seller)
            'buyer_wallet_balance' => $this->buyer_wallet_balance,
            'email_notifications' => $this->email_notifications ?? false,
            'show_ai_assistant' => $this->show_ai_assistant ?? true,
            'orders_count' => $this->orders_count ?? 0,
            'created_at' => $this->created_at,
            'last_login' => $this->last_login,
            'last_seen' => $this->last_seen,
        ];
        if ($this->active_role === 'seller') {
            $data['skills'] = $this->skills;
        }
        
        return $data;
    }
}
