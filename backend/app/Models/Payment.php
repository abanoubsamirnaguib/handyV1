<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;
    
    protected $table = 'payments';
    
    protected $fillable = [
        'order_id',
        'user_id',
        'payment_type',
        'payment_method',
        'amount',
        'status',
        'transaction_id',
        'notes',
        'created_at',
        'updated_at',
    ];
    
    public $timestamps = false;

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    // Scopes for common queries
    public function scopeDeposits($query)
    {
        return $query->where('payment_type', 'deposit');
    }
    
    public function scopeFullPayments($query)
    {
        return $query->where('payment_type', 'full_payment');
    }
    
    public function scopeRemainingPayments($query)
    {
        return $query->where('payment_type', 'remaining_payment');
    }
}
