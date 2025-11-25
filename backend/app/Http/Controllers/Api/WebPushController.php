<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WebPushService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * WebPushController
 * 
 * Handles Web Push subscription management for browser notifications.
 * 
 * Endpoints:
 * - POST /api/webpush/subscribe - Subscribe to push notifications
 * - POST /api/webpush/unsubscribe - Unsubscribe from push notifications
 * - GET /api/webpush/public-key - Get VAPID public key for subscription
 * - GET /api/webpush/status - Get subscription status for current user
 * 
 * FRONTEND INTEGRATION:
 * 1. First call GET /api/webpush/public-key to get the VAPID public key
 * 2. Use the public key to subscribe the browser using the Push API
 * 3. Send the subscription to POST /api/webpush/subscribe
 * 4. The backend will use this subscription to send notifications when app is closed
 */
class WebPushController extends Controller
{
    private WebPushService $webPushService;

    public function __construct(WebPushService $webPushService)
    {
        $this->webPushService = $webPushService;
    }

    /**
     * Get VAPID public key for frontend subscription
     * 
     * This endpoint can be called without authentication as
     * the public key is needed before subscribing.
     * 
     * @return JsonResponse
     */
    public function getPublicKey(): JsonResponse
    {
        $publicKey = $this->webPushService->getPublicKey();
        
        if (empty($publicKey)) {
            return response()->json([
                'error' => 'Web Push not configured',
                'message' => 'VAPID public key is not set. Please configure VAPID_PUBLIC_KEY in .env',
            ], 503);
        }

        return response()->json([
            'publicKey' => $publicKey,
        ]);
    }

    /**
     * Subscribe to Web Push notifications
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'subscription' => 'required|array',
            'subscription.endpoint' => 'required|url',
            'subscription.keys' => 'required|array',
            'subscription.keys.p256dh' => 'required|string',
            'subscription.keys.auth' => 'required|string',
        ]);

        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'error' => 'Authentication required',
                ], 401);
            }

            $subscription = $this->webPushService->subscribe(
                $user->id,
                $request->input('subscription'),
                $request->userAgent()
            );

            Log::info('WebPush: User subscribed', [
                'user_id' => $user->id,
                'subscription_id' => $subscription->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Successfully subscribed to push notifications',
                'subscription_id' => $subscription->id,
            ]);

        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'error' => 'Invalid subscription data',
                'message' => $e->getMessage(),
            ], 400);

        } catch (\Exception $e) {
            Log::error('WebPush: Subscribe error', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()?->id,
            ]);

            return response()->json([
                'error' => 'Failed to subscribe',
                'message' => 'An error occurred while subscribing to push notifications',
            ], 500);
        }
    }

    /**
     * Unsubscribe from Web Push notifications
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        $request->validate([
            'endpoint' => 'nullable|url',
        ]);

        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'error' => 'Authentication required',
                ], 401);
            }

            $count = $this->webPushService->unsubscribe(
                $user->id,
                $request->input('endpoint')
            );

            Log::info('WebPush: User unsubscribed', [
                'user_id' => $user->id,
                'count' => $count,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Successfully unsubscribed from push notifications',
                'count' => $count,
            ]);

        } catch (\Exception $e) {
            Log::error('WebPush: Unsubscribe error', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()?->id,
            ]);

            return response()->json([
                'error' => 'Failed to unsubscribe',
                'message' => 'An error occurred while unsubscribing from push notifications',
            ], 500);
        }
    }

    /**
     * Get subscription status for current user
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'subscribed' => false,
                'configured' => $this->webPushService->isConfigured(),
            ]);
        }

        $subscriptions = \App\Models\WebPushSubscription::forUser($user->id)->get();

        return response()->json([
            'subscribed' => $subscriptions->isNotEmpty(),
            'subscription_count' => $subscriptions->count(),
            'configured' => $this->webPushService->isConfigured(),
            'subscriptions' => $subscriptions->map(function ($sub) {
                return [
                    'id' => $sub->id,
                    'user_agent' => $sub->user_agent,
                    'created_at' => $sub->created_at,
                    'last_used_at' => $sub->last_used_at,
                ];
            }),
        ]);
    }

    /**
     * Test push notification (for development/debugging)
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function test(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'error' => 'Authentication required',
            ], 401);
        }

        $payload = [
            'title' => 'اختبار الإشعارات',
            'body' => 'هذا إشعار تجريبي من منصة بازار 🎉',
            'url' => '/notifications',
            'type' => 'test',
        ];

        $results = $this->webPushService->sendToUser($user->id, $payload);

        return response()->json([
            'success' => true,
            'message' => 'Test notification sent',
            'results' => $results,
        ]);
    }
}
