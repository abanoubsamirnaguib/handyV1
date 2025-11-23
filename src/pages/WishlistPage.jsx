import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingCart, MessageSquare, AlertCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/lib/api';
import { Link, useNavigate } from 'react-router-dom';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState(new Set());
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.getWishlist();
      setWishlistItems(response.items || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في جلب قائمة الأمنيات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      setRemovingItems(prev => new Set([...prev, productId]));
      const response = await api.removeFromWishlist(productId);
      
      if (response.success) {
        setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
        toast({
          title: 'تم الحذف',
          description: response.message || 'تمت إزالة المنتج من قائمة الأمنيات',
        });
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في إزالة المنتج من قائمة الأمنيات',
        variant: 'destructive',
      });
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleAddToCart = async (product) => {
    try {
      if (product.type === 'product') {
        const success = addToCart({
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.images?.[0]?.image_url,
          quantity: 1
        });
        if (!success) {
          // إذا فشلت العملية بسبب عدم تسجيل الدخول، يتم إعادة التوجيه
          navigate('/login');
          return;
        }
      } else {
        // For services, redirect to product page
        navigate(`/gigs/${product.id}`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في إضافة المنتج للسلة',
        variant: 'destructive',
      });
    }
  };

  const handleContactSeller = (sellerId) => {
    navigate(`/sellers/${sellerId}`);
  };

  const clearWishlist = async () => {
    try {
      const response = await api.clearWishlist();
      if (response.success) {
        setWishlistItems([]);
        toast({
          title: 'تم التفريغ',
          description: response.message || 'تم تفريغ قائمة الأمنيات بالكامل',
        });
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تفريغ قائمة الأمنيات',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader className="h-8 w-8 animate-spin text-roman-500" />
          <span className="mr-2 text-lg">جاري تحميل قائمة الأمنيات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-warning-500 ml-3" />
            <h1 className="text-3xl font-bold text-neutral-900">قائمة الأمنيات</h1>
            <Badge variant="secondary" className="mr-3">
              {wishlistItems.length} عنصر
            </Badge>
          </div>
          {wishlistItems.length > 0 && (
            <Button
              variant="outline"
              onClick={clearWishlist}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 ml-2" />
              تفريغ القائمة
            </Button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">
              قائمة الأمنيات فارغة
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              لم تقم بإضافة أي منتجات إلى قائمة الأمنيات بعد. استكشف المنتجات وأضف المفضلة لديك!
            </p>
            <Link to="/explore">
              <Button className="bg-roman-500 hover:bg-roman-600">
                استكشاف المنتجات
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 border-roman-500/20">
                  <CardHeader className="p-0">
                    <div className="relative">
                      <img
                        src={item.product.images?.[0]?.image_url || '/placeholder-image.jpg'}
                        alt={item.product.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveFromWishlist(item.product.id)}
                        disabled={removingItems.has(item.product.id)}
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600 shadow-md"
                      >
                        {removingItems.has(item.product.id) ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Badge
                        variant={item.product.type === 'product' ? 'default' : 'secondary'}
                        className="absolute top-2 left-2"
                      >
                        {item.product.type === 'product' ? 'منتج' : 'خدمة'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <Link to={`/gigs/${item.product.id}`}>
                      <h3 className="font-semibold text-lg text-neutral-900 hover:text-roman-500 transition-colors cursor-pointer mb-2">
                        {item.product.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.product.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-warning-500">
                        {item.product.price} ريال
                      </span>
                      {item.product.seller && (
                        <span className="text-sm text-gray-500">
                          بواسطة: {item.product.seller.name}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(item.product)}
                        className="flex-1 bg-roman-500 hover:bg-roman-600"
                      >
                        {item.product.type === 'product' ? (
                          <>
                            <ShoppingCart className="h-4 w-4 ml-1" />
                            أضف للسلة
                          </>
                        ) : (
                          <>
                            <MessageSquare className="h-4 w-4 ml-1" />
                            اطلب الخدمة
                          </>
                        )}
                      </Button>
                      {item.product.seller && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleContactSeller(item.product.seller.id)}
                          className="border-roman-500/50 text-roman-500 hover:bg-roman-500 hover:text-white"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WishlistPage; 