<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'image' => $this->image,
            'type' => $this->type,
            'priority' => $this->priority,
            'is_active' => $this->is_active,
            'is_visible' => $this->is_visible,
            'status' => $this->status,
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'creator' => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ],
            'formatted_dates' => [
                'created_at_human' => $this->created_at->diffForHumans(),
                'starts_at_formatted' => $this->starts_at ? $this->starts_at->format('Y-m-d H:i') : null,
                'ends_at_formatted' => $this->ends_at ? $this->ends_at->format('Y-m-d H:i') : null,
            ],
            'type_info' => [
                'label' => $this->getTypeLabel(),
                'color' => $this->getTypeColor(),
                'icon' => $this->getTypeIcon(),
            ],
            'priority_info' => [
                'label' => $this->getPriorityLabel(),
                'color' => $this->getPriorityColor(),
            ]
        ];
    }

    /**
     * Get type label in Arabic
     */
    private function getTypeLabel(): string
    {
        return match($this->type) {
            'info' => 'معلومات',
            'warning' => 'تحذير',
            'success' => 'نجاح',
            'error' => 'خطأ',
            default => 'معلومات'
        };
    }

    /**
     * Get type color class
     */
    private function getTypeColor(): string
    {
        return match($this->type) {
            'info' => 'bg-blue-100 text-blue-800',
            'warning' => 'bg-yellow-100 text-yellow-800',
            'success' => 'bg-green-100 text-green-800',
            'error' => 'bg-red-100 text-red-800',
            default => 'bg-blue-100 text-blue-800'
        };
    }

    /**
     * Get type icon
     */
    private function getTypeIcon(): string
    {
        return match($this->type) {
            'info' => 'info',
            'warning' => 'alert-triangle',
            'success' => 'check-circle',
            'error' => 'alert-circle',
            default => 'info'
        };
    }

    /**
     * Get priority label in Arabic
     */
    private function getPriorityLabel(): string
    {
        return match($this->priority) {
            'low' => 'منخفضة',
            'medium' => 'متوسطة',
            'high' => 'عالية',
            default => 'متوسطة'
        };
    }

    /**
     * Get priority color class
     */
    private function getPriorityColor(): string
    {
        return match($this->priority) {
            'low' => 'bg-gray-100 text-gray-800',
            'medium' => 'bg-blue-100 text-blue-800',
            'high' => 'bg-red-100 text-red-800',
            default => 'bg-blue-100 text-blue-800'
        };
    }
} 