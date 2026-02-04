import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, ChevronLeft, ChevronRight, Star, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import WishlistButton from '@/components/ui/WishlistButton';
import { api } from '@/lib/api';
import { getStorageUrl } from '@/lib/assets';

const GiftSections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return `${baseUrl}/storage/${imagePath}`;
  };

  // Load gift sections
  useEffect(() => {
    const loadSections = async () => {
      try {
        const response = await api.getGiftSections();
        console.log('Gift Sections Response:', response); // Debug log
        if (response.data?.success) {
          setSections(response.data.data || []);
        } else if (response.data) {
          // Handle response without success flag
          setSections(response.data || []);
        }
      } catch (error) {
        console.error('Error loading gift sections:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSections();
  }, []);

  // Scroll handler for horizontal scroll
  const scrollContainer = (containerId, direction) => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-12">
        <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">لا توجد أقسام هدايا متاحة حالياً</p>
      </div>
    );
  }

  // Filter sections that have products
  const sectionsWithProducts = sections.filter(section => 
    section.products && section.products.length > 0
  );

  if (sectionsWithProducts.length === 0) {
    return null; // Don't show anything if no sections have products
  }

  return (
    <div className="space-y-12">
      {sectionsWithProducts.map((section) => {
        return (
        <div key={section.id} className="relative">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Gift className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {section.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {section.tags?.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Products Horizontal Scroll */}
          <div className="relative">
            {/* Scroll Buttons */}
            <Button
              variant="outline"
              size="icon"
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg"
              onClick={() => scrollContainer(`section-${section.id}`, 'right')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg"
              onClick={() => scrollContainer(`section-${section.id}`, 'left')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Products Container */}
            <div
              id={`section-${section.id}`}
              className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-2 py-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {section.products.map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -5 }}
                    className="flex-shrink-0 w-[calc(50%-0.5rem)] md:w-72"
                  >
                    <Link to={`/gigs/${product.id}`} className="block">
                      <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-62 card-hover cursor-pointer" dir="rtl">
                        <div className="relative h-56">
                          <img 
                            src={
                              product.images?.[0]
                                ? getStorageUrl(product.images[0].image_url || product.images[0])
                                : 'https://via.placeholder.com/300x200?text=No+Image'
                            }
                            alt={product.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="absolute top-2 right-2 flex flex-col gap-1">
                            {product.category && (
                              <Badge variant="secondary" className="bg-roman-500 text-white">
                                {product.category.name || product.category}
                              </Badge>
                            )}
                          </div>
                          <div className="absolute top-2 left-2" onClick={(e) => e.stopPropagation()}>
                            <div onClick={(e) => e.preventDefault()}>
                              <WishlistButton 
                                productId={product.id} 
                                inWishlist={product.in_wishlist} 
                                size="md" 
                              />
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 flex flex-col gap-1">
                            <Badge variant="outline" className={`text-xs ${product.type === 'gig' ? 'bg-warning-500/50 text-white border-warning-500' : 'bg-blue-100 text-blue-600 border-blue-300'}`}>
                              {product.type === 'gig' ? 'حرفة مخصصة' : 'منتج جاهز'}
                            </Badge>
                          </div>
                        </div>
                        <CardHeader className="pb-2 text-right p-1">
                          <CardTitle className="text-xs font-semibold text-neutral-900 transition-colors duration-300 hover:text-roman-500 line-clamp-2 h-8">
                            {product.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow text-right p-1">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <div className="flex items-center text-neutral-900/70">
                              <Star className="h-3 w-3 text-warning-500 ml-1" />
                              <span className="whitespace-nowrap">
                                {product.rating ? Number(product.rating).toFixed(1) : '0.0'} ({product.review_count || product.reviewCount || 0} طلب)
                              </span>
                            </div>
                            <p className="text-sm font-bold text-roman-500 whitespace-nowrap">
                              {product.type === 'gig' && (product.price === '0.00' || product.price === 0)
                                ? 'قابل للتفاوض'
                                : `${product.price} ج`}
                              {product.type === 'product' && product.quantity !== null && product.quantity !== undefined && (
                                <span className={`block text-xs mt-1 ${product.quantity === 0 ? 'text-red-600' : product.quantity < 5 ? 'text-orange-600' : 'text-gray-600'}`}>
                                  {product.quantity === 0 ? 'نفذت الكمية' : `متوفر: ${product.quantity}`}
                                </span>
                              )}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
        </div>
      );
      })}
    </div>
  );
};

export default GiftSections;
