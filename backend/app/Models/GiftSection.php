<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GiftSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'tags',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'tags' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get products for this section based on tags
     */
    public function getProducts($limit = null)
    {
        if (empty($this->tags)) {
            return collect([]);
        }

        $query = Product::with(['images', 'seller', 'category'])
            ->where('status', 'active')
            ->whereHas('tags', function ($q) {
                $q->where(function($query) {
                    foreach ($this->tags as $tag) {
                        $query->orWhere('tag_name', 'LIKE', '%' . trim($tag) . '%');
                    }
                });
            })
            ->orderBy('created_at', 'desc');

        if ($limit) {
            $query->limit($limit);
        }

        return $query->get();
    }
}
