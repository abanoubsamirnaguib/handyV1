import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingBag, Users, Store, Plus, ArrowRightLeft } from 'lucide-react';
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

  return (
    <Card className="mb-6 border-olivePrimary/20 bg-gradient-to-r from-olivePrimary/5 to-olivePrimary/10">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-olivePrimary" />
            <span>تبديل الأدوار</span>
          </div>
          <Badge 
            variant={user.active_role === 'seller' ? 'default' : 'secondary'}
            className={user.active_role === 'seller' ? 'bg-olivePrimary text-white' : ''}
          >
            {user.active_role === 'seller' ? 'البائع' : 'المشتري'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Buyer Role */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              user.active_role === 'buyer'
                ? 'border-olivePrimary bg-olivePrimary/10'
                : 'border-gray-200 hover:border-olivePrimary/50'
            }`}
            onClick={() => user.is_buyer && handleRoleSwitch('buyer')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-olivePrimary" />
                <span className="font-medium">المشتري</span>
              </div>
              {user.active_role === 'buyer' && (
                <Badge className="bg-olivePrimary text-white">نشط</Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">
              تصفح المنتجات، إضافة للسلة، وإجراء المشتريات
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-11 h-6">
                <Switch 
                  checked={user.active_role === 'buyer'}
                  disabled={!user.is_buyer || isLoading}
                  onCheckedChange={() => user.is_buyer && handleRoleSwitch('buyer')}
                  className="data-[state=checked]:bg-olivePrimary w-11 h-6"
                />
              </div>
              <span className="text-xs text-gray-500">
                {user.is_buyer ? 'متاح' : 'غير متاح'}
              </span>
            </div>
          </motion.div>

          {/* Seller Role */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              user.active_role === 'seller'
                ? 'border-olivePrimary bg-olivePrimary/10'
                : 'border-gray-200 hover:border-olivePrimary/50'
            }`}
            onClick={() => user.is_seller && handleRoleSwitch('seller')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-olivePrimary" />
                <span className="font-medium">البائع</span>
              </div>
              {user.active_role === 'seller' && (
                <Badge className="bg-olivePrimary text-white">نشط</Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">
              إدارة المنتجات، معالجة الطلبات، وتتبع الأرباح
            </p>
            <div className="flex items-center gap-2">
              {user.is_seller ? (
                <>
                  <div className="flex-shrink-0 w-11 h-6">
                    <Switch 
                      checked={user.active_role === 'seller'}
                      disabled={isLoading}
                      onCheckedChange={() => handleRoleSwitch('seller')}
                      className="data-[state=checked]:bg-olivePrimary w-11 h-6"
                    />
                  </div>
                  <span className="text-xs text-gray-500">متاح</span>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEnableSellerMode}
                    disabled={isLoading}
                    className="border-olivePrimary text-olivePrimary hover:bg-olivePrimary hover:text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    تفعيل وضع البائع
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 bg-olivePrimary/10 rounded-lg border border-olivePrimary/20"
            >
              <div className="flex items-center gap-2 text-sm text-olivePrimary">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-olivePrimary"></div>
                <span>جاري تحديث الدور...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default RoleSwitcher;
