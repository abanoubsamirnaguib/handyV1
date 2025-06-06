import React from 'react';
import { motion } from 'framer-motion';
import { BadgeDollarSign, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const PaymentMessage = ({ message, isUserMessage }) => {
  const { paymentDetails } = message;
  
  if (!paymentDetails) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex w-full",
        isUserMessage ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "max-w-xs lg:max-w-md px-4 py-3 rounded-xl shadow border",
        isUserMessage 
          ? "bg-green-50 text-green-800 border-green-200 rounded-br-none" 
          : "bg-gray-100 text-gray-800 border-gray-200 rounded-bl-none"
      )}>
        <div className="flex items-center mb-2">
          <BadgeDollarSign className="h-5 w-5 ml-2" />
          <p className="font-semibold">تم دفع عربون</p>
        </div>
        
        <div className="space-y-1 text-sm">
          <p>رقم الطلب: <span className="font-mono">{paymentDetails.orderId}</span></p>
          <p>المبلغ: <span className="font-semibold">{paymentDetails.amount} ريال</span></p>
          <p className="flex items-center gap-2">
            الحالة: 
            {paymentDetails.depositStatus === 'paid' ? (
              <span className="flex items-center text-green-700">
                <Check className="h-4 w-4 ml-1" /> مدفوع
              </span>
            ) : (
              <span className="flex items-center text-amber-700">
                <Clock className="h-4 w-4 ml-1" /> قيد المعالجة
              </span>
            )}
          </p>
        </div>
        
        <p className="text-xs mt-2 text-green-700">
          يمكنك متابعة حالة الطلب من صفحة الطلبات
        </p>
      </div>
    </motion.div>
  );
};

export default PaymentMessage;
