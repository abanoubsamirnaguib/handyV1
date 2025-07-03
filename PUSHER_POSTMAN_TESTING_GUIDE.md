# Pusher Real-Time Testing Guide with Postman

## Overview
This guide shows you how to test your Pusher real-time functionality using Postman, including authentication, channel subscription, and event broadcasting.

## Your Current Pusher Configuration
Based on your Laravel setup:
- **App Key**: `70ebd221273a762f9450`
- **App Secret**: `7bab81eb75b6a3ee5936`
- **App ID**: `2014436`
- **Cluster**: `eu`
- **Channel**: `conversation.{conversationId}` (Private Channel)
- **Event**: `message.sent`

## Method 1: Using Pusher's REST API in Postman

### 1. Test Pusher Connection
Create a new request in Postman to test basic Pusher connectivity:

**Request**: `GET`
**URL**: `https://api-eu.pusherapp.com/apps/2014436/channels`

**Headers**:
```
Authorization: key=70ebd221273a762f9450, timestamp=1640995200, version=1.0, signature=YOUR_SIGNATURE
Content-Type: application/json
```

### 2. Trigger an Event via Pusher REST API
**Request**: `POST`
**URL**: `https://api-eu.pusherapp.com/apps/2014436/events`

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "key=70ebd221273a762f9450, timestamp=UNIX_TIMESTAMP, version=1.0, signature=CALCULATED_SIGNATURE"
}
```

**Body** (JSON):
```json
{
  "name": "message.sent",
  "channels": ["conversation.123"],
  "data": {
    "message": {
      "id": 1,
      "conversation_id": 123,
      "sender_id": 1,
      "recipient_id": 2,
      "message_text": "Test message from Postman",
      "read_status": false,
      "message_time": "2025-06-27T10:00:00Z",
      "created_at": "2025-06-27T10:00:00Z",
      "attachments": [],
      "sender": {
        "id": 1,
        "name": "Test User",
        "email": "test@example.com",
        "avatar": null
      }
    }
  }
}
```

## Method 2: Test via Your Laravel API

### 1. Authenticate User
First, get an authentication token:

**Request**: `POST`
**URL**: `http://localhost:8000/api/login`

**Body** (JSON):
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Save the token** from the response for subsequent requests.

### 2. Test Broadcasting Auth Endpoint
**Request**: `POST`
**URL**: `http://localhost:8000/broadcasting/auth`

**Headers**:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/x-www-form-urlencoded
```

**Body** (x-www-form-urlencoded):
```
channel_name=conversation.123
socket_id=12345.67890
```

### 3. Send a Message (Triggers Broadcasting)
**Request**: `POST`
**URL**: `http://localhost:8000/api/messages`

**Headers**:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "conversation_id": 123,
  "recipient_id": 2,
  "message_text": "Test message that should broadcast",
  "attachments": []
}
```

## Method 3: Using Pusher Debug Console

### 1. Access Pusher Dashboard
1. Go to [https://dashboard.pusher.com](https://dashboard.pusher.com)
2. Login and select your app (ID: 2014436)
3. Go to "Debug Console" tab

### 2. Monitor Real-Time Events
- You can see live events being triggered
- Monitor channel subscriptions
- View connection states

### 3. Test Event Triggering
In the Debug Console:
1. Click "Event Creator"
2. **Channel**: `conversation.123`
3. **Event**: `message.sent`
4. **Data**: 
```json
{
  "message": {
    "id": 1,
    "conversation_id": 123,
    "sender_id": 1,
    "recipient_id": 2,
    "message_text": "Test from Pusher Console",
    "sender": {
      "id": 1,
      "name": "Test User"
    }
  }
}
```

## Method 4: JavaScript Console Testing

### 1. Open Your Frontend
Open your chat page in the browser

### 2. Test in Browser Console
```javascript
// Check if Echo is available
console.log(window.Echo);

// Listen to the channel
window.Echo.private('conversation.123')
    .listen('.message.sent', (e) => {
        console.log('Message received:', e);
    });

// Check connection status
console.log(window.Echo.connector.pusher.connection.state);

// Manually trigger an event (for testing)
fetch('/api/messages', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify({
        conversation_id: 123,
        recipient_id: 2,
        message_text: 'Test message'
    })
});
```

## Postman Collection Setup

### Environment Variables
Create a Postman environment with these variables:
```json
{
  "api_base_url": "http://localhost:8000",
  "pusher_key": "70ebd221273a762f9450",
  "pusher_secret": "7bab81eb75b6a3ee5936",
  "pusher_app_id": "2014436",
  "pusher_cluster": "eu",
  "auth_token": "",
  "conversation_id": "123"
}
```

### Pre-request Script for Pusher Authentication
For Pusher REST API requests, add this pre-request script:

```javascript
// Generate timestamp
const timestamp = Math.floor(Date.now() / 1000);

// Create the string to sign
const method = pm.request.method;
const path = pm.request.url.getPath();
const queryString = pm.request.url.getQueryString();
const bodyData = pm.request.body ? pm.request.body.raw : '';

const stringToSign = [
    method,
    path + (queryString ? '?' + queryString : ''),
    'auth_key=' + pm.environment.get('pusher_key') +
    '&auth_timestamp=' + timestamp +
    '&auth_version=1.0' +
    (bodyData ? '&body_md5=' + CryptoJS.MD5(bodyData).toString() : '')
].join('\n');

// Generate signature
const signature = CryptoJS.HmacSHA256(stringToSign, pm.environment.get('pusher_secret')).toString();

// Set authorization header
pm.request.headers.add({
    key: 'Authorization',
    value: `key=${pm.environment.get('pusher_key')}, timestamp=${timestamp}, version=1.0, signature=${signature}`
});
```

## Testing Scenarios

### 1. Test Channel Authorization
1. Make sure you're authenticated with your Laravel API
2. Test the `/broadcasting/auth` endpoint with different channel names
3. Verify authorization logic works correctly

### 2. Test Message Broadcasting
1. Send a message via your API
2. Monitor the Pusher Debug Console
3. Check if events are being triggered

### 3. Test Client Listening
1. Open your frontend
2. Subscribe to a channel
3. Send events from Postman
4. Verify events are received in the frontend

## Troubleshooting

### Common Issues:
1. **401 Unauthorized**: Check your authentication token
2. **403 Forbidden**: User not authorized for the channel
3. **Connection Failed**: Check Pusher credentials and cluster
4. **Events Not Received**: Verify channel name and event name match exactly

### Debug Steps:
1. Check Laravel logs: `tail -f storage/logs/laravel.log`
2. Monitor Pusher Debug Console
3. Check browser network tab for WebSocket connections
4. Verify environment variables are loaded correctly

### Laravel Artisan Commands for Testing:
```bash
# Check if broadcasting is working
php artisan tinker
>>> broadcast(new App\Events\MessageSent($message, $user));

# Clear cache if needed
php artisan config:clear
php artisan cache:clear
```

## Example Complete Postman Test Flow

1. **Authenticate**: POST `/api/login` → Save token
2. **Get Conversations**: GET `/api/conversations` → Get conversation ID
3. **Test Auth**: POST `/broadcasting/auth` → Verify channel access
4. **Send Message**: POST `/api/messages` → Trigger broadcast
5. **Monitor**: Check Pusher Debug Console for events

This setup allows you to test every aspect of your real-time messaging system!
