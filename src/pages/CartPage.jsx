
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

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "السلة فارغة",
        description: "الرجاء إضافة منتجات إلى السلة أولاً.",
      });
      return;
    }
    // Placeholder for checkout logic
    // In a real app, this would redirect to a checkout page or integrate with a payment gateway
    toast({
      title: "جاري توجيهك للدفع",
      description: "سيتم توجيهك لصفحة الدفع لإكمال طلبك.",
    });
    // For now, let's clear the cart and navigate to a success page (or home)
    // clearCart();
    // navigate('/checkout-success'); // Example, create this page if needed
    navigate('/'); // Or navigate home
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">سلة التسوق</h1>
          <Button variant="outline" onClick={() => navigate('/explore')} className="border-primary text-primary hover:bg-primary hover:text-white">
            <ArrowLeft className="ml-2 h-4 w-4" /> متابعة التسوق
          </Button>
        </div>

        {cart.length === 0 ? (
          <Card className="text-center py-12 shadow-lg border-orange-200">
            <CardContent>
              <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">سلة التسوق فارغة</h2>
              <p className="text-gray-500 mb-6">لم تقم بإضافة أي منتجات إلى السلة بعد.</p>
              <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600">
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
                  <Card className="flex flex-col sm:flex-row items-center p-4 shadow-md hover:shadow-lg transition-shadow duration-300 card-hover border-amber-100">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden mb-4 sm:mb-0 sm:ml-4">
                      <img src="https://images.unsplash.com/photo-1688811363469-49a6f3bc2025" alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-center sm:text-right">
                      <Link to={`/gigs/${item.id}`} className="text-lg font-semibold text-gray-800 hover:text-primary transition-colors">{item.title}</Link>
                      <p className="text-sm text-gray-500">السعر: {item.price} جنيه</p>
                      <div className="flex items-center justify-center sm:justify-start my-2 space-x-2 space-x-reverse">
                        <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input type="number" value={item.quantity} readOnly className="w-16 text-center" />
                        <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-center sm:items-end mt-4 sm:mt-0 sm:mr-auto">
                      <p className="text-lg font-bold text-primary mb-2">{item.price * item.quantity} جنيه</p>
                      <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-destructive hover:bg-red-50">
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
                  <div className="flex justify-between text-gray-700">
                    <span>المجموع الفرعي</span>
                    <span>{getCartTotal()} جنيه</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>الشحن</span>
                    <span className="text-green-600">مجاني</span> {/* Placeholder */}
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold text-gray-800">
                    <span>الإجمالي</span>
                    <span>{getCartTotal()} جنيه</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button size="lg" onClick={handleCheckout} className="w-full bg-green-500 hover:bg-green-600">
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
