<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    public function vapidPublicKey()
    {
        $publicKey = env('VAPID_PUBLIC_KEY');

        return response()->json([
            'enabled' => (bool) $publicKey,
            'publicKey' => $publicKey,
        ]);
    }

    public function subscribe(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'subscription' => 'required|array',
            'subscription.endpoint' => 'required|string',
            'subscription.expirationTime' => 'nullable',
            'subscription.keys' => 'required|array',
            'subscription.keys.p256dh' => 'required|string',
            'subscription.keys.auth' => 'required|string',
            'subscription.contentEncoding' => 'nullable|string',
        ]);

        $sub = $validated['subscription'];
        $endpointHash = hash('sha256', $sub['endpoint']);

        $model = PushSubscription::updateOrCreate(
            [
                'user_id' => $user->id,
                'endpoint_hash' => $endpointHash,
            ],
            [
                'endpoint' => $sub['endpoint'],
                'public_key' => $sub['keys']['p256dh'],
                'auth_token' => $sub['keys']['auth'],
                'expiration_time' => isset($sub['expirationTime']) && is_numeric($sub['expirationTime'])
                    ? (int) $sub['expirationTime']
                    : null,
                'content_encoding' => $sub['contentEncoding'] ?? 'aesgcm',
                'user_agent' => substr((string) $request->userAgent(), 0, 255),
                'last_used_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'id' => $model->id,
        ]);
    }

    public function unsubscribe(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'endpoint' => 'required|string',
        ]);

        PushSubscription::where('user_id', $user->id)
            ->where('endpoint_hash', hash('sha256', $validated['endpoint']))
            ->delete();

        return response()->json(['success' => true]);
    }
}

