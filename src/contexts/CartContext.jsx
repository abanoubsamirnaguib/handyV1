
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Helper function to get cart key for a specific user
const getCartKey = (userId) => `cart_${userId}`;

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const isClearingCart = React.useRef(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load cart from localStorage when user changes
  useEffect(() => {
    if (user?.id) {
      // Load cart for the current user
      try {
        const cartKey = getCartKey(user.id);
        const storedCart = localStorage.getItem(cartKey);
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          setCart(Array.isArray(parsedCart) ? parsedCart : []);
        } else {
          setCart([]);
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        setCart([]);
      }
    } else {
      // If no user, clear the cart
      setCart([]);
    }
    setIsInitialized(true);
  }, [user?.id]);

  // Save cart to localStorage whenever it changes (but not on initial load)
  useEffect(() => {
    // Skip saving on initial load or if user is not logged in
    if (!isInitialized || !user?.id) return;

    try {
      const cartKey = getCartKey(user.id);
      // حفظ السلة في localStorage دائماً (حتى لو كانت فارغة)
      // حذف localStorage فقط عند استدعاء clearCart() صراحة
      if (isClearingCart.current) {
        // حذف localStorage عند clearCart()
        localStorage.removeItem(cartKey);
        isClearingCart.current = false;
      } else {
        // حفظ السلة في localStorage (حتى لو كانت فارغة)
        localStorage.setItem(cartKey, JSON.stringify(cart));
      }
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart, isInitialized, user?.id]);

  const addToCart = (item) => {
    // التحقق من تسجيل الدخول قبل إضافة المنتج للسلة
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'يرجى تسجيل الدخول',
        description: 'يجب عليك تسجيل الدخول أولاً لإضافة المنتجات إلى السلة',
      });
      // إرجاع false للإشارة إلى أن العملية فشلت بسبب عدم تسجيل الدخول
      // المكونات التي تستدعي addToCart يمكنها التحقق من القيمة وإعادة التوجيه
      return false;
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex((cartItem) => cartItem.id === item.id);

    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += item.quantity || 1;
      setCart(updatedCart);
    } else {
      // Add new item with quantity
      setCart([...cart, { ...item, quantity: item.quantity || 1 }]);
    }

    toast({
      title: 'تمت الإضافة إلى السلة',
      description: `تمت إضافة ${item.title} إلى سلة التسوق`,
    });
    
    return true;
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
    toast({
      title: 'تمت الإزالة من السلة',
      description: 'تم حذف المنتج من سلة التسوق',
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const updatedCart = cart.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    setCart(updatedCart);
  };

  const clearCart = () => {
    if (!user?.id) {
      setCart([]);
      return;
    }
    
    isClearingCart.current = true;
    setCart([]);
    toast({
      title: 'تم تفريغ السلة',
      description: 'تم حذف جميع المنتجات من سلة التسوق',
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
