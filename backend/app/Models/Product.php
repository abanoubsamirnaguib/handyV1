<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    protected $table = 'products';
    protected $fillable = [
        'seller_id',
        'title',
        'description',
        'price',
        'category_id',
        'delivery_time',
        'rating',
        'review_count',
        'featured',
        'status',
        'rejection_reason',
        'created_at',
        'updated_at',
        'type',
    ];
    public $timestamps = false;

    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }
    public function tags()
    {
        return $this->hasMany(ProductTag::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function publishedReviews()
    {
        return $this->hasMany(Review::class)->where('status', 'published');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Calculate average rating from reviews
    public function getAverageRating()
    {
        return $this->publishedReviews()->avg('rating') ?? 0;
    }

    // Get review count
    public function getReviewCount()
    {
        return $this->publishedReviews()->count();
    }

    // Update product rating and review count
    public function updateRatingStats()
    {
        $this->update([
            'rating' => $this->getAverageRating(),
            'review_count' => $this->getReviewCount()
        ]);
    }
}
