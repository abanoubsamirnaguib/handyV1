import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext';
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import DeliveryProtectedRoute from '@/components/DeliveryProtectedRoute';

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
import WishlistPage from '@/pages/WishlistPage.jsx';
import CheckoutPage from '@/pages/CheckoutPage.jsx';
import OrderDetailPage from '@/pages/OrderDetailPage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import RegisterPage from '@/pages/RegisterPage.jsx';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from '@/pages/ResetPasswordPage.jsx';
import EmailVerificationPage from '@/pages/EmailVerificationPage.jsx';
import NotFoundPage from '@/pages/NotFoundPage.jsx';
import AdminDashboardPage from '@/pages/AdminDashboardPage.jsx';
import NotificationsPage from '@/pages/NotificationsPage.jsx';
import AboutUsPage from '@/pages/AboutUsPage.jsx';
import PolicyPage from '@/pages/PolicyPage.jsx';
import AnnouncementsPage from '@/pages/AnnouncementsPage.jsx';

// Delivery Pages
import DeliveryLoginPage from '@/pages/DeliveryLoginPage.jsx';
import DeliveryDashboardPage from '@/pages/DeliveryDashboardPage.jsx';
import DeliveryPickupPage from '@/pages/DeliveryPickupPage.jsx';
import DeliveryDeliverPage from '@/pages/DeliveryDeliverPage.jsx';

// Dashboard Sub-Pages
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import DashboardOrders from '@/components/dashboard/DashboardOrders';
import DashboardGigs from '@/components/dashboard/DashboardGigs';
import DashboardEarnings from '@/components/dashboard/DashboardEarnings';
import DashboardMessages from '@/components/dashboard/DashboardMessages';
import DashboardSettings from '@/components/dashboard/DashboardSettings';
import DashboardBuyerWallet from '@/components/dashboard/DashboardBuyerWallet';
import CreateGigPage from '@/components/dashboard/CreateGigPage';
import EditGigPage from '@/components/dashboard/EditGigPage';

// Admin Sub-Pages
import AdminCategories from '@/components/admin/AdminCategories';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminSellers from '@/components/admin/AdminSellers';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminMessages from '@/components/admin/AdminMessages';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminDelivery from '@/components/admin/AdminDelivery';
import AdminDeliveryAssignment from '@/components/admin/AdminDeliveryAssignment';
import AdminWithdrawals from '@/components/admin/AdminWithdrawals';
import AdminContactUs from '@/components/admin/AdminContactUs';
import AdminAnnouncements from '@/components/admin/AdminAnnouncements';
import AdminCities from '@/components/admin/AdminCities';
import AdminPlatformProfits from '@/components/admin/AdminPlatformProfits';

import './styles/rtl-dropdown.css'; // Import our RTL dropdown styles

function App() {
  return (
    <SiteSettingsProvider>
      <AuthProvider>
        <CartProvider>
          <ChatProvider>
            <NotificationProvider>
              <ScrollToTop />
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="explore" element={<ExplorePage />} />
                <Route path="gigs/:id" element={<GigDetailsPage />} />
                <Route path="sellers/:id" element={<SellerProfilePage />} />
                <Route path="contact-us" element={<Navigate to="/about-us" replace />} />
                <Route path="about-us" element={<AboutUsPage />} />
                <Route path="policy" element={<PolicyPage />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
                
                {/* Protected routes that require authentication */}
                <Route path="message/:id" element={
                  <ProtectedRoute>
                    <MessagePage />
                  </ProtectedRoute>
                } />
                <Route path="profile/me" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="profile/:id" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="dashboard" element={
                  <ProtectedRoute allowedRoles={['buyer', 'seller']}>
                    <DashboardPage />
                  </ProtectedRoute>
                }>
                  <Route index element={<DashboardOverview />} />
                  <Route path="overview" element={<DashboardOverview />} />
                  <Route path="orders" element={<DashboardOrders />} />
                  <Route path="gigs" element={<DashboardGigs />} />
                  <Route path="gigs/new" element={<CreateGigPage />} />
                  <Route path="gigs/edit/:gigId" element={<EditGigPage />} />
                  <Route path="earnings" element={<DashboardEarnings />} />
                  <Route path="wallet" element={<DashboardBuyerWallet />} />
                  <Route path="messages" element={<DashboardMessages />} />
                  <Route path="settings" element={<DashboardSettings />} />
                </Route>
                <Route path="chat" element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                } />
                <Route path="notifications" element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                } />
                <Route path="cart" element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                } />
                <Route path="wishlist" element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                } />
                <Route path="checkout" element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                } />
                <Route path="orders/:orderId" element={
                  <ProtectedRoute>
                    <OrderDetailPage />
                  </ProtectedRoute>
                } />
                
                {/* Public routes that redirect authenticated users */}
                <Route path="login" element={
                  <ProtectedRoute requireAuth={false}>
                    <LoginPage />
                  </ProtectedRoute>
                } />
                <Route path="register" element={
                  <ProtectedRoute requireAuth={false}>
                    <RegisterPage />
                  </ProtectedRoute>
                } />
                <Route path="forgot-password" element={
                  <ProtectedRoute requireAuth={false}>
                    <ForgotPasswordPage />
                  </ProtectedRoute>
                } />
                <Route path="reset-password" element={
                  <ProtectedRoute requireAuth={false}>
                    <ResetPasswordPage />
                  </ProtectedRoute>
                } />
                <Route path="verify-email" element={
                  <ProtectedRoute requireAuth={false}>
                    <EmailVerificationPage />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<NotFoundPage />} />
              </Route>
              
              {/* Admin Dashboard Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="sellers" element={<AdminSellers />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="delivery" element={<AdminDelivery />} />
                <Route path="delivery-orders" element={<AdminDeliveryAssignment />} />
                <Route path="withdrawals" element={<AdminWithdrawals />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="contact-us" element={<AdminContactUs />} />
                <Route path="announcements" element={<AdminAnnouncements />} />
                <Route path="cities" element={<AdminCities />} />
                <Route path="platform-profits" element={<AdminPlatformProfits />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              
              {/* Delivery Routes (separate from main layout) */}
              <Route path="/delivery">
                <Route index element={<Navigate to="/delivery/login" replace />} />
                <Route path="login" element={<DeliveryLoginPage />} />
                <Route path="dashboard" element={
                  <DeliveryProtectedRoute>
                    <DeliveryDashboardPage />
                  </DeliveryProtectedRoute>
                } />
                <Route path="pickup/:orderId" element={
                  <DeliveryProtectedRoute>
                    <DeliveryPickupPage />
                  </DeliveryProtectedRoute>
                } />
                <Route path="deliver/:orderId" element={
                  <DeliveryProtectedRoute>
                    <DeliveryDeliverPage />
                  </DeliveryProtectedRoute>
                } />
              </Route>
            </Routes>
            <Toaster />
          </NotificationProvider>
        </ChatProvider>
      </CartProvider>
    </AuthProvider>
    </SiteSettingsProvider>
  );
}

export default App;
