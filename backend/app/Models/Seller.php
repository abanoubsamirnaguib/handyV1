<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seller extends Model
{
    use HasFactory;
    protected $table = 'sellers';
    protected $fillable = [
        'user_id',
        'member_since',
        'rating',
        'review_count',
        'completed_orders',
        'response_time',
        'created_at',
        'updated_at',
    ];
    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function skills()
    {
        return $this->hasMany(SellerSkill::class);
    }
    
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // Get all reviews for this seller's products
    public function reviews()
    {
        return Review::whereHas('product', function($query) {
            $query->where('seller_id', $this->id);
        })->where('status', 'published');
    }

    // Calculate average rating from all product reviews
    public function getAverageRating()
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    // Get total review count
    public function getReviewCount()
    {
        return $this->reviews()->count();
    }

    // Update seller rating and review count
    public function updateRatingStats()
    {
        $this->update([
            'rating' => $this->getAverageRating(),
            'review_count' => $this->getReviewCount()
        ]);
    }
}
