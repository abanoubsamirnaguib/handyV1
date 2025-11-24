import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Truck, 
  Package, 
  CheckCircle, 
  Clock, 
  Users, 
  Activity,
  LogOut,
  Settings,
  RefreshCw,
  MapPin,
  Phone,
  User,
  DollarSign,
  PauseCircle
} from 'lucide-react';
import { toast } from '../components/ui/use-toast';
import { deliveryApi } from '../lib/api';

const DeliveryDashboardPage = () => {
  const [deliveryPerson, setDeliveryPerson] = useState(null);
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [suspendedOrders, setSuspendedOrders] = useState([]); // الطلبات المعلقة

  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('delivery_token');

  useEffect(() => {
    if (!token) {
      navigate('/delivery/login');
      return;
    }

    fetchDashboardData();
    fetchOrders();
    fetchSuspendedOrders(); // جلب الطلبات المعلقة
  }, [token, navigate]);

  // When orders change, store them in localStorage
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('delivery_orders', JSON.stringify(orders));
    }
  }, [orders]);

  const fetchDashboardData = async () => {
    try {
      const data = await deliveryApi.getProfile();
      if (data.success) {
        setDeliveryPerson(data.data.delivery_person);
        setStats(data.data.stats);
        setIsAvailable(data.data.stats.is_available);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.message.includes('401')) {
        localStorage.removeItem('delivery_token');
        navigate('/delivery/login');
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      // First check if we have any cached data in localStorage
      const cachedOrders = localStorage.getItem('delivery_orders');
      
      const data = await deliveryApi.myOrders();
      if (data.success) {
        // If we have data from the API
        const apiOrders = data.data;
        
        // If we have cached orders, merge the delivery_picked_up_at and delivered_at properties
        // to ensure orders that were marked as picked up/delivered on this device remain filtered
        if (cachedOrders) {
          try {
            const parsedCache = JSON.parse(cachedOrders);
            const mergedOrders = apiOrders.map(apiOrder => {
              const cachedOrder = parsedCache.find(order => order.id === apiOrder.id);
              if (cachedOrder) {
                return {
                  ...apiOrder,
                  delivery_picked_up_at: apiOrder.delivery_picked_up_at || cachedOrder.delivery_picked_up_at,
                  delivered_at: apiOrder.delivered_at || cachedOrder.delivered_at
                };
              }
              return apiOrder;
            });
            setOrders(mergedOrders);
          } catch (e) {
            console.error('Error parsing cached orders:', e);
            setOrders(apiOrders);
          }
        } else {
          // No cache, just use API data
          setOrders(apiOrders);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };



  const fetchSuspendedOrders = async () => {
    try {
      const data = await deliveryApi.suspendedOrders();
      if (data.success) {
        setSuspendedOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching suspended orders:', error);
    }
  };

  const toggleAvailability = async () => {
    try {
      const data = await deliveryApi.toggleAvailability();
      if (data.success) {
        setIsAvailable(data.data.is_available);
        toast({
          title: 'تم تحديث الحالة',
          description: data.message,
        });
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };



  const handlePickupOrder = async (orderId) => {
    setProcessingOrder(orderId);
    try {
      const data = await deliveryApi.pickupOrder(orderId);
      if (data.success) {
        toast({
          title: 'تم الاستلام بنجاح',
          description: 'تم استلام الطلب من البائع بنجاح',
        });
        // Update the orders list by marking this order as picked up
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, delivery_picked_up_at: new Date().toISOString() } 
              : order
          )
        );
      } else {
        toast({
          title: 'خطأ',
          description: data.message || 'فشل في استلام الطلب',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error during pickup:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء استلام الطلب',
        variant: 'destructive',
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleDeliverOrder = async (orderId) => {
    setProcessingOrder(orderId);
    try {
      const data = await deliveryApi.deliverOrder(orderId);
      if (data.success) {
        toast({
          title: 'تم التسليم بنجاح',
          description: 'تم تسليم الطلب للعميل بنجاح',
        });
        // Update the orders list by marking this order as delivered
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { 
                  ...order, 
                  delivered_at: new Date().toISOString()
                } 
              : order
          )
        );
      } else {
        toast({
          title: 'خطأ',
          description: data.message || 'فشل في تسليم الطلب',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error during delivery:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تسليم الطلب',
        variant: 'destructive',
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleLogout = async () => {
    try {
      await deliveryApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('delivery_token');
      localStorage.removeItem('delivery_person');
      navigate('/delivery/login');
    }
  };

  const refreshData = () => {
    fetchDashboardData();
    fetchOrders();
  };

  const refreshAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchDashboardData(),
      fetchOrders(), 
      fetchSuspendedOrders()
    ]);
    setIsLoading(false);
  };

  const getOrdersByStatus = (status) => {
    if (status === 'ready_for_delivery') {
      // فقط الطلبات التي بحالة "ready_for_delivery" وليس لها delivery_picked_up_at
      return orders.filter(order => order.status === status && !order.delivery_picked_up_at);
    } else if (status === 'out_for_delivery') {
      // الطلبات في حالة out_for_delivery أو (ready_for_delivery لكن تم استلامها بالفعل) ولم يتم تسليمها بعد
      return orders.filter(order => 
        (order.status === status || (order.status === 'ready_for_delivery' && order.delivery_picked_up_at)) && 
        !order.delivered_at
      );
    }
    return orders.filter(order => order.status === status);
  };



  const renderOrderCard = (order) => (
    <Card key={order.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">طلب #{order.id}</CardTitle>
            <CardDescription>
              {order.status === 'ready_for_delivery' ? 'جاهز للاستلام' : 'جاهز للتسليم'}
            </CardDescription>
          </div>
          <Badge variant={order.status === 'ready_for_delivery' ? 'default' : 'secondary'}>
            {order.status === 'ready_for_delivery' ? 'استلام' : 'تسليم'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Order Info */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">إجمالي المبلغ:</span>
            <span className="font-semibold text-lg">{order.total_price} ج.م</span>
          </div>
          
          {/* Customer/Seller Info */}
          {order.status === 'ready_for_delivery' ? (
            <div className="border-t pt-3">
              <h4 className="font-medium mb-2 flex items-center">
                <User className="h-4 w-4 mr-1" />
                بيانات البائع
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>الاسم: {order.seller?.user?.name}</div>
                <div className="flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  {order.seller?.user?.phone}
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t pt-3">
              <h4 className="font-medium mb-2 flex items-center">
                <User className="h-4 w-4 mr-1" />
                بيانات المشتري
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>الاسم: {order.customer_name || order.user?.name}</div>
                <div className="flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  {order.customer_phone || order.user?.phone}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {order.delivery_address}
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          <div className="border-t pt-3">
            <h4 className="font-medium mb-2">المنتجات:</h4>
            <div className="space-y-1">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>{item.product?.title}</span>
                  <div className="text-gray-600">
                    {item.quantity} × {item.price} ج.م
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="border-t pt-3">
            {order.status === 'ready_for_delivery' ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(`/delivery/pickup/${order.id}`)}
                  className="flex-1"
                  variant="outline"
                >
                  <Package className="h-4 w-4 mr-2" />
                  تفاصيل الاستلام
                </Button>
                <Button
                  onClick={() => handlePickupOrder(order.id)}
                  disabled={processingOrder === order.id}
                  className="flex-1"
                >
                  {processingOrder === order.id ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      جاري الاستلام...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      استلام سريع
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(`/delivery/deliver/${order.id}`)}
                  className="flex-1"
                  variant="outline"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  تفاصيل التسليم
                </Button>
                <Button
                  onClick={() => handleDeliverOrder(order.id)}
                  disabled={processingOrder === order.id}
                  className="flex-1"
                  variant="secondary"
                >
                  {processingOrder === order.id ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      جاري التسليم...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      تسليم سريع
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSuspendedOrderCard = (order) => (
    <Card key={order.id} className="mb-4 border-amber-200 bg-amber-50">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">طلب #{order.id}</CardTitle>
            <CardDescription className="text-amber-700">
              معلق - {order.suspension_reason}
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-amber-500 text-amber-700">
            معلق
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Order Info */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">إجمالي المبلغ:</span>
            <span className="font-semibold text-lg">{order.total_price} ج.م</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">تاريخ التعليق:</span>
            <span className="text-sm text-gray-600">
              {order.suspended_at 
                ? new Date(order.suspended_at).toLocaleString('ar-EG')
                : 'غير محدد'
              }
            </span>
          </div>

          {/* Customer Info */}
          <div className="border-t pt-3">
            <h4 className="font-medium mb-2 flex items-center">
              <User className="h-4 w-4 mr-1" />
              معلومات العميل
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>الاسم: {order.customer_name || order.user?.name}</div>
              <div className="flex items-center">
                <Phone className="h-3 w-3 mr-1" />
                {order.customer_phone || order.user?.phone}
              </div>
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {order.delivery_address}
              </div>
            </div>
          </div>

          {/* Suspension Reason */}
          <div className="border-t pt-3">
            <h4 className="font-medium mb-2 text-amber-700">سبب التعليق:</h4>
            <p className="text-sm text-gray-700 bg-amber-100 p-2 rounded">
              {order.suspension_reason}
            </p>
          </div>

          {/* Products */}
          <div className="border-t pt-3">
            <h4 className="font-medium mb-2">المنتجات:</h4>
            <div className="space-y-1">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>{item.product?.title}</span>
                  <div className="text-gray-600">
                    {item.quantity} × {item.price} ج.م
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Note */}
          <div className="border-t pt-3">
            <p className="text-xs text-amber-700 bg-amber-100 p-2 rounded">
              ℹ️ هذا الطلب تم تعليقه بسبب عدم إمكانية الوصول للعميل. سيتم التعامل معه لاحقاً من قبل الإدارة.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Truck className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">لوحة تحكم الدليفري</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAllData}
                className="mr-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                تحديث
              </Button>
              <Button
                variant={isAvailable ? "default" : "secondary"}
                size="sm"
                onClick={toggleAvailability}
                className="mr-2"
              >
                {isAvailable ? "متاح" : "غير متاح"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-1" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            مرحباً {deliveryPerson?.name}
          </h2>
          <p className="text-gray-600">
            إليك ملخص أنشطة التوصيل اليوم
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المشاوير المكتملة</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Math.floor(stats.trips_count / 2) || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                إجمالي عدد المشاوير المكتملة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">في انتظار الاستلام من البائع</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getOrdersByStatus('ready_for_delivery').length}</div>
              <p className="text-xs text-muted-foreground">
                طلبات مخصصة لي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">في انتظار التسليم للمشتري</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getOrdersByStatus('out_for_delivery').length}</div>
              <p className="text-xs text-muted-foreground">
                طلبات للتسليم
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">طلبات معلقة</CardTitle>
              <PauseCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{suspendedOrders.length}</div>
              <p className="text-xs text-muted-foreground">
                لم يتم الوصول للعميل
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Section */}
        <Tabs defaultValue="pickup" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pickup">
              في انتظار الاستلام من البائع ({getOrdersByStatus('ready_for_delivery').length})
            </TabsTrigger>
            <TabsTrigger value="delivery">
              في انتظار التسليم للمشتري ({getOrdersByStatus('out_for_delivery').length})
            </TabsTrigger>
            <TabsTrigger value="suspended">
              طلبات معلقة ({suspendedOrders.length})
            </TabsTrigger>
          </TabsList>
          

          
          <TabsContent value="pickup" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getOrdersByStatus('ready_for_delivery').length > 0 ? (
                getOrdersByStatus('ready_for_delivery').map(renderOrderCard)
              ) : (
                <Card className="col-span-full">
                  <CardContent className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">لا توجد طلبات للاستلام حالياً</p>
                    <p className="text-sm text-gray-500 mt-2">سيتم تعيين الطلبات من قبل الأدمن</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="delivery" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getOrdersByStatus('out_for_delivery').length > 0 ? (
                getOrdersByStatus('out_for_delivery').map(renderOrderCard)
              ) : (
                <Card className="col-span-full">
                  <CardContent className="text-center py-8">
                    <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">لا توجد طلبات للتسليم حالياً</p>
                    <p className="text-sm text-gray-500 mt-2">اكمل استلام الطلبات أولاً</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="suspended" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {suspendedOrders.length > 0 ? (
                suspendedOrders.map(renderSuspendedOrderCard)
              ) : (
                <Card className="col-span-full">
                  <CardContent className="text-center py-8">
                    <Clock className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                    <p className="text-gray-600">لا توجد طلبات معلقة</p>
                    <p className="text-sm text-gray-500 mt-2">الطلبات المعلقة ستظهر هنا عند تعليقها</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeliveryDashboardPage;