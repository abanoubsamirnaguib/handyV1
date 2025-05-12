<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductTagResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'tag_name' => $this->tag_name,
        ];
    }
}
