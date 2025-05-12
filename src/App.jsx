import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ChatProvider } from '@/contexts/ChatContext';
import ScrollToTop from '@/components/ScrollToTop';

import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/layouts/AdminLayout';

import HomePage from '@/pages/HomePage.jsx';
import ExplorePage from '@/pages/ExplorePage.jsx';
import GigDetailsPage from '@/pages/GigDetailsPage.jsx';
import ProfilePage from '@/pages/ProfilePage.jsx';
import SellerProfilePage from '@/pages/SellerProfilePage.jsx';
import MessagePage from '@/pages/MessagePage.jsx';
import DashboardPage from '@/pages/DashboardPage.jsx';
import ChatPage from '@/pages/ChatPage.jsx';
import CartPage from '@/pages/CartPage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import RegisterPage from '@/pages/RegisterPage.jsx';
import NotFoundPage from '@/pages/NotFoundPage.jsx';
import AdminDashboardPage from '@/pages/AdminDashboardPage.jsx';

// Dashboard Sub-Pages
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import DashboardOrders from '@/components/dashboard/DashboardOrders';
import DashboardGigs from '@/components/dashboard/DashboardGigs';
import DashboardEarnings from '@/components/dashboard/DashboardEarnings';
import DashboardMessages from '@/components/dashboard/DashboardMessages';
import DashboardSettings from '@/components/dashboard/DashboardSettings';
import CreateGigPage from '@/components/dashboard/CreateGigPage';
import EditGigPage from '@/components/dashboard/EditGigPage';

// Admin Sub-Pages
import AdminCategories from '@/components/admin/AdminCategories';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminSellers from '@/components/admin/AdminSellers';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminMessages from '@/components/admin/AdminMessages';
import AdminSettings from '@/components/admin/AdminSettings';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ChatProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="explore" element={<ExplorePage />} />
              <Route path="gigs/:id" element={<GigDetailsPage />} />
              <Route path="sellers/:id" element={<SellerProfilePage />} />
              <Route path="message/:id" element={<MessagePage />} />
              <Route path="profile/:id" element={<ProfilePage />} />
              <Route path="dashboard" element={<DashboardPage />}>
                <Route index element={<DashboardOverview />} />
                <Route path="overview" element={<DashboardOverview />} />
                <Route path="orders" element={<DashboardOrders />} />
                <Route path="gigs" element={<DashboardGigs />} />
                <Route path="gigs/new" element={<CreateGigPage />} />
                <Route path="gigs/edit/:gigId" element={<EditGigPage />} />
                <Route path="earnings" element={<DashboardEarnings />} />
                <Route path="messages" element={<DashboardMessages />} />
                <Route path="settings" element={<DashboardSettings />} />
              </Route>
              <Route path="chat" element={<ChatPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            
            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="sellers" element={<AdminSellers />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
          <Toaster />
        </ChatProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
