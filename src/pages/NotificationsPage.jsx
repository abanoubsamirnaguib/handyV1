import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Package, MessageSquare, Star, DollarSign, Loader2, RefreshCw } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const { 
    notifications, 
    unreadCount, 
    loading,
    error,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    refreshNotifications
  } = useNotifications();
  
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const getTypeColor = (type) => {
    const colors = {
      order: 'bg-blue-100 text-blue-600',
      message: 'bg-green-100 text-green-600',
      review: 'bg-yellow-100 text-yellow-600',
      payment: 'bg-purple-100 text-purple-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const getNotificationIcon = (type) => {
    const icons = {
      order: Package,
      message: MessageSquare,
      review: Star,
      payment: DollarSign
    };
    return icons[type] || Bell;
  };

  const handleNotificationClick = (notification) => {
    // Mark the notification as read when clicked
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // First, check if the notification has a link property (from database)
    // This matches the behavior in Navbar
    if (notification.link) {
      navigate(notification.link);
      return;
    }
    
    // Fall back to navigation based on notification type and data
    switch (notification.type) {
      case 'order':
        navigate(`/orders/${notification.data?.orderId || ''}`);
        break;
      case 'message':
        navigate(`/messages/${notification.data?.conversationId || ''}`);
        break;
      case 'review':
        navigate(`/products/${notification.data?.productId || ''}#reviews`);
        break;
      case 'payment':
        navigate(`/dashboard/earnings`);
        break;
      default:
        // If no specific route is defined, use the link property from data if available
        if (notification.data?.link) {
          navigate(notification.data.link);
        }
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-warning-500" />
              <h1 className="text-xl font-bold text-neutral-900">الإشعارات</h1>
              {unreadCount > 0 && (
                <span className="bg-warning-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-400 hover:text-warning-500 transition-colors disabled:opacity-50"
                title="تحديث"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-warning-500 font-medium hover:text-warning-500/80"
                >
                  قراءة الكل
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'الكل' },
              { key: 'unread', label: 'غير مقروءة' },
              { key: 'read', label: 'مقروءة' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-white text-warning-500 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-warning-500 animate-spin" />
            <span className="mr-3 text-gray-500">جارِ تحميل الإشعارات...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-500 mb-2">
              خطأ في تحميل الإشعارات
            </h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-roman-500 text-white rounded-lg hover:bg-roman-500/90 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              لا توجد إشعارات
            </h3>
            <p className="text-gray-400">
              {filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'ستظهر الإشعارات هنا'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg border p-4 transition-all hover:shadow-md ${
                    !notification.read ? 'border-r-4 border-r-warning-500' : 'border-gray-200'
                  } cursor-pointer`}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div 
                        className="flex items-start justify-between mb-1"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <h3 className={`font-medium ${!notification.read ? 'text-neutral-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap mr-2">
                          {notification.time}
                        </span>
                      </div>
                      <p 
                        className="text-sm text-gray-600 mb-3 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="flex items-center gap-1 text-xs text-warning-500 hover:text-warning-500/80"
                          >
                            <Check className="w-3 h-3" />
                            تم القراءة
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
