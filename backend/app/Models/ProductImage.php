<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    use HasFactory;
    protected $table = 'product_images';
    protected $fillable = [
        'product_id',
        'image_url',
        'display_order',
        'created_at',
    ];
    public $timestamps = false;

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    
    /**
     * Get the image URL with full path if not already a full URL
     */
    public function getImageUrlAttribute($value)
    {
        // If the URL already starts with http:// or https://, return as-is
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }
        
        // Otherwise, prepend APP_URL and storage path
        return config('app.url') . '/storage/' . ltrim($value, '/');
    }
    
    /**
     * Check if the image is WebP format
     */
    public function isWebP()
    {
        return str_ends_with(strtolower($this->getRawOriginal('image_url') ?? ''), '.webp');
    }
}
