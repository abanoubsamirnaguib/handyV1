<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryEarning extends Model
{
    use HasFactory;

    protected $fillable = [
        'delivery_person_id',
        'order_id',
        'type',
        'amount',
        'status',
        'earned_at',
        'paid_at',
        'notes'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'earned_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    // العلاقات
    public function deliveryPerson()
    {
        return $this->belongsTo(DeliveryPersonnel::class, 'delivery_person_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // وظائف الحالة
    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isPaid()
    {
        return $this->status === 'paid';
    }

    public function isPickup()
    {
        return $this->type === 'pickup';
    }

    public function isDelivery()
    {
        return $this->type === 'delivery';
    }

    // تعيين كمدفوع
    public function markAsPaid($notes = null)
    {
        $this->update([
            'status' => 'paid',
            'paid_at' => now(),
            'notes' => $notes
        ]);
    }

    // Scopes للاستعلامات المتكررة
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopePickup($query)
    {
        return $query->where('type', 'pickup');
    }

    public function scopeDelivery($query)
    {
        return $query->where('type', 'delivery');
    }

    public function scopeForDeliveryPerson($query, $deliveryPersonId)
    {
        return $query->where('delivery_person_id', $deliveryPersonId);
    }

    // إنشاء ربح جديد
    public static function createEarning($deliveryPersonId, $orderId, $type, $amount = 10.00)
    {
        return self::create([
            'delivery_person_id' => $deliveryPersonId,
            'order_id' => $orderId,
            'type' => $type,
            'amount' => $amount,
            'status' => 'pending',
            'earned_at' => now()
        ]);
    }
} 