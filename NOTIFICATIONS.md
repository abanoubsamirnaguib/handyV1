# Real-time Notifications System

This document describes the real-time web notification system implemented using **Pusher Channels** and the **Web Push API**.

## Overview

The notification system provides two delivery methods:

1. **Pusher Channels** - For real-time notifications when the app is **OPEN**
2. **Web Push API** - For browser notifications when the app is **CLOSED**

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        NOTIFICATION FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Backend creates notification                                    │
│           │                                                      │
│           ├──────────────────────┬───────────────────────────┐  │
│           │                      │                           │  │
│           ▼                      ▼                           ▼  │
│   ┌──────────────┐    ┌──────────────────┐    ┌────────────────┐│
│   │   Database   │    │  Pusher Channels │    │    Web Push    ││
│   │   Storage    │    │  (Real-time)     │    │    (Offline)   ││
│   └──────────────┘    └──────────────────┘    └────────────────┘│
│                              │                        │          │
│                              ▼                        ▼          │
│                    ┌─────────────────┐    ┌─────────────────────┐│
│                    │   App is OPEN   │    │   App is CLOSED     ││
│                    │   Show in-app   │    │   Show browser      ││
│                    │   notification  │    │   notification      ││
│                    └─────────────────┘    └─────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Backend Configuration

#### 1.1 Generate VAPID Keys

You need to generate VAPID (Voluntary Application Server Identification) keys for Web Push:

**Option A: Online Generator**
Visit https://vapidkeys.com/ and generate keys.

**Option B: Using Node.js**
```bash
npm install web-push -g
npx web-push generate-vapid-keys
```

**Option C: Using PHP (OpenSSL)**
```php
$key = openssl_pkey_new(['curve_name' => 'prime256v1', 'private_key_type' => OPENSSL_KEYTYPE_EC]);
$details = openssl_pkey_get_details($key);
openssl_pkey_export($key, $privateKey);
echo "Public Key: " . base64_encode($details['ec']['x'] . $details['ec']['y']);
```

#### 1.2 Configure Environment Variables

Add these to your `backend/.env` file:

```env
# Web Push (VAPID) Configuration
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:admin@yourdomain.com

# Pusher Configuration
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=eu

# Broadcast driver
BROADCAST_CONNECTION=pusher
```

#### 1.3 Run Database Migration

```bash
cd backend
php artisan migrate
```

This creates the `web_push_subscriptions` table.

### 2. Frontend Configuration

#### 2.1 Configure Pusher Keys

Add to your frontend environment (`.env` or Vite config):

```env
VITE_PUSHER_APP_KEY=your_app_key
VITE_PUSHER_APP_CLUSTER=eu
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Pusher Dashboard Setup

1. Create an account at https://pusher.com/
2. Create a new Channels app
3. Enable client events if needed
4. Copy your credentials to `.env`

## API Endpoints

### Web Push Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/webpush/public-key` | GET | No | Get VAPID public key |
| `/api/webpush/subscribe` | POST | Yes | Subscribe to push notifications |
| `/api/webpush/unsubscribe` | POST | Yes | Unsubscribe from push notifications |
| `/api/webpush/status` | GET | Yes | Get subscription status |
| `/api/webpush/test` | POST | Yes | Send test notification |

### Notification Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/notifications` | GET | Yes | Get user notifications |
| `/api/notifications/unread-count` | GET | Yes | Get unread count |
| `/api/notifications/{id}/mark-read` | POST | Yes | Mark as read |
| `/api/notifications/mark-all-read` | POST | Yes | Mark all as read |
| `/api/notifications/{id}` | DELETE | Yes | Delete notification |

## Frontend Usage

### NotificationContext

The `NotificationContext` provides all notification functionality:

```jsx
import { useNotifications } from '@/contexts/NotificationContext';

function MyComponent() {
  const { 
    // Notification state
    notifications,
    unreadCount,
    loading,
    error,
    
    // Notification methods
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    
    // Web Push state
    pushSupported,
    pushPermission,
    pushSubscribed,
    
    // Web Push methods
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    testPushNotification
  } = useNotifications();

  // Request permission and subscribe
  const enablePush = async () => {
    const subscription = await subscribeToPush();
    if (subscription) {
      console.log('Subscribed to push notifications');
    }
  };

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      <button onClick={enablePush} disabled={pushSubscribed}>
        {pushSubscribed ? 'Enabled' : 'Enable Push Notifications'}
      </button>
    </div>
  );
}
```

### useWebPush Hook

For more fine-grained control, use the `useWebPush` hook:

```jsx
import { useWebPush } from '@/hooks/useWebPush';

function NotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    loading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    testNotification
  } = useWebPush();

  return (
    <div>
      <p>Supported: {isSupported ? 'Yes' : 'No'}</p>
      <p>Permission: {permission}</p>
      <p>Subscribed: {isSubscribed ? 'Yes' : 'No'}</p>
      
      {!isSubscribed && (
        <button onClick={subscribe}>Enable Notifications</button>
      )}
      
      {isSubscribed && (
        <>
          <button onClick={testNotification}>Test</button>
          <button onClick={unsubscribe}>Disable</button>
        </>
      )}
    </div>
  );
}
```

