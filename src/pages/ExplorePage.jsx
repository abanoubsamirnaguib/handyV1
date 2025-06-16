import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Filter, ArrowRight, ArrowLeft, ListFilter, LayoutGrid, X, Mail, MapPin } from 'lucide-react';
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

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'products');
  const [gigs, setGigs] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
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

  // Add dir="rtl" to root element once component mounts
  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    
    // Cleanup when component unmounts
    return () => {
      document.documentElement.removeAttribute('dir');
    };
  }, []);

  useEffect(() => {
    apiFetch('listcategories')
      .then(data => setCategories(data.data || data))
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
    setSelectedCategory('all');
    setSelectedType('all');
    setPriceRange([0, 1000]);
    setMinRating(0);
    setSortBy('relevance');
    setSearchParams({ tab: activeTab });
    
    // Auto-close mobile filter after resetting
    setIsFiltersOpen(false);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
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
      <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full card-hover border-olivePrimary/20" dir="rtl">
        <div className="relative h-56">
          <img 
            src={gig.images && gig.images.length > 0 
              ? gig.images[0] 
              : "https://images.unsplash.com/photo-1680188700662-5b03bdcf3017"} 
            alt={gig.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Badge variant="secondary" className="bg-olivePrimary text-white">{categoryName}</Badge>
          </div>
          <div className="absolute bottom-2 right-2 flex flex-col gap-1">
            <Badge variant="outline" className={`text-xs ${gig.type === 'gig' ? 'bg-burntOrange/50 text-white border-burntOrange' : 'bg-blue-100 text-blue-600 border-blue-300'}`}>
              {gig.type === 'gig' ? 'خدمة مخصصة' : 'منتج جاهز'}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-2 text-right">
          <CardTitle className="text-lg font-semibold text-darkOlive h-14 overflow-hidden">{gig.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow text-right">
          <div className="flex items-center text-sm text-darkOlive/70 mb-2">
            <Star className="h-4 w-4 text-burntOrange ml-1" />
            {gig.rating} ({gig.reviewCount} تقييمات)
          </div>
          <p className="text-xl font-bold text-olivePrimary mb-2">{gig.price} جنيه</p>
        </CardContent>
        <CardFooter className="flex justify-start">
          <Button asChild className="w-full bg-burntOrange hover:bg-burntOrange/90 text-white">
            <Link to={`/gigs/${gig.id}`}>
              عرض التفاصيل
              <ArrowLeft className="ml-2 h-4 w-4" />
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
    
    return (      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row card-hover border-olivePrimary/20 w-full" dir="rtl">
        <div className="relative md:w-1/3 h-56 md:h-auto">
          <img 
            src={gig.images && gig.images.length > 0 
              ? gig.images[0] 
              : "https://images.unsplash.com/photo-1680188700662-5b03bdcf3017"} 
            alt={gig.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Badge variant="secondary" className="bg-olivePrimary text-white">{categoryName}</Badge>
          </div>
          <div className="absolute bottom-2 right-2 flex flex-col gap-1">
          <Badge variant="outline" className={`text-xs ${gig.type === 'gig' ? 'bg-burntOrange/50 text-burntOrange border-burntOrange' : 'bg-blue-10 text-blue-600 border-blue-300'}`}>
              {gig.type === 'gig' ? 'خدمة مخصصة' : 'منتج جاهز'}
            </Badge>
          </div>
        </div>
        <div className="md:w-2/3 flex flex-col">
          <CardHeader className="pb-2 text-right">
            <CardTitle className="text-lg font-semibold text-darkOlive">{gig.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow text-right">
            <p className="text-sm text-darkOlive/70 mb-2 line-clamp-2">{gig.description}</p>
            <div className="flex items-center text-sm text-darkOlive/70 mb-2">
              <Star className="h-4 w-4 text-burntOrange ml-1" />
              {gig.rating} ({gig.reviewCount} تقييمات)
            </div>
            <p className="text-xl font-bold text-olivePrimary mb-2">{gig.price} جنيه</p>
          </CardContent>
          <CardFooter className="flex">
            <Button asChild className="w-full md:w-auto bg-burntOrange hover:bg-burntOrange/90 text-white">
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
    <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full card-hover border-lightBeige/50" dir="rtl">
      <div className="relative h-48 bg-olivePrimary flex items-center justify-center">
        <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-burntOrange shadow-md">
          {seller.name.charAt(0)}
        </div>
      </div>
      <CardHeader className="pb-2 text-right">
        <CardTitle className="text-lg font-semibold text-gray-800">{seller.name}</CardTitle>
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
            <Badge key={index} variant="outline" className="ml-1 mb-1 border-olivePrimary/30 bg-lightGreen/10">
              {skill}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{seller.bio}</p>
      </CardContent>
      <CardFooter className="flex gap-2 flex-row-reverse">
        <Button asChild className="flex-1 bg-burntOrange hover:bg-burntOrange/90 text-white">
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
  const SellerListItem = ({ seller }) => (    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row card-hover border-olivePrimary/20 w-full" dir="rtl">
      <div className="relative md:w-1/4 h-48 md:h-auto bg-olivePrimary flex items-center justify-center">
        <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-olivePrimary shadow-md">
          {seller.name.charAt(0)}
        </div>
      </div>
      <div className="md:w-3/4 flex flex-col">
        <CardHeader className="pb-2 text-right">
          <CardTitle className="text-lg font-semibold text-darkOlive">{seller.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow text-right">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
            <div className="flex items-center text-sm text-darkOlive/70 mb-2 md:mb-0">
              <MapPin className="h-4 w-4 text-olivePrimary/60 ml-1" />
              <span>{seller.location}</span>
            </div>
            <div className="flex items-center text-sm text-darkOlive/70">
              <Star className="h-4 w-4 text-burntOrange ml-1" />
              {seller.rating} ({seller.reviewCount} تقييمات)
            </div>
          </div>
          <p className="text-sm text-darkOlive/70 mb-2">{seller.bio}</p>
          <div className="mt-2">
            {seller.skills.map((skill, index) => (
              <Badge key={index} variant="outline" className="ml-1 mb-1 border-olivePrimary/30 text-darkOlive">
                {skill}
              </Badge>
            ))}
          </div>          <div className="text-sm text-darkOlive/70 mt-2 text-right">
            <span className="font-semibold">عضو منذ:</span> {new Date(seller.memberSince).toLocaleDateString('ar-EG')} <span className="mx-2">|</span> 
            <span className="font-semibold">طلبات مكتملة:</span> {seller.completedOrders}
          </div>
        </CardContent>
        <CardFooter className="flex flex-row-reverse">
          <Button asChild className="bg-burntOrange hover:bg-burntOrange/90 text-white ml-2">
            <Link to={`/sellers/${seller.id}`}>
              عرض الملف
              <ArrowLeft className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-olivePrimary/50 text-olivePrimary hover:bg-olivePrimary hover:text-white">
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 p-6 rounded-lg bg-olivePrimary text-white shadow-xl border border-lightBeige/20"
      >
        <h1 className="text-4xl font-bold mb-2">
          {activeTab === 'products' ? 'استكشف المنتجات اليدوية' : 'تعرف على أفضل الحرفيين'}
        </h1>
        <p className="text-lg text-lightBeige">
          {activeTab === 'products' 
            ? 'ابحث عن إبداعات فريدة من أفضل الحرفيين.' 
            : 'تواصل مع حرفيين محترفين لطلب منتجات مخصصة.'}
        </p>
      </motion.div>

      <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full mb-6">
        <TabsList className="w-full grid grid-cols-2 mb-6 bg-lightBeige">
          <TabsTrigger value="products" className="text-lg data-[state=active]:bg-olivePrimary data-[state=active]:text-white">المنتجات</TabsTrigger>
          <TabsTrigger value="sellers" className="text-lg data-[state=active]:bg-olivePrimary data-[state=active]:text-white">الحرفيين</TabsTrigger>
        </TabsList>
          <TabsContent value="products" className="mt-0">          <div className="flex flex-col md:flex-row-reverse gap-8">
            {/* Filters Sidebar */}
            <motion.aside 
              className={`md:w-1/4 ${isFiltersOpen ? 'block' : 'hidden'} md:block fixed inset-0 z-40 bg-white p-6 md:relative md:bg-transparent md:p-0 md:z-auto transition-transform duration-300 ease-in-out transform ${isFiltersOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
              initial={{ x: -200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-lg border-olivePrimary/20">
                <CardHeader className="flex flex-row-reverse items-center justify-between">
                  <CardTitle className="text-xl text-olivePrimary text-right">تصفية النتائج</CardTitle>
                  <Button variant="ghost" size="icon" className="md:hidden hover:bg-lightGreen/50 text-olivePrimary" onClick={() => setIsFiltersOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="search-filter" className="text-darkOlive block text-right">بحث بالاسم</Label>                    <Input 
                      id="search-filter" 
                      type="text" 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      placeholder="اسم المنتج، وصف..." 
                      className="mt-1 border-olivePrimary/30 focus:border-olivePrimary focus:ring-olivePrimary/20 text-right"
                      dir="rtl"
                    />
                  </div>                  <div>
                    <Label htmlFor="category-filter" className="text-darkOlive block text-right">التصنيف</Label>
                    <Select value={selectedCategory} onValueChange={value => setSelectedCategory(String(value))} dir="rtl">
                      <SelectTrigger id="category-filter" className="mt-1 border-olivePrimary/30 focus:border-olivePrimary focus:ring-olivePrimary/20 text-right">
                        <SelectValue placeholder="اختر تصنيف" />
                      </SelectTrigger>
                      <SelectContent className="border-olivePrimary/30 text-right" dir="rtl">
                        <SelectItem value="all">كل التصنيفات</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type-filter" className="text-darkOlive block text-right">نوع المنتج</Label>
                    <Select value={selectedType} onValueChange={value => setSelectedType(String(value))} dir="rtl">
                      <SelectTrigger id="type-filter" className="mt-1 border-olivePrimary/30 focus:border-olivePrimary focus:ring-olivePrimary/20 text-right">
                        <SelectValue placeholder="اختر نوع المنتج" />
                      </SelectTrigger>
                      <SelectContent className="border-olivePrimary/30 text-right" dir="rtl">
                        <SelectItem value="all">كل الأنواع</SelectItem>
                        <SelectItem value="product">منتجات جاهزة</SelectItem>
                        <SelectItem value="gig">خدمات مخصصة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-darkOlive block text-right">نطاق السعر: {priceRange[0]} - {priceRange[1]} جنيه</Label>
                    <Slider
                      defaultValue={priceRange}
                      min={0}
                      max={1000}
                      step={50}
                      onValueChange={setPriceRange}
                      className="mt-2 [&>span:first-child]:h-1 [&>span:first-child]:bg-olivePrimary/20 [&_[role=slider]]:bg-olivePrimary [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:border-2 [&_[role=slider]]:border-lightBeige"
                    />
                  </div>
                  <div>
                    <Label className="text-darkOlive block text-right">التقييم الأدنى: {minRating} نجوم</Label>
                    <div className="flex space-x-1 space-x-reverse mt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Button 
                          key={star} 
                          variant={minRating >= star ? "default" : "outline"} 
                          size="icon" 
                          onClick={() => setMinRating(star === minRating ? 0 : star)}
                          className={`p-2 ${minRating >= star ? 'bg-burntOrange border-burntOrange hover:bg-burntOrange/90' : 'border-olivePrimary/30'}`}
                        >
                          <Star className={`h-5 w-5 ${minRating >= star ? 'text-white' : 'text-burntOrange'}`} />
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Separator />                  <Button onClick={handleFilterChange} className="w-full bg-burntOrange hover:bg-burntOrange/90 text-white">
                    <Filter className="ml-2 h-4 w-4" /> تطبيق الفلاتر
                  </Button>
                  <Button onClick={resetFilters} variant="outline" className="w-full border-olivePrimary/50 text-olivePrimary hover:bg-olivePrimary hover:text-white">
                    إعادة تعيين الفلاتر
                  </Button>
                </CardContent>
              </Card>
            </motion.aside>

            {/* Gigs List */}
            <main className="w-full md:w-3/4">
              <div className="flex items-center justify-between mb-6">
                <p className="text-darkOlive/70">تم العثور على {gigs.length} منتج</p>                <div className="flex items-center gap-2">                  <Button variant="outline" size="icon" className="md:hidden ml-2 border-olivePrimary/50 text-olivePrimary hover:bg-olivePrimary hover:text-white" onClick={() => setIsFiltersOpen(true)}>
                    <Filter className="h-5 w-5" />
                  </Button>                  <Select value={sortBy} onValueChange={handleSortChange} dir="rtl">
                    <SelectTrigger className="w-[180px] border-olivePrimary/30 focus:border-olivePrimary focus:ring-olivePrimary/20 text-right">
                      <SelectValue placeholder="الترتيب حسب" />
                    </SelectTrigger>
                    <SelectContent className="border-olivePrimary/30 text-right" dir="rtl">
                      <SelectItem value="relevance">الأكثر صلة</SelectItem>
                      <SelectItem value="price_low">السعر: من الأقل للأعلى</SelectItem>
                      <SelectItem value="price_high">السعر: من الأعلى للأقل</SelectItem>
                      <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                      <SelectItem value="newest">الأحدث</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" className="border-olivePrimary/50 text-olivePrimary hover:bg-olivePrimary hover:text-white" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                    {viewMode === 'grid' ? <ListFilter className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-lg text-darkOlive">جاري تحميل المنتجات...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-lg text-red-500">{error}</p>
                </div>              ) : gigs.length > 0 ? (
                <motion.div 
                  className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 rtl" : "space-y-6"}
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
                  <h3 className="text-2xl font-semibold text-darkOlive mb-2">لا توجد منتجات تطابق بحثك</h3>
                  <p className="text-darkOlive/70">حاول تعديل الفلاتر أو البحث بكلمات أخرى.</p>
                </div>
              )}
            </main>
          </div>
        </TabsContent>
          <TabsContent value="sellers" className="mt-0">          <div className="flex flex-col md:flex-row-reverse gap-8">
            {/* Sellers Filters Sidebar */}
            <motion.aside 
              className={`md:w-1/4 ${isFiltersOpen ? 'block' : 'hidden'} md:block fixed inset-0 z-40 bg-white p-6 md:relative md:bg-transparent md:p-0 md:z-auto transition-transform duration-300 ease-in-out transform ${isFiltersOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
              initial={{ x: -200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-lg border-olivePrimary/20">
                <CardHeader className="flex flex-row-reverse items-center justify-between">
                  <CardTitle className="text-xl text-olivePrimary text-right">تصفية النتائج</CardTitle>
                  <Button variant="ghost" size="icon" className="md:hidden hover:bg-lightGreen/50 text-olivePrimary" onClick={() => setIsFiltersOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="search-filter-sellers" className="text-darkOlive block text-right">بحث بالاسم أو المهارات</Label>                    <Input 
                      id="search-filter-sellers" 
                      type="text" 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      placeholder="اسم الحرفي، المهارات..." 
                      className="mt-1 border-olivePrimary/30 focus:border-olivePrimary focus:ring-olivePrimary/20 text-right"
                      dir="rtl"
                    />
                  </div>                  <div>
                    <Label htmlFor="category-filter-sellers" className="text-darkOlive block text-right">التخصص</Label>
                    <Select value={selectedCategory} onValueChange={value => setSelectedCategory(String(value))} dir="rtl">
                      <SelectTrigger id="category-filter-sellers" className="mt-1 border-olivePrimary/30 focus:border-olivePrimary focus:ring-olivePrimary/20 text-right">
                        <SelectValue placeholder="اختر تخصص" />
                      </SelectTrigger>
                      <SelectContent className="border-olivePrimary/30 text-right" dir="rtl">
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
                  <Separator />                  <Button onClick={handleFilterChange} className="w-full bg-olivePrimary hover:bg-olivePrimary/90 text-white">
                    <Filter className="ml-2 h-4 w-4" /> تطبيق الفلاتر
                  </Button>
                  <Button onClick={resetFilters} variant="outline" className="w-full text-darkOlive border-olivePrimary/30 hover:bg-lightGreen/30">
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
                  <p className="text-lg text-darkOlive">جاري تحميل الحرفيين...</p>
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
