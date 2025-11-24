<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class DeliveryPersonnel extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'delivery_personnel';
    
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'is_available',
        'status',
        'notes',
        'created_by',
        'last_login_at',
        'last_seen_at',
        'trips_count',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'is_available' => 'boolean',
        'password' => 'hashed'
    ];

    // العلاقات
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'delivery_person_id');
    }

    // الطلبات المطلوب استلامها
    public function ordersToPickup()
    {
        return $this->hasMany(Order::class, 'pickup_person_id')
            ->where('status', 'ready_for_delivery')
            ->whereNull('delivery_picked_up_at'); // لم يتم الاستلام بعد
    }

    // الطلبات المطلوب تسليمها
    public function ordersToDeliver()
    {
        return $this->hasMany(Order::class, 'delivery_person_id')
            ->where('status', 'out_for_delivery')
            ->whereNotNull('delivery_picked_up_at'); // تم الاستلام من البائع
    }

    // الطلبات المكتملة
    public function completedOrders()
    {
        return $this->hasMany(Order::class, 'delivery_person_id')
            ->whereIn('status', ['delivered', 'completed']);
    }

    // وظائف الحالة
    public function isActive()
    {
        return $this->status === 'active';
    }

    public function isAvailable()
    {
        return $this->is_available && $this->isActive();
    }

    public function markAsAvailable()
    {
        $this->update(['is_available' => true]);
    }

    public function markAsUnavailable()
    {
        $this->update(['is_available' => false]);
    }

    // Reset trips count
    public function resetTripsCount()
    {
        return $this->update(['trips_count' => 0]);
    }

    // تحديث وقت آخر ظهور
    public function updateLastSeen()
    {
        $this->update(['last_seen_at' => now()]);
    }

    // تسجيل الدخول
    public function updateLastLogin()
    {
        $this->update(['last_login_at' => now()]);
    }
}