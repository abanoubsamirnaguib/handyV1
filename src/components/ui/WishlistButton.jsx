import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from './use-toast';

const WishlistButton = ({ productId, inWishlist = false, onWishlistChange, className = "", size = "md" }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isInWishlist, setIsInWishlist] = useState(inWishlist);
  const [wishlistLoading, setWishlistLoading] = useState(false);


  // Update local state when inWishlist prop changes
  useEffect(() => {
    setIsInWishlist(inWishlist);
  }, [inWishlist]);

  // Only check wishlist status if inWishlist prop is not provided (fallback for backward compatibility)
  useEffect(() => {
    if (user && productId && inWishlist === undefined) {
      checkWishlistStatus();
    }
  }, [productId, user, inWishlist]);

  const checkWishlistStatus = async () => {
    try {
      const response = await api.checkWishlistStatus(productId);
      setIsInWishlist(response.in_wishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة",
        variant: "destructive",
      });
      return;
    }

    if (wishlistLoading) return;

    try {
      setWishlistLoading(true);
      const response = await api.toggleWishlist(productId);
      
      if (response.success) {
        const newWishlistStatus = response.action === 'added';
        setIsInWishlist(newWishlistStatus);
        
        // Notify parent component of the change
        if (onWishlistChange) {
          onWishlistChange(productId, newWishlistStatus);
        }
        
        toast({
          title: response.action === 'added' ? "تم إضافة المنتج" : "تم إزالة المنتج",
          description: response.action === 'added' 
            ? 'تم إضافة المنتج إلى المفضلة بنجاح'
            : 'تم إزالة المنتج من المفضلة بنجاح',
        });
      } else {
        toast({
          title: "خطأ",
          description: response.message || 'حدث خطأ ما',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      if (error.response?.status === 401) {
        toast({
          title: "تسجيل الدخول مطلوب",
          description: "يجب تسجيل الدخول أولاً",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء تحديث المفضلة",
          variant: "destructive",
        });
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-10 h-10"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={wishlistLoading}
      className={`
        ${sizeClasses[size]}
        ${className}
        ${isInWishlist 
          ? 'bg-red-500 text-white hover:bg-red-600' 
          : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
        }
        rounded-full
        flex items-center justify-center
        transition-all duration-200
        shadow-lg hover:shadow-xl
        border border-white/20
        backdrop-blur-sm
        ${wishlistLoading ? 'opacity-70' : 'hover:scale-110'}
      `}
      title={isInWishlist ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
    >
      <Heart 
        className={`${iconSizes[size]} transition-all duration-200 ${
          isInWishlist ? 'fill-current' : ''
        } ${wishlistLoading ? 'animate-pulse' : ''}`} 
      />
    </button>
  );
};

export default WishlistButton;
