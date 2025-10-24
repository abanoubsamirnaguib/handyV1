import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, Package, Check, AlertTriangle, CreditCard, Truck, 
  Upload, User, Phone, MapPin, Calendar, FileText, Star,
  ArrowLeft, CheckCircle, AlertCircle, Timer, Loader2, Edit, Trash2, X
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
import { api, adminApi, sellerApi, deliveryApi } from '@/lib/api';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  console.log('orderId from useParams:', orderId);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [remainingPaymentProofFile, setRemainingPaymentProofFile] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Seller approval fields
  const [sellerAddress, setSellerAddress] = useState('');
  const [completionDeadline, setCompletionDeadline] = useState('');
  
  // Review-related state
  const [reviewableProducts, setReviewableProducts] = useState([]);
  const [showReviewSection, setShowReviewSection] = useState(false);
  const [reviewRatings, setReviewRatings] = useState({});
  const [reviewComments, setReviewComments] = useState({});
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [existingReviews, setExistingReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [isUpdatingReview, setIsUpdatingReview] = useState(false);
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const checkAndUpdateLateOrder = async (orderData) => {
    // Check if order has completion deadline and is in active status
    if (!orderData.completion_deadline || 
        !['seller_approved', 'in_progress'].includes(orderData.status) ||
        orderData.is_late) {
      return;
    }

    const now = new Date();
    const deadline = new Date(orderData.completion_deadline);
    
    // If current time is past the deadline, mark as late
    if (now > deadline) {
      try {
        console.log('Order is late, updating status...');
        await api.put(`/orders/${orderData.id}/check-late`);
        
        // Update the order data locally to reflect the change
        orderData.is_late = true;
        orderData.late_reason = 'تجاوز الموعد النهائي للإنجاز';
        
        console.log('Order marked as late successfully');
      } catch (error) {
        console.error('Error marking order as late:', error);
        // Don't throw error here to not break the page loading
      }
    }
  };

  const loadOrder = async () => {
    setIsLoading(true);
    try {
      console.log('Loading order with ID:', orderId);
      const response = await api.getOrder(orderId);
      console.log('Order API response:', response);
      
      // Handle different response structures
      const orderData = response.data || response;
      
      if (!orderData || !orderData.id) {
        throw new Error('Invalid order data received');
      }
      
      // Check if order is late and update it automatically
      await checkAndUpdateLateOrder(orderData);
      
      setOrder(orderData);
      setDeliveryAddress(orderData.delivery_address || '');
      setCustomerPhone(orderData.customer_phone || '');
      console.log('Order loaded successfully');
    } catch (error) {
      console.error('Error loading order:', error);
      
      toast({
        variant: "destructive",
        title: "خطأ في تحميل الطلب",
        description: `حدث خطأ أثناء تحميل تفاصيل الطلب رقم ${orderId}. ${error.message || ''}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentProofUpload = async () => {
    if (!paymentProofFile) {
      toast({
        variant: "destructive",
        title: "لم يتم اختيار ملف",
        description: "يرجى اختيار صورة إيصال الدفع أولاً.",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await api.uploadPaymentProof(orderId, paymentProofFile);
      toast({
        title: "تم رفع إيصال الدفع",
        description: "تم رفع إيصال الدفع بنجاح. سيتم مراجعته من قبل الإدارة.",
      });
      setPaymentProofFile(null);
      loadOrder(); // Reload order to get updated status
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      toast({
        variant: "destructive",
        title: "خطأ في رفع الإيصال",
        description: "حدث خطأ أثناء رفع إيصال الدفع. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemainingPaymentProofUpload = async () => {
    if (!remainingPaymentProofFile) {
      toast({
        variant: "destructive",
        title: "لم يتم اختيار ملف",
        description: "يرجى اختيار صورة إثبات دفع باقي المبلغ أولاً.",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('payment_proof', remainingPaymentProofFile);
      formData.append('payment_type', 'remaining');
      
      await api.uploadPaymentProof(orderId, formData);
      toast({
        title: "تم رفع إثبات دفع باقي المبلغ",
        description: "تم رفع إثبات دفع باقي المبلغ بنجاح. سيتم مراجعته من قبل الإدارة.",
      });
      setRemainingPaymentProofFile(null);
      loadOrder(); // Reload order to get updated status
    } catch (error) {
      console.error('Error uploading remaining payment proof:', error);
      toast({
        variant: "destructive",
        title: "خطأ في رفع الإثبات",
        description: "حدث خطأ أثناء رفع إثبات دفع باقي المبلغ. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateOrderInfo = async () => {
    if (!deliveryAddress.trim()) {
      toast({
        variant: "destructive",
        title: "عنوان التوصيل مطلوب",
        description: "يرجى إدخال عنوان التوصيل.",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await api.updateOrder(orderId, {
        delivery_address: deliveryAddress,
        customer_phone: customerPhone,
      });
      toast({
        title: "تم تحديث المعلومات",
        description: "تم تحديث معلومات الطلب بنجاح.",
      });
      loadOrder();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        variant: "destructive",
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث معلومات الطلب.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAdminApprove = async () => {
    setIsUpdating(true);
    try {
      await adminApi.adminApproveOrder(orderId, notes);
      toast({
        title: "تم اعتماد الطلب",
        description: "تم اعتماد الطلب من قبل الإدارة بنجاح.",
      });
      setNotes('');
      loadOrder();
    } catch (error) {
      console.error('Error approving order:', error);
      toast({
        variant: "destructive",
        title: "خطأ في الاعتماد",
        description: "حدث خطأ أثناء اعتماد الطلب.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSellerApprove = async () => {
    if (!sellerAddress.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "يرجى إدخال عنوان البائع لاستلام الطلب.",
      });
      return;
    }

    if (!completionDeadline) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "يرجى تحديد الموعد النهائي لإنجاز الطلب.",
      });
      return;
    }

    // Check if the deadline is in the future
    const deadline = new Date(completionDeadline);
    const now = new Date();
    if (deadline <= now) {
      toast({
        variant: "destructive",
        title: "خطأ في التاريخ",
        description: "يجب أن يكون الموعد النهائي للإنجاز في المستقبل.",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await sellerApi.approveOrder(orderId, {
        notes,
        seller_address: sellerAddress,
        completion_deadline: completionDeadline
      });
      toast({
        title: "تم قبول الطلب",
        description: "تم قبول الطلب من قبل البائع بنجاح.",
      });
      setNotes('');
      setSellerAddress('');
      setCompletionDeadline('');
      loadOrder();
    } catch (error) {
      console.error('Error seller approving order:', error);
      
      // Handle validation errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        toast({
          variant: "destructive",
          title: "خطأ في البيانات",
          description: errorMessages.join('. '),
        });
      } else {
        toast({
          variant: "destructive",
          title: "خطأ في قبول الطلب",
          description: error.response?.data?.message || "حدث خطأ أثناء قبول الطلب.",
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartWork = async () => {
    setIsUpdating(true);
    try {
      await sellerApi.startWork(orderId, notes);
      toast({
        title: "تم بدء العمل",
        description: "تم بدء العمل على الطلب بنجاح.",
      });
      setNotes('');
      loadOrder();
    } catch (error) {
      console.error('Error starting work:', error);
      toast({
        variant: "destructive",
        title: "خطأ في بدء العمل",
        description: "حدث خطأ أثناء بدء العمل على الطلب.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteWork = async () => {
    setIsUpdating(true);
    try {
      await sellerApi.completeWork(orderId, notes);
      toast({
        title: "تم إنهاء العمل",
        description: "تم إنهاء العمل على الطلب وهو جاهز للتوصيل.",
      });
      setNotes('');
      loadOrder();
    } catch (error) {
      console.error('Error completing work:', error);
      toast({
        variant: "destructive",
        title: "خطأ في إنهاء العمل",
        description: "حدث خطأ أثناء إنهاء العمل على الطلب.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePickupDelivery = async () => {
    setIsUpdating(true);
    try {
      await deliveryApi.pickupOrder(orderId, notes);
      toast({
        title: "تم استلام الطلب للتوصيل",
        description: "تم استلام الطلب من البائع للتوصيل.",
      });
      setNotes('');
      loadOrder();
    } catch (error) {
      console.error('Error picking up order:', error);
      toast({
        variant: "destructive",
        title: "خطأ في استلام الطلب",
        description: "حدث خطأ أثناء استلام الطلب للتوصيل.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkDelivered = async () => {
    setIsUpdating(true);
    try {
      await deliveryApi.markAsDelivered(orderId, notes);
      toast({
        title: "تم توصيل الطلب",
        description: "تم تسليم الطلب للعميل بنجاح.",
      });
      setNotes('');
      loadOrder();
    } catch (error) {
      console.error('Error marking as delivered:', error);
      toast({
        variant: "destructive",
        title: "خطأ في تسليم الطلب",
        description: "حدث خطأ أثناء تسليم الطلب.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteOrder = async () => {
    setIsUpdating(true);
    try {
      await api.completeOrder(orderId);
      toast({
        title: "تم إكمال الطلب",
        description: "تم إكمال الطلب بنجاح. شكراً لكم!",
      });
      loadOrder();
    } catch (error) {
      console.error('Error completing order:', error);
      toast({
        variant: "destructive",
        title: "خطأ في إكمال الطلب",
        description: "حدث خطأ أثناء إكمال الطلب.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    setIsUpdating(true);
    try {
      await api.cancelOrder(orderId, notes || 'تم إلغاء الطلب');
      toast({
        title: "تم إلغاء الطلب",
        description: "تم إلغاء الطلب بنجاح.",
      });
      setNotes('');
      loadOrder();
    } catch (error) {
      console.error('Error canceling order:', error);
      toast({
        variant: "destructive",
        title: "خطأ في إلغاء الطلب",
        description: "حدث خطأ أثناء إلغاء الطلب.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Review-related functions
  const loadReviewableProducts = async () => {
    try {
      const response = await api.canReviewOrder(orderId);
      setReviewableProducts(response.products || []);
      setShowReviewSection(response.products?.some(p => p.can_review) || false);
    } catch (error) {
      console.error('Error loading reviewable products:', error);
    }
  };

  const loadExistingReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const response = await api.getOrderReviews(orderId);
      setExistingReviews(response.data || response || []);
    } catch (error) {
      console.error('Error loading existing reviews:', error);
      setExistingReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditRating(0);
    setEditComment('');
  };

  const handleUpdateReview = async (reviewId) => {
    if (!editRating || editRating < 1 || editRating > 5) {
      toast({
        variant: "destructive",
        title: "تقييم غير صحيح",
        description: "يرجى اختيار تقييم من 1 إلى 5 نجوم.",
      });
      return;
    }

    setIsUpdatingReview(true);
    try {
      await api.updateReview(reviewId, {
        rating: editRating,
        comment: editComment,
        status: 'published'
      });

      toast({
        title: "تم تحديث التقييم",
        description: "تم تحديث التقييم بنجاح.",
      });

      // Reset edit state
      handleCancelEdit();
      // Reload reviews to show updated review
      loadExistingReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        variant: "destructive",
        title: "خطأ في تحديث التقييم",
        description: "حدث خطأ أثناء تحديث التقييم. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsUpdatingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    setIsDeletingReview(true);
    try {
      await api.deleteReview(reviewId);

      toast({
        title: "تم حذف التقييم",
        description: "تم حذف التقييم بنجاح.",
      });

      // Reload reviews to remove deleted review
      loadExistingReviews();
      // Also reload reviewable products to show review form again
      loadReviewableProducts();
      // Close dialog
      setReviewToDelete(null);
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        variant: "destructive",
        title: "خطأ في حذف التقييم",
        description: "حدث خطأ أثناء حذف التقييم. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsDeletingReview(false);
    }
  };

  const handleRatingChange = (productId, rating) => {
    setReviewRatings(prev => ({
      ...prev,
      [productId]: rating
    }));
  };

  const handleCommentChange = (productId, comment) => {
    setReviewComments(prev => ({
      ...prev,
      [productId]: comment
    }));
  };

  const handleSubmitReview = async (productId) => {
    const rating = reviewRatings[productId];
    const comment = reviewComments[productId] || '';

    if (!rating || rating < 1 || rating > 5) {
      toast({
        variant: "destructive",
        title: "تقييم غير صحيح",
        description: "يرجى اختيار تقييم من 1 إلى 5 نجوم.",
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      await api.createReview({
        product_id: productId,
        order_id: orderId,
        rating,
        comment,
        status: 'published'
      });

      toast({
        title: "تم إرسال التقييم",
        description: "شكراً لك على تقييم المنتج.",
      });

      // Reload reviewable products to update the UI
      loadReviewableProducts();
      // Reload existing reviews to show the new review
      loadExistingReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        variant: "destructive",
        title: "خطأ في إرسال التقييم",
        description: "حدث خطأ أثناء إرسال التقييم. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Load reviewable products when order is completed
  useEffect(() => {
    if (order?.status === 'completed' && user?.id === order.user.id) {
      loadReviewableProducts();
    }
  }, [order, user]);

  // Load existing reviews when order is loaded
  useEffect(() => {
    if (order && user) {
      loadExistingReviews();
    }
  }, [order, user]);

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { 
        label: 'بانتظار المراجعة', 
        icon: <Clock className="h-4 w-4 ml-1" />, 
        color: 'bg-amber-100 text-amber-700 border-amber-200 shadow-md',
        pulse: true
      },
      'admin_approved': { 
        label: 'معتمد من الإدارة', 
        icon: <CheckCircle className="h-4 w-4 ml-1" />, 
        color: 'bg-blue-100 text-blue-700 border-blue-200 shadow-md'
      },
      'seller_approved': { 
        label: 'مقبول من البائع', 
        icon: <Check className="h-4 w-4 ml-1" />, 
        color: 'bg-green-100 text-green-700 border-green-200 shadow-md'
      },
      'in_progress': { 
        label: 'جاري العمل', 
        icon: <Timer className="h-4 w-4 ml-1" />, 
        color: 'bg-roman-500/20 text-roman-500 border-roman-500/30 shadow-md',
        pulse: true
      },
      'ready_for_delivery': { 
        label: 'جاهز للتوصيل', 
        icon: <Package className="h-4 w-4 ml-1" />, 
        color: 'bg-roman-500/20 text-roman-500 border-roman-500/30 shadow-md'
      },
      'out_for_delivery': { 
        label: 'في الطريق للتوصيل', 
        icon: <Truck className="h-4 w-4 ml-1" />, 
        color: 'bg-warning-500/20 text-warning-500 border-warning-500/30 shadow-md',
        pulse: true
      },
      'delivered': { 
        label: 'تم التوصيل', 
        icon: <Check className="h-4 w-4 ml-1" />, 
        color: 'bg-green-100 text-green-700 border-green-200 shadow-md'
      },
      'completed': { 
        label: 'مكتمل', 
        icon: <CheckCircle className="h-4 w-4 ml-1" />, 
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-md'
      },
      'cancelled': { 
        label: 'ملغى', 
        icon: <AlertTriangle className="h-4 w-4 ml-1" />, 
        color: 'bg-red-100 text-red-700 border-red-200 shadow-md'
      },
    };
    
    const statusInfo = statusMap[status] || statusMap['pending'];
    
    return (
      <Badge 
        variant="outline" 
        className={`${statusInfo.color} font-semibold flex items-center px-4 py-2 text-sm relative overflow-hidden ${
          statusInfo.pulse ? 'animate-pulse' : ''
        }`}      >
        {statusInfo.pulse && (
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        )}
        <span className="relative flex items-center">
          {statusInfo.icon}
          {statusInfo.label}
        </span>
      </Badge>
    );
  };
  const renderTimeline = () => {
    if (!order?.timeline) return null;

    return (      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-roman-500 text-white">
          <CardTitle className="flex items-center text-xl">
            <Calendar className="h-6 w-6 ml-2" />
            الجدول الزمني للطلب
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-roman-500"></div>
            
            <div className="space-y-6">
              {order.timeline.map((event, index) => (
                <motion.div 
                  key={index} 
                  className="relative flex items-start space-x-4 space-x-reverse"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                >                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-12 h-12 bg-roman-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-1">{event.label}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {event.date ? new Date(event.date).toLocaleString('ar-EG') : ''}
                    </p>
                    {event.notes && (
                      <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-md border-r-4 border-blue-400">
                        {event.notes}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderActionButtons = () => {
    if (!order) return null;

    const isCustomer = user?.id === order.user.id;
    const isSeller = user?.id === order.seller.id;
    const isAdmin = user?.role === 'super_admin';
    const isDelivery = user?.role === 'delivery';
    
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>الإجراءات المتاحة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer Actions */}
          {isCustomer && (
            <>
              {order.status === 'pending' && 
               !order.payment_proof && 
               !(order.is_service_order && order.requires_deposit) && ( // لا تظهر للطلبات التي تتطلب عربون
                <div className="space-y-3">
                  <Label>رفع إيصال الدفع</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentProofFile(e.target.files[0])}
                  />
                  <Button 
                    onClick={handlePaymentProofUpload}
                    disabled={isUpdating || !paymentProofFile}
                    className="w-full"
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Upload className="h-4 w-4 ml-2" />}
                    رفع إيصال الدفع
                  </Button>
                </div>
              )}

              {/* رفع صورة باقي المبلغ للطلبات التي تتطلب عربون */}
              {order.is_service_order && 
               order.requires_deposit && 
               order.deposit_status === 'paid' && 
               !order.remaining_payment_proof &&
               ['admin_approved', 'seller_approved', 'in_progress', 'work_completed', 'ready_for_delivery', 'out_for_delivery', 'delivered'].includes(order.status) && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">دفع باقي المبلغ</h4>
                    <p className="text-sm text-blue-700 mb-2">
                      تم دفع العربون ({order.deposit_amount} جنيه). 
                      المبلغ المتبقي: {order.total_amount - order.deposit_amount} جنيه
                    </p>
                    <p className="text-xs text-blue-600">
                      يمكنك دفع باقي المبلغ ورفع إثبات الدفع في أي مرحلة من مراحل الطلب
                    </p>
                  </div>
                  <Label>رفع إثبات دفع باقي المبلغ</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setRemainingPaymentProofFile(e.target.files[0])}
                  />
                  <Button 
                    onClick={handleRemainingPaymentProofUpload}
                    disabled={isUpdating || !remainingPaymentProofFile}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Upload className="h-4 w-4 ml-2" />}
                    رفع إثبات دفع باقي المبلغ
                  </Button>
                </div>
              )}

              {/* عرض حالة رفع صورة باقي المبلغ */}
              {order.is_service_order && 
               order.requires_deposit && 
               order.deposit_status === 'paid' && 
               order.remaining_payment_proof && (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">✅ تم رفع إثبات دفع باقي المبلغ</h4>
                    <p className="text-sm text-green-700 mb-2">
                      تم رفع إثبات دفع المبلغ المتبقي ({order.total_amount - order.deposit_amount} جنيه) بنجاح
                    </p>
                    {order.status === 'pending' && (
                      <p className="text-xs text-green-600 font-medium">
                        ⏳ ينتظر مراجعة الإدارة
                      </p>
                    )}
                    {order.status !== 'pending' && (
                      <p className="text-xs text-green-600 font-medium">
                        ✅ تم اعتماد الدفع من قبل الإدارة
                      </p>
                    )}
                  </div>
                </div>
              )}

              {(order.status === 'pending' || order.status === 'admin_approved') && (
                <div className="space-y-3">
                  <Label>عنوان التوصيل</Label>
                  <Textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="أدخل عنوان التوصيل الكامل..."
                  />
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="رقم الهاتف للتواصل"
                  />
                  <Button 
                    onClick={handleUpdateOrderInfo}
                    disabled={isUpdating}
                    className="w-full"
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Check className="h-4 w-4 ml-2" />}
                    تحديث معلومات الطلب
                  </Button>
                </div>
              )}

              {order.status === 'delivered' && (
                <Button 
                  onClick={handleCompleteOrder}
                  disabled={isUpdating}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <CheckCircle className="h-4 w-4 ml-2" />}
                  تأكيد استلام الطلب
                </Button>
              )}
            </>
          )}

          {/* Admin Actions */}
          {isAdmin && order.status === 'pending' && order.payment_proof && (
            <div className="space-y-3">
              <Label>ملاحظات الإدارة</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أدخل ملاحظات الاعتماد..."
              />
              <Button 
                onClick={handleAdminApprove}
                disabled={isUpdating}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <CheckCircle className="h-4 w-4 ml-2" />}
                اعتماد الطلب
              </Button>
            </div>
          )}

          {/* Seller Actions */}
          {isSeller && (
            <>
              {order.status === 'admin_approved' && (
                <div className="space-y-4">
                  <div>
                    <Label>عنوان البائع لاستلام الطلب</Label>
                    <Textarea
                      value={sellerAddress}
                      onChange={(e) => setSellerAddress(e.target.value)}
                      placeholder="أدخل عنوانك الكامل لاستلام الطلب من قبل الدليفري..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label>الموعد النهائي لإنجاز الطلب</Label>
                    <Input
                      type="datetime-local"
                      value={completionDeadline}
                      onChange={(e) => setCompletionDeadline(e.target.value)}
                      className="mt-2"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      يجب أن يكون الموعد في المستقبل
                    </p>
                  </div>
                  
                  <div>
                    <Label>ملاحظات البائع</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="أدخل ملاحظات قبول الطلب..."
                      className="mt-2"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSellerApprove}
                    disabled={isUpdating}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Check className="h-4 w-4 ml-2" />}
                    قبول الطلب وبدء العمل
                  </Button>
                </div>
              )}

              {order.status === 'seller_approved' && (
                <Button 
                  onClick={handleStartWork}
                  disabled={isUpdating}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Timer className="h-4 w-4 ml-2" />}
                  بدء العمل على الطلب
                </Button>
              )}

              {order.status === 'in_progress' && (
                <div className="space-y-3">
                  <Label>ملاحظات إنهاء العمل</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أدخل ملاحظات إنهاء العمل..."
                  />
                  <Button 
                    onClick={handleCompleteWork}
                    disabled={isUpdating}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Package className="h-4 w-4 ml-2" />}
                    إنهاء العمل - جاهز للتوصيل
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Delivery Actions */}
          {isDelivery && (
            <>
              {order.status === 'ready_for_delivery' && (
                <Button 
                  onClick={handlePickupDelivery}
                  disabled={isUpdating}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Truck className="h-4 w-4 ml-2" />}
                  استلام الطلب للتوصيل
                </Button>
              )}

              {order.status === 'out_for_delivery' && (
                <Button 
                  onClick={handleMarkDelivered}
                  disabled={isUpdating}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Check className="h-4 w-4 ml-2" />}
                  تأكيد التسليم للعميل
                </Button>
              )}
            </>
          )}

          {/* Cancel Order - Available for certain roles and statuses */}
          {((isCustomer && ['pending', 'admin_approved'].includes(order.status)) ||
            (isAdmin && ['pending', 'admin_approved', 'seller_approved'].includes(order.status)) ||
            (isSeller && ['admin_approved', 'seller_approved'].includes(order.status))) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <AlertTriangle className="h-4 w-4 ml-2" />
                  إلغاء الطلب
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>تأكيد إلغاء الطلب</AlertDialogTitle>
                  <AlertDialogDescription>
                    هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ هذا الإجراء لا يمكن التراجع عنه.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-4">
                  <Label>سبب الإلغاء</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أدخل سبب إلغاء الطلب..."
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>تراجع</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleCancelOrder}
                    disabled={isUpdating}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                    إلغاء الطلب
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="h-24 w-24 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">الطلب غير موجود</h2>
            <p className="text-neutral-900/70 mb-6">لم يتم العثور على الطلب المطلوب.</p>
            <Button onClick={() => navigate('/dashboard/orders')} className="bg-roman-500 hover:bg-roman-500/90">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للطلبات
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">              <div>
                <h1 className="text-4xl font-bold text-roman-500">
                  تفاصيل الطلب
                </h1>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="text-2xl font-bold text-gray-800">#{order.id}</span>
                  {getStatusBadge(order.status)}
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/orders')} 
                className="self-start sm:self-center border-roman-500 text-roman-500 hover:bg-roman-500 hover:text-white transition-all duration-300"
              >
                <ArrowLeft className="ml-2 h-4 w-4" />
                العودة للطلبات
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Main Content - Order Details */}
            <div className="lg:col-span-8 space-y-6">
                {/* Order Status Card */}
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader className="bg-roman-500/10 rounded-t-lg">
                  <CardTitle className="flex items-center text-xl">
                    <AlertCircle className="h-6 w-6 ml-2 text-roman-500" />
                    حالة الطلب الحالية
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                      {order.status_ar && (
                        <p className="text-xl font-bold text-gray-800">{order.status_ar}</p>
                      )}
                      {order.next_action && (
                        <p className="text-gray-600">{order.next_action}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">تاريخ الطلب</p>
                      <p className="font-semibold">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>              {/* Order Items Card */}
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-roman-500 text-white">
                  <CardTitle className="flex items-center text-xl">
                    <Package className="h-6 w-6 ml-2" />
                    عناصر الطلب ({order.items?.length || 0} منتج)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {order.items && order.items.map((item, index) => (
                      <motion.div 
                        key={index} 
                        className="p-6 hover:bg-gray-50 transition-colors duration-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="relative">
                            <img 
                              src={item.product?.image || 'https://via.placeholder.com/100'} 
                              alt={item.product?.name || 'منتج'} 
                              className="w-20 h-20 object-cover rounded-xl shadow-md"
                            />
                            <div className="absolute -top-2 -right-2 bg-roman-500 text-white text-xs font-bold rounded-full h-6 flex items-center justify-center">
                              {item.product.category.name}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-800 mb-1">
                              {item.product?.title || 'منتج'}
                            </h4>
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <span>السعر: {item.price} جنيه </span>                              
                            </div>
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <span>الكمية: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">الإجمالي</p>
                            <p className="text-xl font-bold text-roman-500">{item.subtotal} جنيه</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}                  </div>
                  <div className="bg-gray-50 p-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-800">الإجمالي الكلي</span>
                      <span className="text-3xl font-bold text-roman-500">
                        {order.total_price} جنيه
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>              {/* Payment Information Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-roman-500 text-white">
                  <CardTitle className="flex items-center text-xl">
                    <CreditCard className="h-6 w-6 ml-2" />
                    معلومات الدفع
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">طريقة الدفع:</span>
                        <span className="font-semibold">{order.payment_method_ar || order.payment_method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">حالة الدفع:</span>
                        <Badge 
                          variant={order.payment_status === 'paid' ? 'default' : 'secondary'}
                          className={order.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                          }
                        >
                          {order.payment_status === 'paid' ? 'مدفوع ✓' : 'غير مدفوع ⏳'}
                        </Badge>
                      </div>
                      
                      {/* Service Order Deposit Information */}
                      {order.is_service_order && order.requires_deposit && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">نوع الطلب:</span>
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              طلب خدمة
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">قيمة العربون:</span>
                            <span className="font-semibold text-blue-600">{order.deposit_amount} جنيه</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">حالة العربون:</span>
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
                        </>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {/* Service Order Deposit Image */}
                      {order.is_service_order && order.deposit_image && (
                        <div>
                          <span className="text-sm text-gray-600 mb-2 block">صورة إيصال العربون:</span>
                          <img 
                            src={order.deposit_image} 
                            alt="إيصال العربون" 
                            className="max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300"
                            onClick={() => window.open(order.deposit_image, '_blank')}
                          />
                        </div>
                      )}
                      
                      {/* Remaining Payment Proof Image */}
                      {order.is_service_order && order.remaining_payment_proof && (
                        <div>
                          <span className="text-sm text-gray-600 mb-2 block">صورة إيصال باقي المبلغ:</span>
                          <img 
                            src={order.remaining_payment_proof} 
                            alt="إيصال باقي المبلغ" 
                            className="max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300"
                            onClick={() => window.open(order.remaining_payment_proof, '_blank')}
                          />
                          {order.status === 'pending' && order.remaining_payment_proof && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <p className="text-xs text-yellow-800">
                                تم رفع إثبات دفع باقي المبلغ وينتظر مراجعة الإدارة
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Regular Payment Proof */}
                      {order.payment_proof && (
                        <div>
                          <span className="text-sm text-gray-600 mb-2 block">إيصال الدفع:</span>
                          <img 
                            src={order.payment_proof} 
                            alt="إيصال الدفع" 
                            className="max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300"
                            onClick={() => window.open(order.payment_proof, '_blank')}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements and Notes */}
              {(order.requirements || order.service_requirements || order.notes) && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-roman-500 text-white">
                    <CardTitle className="flex items-center text-xl">
                      <FileText className="h-6 w-6 ml-2" />
                      ملاحظات ومتطلبات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {order.is_service_order && order.service_requirements && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">متطلبات الخدمة:</h4>
                        <p className="text-gray-600 bg-blue-50 p-4 rounded-lg border-r-4 border-blue-500">
                          {order.service_requirements}
                        </p>
                      </div>
                    )}
                    {order.requirements && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">متطلبات خاصة:</h4>
                        <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border-r-4 border-roman-500">
                          {order.requirements}
                        </p>
                      </div>
                    )}
                    {order.notes && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">ملاحظات إضافية:</h4>
                        <p className="text-gray-600 bg-green-50 p-4 rounded-lg border-r-4 border-green-500">
                          {order.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Timeline */}
              {renderTimeline()}
            </div>

            {/* Sidebar - Contact Info & Actions */}
            <div className="lg:col-span-4 space-y-6">
                {/* Customer Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-roman-500 text-white">
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 ml-2" />
                    معلومات العميل
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-roman-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{order.user?.name || 'غير محدد'}</p>
                      <p className="text-sm text-gray-500">العميل</p>
                    </div>
                  </div>
                  {order.customer_phone && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-roman-500 rounded-full flex items-center justify-center">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{order.customer_phone}</p>
                        <p className="text-sm text-gray-500">رقم الهاتف</p>
                      </div>
                    </div>
                  )}
                  {order.delivery_address && (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-roman-500 rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 mb-1">عنوان التوصيل</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{order.delivery_address}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>              {/* Seller Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-roman-500 text-white">
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 ml-2" />
                    معلومات البائع
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-roman-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {order.seller?.user?.name || order.seller?.name || 'غير محدد'}
                      </p>
                      <p className="text-sm text-gray-500">البائع</p>
                    </div>
                  </div>
                  {order.seller?.phone && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-roman-500 rounded-full flex items-center justify-center">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{order.seller.phone}</p>
                        <p className="text-sm text-gray-500">رقم الهاتف</p>
                      </div>
                    </div>
                  )}
                  {order.seller_address && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-roman-500 rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{order.seller_address}</p>
                        <p className="text-sm text-gray-500">عنوان البائع</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Important Dates */}              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-roman-500 text-white">
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 ml-2" />
                    التواريخ المهمة
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">تاريخ الطلب:</span>
                      <span className="font-semibold">{new Date(order.created_at).toLocaleDateString('ar-EG')}</span>
                    </div>
                    {order.expected_delivery_date && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">التسليم المتوقع:</span>
                        <span className="font-semibold text-orange-600">
                          {new Date(order.expected_delivery_date).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    )}
                    {order.delivered_at && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">تاريخ التسليم:</span>
                        <span className="font-semibold text-green-600">
                          {new Date(order.delivered_at).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    )}
                    {order.completion_deadline && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">الموعد النهائي للإنجاز:</span>
                        <span className={`font-semibold ${
                          order.is_late ? 'text-red-600' : 
                          order.time_remaining?.is_late ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {new Date(order.completion_deadline).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Late Order Warning */}
                  {(order.is_late || order.time_remaining?.is_late) && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 ml-2" />
                        <span className="font-semibold text-red-800">تحذير: تأخر في إنجاز الطلب</span>
                      </div>
                      <p className="text-sm text-red-700 mt-2">
                        {order.time_remaining?.is_late 
                          ? `تأخر الطلب بـ ${order.time_remaining.overdue_hours} ساعة`
                          : 'لم يتم إنجاز الطلب في الوقت المحدد'
                        }
                      </p>
                    </div>
                  )}
                  
                  {/* Time Remaining for Active Orders */}
                  {order.time_remaining && !order.time_remaining.is_late && 
                   ['seller_approved', 'in_progress'].includes(order.status) && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-blue-600 ml-2" />
                        <span className="font-semibold text-blue-800">الوقت المتبقي للإنجاز</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-2">
                        {(() => {
                          // Handle both backend formats - days/hours as separate fields or days as decimal
                          let totalHours = 0;
                          
                          if (order.time_remaining.total_hours) {
                            // Use total_hours if available (more accurate)
                            totalHours = Math.floor(order.time_remaining.total_hours);
                          } else if (order.time_remaining.days) {
                            // Convert decimal days to hours
                            totalHours = Math.floor(order.time_remaining.days * 24);
                          }
                          
                          const days = Math.floor(totalHours / 24);
                          const hours = totalHours % 24;
                          
                          let timeText = '';
                          if (days > 0) {
                            timeText += `${days} يوم`;
                          }
                          if (days > 0 && hours > 0) {
                            timeText += ' و ';
                          }
                          if (hours > 0) {
                            timeText += `${hours} ساعة`;
                          }
                          
                          return timeText || 'أقل من ساعة';
                        })()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Existing Reviews Section */}
              {existingReviews.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-roman-500 text-white">
                    <CardTitle className="flex items-center">
                      <Star className="h-5 w-5 ml-2" />
                      تقييمات الطلب
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {isLoadingReviews ? (
                      <div className="text-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3" />
                        <p className="text-gray-600">جاري تحميل التقييمات...</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {existingReviews.map((review) => (
                          <div key={review.id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                {review.user?.avatar ? (
                                  <img 
                                    src={review.user.avatar} 
                                    alt={review.user.name || 'مستخدم'}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-neutral-200"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-roman-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {review.user?.name?.charAt(0) || 'م'}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold text-gray-800 text-right">{review.user?.name || 'مستخدم'}</h4>
                                    <p className="text-sm text-gray-500 text-right">
                                      {new Date(review.created_at).toLocaleDateString('ar-EG')}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {editingReview === review.id ? (
                                      <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <button
                                            key={star}
                                            type="button"
                                            onClick={() => setEditRating(star)}
                                            className={`h-5 w-5 ${
                                              star <= editRating
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                            } hover:text-yellow-400 transition-colors`}
                                          >
                                            <Star className="h-4 w-4" />
                                          </button>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                            key={star}
                                            className={`h-4 w-4 ${
                                              star <= review.rating
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    )}
                                    {/* Edit/Delete buttons for own reviews */}
                                    {review.user?.id === user?.id && (
                                      <div className="flex items-center gap-1">
                                        {editingReview === review.id ? (
                                          <>
                                            <Button
                                              onClick={() => handleUpdateReview(review.id)}
                                              disabled={isUpdatingReview}
                                              size="sm"
                                              className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                              {isUpdatingReview ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                              ) : (
                                                <Check className="h-3 w-3" />
                                              )}
                                            </Button>
                                            <Button
                                              onClick={handleCancelEdit}
                                              size="sm"
                                              variant="outline"
                                            >
                                              <X className="h-3 w-3" />
                                            </Button>
                                          </>
                                        ) : (
                                          <>
                                            <Button
                                              onClick={() => handleEditReview(review)}
                                              size="sm"
                                              variant="outline"
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              onClick={() => setReviewToDelete(review.id)}
                                              disabled={isDeletingReview}
                                              size="sm"
                                              variant="outline"
                                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {review.product && (
                                  <div className="flex items-center gap-3 mb-3 p-3 bg-white rounded-lg border">
                                    {review.product.image ? (
                                      <img 
                                        src={review.product.image} 
                                        alt={review.product.title}
                                        className="w-12 h-12 rounded-lg object-cover border border-neutral-200"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                                        <Package className="h-6 w-6 text-roman-500" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <span className="text-sm font-medium text-gray-700 block text-right">
                                        {review.product.title}
                                      </span>
                                      <span className="text-xs text-gray-500 block text-right">
                                        {review.product.category?.name || 'غير محدد'}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                
                                {editingReview === review.id ? (
                                  <div className="mt-3">
                                    <Label className="text-sm font-medium">التعليق (اختياري)</Label>
                                    <Textarea
                                      value={editComment}
                                      onChange={(e) => setEditComment(e.target.value)}
                                      placeholder="اكتب تعليقك على المنتج..."
                                      className="mt-1"
                                      rows={3}
                                    />
                                  </div>
                                ) : (
                                  review.comment && (
                                    <p className="text-gray-700 leading-relaxed text-right">{review.comment}</p>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Review Section */}
              {showReviewSection && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-roman-500 text-white">
                    <CardTitle className="flex items-center">
                      <Star className="h-5 w-5 ml-2" />
                      تقييم المنتجات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {reviewableProducts.map((product) => (
                        <div key={product.product_id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center space-x-3 mb-3">
                            {product.product_image && (
                              <img 
                                src={product.product_image} 
                                alt={product.product_title}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">{product.product_title}</h4>
                            </div>
                          </div>
                          
                          {product.can_review ? (
                            <div className="space-y-3">
                              {/* Star Rating */}
                              <div>
                                <Label className="text-sm font-medium">التقييم</Label>
                                <div className="flex items-center mt-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => handleRatingChange(product.product_id, star)}
                                      className={`h-8 w-8 ${
                                        star <= (reviewRatings[product.product_id] || 0)
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      } hover:text-yellow-400 transition-colors`}
                                    >
                                      <Star className="h-6 w-6" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Comment */}
                              <div>
                                <Label className="text-sm font-medium">التعليق (اختياري)</Label>
                                <Textarea
                                  value={reviewComments[product.product_id] || ''}
                                  onChange={(e) => handleCommentChange(product.product_id, e.target.value)}
                                  placeholder="اكتب تعليقك على المنتج..."
                                  className="mt-1"
                                  rows={3}
                                />
                              </div>
                              
                              {/* Submit Button */}
                              <Button
                                onClick={() => handleSubmitReview(product.product_id)}
                                disabled={isSubmittingReview || !reviewRatings[product.product_id]}
                                className="w-full bg-roman-500 hover:bg-roman-500/90"
                              >
                                {isSubmittingReview ? (
                                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                ) : (
                                  <Star className="h-4 w-4 ml-2" />
                                )}
                                إرسال التقييم
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <div className="flex items-center justify-center space-x-2 text-green-600">
                                <CheckCircle className="h-5 w-5" />
                                <span>تم التقييم بنجاح</span>
                              </div>
                              {product.existing_review && (
                                <div className="mt-3 p-3 bg-white rounded-lg border">
                                  <div className="flex items-center justify-center space-x-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <= product.existing_review.rating
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  {product.existing_review.comment && (
                                    <p className="text-sm text-gray-600 text-center">
                                      {product.existing_review.comment}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              {renderActionButtons()}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delete Review Confirmation Dialog */}
      <AlertDialog open={reviewToDelete !== null} onOpenChange={() => setReviewToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف التقييم</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من أنك تريد حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteReview(reviewToDelete)}
              disabled={isDeletingReview}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingReview ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري الحذف...
                </>
              ) : (
                'حذف'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderDetailPage;
