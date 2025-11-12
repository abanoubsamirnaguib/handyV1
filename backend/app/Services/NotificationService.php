<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Events\NotificationCreated;
use App\Traits\EmailTrait;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    use EmailTrait;

    /**
     * Create a new notification for a user
     */
    public static function create(int $userId, string $type, string $message, ?string $link = null): Notification
    {
        $notification = Notification::create([
            'user_id' => $userId,
            'notification_type' => $type,
            'message' => $message,
            'link' => $link,
            'is_read' => false,
        ]);

        // Fire the notification event for real-time broadcasting
        event(new NotificationCreated($notification));

        // Send email notification if user has enabled email notifications
        $user = User::find($userId);
        if ($user && $user->email_notifications) {
            self::sendEmailNotification($user, $message, $link);
        }

        return $notification;
    }

    /**
     * Send email notification to user
     */
    private static function sendEmailNotification(User $user, string $message, ?string $link = null): void
    {
        try {
            // Build full URL if link is provided
            $fullLink = $link ? env('FRONTEND_URL', 'http://localhost:5173') . $link : null;
            
            $data = [
                'user_name' => $user->name,
                'message' => $message,
                'link' => $fullLink,
            ];

            self::sendMail(
                'إشعار جديد من منصة بازار',
                $user->email,
                $data,
                'emails.notification'
            );

            Log::info('Email notification sent successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send email notification', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Create a welcome notification for new user
     */
    public static function welcome(int $userId, string $userName, bool $isSeller = false): Notification
    {
        $message = $isSeller 
            ? "مرحباً {$userName}! 🎉 نحن سعداء بانضمامك كبائع. يمكنك الآن البدء في عرض منتجاتك وخدماتك!"
            : "مرحباً {$userName}! 🎉 نحن سعداء بانضمامك إلى بازار. ابدأ الآن في استكشاف المنتجات والخدمات المميزة!";
        
        return self::create(
            userId: $userId,
            type: 'system',
            message: $message,
            link: '/dashboard'
        );
    }

    /**
     * Create an order notification
     */
    public static function orderCreated(int $userId, int $orderId): Notification
    {
        return self::create(
            userId: $userId,
            type: 'order',
            message: "تم إنشاء طلب جديد برقم #{$orderId}",
            link: "/orders/{$orderId}"
        );
    }

    /**
     * Create a product pending review notification
     */
    public static function productPendingReview(int $userId, string $productTitle, string $productType = 'منتج'): Notification
    {
        $typeText = $productType === 'gig' ? 'خدمة' : 'منتج';
        $message = "تم إضافة {$typeText} بعنوان \"{$productTitle}\". 
الآن قيد المراجعة لدى الإدارة، وعادةً ما تستغرق الموافقة والنشر حوالي 48–72 ساعة.";
        
        return self::create(
            userId: $userId,
            type: 'product_pending',
            message: $message,
            link: '/dashboard/gigs'
        );
    }

    /**
     * Create a product approved notification
     */
    public static function productApproved(int $userId, string $productTitle, string $productType = 'منتج'): Notification
    {
        $typeText = $productType === 'gig' ? 'خدمتك' : 'منتجك';
        $message = "🎉 تم تفعيل {$typeText}: \"{$productTitle}\" وأصبح متاحاً للعملاء الآن!";
        
        return self::create(
            userId: $userId,
            type: 'product_approved',
            message: $message,
            link: '/dashboard/gigs'
        );
    }

    /**
     * Create a message notification
     */
    public static function messageReceived(int $userId, string $senderName): Notification
    {
        return self::create(
            userId: $userId,
            type: 'message',
            message: "لديك رسالة جديدة من {$senderName}",
            link: "/chat"
        );
    }

    /**
     * Create a review notification
     */
    public static function reviewReceived(int $userId, int $productId, int $stars): Notification
    {
        return self::create(
            userId: $userId,
            type: 'review',
            message: "تم تقييم منتجك بـ {$stars} نجوم",
            link: "/gigs/{$productId}"
        );
    }

    /**
     * Create a payment notification
     */
    public static function paymentReceived(int $userId, float $amount): Notification
    {
        return self::create(
            userId: $userId,
            type: 'payment',
            message: "تم استلام دفعة بقيمة {$amount} جنيه",
            link: "/dashboard/earnings"
        );
    }

    /**
     * Create a deposit notification
     */
    public static function depositReceived(int $userId, float $amount, int $orderId): Notification
    {
        return self::create(
            userId: $userId,
            type: 'payment',
            message: "تم استلام عربون بقيمة {$amount} جنيه لطلب #{$orderId}",
            link: "/orders/{$orderId}"
        );
    }

    /**
     * Create a system notification
     */
    public static function systemNotification(int $userId, string $message, ?string $link = null): Notification
    {
        return self::create(
            userId: $userId,
            type: 'system',
            message: $message,
            link: $link
        );
    }

    /**
     * Broadcast notification to multiple users
     */
    public static function broadcast(array $userIds, string $type, string $message, ?string $link = null): array
    {
        $notifications = [];
        foreach ($userIds as $userId) {
            $notifications[] = self::create($userId, $type, $message, $link);
        }
        return $notifications;
    }

    /**
     * Mark all notifications as read for a user
     */
    public static function markAllAsRead(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);
    }

    /**
     * Get unread count for a user
     */
    public static function getUnreadCount(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->count();
    }

    /**
     * Delete old notifications (older than specified days)
     */
    public static function cleanupOldNotifications(int $days = 30): int
    {
        return Notification::where('created_at', '<', now()->subDays($days))->delete();
    }
}
