<?php

namespace App\Services;

use App\Models\PushSubscription;
use Illuminate\Support\Facades\Log;

class WebPushService
{
    /**
     * Send a Web Push notification to all saved subscriptions for a user.
     *
     * Requires:
     * - composer require minishlink/web-push
     * - VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY in env
     */
    public static function sendToUser(int $userId, array $payload): void
    {
        $publicKey = env('VAPID_PUBLIC_KEY');
        $privateKey = env('VAPID_PRIVATE_KEY');
        $subject = env('VAPID_SUBJECT', env('APP_URL', 'mailto:admin@example.com'));

        if (!$publicKey || !$privateKey) {
            return;
        }

        // If package isn't installed, do nothing (keeps app running).
        if (!class_exists(\Minishlink\WebPush\WebPush::class) || !class_exists(\Minishlink\WebPush\Subscription::class)) {
            Log::warning('WebPush package not installed; skipping push send');
            return;
        }

        /** @var \Illuminate\Support\Collection<int, \App\Models\PushSubscription> $subs */
        $subs = PushSubscription::where('user_id', $userId)->get();
        if ($subs->isEmpty()) {
            return;
        }

        $auth = [
            'VAPID' => [
                'subject' => $subject,
                'publicKey' => $publicKey,
                'privateKey' => $privateKey,
            ],
        ];

        $webPush = new \Minishlink\WebPush\WebPush($auth);

        foreach ($subs as $sub) {
            try {
                $subscription = \Minishlink\WebPush\Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'expirationTime' => $sub->expiration_time,
                    'keys' => [
                        'p256dh' => $sub->public_key,
                        'auth' => $sub->auth_token,
                    ],
                    'contentEncoding' => $sub->content_encoding,
                ]);

                $webPush->queueNotification($subscription, json_encode($payload, JSON_UNESCAPED_UNICODE));
                $sub->forceFill(['last_used_at' => now()])->save();
            } catch (\Throwable $e) {
                Log::warning('Failed to queue push notification', [
                    'user_id' => $userId,
                    'subscription_id' => $sub->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        foreach ($webPush->flush() as $report) {
            if ($report->isSuccess()) {
                continue;
            }

            $endpoint = method_exists($report, 'getRequest')
                ? $report->getRequest()?->getUri()?->__toString()
                : null;

            $reason = method_exists($report, 'getReason') ? $report->getReason() : null;
            $statusCode = method_exists($report, 'getResponse') ? $report->getResponse()?->getStatusCode() : null;

            Log::info('Push send failed', [
                'user_id' => $userId,
                'endpoint' => $endpoint,
                'status' => $statusCode,
                'reason' => $reason,
            ]);

            // Remove dead subscriptions
            if (in_array($statusCode, [404, 410], true) && $endpoint) {
                PushSubscription::where('user_id', $userId)
                    ->where('endpoint_hash', hash('sha256', $endpoint))
                    ->delete();
            }
        }
    }
}

