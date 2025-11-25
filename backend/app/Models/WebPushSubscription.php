<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * WebPushSubscription Model
 * 
 * Stores user Web Push subscriptions for sending browser notifications
 * when the application is closed. Uses the Web Push API standard.
 * 
 * @property int $id
 * @property int $user_id
 * @property string $endpoint The push service endpoint URL
 * @property string $p256dh_key User's public encryption key (Base64)
 * @property string $auth_key Authentication secret (Base64)
 * @property string|null $user_agent Browser/device information
 * @property \Carbon\Carbon|null $last_used_at When notification was last sent
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class WebPushSubscription extends Model
{
    use HasFactory;

    protected $table = 'web_push_subscriptions';

    protected $fillable = [
        'user_id',
        'endpoint',
        'p256dh_key',
        'auth_key',
        'user_agent',
        'last_used_at',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
    ];

    /**
     * Get the user that owns this subscription.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the subscription as an array suitable for web-push library
     * 
     * @return array
     */
    public function toPushSubscription(): array
    {
        return [
            'endpoint' => $this->endpoint,
            'keys' => [
                'p256dh' => $this->p256dh_key,
                'auth' => $this->auth_key,
            ],
        ];
    }

    /**
     * Update the last_used_at timestamp
     */
    public function markAsUsed(): void
    {
        $this->update(['last_used_at' => now()]);
    }

    /**
     * Scope to get subscriptions for a specific user
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get active subscriptions (used within last 30 days)
     */
    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('last_used_at')
              ->orWhere('last_used_at', '>=', now()->subDays(30));
        });
    }
}
