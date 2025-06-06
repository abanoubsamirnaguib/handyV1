<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;
    protected $table = 'orders';
    protected $fillable = [
        'user_id',
        'seller_id',
        'status',
        'total_price',
        'order_date',
        'delivery_date',
        'requirements',
        'customer_name',
        'customer_phone',
        'delivery_address',
        'payment_method',
        'payment_status',
        'requires_deposit',
        'deposit_amount',
        'deposit_status',
        'deposit_notes',
        'chat_conversation_id',
        'created_at',
        'updated_at',
    ];
    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
    
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
    
    public function conversation()
    {
        return $this->belongsTo(Conversation::class, 'chat_conversation_id');
    }
    
    /**
     * Verifica si el pedido tiene un depósito pagado
     */
    public function hasDepositPaid()
    {
        return $this->deposit_status === 'paid';
    }
    
    /**
     * Calcula el monto restante después del depósito
     */
    public function getRemainingAmount()
    {
        if (!$this->requires_deposit || $this->deposit_status !== 'paid') {
            return $this->total_price;
        }
        
        return $this->total_price - $this->deposit_amount;
    }
}
