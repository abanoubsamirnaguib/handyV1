<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;
    protected $table = 'conversations';
    protected $fillable = [
        'buyer_id',
        'seller_id',
        'last_message_time',
        'created_at',
        'updated_at',
    ];
    public $timestamps = false;

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }
    
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
    
    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('message_time', 'asc');
    }
    
    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latest('message_time');
    }

    public function products()
    {
        return $this->hasMany(ConversationProduct::class)->orderBy('added_at', 'desc');
    }
}
