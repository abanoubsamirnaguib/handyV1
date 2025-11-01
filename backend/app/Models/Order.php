<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PlatformProfit;

class Order extends Model
{
    use HasFactory;
    protected $table = 'orders';
    protected $fillable = [
        'user_id',
        'seller_id',
        'status',
        'total_price',
        'buyer_proposed_price',
        'original_service_price',
        'price_approval_status',
        'price_approved_at',
        'price_approval_notes',
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
        'previous_status',
        'remaining_payment_proof',
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
        'city_id',
        'platform_commission_percent',
        'platform_commission_amount',
        'buyer_total',
        'seller_net_amount',
    ];
    
    protected $dates = [
        'order_date',
        'delivery_date',
        'admin_approved_at',
        'seller_approved_at',
        'price_approved_at',
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
    public $casts = [
        'requires_deposit' => 'boolean',
        'is_service_order' => 'boolean',
        'is_late' => 'boolean',
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
    
    public function city()
    {
        return $this->belongsTo(City::class);
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
        // إذا كان الطلب يحتاج موافقة البائع على السعر، لا يمكن للأدمن الموافقة عليه
        if ($this->isPendingSellerPriceApproval()) {
            return false;
        }
        
        // للطلبات العادية: يجب أن تكون pending ولها payment_proof أو cash_on_delivery
        $regularCondition = $this->isPending() && ($this->payment_method === 'cash_on_delivery' || $this->payment_proof);
        
        // للطلبات التي تحتوي على عربون: يجب أن تكون pending ولها deposit_image
        $depositCondition = $this->isPending() && $this->is_service_order && $this->deposit_image;
        
        // للطلبات التي رفع فيها المشتري صورة باقي المبلغ: يجب أن تكون pending ولها remaining_payment_proof
        $remainingPaymentCondition = $this->isPending() && $this->is_service_order && $this->remaining_payment_proof;
        
        return $regularCondition || $depositCondition || $remainingPaymentCondition;
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
        
        // إذا كان طلب خدمة ولديه صورة باقي المبلغ، نرجع للحالة السابقة
        if ($this->is_service_order && $this->remaining_payment_proof && $this->previous_status) {
            $this->update([
                'status' => $this->previous_status, // الرجوع للحالة السابقة
                'admin_approved_at' => now(),
                'admin_approved_by' => $adminId,
                'admin_notes' => $notes,
                'payment_status' => 'paid', // تأكيد أن الدفع النهائي تم
                'previous_status' => null // مسح الحالة السابقة
            ]);
        } else {
            // الموافقة العادية (على العربون أو الطلبات العادية)
            $this->update([
                'status' => 'admin_approved',
                'admin_approved_at' => now(),
                'admin_approved_by' => $adminId,
                'admin_notes' => $notes
            ]);
        }
        
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
        
        // إرسال إشعار للمشتري إذا كان هناك مبلغ متبقي للدفع
        if ($this->requires_deposit && $this->hasDepositPaid() && !$this->hasRemainingPaymentPaid()) {
            $this->notifyBuyerToPayRemaining();
        }
    }
    
    public function pickUpByDelivery($deliveryPersonId, $notes = null)
    {
        if (!$this->canBePickedUpByDelivery()) {
            throw new \Exception('لا يمكن استلام هذا الطلب في الوقت الحالي');
        }
        
        // بعد الاستلام من البائع، تتغير حالة الطلب إلى "out_for_delivery" في جميع الحالات
        $this->update([
            'status' => 'out_for_delivery',
            'delivery_picked_up_at' => now(),
            'pickup_notes' => $notes
        ]);
        
        $this->addToHistory('out_for_delivery', null, 'picked_up_by_delivery', $notes ? $notes . ' بواسطة الدليفري' : 'تم الاستلام بواسطة الدليفري');
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
        
        $this->addToHistory('delivered', null, 'delivered', $notes ? $notes . ' بواسطة الدليفري' : 'تم التسليم بواسطة الدليفري');
    }
    
    public function markAsCompleted()
    {
        if (!$this->canBeCompleted()) {
            throw new \Exception('لا يمكن إكمال هذا الطلب في الوقت الحالي');
        }
        
        // Calculate commission based on base price (before delivery)
        $basePrice = $this->total_price; // existing total_price is base subtotal
        $commissionPercent = $this->platform_commission_percent ?? optional($this->city)->platform_commission_percent ?? 0;
        $commissionAmount = round(($commissionPercent / 100) * $basePrice, 2);
        
        // Buyer total = base + delivery fee
        $deliveryFee = $this->delivery_fee ?? 0;
        $buyerTotal = round($basePrice + $deliveryFee, 2);
        
        // Seller net = base - commission (delivery fee goes to platform/delivery, not seller)
        $sellerNet = round($basePrice - $commissionAmount, 2);
        
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'platform_commission_percent' => $commissionPercent,
            'platform_commission_amount' => $commissionAmount,
            'buyer_total' => $buyerTotal,
            'seller_net_amount' => $sellerNet,
        ]);
        
        // Record platform profit row
        try {
            PlatformProfit::create([
                'order_id' => $this->id,
                'city_id' => $this->city_id,
                'seller_id' => $this->seller_id,
                'amount' => $commissionAmount,
                'commission_percent' => $commissionPercent,
                'calculated_on' => now(),
            ]);
        } catch (\Throwable $e) {
            // ignore and continue
        }
        
        // Transfer money to seller's wallet: seller gets net amount
        $this->seller->addToWallet($sellerNet);
        
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
        
        $this->addToHistory('suspended', null, 'order_suspended', $reason . ' بواسطة الدليفري');
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
    
    /**
     * إرسال إشعار للمشتري لدفع باقي المبلغ
     */
    public function notifyBuyerToPayRemaining()
    {
        $remainingAmount = $this->getRemainingAmount();
        $message = "تم إكمال العمل على طلبك #{$this->id}. يجب دفع باقي المبلغ ({$remainingAmount} جنيه) خلال 48 ساعة وإلا سيتم تحويل العربون للبائع وإلغاء الطلب.";
        
        \App\Services\NotificationService::create(
            $this->user_id,
            'payment_reminder',
            $message,
            "/orders/{$this->id}"
        );
        
        // تحديد وقت انتهاء صلاحية الدفع (48 ساعة) باستخدام completion_deadline
        $this->update([
            'completion_deadline' => now()->addHours(48)
        ]);
    }
    
    /**
     * التحقق من انتهاء مهلة الدفع وتطبيق العواقب
     */
    public function checkPaymentDeadlineExpired()
    {
        // التحقق من أن الطلب يتطلب دفع متبقي وأن المهلة انتهت
        if ($this->requires_deposit && 
            $this->hasDepositPaid() && 
            !$this->hasRemainingPaymentPaid() && 
            $this->completion_deadline && 
            now()->isAfter($this->completion_deadline) &&
            $this->status === 'ready_for_delivery') {
            
            // تحويل العربون للبائع
            $this->forfeitDepositToSeller();
            
            // تعليق الطلب
            $this->update([
                'status' => 'suspended',
                'suspended_at' => now(),
                'suspension_reason' => 'عدم دفع باقي المبلغ خلال المهلة المحددة - تم تحويل العربون للبائع'
            ]);
            
            $this->addToHistory('suspended', null, 'payment_deadline_expired', 'تم تعليق الطلب لعدم دفع باقي المبلغ خلال 48 ساعة');
            
            // إرسال إشعارات
            \App\Services\NotificationService::create(
                $this->user_id,
                'order_suspended',
                "تم تعليق طلبك #{$this->id} وتحويل العربون للبائع بسبب عدم دفع باقي المبلغ خلال المهلة المحددة.",
                "/orders/{$this->id}"
            );
            
            \App\Services\NotificationService::create(
                $this->seller->user_id,
                'deposit_transferred',
                "تم تحويل العربون من الطلب #{$this->id} إلى محفظتك بسبب عدم دفع العميل باقي المبلغ.",
                "/orders/{$this->id}"
            );
            
            return true;
        }
        
        return false;
    }
    
    /**
     * تحويل العربون للبائع
     */
    private function forfeitDepositToSeller()
    {
        if ($this->deposit_amount > 0) {
            // إضافة العربون لمحفظة البائع
            $this->seller->addToWallet($this->deposit_amount);
            
            // تسجيل العملية في تاريخ الطلب
            $this->addToHistory('deposit_transferred', null, 'deposit_forfeiture', "تم تحويل العربون ({$this->deposit_amount} جنيه) للبائع");
        }
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
    
    public function hasRemainingPaymentPaid()
    {
        // إذا كان هناك صورة إثبات دفع باقي المبلغ وتم اعتماد الطلب من الأدمن مرة أخرى
        return $this->remaining_payment_proof && $this->payment_status === 'paid';
    }
    
    public function isFullyPaid()
    {
        if (!$this->requires_deposit) {
            return $this->payment_status === 'paid';
        }
        
        return $this->hasDepositPaid() && $this->hasRemainingPaymentPaid();
    }
    
    public function canUploadRemainingPayment()
    {
        return $this->requires_deposit && 
               $this->hasDepositPaid() && 
               !$this->remaining_payment_proof &&  // لم يرفع صورة باقي المبلغ بعد
               in_array($this->status, [
                   'admin_approved', 
                   'seller_approved', 
                   'in_progress', 
                   'work_completed',
                   'ready_for_delivery',
                   'out_for_delivery',
                   'delivered'
               ]);
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

        $this->addToHistory('assigned_to_delivery', null, 'assigned_to_delivery', 'تم تعيين الطلب للدليفري بواسطة الأدمن');
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
    
    // ==================== Price Negotiation Methods ====================
    
    /**
     * التحقق من أن الطلب في انتظار موافقة البائع على السعر المقترح
     */
    public function isPendingSellerPriceApproval()
    {
        return $this->price_approval_status === 'pending_approval' && 
               $this->buyer_proposed_price !== null;
    }
    
    /**
     * التحقق من أن البائع وافق على السعر المقترح
     */
    public function isPriceApprovedBySeller()
    {
        return $this->price_approval_status === 'approved';
    }
    
    /**
     * التحقق من أن البائع رفض السعر المقترح
     */
    public function isPriceRejectedBySeller()
    {
        return $this->price_approval_status === 'rejected';
    }
    
    /**
     * موافقة البائع على السعر المقترح
     */
    public function approveProposedPrice($notes = null)
    {
        if (!$this->isPendingSellerPriceApproval()) {
            throw new \Exception('لا يوجد سعر مقترح في انتظار الموافقة');
        }
        
        // تحديث السعر الكلي بالسعر المقترح
        $this->update([
            'total_price' => $this->buyer_proposed_price,
            'price_approval_status' => 'approved',
            'price_approved_at' => now(),
            'price_approval_notes' => $notes
        ]);
        
        // تحديث سعر العنصر في order_items أيضاً
        $this->items()->first()->update([
            'price' => $this->buyer_proposed_price,
            'subtotal' => $this->buyer_proposed_price
        ]);
        
        $this->addToHistory('price_approved', $this->seller->user_id, 'seller_price_approval', 
            $notes ? "وافق البائع على السعر المقترح: {$this->buyer_proposed_price} ج.م. {$notes}" 
                   : "وافق البائع على السعر المقترح: {$this->buyer_proposed_price} ج.م");
    }
    
    /**
     * رفض البائع للسعر المقترح
     */
    public function rejectProposedPrice($reason = null)
    {
        if (!$this->isPendingSellerPriceApproval()) {
            throw new \Exception('لا يوجد سعر مقترح في انتظار الموافقة');
        }
        // Refund deposit to buyer if paid
        if ($this->requires_deposit && $this->hasDepositPaid() && $this->deposit_amount > 0) {
            try {
                $this->user->addToBuyerWallet($this->deposit_amount);
                $this->addToHistory('refunded', $this->seller->user_id, 'deposit_refunded', 'تم رد العربون إلى محفظة المشتري بعد رفض السعر المقترح');
                $this->update(['deposit_status' => 'refunded']);
            } catch (\Throwable $e) {
                // continue updating status even if refund log fails
            }
        }

        $this->update([
            'price_approval_status' => 'rejected',
            'price_approved_at' => now(),
            'price_approval_notes' => $reason,
            'status' => 'cancelled'
        ]);
        
        $this->addToHistory('price_rejected', $this->seller->user_id, 'seller_price_rejection', 
            $reason ? "رفض البائع السعر المقترح: {$reason}" 
                    : "رفض البائع السعر المقترح");
    }
    
    /**
     * الحصول على السعر الفعلي المعتمد
     */
    public function getFinalPrice()
    {
        // إذا كان هناك سعر مقترح وتمت الموافقة عليه
        if ($this->buyer_proposed_price && $this->isPriceApprovedBySeller()) {
            return $this->buyer_proposed_price;
        }
        
        // السعر الأصلي
        return $this->total_price;
    }
    
    /**
     * التحقق من أن الخدمة قابلة للتفاوض (السعر الأصلي 0)
     */
    public function isNegotiableService()
    {
        return $this->is_service_order && 
               $this->original_service_price !== null && 
               $this->original_service_price == 0;
    }
}
