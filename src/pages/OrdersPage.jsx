import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Clock, Package, Check, AlertTriangle, CreditCard, Truck, ShoppingBag, User, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Datos simulados de pedidos
const mockOrders = [
  {
    id: 'ord_001',
    product: {
      id: 'p1',
      name: 'كرسي خشبي مزخرف',
      image: 'https://via.placeholder.com/100',
    },
    seller: {
      id: 's1',
      name: 'ليلى حسن',
    },
    customer: {
      name: 'أحمد محمد',
      phone: '+966501234567',
      address: 'الرياض، حي النخيل، شارع الملك فهد'
    },
    status: 'in_progress',
    payment_method: 'cash_on_delivery',
    payment_status: 'pending',
    total_price: 350,
    deposit_amount: 105,
    requires_deposit: true,
    deposit_status: 'paid',
    order_date: '2025-06-01T14:30:00',
    expected_delivery: '2025-06-15',
  },
  {
    id: 'ord_002',
    product: {
      id: 'p2',
      name: 'مزهرية فخارية تقليدية',
      image: 'https://via.placeholder.com/100',
    },
    seller: {
      id: 's2',
      name: 'كريم محمود',
    },
    customer: {
      name: 'فاطمة علي',
      phone: '+966507654321',
      address: 'جدة، حي البلد، شارع قابل'
    },
    status: 'pending',
    payment_method: 'cash_on_delivery',
    payment_status: 'pending',
    total_price: 120,
    deposit_amount: 0,
    requires_deposit: true,
    deposit_status: 'not_paid',
    order_date: '2025-06-03T10:15:00',
    expected_delivery: '2025-06-20',
  },
  {
    id: 'ord_003',
    product: {
      id: 'p3',
      name: 'لوحة فنية تراثية',
      image: 'https://via.placeholder.com/100',
    },
    seller: {
      id: 's3',
      name: 'سارة أحمد',
    },
    customer: {
      name: 'خالد حسن',
      phone: '+966509876543',
      address: 'الدمام، حي الخليج، شارع الملك عبدالعزيز'
    },
    status: 'completed',
    payment_method: 'cash_on_delivery',
    payment_status: 'paid',
    total_price: 500,
    deposit_amount: 150,
    requires_deposit: true,
    deposit_status: 'paid',
    order_date: '2025-05-20T09:45:00',
    delivery_date: '2025-06-01T16:30:00',
  }
];

const OrdersPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  
  useEffect(() => {
    // تحميل الطلبات من التخزين المحلي ودمجها مع البيانات الوهمية
    setIsLoading(true);
    
    // جلب الطلبات المحفوظة في التخزين المحلي
    const storedOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
    
    // تحويل الطلبات المحفوظة لتتناسب مع تنسيق البيانات الوهمية
    const formattedStoredOrders = storedOrders.map(order => ({
      ...order,
      product: order.items && order.items.length > 0 ? {
        id: order.items[0].product_id,
        name: order.items[0].product_name,
        image: order.items[0].product_image || 'https://via.placeholder.com/100'
      } : {
        id: 'unknown',
        name: 'منتج غير محدد',
        image: 'https://via.placeholder.com/100'
      },
      seller: {
        id: 's1',
        name: 'محل الحرف اليدوية'
      },
      customer: order.customer || {
        name: 'عميل جديد',
        phone: '',
        address: 'يرجى إدخال عنوان التوصيل'
      },
      expected_delivery: order.expected_delivery || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));
    
    // دمج الطلبات المحفوظة مع البيانات الوهمية
    const allOrders = [...formattedStoredOrders, ...mockOrders];
    
    setTimeout(() => {
      setOrders(allOrders);
      setIsLoading(false);
    }, 500);
  }, []);
  
  // Función para pagar el resto del monto
  const handleRemainingPayment = async (orderId) => {
    setIsLoading(true);
    
    try {
      // En una aplicación real, llamaríamos a la API
      /* const response = await api.post('/payments/remaining', {
        order_id: orderId,
        payment_method: 'credit_card'
      }); */
      
      // Simulamos el proceso de pago exitoso
      setTimeout(() => {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: 'paid' } : order
        ));
        
        toast({
          title: "تم الدفع بنجاح",
          description: "تم دفع المبلغ المتبقي وسيتم متابعة الطلب",
        });
        
        setIsLoading(false);
        setActiveOrderId(null);
      }, 1500);
      
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  // Función para renderizar el estado del pedido
  const renderStatus = (status) => {
    const statusMap = {
      'pending': { 
        label: 'قيد الانتظار', 
        icon: <Clock className="h-4 w-4 ml-1" />, 
        color: 'bg-amber-100 text-amber-800 border-amber-200' 
      },
      'paid': { 
        label: 'تم الدفع', 
        icon: <Check className="h-4 w-4 ml-1" />, 
        color: 'bg-blue-100 text-blue-800 border-blue-200' 
      },
      'in_progress': { 
        label: 'جاري التنفيذ', 
        icon: <Package className="h-4 w-4 ml-1" />, 
        color: 'bg-purple-100 text-purple-800 border-purple-200' 
      },
      'completed': { 
        label: 'مكتمل', 
        icon: <Check className="h-4 w-4 ml-1" />, 
        color: 'bg-green-100 text-green-800 border-green-200' 
      },
      'cancelled': { 
        label: 'ملغى', 
        icon: <AlertTriangle className="h-4 w-4 ml-1" />, 
        color: 'bg-red-100 text-red-800 border-red-200' 
      },
    };
    
    const statusInfo = statusMap[status] || statusMap['pending'];
    
    return (
      <Badge variant="outline" className={`flex items-center ${statusInfo.color}`}>
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    );
  };
  
  // Filtrar pedidos por estado
  const pendingOrders = orders.filter(order => ['pending', 'paid', 'in_progress'].includes(order.status));
  const completedOrders = orders.filter(order => order.status === 'completed');
  const cancelledOrders = orders.filter(order => order.status === 'cancelled');
    // Renderizar una tarjeta de pedido
  const renderOrderCard = (order) => {
    const depositPaid = order.requires_deposit && order.deposit_status === 'paid';
    const needsRemainingPayment = depositPaid && order.payment_status !== 'paid' && order.status !== 'completed';
    const remainingAmount = order.total_price - (order.deposit_amount || 0);
    
    // وظيفة عرض طريقة الدفع
    const getPaymentMethodLabel = (method) => {
      const methods = {
        'cash_on_delivery': 'الدفع عند الاستلام',
        'bank_transfer': 'تحويل بنكي',
        'credit_card': 'بطاقة ائتمان'
      };
      return methods[method] || method;
    };
    
    return (
      <motion.div
        key={order.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{order.product.name}</CardTitle>
              {renderStatus(order.status)}
            </div>
            <CardDescription>
              طلب رقم: {order.id} | البائع: {order.seller.name}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-2">
            <div className="flex">
              <img 
                src={order.product.image} 
                alt={order.product.name} 
                className="w-20 h-20 object-cover rounded-md ml-4"
              />
              <div className="space-y-2 flex-1">
                <div className="flex items-center text-sm">
                  <ShoppingBag className="h-4 w-4 ml-1 text-gray-500" />
                  <span>تاريخ الطلب: {new Date(order.order_date).toLocaleDateString('ar-EG')}</span>
                </div>
                
                {order.status !== 'completed' && order.expected_delivery && (
                  <div className="flex items-center text-sm">
                    <Truck className="h-4 w-4 ml-1 text-gray-500" />
                    <span>التسليم المتوقع: {new Date(order.expected_delivery).toLocaleDateString('ar-EG')}</span>
                  </div>
                )}
                
                {order.status === 'completed' && order.delivery_date && (
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 ml-1 text-green-500" />
                    <span>تم التسليم: {new Date(order.delivery_date).toLocaleDateString('ar-EG')}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm font-semibold">
                  <CreditCard className="h-4 w-4 ml-1 text-gray-500" />
                  <span>السعر الإجمالي: {order.total_price} ريال</span>
                </div>

                {/* معلومات العميل */}
                {order.customer && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 ml-1 text-gray-500" />
                      <span>{order.customer.name}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 ml-1 text-gray-500" />
                      <span>{order.customer.phone}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 ml-1 text-gray-500" />
                      <span className="truncate">{order.customer.address}</span>
                    </div>
                  </div>
                )}

                {/* طريقة الدفع */}
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <CreditCard className="h-4 w-4 ml-1 text-gray-500" />
                    {getPaymentMethodLabel(order.payment_method)}
                  </span>
                  <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                    {order.payment_status === 'paid' ? 'مدفوع' : 'غير مدفوع'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {depositPaid && (
              <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
                <p className="text-green-800 flex items-center">
                  <Check className="h-4 w-4 ml-1" />
                  تم دفع العربون: {order.deposit_amount} ريال
                </p>
                
                {needsRemainingPayment && (
                  <p className="text-orange-700 mt-1">
                    المبلغ المتبقي: {remainingAmount} ريال
                  </p>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between pt-2">            <Button 
              variant="outline" 
              className="text-primary"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              تفاصيل الطلب
              <ArrowRight className="mr-2 h-4 w-4" />
            </Button>
            
            {needsRemainingPayment && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>دفع المبلغ المتبقي</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>تأكيد دفع المبلغ المتبقي</AlertDialogTitle>
                    <AlertDialogDescription>
                      أنت على وشك دفع المبلغ المتبقي لهذا الطلب وقيمته {remainingAmount} ريال.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleRemainingPayment(order.id)}
                      disabled={isLoading}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isLoading && activeOrderId === order.id ? 'جاري المعالجة...' : 'تأكيد الدفع'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    );
  };
  
  if (!user) {
    return <div className="container mx-auto px-4 py-8 text-center">يرجى تسجيل الدخول لعرض الطلبات.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">طلباتي</h1>
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="flex mb-6">
          <TabsTrigger value="pending" className="flex-1">
            قيد التنفيذ ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            مكتملة ({completedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex-1">
            ملغاة ({cancelledOrders.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {pendingOrders.length > 0 ? (
            pendingOrders.map(renderOrderCard)
          ) : (
            <p className="text-center text-gray-500 py-8">لا توجد طلبات قيد التنفيذ حالياً.</p>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length > 0 ? (
            completedOrders.map(renderOrderCard)
          ) : (
            <p className="text-center text-gray-500 py-8">لا توجد طلبات مكتملة حالياً.</p>
          )}
        </TabsContent>
        
        <TabsContent value="cancelled" className="space-y-4">
          {cancelledOrders.length > 0 ? (
            cancelledOrders.map(renderOrderCard)
          ) : (
            <p className="text-center text-gray-500 py-8">لا توجد طلبات ملغاة حالياً.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersPage;
