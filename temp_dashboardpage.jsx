import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
    <AnimatePresence>
      {(isMobile && isMobileMenuOpen) || !isMobile ? (
        <motion.aside 
          initial={{ width: isMobile ? 0 : (isSidebarOpen ? '16rem' : '5rem'), x: isMobile ? -250 : 0 }}
          animate={{ width: isMobile ? '16rem' : (isSidebarOpen ? '16rem' : '5rem'), x: 0 }}
          exit={{ width: 0, x: -250 }}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          className='sidebar-container'
        >
          {isMobile && (
            <button 
              onClick={toggleSidebar} 
              className='absolute top-4 left-4 p-1 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors duration-200'
            >
              <X size={20} />
            </button>
          )}

          <div className='p-6 space-y-4 overflow-y-auto flex-grow'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-lg font-semibold'>لوحة التحكم</h2>
              {!isMobile && (
                <button 
                  onClick={toggleSidebar} 
                  className='p-1 rounded-full bg-orange-100 text-primary hover:bg-orange-200 transition-colors duration-200'
                >
                  <ChevronLeft size={20} className={`transform transition-transform ${isSidebarOpen ? '' : 'rotate-180'}`} />
                </button>
              )}
            </div>

            <nav className='space-y-2'>
              {links.map(link => (
                <Button
                  key={link.path}
                  variant={location.pathname.startsWith(link.path) ? 'default' : 'ghost'}
                  className='w-full justify-start'
                  onClick={() => {
                    navigate(link.path);
                    if (isMobile) toggleSidebar();
                  }}
                >
                  <link.icon className='mr-2 h-5 w-5' />
                  <span>
                    {(isSidebarOpen || isMobile) && link.label}
                  </span>
                </Button>
              ))}
            </nav>
            <Separator className='my-6' />
            <Button
              variant='ghost'
              className='w-full justify-start'
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              <LogOut className='mr-2 h-5 w-5' />
              <span>
                {(isSidebarOpen || isMobile) && 'تسجيل الخروج'}
              </span>
            </Button>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
};

const DashboardCard = ({ title, description, link, icon: Icon }) => (
  <motion.div whileHover={{ y: -5 }} className='h-full'>
    <Card className='h-full shadow-lg hover:shadow-xl transition-shadow duration-300 border-orange-200 flex flex-col'>
      <CardHeader className='flex-row items-center space-x-4 pb-2'>
        <div className='p-3 rounded-full bg-primary/10 text-primary'>
          <Icon className='h-6 w-6' />
        </div>
        <CardTitle className='text-xl text-gray-700'>{title}</CardTitle>
      </CardHeader>
      <CardContent className='flex-grow'>
        <p className='text-sm text-gray-500'>{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant='outline' className='w-full border-primary text-primary hover:bg-primary hover:text-white'>
          <Link to={link}>الانتقال</Link>
        </Button>
      </CardFooter>
    </Card>
  </motion.div>
);

const DashboardHome = ({ user }) => (
  <div className='p-8'>
    <p className='text-gray-600 mb-8'>
      هنا يمكنك إدارة {user.role === 'seller' ? 'خدماتك وطلباتك وأرباحك' : 'طلباتك ورسائلك وإعدادات حسابك'}.
      استخدم القائمة الجانبية للتنقل.
    </p>
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {user.role === 'seller' ? (
        <>
          <DashboardCard title='إدارة خدماتك' description='أضف خدمات جديدة أو قم بتعديل الخدمات الحالية.' link='/dashboard/gigs' icon={ShoppingBag} />
          <DashboardCard title='الطلبات الواردة' description='تابع طلبات العملاء وقم بإدارتها.' link='/dashboard/orders' icon={DollarSign} />
          <DashboardCard title='الأرباح' description='اطلع على تقارير الأرباح الخاصة بك.' link='/dashboard/earnings' icon={BarChart2} />
        </>
      ) : (
        <>
          <DashboardCard title='طلباتي' description='تتبع حالة طلباتك الحالية والسابقة.' link='/dashboard/orders' icon={ShoppingBag} />
          <DashboardCard title='الرسائل' description='تواصل مع البائعين بخصوص طلباتك.' link='/dashboard/messages' icon={MessageCircle} />
          <DashboardCard title='إعدادات الحساب' description='قم بتحديث معلوماتك الشخصية وتفضيلاتك.' link='/dashboard/settings' icon={Settings} />
        </>
      )}
    </div>
  </div>
);

const DashboardContent = ({ user }) => {
  const location = useLocation();
  const isDashboardRoot = location.pathname === '/dashboard' || location.pathname === '/dashboard/';
  const { isMobile, toggleSidebar, isMobileMenuOpen, isSidebarOpen } = useSidebar();
  // Create a ref for the main content scroll area
  const scrollRef = useScrollToTop();

  return (
    <main 
      ref={scrollRef}
      className={`flex-grow overflow-auto p-4 ${isMobile ? 'w-full' : (isSidebarOpen ? 'w-[calc(100%-16rem)]' : 'w-[calc(100%-5rem)]')}`}
    >
      {isMobile && (
        <div className='mobile-header p-4 flex justify-between items-center'>
          <h1 className='text-xl font-semibold text-primary'>لوحة التحكم</h1>
          <Button 
            variant='ghost' 
            size='sm' 
            onClick={toggleSidebar}
            className='text-primary hover:bg-orange-50 transition-colors duration-200'
          >
            <Menu size={20} />
          </Button>
        </div>
      )}
      {isDashboardRoot ? <DashboardHome user={user} /> : <Outlet />}
    </main>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isMobileMenuOpen, closeMobileSidebar } = useSidebar();

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className='flex min-h-[calc(100vh-var(--navbar-height,100px))]'>
        {isMobileMenuOpen && (
          <div 
            className='sidebar-overlay' 
            onClick={closeMobileSidebar}
          />
        )}
        <DashboardSidebar userRole={user.role} />
        <DashboardContent user={user} />
      </div>
    </SidebarProvider>
  );
};

export default DashboardPage;
