import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Clock, 
  Package, 
  Check, 
  AlertTriangle, 
  CreditCard, 
  Truck, 
  ShoppingBag,
  User,
  Phone,
  MapPin,
  MessageSquare,
  Edit
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// بيانات وهمية للطلب
const mockOrderDetail = {
  id: 'ord_001',
  product: {
    id: 'p1',
    name: 'كرسي خشبي مزخرف',
    image: 'https://via.placeholder.com/200x200',
    description: 'كرسي خشبي مزخرف بتصاميم تقليدية'
  },
  seller: {
    id: 's1',
    name: 'ليلى حسن',
    avatar: 'https://via.placeholder.com/40x40',
    rating: 4.8,
    response_time: '2 ساعة'
  },
  customer: {
    name: 'أحمد محمد',
    phone: '+966501234567',
    address: 'الرياض، حي النخيل، شارع الملك فهد، رقم 123'
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
  requirements: 'أريد الكرسي باللون البني الفاتح مع نقش اسم "محمد" على الظهر',
  chat_conversation_id: 'conv_001'
};

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderNotFound, setOrderNotFound] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    payment_method: 'cash_on_delivery'
  });  useEffect(() => {
    // في التطبيق الحقيقي، سنستدعي API لجلب تفاصيل الطلب
    setIsLoading(true);
    
    // التحقق من الطلبات في التخزين المحلي أولاً
    const storedOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
    const storedOrder = storedOrders.find(o => o.id === orderId);
    
    if (storedOrder) {
      // إذا تم العثور على الطلب في التخزين المحلي
      const orderDetail = {
        ...storedOrder,
        seller: {
          id: 's1',
          name: 'محل الحرف اليدوية',
          avatar: 'https://via.placeholder.com/100',
          rating: 4.8,
          total_orders: 156
        },
        customer: storedOrder.customer.name ? storedOrder.customer : {
          name: 'عميل جديد',
          phone: '',
          address: 'يرجى إدخال عنوان التوصيل'
        },
        expected_delivery: storedOrder.expected_delivery || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        order_history: [
          {
            status: 'pending',
            date: storedOrder.order_date,
            note: 'تم إنشاء الطلب'
          }
        ]
      };
      
      setOrder(orderDetail);
      setEditData({
        customer_name: orderDetail.customer.name === 'عميل جديد' ? '' : orderDetail.customer.name,
        customer_phone: orderDetail.customer.phone,
        delivery_address: orderDetail.customer.address === 'يرجى إدخال عنوان التوصيل' ? '' : orderDetail.customer.address,
        payment_method: orderDetail.payment_method
      });    } else {
      // إذا لم يتم العثور على الطلب، استخدم البيانات الوهمية
      // إذا كان المعرف يطابق البيانات الوهمية، استخدمها
      if (orderId === mockOrderDetail.id) {
        setOrder(mockOrderDetail);
        setEditData({
          customer_name: mockOrderDetail.customer.name,
          customer_phone: mockOrderDetail.customer.phone,
          delivery_address: mockOrderDetail.customer.address,
          payment_method: mockOrderDetail.payment_method
        });
      } else {
        // إذا لم يتم العثور على الطلب نهائياً
        setOrderNotFound(true);
      }
    }
    
    setIsLoading(false);
  }, [orderId]);

  // وظيفة تحديث حالة الطلب
  const handleStatusUpdate = async (newStatus) => {
    setIsLoading(true);
    try {
      // استدعاء API لتحديث الحالة
      setTimeout(() => {
        setOrder(prev => ({ ...prev, status: newStatus }));
        toast({
          title: "تم التحديث بنجاح",
          description: `تم تحديث حالة الطلب إلى: ${getStatusLabel(newStatus)}`,
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الطلب",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // وظيفة دفع المبلغ المتبقي
  const handleRemainingPayment = async () => {
    setIsLoading(true);
    try {
      setTimeout(() => {
        setOrder(prev => ({ 
          ...prev, 
          payment_status: 'paid',
          status: prev.status === 'pending' ? 'in_progress' : prev.status
        }));
        toast({
          title: "تم الدفع بنجاح",
          description: "تم دفع المبلغ المتبقي بنجاح",
        });
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء معالجة الدفع",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  // وظيفة تحديث معلومات الطلب
  const handleUpdateOrderInfo = async () => {
    setIsLoading(true);
    try {
      const updatedOrder = {
        ...order,
        customer: {
          ...order.customer,
          name: editData.customer_name,
          phone: editData.customer_phone,
          address: editData.delivery_address
        },
        payment_method: editData.payment_method
      };

      // تحديث التخزين المحلي إذا كان الطلب موجود فيه
      const storedOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
      const orderIndex = storedOrders.findIndex(o => o.id === orderId);
      
      if (orderIndex !== -1) {
        storedOrders[orderIndex] = {
          ...storedOrders[orderIndex],
          customer: updatedOrder.customer,
          payment_method: updatedOrder.payment_method
        };
        localStorage.setItem('user_orders', JSON.stringify(storedOrders));
      }

      setTimeout(() => {
        setOrder(updatedOrder);
        setEditDialogOpen(false);
        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث معلومات الطلب بنجاح",
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث البيانات",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // وظيفة عرض حالة الطلب
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
      }
    };
    
    const statusInfo = statusMap[status] || statusMap['pending'];
    
    return (
      <Badge variant="outline" className={`flex items-center ${statusInfo.color}`}>
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    );
  };

  // وظيفة عرض طريقة الدفع
  const getPaymentMethodLabel = (method) => {
    const methods = {
      'cash_on_delivery': 'الدفع عند الاستلام',
      'bank_transfer': 'تحويل بنكي',
      'credit_card': 'بطاقة ائتمان'
    };
    return methods[method] || method;
  };

  // وظيفة عرض حالة الدفع
  const getPaymentStatusLabel = (status) => {
    const statuses = {
      'pending': 'قيد الانتظار',
      'partial': 'دفع جزئي',
      'paid': 'مدفوع',
      'refunded': 'مسترد'
    };
    return statuses[status] || status;
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'قيد الانتظار',
      'paid': 'تم الدفع',
      'in_progress': 'جاري التنفيذ',
      'completed': 'مكتمل',
      'cancelled': 'ملغى'
    };
    return statusMap[status] || status;
  };
  if (isLoading && !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }
  if (orderNotFound) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">الطلب غير موجود</h1>
          <p className="text-gray-600 mb-2">لم يتم العثور على الطلب بالمعرف: {orderId}</p>
          <p className="text-gray-500 mb-6">تأكد من صحة رابط الطلب أو قم بإنشاء طلب جديد من السلة</p>
          <div className="space-y-2">
            <Button onClick={() => navigate('/orders')} className="mr-2">
              العودة إلى الطلبات
            </Button>
            <Button variant="outline" onClick={() => navigate('/cart')}>
              إنشاء طلب جديد
            </Button>
          </div>
        </div>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">خطأ في تحميل الطلب</div>
      </div>
    );
  }

  // Move variables here after error checks
  const depositPaid = order.requires_deposit && order.deposit_status === 'paid';
  const needsRemainingPayment = depositPaid && order.payment_status !== 'paid';
  const remainingAmount = order.total_price - (order.deposit_amount || 0);
  const isSeller = user?.role === 'seller';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة
          </Button>
          <div>
            <h1 className="text-2xl font-bold">تفاصيل الطلب #{order.id}</h1>
            <p className="text-gray-600">
              تاريخ الطلب: {new Date(order.order_date).toLocaleDateString('ar-EG')}
            </p>
          </div>
        </div>
        {renderStatus(order.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* المعلومات الأساسية */}
        <div className="lg:col-span-2 space-y-6">
          {/* معلومات المنتج */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                تفاصيل المنتج
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <img 
                  src={order.product.image} 
                  alt={order.product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{order.product.name}</h3>
                  <p className="text-gray-600 mt-1">{order.product.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="font-bold text-lg text-primary">
                      {order.total_price} ريال
                    </span>
                    {order.expected_delivery && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Truck className="h-4 w-4 ml-1" />
                        التسليم المتوقع: {new Date(order.expected_delivery).toLocaleDateString('ar-EG')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {order.requirements && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-semibold mb-2">المتطلبات الخاصة:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {order.requirements}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* معلومات العميل والتوصيل */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  معلومات العميل والتوصيل
                </CardTitle>
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 ml-2" />
                      تعديل
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>تعديل معلومات الطلب</DialogTitle>
                      <DialogDescription>
                        تحديث معلومات العميل والتوصيل وطريقة الدفع
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="customer_name">اسم العميل</Label>
                        <Input
                          id="customer_name"
                          value={editData.customer_name}
                          onChange={(e) => setEditData(prev => ({...prev, customer_name: e.target.value}))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="customer_phone">رقم الهاتف</Label>
                        <Input
                          id="customer_phone"
                          value={editData.customer_phone}
                          onChange={(e) => setEditData(prev => ({...prev, customer_phone: e.target.value}))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="delivery_address">عنوان التوصيل</Label>
                        <Textarea
                          id="delivery_address"
                          value={editData.delivery_address}
                          onChange={(e) => setEditData(prev => ({...prev, delivery_address: e.target.value}))}
                          rows={3}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="payment_method">طريقة الدفع</Label>
                        <Select
                          value={editData.payment_method}
                          onValueChange={(value) => setEditData(prev => ({...prev, payment_method: value}))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash_on_delivery">الدفع عند الاستلام</SelectItem>
                            <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                            <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleUpdateOrderInfo} disabled={isLoading}>
                        {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-semibold">{order.customer.name}</p>
                  <p className="text-sm text-gray-600">اسم العميل</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-semibold">{order.customer.phone}</p>
                  <p className="text-sm text-gray-600">رقم الهاتف</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                <div>
                  <p className="font-semibold">{order.customer.address}</p>
                  <p className="text-sm text-gray-600">عنوان التوصيل</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الشريط الجانبي */}
        <div className="space-y-6">
          {/* ملخص الطلب */}
          <Card>
            <CardHeader>
              <CardTitle>ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>السعر الإجمالي:</span>
                <span className="font-bold">{order.total_price} ريال</span>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">طريقة الدفع:</span>
                </div>
                <p className="font-semibold">{getPaymentMethodLabel(order.payment_method)}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">حالة الدفع:</span>
                </div>
                <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                  {getPaymentStatusLabel(order.payment_status)}
                </Badge>
              </div>

              {order.requires_deposit && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">العربون:</h4>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">المبلغ:</span>
                        <span className="font-bold text-green-700">{order.deposit_amount} ريال</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm">الحالة:</span>
                        <Badge variant={order.deposit_status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                          {order.deposit_status === 'paid' ? 'مدفوع' : 'غير مدفوع'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {needsRemainingPayment && (
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-700 mb-2">المبلغ المتبقي:</p>
                      <p className="font-bold text-lg text-orange-800">{remainingAmount} ريال</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* معلومات البائع */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات البائع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={order.seller.avatar} 
                  alt={order.seller.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold">{order.seller.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span>⭐ {order.seller.rating}</span>
                    <span>•</span>
                    <span>يرد خلال {order.seller.response_time}</span>
                  </div>
                </div>
              </div>
              
              {order.chat_conversation_id && (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate(`/chat/${order.chat_conversation_id}`)}
                >
                  <MessageSquare className="h-4 w-4 ml-2" />
                  فتح المحادثة
                </Button>
              )}
            </CardContent>
          </Card>

          {/* إجراءات */}
          <Card>
            <CardHeader>
              <CardTitle>الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* دفع المبلغ المتبقي */}
              {needsRemainingPayment && !isSeller && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full">
                      دفع المبلغ المتبقي ({remainingAmount} ريال)
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>تأكيد دفع المبلغ المتبقي</AlertDialogTitle>
                      <AlertDialogDescription>
                        أنت على وشك دفع المبلغ المتبقي وقيمته {remainingAmount} ريال.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRemainingPayment} disabled={isLoading}>
                        {isLoading ? 'جاري المعالجة...' : 'تأكيد الدفع'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* إجراءات البائع */}
              {isSeller && (
                <>
                  {order.status === 'pending' && (
                    <Button 
                      className="w-full" 
                      onClick={() => handleStatusUpdate('in_progress')}
                      disabled={isLoading}
                    >
                      بدء تنفيذ الطلب
                    </Button>
                  )}
                  
                  {order.status === 'in_progress' && (
                    <Button 
                      className="w-full" 
                      onClick={() => handleStatusUpdate('completed')}
                      disabled={isLoading}
                    >
                      إكمال الطلب
                    </Button>
                  )}
                  
                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <Button 
                      className="w-full" 
                      variant="destructive"
                      onClick={() => handleStatusUpdate('cancelled')}
                      disabled={isLoading}
                    >
                      إلغاء الطلب
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
