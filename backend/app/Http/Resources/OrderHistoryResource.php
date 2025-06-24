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
            'action_user' => new UserResource($this->whenLoaded('actionUser')),
            'action_type' => $this->action_type,
            'action_type_label' => $this->getActionTypeLabel(),
            'action_type_ar' => $this->getActionTypeLabel(), // For frontend compatibility
            'note' => $this->note,
            'notes' => $this->note, // For frontend compatibility
            'created_at' => $this->created_at,
        ];
    }
    
    private function getStatusLabel()
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
    
    private function getActionTypeLabel()
    {
        $actionTypeLabels = [
            'order_created' => 'إنشاء الطلب',
            'admin_approval' => 'موافقة الإدارة',
            'seller_approval' => 'موافقة البائع',
            'work_started' => 'بدء العمل',
            'work_completed' => 'إكمال العمل',
            'picked_up_by_delivery' => 'استلام الدليفري',
            'delivered' => 'التوصيل',
            'order_completed' => 'إكمال الطلب',
            'order_cancelled' => 'إلغاء الطلب'
        ];
        
        return $actionTypeLabels[$this->action_type] ?? $this->action_type;
    }
} 