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
        'payment_proof',
        'admin_approved_at',
        'admin_approved_by',
        'seller_approved_at',
        'work_started_at',
        'work_completed_at',
        'delivery_scheduled_at',
        'delivery_picked_up_at',
        'delivered_at',
        'completed_at',
        'delivery_person_id',
        'delivery_notes',
        'admin_notes',
        'seller_notes',
        'created_at',
        'updated_at',
    ];
    
    protected $dates = [
        'order_date',
        'delivery_date',
        'admin_approved_at',
        'seller_approved_at',
        'work_started_at',
        'work_completed_at',
        'delivery_scheduled_at',
        'delivery_picked_up_at',
        'delivered_at',
        'completed_at',
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
    
    public function adminApprover()
    {
        return $this->belongsTo(User::class, 'admin_approved_by');
    }
    
    public function deliveryPerson()
    {
        return $this->belongsTo(User::class, 'delivery_person_id');
    }
    
    public function history()
    {
        return $this->hasMany(OrderHistory::class);
    }
    
    public function isPending()
    {
        return $this->status === 'pending';
    }
    
    public function isAdminApproved()
    {
        return $this->status === 'admin_approved';
    }
    
    public function isSellerApproved()
    {                       
        return $this->status === 'seller_approved';
    }
    
    public function isInProgress()
    {
        return $this->status === 'in_progress';
    }
    
    public function isReadyForDelivery()
    {
        return $this->status === 'ready_for_delivery';
    }
    
    public function isOutForDelivery()
    {
        return $this->status === 'out_for_delivery';
    }
    
    public function isDelivered()
    {
        return $this->status === 'delivered';
    }
    
    public function isCompleted()
    {
        return $this->status === 'completed';
    }
    
    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }
    
    public function canBeApprovedByAdmin()
    {
        return $this->isPending() && $this->payment_proof;
    }
    
    public function canBeApprovedBySeller()
    {
        return $this->isAdminApproved();
    }
    
    public function canStartWork()
    {
        return $this->isSellerApproved();
    }
    
    public function canCompleteWork()
    {
        return $this->isInProgress();
    }
    
    public function canBePickedUpByDelivery()
    {
        return $this->isReadyForDelivery();
    }
    
    public function canBeDelivered()
    {
        return $this->isOutForDelivery();
    }
    
    public function canBeCompleted()
    {
        return $this->isDelivered();
    }
    
    public function canBeCancelledByUser()
    {
        return in_array($this->status, ['pending', 'admin_approved', 'seller_approved', 'in_progress']);
    }
    
    public function approveByAdmin($adminId, $notes = null)
    {
        if (!$this->canBeApprovedByAdmin()) {
            throw new \Exception('لا يمكن الموافقة على هذا الطلب في الوقت الحالي');
        }
        
        $this->update([
            'status' => 'admin_approved',
            'admin_approved_at' => now(),
            'admin_approved_by' => $adminId,
            'admin_notes' => $notes
        ]);
        
        $this->addToHistory('admin_approved', $adminId, 'admin_approval', $notes);
    }
    
    public function approveBySeller($notes = null)
    {
        if (!$this->canBeApprovedBySeller()) {
            throw new \Exception('لا يمكن الموافقة على هذا الطلب في الوقت الحالي');
        }
        
        $this->update([
            'status' => 'seller_approved',
            'seller_approved_at' => now(),
            'seller_notes' => $notes
        ]);
        
        $this->addToHistory('seller_approved', $this->seller->user_id, 'seller_approval', $notes);
    }
    
    public function startWork()
    {
        if (!$this->canStartWork()) {
            throw new \Exception('لا يمكن بدء العمل على هذا الطلب في الوقت الحالي');
        }
        
        $this->update([
            'status' => 'in_progress',
            'work_started_at' => now()
        ]);
        
        $this->addToHistory('in_progress', $this->seller->user_id, 'work_started');
    }
    
    public function completeWork($deliveryScheduledAt = null)
    {
        if (!$this->canCompleteWork()) {
            throw new \Exception('لا يمكن إكمال العمل على هذا الطلب في الوقت الحالي');
        }
        
        $this->update([
            'status' => 'ready_for_delivery',
            'work_completed_at' => now(),
            'delivery_scheduled_at' => $deliveryScheduledAt
        ]);
        
        $this->addToHistory('ready_for_delivery', $this->seller->user_id, 'work_completed');
    }
    
    public function pickUpByDelivery($deliveryPersonId, $notes = null)
    {
        if (!$this->canBePickedUpByDelivery()) {
            throw new \Exception('لا يمكن استلام هذا الطلب في الوقت الحالي');
        }
        
        $this->update([
            'status' => 'out_for_delivery',
            'delivery_person_id' => $deliveryPersonId,
            'delivery_picked_up_at' => now(),
            'delivery_notes' => $notes
        ]);
        
        $this->addToHistory('out_for_delivery', $deliveryPersonId, 'picked_up_by_delivery', $notes);
    }
    
    public function markAsDelivered($notes = null)
    {
        if (!$this->canBeDelivered()) {
            throw new \Exception('لا يمكن تسليم هذا الطلب في الوقت الحالي');  
        }
        
        $this->update([
            'status' => 'delivered',
            'delivered_at' => now(),
            'delivery_notes' => $this->delivery_notes . ($notes ? "\n" . $notes : '')
        ]);
        
        $this->addToHistory('delivered', $this->delivery_person_id, 'delivered', $notes);
    }
    
    public function markAsCompleted()
    {
        if (!$this->canBeCompleted()) {
            throw new \Exception('لا يمكن إكمال هذا الطلب في الوقت الحالي');
        }
        
        $this->update([
            'status' => 'completed',
            'completed_at' => now()
        ]);
        
        $this->addToHistory('completed', $this->user_id, 'order_completed');
    }
    
    public function cancel($userId, $reason = null)
    {
        $this->update([
            'status' => 'cancelled'
        ]);
        
        $this->addToHistory('cancelled', $userId, 'order_cancelled', $reason);
    }
    
    public function addToHistory($status, $actionBy, $actionType, $note = null)
    {
        $this->history()->create([
            'status' => $status,
            'action_by' => $actionBy,
            'action_type' => $actionType,
            'note' => $note,
            'created_at' => now()
        ]);
    }
    
    public function hasDepositPaid()
    {
        return $this->deposit_status === 'paid';
    }
    
    public function getRemainingAmount()
    {
        if (!$this->requires_deposit || $this->deposit_status !== 'paid') {
            return $this->total_price;
        }
        
        return $this->total_price - $this->deposit_amount;
    }
    
    public function getStatusLabel()
    {
        $statusLabels = [
            'pending' => 'قيد الانتظار',
            'admin_approved' => 'موافقة الإدارة',
            'seller_approved' => 'موافقة البائع',
            'in_progress' => 'جاري التنفيذ',
            'ready_for_delivery' => 'جاهز للتوصيل',
            'out_for_delivery' => 'قيد التوصيل',
            'delivered' => 'تم التوصيل',
            'completed' => 'مكتمل',
            'cancelled' => 'ملغي'
        ];
        
        return $statusLabels[$this->status] ?? $this->status;
    }
    
    public function getNextAction()
    {
        switch ($this->status) {
            case 'pending':
                return 'انتظار موافقة الإدارة';
            case 'admin_approved':
                return 'انتظار موافقة البائع';
            case 'seller_approved':
                return 'انتظار بدء العمل';
            case 'in_progress':
                return 'العمل قيد التنفيذ';
            case 'ready_for_delivery':
                return 'انتظار استلام الدليفري';
            case 'out_for_delivery':
                return 'قيد التوصيل';
            case 'delivered':
                return 'انتظار تأكيد العميل';
            case 'completed':
                return 'تم الإكمال';
            case 'cancelled':
                return 'ملغي';
            default:
                return 'غير محدد';
        }
    }
}
