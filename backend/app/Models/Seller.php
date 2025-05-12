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
        'bio',
        'location',
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
}
