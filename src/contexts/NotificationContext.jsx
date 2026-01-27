import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import echo, { updateEchoAuth } from '@/lib/echo';
import { useAuth } from '@/contexts/AuthContext';
import { ensurePushSubscriptionSaved } from '@/lib/pushNotifications';

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
  const { user } = useAuth(); // Get user from AuthContext

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching notifications for user:', user?.id);
      const data = await api.getNotifications();
      console.log('Notifications fetched:', data);
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
      // Fallback to empty array for now
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
      console.error('Error fetching unread count:', err);
      return notifications.filter(n => !n.read).length;
    }
  };

  useEffect(() => {
    // Only fetch if user is authenticated
    if (user) {
      fetchNotifications();

      // If the user already granted permission earlier, ensure we have a saved subscription.
      // (We do NOT auto-prompt here; the UI can trigger permission request.)
      ensurePushSubscriptionSaved().catch(() => {});
      
      // Set up real-time notification listening
      if (echo && user.id) {
        try {
          // Ensure Echo has the latest Authorization header before subscribing
          updateEchoAuth();

          // Listen for new notifications using user ID from AuthContext
          const channel = echo.private(`App.Models.User.${user.id}`);
          channel
            // NOTE: because backend uses broadcastAs() = 'notification.created', Echo must listen with a leading dot.
            .listen('.notification.created', (event) => {
              console.log('Real-time notification received:', event);
              setNotifications(prev => [event, ...prev]);
            });
        } catch (error) {
          console.error('Error setting up real-time notifications:', error);
        }
      }
    }

    // Cleanup function
    return () => {
      if (echo && user?.id) {
        try {
          echo.leave(`App.Models.User.${user.id}`);
        } catch (error) {
          console.error('Error cleaning up echo listeners:', error);
        }
      }
    };
  }, [user]); // Depend on user instead of token

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
      console.error('Error marking notification as read:', err);
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
      console.error('Error marking all notifications as read:', err);
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
      console.error('Error deleting notification:', err);
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
      console.error('Error sending test notification:', err);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications,
    fetchUnreadCount,
    sendTestNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
