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
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

const CheckoutPage = () => {
  const { cart, clearCart, getCartTotal } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();

  // Form state
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    payment_method: 'cash_on_delivery',
    requirements: '',
    city_id: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentProofFile, setPaymentProofFile] = useState(null);

  // Cities state
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // Redirect to cart if no items and load cities
  React.useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  React.useEffect(() => {
    const loadCities = async () => {
      try {
        setCitiesLoading(true);
        const data = await api.getCities();
        const list = data?.data || data || [];
        setCities(Array.isArray(list) ? list : []);
      } catch (e) {
        // silent fail; UI will prompt to select city later
        console.error('Failed to load cities', e);
      } finally {
        setCitiesLoading(false);
      }
    };
    loadCities();
  }, []);

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

    if (!formData.city_id) {
      newErrors.city_id = 'المدينة مطلوبة';
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
      const cartItems = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }));

      let response;
      
      if (paymentProofFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('cart_items', JSON.stringify(cartItems));
        Object.keys(formData).forEach(key => {
          if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
            formDataToSend.append(key, formData[key]);
          }
        });
        formDataToSend.append('payment_proof', paymentProofFile);

        console.log('Creating order with payment proof file');
        response = await api.createOrderWithFiles(formDataToSend);
      } else {
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
      
      // Extract error message - the API now extracts the message from JSON response
      let errorMessage = error.message || "حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.";
      
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء الطلب",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Derived amounts
  const baseTotal = getCartTotal();
  const selectedCity = cities.find(c => String(c.id) === String(formData.city_id));
  const deliveryFee = selectedCity ? Number(selectedCity.delivery_fee || 0) : 0;
  const grandTotal = baseTotal + deliveryFee;

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
          <h1 className="text-3xl font-bold text-neutral-900">إتمام الطلب</h1>
          <Button variant="outline" onClick={() => navigate('/cart')} className="border-roman-500 text-roman-500 hover:bg-roman-500 hover:text-white">
            <ArrowLeft className="ml-2 h-4 w-4" /> العودة للسلة
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="md:col-span-2">
            <Card className="shadow-lg border-roman-500/20">
              <CardHeader>
                <CardTitle className="text-2xl text-neutral-900">بيانات الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Name */}
                <div className="space-y-2">
                  <Label htmlFor="customer_name" className="text-neutral-900 flex items-center">
                    <User className="ml-2 h-4 w-4 text-roman-500" />
                    اسم العميل *
                  </Label>
                  <Input
                    id="customer_name"
                    type="text"
                    placeholder="أدخل اسمك الكامل"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    className={`border-roman-500/30 ${errors.customer_name ? 'border-red-500' : ''}`}
                  />
                  {errors.customer_name && (
                    <p className="text-red-500 text-sm">{errors.customer_name}</p>
                  )}
                </div>

                {/* Customer Phone */}
                <div className="space-y-2">
                  <Label htmlFor="customer_phone" className="text-neutral-900 flex items-center">
                    <Phone className="ml-2 h-4 w-4 text-roman-500" />
                    رقم الهاتف *
                  </Label>
                  <Input
                    id="customer_phone"
                    type="tel"
                    placeholder="مثال: 01234567890"
                    value={formData.customer_phone}
                    onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                    className={`border-roman-500/30 ${errors.customer_phone ? 'border-red-500' : ''}`}
                  />
                  {errors.customer_phone && (
                    <p className="text-red-500 text-sm">{errors.customer_phone}</p>
                  )}
                </div>

                {/* Delivery Address */}
                <div className="space-y-2">
                  <Label htmlFor="delivery_address" className="text-neutral-900 flex items-center">
                    <MapPin className="ml-2 h-4 w-4 text-roman-500" />
                    عنوان التوصيل *
                  </Label>
                  <Textarea
                    id="delivery_address"
                    placeholder="أدخل العنوان المفصل للتوصيل"
                    value={formData.delivery_address}
                    onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                    className={`border-roman-500/30 min-h-[100px] ${errors.delivery_address ? 'border-red-500' : ''}`}
                  />
                  {errors.delivery_address && (
                    <p className="text-red-500 text-sm">{errors.delivery_address}</p>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label className="text-neutral-900 flex items-center">
                    <CreditCard className="ml-2 h-4 w-4 text-roman-500" />
                    طريقة الدفع *
                  </Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => handleInputChange('payment_method', value)}
                  >
                    <SelectTrigger className="border-roman-500/30">
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

                {/* City */}
                <div className="space-y-2">
                  <Label className="text-neutral-900 flex items-center">
                    <MapPin className="ml-2 h-4 w-4 text-roman-500" />
                    المدينة *
                  </Label>
                  <Select
                    value={String(formData.city_id || '')}
                    onValueChange={(value) => handleInputChange('city_id', value)}
                    disabled={citiesLoading}
                  >
                    <SelectTrigger className="border-roman-500/30">
                      <SelectValue placeholder={citiesLoading ? 'جاري التحميل...' : 'اختر المدينة'} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={String(city.id)}>
                          {city.name} — رسوم التوصيل: {Number(city.delivery_fee || 0)} ج.م
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.city_id && (
                    <p className="text-red-500 text-sm">{errors.city_id}</p>
                  )}
                </div>

                {/* Requirements */}
                <div className="space-y-2">
                  <Label htmlFor="requirements" className="text-neutral-900 flex items-center">
                    <FileText className="ml-2 h-4 w-4 text-roman-500" />
                    متطلبات إضافية (اختياري)
                  </Label>
                  <Textarea
                    id="requirements"
                    placeholder="أي متطلبات أو ملاحظات إضافية"
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    className="border-roman-500/30"
                  />
                </div>

                {/* Payment Proof Upload */}
                {formData.payment_method !== 'cash_on_delivery' && (
                  <div className="space-y-2">
                    <Label className="text-neutral-900 flex items-center">
                      <Upload className="ml-2 h-4 w-4 text-roman-500" />
                      صورة إثبات الدفع (اختياري)
                    </Label>
                    {settings.transactionNumber && (
                      <div className="bg-roman-50 border border-roman-200 rounded-lg p-3 mb-3">
                        <p className="text-sm font-semibold text-roman-800 mb-1">رقم الحساب/التحويل:</p>
                        <p className="text-lg font-bold text-roman-900">{settings.transactionNumber}</p>
                        <p className="text-xs text-roman-600 mt-1">يرجى التحويل إلى هذا الرقم عند الدفع</p>
                      </div>
                    )}
                    <div className="border-2 border-dashed border-roman-500/30 rounded-lg p-4">
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
                        <Upload className="h-8 w-8 text-roman-500" />
                        <span className="text-sm text-neutral-900">
                          {paymentProofFile ? paymentProofFile.name : 'اضغط لاختيار صورة إثبات الدفع'}
                        </span>
                        <span className="text-xs text-neutral-900/60">
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
                        <p className="font-medium text-neutral-900">{item.title}</p>
                        <p className="text-neutral-900/60">الكمية: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-roman-500">
                        {item.price * item.quantity} جنيه
                      </p>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Summary Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-gray-700">
                    <span>المجموع الفرعي:</span>
                    <span className="font-semibold">{baseTotal} جنيه</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-gray-700">
                    <span>مصاريف التوصيل:</span>
                    <span className={`font-semibold ${selectedCity ? 'text-orange-600' : 'text-amber-600'}`}>
                      {selectedCity ? `${deliveryFee} جنيه` : 'اختر المدينة'}
                    </span>
                  </div>
                  
                  {selectedCity && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 text-center">
                        المدينة: {selectedCity.name}
                      </p>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center text-2xl font-bold text-gray-800">
                    <span>المبلغ النهائي:</span>
                    <span className="text-roman-500">{grandTotal} جنيه</span>
                  </div>
                  
                  {selectedCity && (
                    <div className="p-3 bg-blue-50 rounded-lg border-r-4 border-blue-400 mt-4">
                      <p className="text-xs text-blue-700 text-center">
                        💡 المبلغ النهائي يشمل قيمة المنتجات ومصاريف التوصيل ({deliveryFee} ج.م)
                      </p>
                    </div>
                  )}
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