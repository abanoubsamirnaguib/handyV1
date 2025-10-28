import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, CreditCard, MapPin, Phone, User, FileText, DollarSign, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

const ServiceOrderModal = ({ isOpen, onClose, sellerId, sellerUserId, sellerName, sellerAvatar, preloadedServices = [] }) => {
  const { toast } = useToast();
  const [services, setServices] = useState(preloadedServices);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Use sellerUserId for API calls (user_id), keep sellerId for compatibility
  const sellerUserIdForApi = sellerUserId || sellerId;
  
  // Form data
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    service_requirements: '',
    deposit_amount: '',
    payment_method: 'bank_transfer',
    city_id: ''
  });
  
  const [depositImage, setDepositImage] = useState(null);
  const [depositImagePreview, setDepositImagePreview] = useState(null);
  
  // Price negotiation states
  const [enablePriceChange, setEnablePriceChange] = useState(false);
  const [proposedPrice, setProposedPrice] = useState('');

  // Cities
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // Load seller services
  useEffect(() => {
    if (isOpen && sellerUserIdForApi) {
      // Use preloaded services if available, otherwise load from server
      if (preloadedServices && preloadedServices.length > 0) {
        setServices(preloadedServices);
      } else {
        loadSellerServices();
      }
      // Also load cities for selection
      loadCities();
    }
  }, [isOpen, sellerUserIdForApi, preloadedServices]);

  const loadSellerServices = async () => {
    try {
      setLoading(true);
      // getSellerServices expects user_id, not seller_id from sellers table
      const response = await api.getSellerServices(sellerUserIdForApi);
      setServices(response);
    } catch (error) {
      console.error('Error loading services:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "خطأ في تحميل الخدمات"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async () => {
    try {
      setCitiesLoading(true);
      const data = await api.getCities();
      const list = data?.data || data || [];
      setCities(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Failed to load cities', e);
    } finally {
      setCitiesLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDepositImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDepositImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setDepositImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedService) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى اختيار خدمة"
      });
      return;
    }
    
    if (!formData.deposit_amount || parseFloat(formData.deposit_amount) <= 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال قيمة العربون"
      });
      return;
    }
    
    // التحقق من أن العربون لا يتجاوز 80% من قيمة الخدمة
    const maxDepositAmount = selectedService.price * 0.8;
    if (parseFloat(formData.deposit_amount) > maxDepositAmount) {
      toast({
        variant: "destructive",
        title: "خطأ في قيمة العربون",
        description: `قيمة العربون لا يمكن أن تتجاوز 80% من قيمة الخدمة (${maxDepositAmount.toFixed(2)} جنيه)`
      });
      return;
    }
    
    if (!depositImage) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى رفع صورة إيصال العربون"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // التحقق من السعر المقترح
      // إذا السعر 0 أو تم تفعيل تغيير السعر، يجب إدخال سعر مقترح
      if (selectedService.price === 0 || enablePriceChange) {
        const proposedPriceValue = parseFloat(proposedPrice);
        if (!proposedPrice || proposedPriceValue <= 0) {
          toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى إدخال سعر مقترح صحيح"
          });
          setSubmitting(false);
          return;
        }
      }
      
      const formDataToSend = new FormData();
      formDataToSend.append('service_id', selectedService.id);
      // Note: The backend expects seller_id parameter but validates it against users.id
      // The backend will convert this user_id to actual seller.id from sellers table
      formDataToSend.append('seller_id', sellerUserIdForApi);
      formDataToSend.append('customer_name', formData.customer_name);
      formDataToSend.append('customer_phone', formData.customer_phone);
      formDataToSend.append('delivery_address', formData.delivery_address);
      formDataToSend.append('service_requirements', formData.service_requirements);
      formDataToSend.append('deposit_amount', formData.deposit_amount);
      formDataToSend.append('payment_method', formData.payment_method);
      formDataToSend.append('deposit_image', depositImage);
      formDataToSend.append('requires_deposit', 'true');
      formDataToSend.append('is_service_order', 'true');
      formDataToSend.append('total_price', selectedService.price);
      
      // إضافة السعر المقترح
      // إذا السعر 0، يجب إرسال السعر المقترح دائماً
      // إذا السعر > 0 وتم تفعيل تغيير السعر، نرسل السعر المقترح
      if ((selectedService.price === 0 || enablePriceChange) && proposedPrice) {
        formDataToSend.append('buyer_proposed_price', proposedPrice);
      }
      
      if (formData.city_id) formDataToSend.append('city_id', formData.city_id);
      
      const response = await api.createServiceOrder(formDataToSend);
      
      toast({
        title: "نجح",
        description: enablePriceChange && proposedPrice 
          ? "تم إرسال طلب الخدمة بنجاح. في انتظار موافقة البائع على السعر المقترح."
          : "تم إرسال طلب الخدمة بنجاح"
      });
      onClose();
      
      // Reset form
      setFormData({
        customer_name: '',
        customer_phone: '',
        delivery_address: '',
        service_requirements: '',
        deposit_amount: '',
        payment_method: 'bank_transfer',
        city_id: ''
      });
      setSelectedService(null);
      setDepositImage(null);
      setDepositImagePreview(null);
      setEnablePriceChange(false);
      setProposedPrice('');
      
    } catch (error) {
      console.error('Error creating service order:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "خطأ في إرسال طلب الخدمة"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 pb-20 md:pb-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Avatar className="w-10 h-10">
              <AvatarImage src={sellerAvatar} />
              <AvatarFallback>{sellerName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">طلب خدمة من {sellerName}</h2>
              <p className="text-sm text-gray-500">اختر خدمة وأدخل بيانات الطلب</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          {/* Services List */}
          {!selectedService && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">اختر الخدمة المطلوبة</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-500">جاري تحميل الخدمات...</p>
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">لا توجد خدمات متاحة</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {services.map((service) => (
                    <Card 
                      key={service.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedService(service)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{service.title}</h4>
                            <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse mt-2">
                              <Badge variant="secondary">{service.category?.name}</Badge>
                              <span className="text-sm text-gray-500">{service.delivery_time}</span>
                            </div>
                          </div>
                          <div className="text-left rtl:text-right">
                            <span className="text-xl font-bold text-primary">{service.price} ج.م</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected Service & Order Form */}
          {selectedService && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selected Service Display */}
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{selectedService.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{selectedService.description}</p>
                    </div>
                    <div className="text-left rtl:text-right">
                      <span className="text-xl font-bold text-primary">
                        {selectedService.price > 0 ? `${selectedService.price} ج.م` : 'قابل للتفاوض'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Price Change Option */}
                  {selectedService.price >= 0 && (
                    <div className="mt-3 p-3 bg-white rounded-lg">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enablePriceChange}
                          onChange={(e) => setEnablePriceChange(e.target.checked)}
                          className="form-checkbox h-4 w-4 text-blue-600 ml-2"
                        />
                        <span className="text-sm font-medium">تغيير السعر (بعد الاتفاق مع البائع)</span>
                      </label>
                      
                      {enablePriceChange && (
                        <div className="mt-2">
                          <label className="block text-sm mb-1">السعر المقترح (ج.م)</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="1"
                            value={proposedPrice}
                            onChange={(e) => setProposedPrice(e.target.value)}
                            placeholder={`السعر الأصلي: ${selectedService.price} ج.م`}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            سيتم إرسال السعر المقترح للبائع للموافقة عليه قبل معالجة الطلب
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* If service price is 0, require proposed price */}
                  {selectedService.price === 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <label className="block text-sm font-medium mb-2">
                        <DollarSign className="w-4 h-4 inline ml-1" />
                        السعر المقترح (ج.م)
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={proposedPrice}
                        onChange={(e) => setProposedPrice(e.target.value)}
                        placeholder="أدخل السعر المتفق عليه مع البائع"
                        required
                        className="w-full"
                      />
                      <p className="text-xs text-blue-600 mt-1 flex items-center">
                        <svg className="h-4 w-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        هذه الخدمة قابلة للتفاوض. يرجى إدخال السعر المتفق عليه مع البائع في الشات.
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedService(null)}
                    className="mt-2"
                  >
                    تغيير الخدمة
                  </Button>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    اسم العميل
                  </label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    placeholder="أدخل اسم العميل"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    رقم الهاتف
                  </label>
                  <Input
                    value={formData.customer_phone}
                    onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                    placeholder="أدخل رقم الهاتف"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  عنوان التسليم
                </label>
                <Textarea
                  value={formData.delivery_address}
                  onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                  placeholder="أدخل عنوان التسليم بالتفصيل"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  متطلبات الخدمة
                </label>
                <Textarea
                  value={formData.service_requirements}
                  onChange={(e) => handleInputChange('service_requirements', e.target.value)}
                  placeholder="أدخل تفاصيل ومتطلبات الخدمة..."
                  rows={4}
                />
              </div>

              {/* Deposit Section */}
              <div className="border rounded-lg p-4 bg-yellow-50">
                <h4 className="font-semibold mb-4 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  بيانات العربون
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">قيمة العربون (ج.م)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="1"
                      max={selectedService ? (
                        enablePriceChange && proposedPrice 
                          ? parseFloat(proposedPrice) * 0.8 
                          : selectedService.price > 0 
                            ? selectedService.price * 0.8 
                            : proposedPrice 
                              ? parseFloat(proposedPrice) * 0.8 
                              : 0
                      ) : 0}
                      value={formData.deposit_amount}
                      onChange={(e) => handleInputChange('deposit_amount', e.target.value)}
                      placeholder="أدخل قيمة العربون"
                      required
                    />
                    {selectedService && (
                      <p className="text-xs text-gray-500 mt-1">
                        الحد الأقصى للعربون: {(
                          (enablePriceChange && proposedPrice 
                            ? parseFloat(proposedPrice) 
                            : selectedService.price > 0 
                              ? selectedService.price 
                              : proposedPrice 
                                ? parseFloat(proposedPrice) 
                                : 0) * 0.8
                        ).toFixed(2)} جنيه (80% من قيمة الخدمة)
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">طريقة الدفع</label>
                    <select 
                      value={formData.payment_method}
                      onChange={(e) => handleInputChange('payment_method', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="bank_transfer">حوالة بنكية</option>
                      <option value="vodafone_cash">فودافون كاش</option>
                      <option value="instapay">إنستا باي</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <ImageIcon className="w-4 h-4 inline mr-1" />
                    صورة إيصال العربون
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDepositImageChange}
                      className="hidden"
                      id="deposit-image"
                    />
                    <label htmlFor="deposit-image" className="cursor-pointer">
                      {depositImagePreview ? (
                        <div className="text-center">
                          <img 
                            src={depositImagePreview} 
                            alt="Preview" 
                            className="max-w-full h-32 object-cover mx-auto rounded"
                          />
                          <p className="text-sm text-gray-500 mt-2">انقر لتغيير الصورة</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto text-gray-400" />
                          <p className="text-sm text-gray-500">انقر لرفع صورة إيصال العربون</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* City selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  المدينة
                </label>
                <select 
                  value={formData.city_id}
                  onChange={(e) => handleInputChange('city_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={citiesLoading}
                  required
                >
                  <option value="">{citiesLoading ? 'جاري التحميل...' : 'اختر المدينة'}</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name} — رسوم التوصيل: {Number(city.delivery_fee || 0)} ج.م
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 rtl:space-x-reverse">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={submitting}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="min-w-32"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'إرسال الطلب'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ServiceOrderModal;