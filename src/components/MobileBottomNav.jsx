import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, LogIn, MessageCircle, LayoutDashboard, Store, Plus, Package, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const getNavItems = (user) => [
  {
    label: 'لوحة التحكم',
    icon: LayoutDashboard,
    to: '/dashboard',
    show: () => !!localStorage.getItem('token'),
    type: 'regular'
  },
  {
    label: user?.active_role === 'seller' ? 'الأرباح' : 'السلة',
    icon: user?.active_role === 'seller' ? DollarSign : ShoppingCart,
    to: user?.active_role === 'seller' ? '/dashboard/earnings' : '/cart',
    show: () => !!localStorage.getItem('token'),
    type: 'regular'
  },
  {
    label: user?.active_role === 'seller' ? 'إضافة منتج' : 'استكشاف',
    icon: user?.active_role === 'seller' ? Plus : Store,
    to: user?.active_role === 'seller' ? '/dashboard/gigs' : '/explore',
    show: () => true,
    type: 'search'
  },
  {
    label: 'الطلبات',
    icon: Package,
    to: '/dashboard/orders',
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
  const { user } = useAuth();
  const navItems = getNavItems(user);
  
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
            <div className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
              isActive 
                ? 'bg-white scale-110' 
                : 'bg-white hover:scale-105'
            } border-4 border-white`}>
              {/* Main color background circle */}
              <div className="absolute inset-2 rounded-full bg-roman-500 transition-all duration-300" />
              {/* Icon container */}
              <div className="relative z-10 flex items-center justify-center">
                <Icon size={24} className="text-white drop-shadow-sm" />
              </div>
            </div>
          </div>
          <span className={`text-xs font-medium mt-0 transition-colors duration-200 ${
            isActive ? 'text-roman-500 font-semibold' : 'text-neutral-900/70'
          }`}>
            {label}
          </span>
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
