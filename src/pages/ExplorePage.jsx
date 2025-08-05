import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Filter, ArrowRight, ArrowLeft, ListFilter, LayoutGrid, X, Mail, MapPin, Search, Palette, HandMetal, Gift, Shirt, Image, Utensils, Sparkles, Home, Scissors, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { apiFetch } from '@/lib/api';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WishlistButton from '@/components/ui/WishlistButton';

// Helper function to get category icon based on backend icon name
const getCategoryIcon = (iconName) => {
  switch (iconName?.toLowerCase()) {
    case 'gem': 
    case 'gift': return Gift;
    case 'coffee': 
    case 'handmetal': return HandMetal;
    case 'scissors': 
    case 'palette': return Palette;
    case 'shirt': 
    case 'clothes': return Shirt;
    case 'image': 
    case 'camera': return Image;
    case 'utensils': 
    case 'food': return Utensils;
    case 'sparkles': 
    case 'jewelry': return Sparkles;
    case 'home': 
    case 'house': return Home;
    case 'wrench': 
    case 'tools': return Wrench;
    default: return Star;
  }
};

// Legacy function for name-based icon determination (keep as fallback)
const getCategoryIconByName = (categoryName) => {
  const name = categoryName?.toLowerCase() || '';
  
  if (name.includes('ملابس') || name.includes('خياطة') || name.includes('clothes') || name.includes('fashion')) {
    return Shirt;
  } else if (name.includes('مجوهرات') || name.includes('اكسسوارات') || name.includes('jewelry') || name.includes('accessories')) {
    return Sparkles;
  } else if (name.includes('طعام') || name.includes('طبخ') || name.includes('food') || name.includes('cooking')) {
    return Utensils;
  } else if (name.includes('فن') || name.includes('رسم') || name.includes('تصميم') || name.includes('art') || name.includes('design')) {
    return Palette;
  } else if (name.includes('حرف') || name.includes('يدوي') || name.includes('craft') || name.includes('handmade')) {
    return HandMetal;
  } else if (name.includes('هدايا') || name.includes('gift') || name.includes('تذكار')) {
    return Gift;
  } else if (name.includes('تصوير') || name.includes('صور') || name.includes('photo') || name.includes('image')) {
    return Image;
  } else if (name.includes('ديكور') || name.includes('منزل') || name.includes('home') || name.includes('decor')) {
    return Home;
  } else if (name.includes('خياطة') || name.includes('تفصيل') || name.includes('sewing') || name.includes('tailoring')) {
    return Scissors;
  } else if (name.includes('صيانة') || name.includes('إصلاح') || name.includes('repair') || name.includes('maintenance')) {
    return Wrench;
  } else {
    return Star; // Default icon
  }
};

// Helper to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return `${baseUrl}/storage/${imagePath}`;
};

