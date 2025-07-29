<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class WishlistItem extends Model
{
    use HasFactory;
    
    protected $table = 'wishlist_items';
    protected $fillable = [
        'user_id',
        'product_id',
        'created_at',
    ];
    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Check if a product is in user's wishlist
     */
    public static function isInWishlist($userId, $productId)
    {
        return static::where('user_id', $userId)
                    ->where('product_id', $productId)
                    ->exists();
    }

    /**
     * Get wishlist item if exists
     */
    public static function findWishlistItem($userId, $productId)
    {
        return static::where('user_id', $userId)
                    ->where('product_id', $productId)
                    ->first();
    }

    /**
     * Add item to wishlist if not exists
     */
    public static function addToWishlist($userId, $productId)
    {
        // Check if already exists
        $existingItem = static::findWishlistItem($userId, $productId);
        
        if ($existingItem) {
            return [
                'success' => false,
                'message' => 'المنتج موجود بالفعل في قائمة الأمنيات',
                'item' => $existingItem,
                'action' => 'already_exists'
            ];
        }

        // Verify product exists and is active
        $product = \App\Models\Product::where('id', $productId)
                                    ->where('status', 'active')
                                    ->first();
        
        if (!$product) {
            return [
                'success' => false,
                'message' => 'المنتج غير متاح أو غير موجود',
                'item' => null,
                'action' => 'product_not_found'
            ];
        }

        // Create new wishlist item
        $item = static::create([
            'user_id' => $userId,
            'product_id' => $productId,
            'created_at' => now()
        ]);

        return [
            'success' => true,
            'message' => 'تمت إضافة المنتج إلى قائمة الأمنيات',
            'item' => $item->load('product'),
            'action' => 'added'
        ];
    }

    /**
     * Remove item from wishlist
     */
    public static function removeFromWishlist($userId, $productId)
    {
        $item = static::findWishlistItem($userId, $productId);
        
        if (!$item) {
            return [
                'success' => false,
                'message' => 'المنتج غير موجود في قائمة الأمنيات',
                'item' => null,
                'action' => 'not_found'
            ];
        }

        $item->delete();

        return [
            'success' => true,
            'message' => 'تمت إزالة المنتج من قائمة الأمنيات',
            'item' => null,
            'action' => 'removed'
        ];
    }

    /**
     * Toggle wishlist item (add if not exists, remove if exists)
     */
    public static function toggleWishlist($userId, $productId)
    {
        if (static::isInWishlist($userId, $productId)) {
            return static::removeFromWishlist($userId, $productId);
        } else {
            return static::addToWishlist($userId, $productId);
        }
    }

    /**
     * Get user's wishlist with products
     */
    public static function getUserWishlist($userId)
    {
        return static::with(['product.images', 'product.seller', 'product.category'])
                    ->where('user_id', $userId)
                    ->orderBy('created_at', 'desc')
                    ->get();
    }

    /**
     * Get wishlist count for user
     */
    public static function getWishlistCount($userId)
    {
        return static::where('user_id', $userId)->count();
    }

    /**
     * Scope for active products only
     */
    public function scopeActiveProducts(Builder $query)
    {
        return $query->whereHas('product', function ($q) {
            $q->where('status', 'active');
        });
    }

    /**
     * Clean up wishlist items for inactive products
     */
    public static function cleanupInactiveProducts()
    {
        return static::whereHas('product', function ($q) {
            $q->where('status', '!=', 'active');
        })->delete();
    }
}
