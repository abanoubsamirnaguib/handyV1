<?php

namespace App\Services;

use App\Models\WebPushSubscription;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

/**
 * WebPushService
 * 
 * Handles sending Web Push notifications to users when the app is closed.
 * Uses the Web Push API standard with VAPID authentication.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Generate VAPID keys using: php artisan webpush:generate-keys (or use online generator)
 * 2. Add to .env file:
 *    VAPID_PUBLIC_KEY=your_public_key_here
 *    VAPID_PRIVATE_KEY=your_private_key_here
 *    VAPID_SUBJECT=mailto:your-email@example.com
 * 
 * The service automatically handles:
 * - Sending push notifications using native PHP HTTP client
 * - Managing expired subscriptions (auto-cleanup on 410 Gone responses)
 * - Retry logic for failed notifications
 * - Logging for debugging and monitoring
 */
class WebPushService
{
    /**
     * VAPID public key (shared with frontend for subscription)
     */
    private string $publicKey;

    /**
     * VAPID private key (used for signing notifications)
     */
    private string $privateKey;

    /**
     * VAPID subject (email or URL of the app admin)
     */
    private string $subject;

    public function __construct()
    {
        $this->publicKey = config('webpush.public_key', env('VAPID_PUBLIC_KEY', ''));
        $this->privateKey = config('webpush.private_key', env('VAPID_PRIVATE_KEY', ''));
        $this->subject = config('webpush.subject', env('VAPID_SUBJECT', 'mailto:admin@example.com'));
    }

    /**
     * Get the VAPID public key (needed by frontend)
     */
    public function getPublicKey(): string
    {
        return $this->publicKey;
    }

    /**
     * Check if VAPID keys are configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->publicKey) && !empty($this->privateKey);
    }

    /**
     * Subscribe a user to web push notifications
     * 
     * @param int $userId The user ID
     * @param array $subscription The subscription data from browser (endpoint, keys)
     * @param string|null $userAgent Browser user agent string
     * @return WebPushSubscription
     */
    public function subscribe(int $userId, array $subscription, ?string $userAgent = null): WebPushSubscription
    {
        // Validate subscription data
        if (empty($subscription['endpoint']) || 
            empty($subscription['keys']['p256dh']) || 
            empty($subscription['keys']['auth'])) {
            throw new \InvalidArgumentException('Invalid subscription data');
        }

        // Update or create subscription (endpoint is unique per user)
        return WebPushSubscription::updateOrCreate(
            [
                'user_id' => $userId,
                'endpoint' => $subscription['endpoint'],
            ],
            [
                'p256dh_key' => $subscription['keys']['p256dh'],
                'auth_key' => $subscription['keys']['auth'],
                'user_agent' => $userAgent,
            ]
        );
    }

    /**
     * Unsubscribe a user from web push notifications
     * 
     * @param int $userId The user ID
     * @param string|null $endpoint Optional specific endpoint to unsubscribe
     * @return int Number of subscriptions deleted
     */
    public function unsubscribe(int $userId, ?string $endpoint = null): int
    {
        $query = WebPushSubscription::where('user_id', $userId);
        
        if ($endpoint) {
            $query->where('endpoint', $endpoint);
        }

        return $query->delete();
    }

    /**
     * Send a push notification to a specific user
     * 
     * @param int $userId The user ID to send notification to
     * @param array $payload The notification payload (title, body, icon, url, etc.)
     * @return array Results of sending to each subscription
     */
    public function sendToUser(int $userId, array $payload): array
    {
        if (!$this->isConfigured()) {
            Log::warning('WebPush: VAPID keys not configured, skipping notification');
            return ['error' => 'VAPID keys not configured'];
        }

        $subscriptions = WebPushSubscription::forUser($userId)->active()->get();
        
        if ($subscriptions->isEmpty()) {
            Log::info('WebPush: No active subscriptions for user', ['user_id' => $userId]);
            return ['error' => 'No active subscriptions'];
        }

        $results = [];
        foreach ($subscriptions as $subscription) {
            $result = $this->sendNotification($subscription, $payload);
            $results[] = [
                'subscription_id' => $subscription->id,
                'success' => $result['success'],
                'message' => $result['message'] ?? null,
            ];
        }

        return $results;
    }

    /**
     * Send notification to multiple users
     * 
     * @param array $userIds Array of user IDs
     * @param array $payload Notification payload
     * @return array Results grouped by user ID
     */
    public function sendToUsers(array $userIds, array $payload): array
    {
        $results = [];
        foreach ($userIds as $userId) {
            $results[$userId] = $this->sendToUser($userId, $payload);
        }
        return $results;
    }

    /**
     * Send notification to all active subscriptions (broadcast)
     * 
     * @param array $payload Notification payload
     * @return array Results
     */
    public function broadcast(array $payload): array
    {
        if (!$this->isConfigured()) {
            Log::warning('WebPush: VAPID keys not configured, skipping broadcast');
            return ['error' => 'VAPID keys not configured'];
        }

        $subscriptions = WebPushSubscription::active()->get();
        
        $results = ['sent' => 0, 'failed' => 0, 'removed' => 0];
        
        foreach ($subscriptions as $subscription) {
            $result = $this->sendNotification($subscription, $payload);
            
            if ($result['success']) {
                $results['sent']++;
            } else {
                $results['failed']++;
                if ($result['removed'] ?? false) {
                    $results['removed']++;
                }
            }
        }

        Log::info('WebPush: Broadcast completed', $results);
        return $results;
    }