// Category Item Component
const CategoryItem = ({ category, isSelected, onClick }) => {
  const [imageError, setImageError] = useState(false);
  
  // Use backend icon first, fallback to name-based icon determination
  let IconComponent;
  if (category.icon) {
    IconComponent = getCategoryIcon(category.icon);
  } else {
    IconComponent = getCategoryIconByName(category.name);
  }
  
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex-shrink-0 cursor-pointer transition-all duration-300 ${
        isSelected ? 'transform scale-105' : 'hover:scale-105'
      }`}
    >
      <div className={`w-24 h-24 md:w-28 md:h-28 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 overflow-hidden ${
        isSelected
          ? 'bg-roman-500 text-white shadow-lg'
          : 'bg-neutral-100 hover:bg-roman-500/10 border border-roman-500/20'
      }`}>
        {category.image && !imageError ? (
          <img 
            src={getImageUrl(category.image)} 
            alt={category.name}
            className="w-full h-full object-cover rounded-xl"
            onError={handleImageError}
          />
        ) : (
          <IconComponent className="w-8 h-8 md:w-10 md:h-10" />
        )}
      </div>
      <p className={`text-sm md:text-base font-medium text-center transition-colors duration-300 max-w-24 md:max-w-28 truncate ${
        isSelected ? 'text-roman-500' : 'text-neutral-900'
      }`}>
        {category.name}
      </p>
    </motion.div>
  );
};

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'products');
  const [gigs, setGigs] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [quickSearchTerm, setQuickSearchTerm] = useState(searchParams.get('search') || ''); // New state for mobile quick search
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Add dir="rtl" to root element once component mounts
  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    
    // Cleanup when component unmounts
    return () => {
      document.documentElement.removeAttribute('dir');
      // Clear search timeout on unmount
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  useEffect(() => {
    apiFetch('listcategories')
      .then(data => {
        // Normalize categories data to include icon field from backend
        const normalized = Array.isArray(data.data) 
          ? data.data.map(cat => ({
              id: cat.id,
              name: cat.name || cat.title || cat.label,
              icon: cat.icon || cat.iconName || 'star',
              image: cat.image
            }))
          : Array.isArray(data)
          ? data.map(cat => ({
              id: cat.id,
              name: cat.name || cat.title || cat.label,
              icon: cat.icon || cat.iconName || 'star',
              image: cat.image
            }))
          : [];
        setCategories(normalized);
      })
      .catch(() => setCategories([]));
  }, []);

  // Ensure selectedCategory is always a string (id) and matches the dropdown after searchParams change
  useEffect(() => {
    if (categories.length === 0) return; // Wait for categories

    const tab = searchParams.get('tab') || 'products';
    const query = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const type = searchParams.get('type') || 'all';
    const minPrice = parseInt(searchParams.get('minPrice')) || 0;
    const maxPrice = parseInt(searchParams.get('maxPrice')) || 1000;
    const rating = parseInt(searchParams.get('rating')) || 0;
    const sort = searchParams.get('sort') || 'relevance';

    setActiveTab(tab);
    setSearchTerm(query);
    setQuickSearchTerm(query); // Update quick search term from URL
    // If the category param is a name, convert to id; otherwise use as is
    let selectedCat = category;
    if (category !== 'all' && categories.length > 0) {
      const found = categories.find(cat => String(cat.id) === String(category) || cat.name === category);
      if (found) selectedCat = String(found.id);
      else selectedCat = 'all'; // fallback if not found
    }
    setSelectedCategory(selectedCat);
    setSelectedType(type);
    setPriceRange([minPrice, maxPrice]);
    setMinRating(rating);
    setSortBy(sort);

    setLoading(true);
    setError(null);

    // Helper to normalize product data
    const normalizeProduct = (prod) => {
      // Try to get category id from product
      let categoryId = prod.category_id || prod.category?.id || prod.category;
      // Find the category object from categories array
      let categoryObj = categories.find(cat => cat.id === categoryId);
      // If backend sent a category object, prefer it
      if (prod.category && typeof prod.category === 'object' && prod.category.name) {
        categoryObj = prod.category;
      }
      return {
        id: prod.id,
        title: prod.title,
        description: prod.description,
        price: prod.price,
        images: Array.isArray(prod.images) && prod.images.length > 0
          ? prod.images.map(img => img.url || img.image_url)
          : [],
        category: categoryObj ? { id: categoryObj.id, name: categoryObj.name } : { id: categoryId, name: categoryId },
        rating: prod.rating || 0,
        reviewCount: prod.reviewCount || prod.review_count || 0,
        sellerId: prod.sellerId || prod.seller_id || prod.seller?.id,
        type: prod.type || 'product',
      };
    };

    // Helper to normalize seller data
    const normalizeSeller = (seller) => ({
      id: seller.id,
      name: seller.name || '',
      avatar: seller.avatar || '',
      skills: seller.skills || [],
      rating: seller.rating || 0,
      reviewCount: seller.reviewCount || seller.review_count || 0,
      bio: seller.bio || '',
      location: seller.location || '',
      memberSince: seller.memberSince || '',
      completedOrders: seller.completedOrders || 0,
    });

    if (tab === 'products') {
      // Build query params for products
      let params = [];
      if (query) params.push(`search=${encodeURIComponent(query)}`);
      // Always send the category id (not name) if a category is selected
      if (category !== 'all') {
        let categoryId = category;
        // If category is a name, convert to id
        const found = categories.find(cat => cat.id === category || cat.name === category);
        if (found) categoryId = found.id;
        params.push(`category=${encodeURIComponent(categoryId)}`);
      }
      if (type !== 'all') params.push(`type=${encodeURIComponent(type)}`);
      if (minPrice > 0) params.push(`min_price=${minPrice}`);
      if (maxPrice < 1000) params.push(`max_price=${maxPrice}`);
      if (rating > 0) params.push(`min_rating=${rating}`);
      if (sort && sort !== 'relevance') params.push(`sort=${sort}`);
      const url = `explore/products?${params.join('&')}`;
      apiFetch(url)
        .then(data => {
          setGigs(Array.isArray(data.data) ? data.data.map(normalizeProduct) : []);
          setLoading(false);
        })
        .catch(() => {
          setGigs([]);
          setError('تعذر تحميل المنتجات');
          setLoading(false);
        });
    } else if (tab === 'sellers') {
      // Build query params for sellers
      let params = [];
      if (query) params.push(`search=${encodeURIComponent(query)}`);
      if (category !== 'all') {
        let categoryId = category;
        const found = categories.find(cat => cat.id === category || cat.name === category);
        if (found) categoryId = found.id;
        params.push(`category=${encodeURIComponent(categoryId)}`);
      }
      if (rating > 0) params.push(`min_rating=${rating}`);
      if (sort && sort !== 'relevance') params.push(`sort=${sort}`);
      const url = `explore/sellers?${params.join('&')}`;
      apiFetch(url)
        .then(data => {
          setSellers(Array.isArray(data.data) ? data.data.map(normalizeSeller) : []);
          setLoading(false);
        })
        .catch(() => {
          setSellers([]);
          setError('تعذر تحميل الحرفيين');
          setLoading(false);
        });
    }
  }, [searchParams, categories]);

  const handleFilterChange = () => {
    const params = new URLSearchParams();
    params.set('tab', activeTab);
    if (searchTerm) params.set('search', searchTerm);
    // Always send the category id (not name or object)
    if (selectedCategory !== 'all') {
      // If selectedCategory is an object, extract id, else use as is
      const categoryId = typeof selectedCategory === 'object' ? selectedCategory.id : selectedCategory;
      params.set('category', categoryId);
    }
    if (selectedType !== 'all') params.set('type', selectedType);
    if (activeTab === 'products') {
      params.set('minPrice', priceRange[0]);
      params.set('maxPrice', priceRange[1]);
    }
    
    if (minRating > 0) params.set('rating', minRating);
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    setSearchParams(params);
    
    // Auto-close mobile filter after applying
    setIsFiltersOpen(false);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    
    // Immediately update URL params with new sort value
    const params = new URLSearchParams(searchParams);
    params.set('tab', activeTab);
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory !== 'all') {
      const categoryId = typeof selectedCategory === 'object' ? selectedCategory.id : selectedCategory;
      params.set('category', categoryId);
    }
    if (selectedType !== 'all') params.set('type', selectedType);
    if (activeTab === 'products') {
      params.set('minPrice', priceRange[0]);
      params.set('maxPrice', priceRange[1]);
    }
    if (minRating > 0) params.set('rating', minRating);
    if (value !== 'relevance') params.set('sort', value);
    else params.delete('sort');
    
    setSearchParams(params);
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setQuickSearchTerm(''); // Reset quick search term too
    setSelectedCategory('all');
    setSelectedType('all');
    setPriceRange([0, 1000]);
    setMinRating(0);
    setSortBy('relevance');
    setSearchParams({ tab: activeTab });
    
    // Auto-close mobile filter after resetting
    setIsFiltersOpen(false);
  };

  // Handle quick search with debouncing
  const handleQuickSearch = (value) => {
    setQuickSearchTerm(value);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      setSearchTerm(value); // Sync with main search term
      
      // Update URL params after debounce
      const params = new URLSearchParams(searchParams);
      params.set('tab', activeTab);
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      setSearchParams(params);
    }, 500); // 500ms debounce
    
    setSearchTimeout(newTimeout);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    setSearchParams(params);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams(searchParams);
    params.set('tab', activeTab);
    
    if (categoryId === 'all') {
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }
    
    // Keep other existing params
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    if (selectedType !== 'all') {
      params.set('type', selectedType);
    }
    if (priceRange[0] !== 0) {
      params.set('minPrice', priceRange[0]);
    }
    if (priceRange[1] !== 1000) {
      params.set('maxPrice', priceRange[1]);
    }
    if (minRating > 0) {
      params.set('rating', minRating);
    }
    if (sortBy !== 'relevance') {
      params.set('sort', sortBy);
    }
    
    setSearchParams(params);
  };

  const GigCard = ({ gig }) => {
    // Find category name from gig.category object if present
    let categoryName = gig.category && gig.category.name ? gig.category.name : null;
    if (!categoryName) {
      const categoryObj = categories.find(cat => cat.id === (gig.category_id || gig.category?.id || gig.category));
      categoryName = categoryObj ? categoryObj.name : (gig.category_id || gig.category?.id || gig.category);
    }

    return (
      <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-62 card-hover border-roman-500/20" dir="rtl">
        <div className="relative h-56">
          <img 
            src={gig.images && gig.images.length > 0 
              ? gig.images[0] 
              : "https://images.unsplash.com/photo-1680188700662-5b03bdcf3017"} 
            alt={gig.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Badge variant="secondary" className="bg-roman-500 text-white">{categoryName}</Badge>
          </div>
          <div className="absolute top-2 left-2">
            <WishlistButton productId={gig.id} size="md" />
          </div>
          <div className="absolute bottom-2 right-2 flex flex-col gap-1">
            <Badge variant="outline" className={`text-xs ${gig.type === 'gig' ? 'bg-warning-500/50 text-white border-warning-500' : 'bg-blue-100 text-blue-600 border-blue-300'}`}>
              {gig.type === 'gig' ? 'خدمة مخصصة' : 'منتج جاهز'}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-2 text-right p-2">
          <CardTitle className="text-sm font-semibold text-neutral-900 overflow-hidden relative group cursor-pointer">
            <div 
              className={`whitespace-nowrap transition-all duration-300 hover:scale-105 hover:text-roman-500 ${gig.title.length > 25 ? 'animate-scroll' : ''}`}
              style={{ animationDuration: `${Math.max(3, gig.title.length * 0.2)}s` }}
            >
              {gig.title}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow text-right p-2">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center text-neutral-900/70">
              <Star className="h-3 w-3 text-warning-500 ml-1" />
              <span className="whitespace-nowrap">{gig.rating} ({gig.reviewCount})</span>
            </div>
            <p className="text-sm font-bold text-roman-500 whitespace-nowrap">{gig.price} ج</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-start p-2">
          <Button asChild className="w-full bg-warning-500 hover:bg-warning-500/90 text-white text-xs">
            <Link to={`/gigs/${gig.id}`} className="whitespace-nowrap">
              عرض التفاصيل
              <ArrowLeft className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  };
  const GigListItem = ({ gig }) => {
    // Find category name from gig.category object if present
    let categoryName = gig.category && gig.category.name ? gig.category.name : null;
    if (!categoryName) {
      const categoryObj = categories.find(cat => cat.id === (gig.category_id || gig.category?.id || gig.category));
      categoryName = categoryObj ? categoryObj.name : (gig.category_id || gig.category?.id || gig.category);
    }
    
    return (      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row card-hover border-roman-500/20 w-full" dir="rtl">
        <div className="relative md:w-1/3 h-56 md:h-auto">
          <img 
            src={gig.images && gig.images.length > 0 
              ? gig.images[0] 
              : "https://images.unsplash.com/photo-1680188700662-5b03bdcf3017"} 
            alt={gig.title} 
            className="w-full h-full max-h-56 object-cover" 
          />
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Badge variant="secondary" className="bg-roman-500 text-white">{categoryName}</Badge>
          </div>
          <div className="absolute top-2 left-2">
            <WishlistButton productId={gig.id} size="md" />
          </div>
          <div className="absolute bottom-2 right-2 flex flex-col gap-1">
          <Badge variant="outline" className={`text-xs ${gig.type === 'gig' ? 'bg-warning-500/50 text-warning-500 border-warning-500' : 'bg-blue-10 text-blue-600 border-blue-300'}`}>
              {gig.type === 'gig' ? 'خدمة مخصصة' : 'منتج جاهز'}
            </Badge>
          </div>
        </div>
        <div className="md:w-2/3 flex flex-col">
          <CardHeader className="pb-2 text-right">
            <CardTitle className="text-lg font-semibold text-neutral-900 cursor-pointer transition-all duration-300 hover:scale-105 hover:text-roman-500">{gig.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow text-right">
            <p className="text-sm text-neutral-900/70 mb-2 line-clamp-2">{gig.description}</p>
            <div className="flex items-center text-sm text-neutral-900/70 mb-2">
              <Star className="h-4 w-4 text-warning-500 ml-1" />
              {gig.rating} ({gig.reviewCount} تقييمات)
            </div>
            <p className="text-xl font-bold text-roman-500 mb-2">{gig.price} جنيه</p>
          </CardContent>
          <CardFooter className="flex">
            <Button asChild className="w-full md:w-auto bg-warning-500 hover:bg-warning-500/90 text-white">
              <Link to={`/gigs/${gig.id}`}>
                عرض التفاصيل
                <ArrowLeft className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </div>
      </Card>
    );
  };
  const SellerCard = ({ seller }) => (
    <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full card-hover border-neutral-200/50" dir="rtl">
      <div className="relative h-48 bg-roman-500 flex items-center justify-center">
        {seller.avatar ? (
          <img 
            src={seller.avatar} 
            alt={seller.name}
            className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-warning-500 shadow-md">
            {seller.name.charAt(0)}
          </div>
        )}
      </div>
      <CardHeader className="pb-2 text-right">
        <CardTitle className="text-lg font-semibold text-gray-800 cursor-pointer transition-all duration-300 hover:scale-105 hover:text-roman-500">{seller.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-right">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin className="h-4 w-4 text-gray-400 ml-1" />
          <span>{seller.location}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Star className="h-4 w-4 text-yellow-500 ml-1" />
          {seller.rating} ({seller.reviewCount} تقييمات)
        </div>
        <div className="mt-2 text-right">
          {seller.skills.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="outline" className="ml-1 mb-1 border-roman-500/30 bg-success-100/10">
              {skill}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{seller.bio}</p>
      </CardContent>
      <CardFooter className="flex gap-2 flex-row-reverse">
        <Button asChild className="flex-1 bg-warning-500 hover:bg-warning-500/90 text-white">
          <Link to={`/sellers/${seller.id}`}>
            عرض الملف
            <ArrowLeft className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-10 p-0 flex-none">
          <Link to={`/message/${seller.id}`}>
            <Mail className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
  const SellerListItem = ({ seller }) => (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row card-hover border-roman-500/20 w-full" dir="rtl">
      <div className="relative md:w-1/4 h-48 md:h-auto bg-roman-500 flex items-center justify-center">
        {seller.avatar ? (
          <img 
            src={seller.avatar} 
            alt={seller.name}
            className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-roman-500 shadow-md">
            {seller.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="md:w-3/4 flex flex-col">
        <CardHeader className="pb-2 text-right">
          <CardTitle className="text-lg font-semibold text-neutral-900 cursor-pointer transition-all duration-300 hover:scale-105 hover:text-roman-500">{seller.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow text-right">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
            <div className="flex items-center text-sm text-neutral-900/70 mb-2 md:mb-0">
              <MapPin className="h-4 w-4 text-roman-500/60 ml-1" />
              <span>{seller.location}</span>
            </div>
            <div className="flex items-center text-sm text-neutral-900/70">
              <Star className="h-4 w-4 text-warning-500 ml-1" />
              {seller.rating} ({seller.reviewCount} تقييمات)
            </div>
          </div>
          <p className="text-sm text-neutral-900/70 mb-2">{seller.bio}</p>
          <div className="mt-2">
            {seller.skills.map((skill, index) => (
              <Badge key={index} variant="outline" className="ml-1 mb-1 border-roman-500/30 text-neutral-900">
                {skill}
              </Badge>
            ))}
          </div>          <div className="text-sm text-neutral-900/70 mt-2 text-right">
            <span className="font-semibold">عضو منذ:</span> {new Date(seller.memberSince).toLocaleDateString('ar-EG')} <span className="mx-2">|</span> 
            <span className="font-semibold">طلبات مكتملة:</span> {seller.completedOrders}
          </div>
        </CardContent>
        <CardFooter className="flex flex-row-reverse">
          <Button asChild className="bg-warning-500 hover:bg-warning-500/90 text-white ml-2">
            <Link to={`/sellers/${seller.id}`}>
              عرض الملف
              <ArrowLeft className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-roman-500/50 text-roman-500 hover:bg-roman-500 hover:text-white">
            <Link to={`/message/${seller.id}`}>
              <Mail className="ml-2 h-4 w-4" />
              تواصل مع البائع
            </Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      {/* Categories Slider Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            {activeTab === 'products' ? 'استكشف التصنيفات' : 'تصنيفات الحرفيين'}
          </h2>
          <p className="text-roman-500">
            {activeTab === 'products' 
              ? 'اختر التصنيف المناسب لإيجاد ما تبحث عنه' 
              : 'استكشف مختلف تخصصات الحرفيين'}
          </p>
        </div>
        
        {/* Categories Horizontal Scroll */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* All Categories Option */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange('all')}
              className={`flex-shrink-0 cursor-pointer transition-all duration-300 ${
                selectedCategory === 'all' 
                  ? 'transform scale-105' 
                  : 'hover:scale-105'
              }`}
            >
              <div className={`w-24 h-24 md:w-28 md:h-28 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-roman-500 text-white shadow-lg'
                  : 'bg-neutral-100 hover:bg-roman-500/10 border border-roman-500/20'
              }`}>
                <LayoutGrid className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <p className={`text-sm md:text-base font-medium text-center transition-colors duration-300 ${
                selectedCategory === 'all'
                  ? 'text-roman-500'
                  : 'text-neutral-900'
              }`}>
                جميع التصنيفات
              </p>
            </motion.div>

            {/* Categories from API */}
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                isSelected={selectedCategory === String(category.id)}
                onClick={() => handleCategoryChange(String(category.id))}
              />
            ))}
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full mb-6">
        <TabsList className="w-full grid grid-cols-2 mb-6 bg-neutral-100">
          <TabsTrigger value="products" className="text-lg data-[state=active]:bg-roman-500 data-[state=active]:text-white">المنتجات</TabsTrigger>
          <TabsTrigger value="sellers" className="text-lg data-[state=active]:bg-roman-500 data-[state=active]:text-white">الحرفيين</TabsTrigger>
        </TabsList>

        {/* Mobile Quick Search - Always visible on mobile */}
        <div className="mb-4 md:hidden">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-roman-500/60" />
            <Input
              type="text"
              value={quickSearchTerm}
              onChange={(e) => handleQuickSearch(e.target.value)}
              placeholder={activeTab === 'products' ? 'بحث سريع في المنتجات...' : 'بحث سريع في الحرفيين...'}
              className="pl-10 pr-12 border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20 text-right text-base h-12 bg-white shadow-sm"
              dir="rtl"
            />
            {quickSearchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuickSearch('')}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-roman-500/60 hover:text-roman-500 hover:bg-roman-500/10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
          <TabsContent value="products" className="mt-0">          <div className="flex flex-col md:flex-row-reverse gap-8">
            {/* Filters Sidebar */}
            <motion.aside 
              className={`md:w-1/4 ${isFiltersOpen ? 'block' : 'hidden'} md:block fixed inset-0 z-40 bg-white p-6 md:relative md:bg-transparent md:p-0 md:z-auto transition-transform duration-300 ease-in-out transform ${isFiltersOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
              initial={{ x: -200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-lg border-roman-500/20">
                <CardHeader className="flex flex-row-reverse items-center justify-between">
                  <CardTitle className="text-xl text-roman-500 text-right">تصفية النتائج</CardTitle>
                  <Button variant="ghost" size="icon" className="md:hidden hover:bg-success-100/50 text-roman-500" onClick={() => setIsFiltersOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="search-filter" className="text-neutral-900 block text-right">بحث بالاسم</Label>                    <Input 
                      id="search-filter" 
                      type="text" 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      placeholder="اسم المنتج، وصف..." 
                      className="mt-1 border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20 text-right"
                      dir="rtl"
                    />
                  </div>                  <div>
                    <Label htmlFor="category-filter" className="text-neutral-900 block text-right">التصنيف</Label>
                    <Select value={selectedCategory} onValueChange={value => handleCategoryChange(String(value))} dir="rtl">
                      <SelectTrigger id="category-filter" className="mt-1 border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20 text-right">
                        <SelectValue placeholder="اختر تصنيف" />
                      </SelectTrigger>
                      <SelectContent className="border-roman-500/30 text-right" dir="rtl">
                        <SelectItem value="all">كل التصنيفات</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type-filter" className="text-neutral-900 block text-right">نوع المنتج</Label>
                    <Select value={selectedType} onValueChange={value => setSelectedType(String(value))} dir="rtl">
                      <SelectTrigger id="type-filter" className="mt-1 border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20 text-right">
                        <SelectValue placeholder="اختر نوع المنتج" />
                      </SelectTrigger>
                      <SelectContent className="border-roman-500/30 text-right" dir="rtl">
                        <SelectItem value="all">كل الأنواع</SelectItem>
                        <SelectItem value="product">منتجات جاهزة</SelectItem>
                        <SelectItem value="gig">خدمات مخصصة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-neutral-900 block text-right">نطاق السعر: {priceRange[0]} - {priceRange[1]} جنيه</Label>
                    <Slider
                      defaultValue={priceRange}
                      min={0}
                      max={1000}
                      step={50}
                      onValueChange={setPriceRange}
                      className="mt-2 [&>span:first-child]:h-1 [&>span:first-child]:bg-roman-500/20 [&_[role=slider]]:bg-roman-500 [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:border-2 [&_[role=slider]]:border-neutral-200"
                    />
                  </div>
                  <div>
                    <Label className="text-neutral-900 block text-right">التقييم الأدنى: {minRating} نجوم</Label>
                    <div className="flex space-x-1 space-x-reverse mt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Button 
                          key={star} 
                          variant={minRating >= star ? "default" : "outline"} 
                          size="icon" 
                          onClick={() => setMinRating(star === minRating ? 0 : star)}
                          className={`p-2 ${minRating >= star ? 'bg-warning-500 border-warning-500 hover:bg-warning-500/90' : 'border-roman-500/30'}`}
                        >
                          <Star className={`h-5 w-5 ${minRating >= star ? 'text-white' : 'text-warning-500'}`} />
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Separator />                  <Button onClick={handleFilterChange} className="w-full bg-warning-500 hover:bg-warning-500/90 text-white">
                    <Filter className="ml-2 h-4 w-4" /> تطبيق الفلاتر
                  </Button>
                  <Button onClick={resetFilters} variant="outline" className="w-full border-roman-500/50 text-roman-500 hover:bg-roman-500 hover:text-white">
                    إعادة تعيين الفلاتر
                  </Button>
                </CardContent>
              </Card>
            </motion.aside>

            {/* Gigs List */}
            <main className="w-full md:w-3/4">
              <div className="flex items-center justify-between mb-6">
                <p className="text-neutral-900/70">تم العثور على {gigs.length} منتج</p>                <div className="flex items-center gap-2">                  <Button variant="outline" size="icon" className="md:hidden ml-2 border-roman-500/50 text-roman-500 hover:bg-roman-500 hover:text-white" onClick={() => setIsFiltersOpen(true)}>
                    <Filter className="h-5 w-5" />
                  </Button>                  <Select value={sortBy} onValueChange={handleSortChange} dir="rtl">
                    <SelectTrigger className="w-[180px] border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20 text-right">
                      <SelectValue placeholder="الترتيب حسب" />
                    </SelectTrigger>
                    <SelectContent className="border-roman-500/30 text-right" dir="rtl">
                      <SelectItem value="relevance">الأكثر صلة</SelectItem>
                      <SelectItem value="price_low">السعر: من الأقل للأعلى</SelectItem>
                      <SelectItem value="price_high">السعر: من الأعلى للأقل</SelectItem>
                      <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                      <SelectItem value="newest">الأحدث</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" className="border-roman-500/50 text-roman-500 hover:bg-roman-500 hover:text-white" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                    {viewMode === 'grid' ? <ListFilter className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-lg text-neutral-900">جاري تحميل المنتجات...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-lg text-red-500">{error}</p>
                </div>              ) : gigs.length > 0 ? (
                <motion.div 
                  className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2 rtl" : "space-y-6"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  dir="rtl"
                >
                  {gigs.map((gig, index) => (
                    <motion.div
                      key={gig.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      {viewMode === 'grid' ? <GigCard gig={gig} /> : <GigListItem gig={gig} />}
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <img src="https://images.unsplash.com/photo-1675023112817-52b789fd2ef0" alt="لا توجد نتائج" className="mx-auto mb-4 w-48 h-48 text-gray-400" />
                  <h3 className="text-2xl font-semibold text-neutral-900 mb-2">لا توجد منتجات تطابق بحثك</h3>
                  <p className="text-neutral-900/70">حاول تعديل الفلاتر أو البحث بكلمات أخرى.</p>
                </div>
              )}
            </main>
          </div>
        </TabsContent>
          <TabsContent value="sellers" className="mt-0">          
            <div className="flex flex-col md:flex-row-reverse gap-8">
            {/* Sellers Filters Sidebar */}
            <motion.aside 
              className={`md:w-1/4 ${isFiltersOpen ? 'block' : 'hidden'} md:block fixed inset-0 z-40 bg-white p-6 pt-15 md:relative md:bg-transparent md:p-0 md:z-auto transition-transform duration-300 ease-in-out transform ${isFiltersOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
              initial={{ x: -200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-lg border-roman-500/20">
                <CardHeader className="flex flex-row-reverse items-center justify-between">
                  <CardTitle className="text-xl text-roman-500 text-right">تصفية النتائج</CardTitle>
                  <Button variant="ghost" size="icon" className="md:hidden hover:bg-success-100/50 text-roman-500" onClick={() => setIsFiltersOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="search-filter-sellers" className="text-neutral-900 block text-right">بحث بالاسم أو المهارات</Label>                    <Input 
                      id="search-filter-sellers" 
                      type="text" 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      placeholder="اسم الحرفي، المهارات..." 
                      className="mt-1 border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20 text-right"
                      dir="rtl"
                    />
                  </div>                  <div>
                    <Label htmlFor="category-filter-sellers" className="text-neutral-900 block text-right">التخصص</Label>
                    <Select value={selectedCategory} onValueChange={value => handleCategoryChange(String(value))} dir="rtl">
                      <SelectTrigger id="category-filter-sellers" className="mt-1 border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20 text-right">
                        <SelectValue placeholder="اختر تخصص" />
                      </SelectTrigger>
                      <SelectContent className="border-roman-500/30 text-right" dir="rtl">
                        <SelectItem value="all">كل التخصصات</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 block text-right">التقييم الأدنى: {minRating} نجوم</Label>
                    <div className="flex space-x-1 space-x-reverse mt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Button 
                          key={star} 
                          variant={minRating >= star ? "default" : "outline"} 
                          size="icon" 
                          onClick={() => setMinRating(star === minRating ? 0 : star)}
                          className={`p-2 ${minRating >= star ? 'bg-yellow-400 border-yellow-400 hover:bg-yellow-500' : 'border-gray-300'}`}
                        >
                          <Star className={`h-5 w-5 ${minRating >= star ? 'text-white' : 'text-yellow-400'}`} />
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Separator />                  <Button onClick={handleFilterChange} className="w-full bg-roman-500 hover:bg-roman-500/90 text-white">
                    <Filter className="ml-2 h-4 w-4" /> تطبيق الفلاتر
                  </Button>
                  <Button onClick={resetFilters} variant="outline" className="w-full text-neutral-900 border-roman-500/30 hover:bg-success-100/30">
                    إعادة تعيين الفلاتر
                  </Button>
                </CardContent>
              </Card>
            </motion.aside>

            {/* Sellers List */}
            <main className="w-full md:w-3/4">
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">تم العثور على {sellers.length} حرفي</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="md:hidden ml-2" onClick={() => setIsFiltersOpen(true)}>
                    <Filter className="h-5 w-5" />
                  </Button>                  <Select value={sortBy} onValueChange={handleSortChange} dir="rtl">
                    <SelectTrigger className="w-[180px] text-right">
                      <SelectValue placeholder="الترتيب حسب" />
                    </SelectTrigger>
                    <SelectContent className="text-right" dir="rtl">
                      <SelectItem value="relevance">الأكثر صلة</SelectItem>
                      <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                      <SelectItem value="experience">الأكثر خبرة</SelectItem>
                      <SelectItem value="newest">الأحدث</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                    {viewMode === 'grid' ? <ListFilter className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-lg text-neutral-900">جاري تحميل الحرفيين...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-lg text-red-500">{error}</p>
                </div>              ) : sellers.length > 0 ? (
                <motion.div 
                  className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 rtl" : "space-y-6"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  dir="rtl"
                >
                  {sellers.map((seller, index) => (
                    <motion.div
                      key={seller.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      {viewMode === 'grid' ? <SellerCard seller={seller} /> : <SellerListItem seller={seller} />}
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <img src="https://images.unsplash.com/photo-1675023112817-52b789fd2ef0" alt="لا توجد نتائج" className="mx-auto mb-4 w-48 h-48 text-gray-400" />
                  <h3 className="text-2xl font-semibold text-gray-700 mb-2">لا يوجد حرفيين يطابقون بحثك</h3>
                  <p className="text-gray-500">حاول تعديل الفلاتر أو البحث بكلمات أخرى.</p>
                </div>
              )}
            </main>
          </div>
        </TabsContent>
      </Tabs>
      
      {isFiltersOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsFiltersOpen(false)}></div>}
    </div>
  );
};

export default ExplorePage;
