<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderHistoryResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'status' => $this->status,
            'status_label' => $this->getStatusLabel(),
            'action_by' => $this->action_by,
            'action_user_id' => $this->action_by, // استخدام action_by كـ action_user_id
            'action_user' => $this->when($this->action_by, function() {
                return $this->whenLoaded('actionUser', function() {
                    return $this->actionUser ? new UserResource($this->actionUser) : null;
                });
            }),
            'action_type' => $this->action_type,
            'action_type_label' => $this->getActionTypeLabel(),
            'action_type_ar' => $this->getActionTypeLabel(), // For frontend compatibility
            'note' => $this->note,
            'notes' => $this->note, // For frontend compatibility
            'old_status' => $this->extractOldStatus(), // استخراج من النص
            'new_status' => $this->status, // استخدام status الحالي
            'created_at' => $this->created_at,
            'date' => $this->created_at, // For frontend compatibility
        ];
    }
    
    private function getStatusLabel()
    {
        $statusLabels = [
            'pending' => 'قيد الانتظار',
            'admin_approved' => 'موافقة الإدارة',
            'seller_approved' => 'موافقة البائع',
            'ready_for_delivery' => 'جاهز للتوصيل',
            'out_for_delivery' => 'قيد التوصيل',
            'delivered' => 'تم التوصيل',
            'completed' => 'مكتمل',
            'cancelled' => 'ملغي',
            'suspended' => 'معلق',
            'assigned_to_pickup' => 'تعيين موظف الاستلام',
            'assigned_to_delivery' => 'تعيين موظف التسليم'
        ];
        
        return $statusLabels[$this->status] ?? $this->status;
    }
    
    private function getActionTypeLabel()
    {
        $actionTypeLabels = [
            'order_created' => 'إنشاء الطلب',
            'service_order_created' => 'إنشاء طلب خدمة',
            'admin_approval' => 'موافقة الإدارة',
            'seller_approval' => 'موافقة البائع',
            'work_completed' => 'إكمال العمل',
            'picked_up_by_delivery' => 'استلام الدليفري',
            'delivered' => 'التوصيل',
            'delivery' => 'التوصيل',
            'order_completed' => 'إكمال الطلب',
            'order_cancelled' => 'إلغاء الطلب',
            'order_suspended' => 'تعليق الطلب',
            'assigned_to_pickup' => 'تعيين موظف الاستلام',
            'assigned_to_delivery' => 'تعيين موظف التسليم',
            'status_changed_by_admin' => 'تم تغيير الحالة بواسطة الإدارة'
        ];
        
        return $actionTypeLabels[$this->action_type] ?? $this->action_type;
    }

    // استخراج الحالة القديمة من النص
    private function extractOldStatus()
    {
        if (!$this->note || !str_contains($this->note, 'تم تغيير الحالة من')) {
            return null;
        }
        
        // استخراج النص بين 'من' و 'إلى'
        $pattern = "/تم تغيير الحالة من '(.+?)' إلى/";
        if (preg_match($pattern, $this->note, $matches)) {
            return $this->getStatusKeyFromArabic($matches[1]);
        }
        
        return null;
    }

    // تحويل النص العربي إلى مفتاح الحالة
    private function getStatusKeyFromArabic($arabicStatus)
    {
        $statusMap = [
            'بانتظار المراجعة' => 'pending',
            'معتمد من الإدارة' => 'admin_approved',
            'مقبول من البائع' => 'seller_approved',
            'جاهز للتوصيل' => 'ready_for_delivery',
            'في الطريق' => 'out_for_delivery',
            'تم التوصيل' => 'delivered',
            'مكتمل' => 'completed',
            'ملغى' => 'cancelled',
            'معلق' => 'suspended'
        ];
        
        return $statusMap[$arabicStatus] ?? null;
    }
} 