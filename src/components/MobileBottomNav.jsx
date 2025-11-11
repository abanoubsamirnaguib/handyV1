import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, LogIn, Bell, MessageCircle, LayoutDashboard } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

const navItems = [
  {
    label: 'لوحة التحكم',
    icon: LayoutDashboard,
    to: '/dashboard',
    show: () => !!localStorage.getItem('token'),
    type: 'regular'
  },
  {
    label: 'الإشعارات',
    icon: Bell,
    to: '/notifications',
    show: () => !!localStorage.getItem('token'),
    type: 'notification'
  },
  {
    label: 'استكشاف',
    icon: Search,
    to: '/explore',
    show: () => true,
    type: 'search'
  },
  {
    label: 'السلة',
    icon: ShoppingCart,
    to: '/cart',
    show: () => !!localStorage.getItem('token'),
    type: 'regular'
  },
  {
    label: 'الرسائل',
    icon: MessageCircle,
    to: '/chat',
    show: () => !!localStorage.getItem('token'),
    type: 'regular'
  },
  {
    label: 'تسجيل الدخول',
    icon: LogIn,
    to: '/login',
    show: () => !localStorage.getItem('token'),
    type: 'regular'
  },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  
  const renderNavItem = (item) => {
    const { label, icon: Icon, to, type } = item;
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    
    if (type === 'search') {
      return (
        <Link
          key={to}
          to={to}
          className="relative flex flex-col items-center justify-center"
          aria-label={label}
        >
          {/* Modern elevated search button with white background */}
          <div className="relative transform -translate-y-3">
            <div className={`relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ${
              isActive 
                ? 'bg-white scale-110 shadow-roman-500/30' 
                : 'bg-white hover:scale-105'
            } border-4 border-white`}>
              {/* Gradient background circle */}
              <div className={`absolute inset-2 rounded-full bg-gradient-to-br transition-all duration-300 ${
                isActive 
                  ? 'from-roman-500 via-orange-500 to-red-500' 
                  : 'from-roman-500/90 via-orange-400 to-orange-500'
              }`} />
              {/* Icon container */}
              <div className="relative z-10 flex items-center justify-center">
                <Icon size={24} className="text-white drop-shadow-sm" />
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            {/* Modern shadow underneath */}
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-roman-500/20 rounded-full blur-xl" />
          </div>
          <span className={`text-xs font-medium mt-0 transition-colors duration-200 ${
            isActive ? 'text-roman-500 font-semibold' : 'text-neutral-900/70'
          }`}>
            {label}
          </span>
        </Link>
      );
    }
    
    if (type === 'notification') {
      return (
        <Link
          key={to}
          to={to}
          className={`relative flex flex-col items-center justify-center text-xs font-medium transition-colors duration-200 ${
            isActive ? 'text-roman-500' : 'text-neutral-900/70'
          } hover:text-roman-500`}
          aria-label={label}
        >
          <div className="relative">
            <Icon size={24} className="mb-1" />
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-white shadow-lg animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
          <span className="text-xs">{label}</span>
        </Link>
      );
    }
    
    // Regular nav items
    return (
      <Link
        key={to}
        to={to}
        className={`flex flex-col items-center justify-center text-xs font-medium transition-colors duration-200 ${
          isActive ? 'text-roman-500' : 'text-neutral-900/70'
        } hover:text-roman-500`}
        aria-label={label}
      >
        <Icon size={24} className="mb-1" />
        {label}
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-roman-500/10 shadow-xl flex justify-around items-end h-20 md:hidden pt-2 pb-4 rounded-t-3xl">
      {navItems.filter(item => item.show()).map(renderNavItem)}
    </nav>
  );
};

export default MobileBottomNav;
