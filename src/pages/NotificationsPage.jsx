import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Package, MessageSquare, Star, DollarSign, Loader2, RefreshCw, BellRing, Info } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import {
  isPushSupported,
  getCurrentPushSubscription,
  requestAndSubscribePush,
  unsubscribePush,
} from '@/lib/pushNotifications';

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
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushSupported] = useState(() => isPushSupported());
  const navigate = useNavigate();

  const updatePushStatus = async () => {
    const sub = await getCurrentPushSubscription();
    setPushEnabled(!!sub);
  };

  useEffect(() => {
    if (pushSupported) updatePushStatus();
  }, [pushSupported]);

  const handlePushToggle = async () => {
    if (!pushSupported || pushLoading) return;
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribePush();
        setPushEnabled(false);
      } else {
        const result = await requestAndSubscribePush();
        setPushEnabled(result?.subscribed === true);
      }
    } catch (err) {
      console.error('Push toggle error:', err);
    } finally {
      setPushLoading(false);
    }
  };

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

  // Shared notification card renderer
  const renderNotificationCard = (notification) => {
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
            className={`p-2 rounded-lg flex-shrink-0 ${getTypeColor(notification.type)}`}
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
                  onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                  className="flex items-center gap-1 text-xs text-warning-500 hover:text-warning-500/80"
                >
                  <Check className="w-3 h-3" />
                  تم القراءة
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
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
  };

  // Shared notifications body (loading/error/empty/list)
  const renderBody = () => {
    if (loading) return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-warning-500 animate-spin" />
        <span className="mr-3 text-gray-500">جارِ تحميل الإشعارات...</span>
      </div>
    );
    if (error) return (
      <div className="text-center py-16">
        <Bell className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-500 mb-2">خطأ في تحميل الإشعارات</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button onClick={handleRefresh} className="px-4 py-2 bg-roman-500 text-white rounded-lg hover:bg-roman-500/90 transition-colors">
          إعادة المحاولة
        </button>
      </div>
    );
    if (filteredNotifications.length === 0) return (
      <div className="text-center py-16">
        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">لا توجد إشعارات</h3>
        <p className="text-gray-400">
          {filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'ستظهر الإشعارات هنا'}
        </p>
      </div>
    );
    return <div className="space-y-3">{filteredNotifications.map(renderNotificationCard)}</div>;
  };

  return (
    <>
      {/* ═══════════════════════════════════════
          MOBILE & TABLET  (below lg)
          Keep the original layout untouched
      ═══════════════════════════════════════ */}
      <div className="lg:hidden min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-warning-500" />
                <h1 className="text-xl font-bold text-neutral-900">الإشعارات</h1>
                {unreadCount > 0 && (
                  <span className="bg-warning-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {pushSupported && (
                  <button
                    onClick={handlePushToggle}
                    disabled={pushLoading}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                      pushEnabled ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100' : 'text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200'
                    }`}
                    title={pushEnabled ? 'إشعارات الدفع مفعّلة - اضغط لإيقافها' : 'تفعيل إشعارات الدفع'}
                  >
                    {pushLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BellRing className="w-5 h-5" />}
                  </button>
                )}
                <button onClick={handleRefresh} disabled={refreshing} className="p-2 text-gray-400 hover:text-warning-500 transition-colors disabled:opacity-50" title="تحديث">
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-sm text-warning-500 font-medium hover:text-warning-500/80">
                    قراءة الكل
                  </button>
                )}
              </div>
            </div>
            {/* Filter Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[{ key: 'all', label: 'الكل' }, { key: 'unread', label: 'غير مقروءة' }, { key: 'read', label: 'مقروءة' }].map(({ key, label }) => (
                <button key={key} onClick={() => setFilter(key)} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${filter === key ? 'bg-white text-warning-500 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* List */}
        <div className="max-w-lg mx-auto px-4 py-4">
          {pushSupported && !pushEnabled && !pushLoading && (
            <div className="mb-4 bg-roman-100 border border-roman-200 rounded-lg p-3 flex items-start gap-3">
              <Info className="w-5 h-5 text-roman-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-roman-700">يرجى تفعيل الإشعارات من الزر أعلاه حتى نتمكن من إرسال إشعارات التطبيق وأخبار منتجاتك وطلباتك</p>
            </div>
          )}
          {renderBody()}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          DESKTOP  (lg and above)
          New wide two-column layout
      ═══════════════════════════════════════ */}
      <div className="hidden lg:block min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Page title row */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-warning-50 flex items-center justify-center">
                <Bell className="w-6 h-6 text-warning-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">الإشعارات</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {unreadCount > 0 ? `لديك ${unreadCount} إشعار غير مقروء` : 'جميع الإشعارات مقروءة'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning-50 text-warning-600 font-medium text-sm hover:bg-warning-100 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  تعيين الكل كمقروء
                </button>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                تحديث
              </button>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            {/* ── Left sidebar ── */}
            <aside className="w-72 flex-shrink-0 space-y-4">
              {/* Stats card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">ملخص</h2>
                <div className="space-y-3">
                  {[
                    { label: 'إجمالي الإشعارات', value: notifications.length, color: 'text-neutral-900' },
                    { label: 'غير مقروءة', value: unreadCount, color: 'text-warning-500' },
                    { label: 'مقروءة', value: notifications.length - unreadCount, color: 'text-green-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{label}</span>
                      <span className={`text-sm font-bold ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filter card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">تصفية</h2>
                {[{ key: 'all', label: 'الكل', count: notifications.length },
                  { key: 'unread', label: 'غير مقروءة', count: unreadCount },
                  { key: 'read', label: 'مقروءة', count: notifications.length - unreadCount }
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      filter === key ? 'bg-warning-50 text-warning-600' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${filter === key ? 'bg-warning-100 text-warning-600' : 'bg-gray-100 text-gray-500'}`}>
                      {count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Push notifications card */}
              {pushSupported && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">إشعارات الدفع</h2>
                  {!pushEnabled && !pushLoading && (
                    <div className="mb-3 bg-roman-50 border border-roman-100 rounded-lg p-3">
                      <p className="text-xs text-roman-700">فعّل إشعارات الدفع لتلقي تنبيهات فورية حتى لو لم تكن في الموقع</p>
                    </div>
                  )}
                  <button
                    onClick={handlePushToggle}
                    disabled={pushLoading}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                      pushEnabled ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-roman-500 text-white hover:bg-roman-500/90'
                    }`}
                  >
                    {pushLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
                    {pushEnabled ? 'إيقاف إشعارات الدفع' : 'تفعيل إشعارات الدفع'}
                  </button>
                </div>
              )}
            </aside>

            {/* ── Main content ── */}
            <main className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Top bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-neutral-900">
                    {filter === 'all' ? 'كل الإشعارات' : filter === 'unread' ? 'الإشعارات غير المقروءة' : 'الإشعارات المقروءة'}
                    <span className="mr-2 text-sm font-normal text-gray-400">({filteredNotifications.length})</span>
                  </h2>
                </div>
                {/* Body */}
                <div className="p-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 text-warning-500 animate-spin" />
                      <span className="mr-3 text-gray-500">جارِ تحميل الإشعارات...</span>
                    </div>
                  ) : error ? (
                    <div className="text-center py-20">
                      <Bell className="w-16 h-16 text-red-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-red-500 mb-2">خطأ في تحميل الإشعارات</h3>
                      <p className="text-gray-400 mb-4">{error}</p>
                      <button onClick={handleRefresh} className="px-5 py-2 bg-roman-500 text-white rounded-lg hover:bg-roman-500/90 transition-colors">
                        إعادة المحاولة
                      </button>
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-10 h-10 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-500 mb-2">لا توجد إشعارات</h3>
                      <p className="text-gray-400">{filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'ستظهر الإشعارات هنا'}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredNotifications.map((notification) => {
                        const IconComponent = getNotificationIcon(notification.type);
                        return (
                          <div
                            key={notification.id}
                            className={`rounded-xl border p-5 transition-all hover:shadow-md group ${
                              !notification.read ? 'border-r-4 border-r-warning-500 bg-warning-50/30' : 'border-gray-200 bg-white hover:bg-gray-50/50'
                            } cursor-pointer`}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={`p-3 rounded-xl flex-shrink-0 ${getTypeColor(notification.type)}`}
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1" onClick={() => handleNotificationClick(notification)}>
                                  <h3 className={`font-semibold text-base ${!notification.read ? 'text-neutral-900' : 'text-gray-700'}`}>
                                    {notification.title}
                                  </h3>
                                  <span className="text-xs text-gray-400 whitespace-nowrap mr-4 mt-0.5">{notification.time}</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-4 leading-relaxed" onClick={() => handleNotificationClick(notification)}>
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                                  {!notification.read && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                                      className="flex items-center gap-1.5 text-xs text-warning-500 hover:text-warning-600 font-medium"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      تعيين كمقروء
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    حذف
                                  </button>
                                </div>
                              </div>
                              {!notification.read && (
                                <div className="w-2.5 h-2.5 rounded-full bg-warning-500 flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
