<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MessageAttachment extends Model
{
    use HasFactory;
    protected $table = 'message_attachments';
    protected $fillable = [
        'message_id',
        'file_url',
        'file_type',
        'uploaded_at',
    ];
    public $timestamps = false;

    public function message()
    {
        return $this->belongsTo(Message::class);
    }
}
