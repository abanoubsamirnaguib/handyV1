import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, ShoppingCart, Bell, Search, User, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Helper function to determine if a link is active
  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNotifDropdownOpen = async () => {
    // Mark all as read when dropdown opens
    await markAllAsRead();
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await markAsRead(notif.id);
    }
    if (notif.link) navigate(notif.link);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value;
    if (searchTerm.trim()) {
      navigate(`/explore?search=${searchTerm}`);
    }
  };

  // Memoize the avatar to prevent unnecessary re-renders
  const userAvatar = useMemo(() => {
    return (
      <Avatar>
        <AvatarImage src={user?.avatar} />
        <AvatarFallback>{user?.name ? user.name.charAt(0) : 'U'}</AvatarFallback>
      </Avatar>
    );
  }, [user?.avatar, user?.name]);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-roman-500/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 space-x-reverse">
            <img 
              src="/Asset_12.svg" 
              alt="بازار Logo" 
              className="h-8 w-8 object-contain"
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold text-roman-500"
            >
              بازار
            </motion.div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1 space-x-reverse">
            <Link to="/" className={`px-3 py-2 text-sm font-medium hover:text-roman-500 transition-colors ${
              isActiveLink('/') ? 'text-roman-500 border-b-2 border-roman-500 font-semibold' : ''
            }`}>
              الرئيسية
            </Link>
            <Link to="/explore" className={`px-3 py-2 text-sm font-medium hover:text-roman-500 transition-colors ${
              isActiveLink('/explore') ? 'text-roman-500 border-b-2 border-roman-500 font-semibold' : ''
            }`}>
              استكشاف
            </Link>
            <Link to="/about-us" className={`px-3 py-2 text-sm font-medium hover:text-roman-500 transition-colors ${
              isActiveLink('/about-us') ? 'text-roman-500 border-b-2 border-roman-500 font-semibold' : ''
            }`}>
              من نحن / تواصل معنا
            </Link>
            <Link to="/announcements" className={`px-3 py-2 text-sm font-medium hover:text-roman-500 transition-colors ${
              isActiveLink('/announcements') ? 'text-roman-500 border-b-2 border-roman-500 font-semibold' : ''
            }`}>
              الإعلانات
            </Link>
            {/* <Link to="/policy" className={`px-3 py-2 text-sm font-medium hover:text-roman-500 transition-colors ${
              isActiveLink('/policy') ? 'text-roman-500 border-b-2 border-roman-500 font-semibold' : ''
            }`}>
              السياسات
            </Link> */}
            {user && (
              <>
                {user.role !== 'admin' && (
                  <Link to="/dashboard" className={`px-3 py-2 text-sm font-medium hover:text-roman-500 transition-colors ${
                    isActiveLink('/dashboard') ? 'text-roman-500 border-b-2 border-roman-500 font-semibold' : ''
                  }`}>
                    لوحة التحكم
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className={`px-3 py-2 text-sm font-medium hover:text-roman-500 flex items-center transition-colors ${
                    isActiveLink('/admin') ? 'text-roman-500 border-b-2 border-roman-500 font-semibold' : ''
                  }`}>
                    <Shield className={`ml-1 h-4 w-4 ${isActiveLink('/admin') ? 'text-roman-500' : 'text-warning-500'}`} />
                    لوحة المدير
                  </Link>
                )}
              </>
            )}
          </nav>          <form onSubmit={handleSearch} className="hidden md:flex relative mx-4 flex-1 max-w-md">
            <Input
              type="search"
              name="search"
              placeholder="ابحث عن منتجات يدوية..."
              className="w-full pr-10 border-roman-500/30 focus:border-warning-500"
            />
            <Button type="submit" variant="ghost" size="icon" className="absolute left-0 top-0 text-roman-500 hover:text-warning-500">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="hidden md:flex items-center space-x-2 space-x-reverse">
            {user ? (
              <>
                <Button variant="ghost" size="icon" onClick={() => navigate('/cart')} className="relative text-roman-500 hover:text-warning-500 hover:bg-success-100">
                  <ShoppingCart className="h-5 w-5" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-warning-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate('/wishlist')} className="text-roman-500 hover:text-warning-500 hover:bg-success-100">
                  <Heart className="h-5 w-5" />
                </Button>
                <DropdownMenu onOpenChange={open => { if (open) handleNotifDropdownOpen(); }}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative text-roman-500 hover:text-warning-500 hover:bg-success-100">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                    <DropdownMenuLabel className="text-neutral-900">الإشعارات</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">لا توجد إشعارات</div>
                    ) : (
                      notifications.slice(0, 10).map((notif, idx) => (
                        <DropdownMenuItem key={notif.id || idx} onClick={() => handleNotificationClick(notif)} className={!notif.read ? 'bg-gray-100 font-bold' : ''}>
                          <div className="flex flex-col w-full">
                            <span className="text-sm font-medium">{notif.title || 'إشعار'}</span>
                            <span className="text-xs text-gray-600">{notif.message}</span>
                            <span className="text-xs text-gray-400 mt-1">{notif.time || (notif.createdAt ? new Date(notif.createdAt).toLocaleString('ar-EG') : '')}</span>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 rounded-full">
                      {userAvatar}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-neutral-900">مرحباً, {user.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile/me')}>
                      الملف الشخصي
                    </DropdownMenuItem>
                    {user.role === 'admin' ? (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/admin/dashboard')} className="text-neutral-900 hover:text-warning-500">
                          لوحة تحكم المدير
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={() => navigate('/dashboard')} className="text-neutral-900 hover:text-warning-500">
                        لوحة التحكم
                      </DropdownMenuItem>                    )}
                    <DropdownMenuItem onClick={() => navigate('/chat')} className="text-neutral-900 hover:text-warning-500">
                      الرسائل
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-warning-500 focus:text-white focus:bg-warning-500">
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')} className="text-roman-500 hover:text-warning-500 hover:bg-success-100">
                  تسجيل الدخول
                </Button>
                <Button onClick={() => navigate('/register')} className="bg-roman-500 hover:bg-roman-500/90 text-white">
                  إنشاء حساب
                </Button>
              </>
            )}
          </div>

          <Button variant="ghost" size="icon" className="md:hidden text-roman-500 hover:text-warning-500 hover:bg-success-100" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-3 py-3 border-t border-roman-500/20"
          >
            <form onSubmit={handleSearch} className="relative mb-4">
              <Input
                type="search"
                name="search"
                placeholder="ابحث عن منتجات يدوية..."
                className="w-full pr-10 border-roman-500/30"
              />
              <Button type="submit" variant="ghost" size="icon" className="absolute left-0 top-0">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className={`px-3 py-2 text-sm font-medium hover:text-primary transition-colors ${
                isActiveLink('/') ? 'text-roman-500 bg-roman-500/10 rounded-md font-semibold' : ''
              }`} onClick={toggleMenu}>
                الرئيسية
              </Link>
              <Link to="/explore" className={`px-3 py-2 text-sm font-medium hover:text-primary transition-colors ${
                isActiveLink('/explore') ? 'text-roman-500 bg-roman-500/10 rounded-md font-semibold' : ''
              }`} onClick={toggleMenu}>
                استكشاف
              </Link>
              <Link to="/about-us" className={`px-3 py-2 text-sm font-medium hover:text-primary transition-colors ${
                isActiveLink('/about-us') ? 'text-roman-500 bg-roman-500/10 rounded-md font-semibold' : ''
              }`} onClick={toggleMenu}>
                من نحن / تواصل معنا
              </Link>
              <Link to="/announcements" className={`px-3 py-2 text-sm font-medium hover:text-primary transition-colors ${
                isActiveLink('/announcements') ? 'text-roman-500 bg-roman-500/10 rounded-md font-semibold' : ''
              }`} onClick={toggleMenu}>
                الإعلانات
              </Link>
              <Link to="/policy" className={`px-3 py-2 text-sm font-medium hover:text-primary transition-colors ${
                isActiveLink('/policy') ? 'text-roman-500 bg-roman-500/10 rounded-md font-semibold' : ''
              }`} onClick={toggleMenu}>
                السياسات
              </Link>
              {user && (
                <>
                  {user.role !== 'admin' && (
                    <Link to="/dashboard" className={`px-3 py-2 text-sm font-medium hover:text-primary transition-colors ${
                      isActiveLink('/dashboard') ? 'text-roman-500 bg-roman-500/10 rounded-md font-semibold' : ''
                    }`} onClick={toggleMenu}>
                      لوحة التحكم
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" className={`px-3 py-2 text-sm font-medium hover:text-primary flex items-center transition-colors ${
                      isActiveLink('/admin') ? 'text-roman-500 bg-roman-500/10 rounded-md font-semibold' : ''
                    }`} onClick={toggleMenu}>
                      <Shield className={`ml-1 h-4 w-4 ${isActiveLink('/admin') ? 'text-roman-500' : 'text-blue-600'}`} />
                      لوحة المدير
                    </Link>
                  )}
                </>
              )}
              {user ? (
                <>
                  <Link to="/profile/me" className={`px-3 py-2 text-sm font-medium hover:text-primary transition-colors ${
                    isActiveLink('/profile') ? 'text-roman-500 bg-roman-500/10 rounded-md font-semibold' : ''
                  }`} onClick={toggleMenu}>
                    الملف الشخصي
                  </Link>
                  <Link to="/chat" className={`px-3 py-2 text-sm font-medium hover:text-primary transition-colors ${
                    isActiveLink('/chat') ? 'text-roman-500 bg-roman-500/10 rounded-md font-semibold' : ''
                  }`} onClick={toggleMenu}>
                    الرسائل
                  </Link>
                  <Link to="/cart" className={`px-3 py-2 text-sm font-medium hover:text-primary transition-colors ${
                    isActiveLink('/cart') ? 'text-roman-500 bg-roman-500/10 rounded-md font-semibold' : ''
                  }`} onClick={toggleMenu}>
                    السلة ({cart.length})
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      toggleMenu();
                    }}
                    className="px-3 py-2 text-sm font-medium text-destructive text-right w-full"
                  >
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2 border-t">
                  <Button variant="outline" onClick={() => { navigate('/login'); toggleMenu(); }}>
                    تسجيل الدخول
                  </Button>
                  <Button onClick={() => { navigate('/register'); toggleMenu(); }}>
                    إنشاء حساب
                  </Button>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

// Use React.memo to prevent unnecessary re-renders of the entire navbar
export default React.memo(Navbar);
