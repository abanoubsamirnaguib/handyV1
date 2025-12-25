import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, FileText, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

const SellerServiceOrderModal = ({ 
  isOpen, 
  onClose, 
  buyerId, 
  buyerName, 
  buyerAvatar,
  conversationId 
}) => {
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    service_price: '',
    service_requirements: '',
    delivery_time: '',
    deposit_amount: '',
  });

  // Price negotiation states
  const [enablePriceChange, setEnablePriceChange] = useState(false);
  const [proposedPrice, setProposedPrice] = useState('');

  // Load seller services
  useEffect(() => {
    if (isOpen) {
      loadMyServices();
    }
  }, [isOpen]);

  // Auto-enable price change when service price is 0
  useEffect(() => {
    if (selectedService) {
      // إعادة تعيين النموذج أولاً
      resetForm();
      
      const price = parseFloat(selectedService.price) || 0;
      if (price === 0) {
        setEnablePriceChange(true);
        setFormData(prev => ({ ...prev, service_price: '' }));
      } else {
        setFormData(prev => ({ ...prev, service_price: selectedService.price }));
      }
    }
  }, [selectedService]);

  const loadMyServices = async () => {
    try {
      setLoading(true);
      // Get current user's services
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await api.getSellerServices(user.id);
      const servicesArray = Array.isArray(response) ? response : (response?.data ? (Array.isArray(response.data) ? response.data : []) : []);
      setServices(servicesArray);
    } catch (error) {
      console.error('Error loading services:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "خطأ في تحميل الحرف"
      });
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // دالة إعادة تعيين النموذج للحالة الأولى
  const resetForm = () => {
    setEnablePriceChange(false);
    setProposedPrice('');
    setFormData({
      service_price: '',
      service_requirements: '',
      delivery_time: '',
      deposit_amount: '',
    });
  };

  // Helper function to get the effective service price
  const getEffectiveServicePrice = () => {
    if (!selectedService) return 0;
    
    const originalPrice = parseFloat(selectedService.price) || 0;
    
    // إذا السعر الأصلي صفر، استخدم service_price من formData
    if (originalPrice === 0) {
      return parseFloat(formData.service_price) || 0;
    }
    
    // إذا تم تفعيل تغيير السعر، استخدم proposedPrice
    if (enablePriceChange && proposedPrice) {
      return parseFloat(proposedPrice) || originalPrice;
    }
    
    // وإلا استخدم السعر الأصلي
    return originalPrice;
  };

  // Handle deposit amount change (allow free typing)
  const handleDepositAmountChange = (value) => {
    handleInputChange('deposit_amount', value);
  };

  // Handle deposit amount blur (validate when user leaves the field)
  const handleDepositAmountBlur = () => {
    const effectivePrice = getEffectiveServicePrice();
    if (!effectivePrice || effectivePrice === 0) {
      return;
    }

    const value = formData.deposit_amount;
    if (!value || value === '') {
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return;
    }

    const minDeposit = effectivePrice * 0.2;
    const maxDeposit = effectivePrice * 0.8;

    // Validate and adjust value if outside range
    if (numValue < minDeposit) {
      handleInputChange('deposit_amount', minDeposit.toFixed(2));
      toast({
        variant: "destructive",
        title: "خطأ في قيمة العربون",
        description: `قيمة العربون لا يمكن أن تكون أقل من 20% من قيمة الحرفة (${minDeposit.toFixed(2)} جنيه). تم تعديل القيمة تلقائياً.`
      });
    } else if (numValue > maxDeposit) {
      handleInputChange('deposit_amount', maxDeposit.toFixed(2));
      toast({
        variant: "destructive",
        title: "خطأ في قيمة العربون",
        description: `قيمة العربون لا يمكن أن تتجاوز 80% من قيمة الحرفة (${maxDeposit.toFixed(2)} جنيه). تم تعديل القيمة تلقائياً.`
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedService) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى اختيار حرفة"
      });
      return;
    }
    
    // Get effective service price
    const effectivePrice = getEffectiveServicePrice();
    if (effectivePrice === 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال سعر الحرفة أولاً"
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
    
    const depositAmount = parseFloat(formData.deposit_amount);
    const minDepositAmount = effectivePrice * 0.2;
    const maxDepositAmount = effectivePrice * 0.8;
    
    // التحقق من أن العربون لا يقل عن 20% من قيمة الحرفة
    if (depositAmount < minDepositAmount) {
      toast({
        variant: "destructive",
        title: "خطأ في قيمة العربون",
        description: `قيمة العربون لا يمكن أن تكون أقل من 20% من قيمة الحرفة (${minDepositAmount.toFixed(2)} جنيه)`
      });
      return;
    }
    
    // التحقق من أن العربون لا يتجاوز 80% من قيمة الحرفة
    if (depositAmount > maxDepositAmount) {
      toast({
        variant: "destructive",
        title: "خطأ في قيمة العربون",
        description: `قيمة العربون لا يمكن أن تتجاوز 80% من قيمة الحرفة (${maxDepositAmount.toFixed(2)} جنيه)`
      });
      return;
    }

    if (!formData.delivery_time) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال وقت التسليم"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const user = JSON.parse(localStorage.getItem('user'));
      
      const orderData = {
        service_id: selectedService.id,
        buyer_id: buyerId,
        seller_id: user.id,
        service_price: effectivePrice,
        service_requirements: formData.service_requirements,
        delivery_time: formData.delivery_time,
        deposit_amount: formData.deposit_amount,
        is_seller_created: true,
        conversation_id: conversationId
      };
      
      const response = await api.createSellerServiceOrder(orderData);
      
      toast({
        title: "نجح",
        description: "تم إرسال عرض الحرفة للمشتري بنجاح. في انتظار موافقة المشتري."
      });
      
      // Reset form
      resetForm();
      setSelectedService(null);
      onClose();
      setEnablePriceChange(false);
      setProposedPrice('');
      
    } catch (error) {
      console.error('Error creating service order:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.response?.data?.message || "خطأ في إرسال عرض الحرفة"
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
          <div>
            <h2 className="text-xl font-bold">إنشاء عرض حرفة لـ {buyerName}</h2>
            <p className="text-sm text-gray-500">اختر حرفة وحدد تفاصيل العرض</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetForm();
              setSelectedService(null);
              onClose();
            }}
            className="rounded-full w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          {/* Services List */}
          {!selectedService && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">اختر الحرفة</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-500">جاري تحميل الحرف...</p>
                </div>
              ) : !Array.isArray(services) || services.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">لا توجد حرف متاحة</p>
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
                            <span className="text-xl font-bold text-primary">
                              {service.price > 0 ? `${service.price} ج.م` : 'قابل للتفاوض'}
                            </span>
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
                  
                  {/* Price Input */}
                  {selectedService.price === 0 || enablePriceChange ? (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <label className="block text-sm font-medium mb-2">
                        <DollarSign className="w-4 h-4 inline ml-1" />
                        سعر الحرفة (ج.م) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        step="1"
                        min="1"
                        value={selectedService.price === 0 ? formData.service_price : proposedPrice}
                        onChange={(e) => {
                          if (selectedService.price === 0) {
                            handleInputChange('service_price', e.target.value);
                          } else {
                            setProposedPrice(e.target.value);
                          }
                        }}
                        placeholder={selectedService.price > 0 ? `السعر الأصلي: ${selectedService.price} ج.م` : "أدخل سعر الحرفة"}
                        required
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <div className="mt-3 p-3 bg-white rounded-lg">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enablePriceChange}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setEnablePriceChange(isChecked);
                            // إذا تم إلغاء التحديد، امسح السعر المقترح
                            if (!isChecked) {
                              setProposedPrice('');
                            }
                          }}
                          className="form-checkbox h-4 w-4 text-blue-600 ml-2"
                        />
                        <span className="text-sm font-medium">تغيير السعر</span>
                      </label>
                    </div>
                  )}
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSelectedService(null);
                      resetForm();
                    }}
                    className="mt-2"
                  >
                    تغيير الحرفة
                  </Button>
                </CardContent>
              </Card>

              {/* Service Details */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  تفاصيل الطلب
                </label>
                <Textarea
                  value={formData.service_requirements}
                  onChange={(e) => handleInputChange('service_requirements', e.target.value)}
                  placeholder="أدخل تفاصيل ومتطلبات الطلب..."
                  rows={4}
                  required
                />
              </div>

              {/* Delivery Time */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  وقت التسليم المتوقع
                </label>
                <Input
                  type="text"
                  value={formData.delivery_time}
                  onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                  placeholder="مثال: 3 أيام، أسبوع، إلخ"
                  required
                />
              </div>

              {/* Deposit Section */}
              <div className="border rounded-lg p-4 bg-yellow-50">
                <h4 className="font-semibold mb-4 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  قيمة العربون المطلوبة
                </h4>
                
                <div>
                  <label className="block text-sm font-medium mb-2">قيمة العربون (ج.م)</label>
                  <Input
                    type="number"
                    step="1"
                    min={selectedService ? (() => {
                      const effectivePrice = getEffectiveServicePrice();
                      return effectivePrice > 0 ? effectivePrice * 0.2 : 0;
                    })() : 0}
                    max={selectedService ? (() => {
                      const effectivePrice = getEffectiveServicePrice();
                      return effectivePrice > 0 ? effectivePrice * 0.8 : 0;
                    })() : 0}
                    value={formData.deposit_amount}
                    onChange={(e) => handleDepositAmountChange(e.target.value)}
                    onBlur={handleDepositAmountBlur}
                    placeholder="أدخل قيمة العربون"
                    required
                  />
                  {selectedService && (() => {
                    const effectivePrice = getEffectiveServicePrice();
                    if (effectivePrice === 0) return null;
                    const minDeposit = effectivePrice * 0.2;
                    const maxDeposit = effectivePrice * 0.8;
                    return (
                      <p className="text-xs text-gray-500 mt-1">
                        نطاق العربون المسموح: من {minDeposit.toFixed(2)} إلى {maxDeposit.toFixed(2)} جنيه (20% - 80% من قيمة الحرفة)
                      </p>
                    );
                  })()}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 rtl:space-x-reverse">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setSelectedService(null);
                    onClose();
                  }}
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
                    'إرسال العرض'
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

export default SellerServiceOrderModal;
