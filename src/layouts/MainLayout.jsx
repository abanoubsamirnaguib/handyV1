import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { motion } from 'framer-motion';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      <Navbar />
      <motion.main 
        className="flex-grow pb-16 md:pb-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
