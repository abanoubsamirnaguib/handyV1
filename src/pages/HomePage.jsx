import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Star, TrendingUp, Shield, Clock, Palette, HandMetal, Gift, Shirt, Image, Utensils, AlertCircle, CheckCircle, Info, AlertTriangle, Calendar, Megaphone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import WishlistButton from '@/components/ui/WishlistButton';
import PWAInstallSection from '@/components/PWAInstallSection';
import GiftSections from '@/components/ui/GiftSections';

const HomePage = () => {
  const navigate = useNavigate();

  // Featured products from backend
  const [featuredGigs, setFeaturedGigs] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [featuredError, setFeaturedError] = useState(null);

  // Top sellers from backend
  const [topSellers, setTopSellers] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [sellersError, setSellersError] = useState(null);

  // Categories from backend
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [categoriesPerRow, setCategoriesPerRow] = useState(window.innerWidth < 640 ? 4 : window.innerWidth < 1024 ? 6 : 8);

  // Handle wishlist changes
  const handleWishlistChange = (productId, isInWishlist) => {
    setFeaturedGigs(prevGigs => 
      prevGigs.map(gig => 
        gig.id === productId 
          ? { ...gig, in_wishlist: isInWishlist }
          : gig
      )
    );
  };

  // Helper to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return `${baseUrl}/storage/${imagePath}`;
  };

  // Latest announcements from backend
  const [latestAnnouncements, setLatestAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [announcementsError, setAnnouncementsError] = useState(null);

  // For draggable scroll - no longer needed
  // const categoriesRowRef = useRef(null);
  // const dragState = useRef({
  //   isDragging: false,
  //   startX: 0,
  //   scrollLeft: 0,
  //   moved: false,
  // });

  useEffect(() => {
    const handleResize = () => setCategoriesPerRow(window.innerWidth < 640 ? 4 : window.innerWidth < 1024 ? 6 : 8);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch categories
  useEffect(() => {
    let isMounted = true;
    setLoadingCategories(true);
    setCategoriesError(null);
    api.getCategories()
      .then(data => {
        if (isMounted) {
          const normalized = Array.isArray(data.data)
            ? data.data.map(cat => ({
                id: cat.id || cat._id || cat.category_id || cat.slug || cat.name,
                name: cat.name || cat.title || cat.label,
                icon: cat.icon || cat.iconName || 'star',
                image: cat.image
              }))
            : [];
          setCategories(normalized);
          setLoadingCategories(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCategoriesError('تعذر تحميل التصنيفات');
          setLoadingCategories(false);
        }
      });
    return () => { isMounted = false; };
  }, []);

  // Fetch featured products from backend 
  useEffect(() => {
    let isMounted = true;
    setLoadingFeatured(true);
    setFeaturedError(null);
    api.getFeaturedProducts()
      .then(data => {
        if (isMounted) {
          // Normalize backend data to match gig card expectations and limit to 9
          const normalized = Array.isArray(data.data)
            ? data.data.slice(0, 8).map(prod => ({
                id: prod.id,
                title: prod.title,
                description: prod.description,
                price: prod.price,
                type: prod.type || 'product', // Map type from backend
                images: Array.isArray(prod.images) && prod.images.length > 0
                  ? prod.images.map(img => img.image_url || img.url || img)
                  : [],
                category: prod.category_id || prod.category?.id || prod.category,
                rating: prod.rating || 0,
                reviewCount: prod.reviewCount || prod.review_count || 0,
                sellerId: prod.sellerId || prod.seller_id || prod.seller?.id,
                in_wishlist: prod.in_wishlist || false, // Preserve wishlist status
              }))
            : [];
          setFeaturedGigs(normalized);
          setLoadingFeatured(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFeaturedError('تعذر تحميل المنتجات المميزة');
          setLoadingFeatured(false);
        }
      });
    return () => { isMounted = false; };
  }, []);

  // Fetch top sellers from backend
  useEffect(() => {
    let isMounted = true;
    setLoadingSellers(true);
    setSellersError(null);
    api.getTopSellers()
      .then(data => {
        if (isMounted) {
          // Normalize backend data and limit to 3
          const normalized = Array.isArray(data.data)
            ? data.data.slice(0, 3).map(seller => ({
                id: seller.id,
                name: seller.name,
                avatar: seller.avatar || seller.profile_image || '',
                skills: seller.skills || seller.categories || [],
                rating: seller.rating || 0,
                reviewCount: seller.reviewCount || seller.review_count || 0,
                productsCount: seller.productsCount || seller.products_count || 0,
              }))
            : [];
          setTopSellers(normalized);
          setLoadingSellers(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSellersError('تعذر تحميل أفضل الحرفيين');
          setLoadingSellers(false);
        }
      });
    return () => { isMounted = false; };
  }, []);

  // Fetch latest announcements from backend
  useEffect(() => {
    let isMounted = true;
    setLoadingAnnouncements(true);
    setAnnouncementsError(null);
    api.get('/announcements/latest?limit=3')
      .then(response => {
        if (isMounted) {
          if (response.data.success) {
            setLatestAnnouncements(response.data.data);
          } else {
            setLatestAnnouncements([]);
          }
          setLoadingAnnouncements(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAnnouncementsError('تعذر تحميل الإعلانات');
          setLoadingAnnouncements(false);
        }
      });
    return () => { isMounted = false; };
  }, []);

  // Remove drag handlers - no longer needed
  // const handleDragStart = (e) => {
  //   dragState.current.isDragging = true;
  //   dragState.current.startX = e.type === 'touchstart'
  //     ? e.touches[0].clientX
  //     : e.clientX;
  //   dragState.current.scrollLeft = categoriesRowRef.current.scrollLeft;
  //   dragState.current.moved = false;
  // };
  // const handleDragMove = (e) => {
  //   if (!dragState.current.isDragging) return;
  //   const x = e.type === 'touchmove'
  //     ? e.touches[0].clientX
  //     : e.clientX;
  //   const walk = dragState.current.startX - x;
  //   if (Math.abs(walk) > 2) dragState.current.moved = true;
  //   categoriesRowRef.current.scrollLeft = dragState.current.scrollLeft + walk;
  // };
  // const handleDragEnd = () => {
  //   dragState.current.isDragging = false;
  // };

  // Remove category click handler - no longer needed
  // const handleCategoryClick = (e) => {
  //   if (dragState.current.moved) {
  //     e.preventDefault();
  //     dragState.current.moved = false;
  //   }
  // };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value;
    if (searchTerm.trim()) {
      navigate(`/explore?search=${searchTerm}`);
    }
  };

  const getCategoryIcon = (iconName) => {
    const iconSize = window.innerWidth < 640 ? 20 : window.innerWidth < 1024 ? 24 : 28;
    switch (iconName) {
      case 'gem': return <Gift size={iconSize} />;
      case 'coffee': return <HandMetal size={iconSize} />;
      case 'scissors': return <Palette size={iconSize} />;
      case 'shirt': return <Shirt size={iconSize} />;
      case 'image': return <Image size={iconSize} />;
      case 'utensils': return <Utensils size={iconSize} />;
      default: return <Star size={iconSize} />;
    }
  };

  const getAnnouncementIcon = (type) => {
    const iconSize = 24;
    switch (type) {
      case 'info': return <Info size={iconSize} className="text-neutral-900" />;
      case 'warning': return <AlertTriangle size={iconSize} className="text-neutral-900" />;
      case 'success': return <CheckCircle size={iconSize} className="text-roman-500" />;
      case 'error': return <AlertCircle size={iconSize} className="text-roman-600" />;
      default: return <Info size={iconSize} className="text-neutral-900" />;
    }
  };

  const getAnnouncementTypeColor = (type) => {
    switch (type) {
      case 'info': return 'bg-success-100 text-neutral-900';
      case 'warning': return 'bg-neutral-100 text-neutral-900';
      case 'success': return 'bg-success-100 text-roman-500';
      case 'error': return 'bg-roman-100 text-roman-600';
      default: return 'bg-success-100 text-neutral-900';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
        <section className="relative bg-roman-500 text-white py-20 md:py-32 overflow-hidden flex items-center justify-center min-h-[90vh]">
          <video
            className="absolute inset-0 w-screen h-screen object-cover z-0"
            style={{
          objectPosition: window.innerWidth < 640 ? '-900px' : undefined
            }}
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1686825374490-663137bad061"
            onError={e => {
          e.target.style.display = 'none';
          const img = document.createElement('img');
          img.src = "https://images.unsplash.com/photo-1686825374490-663137bad061";
          img.alt = "خلفية";  
          img.className = "absolute inset-0 w-screen h-screen object-cover z-0";
          e.target.parentNode.appendChild(img);
            }}
          >
          <source src="/hero-bg2.webm" type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <div className="container mx-auto px-4 relative z-20 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center w-full">
          <motion.div 
            className="text-center flex flex-col items-center justify-center"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                اكتشف <span className="text-neutral-100">إبداعات</span> الحرفيين
              </h1>
            </div>
            <p className="text-lg md:text-xl mb-8 text-neutral-100">
              منصتك الأولى للعثور على منتجات يدوية فريدة ومصنوعة بحب وشغف.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button
                size="lg"
                className="bg-roman-500 hover:bg-roman-500/90 text-white px-8 py-3 text-lg"
                onClick={() => {
                    const isLoggedIn = !!localStorage.getItem('token');
                    if (isLoggedIn) {
                      navigate('/dashboard');
                    } else {
                      navigate('/register');
                    }
                  }}
                >
                  ابدا معنا
                  <ArrowRight className="mr-2 h-5 w-5" />
                </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-neutral-500 hover:bg-white hover:text-roman-500 px-8 py-3 text-lg transition-all duration-300"
                onClick={() => navigate('/explore')}
              >
                اكتشف إبداعات الحرفيين
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-neutral-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            تصفح <span className="text-roman-500">أبرز التصنيفات</span>
          </motion.h2>
          <div className="relative">
            {loadingCategories ? (
              <div className="w-full text-center text-neutral-900/60 py-8">
                <div className="animate-pulse">جاري التحميل...</div>
              </div>
            ) : categoriesError ? (
              <div className="w-full text-center text-red-600 py-8 bg-red-50 rounded-lg border border-red-200">
                {categoriesError}
              </div>
            ) : categories.length === 0 ? (
              <div className="w-full text-center text-neutral-900/60 py-8">لا توجد تصنيفات متاحة</div>
            ) : (
              <>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6 lg:gap-8 px-2 py-4">
                  {(showAllCategories ? categories : categories.slice(0, categoriesPerRow)).map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link
                        to={`/explore?category=${category.id}`}
                        tabIndex={0}
                        className="block group"
                      >
                        <div className="flex flex-col items-center">
                          {/* Modern circular container for icon or image */}
                          <div className="relative mb-3 md:mb-4">
                            <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-roman-100 to-roman-200 flex items-center justify-center border-2 border-roman-500/30 group-hover:border-roman-500/60 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg backdrop-blur-sm overflow-hidden">
                              {category.image ? (
                                <img 
                                  src={getImageUrl(category.image)} 
                                  alt={category.name}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 flex items-center justify-center text-roman-500 group-hover:text-roman-500/80 transition-colors duration-300">
                                  {getCategoryIcon(category.icon)}
                                </div>
                              )}
                              {/* Decorative ring */}
                              <div className="absolute inset-0 rounded-full border border-roman-500/20 animate-pulse"></div>
                            </div>
                            {/* Glow effect */}
                            <div className="absolute inset-0 rounded-full bg-roman-500/10 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                          </div>
                          
                          {/* Category name */}
                          <h3 className="font-semibold text-center text-sm md:text-base text-neutral-900 group-hover:text-roman-500 transition-colors duration-300 leading-tight px-2">
                            {category.name}
                          </h3>
                          
                          {/* Hover indicator */}
                          <div className="w-0 group-hover:w-8 h-0.5 bg-roman-500 mt-2 transition-all duration-300 rounded-full"></div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
                
                {/* Show More Button */}
                {categories.length > categoriesPerRow * 2 && (
                  <div className="text-center mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="border-roman-500 text-roman-500 hover:bg-roman-500 hover:text-white px-6 py-2"
                    >
                      {showAllCategories ? 'عرض أقل' : 'عرض المزيد'}
                      <ArrowRight className={`mr-2 h-4 w-4 transition-transform duration-300 ${showAllCategories ? 'rotate-90' : ''}`} />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
          

        </div>
      </section>

      {/* Featured Gigs Section */}
      <section className="py-16 bg-roman-400/10">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12 text-neutral-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            منتجات <span className="text-roman-500">مميزة</span>
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2" dir="rtl">
            {loadingFeatured ? (
              <div className="col-span-8 text-center text-neutral-900/60 py-8">جاري التحميل...</div>
            ) : featuredError ? (
              <div className="col-span-8 text-center text-red-600 py-8">{featuredError}</div>
            ) : featuredGigs.length === 0 ? (
              <div className="col-span-8 text-center text-neutral-900/60 py-8">لا توجد منتجات مميزة متاحة</div>
            ) : (
              featuredGigs.map((gig, index) => {
                // Find category name from gig.category object if present
                let categoryName = gig.category && gig.category.name ? gig.category.name : null;
                if (!categoryName) {
                  const categoryObj = categories.find(cat => cat.id === (gig.category_id || gig.category?.id || gig.category));
                  categoryName = categoryObj ? categoryObj.name : (gig.category_id || gig.category?.id || gig.category);
                }

                return (
                  <motion.div
                    key={gig.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link to={`/gigs/${gig.id}`} className="block">
                      <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-62 card-hover border-roman-500/20 cursor-pointer" dir="rtl">
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
                          <div className="absolute top-2 left-2" onClick={(e) => e.stopPropagation()}>
                            <div onClick={(e) => e.preventDefault()}>
                              <WishlistButton productId={gig.id} inWishlist={gig.in_wishlist} onWishlistChange={handleWishlistChange} size="md" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 flex flex-col gap-1">
                            <Badge variant="outline" className={`text-xs ${gig.type === 'gig' ? 'bg-warning-500/50 text-white border-warning-500' : 'bg-blue-100 text-blue-600 border-blue-300'}`}>
                              {gig.type === 'gig' ? 'حرفة مخصصة' : 'منتج جاهز'}
                            </Badge>
                          </div>
                        </div>
                        <CardHeader className="pb-2 text-right p-2">
                          <CardTitle className="text-sm font-semibold text-neutral-900 overflow-hidden relative group">
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
                            <p className="text-sm font-bold text-roman-500 whitespace-nowrap">
                              {gig.type === 'gig' && (gig.price === 0 || gig.price === '0' || gig.price === '0.00' || parseFloat(gig.price) === 0)
                                ? 'قابل للتفاوض'
                                : `${gig.price} ج`}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="border-roman-500 text-roman-500 hover:bg-roman-500 hover:text-white">
              <Link to="/explore">
                استكشف المزيد
                <ArrowRight className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Gift Sections - أقسام الهدايا */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <GiftSections />
        </div>
      </section>

      {/* Latest Announcements Section */}
      {!loadingAnnouncements && !announcementsError && latestAnnouncements.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-neutral-100 to-success-100">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4 text-neutral-900">
                <Megaphone className="inline-block mr-2 text-roman-500" size={32} />
                آخر <span className="text-roman-500">الإعلانات</span>
              </h2>
              <p className="text-neutral-900/70">اطلع على أحدث الأخبار والتحديثات المهمة</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestAnnouncements.map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-roman-500 bg-white/90 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getAnnouncementIcon(announcement.type)}
                          <Badge className={getAnnouncementTypeColor(announcement.type)}>
                            {announcement.type === 'info' ? 'معلومات' : 
                             announcement.type === 'warning' ? 'تحذير' : 
                             announcement.type === 'success' ? 'نجاح' : 'تنبيه'}
                          </Badge>
                        </div>
                        <div className="text-xs text-neutral-400 flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-roman-500" />
                          {new Date(announcement.created_at).toLocaleDateString('ar-EG')}
                        </div>
                      </div>
                      <CardTitle className="text-lg font-semibold text-neutral-900 leading-tight">
                        {announcement.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-neutral-900/80 leading-relaxed line-clamp-3">
                        {announcement.content}
                      </p>
                      {announcement.image && (
                        <div className="mt-3">
                          <img 
                            src={`/storage/${announcement.image}`} 
                            alt={announcement.title}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button asChild variant="outline" size="sm" className="w-full text-roman-500 border-roman-500 hover:bg-roman-500 hover:text-white">
                        <Link to={`/announcements#${announcement.id}`}>
                          اقرأ المزيد
                          <ArrowRight className="mr-2 h-3 w-3" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button asChild variant="outline" size="lg" className="border-roman-500 text-roman-500 hover:bg-roman-500 hover:text-white">
                <Link to="/announcements">
                  عرض جميع الإعلانات
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12 text-neutral-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            كيف تعمل <span className="text-roman-500">منصتنا؟</span>
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: <Search size={48} className="text-roman-500 mx-auto mb-4" />, title: "اكتشف", description: "تصفح آلاف المنتجات اليدوية الفريدة من مختلف الحرفيين." },
              { icon: <HandMetal size={48} className="text-roman-500 mx-auto mb-4" />, title: "اطلب", description: "اختر المنتج الذي يعجبك وقم بطلبه بسهولة وأمان." },
              { icon: <Gift size={48} className="text-roman-500 mx-auto mb-4" />, title: "استلم", description: "استلم تحفتك الفنية المصنوعة يدويًا واستمتع بها." },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                {step.icon}
                <h3 className="text-xl font-semibold mb-2 text-neutral-900">{step.title}</h3>
                <p className="text-neutral-900/70">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Sellers Section */}
      <section className="py-16 bg-roman-400/10">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12 text-neutral-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            تعرف على <span className="text-roman-500">أفضل الحرفيين</span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingSellers ? (
              <div className="col-span-3 text-center text-neutral-900/60 py-8">جاري التحميل...</div>
            ) : sellersError ? (
              <div className="col-span-3 text-center text-red-600 py-8">{sellersError}</div>
            ) : topSellers.length === 0 ? (
              <div className="col-span-3 text-center text-neutral-900/60 py-8">لا يوجد حرفيون مميزون حالياً</div>
            ) : (
              topSellers.map((seller, index) => (
                <motion.div
                  key={seller.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 card-hover border-roman-500/20">
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-roman-500">
                      <AvatarImage src={seller.avatar} alt={seller.name} />
                      <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-1">{seller.name}</h3>
                    <p className="text-sm text-neutral-900/60 mb-2">{Array.isArray(seller.skills) ? seller.skills.slice(0,2).join('، ') : ''}</p>
                    <div className="flex flex-col gap-2 mb-3">
                      <div className="flex justify-center items-center text-warning-500">
                        <Star size={16} className="mr-1" /> {seller.rating} ({seller.reviewCount} تقييمات)
                      </div>
                      <div className="flex justify-center items-center text-roman-500">
                        <TrendingUp size={16} className="mr-1" /> {seller.productsCount} منتج
                      </div>
                    </div>
                    <Button asChild variant="outline" className="border-roman-500 text-roman-500 hover:bg-roman-500 hover:text-white">
                      <Link to={`/sellers/${seller.id}`}>عرض الملف الشخصي</Link>
                    </Button>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* PWA Install Section */}
      <PWAInstallSection />

      {/* Call to Action Section */}
      <section className="py-20 bg-neutral-100 text-white relative overflow-hidden">
        {/* Modern blurred background shape */}
        <div
          className="absolute inset-0 w-full h-full z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1686825374490-663137bad061')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px) brightness(0.7)',
            opacity: 0.7,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            هل أنت حرفي موهوب؟
          </motion.h2>
          <motion.p 
            className="text-lg md:text-xl mb-8 text-neutral-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            انضم إلى منصتنا اليوم وابدأ في عرض وبيع إبداعاتك اليدوية لجمهور واسع.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Button size="lg" className="bg-roman-500 hover:bg-roman-500/90 text-white px-8 py-3 text-lg" onClick={() => navigate('/register?role=seller')}>
              ابدأ البيع الآن
              <ArrowRight className="mr-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
