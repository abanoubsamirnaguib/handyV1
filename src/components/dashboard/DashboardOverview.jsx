import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, BarChart3, MessageCircle, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { api, sellerApi } from '@/lib/api';

const StatCard = ({ title, value, icon, color, description, path }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={handleClick}
      className={path ? 'cursor-pointer' : ''}
    >
      <Card className={`border-${color}-500 border-t-4 shadow-lg hover:shadow-xl transition-all duration-300 ${path ? 'hover:scale-105 hover:bg-gray-50' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          {React.createElement(icon, { className: `h-5 w-5 text-${color}-500` })}
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-800">{value}</div>
          <p className="text-xs text-muted-foreground pt-1">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DashboardOverview = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchDashboardStats();
    }
  }, [user]);

  // Fetch top products after dashboard stats are loaded (for sellers)
  useEffect(() => {
    if (user && dashboardStats) {
      fetchTopProducts();
    }
  }, [user, dashboardStats]);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(Array.isArray(data) ? data.reverse() : []);
    } catch (e) {
      setNotifications([]);
    }
  };

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await api.getDashboardStats();
      if (response.success && response.data) {
        setDashboardStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    try {
      if (user?.active_role === 'seller') {
        // Use top-selling products from dashboard stats if available
        if (dashboardStats?.top_selling_products && Array.isArray(dashboardStats.top_selling_products)) {
          setTopProducts(dashboardStats.top_selling_products);
        } else {
          // Fallback: Fetch seller's products if stats not available
          const response = await sellerApi.getSellerProducts();
          let products = [];
          if (response.data && Array.isArray(response.data)) {
            products = response.data;
          } else if (Array.isArray(response)) {
            products = response;
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            products = response.data.data;
          }
          setTopProducts(products.slice(0, 3));
        }
      } else {
        // Fetch buyer's wishlist
        const wishlist = await api.getWishlist();
        const items = wishlist.data || wishlist;
        const wishlistItems = Array.isArray(items) ? items : [];
        const products = wishlistItems
          .slice(0, 3)
          .map(item => item.product || item)
          .filter(Boolean);
        setTopProducts(products);
      }
    } catch (error) {
      console.error('Error fetching top products:', error);
      setTopProducts([]);
    }
  };

  const stats = user?.active_role === 'seller' ? [
    { 
      title: "إجمالي الأرباح", 
      value: dashboardStats?.total_earnings_formatted || "0 جنيه", 
      icon: DollarSign, 
      color: "green", 
      description: dashboardStats?.new_orders_today_text || "جاري التحميل...",
      path: "/dashboard/earnings"
    },
    { 
      title: "الطلبات الجديدة", 
      value: dashboardStats?.new_orders?.toString() || "0", 
      icon: ShoppingBag, 
      color: "blue", 
      description: dashboardStats?.new_orders_today_text || "جاري التحميل...",
      path: "/dashboard/orders"
    },
    { 
      title: "إجمالي الخدمات", 
      value: dashboardStats?.total_products?.toString() || "0", 
      icon: BarChart3, 
      color: "orange", 
      description: dashboardStats?.inactive_products_text || "جاري التحميل...",
      path: "/dashboard/gigs"
    },
    { 
      title: "العملاء النشطون", 
      value: dashboardStats?.active_customers?.toString() || "0", 
      icon: Users, 
      color: "purple", 
      description: dashboardStats?.average_rating_text || "جاري التحميل...",
      path: null // No specific page for this yet
    },
  ] : [
    { 
      title: "إجمالي الطلبات", 
      value: dashboardStats?.total_orders?.toString() || "0", 
      icon: ShoppingBag, 
      color: "blue", 
      description: dashboardStats?.orders_in_progress_text || "جاري التحميل...",
      path: "/dashboard/orders"
    },
    { 
      title: "المبلغ المنفق", 
      value: dashboardStats?.total_spent_formatted || "0 جنيه", 
      icon: DollarSign, 
      color: "green", 
      description: dashboardStats?.average_order_value_text || "جاري التحميل...",
      path: null // No specific page for this yet
    },
    { 
      title: "المنتجات المفضلة", 
      value: dashboardStats?.favorite_products?.toString() || "0", 
      icon: Heart, 
      color: "red", 
      description: "في قائمة المفضلة",
      path: "/wishlist"
    },
    { 
      title: "البائعون المفضلون", 
      value: dashboardStats?.favorite_sellers?.toString() || "0", 
      icon: Users, 
      color: "purple", 
      description: "البائعون الأكثر تعاملاً معهم",
      path: null // No specific page for this yet
    },
    { 
      title: "الرسائل غير المقروءة", 
      value: dashboardStats?.unread_messages?.toString() || "0", 
      icon: MessageCircle, 
      color: "orange", 
      description: dashboardStats?.unread_messages_text || "لا توجد رسائل غير مقروءة",
      path: "/dashboard/messages"
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.h1 
        className="text-3xl font-bold text-gray-800"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {user?.active_role === 'seller' ? 'نظرة عامة على أداء متجرك' : 'ملخص حسابك'}
      </motion.h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Notifications Card */}
      <div className="grid gap-6 md:grid-cols-2">
      
      </div>
    </div>
  );
};

export default DashboardOverview;
