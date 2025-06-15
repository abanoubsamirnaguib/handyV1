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
}
