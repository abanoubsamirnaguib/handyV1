<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\SiteSetting;
use App\Events\NotificationCreated;
use App\Traits\EmailTrait;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    use EmailTrait;

    /**
     * Check if notification type is enabled for users
     */
    private static function isUserNotificationEnabled(string $type): bool
    {
        $settingKey = 'user_notif_' . $type;
        $setting = SiteSetting::where('setting_key', $settingKey)->first();
        
        // Default to true if setting doesn't exist
        return $setting ? $setting->setting_value === 'true' : true;
    }

    /**
     * Check if admin notification type is enabled
     */
    private static function isAdminNotificationEnabled(string $type): bool
    {
        $settingKey = 'admin_notif_' . $type;
        $setting = SiteSetting::where('setting_key', $settingKey)->first();
        
        // Default to true if setting doesn't exist
        return $setting ? $setting->setting_value === 'true' : true;
    }

    /**
     * Get admin notification email
     */
    private static function getAdminNotificationEmail(): ?string
    {
        $setting = SiteSetting::where('setting_key', 'admin_notification_email')->first();
        return $setting ? $setting->setting_value : null;
    }

    /**
     * Get admin notification delivery preference
     */
    private static function getAdminNotificationDelivery(): string
    {
        $setting = SiteSetting::where('setting_key', 'admin_notification_delivery')->first();
        return $setting ? $setting->setting_value : 'both'; // default: both
    }

    /**
     * Send notification to admin(s)
     */
    public static function notifyAdmin(string $type, string $message, ?string $link = null): void
    {
        // Check if this admin notification type is enabled
        if (!self::isAdminNotificationEnabled($type)) {
            return;
        }

        // Get delivery preference
        $deliveryMethod = self::getAdminNotificationDelivery();
        
        // إرسال الإشعار داخل لوحة التحكم (إذا كان الخيار: both أو dashboard)
        if (in_array($deliveryMethod, ['both', 'dashboard'])) {
            // Send to all admin users (role = 'admin')
            $adminUsers = User::where('role', 'admin')->get();
            
            if ($adminUsers->isEmpty()) {
                Log::warning('No admin users found for notification', ['type' => $type]);
                return;
            }
            
            foreach ($adminUsers as $admin) {
                // Create in-site notification
                $notification = Notification::create([
                    'user_id' => $admin->id,
                    'notification_type' => 'admin_' . $type,
                    'message' => $message,
                    'link' => $link,
                    'is_read' => false,
                ]);

                // Fire the notification event for real-time broadcasting
                event(new NotificationCreated($notification));
            }
            
            Log::info('Admin dashboard notification sent', [
                'type' => $type,
                'admin_count' => $adminUsers->count(),
            ]);
        }

        // إرسال الإشعار عبر البريد الإلكتروني (إذا كان الخيار: both أو email)
        if (in_array($deliveryMethod, ['both', 'email'])) {
            // Get admin email
            $adminEmail = self::getAdminNotificationEmail();
            if (!$adminEmail) {
                Log::warning('Admin notification email not configured', ['type' => $type]);
                // Don't return here - dashboard notification might still be sent
            } else {
                try {
                    $fullLink = $link ? rtrim(env('FRONTEND_URL', request()->getSchemeAndHttpHost()), '/') . $link : null;
                    
                    $data = [
                        'message' => $message,
                        'link' => $fullLink,
                    ];

                    self::sendMail(
                        'إشعار إداري - منصة بازار',
                        $adminEmail,
                        $data,
                        'emails.admin-notification'
                    );

                    Log::info('Admin email notification sent successfully', [
                        'email' => $adminEmail,
                        'type' => $type,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to send admin email notification', [
                        'email' => $adminEmail,
                        'type' => $type,
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }
    }

    /**
     * Create a new notification for a user
     */
    public static function create(int $userId, string $type, string $message, ?string $link = null): Notification
    {
        // Check if this notification type is enabled for users
        if (!self::isUserNotificationEnabled($type)) {
            // Still create the notification but don't send email
            $notification = Notification::create([
                'user_id' => $userId,
                'notification_type' => $type,
                'message' => $message,
                'link' => $link,
                'is_read' => false,
            ]);
            
            // Fire the notification event for real-time broadcasting
            event(new NotificationCreated($notification));
            
            return $notification;
        }

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
            $fullLink = $link ? env('FRONTEND_URL', request()->getSchemeAndHttpHost()) . $link : null;
            
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
     * Create a product rejected notification
     */
    public static function productRejected(int $userId, string $productTitle, string $productType = 'منتج', string $rejectionReason = ''): Notification
    {
        $typeText = $productType === 'gig' ? 'خدمتك' : 'منتجك';
        $reasonText = $rejectionReason ? "\n\nسبب الرفض: {$rejectionReason}" : '';
        $message = "❌ تم رفض {$typeText}: \"{$productTitle}\".{$reasonText}\n\nيرجى مراجعة السبب وإعادة إنشاء المنتج/الخدمة مرة أخرى.";
        
        return self::create(
            userId: $userId,
            type: 'product_rejected',
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
     * Notify admin about a chat report
     */
    public static function chatReported(int $conversationId, string $reporterName, string $reason): Notification
    {
        $message = "تم الإبلاغ عن محادثة من المستخدم {$reporterName}. السبب: {$reason}";
        $link = "/admin/messages";
        
        // Notify all admins
        self::notifyAdmin('chat_report', $message, $link);
        
        // Return a notification object for the first admin (for broadcasting)
        $admin = User::where('role', 'admin')->first();
        if ($admin) {
            return self::create(
                userId: $admin->id,
                type: 'admin_chat_report',
                message: $message,
                link: $link
            );
        }
        
        // Return a dummy notification if no admin found (shouldn't happen)
        return Notification::create([
            'user_id' => 0,
            'notification_type' => 'admin_chat_report',
            'message' => $message,
            'link' => $link,
            'is_read' => false,
        ]);
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
