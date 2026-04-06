<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ReferralReward extends Model
{
    use HasFactory;

    public const TYPE_SIGNUP = 'signup';
    public const TYPE_FIRST_PRODUCT = 'first_product';
    public const TYPE_FIRST_ORDER = 'first_order';

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
            self::TYPE_SIGNUP => 'تسجيل مستخدم جديد',
            self::TYPE_FIRST_PRODUCT => 'اعتماد أول منتج',
            self::TYPE_FIRST_ORDER => 'إكمال أول طلب',
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
}

