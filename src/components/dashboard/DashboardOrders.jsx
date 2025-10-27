import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye, MessageSquare, CheckCircle, XCircle, Clock, AlertTriangle, Package, Truck, User, Phone, MapPin, Calendar, RefreshCw, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { api, sellerApi } from '@/lib/api';

const OrderStatusBadge = ({ status, statusLabel }) => {
  const statusConfig = {
    'pending': { 
      icon: <Clock className="ml-1 h-3 w-3" />, 
      className: 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border-amber-200 shadow-sm',
      pulse: true
    },
    'admin_approved': { 
      icon: <CheckCircle className="ml-1 h-3 w-3" />, 
      className: 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200 shadow-sm'
    },
    'seller_approved': { 
      icon: <CheckCircle className="ml-1 h-3 w-3" />, 
      className: 'bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 border-indigo-200 shadow-sm'
    },
    'in_progress': { 
      icon: <Package className="ml-1 h-3 w-3" />, 
      className: 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border-purple-200 shadow-sm',
      pulse: true
    },
    'work_completed': { 
      icon: <Package className="ml-1 h-3 w-3" />, 
      className: 'bg-gradient-to-r from-cyan-100 to-cyan-50 text-cyan-700 border-cyan-200 shadow-sm'
    },
    'out_for_delivery': { 
      icon: <Truck className="ml-1 h-3 w-3" />, 
      className: 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 border-orange-200 shadow-sm',
      pulse: true
    },
    'delivered': { 
      icon: <Truck className="ml-1 h-3 w-3" />, 
      className: 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-200 shadow-sm'
    },
    'completed': { 
      icon: <CheckCircle className="ml-1 h-3 w-3" />, 
      className: 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
    },
    'cancelled': { 
      icon: <XCircle className="ml-1 h-3 w-3" />, 
      className: 'bg-gradient-to-r from-red-100 to-red-50 text-red-700 border-red-200 shadow-sm'
    },
    'rejected': { 
      icon: <AlertTriangle className="ml-1 h-3 w-3" />, 
      className: 'bg-gradient-to-r from-red-100 to-red-50 text-red-700 border-red-200 shadow-sm'
    }
  };

  const config = statusConfig[status] || { 
    icon: <Clock className="ml-1 h-3 w-3" />, 
    className: 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-200 shadow-sm'
  };

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} font-medium flex items-center px-3 py-1 text-xs relative overflow-hidden ${
        config.pulse ? 'animate-pulse' : ''
      }`}
    >
      {config.pulse && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
      )}
      <span className="relative flex items-center">
        {config.icon}
        {statusLabel || status}
      </span>
    </Badge>
  );
};

const DashboardOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let response;
      
      // Get orders based on user role
      if (user.active_role === 'seller') {
        // Get orders for seller
        response = await sellerApi.getSellerOrders();
      } else {
        // Get orders for buyer
        response = await api.getOrders({ user_orders: true });
      }
      
      console.log('Orders API response:', response);
      
      // Handle both paginated and direct array responses
      const ordersData = response.data || response;
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('حدث خطأ أثناء تحميل الطلبات');
      toast({
        variant: "destructive",
        title: "خطأ في تحميل الطلبات",
        description: "حدث خطأ أثناء تحميل الطلبات. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (orderId, action, successMessage) => {
    setActionLoading(orderId);
    try {
      await action();
      toast({
        variant: "success",
        title: "نجاح",
        description: successMessage,
      });
      loadOrders(); // Refresh orders
    } catch (error) {
      console.error(`Error performing action on order ${orderId}:`, error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "حدث خطأ غير متوقع.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSellerApprove = (orderId) => {
    handleAction(orderId, () => sellerApi.approveOrder(orderId), "تمت الموافقة على الطلب بنجاح");
  };

  const handleStartWork = (orderId) => {
    handleAction(orderId, () => sellerApi.startWork(orderId), "تم بدء العمل على الطلب");
  };

  const handleCompleteWork = (orderId) => {
    handleAction(orderId, () => sellerApi.completeWork(orderId), "تم إكمال العمل على الطلب");
  };

  const handleCancelOrder = (orderId) => {
    handleAction(orderId, () => api.cancelOrder(orderId, "تم الإلغاء بواسطة المستخدم"), "تم إلغاء الطلب بنجاح");
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      'cash_on_delivery': 'الدفع عند الاستلام',
      'bank_transfer': 'تحويل بنكي',
      'credit_card': 'بطاقة ائتمان',
      'vodafone_cash': 'فودافون كاش',
      'instapay': 'انستاباي'
    };
    return methods[method] || method;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">
            {user?.active_role === 'seller' ? 'الطلبات الواردة' : 'طلباتي'}
          </h1>
          <ShoppingBag className="h-8 w-8 text-primary" />
        </div>
        
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">جاري تحميل الطلبات...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">
            {user?.active_role === 'seller' ? 'الطلبات الواردة' : 'طلباتي'}
          </h1>
          <ShoppingBag className="h-8 w-8 text-primary" />
        </div>
        
        <div className="text-center py-12">
          <AlertTriangle className="h-24 w-24 text-red-300 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">خطأ في تحميل الطلبات</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={loadOrders} className="bg-roman-500 hover:bg-roman-500/90">
            <RefreshCw className="ml-2 h-4 w-4" />
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8" dir="rtl">
      <motion.div 
        className="max-w-7xl mx-auto space-y-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-roman-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-roman-500 rounded-full flex items-center justify-center shadow-lg">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-roman-500">
                  {user?.active_role === 'seller' ? 'الطلبات الواردة' : 'طلباتي'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {orders.length} طلب إجمالي
                </p>
              </div>
            </div>
            <Button 
              onClick={loadOrders} 
              className="bg-roman-500 hover:bg-roman-500/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw className="ml-2 h-4 w-4" />
              تحديث الطلبات
            </Button>
          </div>
        </div>

        {/* Content Section */}
        {orders.length === 0 ? (
          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">لا توجد طلبات حالياً</h2>
            <p className="text-gray-500">
              {user?.active_role === 'seller' ? 'لم تتلق أي طلبات جديدة بعد.' : 'لم تقم بأي طلبات بعد. ابدأ التصفح!'}
            </p>
            {user?.active_role === 'buyer' && (
              <Button asChild className="mt-6 bg-roman-500 hover:bg-roman-500/90 text-white">
                <Link to="/explore">استكشف المنتجات</Link>
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <CardHeader className="p-5 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-roman-500">
                        طلب رقم #{order.id}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={order.status} statusLabel={order.status_label} />
                        {order.price_approval_status === 'pending_approval' && (
                          <Badge className="text-xs bg-yellow-100 text-yellow-700 border-yellow-300 animate-pulse">
                            <AlertTriangle className="ml-1 h-3 w-3" />
                            سعر مقترح
                          </Badge>
                        )}
                        {(order.is_late || order.time_remaining?.is_late) && (
                          <Badge variant="destructive" className="text-xs animate-pulse">
                            <AlertTriangle className="ml-1 h-3 w-3" />
                            متأخر
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-sm text-gray-500 pt-1">
                      <Calendar className="inline ml-1 h-3 w-3" />
                      {formatDate(order.order_date)}
                    </CardDescription>
                    {/* Deadline and time remaining */}
                    {order.completion_deadline && (
                      <div className="mt-2 text-xs text-gray-500">
                        <Clock className="inline ml-1 h-3 w-3" />
                        موعد الإنجاز: {formatDate(order.completion_deadline)}
                        {order.time_remaining && !order.time_remaining.is_late && (
                          <span className="text-blue-600 mr-2">
                            (متبقي: {(() => {
                              // Handle both backend formats - days/hours as separate fields or days as decimal
                              let totalHours = 0;
                              
                              if (order.time_remaining.total_hours) {
                                // Use total_hours if available (more accurate)
                                totalHours = Math.floor(order.time_remaining.total_hours);
                              } else if (order.time_remaining.days) {
                                // Convert decimal days to hours
                                totalHours = Math.floor(order.time_remaining.days * 24);
                              }
                              
                              const days = Math.floor(totalHours / 24);
                              const hours = totalHours % 24;
                              
                              let timeText = '';
                              if (days > 0) {
                                timeText += `${days}د `;
                              }
                              if (hours > 0) {
                                timeText += `${hours}س`;
                              }
                              
                              return timeText || 'أقل من ساعة';
                            })()})
                          </span>
                        )}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="p-5 flex-grow">
                    <div className="space-y-4">
                      {/* Customer Info */}
                      <div className='border-b pb-2 mb-2'>
                        <h3 className="text-md font-semibold text-gray-800 mb-2">
                          {user?.active_role === 'seller' ? 'معلومات المشتري' : 'معلومات البائع'}
                        </h3>
                        {user?.active_role === 'seller' ? (
                          <>
                             <p className="flex items-center text-sm text-gray-600">
                              <User className="ml-2 h-4 w-4 text-gray-400" /> 
                              {order.customer_name}
                            </p>
                            <p className="flex items-center text-sm text-gray-600">
                              <Phone className="ml-2 h-4 w-4 text-gray-400" />
                              {order.customer_phone}
                            </p>
                          </>
                        ) : (
                           <p className="flex items-center text-sm text-gray-600">
                            <User className="ml-2 h-4 w-4 text-gray-400" /> 
                            {order.seller?.name || 'غير متاح'}
                          </p>
                        )}
                      </div>

                      {/* Order Items */}
                      <div>
                         <h3 className="text-md font-semibold text-gray-800 mb-2">المنتجات</h3>
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <p className="text-gray-700">{item.product.title} (x{item.quantity})</p>
                            <p className="font-semibold text-gray-800">{item.subtotal} EGP</p>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Total Price */}
                      <div className="flex items-center justify-between font-bold text-lg">
                        <span className="text-gray-800">الإجمالي</span>
                        <span className="text-roman-500">{order.total_price} EGP</span>
                      </div>
                      
                       <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center"><CreditCard className='ml-1 h-4 w-4'/> طريقة الدفع</span>
                          <span className="font-semibold">{getPaymentMethodLabel(order.payment_method)}</span>
                        </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex-col items-stretch gap-2 pt-4 bg-gray-50 border-t border-gray-100 p-4">
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-grow hover:bg-roman-500 hover:text-white transition-colors">
                        <Link to={`/orders/${order.id}`} className="flex items-center">
                          <Eye className="ml-2 h-4 w-4" />
                          التفاصيل
                        </Link>
                      </Button>
                    </div>

                    <div className="mt-2 space-y-2">
                      {/* Seller Actions */}
                      {user?.active_role === 'seller' && (
                        <>
                          {order.status === 'admin_approved' && (
                            <Button onClick={() => handleSellerApprove(order.id)} disabled={actionLoading === order.id} className="w-full bg-green-500 hover:bg-green-600 text-white">
                              {actionLoading === order.id ? 'جاري الموافقة...' : 'الموافقة على الطلب'}
                            </Button>
                          )}
                          {order.status === 'seller_approved' && (
                            <Button onClick={() => handleStartWork(order.id)} disabled={actionLoading === order.id} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                              {actionLoading === order.id ? 'جاري البدء...' : 'بدء العمل'}
                            </Button>
                          )}
                          {order.status === 'in_progress' && (
                            <Button onClick={() => handleCompleteWork(order.id)} disabled={actionLoading === order.id} className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                             {actionLoading === order.id ? 'جاري الإنهاء...' : 'إنهاء العمل'}
                            </Button>
                          )}
                        </>
                      )}

                      {/* Buyer Actions */}
                      {user?.active_role === 'buyer' && ['pending', 'admin_approved', 'seller_approved', 'in_progress'].includes(order.status) && (
                         <Button onClick={() => handleCancelOrder(order.id)} disabled={actionLoading === order.id} variant="destructive" className="w-full">
                          {actionLoading === order.id ? 'جاري الإلغاء...' : 'إلغاء الطلب'}
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardOrders;
