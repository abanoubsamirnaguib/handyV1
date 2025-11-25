<?php

/**
 * Web Push Configuration
 * 
 * Configuration for Web Push notifications using VAPID (Voluntary Application Server Identification).
 * 
 * SETUP INSTRUCTIONS:
 * ------------------
 * 
 * 1. Generate VAPID keys (one-time setup):
 *    You can generate keys using one of these methods:
 *    
 *    a) Online generator: https://vapidkeys.com/
 *    
 *    b) Using Node.js web-push library:
 *       npm install web-push
 *       npx web-push generate-vapid-keys
 *    
 *    c) Using PHP (requires openssl):
 *       php -r "
 *       \$key = openssl_pkey_new(['curve_name' => 'prime256v1', 'private_key_type' => OPENSSL_KEYTYPE_EC]);
 *       \$details = openssl_pkey_get_details(\$key);
 *       openssl_pkey_export(\$key, \$privateKey);
 *       echo 'Public Key: ' . base64_encode(\$details['ec']['x'] . \$details['ec']['y']) . PHP_EOL;
 *       "
 * 
 * 2. Add the generated keys to your .env file:
 *    VAPID_PUBLIC_KEY=your_public_key_here
 *    VAPID_PRIVATE_KEY=your_private_key_here
 *    VAPID_SUBJECT=mailto:your-admin-email@example.com
 * 
 * 3. Important: Never share your VAPID_PRIVATE_KEY publicly!
 *    The public key is shared with the browser and can be seen in frontend code.
 *    The private key must remain secret on the server only.
 * 
 * 4. The VAPID_SUBJECT should be a mailto: or https: URL that identifies
 *    who is sending the notifications.
 */

return [
    /*
    |--------------------------------------------------------------------------
    | VAPID Public Key
    |--------------------------------------------------------------------------
    |
    | The public key that will be shared with the browser for subscription.
    | This key is used by the browser to encrypt notification data.
    |
    */
    'public_key' => env('VAPID_PUBLIC_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | VAPID Private Key
    |--------------------------------------------------------------------------
    |
    | The private key used to sign notifications sent to the push service.
    | Keep this key secret and never expose it in frontend code!
    |
    */
    'private_key' => env('VAPID_PRIVATE_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | VAPID Subject
    |--------------------------------------------------------------------------
    |
    | A URL or mailto address identifying who is sending notifications.
    | Example: 'mailto:admin@example.com' or 'https://example.com'
    |
    */
    'subject' => env('VAPID_SUBJECT', 'mailto:admin@example.com'),

    /*
    |--------------------------------------------------------------------------
    | Default Notification Options
    |--------------------------------------------------------------------------
    |
    | Default values for notifications when not specified.
    |
    */
    'defaults' => [
        'icon' => '/favicon/android-chrome-192x192.png',
        'badge' => '/favicon/favicon-32x32.png',
        'ttl' => 86400, // Time to live in seconds (24 hours)
    ],

    /*
    |--------------------------------------------------------------------------
    | Subscription Cleanup
    |--------------------------------------------------------------------------
    |
    | How long to keep inactive subscriptions before cleanup.
    |
    */
    'cleanup_after_days' => 90,
];
