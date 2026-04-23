<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ReferralReward extends Model
{
    use HasFactory;

    public const TYPE_COMPLETED_ORDER_GIFT = 'completed_order_gift';
    public const TYPE_REFERRAL_SELLER_FIRST_PRODUCT_GIFT = 'ref_seller_first_product_gift';

    protected $table = 'referral_rewards';

    public $timestamps = false;

    protected $fillable = [
        'referrer_user_id',
        'referred_user_id',
        'reward_type',
        'amount',
        'currency',
        'source_product_id',
        'source_order_id',
        'reason',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'source_product_id' => 'integer',
            'source_order_id' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public static function rewardTypeLabels(): array
    {
        return [
            self::TYPE_COMPLETED_ORDER_GIFT => 'هدية استكمال أوردر',
            self::TYPE_REFERRAL_SELLER_FIRST_PRODUCT_GIFT => 'هدية أول منتج لبائع مسجل بالرابط',
        ];
    }

    public function getRewardTypeLabelAttribute(): string
    {
        return self::rewardTypeLabels()[$this->reward_type] ?? $this->reward_type;
    }

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_user_id');
    }

    public function referred()
    {
        return $this->belongsTo(User::class, 'referred_user_id');
    }

    public function sourceOrder()
    {
        return $this->belongsTo(Order::class, 'source_order_id');
    }

    public function sourceProduct()
    {
        return $this->belongsTo(Product::class, 'source_product_id');
    }
}

