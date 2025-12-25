<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConversationProduct extends Model
{
    protected $fillable = [
        'conversation_id',
        'product_id',
        'product_type',
        'product_title',
        'product_image',
        'product_price',
        'added_at',
    ];

    protected $casts = [
        'added_at' => 'datetime',
        'product_price' => 'decimal:2',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }
}
