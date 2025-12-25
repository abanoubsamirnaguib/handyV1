import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, MapPin, Phone, User, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

const BuyerAcceptServiceOrderModal = ({ isOpen, onClose, order, onOrderUpdated }) => {
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState(null); // 'accept' or 'reject'
  
  // Form data for acceptance
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    additional_notes: '',
    payment_method: 'bank_transfer',
    city_id: ''
  });

  const [depositImage, setDepositImage] = useState(null);
  const [depositImagePreview, setDepositImagePreview] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Cities
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      loadCities();
    }
  }, [isOpen]);

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

  const handleAccept = async (e) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.customer_phone || !formData.delivery_address) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى ملء جميع البيانات المطلوبة"
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

    if (!formData.city_id) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى اختيار المدينة"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('customer_name', formData.customer_name);
      formDataToSend.append('customer_phone', formData.customer_phone);
      formDataToSend.append('delivery_address', formData.delivery_address);
      formDataToSend.append('additional_notes', formData.additional_notes);
      formDataToSend.append('payment_method', formData.payment_method);
      formDataToSend.append('deposit_image', depositImage);
      formDataToSend.append('city_id', formData.city_id);
      
      await api.acceptServiceOrder(order.id, formDataToSend);
      
      toast({
        title: "نجح",
        description: "تم قبول العرض وإرسال الطلب بنجاح. في انتظار موافقة الإدارة."
      });
      
      if (onOrderUpdated) onOrderUpdated();
      onClose();
      
    } catch (error) {
      console.error('Error accepting service order:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.response?.data?.message || "خطأ في قبول العرض"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال سبب الرفض"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      await api.rejectServiceOrder(order.id, rejectionReason);
      
      toast({
        title: "تم",
        description: "تم رفض العرض"
      });
      
      if (onOrderUpdated) onOrderUpdated();
      onClose();
      
    } catch (error) {
      console.error('Error rejecting service order:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.response?.data?.message || "خطأ في رفض العرض"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !order) return null;

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
            <h2 className="text-xl font-bold">عرض حرفة من {order.seller?.user?.name}</h2>
            <p className="text-sm text-gray-500">قبول أو رفض العرض</p>
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
          {/* Order Details */}
          {!action && (
            <div className="space-y-4">
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">تفاصيل العرض</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الحرفة:</span>
                      <span className="font-semibold">{order.items?.[0]?.product?.title}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">السعر:</span>
                      <span className="font-semibold text-primary">{order.total_price} ج.م</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">قيمة العربون المطلوبة:</span>
                      <span className="font-semibold text-yellow-600">{order.deposit_amount} ج.م</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">وقت التسليم المتوقع:</span>
                      <span className="font-semibold">{order.delivery_time || 'غير محدد'}</span>
                    </div>
                    
                    {order.service_requirements && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <p className="text-gray-600 text-xs mb-1">تفاصيل الطلب:</p>
                        <p className="text-sm">{order.service_requirements}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => setAction('accept')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  قبول العرض
                </Button>
                <Button
                  onClick={() => setAction('reject')}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  رفض العرض
                </Button>
              </div>
            </div>
          )}

          {/* Accept Form */}
          {action === 'accept' && (
            <form onSubmit={handleAccept} className="space-y-6">
              <Card className="bg-green-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-green-800">قبول العرض</h3>
                  <p className="text-sm text-green-600">يرجى ملء بياناتك لإتمام الطلب</p>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    الاسم
                  </label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    placeholder="أدخل اسمك"
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
                <label className="block text-sm font-medium mb-2">ملاحظات إضافية</label>
                <Textarea
                  value={formData.additional_notes}
                  onChange={(e) => handleInputChange('additional_notes', e.target.value)}
                  placeholder="أي ملاحظات أو متطلبات إضافية..."
                  rows={2}
                />
              </div>

              {/* Deposit Section */}
              <div className="border rounded-lg p-4 bg-yellow-50">
                <h4 className="font-semibold mb-4">بيانات العربون</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">قيمة العربون المطلوبة</label>
                    <Input
                      type="text"
                      value={`${order.deposit_amount} ج.م`}
                      disabled
                      className="bg-gray-100"
                    />
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
                
                {settings.transactionNumber && formData.payment_method !== 'cash_on_delivery' && (
                  <div className="bg-roman-50 border border-roman-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-semibold text-roman-800 mb-1">رقم الحساب/التحويل:</p>
                    <p className="text-lg font-bold text-roman-900">{settings.transactionNumber}</p>
                    <p className="text-xs text-roman-600 mt-1">يرجى التحويل إلى هذا الرقم عند الدفع</p>
                  </div>
                )}
                
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

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 rtl:space-x-reverse">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAction(null)}
                  disabled={submitting}
                >
                  رجوع
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="min-w-32 bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'تأكيد القبول'
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Reject Form */}
          {action === 'reject' && (
            <div className="space-y-6">
              <Card className="bg-red-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-red-800">رفض العرض</h3>
                  <p className="text-sm text-red-600">يرجى ذكر سبب الرفض</p>
                </CardContent>
              </Card>

              <div>
                <label className="block text-sm font-medium mb-2">سبب الرفض</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="اذكر سبب رفض العرض..."
                  rows={4}
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 rtl:space-x-reverse">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAction(null)}
                  disabled={submitting}
                >
                  رجوع
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={submitting}
                  variant="destructive"
                  className="min-w-32"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'تأكيد الرفض'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BuyerAcceptServiceOrderModal;
