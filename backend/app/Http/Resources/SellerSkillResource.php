<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SellerSkillResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'skill_name' => $this->skill_name,
        ];
    }
}
