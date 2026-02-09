import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingBag, Store, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const RoleSwitcher = () => {
  const { user, switchRole, enableSellerMode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  if (!user) return null;

  const handleRoleSwitch = async (targetRole) => {
    if (targetRole === user.active_role) return;
    
    setIsLoading(true);
    
    // If user is trying to switch to seller but doesn't have seller capabilities
    if (targetRole === 'seller' && !user.is_seller) {
      const success = await enableSellerMode();
      if (success) {
        await switchRole(targetRole);
      }
    } else {
      await switchRole(targetRole);
    }
    
    setIsLoading(false);
  };

  const handleEnableSellerMode = async () => {
    setIsLoading(true);
    const success = await enableSellerMode();
    if (success) {
      await switchRole('seller');
    }
    setIsLoading(false);
  };

  const handleToggle = () => {
    const targetRole = user.active_role === 'seller' ? 'buyer' : 'seller';
    handleRoleSwitch(targetRole);
  };

  return (
    <Card className="mb-6 border-roman-500/20 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Title */}
          <h3 className="text-lg font-semibold text-neutral-900">تبديل الدور</h3>
          
          {/* Toggle Button Container - extra gap so toggle never overlaps labels */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {/* Seller Label - flex-shrink-0 so it never gets covered */}
            <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
              <Store className="h-5 w-5 text-roman-500 flex-shrink-0" />
              <span className={`text-sm font-medium transition-colors whitespace-nowrap ${
                user.active_role === 'seller' ? 'text-roman-500' : 'text-gray-500'
              }`}>
                البائع
              </span>
            </div>

            {/* Toggle Switch - fixed size, never grows/shrinks */}
            <button
              onClick={handleToggle}
              disabled={isLoading || !user.is_seller}
              className={`relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-roman-500 focus:ring-offset-2 ${
                user.active_role === 'buyer' ? 'bg-roman-500' : 'bg-gray-300'
              } ${isLoading || !user.is_seller ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <motion.span
                className="inline-block h-6 w-6 flex-shrink-0 transform rounded-full bg-white shadow-lg"
                initial={false}
                animate={{
                  x: user.active_role === 'buyer' ? -30 : -5,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                }}
              />
            </button>

            {/* Buyer Label - flex-shrink-0 so it never gets covered */}
            <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
              <span className={`text-sm font-medium transition-colors whitespace-nowrap ${
                user.active_role === 'buyer' ? 'text-roman-500' : 'text-gray-500'
              }`}>
                المشتري
              </span>
              <ShoppingBag className="h-5 w-5 text-roman-500 flex-shrink-0" />
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-center text-gray-600">
            {user.active_role === 'seller' 
              ? 'أنت الآن في وضع البائع - يمكنك إدارة المنتجات والطلبات'
              : 'أنت الآن في وضع المشتري - يمكنك تصفح المنتجات والشراء'
            }
          </p>

          {/* Enable Seller Mode Button (if not a seller) */}
          {!user.is_seller && (
            <Button
              onClick={handleEnableSellerMode}
              disabled={isLoading}
              className="bg-roman-500 text-white hover:bg-roman-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              تفعيل وضع البائع
            </Button>
          )}

          {/* Loading Indicator */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-sm text-roman-500"
              >
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-roman-500"></div>
                <span>جاري تحديث الدور...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleSwitcher;
