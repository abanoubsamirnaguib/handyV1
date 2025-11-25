/**
 * Web Push Utilities
 * 
 * Shared utility functions for Web Push notification handling.
 */

/**
 * Convert a URL-safe base64 string to a Uint8Array
 * Required for the applicationServerKey in PushManager.subscribe()
 * 
 * @param {string} base64String - URL-safe base64 encoded string (VAPID public key)
 * @returns {Uint8Array} - The decoded binary data
 */
export function urlBase64ToUint8Array(base64String) {
  // Add padding if needed (base64 strings should be divisible by 4)
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  
  // Convert URL-safe base64 to standard base64
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  // Decode base64 to binary string
  const rawData = window.atob(base64);
  
  // Convert binary string to Uint8Array
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Check if the browser supports Push notifications
 * 
 * @returns {boolean} - True if Push is supported
 */
export function isPushSupported() {
  return (
    'serviceWorker' in navigator && 
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Get the current notification permission status
 * 
 * @returns {'default' | 'granted' | 'denied'} - Permission status
 */
export function getNotificationPermission() {
  if ('Notification' in window) {
    return Notification.permission;
  }
  return 'denied';
}

/**
 * Convert a PushSubscription's keys to base64 strings for transmission
 * 
 * @param {PushSubscription} subscription - Browser push subscription
 * @returns {Object} - Object with p256dh and auth keys as base64 strings
 */
export function extractSubscriptionKeys(subscription) {
  return {
    p256dh: btoa(String.fromCharCode.apply(null, 
      new Uint8Array(subscription.getKey('p256dh')))),
    auth: btoa(String.fromCharCode.apply(null, 
      new Uint8Array(subscription.getKey('auth'))))
  };
}
