import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, Package, MessageSquare, Star, DollarSign, Loader2, ExternalLink } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeColor = (type) => {
    const colors = {
      order: 'bg-blue-100 text-blue-600',
      message: 'bg-green-100 text-green-600',
      review: 'bg-yellow-100 text-yellow-600',
      payment: 'bg-purple-100 text-purple-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const getNotificationIcon = (type) => {
    const icons = {
      order: Package,
      message: MessageSquare,
      review: Star,
      payment: DollarSign,
    };
    return icons[type] || Bell;
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);

    if (notification.link) {
      navigate(notification.link);
      return;
    }

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
        if (notification.data?.link) {
          navigate(notification.data.link);
        }
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteNotification(id);
  };

  const recentNotifications = notifications.slice(0, 7);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell trigger */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-roman-500 hover:text-warning-500 hover:bg-success-100"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] overflow-hidden" style={{ maxHeight: '520px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-l from-roman-500/5 to-transparent">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-roman-500" />
              <h3 className="font-bold text-neutral-900">الإشعارات</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-medium">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-roman-500 hover:text-warning-500 font-medium flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                قراءة الكل
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-roman-500" />
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Bell className="h-10 w-10 mb-2 opacity-40" />
                <p className="text-sm">لا توجد إشعارات</p>
              </div>
            ) : (
              recentNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-gray-50 border-b border-gray-50 last:border-b-0 ${
                      !notification.read ? 'bg-roman-500/5' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${getTypeColor(notification.type)}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-snug ${!notification.read ? 'font-semibold text-neutral-900' : 'text-gray-700'}`}>
                          {notification.title || notification.message}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 mt-1.5 rounded-full bg-roman-500 flex-shrink-0" />
                        )}
                      </div>
                      {notification.title && notification.message && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                      )}
                      <span className="text-[11px] text-gray-400 mt-1 block">{notification.time}</span>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {!notification.read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                          className="p-1 rounded hover:bg-green-100 text-gray-400 hover:text-green-600 transition-colors"
                          title="تحديد كمقروء"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, notification.id)}
                        className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50/50">
            <button
              onClick={() => { setIsOpen(false); navigate('/notifications'); }}
              className="w-full text-center text-sm font-medium text-roman-500 hover:text-warning-500 transition-colors flex items-center justify-center gap-1.5"
            >
              عرض كل الإشعارات
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
