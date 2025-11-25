/**
 * useWebPush Hook
 * 
 * Custom React hook for managing Web Push notifications subscription.
 * Handles the browser Push API and communicates with the backend to store subscriptions.
 * 
 * USAGE:
 * ```jsx
 * const { 
 *   isSupported,
 *   permission,
 *   isSubscribed,
 *   loading,
 *   error,
 *   requestPermission,
 *   subscribe,
 *   unsubscribe 
 * } = useWebPush();
 * ```
 * 
 * FLOW:
 * 1. Check if browser supports Push notifications
 * 2. Request notification permission from user
 * 3. Subscribe to push notifications using VAPID public key
 * 4. Send subscription to backend for storage
 * 5. Backend uses subscription to send notifications when app is closed
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

/**
 * Convert a base64 string to Uint8Array for applicationServerKey
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * useWebPush Hook
 * 
 * @returns {Object} Web Push state and methods
 */
export function useWebPush() {
  // State
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vapidPublicKey, setVapidPublicKey] = useState(null);

  /**
   * Check if Push notifications are supported by the browser
   */
  const checkSupport = useCallback(() => {
    const supported = 
      'serviceWorker' in navigator && 
      'PushManager' in window &&
      'Notification' in window;
    
    setIsSupported(supported);
    return supported;
  }, []);

  /**
   * Get current notification permission status
   */
  const checkPermission = useCallback(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      return Notification.permission;
    }
    return 'denied';
  }, []);

  /**
   * Get current push subscription from service worker
   */
  const getCurrentSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
      setIsSubscribed(!!sub);
      return sub;
    } catch (err) {
      console.error('[WebPush] Error getting subscription:', err);
      return null;
    }
  }, []);

  /**
   * Fetch VAPID public key from backend
   */
  const fetchVapidKey = useCallback(async () => {
    try {
      const response = await api.get('webpush/public-key');
      if (response.publicKey) {
        setVapidPublicKey(response.publicKey);
        return response.publicKey;
      }
      return null;
    } catch (err) {
      console.error('[WebPush] Error fetching VAPID key:', err);
      // Don't set error for this - it's optional functionality
      return null;
    }
  }, []);

  /**
   * Request notification permission from user
   */
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return 'denied';
    }

    try {
      setLoading(true);
      setError(null);

      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        console.log('[WebPush] Permission granted');
      } else if (result === 'denied') {
        setError('Notification permission was denied');
      }
      
      return result;
    } catch (err) {
      console.error('[WebPush] Error requesting permission:', err);
      setError(err.message);
      return 'denied';
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  /**
   * Subscribe to push notifications
   */
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return null;
    }

    if (permission !== 'granted') {
      const result = await requestPermission();
      if (result !== 'granted') {
        return null;
      }
    }

    try {
      setLoading(true);
      setError(null);

      // Get VAPID public key if not already fetched
      let key = vapidPublicKey;
      if (!key) {
        key = await fetchVapidKey();
        if (!key) {
          setError('Could not get VAPID public key from server');
          return null;
        }
      }

      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;
      console.log('[WebPush] Service worker ready');

      // Subscribe to push notifications
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key)
      });

      console.log('[WebPush] Push subscription created:', pushSubscription);

      // Send subscription to backend
      const subscriptionData = {
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode.apply(null, 
            new Uint8Array(pushSubscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode.apply(null, 
            new Uint8Array(pushSubscription.getKey('auth'))))
        }
      };

      // Store subscription on backend
      await api.post('webpush/subscribe', { subscription: subscriptionData });
      console.log('[WebPush] Subscription saved to backend');

      // Update state
      setSubscription(pushSubscription);
      setIsSubscribed(true);

      // Notify service worker
      if (registration.active) {
        registration.active.postMessage({
          type: 'PUSH_SUBSCRIPTION_UPDATE',
          subscribed: true
        });
      }

      return pushSubscription;
    } catch (err) {
      console.error('[WebPush] Error subscribing:', err);
      setError(err.message || 'Failed to subscribe to notifications');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isSupported, permission, vapidPublicKey, requestPermission, fetchVapidKey]);

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe();
        console.log('[WebPush] Unsubscribed from push manager');

        // Remove subscription from backend
        await api.post('webpush/unsubscribe', { endpoint: subscription.endpoint });
        console.log('[WebPush] Subscription removed from backend');
      }

      // Update state
      setSubscription(null);
      setIsSubscribed(false);

      return true;
    } catch (err) {
      console.error('[WebPush] Error unsubscribing:', err);
      setError(err.message || 'Failed to unsubscribe from notifications');
      return false;
    } finally {
      setLoading(false);
    }
  }, [subscription]);

  /**
   * Test push notification (requires authenticated user)
   */
  const testNotification = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.post('webpush/test');
      console.log('[WebPush] Test notification sent:', response);
      return response;
    } catch (err) {
      console.error('[WebPush] Error sending test:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      
      // Check browser support
      const supported = checkSupport();
      if (!supported) {
        setLoading(false);
        return;
      }

      // Check permission
      checkPermission();

      // Get current subscription
      await getCurrentSubscription();

      // Fetch VAPID key (don't block on this)
      fetchVapidKey();

      setLoading(false);
    };

    init();
  }, [checkSupport, checkPermission, getCurrentSubscription, fetchVapidKey]);

  /**
   * Listen for service worker messages
   */
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'NOTIFICATION_CLICK') {
        // Handle notification click navigation
        console.log('[WebPush] Notification clicked:', event.data);
        if (event.data.url && window.location.pathname !== event.data.url) {
          window.location.href = event.data.url;
        }
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, []);

  return {
    // State
    isSupported,
    permission,
    isSubscribed,
    subscription,
    loading,
    error,
    vapidPublicKey,
    
    // Methods
    requestPermission,
    subscribe,
    unsubscribe,
    testNotification,
    
    // Utility
    checkPermission,
    getCurrentSubscription
  };
}

export default useWebPush;
