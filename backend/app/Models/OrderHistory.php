<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderHistory extends Model
{
    use HasFactory;
    protected $table = 'order_history';
    protected $fillable = [
        'order_id',
        'status',
        'action_by',
        'action_type',
        'note',
        'created_at',
    ];
    public $timestamps = false;

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
    public function actionUser()
    {
        return $this->belongsTo(User::class, 'action_by');
    }
}
