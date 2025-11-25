/**
 * NotificationContext
 * 
 * Provides notification management for the application.
 * 
 * NOTIFICATION DELIVERY METHODS:
 * 1. Pusher (real-time): When app is OPEN, notifications are delivered via Pusher Channels
 * 2. Web Push (offline): When app is CLOSED, notifications are delivered via Web Push API
 * 3. Database: All notifications are stored in the database for history
 * 
 * This context handles:
 * - Fetching notifications from backend
 * - Real-time notification updates via Pusher
 * - Web Push subscription management
 * - Notification permission requests
 * - Marking notifications as read/unread
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { urlBase64ToUint8Array, extractSubscriptionKeys } from '@/lib/webPushUtils';
import echo from '@/lib/echo';
import { useAuth } from '@/contexts/AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  // Web Push state
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState('default');
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [vapidPublicKey, setVapidPublicKey] = useState(null);

  /**
   * Check if Web Push is supported
   */
  const checkPushSupport = useCallback(() => {
    const supported = 
      'serviceWorker' in navigator && 
      'PushManager' in window &&
      'Notification' in window;
    setPushSupported(supported);
    return supported;
  }, []);

  /**
   * Check current notification permission
   */
  const checkPushPermission = useCallback(() => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
      return Notification.permission;
    }
    return 'denied';
  }, []);

  /**
   * Fetch VAPID public key from backend
   */
  const fetchVapidKey = useCallback(async () => {
    try {
      const response = await api.getWebPushPublicKey();
      if (response.publicKey) {
        setVapidPublicKey(response.publicKey);
        return response.publicKey;
      }
    } catch (err) {
      console.log('[Notifications] VAPID key not available:', err.message);
    }
    return null;
  }, []);

  /**
   * Get current push subscription status
   */
  const checkPushSubscription = useCallback(async () => {
    if (!pushSupported) return false;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setPushSubscribed(!!subscription);
      return !!subscription;
    } catch (err) {
      console.error('[Notifications] Error checking subscription:', err);
      return false;
    }
  }, [pushSupported]);

  /**
   * Request notification permission from user
   */
  const requestNotificationPermission = useCallback(async () => {
    if (!pushSupported) {
      console.log('[Notifications] Push not supported');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPushPermission(result);
      console.log('[Notifications] Permission result:', result);
      return result;
    } catch (err) {
      console.error('[Notifications] Permission error:', err);
      return 'denied';
    }
  }, [pushSupported]);

  /**
   * Subscribe to Web Push notifications
   */
  const subscribeToPush = useCallback(async () => {
    if (!pushSupported || !user) {
      console.log('[Notifications] Cannot subscribe: not supported or no user');
      return null;
    }

    // Request permission if not granted
    if (pushPermission !== 'granted') {
      const result = await requestNotificationPermission();
      if (result !== 'granted') {
        console.log('[Notifications] Permission not granted');
        return null;
      }
    }

    try {
      // Get VAPID key if not available
      let key = vapidPublicKey;
      if (!key) {
        key = await fetchVapidKey();
        if (!key) {
          console.error('[Notifications] No VAPID key available');
          return null;
        }
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      console.log('[Notifications] Service worker ready');

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key)
      });

      console.log('[Notifications] Push subscription created');

      // Prepare subscription data for backend using shared utility
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: extractSubscriptionKeys(subscription)
      };

      // Save to backend
      await api.subscribeWebPush(subscriptionData);
      console.log('[Notifications] Subscription saved to backend');

      setPushSubscribed(true);
      return subscription;

    } catch (err) {
      console.error('[Notifications] Subscribe error:', err);
      return null;
    }
  }, [pushSupported, user, pushPermission, vapidPublicKey, requestNotificationPermission, fetchVapidKey]);

  /**
   * Unsubscribe from Web Push notifications
   */
  const unsubscribeFromPush = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await api.unsubscribeWebPush(subscription.endpoint);
        console.log('[Notifications] Unsubscribed from push');
      }

      setPushSubscribed(false);
      return true;
    } catch (err) {
      console.error('[Notifications] Unsubscribe error:', err);
      return false;
    }
  }, []);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Notifications] Fetching notifications for user:', user?.id);
      const data = await api.getNotifications();
      console.log('[Notifications] Fetched:', data);
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('[Notifications] Error fetching:', err);
      setError(err.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count separately for better performance
  const fetchUnreadCount = async () => {
    try {
      const data = await api.getUnreadNotificationCount();
      return data.count || 0;
    } catch (err) {
      console.error('[Notifications] Error fetching unread count:', err);
      return notifications.filter(n => !n.read).length;
    }
  };

  /**
   * Initialize notification system
   */
  useEffect(() => {
    // Check push support
    checkPushSupport();
    checkPushPermission();
    
    // Fetch VAPID key (async, non-blocking)
    fetchVapidKey();
  }, [checkPushSupport, checkPushPermission, fetchVapidKey]);

  /**
   * Set up notifications when user is authenticated
   */
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    // Fetch notifications
    fetchNotifications();
    
    // Check push subscription status
    checkPushSubscription();
    
    // Set up real-time notification listening via Pusher
    // This handles notifications when the app is OPEN
    if (echo && user.id) {
      try {
        console.log('[Notifications] Setting up Pusher listener for user:', user.id);
        echo.private(`App.Models.User.${user.id}`)
          .listen('notification.created', (event) => {
            console.log('[Notifications] Real-time notification received:', event);
            setNotifications(prev => [event, ...prev]);
            
            // Show browser notification if app is in background
            if (document.hidden && pushPermission === 'granted') {
              // The Web Push notification should handle this, but as fallback
              // we can show a notification here if the service worker doesn't
            }
          });
      } catch (error) {
        console.error('[Notifications] Error setting up Pusher:', error);
      }
    }

    // Cleanup function
    return () => {
      if (echo && user?.id) {
        try {
          echo.leave(`App.Models.User.${user.id}`);
        } catch (error) {
          console.error('[Notifications] Error cleaning up echo listeners:', error);
        }
      }
    };
  }, [user, checkPushSubscription, pushPermission]);

  /**
   * Listen for service worker messages (notification clicks)
   */
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'NOTIFICATION_CLICK') {
        console.log('[Notifications] Notification clicked, navigating to:', event.data.url);
        // The service worker handles navigation, but we can also handle it here
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, []);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      createdAt: new Date(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = async (id) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (err) {
      console.error('[Notifications] Error marking as read:', err);
      // Optimistic update even if API fails
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error('[Notifications] Error marking all as read:', err);
      // Optimistic update even if API fails
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (err) {
      console.error('[Notifications] Error deleting:', err);
      // Optimistic update even if API fails
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const refreshNotifications = () => {
    fetchNotifications();
  };

  const sendTestNotification = async (type = 'message', message = 'رسالة تجريبية', link = '/chat') => {
    try {
      await api.testNotification(type, message, link);
      // Refresh notifications after sending test
      await fetchNotifications();
    } catch (err) {
      console.error('[Notifications] Error sending test:', err);
    }
  };

  /**
   * Test Web Push notification
   */
  const testPushNotification = async () => {
    try {
      const response = await api.testWebPush();
      console.log('[Notifications] Web Push test result:', response);
      return response;
    } catch (err) {
      console.error('[Notifications] Web Push test error:', err);
      return null;
    }
  };

  const value = {
    // Notification state
    notifications,
    unreadCount,
    loading,
    error,
    
    // Notification methods
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications,
    fetchUnreadCount,
    sendTestNotification,
    
    // Web Push state
    pushSupported,
    pushPermission,
    pushSubscribed,
    
    // Web Push methods
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    testPushNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
