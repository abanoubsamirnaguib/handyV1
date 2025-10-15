import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  MessageCircle, 
  Settings, 
  Users, 
  LogOut, 
  Tag, 
  UserCheck, 
  PackageOpen,
  Menu,
  X,
  ChevronLeft,
  Shield,
  Truck,
  DollarSign,
  HelpCircle,
  Megaphone,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useAdminStats } from '@/hooks/useAdminStats';
import '@/components/dashboard/sidebar.css';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isSidebarOpen, toggleSidebar, isMobile, isMobileMenuOpen } = useSidebar();
  // Use our custom hook for navigation
  const location = usePageNavigation();
  const { stats } = useAdminStats();

  const adminLinks = [
    { path: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { 
      path: '/admin/orders', 
      label: 'الطلبات', 
      icon: ShoppingBag,
      badge: stats?.pending_orders > 0 ? stats.pending_orders : null
    },
    { path: '/admin/categories', label: 'التصنيفات', icon: Tag },
    { path: '/admin/products', label: 'المنتجات', icon: PackageOpen },
    { path: '/admin/sellers', label: 'البائعين', icon: UserCheck },
    { path: '/admin/users', label: 'المستخدمين', icon: Users },
    { path: '/admin/cities', label: 'المدن', icon: MapPin },
    { path: '/admin/platform-profits', label: 'أرباح المنصة', icon: DollarSign },
    { path: '/admin/delivery', label: 'موظفي التوصيل', icon: Truck },
    { path: '/admin/delivery-orders', label: 'توزيع الطلبات', icon: PackageOpen },
    { path: '/admin/withdrawals', label: 'طلبات السحب', icon: DollarSign },
    { path: '/admin/messages', label: 'المحادثات', icon: MessageCircle },
    { path: '/admin/contact-us', label: 'رسائل التواصل', icon: HelpCircle },
    { path: '/admin/announcements', label: 'الإعلانات', icon: Megaphone },
    { path: '/admin/settings', label: 'إعدادات النظام', icon: Settings },
  ];

  return (      <AnimatePresence>      {(isMobile && isMobileMenuOpen || !isMobile) && (        <motion.aside 
          initial={{ width: isMobile ? 0 : (isSidebarOpen ? '16rem' : '5rem'), x: isMobile ? -250 : 0 }}
          animate={{ width: isMobile ? '16rem' : (isSidebarOpen ? '16rem' : '5rem'), x: 0 }}
          exit={{ width: 0, x: -250 }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          className={`bg-background/95 backdrop-blur-md border-l border-border flex flex-col z-30 ${
            isMobile ? 'fixed top-0 right-0 h-screen shadow-lg' : 'relative h-full'
          } ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
        >
          {isMobile && (
            <button 
              onClick={toggleSidebar} 
              className="absolute top-4 left-4 p-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <X size={20} />
            </button>
          )}

          <div className="p-4 space-y-4 overflow-y-auto flex-grow">
            <div className="flex items-center justify-between mb-6 px-2">
              <Link to="/" className="flex items-center">                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`text-xl font-bold text-roman-500 ${!isSidebarOpen && !isMobile ? 'scale-0 w-0 opacity-0' : 'scale-100 opacity-100'} transition-all duration-300`}
                >
                  بازار
                </motion.div>
              </Link>
              {!isMobile && (
                <button 
                  onClick={toggleSidebar} 
                  className="p-1 rounded-full bg-gray-100 text-blue-600 hover:bg-gray-200 transition-colors duration-200"
                >
                  <ChevronLeft size={20} className={`sidebar-icon ${!isSidebarOpen ? 'sidebar-icon-rotated' : ''}`} />
                </button>
              )}
            </div>

            <div className={`py-2 ${!isSidebarOpen && !isMobile ? 'hidden' : 'block'}`}>
              <h2 className="text-lg font-semibold text-blue-600 px-3 pb-2 flex items-center">
                <Shield className="ml-1 h-4 w-4 text-blue-600" />
                لوحة المدير
              </h2>
            </div>

            <nav className="space-y-1">
              {adminLinks.map(link => (                <Button
                  key={link.path}
                  variant={location.pathname === link.path ? 'subtle' : 'ghost'}
                  className={`w-full justify-${isSidebarOpen || isMobile ? 'start' : 'center'} text-right px-3 py-2 ${
                    location.pathname === link.path ? 'bg-blue-600/10 text-blue-600 font-medium' : 'hover:bg-gray-100 hover:text-blue-600 text-sm font-medium'
                  } transition-all duration-200 relative`}
                  onClick={() => {
                    navigate(link.path);
                    if (isMobile) toggleSidebar();
                  }}                >                  <link.icon className={`${isSidebarOpen || isMobile ? 'ml-2' : ''} h-4 w-4`} />
                  {(isSidebarOpen || isMobile) && (
                    <span className="text-neutral-900 flex-1">
                      {link.label}
                    </span>
                  )}
                  {link.badge && (isSidebarOpen || isMobile) && (
                    <Badge 
                      variant="destructive" 
                      className="ml-2 min-w-[20px] h-5 text-xs px-1.5 animate-pulse"
                    >
                      {link.badge}
                    </Badge>
                  )}
                  {link.badge && (!isSidebarOpen && !isMobile) && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -left-1 min-w-[18px] h-[18px] text-[10px] px-1 animate-pulse"
                    >
                      {link.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </nav>
            <Separator className="my-4" />            <Button
              variant="ghost"
              className={`w-full justify-${isSidebarOpen || isMobile ? 'start' : 'center'} text-right px-3 py-2 text-sm font-medium text-destructive hover:bg-red-50 hover:text-destructive transition-all duration-200`}
              onClick={() => {
                logout();
                navigate('/');
              }}
            >              <LogOut className={`${isSidebarOpen || isMobile ? 'ml-2' : ''} h-4 w-4`} />
              {(isSidebarOpen || isMobile) && (
                <span className="text-destructive">تسجيل الخروج</span>
              )}
            </Button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

const AdminLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { isSidebarOpen, toggleSidebar, isMobile, isMobileMenuOpen, closeMobileSidebar } = useSidebar();
  const scrollRef = useScrollToTop();
  const { stats } = useAdminStats();

  // Admin navigation links
  const adminLinks = [
    { path: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { 
      path: '/admin/orders', 
      label: 'الطلبات', 
      icon: ShoppingBag,
      badge: stats?.pending_orders > 0 ? stats.pending_orders : null
    },
    { path: '/admin/categories', label: 'التصنيفات', icon: Tag },
    { path: '/admin/products', label: 'المنتجات', icon: PackageOpen },
    { path: '/admin/sellers', label: 'البائعين', icon: UserCheck },
    { path: '/admin/users', label: 'المستخدمين', icon: Users },
    { path: '/admin/cities', label: 'المدن', icon: MapPin },
    { path: '/admin/platform-profits', label: 'أرباح المنصة', icon: DollarSign },
    { path: '/admin/delivery', label: 'موظفي التوصيل', icon: Truck },
    { path: '/admin/delivery-orders', label: 'توزيع الطلبات', icon: PackageOpen },
    { path: '/admin/withdrawals', label: 'طلبات السحب', icon: DollarSign },
    { path: '/admin/messages', label: 'المحادثات', icon: MessageCircle },
    { path: '/admin/contact-us', label: 'رسائل التواصل', icon: HelpCircle },
    { path: '/admin/settings', label: 'إعدادات النظام', icon: Settings },
  ];return (    <div className="flex min-h-[calc(100vh-var(--navbar-height,100px))]">
      {!isMobile && <AdminSidebar />}      <main 
        ref={scrollRef}
        className={`flex-1 bg-background overflow-y-auto ${
          !isMobile ? (isSidebarOpen ? 'dashboard-content-expanded' : 'dashboard-content-collapsed') : 'dashboard-content'
        }`}
      >{isMobile && (
          <div className="mobile-header p-4 flex justify-between items-center bg-background/95 backdrop-blur-md border-b border-border">
            <div className="flex items-center">
              <Shield className="ml-1 h-4 w-4 text-blue-600" />
              <h1 className="text-lg font-semibold text-blue-600">لوحة المدير</h1>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleSidebar}
              className="text-blue-600 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        )}
          {isMobile && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full bg-background/95 backdrop-blur-md border-b border-border"
          >
            <div className="p-4">
              <nav className="flex flex-col space-y-2">
                {adminLinks.map(link => (
                  <Link 
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 text-sm font-medium flex items-center justify-between ${
                      location.pathname === link.path 
                        ? 'text-blue-600' 
                        : 'hover:text-blue-600'
                    }`}
                    onClick={() => toggleSidebar()}
                  >
                    <div className="flex items-center">
                      <link.icon className="ml-2 h-4 w-4" />
                      {link.label}
                    </div>
                    {link.badge && (
                      <Badge 
                        variant="destructive" 
                        className="min-w-[20px] h-5 text-xs px-1.5 animate-pulse"
                      >
                        {link.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
                <Separator className="my-2" />
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="px-3 py-2 text-sm font-medium text-destructive hover:text-destructive-darker flex items-center text-right w-full"
                >
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </button>
              </nav>
            </div>
          </motion.div>
        )}
        
        <Outlet />
      </main>
    </div>
  );
};

const AdminLayoutWithProvider = () => {
  return (
    <SidebarProvider>
      <AdminLayout />
    </SidebarProvider>
  );
};

export default AdminLayoutWithProvider;