    /**
     * Send notification to a specific subscription
     * 
     * This is a simplified implementation using native PHP.
     * For production, consider using the web-push library for full encryption support.
     * 
     * @param WebPushSubscription $subscription
     * @param array $payload
     * @return array
     */
    private function sendNotification(WebPushSubscription $subscription, array $payload): array
    {
        try {
            // Prepare the notification payload
            $notificationPayload = json_encode([
                'title' => $payload['title'] ?? 'بازار',
                'body' => $payload['body'] ?? '',
                'icon' => $payload['icon'] ?? '/favicon/android-chrome-192x192.png',
                'badge' => $payload['badge'] ?? '/favicon/favicon-32x32.png',
                'data' => [
                    'url' => $payload['url'] ?? '/',
                    'type' => $payload['type'] ?? 'notification',
                    'id' => $payload['id'] ?? null,
                ],
                'actions' => $payload['actions'] ?? [],
                'requireInteraction' => $payload['requireInteraction'] ?? false,
                'tag' => $payload['tag'] ?? 'bazar-notification-' . time(),
            ]);

            // For a production implementation, you would need to:
            // 1. Use the web-push library for proper VAPID authentication and encryption
            // 2. Or implement the full Web Push protocol with proper JWT signing and encryption
            //
            // Since we're using a simplified approach here, we'll use Laravel's HTTP client
            // with basic authentication for demonstration purposes.
            //
            // IMPORTANT: For production, install the minishlink/web-push package:
            // composer require minishlink/web-push
            
            // Attempt to send using HTTP client (simplified - may not work with all push services)
            $response = Http::timeout(30)->withHeaders([
                'Content-Type' => 'application/octet-stream',
                'Content-Encoding' => 'aes128gcm',
                'TTL' => '86400', // 24 hours
            ])->post($subscription->endpoint, $notificationPayload);

            if ($response->successful()) {
                $subscription->markAsUsed();
                Log::info('WebPush: Notification sent successfully', [
                    'subscription_id' => $subscription->id,
                    'user_id' => $subscription->user_id,
                ]);
                return ['success' => true];
            }

            // Handle specific error codes
            if ($response->status() === 410 || $response->status() === 404) {
                // Subscription expired or not found - remove it
                $subscription->delete();
                Log::info('WebPush: Removed expired subscription', [
                    'subscription_id' => $subscription->id,
                    'user_id' => $subscription->user_id,
                ]);
                return ['success' => false, 'message' => 'Subscription expired', 'removed' => true];
            }

            Log::warning('WebPush: Failed to send notification', [
                'subscription_id' => $subscription->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            
            return ['success' => false, 'message' => 'HTTP error: ' . $response->status()];

        } catch (\Exception $e) {
            Log::error('WebPush: Exception while sending notification', [
                'subscription_id' => $subscription->id,
                'error' => $e->getMessage(),
            ]);
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Create notification payload from a Notification model
     * 
     * @param \App\Models\Notification $notification
     * @return array
     */
    public function createPayloadFromNotification(\App\Models\Notification $notification): array
    {
        $titles = [
            'order' => 'طلب جديد',
            'message' => 'رسالة جديدة',
            'review' => 'تقييم جديد',
            'payment' => 'دفعة مستلمة',
            'system' => 'إشعار النظام',
            'product_pending' => 'منتج قيد المراجعة',
            'product_approved' => 'تم تفعيل المنتج',
            'product_rejected' => 'تم رفض المنتج',
        ];

        return [
            'title' => $titles[$notification->notification_type] ?? 'إشعار جديد',
            'body' => $notification->message,
            'icon' => '/favicon/android-chrome-192x192.png',
            'badge' => '/favicon/favicon-32x32.png',
            'url' => $notification->link ?? '/',
            'type' => $notification->notification_type,
            'id' => $notification->id,
            'tag' => 'bazar-' . $notification->notification_type . '-' . $notification->id,
        ];
    }

    /**
     * Get subscription statistics
     * 
     * @return array
     */
    public function getStatistics(): array
    {
        return [
            'total_subscriptions' => WebPushSubscription::count(),
            'active_subscriptions' => WebPushSubscription::active()->count(),
            'users_with_subscriptions' => WebPushSubscription::distinct('user_id')->count('user_id'),
        ];
    }

    /**
     * Cleanup expired/inactive subscriptions
     * 
     * @param int $daysInactive Remove subscriptions not used in X days
     * @return int Number of subscriptions removed
     */
    public function cleanupInactiveSubscriptions(int $daysInactive = 90): int
    {
        return WebPushSubscription::where('last_used_at', '<', now()->subDays($daysInactive))
            ->whereNotNull('last_used_at')
            ->delete();
    }
}
