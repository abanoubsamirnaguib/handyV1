import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import DepositPaymentButton from './DepositPaymentButton';
import { useAuth } from '@/contexts/AuthContext';

const ProductChatCard = ({ 
  product, 
  sellerId, 
  conversationId,
  onPaymentSuccess
}) => {
  const { user } = useAuth();
  
  if (!product) return null;
  
  return (
    <Card className="mb-4 w-full max-w-md mx-auto">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {product.category}
          </Badge>
        </div>
        <CardDescription dir="rtl">{product.description && product.description.substring(0, 100)}{product.description && product.description.length > 100 ? '...' : ''}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">السعر:</span>
            <span className="text-lg font-semibold block">{product.price} ريال</span>
          </div>
          
          {product.discount > 0 && (
            <Badge className="bg-red-100 text-red-700 border-red-200">
              خصم {product.discount}%
            </Badge>
          )}
        </div>
        
        {product.image && (
          <div className="mt-3 flex justify-center">
            <img 
              src={product.image} 
              alt={product.name} 
              className="h-32 w-auto object-cover rounded-md"
            />
          </div>
        )}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="pt-3 flex justify-between">
        <span className="text-sm text-gray-500">الكمية المتاحة: {product.quantity}</span>
        
        {user && user.role !== 'seller' && (
          <DepositPaymentButton
            productId={product.id}
            sellerId={sellerId}
            conversationId={conversationId}
            productTitle={product.name}
            productPrice={product.price}
            onPaymentSuccess={onPaymentSuccess}
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductChatCard;
