import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, User, Phone, MapPin, FileText, ShoppingBag, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

const CheckoutPage = () => {
  const { cart, clearCart, getCartTotal } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    payment_method: 'cash_on_delivery',
    requirements: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentProofFile, setPaymentProofFile] = useState(null);

  // Redirect to cart if no items
  React.useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'اسم العميل مطلوب';
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'رقم الهاتف مطلوب';
    } else if (!/^[0-9]{11}$/.test(formData.customer_phone.replace(/\s/g, ''))) {
      newErrors.customer_phone = 'رقم الهاتف يجب أن يكون 11 رقم';
    }

    if (!formData.delivery_address.trim()) {
      newErrors.delivery_address = 'عنوان التوصيل مطلوب';
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'طريقة الدفع مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "يرجى تصحيح الأخطاء والمحاولة مرة أخرى.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // تحويل عناصر السلة إلى التنسيق المطلوب للباك إند
      const cartItems = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }));

      let response;
      
      if (paymentProofFile) {
        // إنشاء FormData لإرسال الملفات
        const formDataToSend = new FormData();
        
        // إضافة بيانات الطلب
        formDataToSend.append('cart_items', JSON.stringify(cartItems));
        Object.keys(formData).forEach(key => {
          if (formData[key]) {
            formDataToSend.append(key, formData[key]);
          }
        });
        
        // إضافة صورة إثبات الدفع
        formDataToSend.append('payment_proof', paymentProofFile);

        console.log('Creating order with payment proof file');
        response = await api.createOrderWithFiles(formDataToSend);
      } else {
        // إنشاء الطلب بدون ملفات
        const orderData = {
          cart_items: cartItems,
          ...formData
        };

        console.log('Creating order with data:', orderData);
        response = await api.createOrder(orderData);
      }
      console.log('Full API response:', response);
      
      // Check if the response has the expected structure
      if (!response || (!response.id && !response.data?.id)) {
        throw new Error('Invalid response structure from server');
      }
      
      // تفريغ السلة بعد إنشاء الطلب بنجاح
      clearCart();

      toast({
        title: "تم إنشاء الطلب بنجاح!",
        description: "سيتم مراجعة طلبك وإشعارك بأي تحديثات.",
      });

      // الانتقال لصفحة تفاصيل الطلب
      const orderId = response.data?.id || response.id;
      console.log('Order ID received:', orderId);
      
      if (!orderId) {
        throw new Error('No order ID received from server');
      }
      
      console.log('Navigating to order:', orderId);
      navigate(`/orders/${orderId}`);
      
    } catch (error) {
      console.error('Error creating order:', error);
      console.error('Error response:', error.response);
      
      // Try to extract more detailed error message
      let errorMessage = "حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Check if it's a validation error
      if (error.message && error.message.includes('API error: 422')) {
        errorMessage = "خطأ في البيانات المرسلة. تأكد من صحة جميع البيانات.";
      }
      
      // Check if it's a 500 error
      if (error.message && error.message.includes('API error: 500')) {
        errorMessage = "خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.";
      }
      
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء الطلب",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-darkOlive">إتمام الطلب</h1>
          <Button variant="outline" onClick={() => navigate('/cart')} className="border-olivePrimary text-olivePrimary hover:bg-olivePrimary hover:text-white">
            <ArrowLeft className="ml-2 h-4 w-4" /> العودة للسلة
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="md:col-span-2">
            <Card className="shadow-lg border-olivePrimary/20">
              <CardHeader>
                <CardTitle className="text-2xl text-darkOlive">بيانات الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Name */}
                <div className="space-y-2">
                  <Label htmlFor="customer_name" className="text-darkOlive flex items-center">
                    <User className="ml-2 h-4 w-4 text-olivePrimary" />
                    اسم العميل *
                  </Label>
                  <Input
                    id="customer_name"
                    type="text"
                    placeholder="أدخل اسمك الكامل"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    className={`border-olivePrimary/30 ${errors.customer_name ? 'border-red-500' : ''}`}
                  />
                  {errors.customer_name && (
                    <p className="text-red-500 text-sm">{errors.customer_name}</p>
                  )}
                </div>

                {/* Customer Phone */}
                <div className="space-y-2">
                  <Label htmlFor="customer_phone" className="text-darkOlive flex items-center">
                    <Phone className="ml-2 h-4 w-4 text-olivePrimary" />
                    رقم الهاتف *
                  </Label>
                  <Input
                    id="customer_phone"
                    type="tel"
                    placeholder="مثال: 01234567890"
                    value={formData.customer_phone}
                    onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                    className={`border-olivePrimary/30 ${errors.customer_phone ? 'border-red-500' : ''}`}
                  />
                  {errors.customer_phone && (
                    <p className="text-red-500 text-sm">{errors.customer_phone}</p>
                  )}
                </div>

                {/* Delivery Address */}
                <div className="space-y-2">
                  <Label htmlFor="delivery_address" className="text-darkOlive flex items-center">
                    <MapPin className="ml-2 h-4 w-4 text-olivePrimary" />
                    عنوان التوصيل *
                  </Label>
                  <Textarea
                    id="delivery_address"
                    placeholder="أدخل العنوان المفصل للتوصيل"
                    value={formData.delivery_address}
                    onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                    className={`border-olivePrimary/30 min-h-[100px] ${errors.delivery_address ? 'border-red-500' : ''}`}
                  />
                  {errors.delivery_address && (
                    <p className="text-red-500 text-sm">{errors.delivery_address}</p>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label className="text-darkOlive flex items-center">
                    <CreditCard className="ml-2 h-4 w-4 text-olivePrimary" />
                    طريقة الدفع *
                  </Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => handleInputChange('payment_method', value)}
                  >
                    <SelectTrigger className="border-olivePrimary/30">
                      <SelectValue placeholder="اختر طريقة الدفع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash_on_delivery">الدفع عند الاستلام</SelectItem>
                      <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                      <SelectItem value="vodafone_cash">فودافون كاش</SelectItem>
                      <SelectItem value="instapay">انستاباي</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.payment_method && (
                    <p className="text-red-500 text-sm">{errors.payment_method}</p>
                  )}
                </div>

                {/* Requirements */}
                <div className="space-y-2">
                  <Label htmlFor="requirements" className="text-darkOlive flex items-center">
                    <FileText className="ml-2 h-4 w-4 text-olivePrimary" />
                    متطلبات إضافية (اختياري)
                  </Label>
                  <Textarea
                    id="requirements"
                    placeholder="أي متطلبات أو ملاحظات إضافية"
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    className="border-olivePrimary/30"
                  />
                </div>

                {/* Payment Proof Upload */}
                {formData.payment_method !== 'cash_on_delivery' && (
                  <div className="space-y-2">
                    <Label className="text-darkOlive flex items-center">
                      <Upload className="ml-2 h-4 w-4 text-olivePrimary" />
                      صورة إثبات الدفع (اختياري)
                    </Label>
                    <div className="border-2 border-dashed border-olivePrimary/30 rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPaymentProofFile(e.target.files[0])}
                        className="hidden"
                        id="payment_proof"
                      />
                      <label
                        htmlFor="payment_proof"
                        className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                      >
                        <Upload className="h-8 w-8 text-olivePrimary" />
                        <span className="text-sm text-darkOlive">
                          {paymentProofFile ? paymentProofFile.name : 'اضغط لاختيار صورة إثبات الدفع'}
                        </span>
                        <span className="text-xs text-darkOlive/60">
                          يمكنك رفع الصورة الآن أو لاحقاً من صفحة تفاصيل الطلب
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <Card className="shadow-xl border-orange-200 sticky top-24">
              <CardHeader>
                <CardTitle className="text-2xl text-primary flex items-center">
                  <ShoppingBag className="ml-2 h-5 w-5" />
                  ملخص الطلب
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium text-darkOlive">{item.title}</p>
                        <p className="text-darkOlive/60">الكمية: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-olivePrimary">
                        {item.price * item.quantity} جنيه
                      </p>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-gray-700">
                  <span>المجموع الفرعي</span>
                  <span>{getCartTotal()} جنيه</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>الشحن</span>
                  <span className="text-green-600">مجاني</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold text-gray-800">
                  <span>الإجمالي</span>
                  <span>{getCartTotal()} جنيه</span>
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <Button 
                  size="lg" 
                  onClick={handlePlaceOrder} 
                  disabled={isLoading}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  {isLoading ? (
                    <>جاري إنشاء الطلب...</>
                  ) : (
                    <>
                      <CreditCard className="ml-2 h-5 w-5" /> 
                      تأكيد الطلب
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutPage; 