import React from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ShoppingBag, MessageCircle, Settings, BarChart2, DollarSign, Users, LogOut, PlusCircle, Edit, Menu, X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import '@/components/dashboard/sidebar.css';

const DashboardSidebar = ({ userRole }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isSidebarOpen, toggleSidebar, isMobile, isMobileMenuOpen } = useSidebar();
  // Use our custom hook for navigation
  const location = usePageNavigation();

  const buyerLinks = [
    { path: '/dashboard/orders', label: 'طلباتي', icon: ShoppingBag },
    { path: '/dashboard/messages', label: 'الرسائل', icon: MessageCircle },
    { path: '/dashboard/settings', label: 'إعدادات الحساب', icon: Settings },
  ];

  const sellerLinks = [
    { path: '/dashboard/overview', label: 'نظرة عامة', icon: LayoutDashboard },
    { path: '/dashboard/gigs', label: 'خدماتي', icon: ShoppingBag },
    { path: '/dashboard/orders', label: 'الطلبات الواردة', icon: DollarSign },
    { path: '/dashboard/earnings', label: 'الأرباح', icon: BarChart2 },
    { path: '/dashboard/messages', label: 'الرسائل', icon: MessageCircle },
    { path: '/dashboard/settings', label: 'إعدادات الحساب', icon: Settings },
  ];

  const links = userRole === 'seller' ? sellerLinks : buyerLinks;

  return (
    <AnimatePresence mode="wait">
      {((isMobile && isMobileMenuOpen) || !isMobile) && (          <motion.aside 
          key="sidebar"
          initial={{ width: isMobile ? 0 : (isSidebarOpen ? '16rem' : '5rem'), x: isMobile ? -250 : 0 }}
          animate={{ width: isMobile ? '16rem' : (isSidebarOpen ? '16rem' : '5rem'), x: 0 }}
          exit={{ width: 0, x: -250 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`bg-background/95 backdrop-blur-md border-l border-olivePrimary/20 flex flex-col z-40 ${
            isMobile ? 'fixed top-0 right-0 h-screen shadow-lg' : 'h-screen sticky top-0'
          } ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
        >
          {isMobile && (
            <button 
              onClick={toggleSidebar} 
              className="absolute top-4 left-4 p-1 rounded-full bg-lightGreen/60 text-darkOlive hover:bg-lightGreen/80"
            >
              <X size={20} />
            </button>
          )}

          <div className="p-4 space-y-4 overflow-y-auto flex-grow">
            <div className="flex items-center justify-between mb-6 px-2">
              <Link to="/" className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`text-xl font-bold text-olivePrimary ${!isSidebarOpen && !isMobile ? 'scale-0 w-0 opacity-0' : 'scale-100 opacity-100'} transition-all duration-300`}
                >
                  بازار
                </motion.div>
              </Link>
              {!isMobile && (
                <button 
                  onClick={toggleSidebar} 
                  className="p-1 rounded-full bg-lightGreen/60 text-olivePrimary hover:bg-lightGreen/80 transition-colors duration-200"
                >
                  <ChevronLeft size={20} className={`sidebar-icon ${!isSidebarOpen ? 'sidebar-icon-rotated' : ''}`} />
                </button>
              )}
            </div>

            <div className={`py-2 ${!isSidebarOpen && !isMobile ? 'hidden' : 'block'}`}>
              <h2 className="text-lg font-semibold text-olivePrimary px-3 pb-2">
                لوحة التحكم
              </h2>
            </div>

            <nav className="space-y-1">
              {links.map(link => (
                <Button
                  key={link.path}
                  variant={location.pathname.startsWith(link.path) ? 'subtle' : 'ghost'}
                  className={`w-full justify-${isSidebarOpen || isMobile ? 'start' : 'center'} text-right px-3 py-2 ${
                    location.pathname.startsWith(link.path) ? 'bg-olivePrimary/10 text-olivePrimary font-medium' : 'hover:bg-lightGreen/50 hover:text-olivePrimary text-sm font-medium'
                  } transition-all duration-200`}
                  onClick={() => {
                    navigate(link.path);
                    if (isMobile) toggleSidebar();
                  }}
                >
                  <link.icon className={`${isSidebarOpen || isMobile ? 'ml-2' : ''} h-4 w-4`} />
                  {(isSidebarOpen || isMobile) && (
                    <span className="text-darkOlive">
                      {link.label}
                    </span>
                  )}
                </Button>
              ))}
            </nav>
            <Separator className="my-4" />
            <Button
              variant="ghost"
              className={`w-full justify-${isSidebarOpen || isMobile ? 'start' : 'center'} text-right px-3 py-2 text-sm font-medium text-destructive hover:bg-red-50 hover:text-destructive transition-all duration-200`}
              onClick={() => {
                logout();
                navigate('/');
              }              }
            >
              <LogOut className={`${isSidebarOpen || isMobile ? 'ml-2' : ''} h-4 w-4`} />
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

const DashboardCard = ({ title, description, link, icon: Icon }) => (
  <motion.div whileHover={{ y: -5 }} className="h-full">
    <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300 border-olivePrimary/20 flex flex-col">
      <CardHeader className="flex-row items-center space-x-4 pb-2">
        <div className="p-3 rounded-full bg-olivePrimary/10 text-olivePrimary">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl text-darkOlive">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-darkOlive/70">{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full border-olivePrimary text-olivePrimary hover:bg-olivePrimary hover:text-white">
          <Link to={link}>الانتقال</Link>
        </Button>
      </CardFooter>
    </Card>
  </motion.div>
);

const DashboardHome = ({ user }) => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-darkOlive mb-6">مرحباً بك في لوحة التحكم، {user.name}!</h1>
    <p className="text-darkOlive/70 mb-8">
      هنا يمكنك إدارة {user.role === 'seller' ? 'خدماتك وطلباتك وأرباحك' : 'طلباتك ورسائلك وإعدادات حسابك'}.
      استخدم القائمة الجانبية للتنقل.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {user.role === 'seller' ? (
        <>
          <DashboardCard title="إدارة خدماتك" description="أضف خدمات جديدة أو قم بتعديل الخدمات الحالية." link="/dashboard/gigs" icon={ShoppingBag} />
          <DashboardCard title="الطلبات الواردة" description="تابع طلبات العملاء وقم بإدارتها." link="/dashboard/orders" icon={DollarSign} />
          <DashboardCard title="الأرباح" description="اطلع على تقارير الأرباح الخاصة بك." link="/dashboard/earnings" icon={BarChart2} />
        </>
      ) : (
        <>
          <DashboardCard title="طلباتي" description="تتبع حالة طلباتك الحالية والسابقة." link="/dashboard/orders" icon={ShoppingBag} />
          <DashboardCard title="الرسائل" description="تواصل مع البائعين بخصوص طلباتك." link="/dashboard/messages" icon={MessageCircle} />
          <DashboardCard title="إعدادات الحساب" description="قم بتحديث معلوماتك الشخصية وتفضيلاتك." link="/dashboard/settings" icon={Settings} />
        </>
      )}
    </div>
  </div>
);

const DashboardContent = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isDashboardRoot = location.pathname === '/dashboard' || location.pathname === '/dashboard/';
  const { isMobile, toggleSidebar, isMobileMenuOpen, isSidebarOpen } = useSidebar();
  // Create a ref for the main content scroll area
  const scrollRef = useScrollToTop();

  // Links based on user role
  const buyerLinks = [
    { path: '/dashboard/orders', label: 'طلباتي', icon: ShoppingBag },
    { path: '/dashboard/messages', label: 'الرسائل', icon: MessageCircle },
    { path: '/dashboard/settings', label: 'إعدادات الحساب', icon: Settings },
  ];

  const sellerLinks = [
    { path: '/dashboard/overview', label: 'نظرة عامة', icon: LayoutDashboard },
    { path: '/dashboard/gigs', label: 'خدماتي', icon: ShoppingBag },
    { path: '/dashboard/orders', label: 'الطلبات الواردة', icon: DollarSign },
    { path: '/dashboard/earnings', label: 'الأرباح', icon: BarChart2 },
    { path: '/dashboard/messages', label: 'الرسائل', icon: MessageCircle },
    { path: '/dashboard/settings', label: 'إعدادات الحساب', icon: Settings },
  ];

  const links = user?.role === 'seller' ? sellerLinks : buyerLinks;

  return (      <main 
        ref={scrollRef}
        className={`flex-1 bg-background overflow-y-auto ${
          !isMobile ? (isSidebarOpen ? 'dashboard-content-expanded' : 'dashboard-content-collapsed') : 'dashboard-content'
        }`}
      >
      {isMobile && (
        <div className="mobile-header p-4 flex justify-between items-center bg-background/95 backdrop-blur-md border-b border-olivePrimary/20">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-olivePrimary">لوحة التحكم</h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => toggleSidebar()}
            className="text-olivePrimary hover:bg-lightGreen/50"
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
          className="w-full bg-background/95 backdrop-blur-md border-b border-olivePrimary/20"
        >
          <div className="p-4">
            <nav className="flex flex-col space-y-2">
              {links.map(link => (
                <Link 
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 text-sm font-medium flex items-center ${
                    location.pathname.startsWith(link.path) 
                      ? 'text-olivePrimary' 
                      : 'hover:text-olivePrimary'
                  }`}
                  onClick={() => toggleSidebar()}
                >
                  <link.icon className="ml-2 h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              <Separator className="my-2" />
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="px-3 py-2 text-sm font-medium text-burntOrange hover:text-burntOrange/90 flex items-center text-right w-full"
              >
                <LogOut className="ml-2 h-4 w-4" />
                تسجيل الخروج
              </button>
            </nav>
          </div>
        </motion.div>
      )}
      {isDashboardRoot ? <DashboardHome user={user} /> : <Outlet />}
    </main>
  );
};

const DashboardPageContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isMobileMenuOpen, closeMobileSidebar, isMobile } = useSidebar();

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Redirect admin users to the admin dashboard
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="flex min-h-[calc(100vh-var(--navbar-height,100px))]">
      {!isMobile && <DashboardSidebar userRole={user.role} />}
      <DashboardContent user={user} />
    </div>
  );
};

const DashboardPage = () => {
  return (
    <SidebarProvider>
      <DashboardPageContent />
    </SidebarProvider>
  );
};

export default DashboardPage;
