import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, Package, Check, AlertTriangle, CreditCard, 
  Truck, User, Phone, MapPin, Calendar, FileText,
  CheckCircle, Timer, Eye, Search, Filter, Loader2
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { adminApi } from '@/lib/api';

// Custom RTL-friendly Select wrapper components
const RTLSelect = ({ children, value, onValueChange, ...props }) => {
  return (
    <Select dir="rtl" value={value} onValueChange={onValueChange} {...props}>
      {children}
    </Select>
  );
};

const RTLSelectTrigger = ({ children, ...props }) => {
  return (
    <SelectTrigger className="text-right" {...props}>
      {children}
    </SelectTrigger>
  );
};

const RTLSelectContent = ({ children, ...props }) => {
  return (
    <SelectContent align="end" className="rtl-select-content" {...props}>
      {children}
    </SelectContent>
  );
};

const RTLSelectItem = ({ children, ...props }) => {
  return (
    <SelectItem className="text-right" {...props}>
      {children}
    </SelectItem>
  );
};

const RTLSelectValue = ({ children, ...props }) => {
  return (
    <SelectValue className="text-right" {...props}>
      {children}
    </SelectValue>
  );
};

const AdminOrders = () => {
  const { toast } = useToast();
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Status update states
  const [selectedStatusOrder, setSelectedStatusOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusUpdateNotes, setStatusUpdateNotes] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    date_from: '',
    date_to: '',
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const loadOrders = useCallback(async (currentFilters, currentStatus, currentPayment) => {
    setIsLoading(true);
    try {
      const params = {
        search: currentFilters.search,
        status: currentStatus === 'all' ? '' : currentStatus,
        payment_proof: currentPayment === 'all' ? '' : currentPayment,
        date_from: currentFilters.date_from,
        date_to: currentFilters.date_to,
      };
      const response = await adminApi.getOrders(params);
      setOrders(response.data || []);
      setFilteredOrders(response.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        variant: "destructive",
        title: "خطأ في تحميل الطلبات",
        description: "حدث خطأ أثناء تحميل الطلبات. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadOrders(filters, statusFilter, paymentFilter);
  }, [statusFilter, paymentFilter, loadOrders]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    loadOrders(filters, statusFilter, paymentFilter);
  };
  
  const handleReset = () => {
    const resetFilters = { search: '', date_from: '', date_to: '' };
    setFilters(resetFilters);
    setStatusFilter('all');
    setPaymentFilter('all');
    // Explicitly call loadOrders with reset values to ensure the view updates,
    // even if the instant filters were already set to 'all'.
    loadOrders(resetFilters, 'all', 'all');
  };

  // This function is no longer needed for client-side filtering
  const filterOrders = () => {
    // Deprecated: Filtering is now server-side.
  };

  const handleApproveOrder = async (orderId) => {
    setIsUpdating(true);
    try {
      await adminApi.adminApproveOrder(orderId, approvalNotes);
      toast({
        title: "تم اعتماد الطلب",
        description: "تم اعتماد الطلب بنجاح وإرساله للبائع.",
      });
      setApprovalNotes('');
      setSelectedOrder(null);
      loadOrders(filters, statusFilter, paymentFilter);
    } catch (error) {
      console.error('Error approving order:', error);
      toast({
        variant: "destructive",
        title: "خطأ في اعتماد الطلب",
        description: "حدث خطأ أثناء اعتماد الطلب.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectOrder = async (orderId) => {
    if (!rejectionReason.trim()) {
      toast({
        variant: "destructive",
        title: "سبب الرفض مطلوب",
        description: "يرجى إدخال سبب رفض الطلب.",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await adminApi.rejectOrder(orderId, rejectionReason);
      toast({
        title: "تم رفض الطلب",
        description: "تم رفض الطلب وإشعار العميل.",
      });
      setRejectionReason('');
      setSelectedOrder(null);
      loadOrders(filters, statusFilter, paymentFilter);
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        variant: "destructive",
        title: "خطأ في رفض الطلب",
        description: "حدث خطأ أثناء رفض الطلب.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId) => {
    if (!newStatus) {
      toast({
        variant: "destructive",
        title: "الحالة الجديدة مطلوبة",
        description: "يرجى اختيار الحالة الجديدة للطلب.",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await adminApi.adminUpdateOrderStatus(orderId, newStatus, statusUpdateNotes);
      toast({
        title: "تم تحديث حالة الطلب",
        description: "تم تحديث حالة الطلب بنجاح وإشعار الأطراف المعنية.",
      });
      setNewStatus('');
      setStatusUpdateNotes('');
      setSelectedStatusOrder(null);
      loadOrders(filters, statusFilter, paymentFilter);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        variant: "destructive",
        title: "خطأ في تحديث حالة الطلب",
        description: "حدث خطأ أثناء تحديث حالة الطلب.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper function to get status in Arabic
  const getStatusInArabic = (status) => {
    const statusMap = {
      'pending': 'بانتظار المراجعة',
      'admin_approved': 'معتمد من الإدارة',
      'seller_approved': 'مقبول من البائع',
      'in_progress': 'جاري العمل',
      'ready_for_delivery': 'جاهز للتوصيل',
      'out_for_delivery': 'في الطريق',
      'delivered': 'تم التوصيل',
      'completed': 'مكتمل',
      'cancelled': 'ملغى',
      'suspended': 'معلق'
    };
    return statusMap[status] || status;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { 
        label: 'بانتظار المراجعة', 
        color: 'bg-amber-100 text-amber-800' 
      },
      'admin_approved': { 
        label: 'معتمد من الإدارة', 
        color: 'bg-blue-100 text-blue-800' 
      },
      'seller_approved': { 
        label: 'مقبول من البائع', 
        color: 'bg-green-100 text-green-800' 
      },
      'in_progress': { 
        label: 'جاري العمل', 
        color: 'bg-purple-100 text-purple-800' 
      },
      'ready_for_delivery': { 
        label: 'جاهز للتوصيل', 
        color: 'bg-indigo-100 text-indigo-800' 
      },
      'out_for_delivery': { 
        label: 'في الطريق', 
        color: 'bg-orange-100 text-orange-800' 
      },
      'delivered': { 
        label: 'تم التوصيل', 
        color: 'bg-green-100 text-green-800' 
      },
      'completed': { 
        label: 'مكتمل', 
        color: 'bg-green-100 text-green-800' 
      },
      'cancelled': { 
        label: 'ملغى', 
        color: 'bg-red-100 text-red-800' 
      },
      'suspended': { 
        label: 'معلق', 
        color: 'bg-yellow-100 text-yellow-800' 
      },
    };
    
    const statusInfo = statusMap[status] || statusMap['pending'];
    
    return (
      <Badge variant="outline" className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  const OrderDetailDialog = ({ order }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 ml-1" />
          عرض التفاصيل
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تفاصيل الطلب رقم: {order.id}</DialogTitle>
          <DialogDescription>
            تاريخ إنشاء الطلب: {new Date(order.created_at).toLocaleString('ar-EG')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Info */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">معلومات الطلب</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>الحالة:</span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex justify-between">
                  <span>المبلغ الإجمالي:</span>
                  <span className="font-semibold">{order.total_amount} جنيه</span>
                </div>
                <div className="flex justify-between">
                  <span>طريقة الدفع:</span>
                  <div className="flex items-center gap-2">
                    <span>{order.payment_method_ar || order.payment_method}</span>
                    {order.payment_method === 'cash_on_delivery' && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-800 text-xs">
                        عند الاستلام
                      </Badge>
                    )}
                    {order.is_service_order && (
                      <Badge variant="outline" className="bg-green-50 text-green-800 text-xs">
                        طلب خدمة
                      </Badge>
                    )}
                  </div>
                </div>
                {/* Service Order Deposit Info */}
                {order.is_service_order && order.requires_deposit && (
                  <>
                    <div className="flex justify-between">
                      <span>قيمة العربون:</span>
                      <span className="font-semibold text-green-600">{order.deposit_amount} جنيه</span>
                    </div>
                    <div className="flex justify-between">
                      <span>حالة العربون:</span>
                      <Badge 
                        variant={order.deposit_status === 'paid' ? 'default' : 'secondary'}
                        className={order.deposit_status === 'paid' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                        }
                      >
                        {order.deposit_status === 'paid' ? 'مدفوع ✓' : 'غير مدفوع ⏳'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>المبلغ المتبقي:</span>
                      <span className="font-semibold text-blue-600">{order.total_amount - order.deposit_amount} جنيه</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h4 className="font-semibold mb-2">معلومات العميل</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <User className="h-4 w-4 ml-2 text-gray-500" />
                  <span>{order.user?.name || 'غير محدد'}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 ml-2 text-gray-500" />
                  <span>{order.customer_phone || 'غير محدد'}</span>
                </div>
                {order.delivery_address && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 ml-2 mt-1 text-gray-500" />
                    <span>{order.delivery_address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Seller Info */}
            <div>
              <h4 className="font-semibold mb-2">معلومات البائع</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <User className="h-4 w-4 ml-2 text-gray-500" />
                  <span>{order.seller?.name || 'غير محدد'}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 ml-2 text-gray-500" />
                  <span>{order.seller?.phone || 'غير محدد'}</span>
                </div>
              </div>
            </div>

            {/* Suspension Info */}
            {order.status === 'suspended' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-yellow-800 flex items-center">
                  <AlertTriangle className="h-4 w-4 ml-2" />
                  معلومات التعليق
                </h4>
                <div className="space-y-2 text-sm text-yellow-700">
                  <div className="flex justify-between">
                    <span>تاريخ التعليق:</span>
                    <span>
                      {order.suspended_at 
                        ? new Date(order.suspended_at).toLocaleString('ar-EG')
                        : 'غير محدد'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">سبب التعليق:</span>
                    <p className="mt-1 bg-yellow-100 p-2 rounded text-yellow-800">
                      {order.suspension_reason || 'لم يتم تحديد سبب'}
                    </p>
                  </div>
                  {order.delivery_person && (
                    <div className="flex justify-between">
                      <span>الدليفري المسؤول:</span>
                      <span>{order.delivery_person.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Items & Payment Proof */}
          <div className="space-y-4">
            {/* Order Items */}
            <div>
              <h4 className="font-semibold mb-2">عناصر الطلب</h4>
              <div className="space-y-2">
                {order.items && order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 space-x-reverse p-2 bg-gray-50 rounded">
                    <img 
                      src={item.product?.image || 'https://via.placeholder.com/50'} 
                      alt={item.product?.name || 'منتج'} 
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product?.name || 'منتج'}</p>
                      <p className="text-xs text-gray-600">
                        {item.quantity} × {item.price} = {item.total} جنيه
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Order Deposit Image */}
            {order.is_service_order && order.deposit_image && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <CreditCard className="h-4 w-4 ml-2 text-green-600" />
                  إيصال العربون (طلب خدمة)
                </h4>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full ml-2"></div>
                    <span className="font-medium text-green-800">طلب خدمة - تم دفع العربون</span>
                  </div>
                  <p className="text-sm text-green-700">
                    قيمة العربون: {order.deposit_amount} جنيه
                  </p>
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    المبلغ المتبقي: {order.total_amount - order.deposit_amount} جنيه
                  </p>
                </div>
                <img 
                  src={order.deposit_image_url || order.deposit_image} 
                  alt="إيصال العربون" 
                  className="max-w-full h-auto rounded-md border cursor-pointer"
                  onClick={() => window.open(order.deposit_image_url || order.deposit_image, '_blank')}
                />
              </div>
            )}

            {/* Remaining Payment Proof for Service Orders */}
            {order.is_service_order && order.remaining_payment_proof && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <CreditCard className="h-4 w-4 ml-2 text-blue-600" />
                  إيصال باقي المبلغ (طلب خدمة)
                </h4>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full ml-2"></div>
                    <span className="font-medium text-blue-800">تم رفع إثبات دفع باقي المبلغ</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    المبلغ المتبقي: {order.total_amount - order.deposit_amount} جنيه
                  </p>
                  {order.status === 'pending' && order.remaining_payment_proof && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      ⏳ ينتظر مراجعة الإدارة
                    </p>
                  )}
                </div>
                <img 
                  src={order.remaining_payment_proof_url || order.remaining_payment_proof} 
                  alt="إيصال باقي المبلغ" 
                  className="max-w-full h-auto rounded-md border cursor-pointer"
                  onClick={() => window.open(order.remaining_payment_proof_url || order.remaining_payment_proof, '_blank')}
                />
              </div>
            )}

            {/* Service Requirements */}
            {order.is_service_order && order.service_requirements && (
              <div>
                <h4 className="font-semibold mb-2">متطلبات الخدمة</h4>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">{order.service_requirements}</p>
                </div>
              </div>
            )}

            {/* Payment Proof or Cash on Delivery Note */}
            {order.payment_proof ? (
              <div>
                <h4 className="font-semibold mb-2">إيصال الدفع</h4>
                <img 
                  src={order.payment_proof} 
                  alt="إيصال الدفع" 
                  className="max-w-full h-auto rounded-md border cursor-pointer"
                  onClick={() => window.open(order.payment_proof, '_blank')}
                />
              </div>
            ) : order.payment_method === 'cash_on_delivery' ? (
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <CreditCard className="h-4 w-4 ml-2 text-blue-600" />
                  طريقة الدفع
                </h4>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full ml-2"></div>
                    <span className="font-medium text-blue-800">دفع عند الاستلام</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    سيتم تحصيل المبلغ عند توصيل الطلب للعميل
                  </p>
                  <p className="text-xs text-blue-600 mt-1 font-medium">
                    المبلغ المطلوب: {order.total_amount} جنيه
                  </p>
                </div>
              </div>
            ) : null}

            {/* Timeline */}
            {((order.history && order.history.length > 0) || (order.timeline && order.timeline.length > 0)) && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Calendar className="h-4 w-4 ml-2 text-roman-500" />
                  الجدول الزمني
                </h4>
                <div className="relative max-h-48 overflow-y-auto">
                  {/* Timeline Line */}
                  <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-roman-500/30"></div>
                  
                  <div className="space-y-4">
                    {(order.history || order.timeline || []).map((event, index) => (
                      <motion.div 
                        key={index} 
                        className="relative flex items-start space-x-3 space-x-reverse"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex-shrink-0 relative z-10">
                          <div className="w-12 h-12 bg-roman-500 rounded-full flex items-center justify-center shadow-md border-3 border-white">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100 min-w-0">
                          <h5 className="font-medium text-gray-800 mb-1 text-sm">
                            {event.action_type_ar || event.action_type_label || event.label}
                          </h5>
                          <p className="text-xs text-gray-600 mb-1">
                            {new Date(event.created_at || event.date).toLocaleString('ar-EG')}
                          </p>
                          {/* عرض اسم من قام بالتغيير */}
                          {event.action_user && event.action_user.name && event.action_user.name.trim() !== '' && (
                            <p className="text-xs text-green-600 mb-1">
                              بواسطة: {event.action_user.name}
                            </p>
                          )}
                          {/* عرض تغيير الحالة إذا كان متاحاً */}
                          {event.old_status && event.new_status && (
                            <p className="text-xs text-blue-600 mb-1">
                              من "{getStatusInArabic(event.old_status)}" إلى "{getStatusInArabic(event.new_status)}"
                            </p>
                          )}
                          {(event.notes || event.note) && (
                            <p className="text-xs text-gray-700 bg-blue-50 p-2 rounded-md border-r-2 border-blue-400 mt-2">
                              {event.notes || event.note}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {order.status === 'pending' && (
          order.payment_proof || 
          order.payment_method === 'cash_on_delivery' || 
          order.deposit_image ||
          order.remaining_payment_proof
        ) && (
          <div className="space-y-3 mt-6">
            {/* Special note for deposit orders */}
            {order.is_service_order && order.deposit_image && !order.remaining_payment_proof && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 ml-2 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    طلب بعربون - المرحلة الأولى
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  تم دفع عربون بقيمة {order.deposit_amount} جنيه من إجمالي {order.total_amount} جنيه
                </p>
              </div>
            )}
            
            {/* Special note for cash on delivery orders */}
            {order.payment_method === 'cash_on_delivery' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 ml-2 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    طلب دفع عند الاستلام
                  </span>
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  يرجى التأكد من صحة بيانات الطلب قبل الاعتماد
                </p>
              </div>
            )}
            
            {/* Special note for remaining payment proof */}
            {order.is_service_order && order.remaining_payment_proof && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 ml-2 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    تم رفع إثبات دفع باقي المبلغ
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  يرجى مراجعة صورة إثبات دفع باقي المبلغ قبل الاعتماد
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              {/* Approve Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <CheckCircle className="h-4 w-4 ml-2" />
                    اعتماد الطلب
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>اعتماد الطلب</AlertDialogTitle>
                    <AlertDialogDescription>
                      هل أنت متأكد من رغبتك في اعتماد طلب رقم {order.id}؟
                      {order.deposit_image && !order.remaining_payment_proof && (
                        <span className="block mt-2 text-green-600 font-medium">
                          ملاحظة: هذا طلب بعربون - تم دفع {order.deposit_amount} جنيه من أصل {order.total_amount} جنيه
                        </span>
                      )}
                      {order.remaining_payment_proof && (
                        <span className="block mt-2 text-blue-600 font-medium">
                          ملاحظة: تم رفع إثبات دفع باقي المبلغ - سيتم اعتبار الطلب مدفوع بالكامل
                        </span>
                      )}
                      {order.payment_method === 'cash_on_delivery' && (
                        <span className="block mt-2 text-amber-600 font-medium">
                          ملاحظة: هذا طلب دفع عند الاستلام
                        </span>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="my-4">
                    <Label>ملاحظات الاعتماد (اختيارية)</Label>
                    <Textarea
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      placeholder={
                        order.deposit_image && !order.remaining_payment_proof 
                          ? "أدخل ملاحظات للبائع حول اعتماد العربون..." 
                          : order.remaining_payment_proof 
                            ? "أدخل ملاحظات للبائع حول اعتماد الدفع النهائي..."
                            : order.payment_method === 'cash_on_delivery' 
                              ? "أدخل أي ملاحظات للبائع حول طلب الدفع عند الاستلام..."
                              : "أدخل أي ملاحظات للبائع..."
                      }
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleApproveOrder(order.id)}
                      disabled={isUpdating}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isUpdating ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                      اعتماد الطلب
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Reject Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <AlertTriangle className="h-4 w-4 ml-2" />
                    رفض الطلب
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>رفض الطلب</AlertDialogTitle>
                    <AlertDialogDescription>
                      هل أنت متأكد من رغبتك في رفض طلب رقم {order.id}؟
                      {order.payment_method === 'cash_on_delivery' && (
                        <span className="block mt-2 text-amber-600 font-medium">
                          ملاحظة: هذا طلب دفع عند الاستلام
                        </span>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="my-4">
                    <Label>سبب الرفض *</Label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="أدخل سبب رفض الطلب..."
                      required
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleRejectOrder(order.id)}
                      disabled={isUpdating || !rejectionReason.trim()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isUpdating ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                      رفض الطلب
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-neutral-900">إدارة الطلبات</h2>
        <p className="text-neutral-900/70">مراجعة واعتماد الطلبات الجديدة</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 ml-2" />
            فلترة الطلبات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="md:col-span-3 lg:col-span-2">
              <Label>البحث</Label>
              <Input
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="رقم الطلب، اسم العميل أو البائع..."
              />
            </div>
            <div>
              <Label>من تاريخ</Label>
              <Input
                type="date"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <Label>إلى تاريخ</Label>
              <Input
                type="date"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} className="w-full">
                <Search className="h-4 w-4 ml-2" />
                بحث
              </Button>
              <Button onClick={handleReset} variant="outline" className="w-full">
                إعادة تعيين
              </Button>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>حالة الطلب</Label>
              <RTLSelect value={statusFilter} onValueChange={setStatusFilter}>
                <RTLSelectTrigger>
                  <RTLSelectValue placeholder="جميع الحالات" />
                </RTLSelectTrigger>
                <RTLSelectContent>
                  <RTLSelectItem value="all">جميع الحالات</RTLSelectItem>
                  <RTLSelectItem value="pending">بانتظار المراجعة</RTLSelectItem>
                  <RTLSelectItem value="admin_approved">معتمد من الإدارة</RTLSelectItem>
                  <RTLSelectItem value="seller_approved">مقبول من البائع</RTLSelectItem>
                  <RTLSelectItem value="in_progress">جاري العمل</RTLSelectItem>
                  <RTLSelectItem value="ready_for_delivery">جاهز للتوصيل</RTLSelectItem>
                  <RTLSelectItem value="out_for_delivery">في الطريق</RTLSelectItem>
                  <RTLSelectItem value="delivered">تم التوصيل</RTLSelectItem>
                  <RTLSelectItem value="completed">مكتمل</RTLSelectItem>
                  <RTLSelectItem value="cancelled">ملغى</RTLSelectItem>
                  <RTLSelectItem value="suspended">معلق</RTLSelectItem>
                </RTLSelectContent>
              </RTLSelect>
            </div>
            <div>
              <Label>طريقة الدفع</Label>
              <RTLSelect value={paymentFilter} onValueChange={setPaymentFilter}>
                <RTLSelectTrigger>
                  <RTLSelectValue placeholder="جميع الطلبات" />
                </RTLSelectTrigger>
                <RTLSelectContent>
                  <RTLSelectItem value="all">جميع الطلبات</RTLSelectItem>
                  <RTLSelectItem value="with_proof">مع إيصال دفع</RTLSelectItem>
                  <RTLSelectItem value="without_proof">بدون إيصال دفع</RTLSelectItem>
                  <RTLSelectItem value="cash_on_delivery">دفع عند الاستلام</RTLSelectItem>
                </RTLSelectContent>
              </RTLSelect>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Grid */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد طلبات</h3>
              <p className="text-gray-500">لا توجد طلبات تطابق معايير البحث المحددة.</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`group relative hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white overflow-hidden ${order.status === 'suspended' ? 'ring-2 ring-yellow-300 bg-yellow-50' : ''}`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-roman-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                {/* Suspended Order Indicator */}
                {order.status === 'suspended' && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                    معلق
                  </div>
                )}
                
                <CardContent className="p-6 relative">
                  <div className="grid md:grid-cols-4 gap-4 items-center">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">                       
                          <div>
                            <h4 className="inline-block px-3 py-1 rounded-full bg-roman-500 text-white text-sm font-bold">طلب #{order.id}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(order.created_at).toLocaleDateString('ar-EG')}
                            </p>
                            {/* Payment Method Indicator */}
                            {order.payment_method === 'cash_on_delivery' && (
                              <div className="mt-1">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                                  <CreditCard className="h-3 w-3 ml-1" />
                                  دفع عند الاستلام
                                </Badge>
                              </div>
                            )}
                            {order.payment_proof && order.payment_method !== 'cash_on_delivery' && (
                              <div className="mt-1">
                                <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                                  <CheckCircle className="h-3 w-3 ml-1" />
                                  مع إيصال دفع
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        {getStatusBadge(order.status)}
                        <div className="text-right">
                          <p className="text-xs text-gray-500">الإجمالي</p>
                          <p className="text-lg font-bold text-roman-500">{order.total_amount} ج.م</p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                      <h5 className="text-xs font-semibold text-green-700 mb-2">معلومات العميل</h5>
                      <div className="flex items-center mb-2">
                        <User className="h-4 w-4 ml-1 text-green-600" />
                        <span className="text-sm font-medium text-gray-800">{order.user?.name || 'غير محدد'}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 ml-1 text-green-600" />
                        <span className="text-sm text-gray-600">{order.customer_phone || 'غير محدد'}</span>
                      </div>
                    </div>

                    {/* Seller Info */}
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                      <h5 className="text-xs font-semibold text-orange-700 mb-2">معلومات البائع</h5>
                      <div className="flex items-center mb-2">
                        <User className="h-4 w-4 ml-1 text-orange-600" />
                        <span className="text-sm font-medium text-gray-800">{order.seller?.name || 'غير محدد'}</span>
                      </div>
                      <div className="flex items-center">
                        <Package className="h-4 w-4 ml-1 text-orange-600" />
                        <span className="text-sm text-gray-600">
                          {order.items?.length || 0} عنصر
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <OrderDetailDialog order={order} />
                      
                      {/* Update Status Button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full border-blue-200 hover:bg-blue-50"
                            onClick={() => setSelectedStatusOrder(order)}
                          >
                            <Timer className="h-4 w-4 ml-1" />
                            تحديث الحالة
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تحديث حالة الطلب</AlertDialogTitle>
                            <AlertDialogDescription>
                              تحديث حالة الطلب رقم {order.id} من "{getStatusInArabic(order.status)}" إلى حالة جديدة
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>الحالة الجديدة *</Label>
                              <RTLSelect value={newStatus} onValueChange={setNewStatus}>
                                <RTLSelectTrigger>
                                  <RTLSelectValue placeholder="اختر الحالة الجديدة" />
                                </RTLSelectTrigger>
                                <RTLSelectContent>
                                  <RTLSelectItem value="pending">بانتظار المراجعة</RTLSelectItem>
                                  <RTLSelectItem value="admin_approved">معتمد من الإدارة</RTLSelectItem>
                                  <RTLSelectItem value="seller_approved">مقبول من البائع</RTLSelectItem>
                                  <RTLSelectItem value="in_progress">جاري العمل</RTLSelectItem>
                                  <RTLSelectItem value="ready_for_delivery">جاهز للتوصيل</RTLSelectItem>
                                  <RTLSelectItem value="out_for_delivery">في الطريق</RTLSelectItem>
                                  <RTLSelectItem value="delivered">تم التوصيل</RTLSelectItem>
                                  <RTLSelectItem value="completed">مكتمل</RTLSelectItem>
                                  <RTLSelectItem value="cancelled">ملغى</RTLSelectItem>
                                  <RTLSelectItem value="suspended">معلق</RTLSelectItem>
                                </RTLSelectContent>
                              </RTLSelect>
                            </div>
                            <div>
                              <Label>ملاحظات التحديث (اختيارية)</Label>
                              <Textarea
                                value={statusUpdateNotes}
                                onChange={(e) => setStatusUpdateNotes(e.target.value)}
                                placeholder="أدخل أي ملاحظات حول تحديث الحالة..."
                                rows={3}
                              />
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => {
                              setNewStatus('');
                              setStatusUpdateNotes('');
                              setSelectedStatusOrder(null);
                            }}>إلغاء</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleUpdateOrderStatus(order.id)}
                              disabled={isUpdating || !newStatus}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                              تحديث الحالة
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      {order.status === 'pending' && (
                        order.payment_proof || 
                        order.payment_method === 'cash_on_delivery' || 
                        order.deposit_image || 
                        order.remaining_payment_proof
                      ) && (
                        <div className="flex gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="sm" 
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <CheckCircle className="h-4 w-4 ml-1" />
                                اعتماد
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>اعتماد الطلب</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من رغبتك في اعتماد طلب رقم {order.id}؟
                                  {order.deposit_image && (
                                    <span className="block mt-2 text-blue-600 font-medium">
                                      ملاحظة: هذا طلب بعربون
                                    </span>
                                  )}
                                  {order.remaining_payment_proof && (
                                    <span className="block mt-2 text-green-600 font-medium">
                                      ملاحظة: تم رفع إثبات دفع باقي المبلغ
                                    </span>
                                  )}
                                  {order.payment_method === 'cash_on_delivery' && (
                                    <span className="block mt-2 text-amber-600 font-medium">
                                      ملاحظة: هذا طلب دفع عند الاستلام
                                    </span>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="my-4">
                                <Label>ملاحظات الاعتماد (اختيارية)</Label>
                                <Textarea
                                  value={approvalNotes}
                                  onChange={(e) => setApprovalNotes(e.target.value)}
                                  placeholder="أدخل أي ملاحظات للبائع..."
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleApproveOrder(order.id)}
                                  disabled={isUpdating}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                                  اعتماد الطلب
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="flex-1"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <AlertTriangle className="h-4 w-4 ml-1" />
                                رفض
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>رفض الطلب</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من رغبتك في رفض طلب رقم {order.id}؟
                                  سيتم إشعار العميل بالرفض.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="my-4">
                                <Label>سبب الرفض (مطلوب)</Label>
                                <Textarea
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="أدخل سبب رفض الطلب..."
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleRejectOrder(order.id)}
                                  disabled={isUpdating || !rejectionReason.trim()}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                                  رفض الطلب
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}

                      {order.status === 'pending' && 
                        !order.payment_proof && 
                        !order.deposit_image && 
                        !order.remaining_payment_proof && 
                        order.payment_method !== 'cash_on_delivery' && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 text-center">
                          بانتظار إيصال الدفع
                        </Badge>
                      )}
                      
                      {order.status === 'pending' && order.payment_method === 'cash_on_delivery' && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 text-center">
                          دفع عند الاستلام - جاهز للمراجعة
                        </Badge>
                      )}

                      {/* Suspended Order Info */}
                      {order.status === 'suspended' && (
                        <div className="bg-yellow-100 border border-yellow-300 rounded p-3 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <AlertTriangle className="h-4 w-4 ml-1 text-yellow-700" />
                            <span className="text-sm font-semibold text-yellow-800">طلب معلق</span>
                          </div>
                          <p className="text-xs text-yellow-700 mb-1">
                            تاريخ التعليق: {order.suspended_at 
                              ? new Date(order.suspended_at).toLocaleDateString('ar-EG')
                              : 'غير محدد'
                            }
                          </p>
                          {order.suspension_reason && (
                            <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded border">
                              السبب: {order.suspension_reason}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">بانتظار المراجعة</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'admin_approved').length}
            </div>
            <div className="text-sm text-gray-600">معتمد من الإدارة</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => ['completed', 'delivered'].includes(o.status)).length}
            </div>
            <div className="text-sm text-gray-600">مكتمل</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'suspended').length}
            </div>
            <div className="text-sm text-gray-600">معلق</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {orders.filter(o => o.status === 'cancelled').length}
            </div>
            <div className="text-sm text-gray-600">ملغى</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOrders;