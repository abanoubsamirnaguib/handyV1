import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, ShoppingCart, Bell, Search, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
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
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value;
    if (searchTerm.trim()) {
      navigate(`/explore?search=${searchTerm}`);
    }
  };
<<<<<<< HEAD
=======

  // Memoize the avatar to prevent unnecessary re-renders
  const userAvatar = useMemo(() => {
    return (
      <Avatar>
        <AvatarImage src={user?.avatar} />
        <AvatarFallback>{user?.name ? user.name.charAt(0) : 'U'}</AvatarFallback>
      </Avatar>
    );
  }, [user?.avatar, user?.name]);

>>>>>>> 7d867ad382d5e5b4f9eb074a42c3618db3973b0c
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-olivePrimary/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold text-olivePrimary"
            >
              بازار
            </motion.div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1 space-x-reverse">
            <Link to="/" className="px-3 py-2 text-sm font-medium hover:text-olivePrimary">
              الرئيسية
            </Link>
            <Link to="/explore" className="px-3 py-2 text-sm font-medium hover:text-olivePrimary">
              استكشاف
            </Link>
            {user && (
              <>
                {user.role !== 'admin' && (
                  <Link to="/dashboard" className="px-3 py-2 text-sm font-medium hover:text-olivePrimary">
                    لوحة التحكم
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="px-3 py-2 text-sm font-medium hover:text-burntOrange flex items-center">
                    <Shield className="ml-1 h-4 w-4 text-burntOrange" />
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
              className="w-full pr-10 border-olivePrimary/30 focus:border-burntOrange"
            />
            <Button type="submit" variant="ghost" size="icon" className="absolute left-0 top-0 text-olivePrimary hover:text-burntOrange">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="hidden md:flex items-center space-x-2 space-x-reverse">
            {user ? (
              <>
                <Button variant="ghost" size="icon" onClick={() => navigate('/cart')} className="relative text-olivePrimary hover:text-burntOrange hover:bg-lightGreen">
                  <ShoppingCart className="h-5 w-5" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-burntOrange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="text-olivePrimary hover:text-burntOrange hover:bg-lightGreen">
                  <Bell className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
<<<<<<< HEAD
                    <Button variant="ghost" className="p-0 rounded-full border-2 border-olivePrimary/50 hover:border-burntOrange">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-olivePrimary text-white">{user.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
=======
                    <Button variant="ghost" className="p-0 rounded-full">
                      {userAvatar}
>>>>>>> 7d867ad382d5e5b4f9eb074a42c3618db3973b0c
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-darkOlive">مرحباً, {user.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
<<<<<<< HEAD
                    <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)} className="text-darkOlive hover:text-burntOrange">
=======
                    <DropdownMenuItem onClick={() => navigate('/profile/me')}>
>>>>>>> 7d867ad382d5e5b4f9eb074a42c3618db3973b0c
                      الملف الشخصي
                    </DropdownMenuItem>
                    {user.role === 'admin' ? (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/admin/dashboard')} className="text-darkOlive hover:text-burntOrange">
                          لوحة تحكم المدير
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={() => navigate('/dashboard')} className="text-darkOlive hover:text-burntOrange">
                        لوحة التحكم
                      </DropdownMenuItem>                    )}
                    <DropdownMenuItem onClick={() => navigate('/chat')} className="text-darkOlive hover:text-burntOrange">
                      الرسائل
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-burntOrange focus:text-white focus:bg-burntOrange">
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')} className="text-olivePrimary hover:text-burntOrange hover:bg-lightGreen">
                  تسجيل الدخول
                </Button>
                <Button onClick={() => navigate('/register')} className="bg-olivePrimary hover:bg-olivePrimary/90 text-white">
                  إنشاء حساب
                </Button>
              </>
            )}
          </div>

          <Button variant="ghost" size="icon" className="md:hidden text-olivePrimary hover:text-burntOrange hover:bg-lightGreen" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-3 py-3 border-t border-olivePrimary/20"
          >
            <form onSubmit={handleSearch} className="relative mb-4">
              <Input
                type="search"
                name="search"
                placeholder="ابحث عن منتجات يدوية..."
                className="w-full pr-10 border-olivePrimary/30"
              />
              <Button type="submit" variant="ghost" size="icon" className="absolute left-0 top-0">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="px-3 py-2 text-sm font-medium hover:text-primary" onClick={toggleMenu}>
                الرئيسية
              </Link>
              <Link to="/explore" className="px-3 py-2 text-sm font-medium hover:text-primary" onClick={toggleMenu}>
                استكشاف
              </Link>
              {user && (
                <>
                  {user.role !== 'admin' && (
                    <Link to="/dashboard" className="px-3 py-2 text-sm font-medium hover:text-primary" onClick={toggleMenu}>
                      لوحة التحكم
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" className="px-3 py-2 text-sm font-medium hover:text-blue-600 flex items-center" onClick={toggleMenu}>
                      <Shield className="ml-1 h-4 w-4 text-blue-600" />
                      لوحة المدير
                    </Link>
                  )}
                </>
              )}
              {user ? (
                <>
                  <Link to="/profile/me" className="px-3 py-2 text-sm font-medium hover:text-primary" onClick={toggleMenu}>
                    الملف الشخصي
                  </Link>
                  <Link to="/chat" className="px-3 py-2 text-sm font-medium hover:text-primary" onClick={toggleMenu}>
                    الرسائل
                  </Link>
                  <Link to="/cart" className="px-3 py-2 text-sm font-medium hover:text-primary" onClick={toggleMenu}>
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
