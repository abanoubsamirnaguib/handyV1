import React, { useState } from 'react';
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
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BadgeDollarSign, CreditCard } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const DepositPaymentButton = ({ 
  productId, 
  sellerId, 
  conversationId, 
  productTitle, 
  productPrice, 
  onPaymentSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [depositAmount, setDepositAmount] = useState(Math.round(productPrice * 0.30)); // Default 30% of product price
  const [orderId, setOrderId] = useState(null);
  const [step, setStep] = useState('initial'); // initial, createOrder, confirmPayment
  
  // Crear una orden preliminar
  const handleCreateOrder = async () => {
    if (!user) {
      toast({
        title: "غير مصرح به",
        description: "يرجى تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    setStep('createOrder');
    
    try {
      // En una aplicación real, aquí haríamos una llamada API para crear la orden
      // Simulamos la creación de una orden
      const simulatedOrder = {
        id: `ord_${Date.now()}`,
        user_id: user.id,
        seller_id: sellerId,
        product_id: productId,
        status: 'pending',
        total_price: productPrice,
        requires_deposit: true,
        deposit_amount: depositAmount,
        deposit_status: 'not_paid',
        chat_conversation_id: conversationId
      };
      
      // Aquí simularemos que la creación de la orden fue exitosa
      setTimeout(() => {
        setOrderId(simulatedOrder.id);
        setStep('confirmPayment');
        setIsSubmitting(false);
      }, 1000);
      
      /* En una app real, haríamos algo como:
      const response = await api.post('/orders', {
        seller_id: sellerId,
        product_id: productId,
        total_price: productPrice,
        requires_deposit: true,
        deposit_amount: depositAmount,
        chat_conversation_id: conversationId
      });
      
      setOrderId(response.data.order.id);
      setStep('confirmPayment');
      */
      
    } catch (error) {
      console.error('Error al crear la orden:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  // Procesar el pago del depósito
  const handleProcessDeposit = async () => {
    if (!orderId || !depositAmount || depositAmount <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد مبلغ صحيح للعربون",
        variant: "destructive",
      });
      return;
    }
    
    // التحقق من أن العربون لا يتجاوز 80% من قيمة المنتج
    const maxDepositAmount = productPrice * 0.8;
    if (depositAmount > maxDepositAmount) {
      toast({
        title: "خطأ في قيمة العربون",
        description: `قيمة العربون لا يمكن أن تتجاوز 80% من قيمة المنتج (${maxDepositAmount.toFixed(2)} ريال)`,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // En una aplicación real, aquí haríamos una llamada API para procesar el pago
      // Simulamos el procesamiento del pago
      
      /* En una app real, haríamos algo como:
      const response = await api.post('/payments/deposit', {
        order_id: orderId,
        amount: depositAmount,
        payment_method: paymentMethod,
        conversation_id: conversationId,
        product_id: productId
      });
      
      if (response.data.success) {
        toast({
          title: "تم الدفع بنجاح",
          description: "تم دفع العربون بنجاح وتم تأكيد الطلب",
          variant: "success",
        });
        
        // Notificar al componente padre sobre el pago exitoso
        if (onPaymentSuccess) {
          onPaymentSuccess({
            orderId,
            amount: depositAmount,
            paymentMethod,
            depositStatus: 'paid'
          });
        }
      }
      */
      
      // Simulamos que el pago fue exitoso
      setTimeout(() => {
        toast({
          title: "تم الدفع بنجاح",
          description: "تم دفع العربون بنجاح وتم تأكيد الطلب",
        });
        
        if (onPaymentSuccess) {
          onPaymentSuccess({
            orderId,
            amount: depositAmount,
            paymentMethod,
            depositStatus: 'paid'
          });
        }
        
        setIsSubmitting(false);
        setStep('initial');
      }, 1500);
      
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
        >
          <BadgeDollarSign className="h-4 w-4 ml-2" />
          دفع عربون
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-right">
            {step === 'initial' && 'دفع عربون للمنتج'}
            {step === 'createOrder' && 'جاري إنشاء الطلب...'}
            {step === 'confirmPayment' && 'تأكيد دفع العربون'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-right space-y-4">
            {step === 'initial' && (
              <>
                <p className="font-semibold">{productTitle}</p>
                <p className="text-xl">السعر الكلي: {productPrice} ريال</p>
                <p className="text-sm text-gray-500">
                  دفع العربون يساعد في تأكيد طلبك وحجز دورك عند الحرفي. 
                  يمكنك دفع المبلغ المتبقي لاحقاً بعد الاتفاق على التفاصيل.
                </p>
                <div className="mt-4">
                  <Label htmlFor="depositAmount" className="block mb-2">قيمة العربون (ريال)</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    min={1}
                    max={Math.round(productPrice * 0.8)}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    الحد الأقصى للعربون: {Math.round(productPrice * 0.8)} ريال (80% من قيمة المنتج)
                  </p>
                </div>
              </>
            )}
            
            {step === 'createOrder' && (
              <p>جاري إنشاء الطلب، يرجى الانتظار...</p>
            )}
            
            {step === 'confirmPayment' && (
              <>
                <p className="font-semibold">{productTitle}</p>
                <div className="bg-orange-50 p-3 rounded-md border border-orange-100 mt-4">
                  <p className="text-orange-700 font-semibold">تفاصيل الدفع</p>
                  <p className="text-sm mt-2">قيمة العربون: {depositAmount} ريال</p>
                  <p className="text-sm">المبلغ المتبقي: {productPrice - depositAmount} ريال</p>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="paymentMethod" className="block mb-2">اختر وسيلة الدفع</Label>
                  <Select 
                    value={paymentMethod} 
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="اختر وسيلة الدفع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
                      <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                      <SelectItem value="wallet">المحفظة الإلكترونية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mt-6">
                  <p className="text-blue-700 text-sm">
                    <strong>ملاحظة:</strong> بعد دفع العربون، لا يمكن إلغاء الطلب إلا بموافقة البائع.
                  </p>
                </div>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse justify-between">
          <div>
            {step === 'initial' && (
              <Button
                onClick={handleCreateOrder}
                disabled={isSubmitting || depositAmount <= 0 || depositAmount > productPrice}
                className="bg-primary hover:bg-primary/90"
              >
                متابعة
              </Button>
            )}
            
            {step === 'createOrder' && (
              <Button disabled className="bg-primary hover:bg-primary/90">
                جاري المعالجة...
              </Button>
            )}
            
            {step === 'confirmPayment' && (
              <Button
                onClick={handleProcessDeposit}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                <CreditCard className="h-4 w-4 ml-2" />
                دفع العربون
              </Button>
            )}
          </div>
          
          <AlertDialogCancel 
            disabled={isSubmitting} 
            onClick={() => {
              if (step !== 'initial') setStep('initial');
            }}
          >
            إلغاء
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DepositPaymentButton;
