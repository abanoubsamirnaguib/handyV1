import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, LogIn } from 'lucide-react';

const navItems = [
  {
    label: 'الرئيسية',
    icon: Home,
    to: '/',
    show: () => true,
  },
  {
    label: 'استكشاف',
    icon: Search,
    to: '/explore',
    show: () => true,
  },
  {
    label: 'السلة',
    icon: ShoppingCart,
    to: '/cart',
    show: () => !!localStorage.getItem('token') ,
  },
  {
    label: 'حسابي',
    icon: User,
    to: '/profile/me',
    show: () => !!localStorage.getItem('token'),
  },
  {
    label: 'تسجيل الدخول',
    icon: LogIn,
    to: '/login',
    show: () => !localStorage.getItem('token'),
  },
];

const MobileBottomNav = () => {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-olivePrimary/10 shadow-lg flex justify-around items-center h-16 md:hidden">
      {navItems.filter(item => item.show()).map(({ label, icon: Icon, to }) => {
        const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center text-xs font-medium transition-colors duration-200 ${isActive ? 'text-burntOrange' : 'text-darkOlive/70'} hover:text-burntOrange`}
            aria-label={label}
          >
            <Icon size={24} className="mb-1" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
