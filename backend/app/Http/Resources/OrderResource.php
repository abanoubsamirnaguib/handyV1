<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request)
    {
        $user = $request->user();
        $isAdmin = $user && ($user->role === 'admin');
        $isSellerOwner = $user && $user->seller && ($user->seller->id === $this->seller_id);

        $base = [
            'id' => $this->id,
            'user' => new UserResource(resource: $this->whenLoaded('user')),
            'seller' => new SellerResource($this->whenLoaded('seller')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'status' => $this->status,
            'status_label' => $this->getStatusLabel(),
            'status_ar' => $this->getStatusLabel(), // For OrderDetailPage compatibility
            'next_action' => $this->getNextAction(),
            'total_price' => $this->total_price,
            'total_amount' => ($this->buyer_total ?? ($this->total_price + ($this->delivery_fee ?? 0))), // For AdminOrders compatibility
            'order_date' => $this->order_date,
            'delivery_date' => $this->delivery_date,
            'expected_delivery_date' => $this->delivery_date, // For OrderDetailPage compatibility
            'requirements' => $this->requirements,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'delivery_address' => $this->delivery_address,
            'payment_method' => $this->payment_method,
            'payment_method_ar' => $this->getPaymentMethodLabel(),
            'payment_status' => $this->payment_status,
            'requires_deposit' => $this->requires_deposit,
            'deposit_amount' => $this->deposit_amount,
            'deposit_status' => $this->deposit_status,
            'deposit_notes' => $this->deposit_notes,
            'deposit_image' => $this->deposit_image ? asset('storage/' . $this->deposit_image) : null, // return path only
            'deposit_image_url' => $this->deposit_image ? asset('storage/' . $this->deposit_image) : null,
            'remaining_payment_proof' => $this->remaining_payment_proof ? asset('storage/' . $this->remaining_payment_proof) : null, // return path only
            'remaining_payment_proof_url' => $this->remaining_payment_proof ? asset('storage/' . $this->remaining_payment_proof) : null,
            'is_service_order' => $this->is_service_order,
            'service_requirements' => $this->service_requirements,
            'chat_conversation_id' => $this->chat_conversation_id,
            'conversation' => $this->whenLoaded('conversation'),
            
            // الحقول الجديدة
            'payment_proof' => $this->payment_proof ? asset('storage/' . $this->payment_proof) : null, // return path only
            'payment_proof_path' => $this->payment_proof ? asset('storage/' . $this->payment_proof) : nullp,
            'admin_approved_at' => $this->admin_approved_at,
            'admin_approved_by' => $this->admin_approved_by,
            'admin_approver' => new UserResource($this->whenLoaded('adminApprover')),
            'seller_approved_at' => $this->seller_approved_at,
            'work_started_at' => $this->work_started_at,
            'work_completed_at' => $this->work_completed_at,
            'delivery_scheduled_at' => $this->delivery_scheduled_at,
            'delivery_picked_up_at' => $this->delivery_picked_up_at,
            'delivered_at' => $this->delivered_at,
            'completed_at' => $this->completed_at,
            'delivery_person_id' => $this->delivery_person_id,
            'delivery_person' => new UserResource($this->whenLoaded('deliveryPerson')),
            'delivery_notes' => $this->delivery_notes,
            'admin_notes' => $this->admin_notes,
            'seller_notes' => $this->seller_notes,
            'seller_address' => $this->seller_address,
            'completion_deadline' => $this->completion_deadline,
            'is_late' => $this->is_late,
            'late_reason' => $this->late_reason,
            'time_remaining' => $this->getTimeRemaining(),
            'suspended_at' => $this->suspended_at,
            'suspension_reason' => $this->suspension_reason,
            
            // تاريخ الطلب
            'history' => OrderHistoryResource::collection($this->whenLoaded('history')),
            
            // معلومات إضافية
            'can_be_approved_by_admin' => $this->canBeApprovedByAdmin(),
            'can_be_approved_by_seller' => $this->canBeApprovedBySeller(),
            'can_start_work' => $this->canStartWork(),
            'can_complete_work' => $this->canCompleteWork(),
            'can_be_picked_up_by_delivery' => $this->canBePickedUpByDelivery(),
            'can_be_delivered' => $this->canBeDelivered(),
            'can_be_completed' => $this->canBeCompleted(),
            
            // التوقيتات بصيغة قابلة للقراءة
            'timeline' => $this->getTimeline(),
            
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // المدينة والعمولة
            'city_id' => $this->city_id,
            'city' => $this->relationLoaded('city') ? new CityResource($this->city) : null,
            'delivery_fee' => $this->delivery_fee,
            'buyer_total' => $this->buyer_total ?? ($this->total_price + ($this->delivery_fee ?? 0)),
        ];

        if ($isAdmin || $isSellerOwner) {
            $base['platform_commission_percent'] = $this->platform_commission_percent;
            $base['platform_commission_amount'] = $this->platform_commission_amount;
            $base['seller_net_amount'] = $this->seller_net_amount;
        }

        return $base;
    }
    
    private function getTimeline()
    {
        $timeline = [];
        
        if ($this->created_at) {
            $timeline[] = [
                'status' => 'order_created',
                'label' => 'تم إنشاء الطلب',
                'date' => $this->created_at,
                'completed' => true
            ];
        }
        
        if ($this->admin_approved_at) {
            $timeline[] = [
                'status' => 'admin_approved',
                'label' => 'موافقة الإدارة',
                'date' => $this->admin_approved_at,
                'completed' => true
            ];
        }
        
        if ($this->seller_approved_at) {
            $timeline[] = [
                'status' => 'seller_approved',
                'label' => 'موافقة البائع',
                'date' => $this->seller_approved_at,
                'completed' => true
            ];
        }
        
        if ($this->work_started_at) {
            $timeline[] = [
                'status' => 'work_started',
                'label' => 'بدء العمل',
                'date' => $this->work_started_at,
                'completed' => true
            ];
        }
        
        if ($this->work_completed_at) {
            $timeline[] = [
                'status' => 'work_completed',
                'label' => 'إكمال العمل',
                'date' => $this->work_completed_at,
                'completed' => true
            ];
        }
        
        if ($this->delivery_picked_up_at) {
            $timeline[] = [
                'status' => 'picked_up',
                'label' => 'استلام الدليفري',
                'date' => $this->delivery_picked_up_at,
                'completed' => true
            ];
        }
        
        if ($this->delivered_at) {
            $timeline[] = [
                'status' => 'delivered',
                'label' => 'تم التوصيل',
                'date' => $this->delivered_at,
                'completed' => true
            ];
        }
        
        if ($this->completed_at) {
            $timeline[] = [
                'status' => 'completed',
                'label' => 'إكمال الطلب',
                'date' => $this->completed_at,
                'completed' => true
            ];
        }
        
        return $timeline;
    }
    
    private function getPaymentMethodLabel()
    {
        $paymentMethods = [
            'cash_on_delivery' => 'الدفع عند الاستلام',
            'bank_transfer' => 'تحويل بنكي',
            'credit_card' => 'بطاقة ائتمان',
            'vodafone_cash' => 'فودافون كاش',
            'instapay' => 'انستاباي',
            'orange_cash' => 'أورانج كاش',
            'etisalat_cash' => 'اتصالات كاش'
        ];
        
        return $paymentMethods[$this->payment_method] ?? $this->payment_method;
    }
}
