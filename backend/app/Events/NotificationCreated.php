<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Notification;

class NotificationCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notification;
    public $userId;

    public function __construct(Notification $notification)
    {
        $this->notification = $notification;
        $this->userId = $notification->user_id;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('App.Models.User.' . $this->userId),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->notification->id,
            'type' => $this->notification->notification_type,
            'title' => $this->getNotificationTitle($this->notification->notification_type),
            'message' => $this->notification->message,
            'read' => $this->notification->is_read,
            'link' => $this->notification->link,
            'time' => $this->notification->created_at ? $this->notification->created_at->diffForHumans() : 'الآن',
            'createdAt' => $this->notification->created_at,
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'notification.created';
    }

    private function getNotificationTitle($type): string
    {
        $titles = [
            'order' => 'طلب جديد',
            'message' => 'رسالة جديدة',
            'review' => 'تقييم جديد',
            'payment' => 'دفعة مستلمة',
            'system' => 'إشعار النظام',
        ];
        return $titles[$type] ?? 'إشعار';
    }
}
