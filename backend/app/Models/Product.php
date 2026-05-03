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
        'quantity',
        'discount_type',
        'discount_percentage',
        'discount_fixed_amount',
        'discount_schedule',
        'discount_starts_at',
        'discount_ends_at',
    ];
    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'discount_starts_at' => 'datetime',
            'discount_ends_at' => 'datetime',
        ];
    }

    public function hasConfiguredDiscount(): bool
    {
        return in_array($this->discount_type, ['percentage', 'fixed'], true);
    }

    public function isDiscountCurrentlyActive(): bool
    {
        if (!$this->hasConfiguredDiscount()) {
            return false;
        }
        $schedule = $this->discount_schedule ?? 'always';
        if ($schedule === 'always') {
            return true;
        }
        if ($schedule !== 'scheduled') {
            return false;
        }
        $now = now();
        if (!$this->discount_starts_at || !$this->discount_ends_at) {
            return false;
        }
        return $now->greaterThanOrEqualTo($this->discount_starts_at)
            && $now->lessThanOrEqualTo($this->discount_ends_at);
    }

    /**
     * Sale unit price when discount applies now; null otherwise.
     */
    public function computeSalePrice(): ?float
    {
        if (!$this->isDiscountCurrentlyActive()) {
            return null;
        }
        $base = (float) $this->price;
        if ($this->discount_type === 'percentage') {
            $pct = max(0.0, min(100.0, (float) ($this->discount_percentage ?? 0)));
            return round($base * (1 - $pct / 100), 2);
        }
        if ($this->discount_type === 'fixed') {
            $amt = max(0.0, (float) ($this->discount_fixed_amount ?? 0));
            return round(max(0.0, $base - $amt), 2);
        }
        return null;
    }

    public function getEffectiveUnitPrice(): float
    {
        return $this->computeSalePrice() ?? (float) $this->price;
    }

    public function discountLabel(): ?string
    {
        if (!$this->isDiscountCurrentlyActive()) {
            return null;
        }
        if ($this->discount_type === 'percentage') {
            $pct = rtrim(rtrim(number_format((float) ($this->discount_percentage ?? 0), 2, '.', ''), '0'), '.');
            return '-' . $pct . '%';
        }
        if ($this->discount_type === 'fixed') {
            return '-' . number_format((float) ($this->discount_fixed_amount ?? 0), 2, '.', '') . ' ج.م';
        }
        return null;
    }

    public function scopeWithActiveDiscount($query)
    {
        return $query->whereIn('discount_type', ['percentage', 'fixed'])
            ->where(function ($q) {
                $q->where('discount_schedule', 'always')
                    ->orWhere(function ($q2) {
                        $q2->where('discount_schedule', 'scheduled')
                            ->whereNotNull('discount_starts_at')
                            ->whereNotNull('discount_ends_at')
                            ->where('discount_starts_at', '<=', now())
                            ->where('discount_ends_at', '>=', now());
                    });
            });
    }

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

    // Scope for active products
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }   
}