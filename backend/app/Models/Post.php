<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Product;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'body',
        'shared_review_id',
        'shared_product_id',
        'status',
        'comments_count',
        'reactions_count',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function media()
    {
        return $this->hasMany(PostMedia::class)->orderBy('sort_order');
    }

    public function embed()
    {
        return $this->hasOne(PostEmbed::class);
    }

    public function comments()
    {
        return $this->hasMany(PostComment::class)
            ->where('status', 'published')
            ->whereNull('parent_id');
    }

    public function reactions()
    {
        return $this->hasMany(PostReaction::class);
    }

    public function sharedReview()
    {
        return $this->belongsTo(Review::class, 'shared_review_id');
    }

    public function sharedProduct()
    {
        return $this->belongsTo(Product::class, 'shared_product_id');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeWithRelations($query)
    {
        return $query->with([
            'author.seller',
            'media',
            'embed',
            'sharedReview.user',
            'sharedReview.product',
            'sharedProduct.images',
            'sharedProduct.seller.user',
            'sharedProduct.category',
        ]);
    }
}
