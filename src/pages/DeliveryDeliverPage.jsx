import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Textarea } from '../components/ui/textarea';
import { 
  ArrowLeft, 
  Truck, 
  User, 
  Phone, 
  MapPin, 
  DollarSign,
  Calendar,
  Loader2,
  CheckCircle,
  Package,
  PauseCircle
} from 'lucide-react';
import { toast } from '../components/ui/use-toast';
import { deliveryApi } from '../lib/api';

const DeliveryDeliverPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [error, setError] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');

  const token = localStorage.getItem('delivery_token');

  useEffect(() => {
    if (!token) {
      navigate('/delivery/login');
      return;
    }

    fetchOrderDetails();
  }, [orderId, token, navigate]);

  const fetchOrderDetails = async () => {
    try {
      const data = await deliveryApi.getOrderDetails(orderId);
      if (data.success) {
        setOrder(data.data);
      } else {
        setError(data.message || 'حدث خطأ أثناء جلب تفاصيل الطلب');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      if (error.message.includes('401')) {
        localStorage.removeItem('delivery_token');
        navigate('/delivery/login');
        return;
      }
      setError('حدث خطأ أثناء جلب تفاصيل الطلب');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliverySubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const data = await deliveryApi.deliverOrder(orderId);
      if (data.success) {
        toast({
          title: 'تم التسليم بنجاح',
          description: 'تم تسليم الطلب للعميل بنجاح',
        });
        navigate('/delivery/dashboard');
      } else {
        setError(data.message || 'فشل في تسليم الطلب');
      }
    } catch (error) {
      console.error('Error during delivery:', error);
      setError('حدث خطأ أثناء تسليم الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuspendOrder = async () => {
    if (!suspensionReason.trim()) {
      setError('يجب إدخال سبب تعليق الطلب');
      return;
    }

    setIsSuspending(true);
    setError('');

    try {
      const data = await deliveryApi.suspendOrder(orderId, { reason: suspensionReason });
      if (data.success) {
        toast({
          title: 'تم تعليق الطلب',
          description: 'تم تعليق الطلب بسبب عدم إمكانية الوصول للعميل',
          variant: 'default'
        });
        navigate('/delivery/dashboard');
      } else {
        setError(data.message || 'فشل في تعليق الطلب');
      }
    } catch (error) {
      console.error('Error during suspension:', error);
      setError('حدث خطأ أثناء تعليق الطلب');
    } finally {
      setIsSuspending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Truck className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/delivery/dashboard')}>
              العودة للوحة التحكم
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/delivery/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              العودة
            </Button>
            <h1 className="text-xl font-bold text-gray-900">
              تسليم الطلب #{orderId}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                تفاصيل الطلب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">رقم الطلب:</span>
                <span className="font-semibold">#{order?.id}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">الحالة:</span>
                <Badge variant="outline">{order?.status === 'out_for_delivery' ? 'قيد التوصيل' : order?.status}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">إجمالي المبلغ:</span>
                <span className="font-semibold text-lg">{order?.total_price} ج.م</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">وقت الاستلام:</span>
                <span className="text-sm">
                  {order?.delivery_picked_up_at 
                    ? new Date(order.delivery_picked_up_at).toLocaleString('ar-EG')
                    : 'غير محدد'
                  }
                </span>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">المنتجات:</h4>
                <div className="space-y-2">
                  {order?.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{item.product?.title}</span>
                      <div className="text-sm text-gray-600">
                        {item.quantity} × {item.price} ج.م
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Seller Info */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  معلومات العميل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">الاسم:</span>
                  <span>{order?.customer_name || order?.user?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">رقم الهاتف:</span>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    <span>{order?.customer_phone || order?.user?.phone}</span>
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-gray-600">عنوان التسليم:</span>
                  <div className="flex items-start text-right">
                    <MapPin className="h-4 w-4 mr-1 mt-0.5" />
                    <span className="text-sm">{order?.delivery_address}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">البريد الإلكتروني:</span>
                  <span className="text-sm">{order?.user?.email}</span>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  معلومات البائع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">الاسم:</span>
                  <span>{order?.seller?.user?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">رقم الهاتف:</span>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    <span>{order?.seller?.user?.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Action */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  إجراءات التسليم
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="mb-4">
                    <AlertDescription className="text-red-600">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-6">
                  {/* تأكيد التسليم */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-700">تأكيد التسليم الناجح</h4>
                    <p className="text-sm text-gray-600">
                      تأكد من تسليم جميع المنتجات للعميل قبل النقر على زر التسليم
                    </p>
                    
                    <Button
                      onClick={handleDeliverySubmit}
                      disabled={isSubmitting || order?.status !== 'out_for_delivery'}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          جاري التسليم...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          تأكيد تسليم الطلب
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-center">
                      <span className="text-sm text-gray-400 bg-gray-50 px-3 py-1 rounded">أو</span>
                    </div>
                  </div>

                  {/* تعليق الطلب */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-amber-700">تعليق الطلب</h4>
                    <p className="text-sm text-gray-600">
                      في حالة عدم تمكنك من الوصول للعميل أو عدم استجابته
                    </p>
                    
                    <Textarea
                      placeholder="اكتب سبب تعليق الطلب (مثل: لم يرد العميل، عنوان خاطئ، إلخ...)"
                      value={suspensionReason}
                      onChange={(e) => setSuspensionReason(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    
                    <Button
                      onClick={handleSuspendOrder}
                      disabled={isSuspending || !suspensionReason.trim() || order?.status !== 'out_for_delivery'}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      size="lg"
                      variant="default"
                    >
                      {isSuspending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          جاري التعليق...
                        </>
                      ) : (
                        <>
                          <PauseCircle className="h-4 w-4 mr-2" />
                          تعليق الطلب
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {order?.status !== 'out_for_delivery' && (
                    <p className="text-sm text-amber-600 text-center">
                      هذا الطلب غير متاح للتسليم أو التعليق حالياً
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDeliverPage; 