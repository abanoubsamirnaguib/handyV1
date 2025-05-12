
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
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
