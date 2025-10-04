<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlatformProfit extends Model
{
    use HasFactory;

    protected $table = 'platform_profits';

    protected $fillable = [
        'order_id',
        'city_id',
        'seller_id',
        'amount',
        'commission_percent',
        'calculated_on',
        'created_at',
        'updated_at',
    ];

    public function order() { return $this->belongsTo(Order::class); }
    public function city() { return $this->belongsTo(City::class); }
    public function seller() { return $this->belongsTo(Seller::class); }
}