## Service Worker

The service worker (`public/sw.js`) handles:

1. **Caching** - Offline support for static assets
2. **Push Events** - Receiving and displaying notifications
3. **Notification Clicks** - Opening the app and navigating to URLs

### Push Event Data Format

```javascript
{
  title: 'Notification Title',           // Required
  body: 'Notification message',          // Required
  icon: '/path/to/icon.png',            // Optional, defaults to app icon
  badge: '/path/to/badge.png',          // Optional
  data: {
    url: '/target-url',                 // URL to open on click
    type: 'notification-type',          // e.g., 'order', 'message'
    id: 123                             // Notification ID
  },
  actions: [                            // Optional action buttons
    { action: 'view', title: 'View' }
  ],
  tag: 'unique-tag',                    // Groups notifications
  requireInteraction: false             // Keep notification visible
}
```

## Backend Integration

### Creating Notifications with Web Push

The `NotificationService` automatically sends Web Push notifications:

```php
use App\Services\NotificationService;

// Create a notification (automatically sends Pusher + Web Push)
NotificationService::create(
    userId: $user->id,
    type: 'order',
    message: 'You have a new order #123',
    link: '/orders/123'
);

// Predefined notification helpers
NotificationService::orderCreated($userId, $orderId);
NotificationService::messageReceived($userId, $senderName);
NotificationService::paymentReceived($userId, $amount);
NotificationService::reviewReceived($userId, $productId, $stars);
```

### WebPushService Methods

```php
use App\Services\WebPushService;

$webPush = app(WebPushService::class);

// Send to specific user
$webPush->sendToUser($userId, [
    'title' => 'New Message',
    'body' => 'You have a new message',
    'url' => '/chat'
]);

// Send to multiple users
$webPush->sendToUsers([$userId1, $userId2], $payload);

// Broadcast to all users
$webPush->broadcast($payload);

// Get statistics
$stats = $webPush->getStatistics();

// Cleanup old subscriptions
$webPush->cleanupInactiveSubscriptions(90); // 90 days
```

## Notification Types

| Type | Title (Arabic) | Description |
|------|---------------|-------------|
| `order` | طلب جديد | New order notifications |
| `message` | رسالة جديدة | Chat message notifications |
| `review` | تقييم جديد | Review notifications |
| `payment` | دفعة مستلمة | Payment received |
| `system` | إشعار النظام | System notifications |
| `product_pending` | منتج قيد المراجعة | Product pending review |
| `product_approved` | تم تفعيل المنتج | Product approved |
| `product_rejected` | تم رفض المنتج | Product rejected |

## Security Considerations

1. **VAPID Keys**: Keep `VAPID_PRIVATE_KEY` secret. Never expose in frontend code.
2. **Subscriptions**: Stored securely with user association.
3. **Authentication**: All subscription management requires authentication.
4. **Endpoint Validation**: Push endpoints are validated before storage.
5. **Cleanup**: Expired subscriptions are automatically removed.

## Troubleshooting

### Notifications Not Working

1. **Check browser support**: Not all browsers support Push API
2. **Check permission**: User may have denied notification permission
3. **Check service worker**: Ensure SW is registered and active
4. **Check VAPID keys**: Ensure keys are correctly configured
5. **Check Pusher**: Ensure Pusher credentials are correct

### Browser Console Debugging

```javascript
// Check service worker registration
navigator.serviceWorker.getRegistration().then(reg => console.log(reg));

// Check push subscription
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => console.log(sub));
});

// Check notification permission
console.log(Notification.permission);
```

### Backend Logs

Check Laravel logs for Web Push errors:
```bash
tail -f storage/logs/laravel.log | grep -i push
```

## Browser Support

| Browser | Push Support | Notes |
|---------|-------------|-------|
| Chrome | ✅ Full | Best support |
| Firefox | ✅ Full | Good support |
| Edge | ✅ Full | Uses FCM |
| Safari | ✅ Limited | Requires Apple Push |
| Opera | ✅ Full | Uses FCM |
| iOS Safari | ❌ No* | Web Push coming in iOS 16.4+ |

*iOS Safari requires adding to home screen and specific PWA configuration.

## Files Reference

### Backend
- `app/Services/WebPushService.php` - Web Push sending logic
- `app/Services/NotificationService.php` - Notification creation
- `app/Http/Controllers/Api/WebPushController.php` - API endpoints
- `app/Models/WebPushSubscription.php` - Subscription model
- `app/Events/NotificationCreated.php` - Pusher event
- `config/webpush.php` - Configuration
- `database/migrations/2025_12_31_000001_create_web_push_subscriptions_table.php`

### Frontend
- `src/contexts/NotificationContext.jsx` - Main notification context
- `src/hooks/useWebPush.js` - Web Push hook
- `src/lib/api.js` - API functions
- `src/lib/echo.js` - Pusher configuration
- `public/sw.js` - Service worker
- `src/components/dashboard/DashboardSettings.jsx` - UI settings
