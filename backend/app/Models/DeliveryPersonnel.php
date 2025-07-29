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
        'last_seen_at'
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
        return $this->hasMany(Order::class, 'delivery_person_id')
            ->where('status', 'ready_for_delivery');
    }

    // الطلبات المطلوب تسليمها
    public function ordersToDeliver()
    {
        return $this->hasMany(Order::class, 'delivery_person_id')
            ->where('status', 'out_for_delivery');
    }

    // الطلبات المكتملة
    public function completedOrders()
    {
        return $this->hasMany(Order::class, 'delivery_person_id')
            ->whereIn('status', ['delivered', 'completed']);
    }

    // العلاقة مع الأرباح
    public function earnings()
    {
        return $this->hasMany(DeliveryEarning::class, 'delivery_person_id');
    }

    // الأرباح المعلقة
    public function pendingEarnings()
    {
        return $this->hasMany(DeliveryEarning::class, 'delivery_person_id')
            ->where('status', 'pending');
    }

    // الأرباح المدفوعة
    public function paidEarnings()
    {
        return $this->hasMany(DeliveryEarning::class, 'delivery_person_id')
            ->where('status', 'paid');
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

    // إحصائيات الدليفري
    public function getPickupCount()
    {
        return $this->orders()
            ->whereNotNull('delivery_picked_up_at')
            ->count();
    }

    public function getDeliveryCount()
    {
        return $this->orders()
            ->whereNotNull('delivered_at')
            ->count();
    }

    public function getTodayPickupCount()
    {
        return $this->orders()
            ->whereDate('delivery_picked_up_at', today())
            ->count();
    }

    public function getTodayDeliveryCount()
    {
        return $this->orders()
            ->whereDate('delivered_at', today())
            ->count();
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

    // حساب إجمالي الأرباح
    public function getTotalEarnings()
    {
        return $this->earnings()->sum('amount');
    }

    // حساب الأرباح المعلقة
    public function getPendingEarningsAmount()
    {
        return $this->pendingEarnings()->sum('amount');
    }

    // حساب الأرباح المدفوعة
    public function getPaidEarningsAmount()
    {
        return $this->paidEarnings()->sum('amount');
    }

    // حساب أرباح اليوم
    public function getTodayEarnings()
    {
        return $this->earnings()
            ->whereDate('earned_at', today())
            ->sum('amount');
    }

    // حساب أرباح الشهر الحالي
    public function getMonthlyEarnings()
    {
        return $this->earnings()
            ->whereYear('earned_at', now()->year)
            ->whereMonth('earned_at', now()->month)
            ->sum('amount');
    }

    // إحصائيات مفصلة للأرباح
    public function getEarningsStats()
    {
        return [
            'total' => $this->getTotalEarnings(),
            'pending' => $this->getPendingEarningsAmount(),
            'paid' => $this->getPaidEarningsAmount(),
            'today' => $this->getTodayEarnings(),
            'this_month' => $this->getMonthlyEarnings(),
            'pickup_count' => $this->earnings()->where('type', 'pickup')->count(),
            'delivery_count' => $this->earnings()->where('type', 'delivery')->count(),
        ];
    }
} 