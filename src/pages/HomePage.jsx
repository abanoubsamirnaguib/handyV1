import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Star, TrendingUp, Shield, Clock, Palette, HandMetal, Gift, Shirt, Image, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';

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
  const [categoriesPerSlide, setCategoriesPerSlide] = useState(window.innerWidth < 640 ? 4 : 8);

  // For draggable scroll
  const categoriesRowRef = useRef(null);
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });

  useEffect(() => {
    const handleResize = () => setCategoriesPerSlide(window.innerWidth < 640 ? 4 : 8);
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
                icon: cat.icon || cat.iconName || 'star'
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
                images: Array.isArray(prod.images) && prod.images.length > 0
                  ? prod.images.map(img => img.image_url || img.url || img)
                  : [],
                category: prod.category_id || prod.category?.id || prod.category,
                rating: prod.rating || 0,
                reviewCount: prod.reviewCount || prod.review_count || 0,
                sellerId: prod.sellerId || prod.seller_id || prod.seller?.id,
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

  // Drag/Swipe handlers for scrollable row
  const handleDragStart = (e) => {
    dragState.current.isDragging = true;
    dragState.current.startX = e.type === 'touchstart'
      ? e.touches[0].clientX
      : e.clientX;
    dragState.current.scrollLeft = categoriesRowRef.current.scrollLeft;
    dragState.current.moved = false;
  };
  const handleDragMove = (e) => {
    if (!dragState.current.isDragging) return;
    const x = e.type === 'touchmove'
      ? e.touches[0].clientX
      : e.clientX;
    const walk = dragState.current.startX - x;
    if (Math.abs(walk) > 2) dragState.current.moved = true;
    categoriesRowRef.current.scrollLeft = dragState.current.scrollLeft + walk;
  };
  const handleDragEnd = () => {
    dragState.current.isDragging = false;
  };

  // Prevent click if drag happened
  const handleCategoryClick = (e) => {
    if (dragState.current.moved) {
      e.preventDefault();
      dragState.current.moved = false;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value;
    if (searchTerm.trim()) {
      navigate(`/explore?search=${searchTerm}`);
    }
  };

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'gem': return <Gift size={32} className="text-olivePrimary" />;
      case 'coffee': return <HandMetal size={32} className="text-olivePrimary" />;
      case 'scissors': return <Palette size={32} className="text-olivePrimary" />;
      case 'shirt': return <Shirt size={32} className="text-olivePrimary" />;
      case 'image': return <Image size={32} className="text-olivePrimary" />;
      case 'utensils': return <Utensils size={32} className="text-olivePrimary" />;
      default: return <Star size={32} className="text-olivePrimary" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-lightBeige">
      {/* Hero Section */}
      <section className="relative bg-olivePrimary text-white py-20 md:py-32 overflow-hidden flex items-center justify-center min-h-[70vh]">
        {/* Background Video or Fallback Image */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
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
            img.className = "absolute inset-0 w-full h-full object-cover z-0";
            e.target.parentNode.appendChild(img);
          }}
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
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
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                اكتشف <span className="text-creamyBeige">إبداعات</span> الحرفيين
              </h1>
              <p className="text-lg md:text-xl mb-8 text-lightBeige">
                منصتك الأولى للعثور على منتجات يدوية فريدة ومصنوعة بحب وشغف.
              </p>
              <Button
                size="lg"
                className="bg-burntOrange hover:bg-burntOrange/90 text-white px-8 py-3 text-lg"
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-lightBeige">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12 text-darkOlive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            تصفح <span className="text-olivePrimary">أبرز التصنيفات</span>
          </motion.h2>
          <div className="relative flex flex-col items-center">
            <div
              className="w-full flex justify-center items-center"
              style={{ minHeight: 210 }}
            >
              {loadingCategories ? (
                <div className="w-full text-center text-darkOlive/60 py-8">جاري التحميل...</div>
              ) : categoriesError ? (
                <div className="w-full text-center text-red-600 py-8">{categoriesError}</div>
              ) : categories.length === 0 ? (
                <div className="w-full text-center text-darkOlive/60 py-8">لا توجد تصنيفات متاحة</div>
              ) : (
                <div
                  ref={categoriesRowRef}
                  className="flex gap-6 overflow-x-auto scrollbar-hide px-1 py-2 cursor-grab active:cursor-grabbing select-none"
                  style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={handleDragStart}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                >
                  {categories.map(category => (
                    <Link
                      key={category.id}
                      to={`/explore?category=${category.id}`}
                      onClick={handleCategoryClick}
                      tabIndex={0}
                    >
                      <Card className="text-center p-6 hover:shadow-xl transition-shadow duration-300 glass-effect card-hover border-olivePrimary/20 min-w-[170px] max-w-[180px] mx-auto">
                        <div className="flex justify-center mb-3">
                          {getCategoryIcon(category.icon)}
                        </div>
                        <h3 className="font-semibold text-darkOlive">{category.name}</h3>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Gigs Section */}
      <section className="py-16 bg-paleGreen">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12 text-darkOlive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            منتجات <span className="text-olivePrimary">مميزة</span>
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
            {loadingFeatured ? (
              <div className="col-span-8 text-center text-darkOlive/60 py-8">جاري التحميل...</div>
            ) : featuredError ? (
              <div className="col-span-8 text-center text-red-600 py-8">{featuredError}</div>
            ) : featuredGigs.length === 0 ? (
              <div className="col-span-8 text-center text-darkOlive/60 py-8">لا توجد منتجات مميزة متاحة</div>
            ) : (
              featuredGigs.map((gig, index) => (
                <motion.div
                  key={gig.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full card-hover border-olivePrimary/20 text-center p-4">
                    <div className="relative h-40 md:h-44 lg:h-48 flex items-center justify-center">
                      <img src={gig.images.length > 0 ? gig.images[0] : 'https://images.unsplash.com/photo-1680188700662-5b03bdcf3017'} alt={gig.title} className="w-full h-full object-cover rounded-md" />
                      <Badge variant="secondary" className="absolute top-2 right-2 bg-olivePrimary text-white text-xs px-2 py-1">{
                        categories.find(cat => cat.id == gig.category)?.name || gig.category
                      }</Badge>
                    </div>
                    <CardHeader className="pb-1 pt-3 px-0">
                      <CardTitle className="text-base font-semibold text-darkOlive h-10 overflow-hidden leading-tight">{gig.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow px-0">
                      <div className="flex items-center justify-center text-xs text-darkOlive/80 mb-1">
                        <Star className="h-3 w-3 text-burntOrange mr-1" />
                        {gig.rating} ({gig.reviewCount} تقييمات)
                      </div>
                      <p className="text-base font-bold text-olivePrimary mb-1">{gig.price} جنيه</p>
                    </CardContent>
                    <CardFooter className="px-0 pt-2">
                      <Button asChild className="w-full bg-burntOrange hover:bg-burntOrange/90 text-xs py-2">
                        <Link to={`/gigs/${gig.id}`}>
                          عرض التفاصيل
                          <ArrowRight className="mr-2 h-3 w-3" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="border-olivePrimary text-olivePrimary hover:bg-olivePrimary hover:text-white">
              <Link to="/explore">
                استكشف المزيد
                <ArrowRight className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12 text-darkOlive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            كيف تعمل <span className="text-olivePrimary">منصتنا؟</span>
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: <Search size={48} className="text-olivePrimary mx-auto mb-4" />, title: "اكتشف", description: "تصفح آلاف المنتجات اليدوية الفريدة من مختلف الحرفيين." },
              { icon: <HandMetal size={48} className="text-olivePrimary mx-auto mb-4" />, title: "اطلب", description: "اختر المنتج الذي يعجبك وقم بطلبه بسهولة وأمان." },
              { icon: <Gift size={48} className="text-olivePrimary mx-auto mb-4" />, title: "استلم", description: "استلم تحفتك الفنية المصنوعة يدويًا واستمتع بها." },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                {step.icon}
                <h3 className="text-xl font-semibold mb-2 text-darkOlive">{step.title}</h3>
                <p className="text-darkOlive/70">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Sellers Section */}
      <section className="py-16 bg-creamyBeige">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12 text-darkOlive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            تعرف على <span className="text-olivePrimary">أفضل الحرفيين</span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingSellers ? (
              <div className="col-span-3 text-center text-darkOlive/60 py-8">جاري التحميل...</div>
            ) : sellersError ? (
              <div className="col-span-3 text-center text-red-600 py-8">{sellersError}</div>
            ) : topSellers.length === 0 ? (
              <div className="col-span-3 text-center text-darkOlive/60 py-8">لا يوجد حرفيون مميزون حالياً</div>
            ) : (
              topSellers.map((seller, index) => (
                <motion.div
                  key={seller.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 card-hover border-olivePrimary/20">
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-olivePrimary">
                      <AvatarImage src={seller.avatar} alt={seller.name} />
                      <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold text-darkOlive mb-1">{seller.name}</h3>
                    <p className="text-sm text-darkOlive/60 mb-2">{Array.isArray(seller.skills) ? seller.skills.slice(0,2).join('، ') : ''}</p>
                    <div className="flex justify-center items-center text-burntOrange mb-3">
                      <Star size={16} className="mr-1" /> {seller.rating} ({seller.reviewCount} تقييمات)
                    </div>
                    <Button asChild variant="outline" className="border-olivePrimary text-olivePrimary hover:bg-olivePrimary hover:text-white">
                      <Link to={`/profile/${seller.id}`}>عرض الملف الشخصي</Link>
                    </Button>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-creamyBeige text-white relative overflow-hidden">
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
            className="text-lg md:text-xl mb-8 text-lightBeige"
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
            <Button size="lg" className="bg-olivePrimary hover:bg-olivePrimary/90 text-white px-8 py-3 text-lg" onClick={() => navigate('/register?role=seller')}>
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
