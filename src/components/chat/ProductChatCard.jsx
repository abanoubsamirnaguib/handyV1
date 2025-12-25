import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DepositPaymentButton from './DepositPaymentButton';
import { useAuth } from '@/contexts/AuthContext';
import { assetUrl } from '@/lib/api';

const ProductChatCard = ({ 
  product, 
  sellerId, 
  conversationId,
  onPaymentSuccess,
  isFromConversation = false // New prop to handle conversation product data
}) => {
  const { user } = useAuth();
  
  if (!product) return null;
  
  // Handle different data structures
  const productData = isFromConversation ? {
    id: product.id,
    name: product.title,
    title: product.title,
    price: product.price,
    type: product.type,
    image: product.image,
  } : product;

  const formatPrice = (price) => {
    if (!price) return 'غير محدد';
    return `${parseFloat(price).toFixed(2)} جنيه`;
  };

  const getProductTypeLabel = (type) => {
    switch (type) {
      case 'product':
        return 'منتج';
      case 'gig':
        return 'خدمة';
      case 'service': // Keep backward compatibility
        return 'خدمة';
      default:
        return 'عنصر';
    }
  };

  const getImageUrl = (image) => {
    if (!image) return '/placeholder.jpg';
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    return assetUrl(image);
  };

  return (
    <Card className={`mb-3 w-full max-w-sm ${isFromConversation ? 'bg-blue-50/50 border-blue-200' : ''}`}>
      <CardContent className="p-3">
        <div className="flex gap-3 items-start">
          {/* Image on the right */}
          {productData.image && (
            <div className="flex-shrink-0">
              <img 
                src={isFromConversation ? getImageUrl(productData.image) : productData.image} 
                alt={productData.name || productData.title} 
                className="h-20 w-20 object-cover rounded-md border border-gray-200"
                onError={(e) => {
                  e.target.src = '/placeholder.jpg';
                }}
              />
            </div>
          )}
          
          {/* Content beside image */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                {productData.name || productData.title}
              </h3>
              <Badge variant="outline" className="text-xs flex-shrink-0 bg-blue-50 text-blue-700 border-blue-200">
                {isFromConversation ? getProductTypeLabel(productData.type) : (productData.category || 'منتج')}
              </Badge>
            </div>
            
            <div className="text-base font-bold text-green-600 mt-1">
              {isFromConversation ? formatPrice(productData.price) : `${productData.price} جنيه`}
            </div>
            
            {!isFromConversation && user && user.role !== 'seller' && (
              <div className="mt-2">
                <DepositPaymentButton
                  productId={productData.id}
                  sellerId={sellerId}
                  conversationId={conversationId}
                  productTitle={productData.name || productData.title}
                  productPrice={productData.price}
                  onPaymentSuccess={onPaymentSuccess}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductChatCard;
