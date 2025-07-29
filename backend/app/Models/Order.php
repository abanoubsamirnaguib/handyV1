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
        'deposit_image',
        'is_service_order',
        'service_requirements',
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
        'suspended_at',
        'delivery_person_id',
        'pickup_person_id',
        'pickup_notes',
        'delivery_fee',
        'delivery_fee_status',
        'delivery_notes',
        'admin_notes',
        'seller_notes',
        'suspension_reason',
        'seller_address',
        'completion_deadline',
        'is_late',
        'late_reason',
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
        'suspended_at',
        'completion_deadline',
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
        return $this->belongsTo(DeliveryPersonnel::class, 'delivery_person_id');
    }

    public function pickupPerson()
    {
        return $this->belongsTo(DeliveryPersonnel::class, 'pickup_person_id');
    }

    public function deliveryEarnings()
    {
        return $this->hasMany(DeliveryEarning::class);
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
    
    public function isSuspended()
    {
        return $this->status === 'suspended';
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
    
    public function canBeSuspended()
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
    
    public function approveBySeller($notes = null, $sellerAddress = null, $completionDeadline = null)
    {
        if (!$this->canBeApprovedBySeller()) {
            throw new \Exception('لا يمكن الموافقة على هذا الطلب في الوقت الحالي');
        }
        
        if (empty($sellerAddress)) {
            throw new \Exception('عنوان البائع مطلوب لقبول الطلب');
        }
        
        if (empty($completionDeadline)) {
            throw new \Exception('موعد إنهاء العمل مطلوب لقبول الطلب');
        }
        
        $this->update([
            'status' => 'seller_approved',
            'seller_approved_at' => now(),
            'seller_notes' => $notes,
            'seller_address' => $sellerAddress,
            'completion_deadline' => $completionDeadline
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
            'delivery_scheduled_at' => $deliveryScheduledAt,
            'is_late' => false, // إيقاف الحالة المتأخرة عند إكمال العمل
            'late_reason' => null
        ]);
        
        $this->addToHistory('ready_for_delivery', $this->seller->user_id, 'work_completed');
    }
    
    public function pickUpByDelivery($deliveryPersonId, $notes = null)
    {
        if (!$this->canBePickedUpByDelivery()) {
            throw new \Exception('لا يمكن استلام هذا الطلب في الوقت الحالي');
        }
        
        // إذا كان الشخص نفسه معين للاستلام والتسليم، نقوم بالتحويل لـ out_for_delivery
        // إذا كان معين فقط للاستلام، نبقي الطلب ready_for_delivery مع تسجيل الاستلام
        if ($this->pickup_person_id == $deliveryPersonId && $this->delivery_person_id == $deliveryPersonId) {
            $this->update([
                'status' => 'out_for_delivery',
                'delivery_picked_up_at' => now(),
                'pickup_notes' => $notes
            ]);
            $this->addToHistory('out_for_delivery', $deliveryPersonId, 'picked_up_by_delivery', $notes);
        } else {
            // الاستلام فقط - الطلب يبقى ready_for_delivery لتعيين موظف التسليم
            $this->update([
                'delivery_picked_up_at' => now(),
                'pickup_notes' => $notes
            ]);
            $this->addToHistory('ready_for_delivery', $deliveryPersonId, 'picked_up_by_delivery', $notes);
        }
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
        
        // Transfer money to seller's wallet
        $this->seller->addToWallet($this->total_price);
        
        $this->addToHistory('completed', $this->user_id, 'order_completed');
    }
    
    public function cancel($userId, $reason = null)
    {
        $this->update([
            'status' => 'cancelled'
        ]);
        
        $this->addToHistory('cancelled', $userId, 'order_cancelled', $reason);
    }
    
    public function suspend($deliveryPersonId, $reason = null)
    {
        if (!$this->canBeSuspended()) {
            throw new \Exception('لا يمكن تعليق هذا الطلب في الوقت الحالي');
        }
        
        $this->update([
            'status' => 'suspended',
            'suspended_at' => now(),
            'suspension_reason' => $reason
        ]);
        
        $this->addToHistory('suspended', $deliveryPersonId, 'order_suspended', $reason);
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
            'cancelled' => 'ملغي',
            'suspended' => 'معلق'
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
            case 'suspended':
                return 'معلق - لم يتم الوصول للعميل';
            default:
                return 'غير محدد';
        }
    }

    // تعيين الطلب للدليفري
    public function assignToDelivery($deliveryPersonId)
    {
        if (!$this->isReadyForDelivery()) {
            throw new \Exception('الطلب غير جاهز للتوصيل');
        }

        $this->update([
            'delivery_person_id' => $deliveryPersonId,
            'delivery_scheduled_at' => now()
        ]);

        $this->addToHistory('assigned_to_delivery', $deliveryPersonId, 'assigned_to_delivery', 'تم تعيين الطلب للدليفري');
    }

    // التحقق من تأخير الطلب
    public function checkIfLate()
    {
        if (!$this->completion_deadline || $this->isCompleted() || $this->isCancelled()) {
            return false;
        }

        // الطلب يصبح متأخر إذا تجاوز الموعد المحدد ولم يصل لحالة "جاهز للتوصيل" بعد
        $isLate = now()->gt($this->completion_deadline) && 
                  in_array($this->status, ['seller_approved', 'in_progress']) && 
                  !$this->isReadyForDelivery();
        
        if ($isLate && !$this->is_late) {
            $this->update(['is_late' => true]);
        }
        
        return $isLate;
    }

    // الحصول على الوقت المتبقي لإنجاز الطلب
    public function getTimeRemaining()
    {
        if (!$this->completion_deadline || $this->isCompleted() || $this->isCancelled()) {
            return null;
        }

        $now = now();
        $deadline = \Carbon\Carbon::parse($this->completion_deadline);

        // إذا تجاوزنا الموعد ولم نصل لحالة "جاهز للتوصيل"
        if ($now->gt($deadline) && !$this->isReadyForDelivery()) {
            return ['is_late' => true, 'overdue_hours' => $now->diffInHours($deadline)];
        }

        // إذا وصلنا لحالة "جاهز للتوصيل" فالطلب لم يعد متأخراً
        if ($this->isReadyForDelivery() || $this->isOutForDelivery() || $this->isDelivered()) {
            return null;
        }

        return [
            'is_late' => false,
            'days' => $now->diffInDays($deadline, false),
            'hours' => $now->diffInHours($deadline) % 24,
            'total_hours' => $now->diffInHours($deadline)
        ];
    }
}
