<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;
    protected $table = 'messages';
    protected $fillable = [
        'conversation_id',
        'sender_id',
        'recipient_id',
        'message_text',
        'read_status',
        'message_time',
        'created_at',
    ];
    public $timestamps = false;

    protected $with = ['attachments'];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }
    
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
    
    public function recipient()
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }
    
    public function attachments()
    {
        return $this->hasMany(MessageAttachment::class);
    }
}
