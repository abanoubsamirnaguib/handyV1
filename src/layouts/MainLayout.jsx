import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import MaintenanceModeBar from '@/components/MaintenanceModeBar';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { motion } from 'framer-motion';

const MainLayout = () => {
  const location = useLocation();
  const { settings } = useSiteSettings();
  const isChatPage = location.pathname === '/chat' || location.pathname.startsWith('/chat/');
  const isDashboardPage = location.pathname.startsWith('/dashboard');
  const isAdminPage = location.pathname.startsWith('/admin');
  
  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      {settings.maintenanceMode && !isAdminPage && <MaintenanceModeBar />}
      {!isDashboardPage && <Navbar />}
      <motion.main 
        className={`flex-grow ${isChatPage ? 'pb-0' : 'pb-16 md:pb-0'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.main>
      <Footer />
      {!isChatPage &&<MobileBottomNav />}
      {isChatPage && <div className="hidden md:block"><MobileBottomNav /></div>}
    </div>
  );
};

export default MainLayout;
