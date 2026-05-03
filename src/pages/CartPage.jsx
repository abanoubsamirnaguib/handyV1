import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  // التحقق من أن جميع المنتجات من نفس البائع
  const checkMultipleSellers = () => {
    if (cart.length === 0) return false;
    
    const sellerIds = cart
      .map(item => item.sellerId || item.seller_id || item.seller?.id)
      .filter(id => id !== undefined && id !== null);
    
    if (sellerIds.length === 0) return false;
    
    const uniqueSellerIds = [...new Set(sellerIds)];
    return uniqueSellerIds.length > 1;
  };

  const hasMultipleSellers = checkMultipleSellers();

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "السلة فارغة",
        description: "الرجاء إضافة منتجات إلى السلة أولاً.",
      });
      return;
    }

    // التحقق من أن جميع المنتجات من نفس البائع
    if (hasMultipleSellers) {
      toast({
        variant: "destructive",
        title: "خطأ في السلة",
        description: "لا يمكن أن تحتوي الطلبية على منتجات من بائعين مختلفين. يرجى إزالة المنتجات من بائع آخر أو إنشاء طلب منفصل.",
      });
      return;
    }

    // الانتقال لصفحة إتمام الطلب
    navigate('/checkout');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">سلة التسوق</h1>
          <Button variant="outline" onClick={() => navigate('/explore')} className="border-roman-500 text-roman-500 hover:bg-roman-500 hover:text-white">
            <ArrowLeft className="ml-2 h-4 w-4" /> متابعة التسوق
          </Button>
        </div>

        {cart.length === 0 ? (
          <Card className="text-center py-12 shadow-lg border-roman-500/20">
            <CardContent>
              <ShoppingBag className="h-24 w-24 text-success-500 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-neutral-900 mb-2">سلة التسوق فارغة</h2>
              <p className="text-neutral-900/70 mb-6">لم تقم بإضافة أي منتجات إلى السلة بعد.</p>
              <Button asChild size="lg" className="bg-roman-500 hover:bg-roman-600 text-white">
                <Link to="/explore">ابدأ التسوق الآن</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-6">
              {cart.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="flex flex-col sm:flex-row items-center p-4 shadow-md hover:shadow-lg transition-shadow duration-300 card-hover border-roman-500/20">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden mb-4 sm:mb-0 sm:ml-4">
                      <img src="https://images.unsplash.com/photo-1688811363469-49a6f3bc2025" alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-center sm:text-right">
                      <Link to={`/gigs/${item.id}`} className="text-lg font-semibold text-neutral-900 hover:text-roman-500 transition-colors">{item.title}</Link>
                      <p className="text-sm text-neutral-900/70">
                        السعر:
                        {item.original_price != null && Number(item.original_price) !== Number(item.price) ? (
                          <>
                            {' '}
                            <span className="line-through text-neutral-500 mr-1">{Number(item.original_price).toFixed(2)}</span>
                            <span className="font-semibold text-roman-600">{Number(item.price).toFixed(2)} جنيه</span>
                            <span className="text-xs text-green-700 mr-1">(عرض)</span>
                          </>
                        ) : (
                          <> {Number(item.price).toFixed(2)} جنيه</>
                        )}
                      </p>
                      <div className="flex items-center justify-center sm:justify-start my-2 space-x-2 space-x-reverse">
                        <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="border-roman-500/50 text-roman-500">
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input type="number" value={item.quantity} readOnly className="w-16 text-center border-roman-500/30" />
                        <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="border-roman-500/50 text-roman-500">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-center sm:items-end mt-4 sm:mt-0 sm:mr-auto">
                      <p className="text-lg font-bold text-roman-500 mb-2">{(Number(item.price) * item.quantity).toFixed(2)} جنيه</p>
                      <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-roman-500 hover:bg-roman-500/10">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1">
              <Card className="shadow-xl border-orange-200 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* تحذير بائعين مختلفين */}
                  {hasMultipleSellers && (
                    <div className="p-3 bg-red-50 rounded-lg border-r-4 border-red-400 mb-4">
                      <p className="text-sm font-semibold text-red-800 mb-1">⚠️ تحذير</p>
                      <p className="text-xs text-red-700">
                        لا يمكن أن تحتوي الطلبية على منتجات من بائعين مختلفين. يرجى إزالة المنتجات من بائع آخر أو إنشاء طلب منفصل.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>المجموع الفرعي:</span>
                      <span className="font-semibold">{getCartTotal()} جنيه</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>مصاريف التوصيل:</span>
                      <span className="text-orange-600 font-semibold">سيتم حسابه عند الطلب</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>الإجمالي المتوقع:</span>
                      <span className="text-roman-500">{getCartTotal()} ج.م + مصاريف التوصيل</span>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg border-r-4 border-blue-400 mt-4">
                      <p className="text-xs text-blue-700 text-center">
                        💡 تم إضافة مصاريف التوصيل عند اختيار المدينة في صفحة الإتمام
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button 
                    size="lg" 
                    onClick={handleCheckout} 
                    disabled={hasMultipleSellers}
                    className={`w-full ${hasMultipleSellers ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    <CreditCard className="ml-2 h-5 w-5" /> إتمام عملية الشراء
                  </Button>
                  <Button variant="outline" onClick={clearCart} className="w-full text-destructive border-destructive hover:bg-red-50">
                    تفريغ السلة
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CartPage;
