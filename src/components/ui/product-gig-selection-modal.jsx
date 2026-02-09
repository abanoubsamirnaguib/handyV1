import React from 'react';
import { motion } from 'framer-motion';
import { Package, Wrench, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ProductGigSelectionModal = ({ isOpen, onClose, onSelectProduct, onSelectGig }) => {
  const handleProductSelect = () => {
    onSelectProduct();
    onClose();
  };

  const handleGigSelect = () => {
    onSelectGig();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-center text-gray-800">
            ما نوع المنتج الذي تريد إضافته؟
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Card - Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-amber-300 border-2 border-transparent group"   
                onClick={handleProductSelect}
              >
                <CardHeader className="text-center pb-3">
                  <div className="mx-auto mb-3 p-3 bg-amber-100 rounded-full w-fit group-hover:bg-amber-200 transition-colors">
                    <Package className="h-8 w-8 text-amber-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">منتج قابل للبيع</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 mb-4">
                    منتج مادي يمكن بيعه مباشرة للعملاء، مثل المنتجات المصنعة سابقا
                  </CardDescription>
                  <ul className="text-sm text-gray-500 space-y-1 text-right">
                    <li>• منتج جاهز وموجود بالفعل</li>
                    <li>• تم تصنيعه أو عمله من قبل</li>
                    <li>• لا يحتاج تجهيز خاص أو تفاصيل مخصصة عند الطلب</li>
                    <li>• جاهز للاستلام فوراً بعد الطلب</li>
                    <li>• يمكن الدفع عند الاستلام بدون عربون</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Gig Card - Right Side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-blue-300 border-2 border-transparent group"
                onClick={handleGigSelect}
              >
                <CardHeader className="text-center pb-3">
                  <div className="mx-auto mb-3 p-3 bg-blue-100 rounded-full w-fit group-hover:bg-blue-200 transition-colors">
                    <Wrench className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">حرفة</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 mb-4">
                      حرفة تقدمها للعملاء، مثل صنع قطعة مخصصة بشكل خاص
                  </CardDescription>
                  <ul className="text-sm text-gray-500 space-y-1 text-right">
                    <li>• مميزات مخصصة للمشتري</li>
                    <li>• مناقشة المشتري في تفاصيل وشكل الحرفة</li>
                    <li>• يتم عمله مخصوص للمشتري</li>
                    <li>• يوجد عربون يُحدد في الشات مع المشتري</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-8"
            >
              <X className="ml-2 h-4 w-4" />
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductGigSelectionModal;