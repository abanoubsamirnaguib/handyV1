
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { orders as mockOrders, gigs as mockGigs, sellers as mockSellers } from '@/lib/data'; // Assuming orders are in data.js
import { Link } from 'react-router-dom';

const OrderStatusBadge = ({ status }) => {
  switch (status) {
    case 'completed':
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="ml-1 h-3 w-3" />مكتمل</Badge>;
    case 'in_progress':
      return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white"><Clock className="ml-1 h-3 w-3" />قيد التنفيذ</Badge>;
    case 'cancelled':
      return <Badge variant="destructive"><XCircle className="ml-1 h-3 w-3" />ملغي</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const DashboardOrders = () => {
  const { user } = useAuth();
  // Filter orders based on user role (buyer or seller)
  const userOrders = user?.role === 'seller' 
    ? mockOrders.filter(order => order.sellerId === user.id)
    : mockOrders.filter(order => order.userId === user.id);

  const getGigDetails = (gigId) => mockGigs.find(g => g.id === gigId);
  const getParticipantDetails = (participantId) => {
    return user?.role === 'seller' 
      ? { name: `مشتري ${participantId.substring(0,4)}` } // Mock buyer name
      : mockSellers.find(s => s.id === participantId);
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800">
          {user?.role === 'seller' ? 'الطلبات الواردة' : 'طلباتي'}
        </h1>
        <ShoppingBag className="h-8 w-8 text-primary" />
      </motion.div>

      {userOrders.length === 0 ? (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">لا توجد طلبات حالياً</h2>
          <p className="text-gray-500">
            {user?.role === 'seller' ? 'لم تتلق أي طلبات جديدة بعد.' : 'لم تقم بأي طلبات بعد. ابدأ التصفح!'}
          </p>
          {user?.role === 'buyer' && (
            <Button asChild className="mt-6 bg-orange-500 hover:bg-orange-600">
              <Link to="/explore">استكشف المنتجات</Link>
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-6">
          {userOrders.map((order, index) => {
            const gig = getGigDetails(order.gigId);
            const participant = getParticipantDetails(user?.role === 'seller' ? order.userId : order.sellerId);
            return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow border-orange-100">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <CardTitle className="text-xl text-primary mb-2 sm:mb-0">
                      طلب #{order.id.substring(0,6)} - {gig?.title || 'منتج محذوف'}
                    </CardTitle>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <CardDescription>
                    تاريخ الطلب: {new Date(order.orderDate).toLocaleDateString('ar-EG')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{user?.role === 'seller' ? 'المشتري:' : 'البائع:'}</span>
                    <span className="font-medium text-gray-800">{participant?.name || 'مستخدم غير معروف'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">الكمية:</span>
                    <span className="font-medium text-gray-800">{order.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">السعر الإجمالي:</span>
                    <span className="font-bold text-lg text-green-600">{order.totalPrice} جنيه</span>
                  </div>
                  {order.requirements && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">متطلبات خاصة:</h4>
                      <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-md">{order.requirements}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/gigs/${order.gigId}`}>
                      <Eye className="ml-2 h-4 w-4" /> عرض المنتج
                    </Link>
                  </Button>
                  <Button variant="default" size="sm" className="bg-orange-500 hover:bg-orange-600">
                    <MessageSquare className="ml-2 h-4 w-4" /> تواصل مع {user?.role === 'seller' ? 'المشتري' : 'البائع'}
                  </Button>
                  {/* Add more actions based on order status and role */}
                </CardFooter>
              </Card>
            </motion.div>
          )})}
        </div>
      )}
    </div>
  );
};

export default DashboardOrders;
