<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatReport extends Model
{
    protected $table = 'chat_reports';
    
    protected $fillable = [
        'conversation_id',
        'reporter_id',
        'reason',
        'description',
        'status',
        'resolved_by',
        'resolved_at',
        'admin_notes',
    ];
    
    public $timestamps = false;
    
    protected $dates = [
        'resolved_at',
        'created_at',
        'updated_at',
    ];
    
    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }
    
    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }
    
    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
    
    public function isPending()
    {
        return $this->status === 'pending';
    }
    
    public function isResolved()
    {
        return $this->status === 'resolved';
    }
}
