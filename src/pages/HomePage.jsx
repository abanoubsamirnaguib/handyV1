
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Star, TrendingUp, Shield, Clock, Palette, HandMetal, Gift, Shirt, Image, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { categories, gigs, sellers } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const HomePage = () => {
  const navigate = useNavigate();
  const featuredProducts = [
    gigs.find(gig => gig.id === 'g9'), // عطور
    gigs.find(gig => gig.id === 'g12'), // ملابس
    gigs.find(gig => gig.id === 'g14'), // طابلوهات
    gigs.find(gig => gig.id === 'g25'), // الاكل
  ];
  const featuredGigs = featuredProducts;
  const displayCategories = [
    categories.find(cat => cat.id === 'jewelry'),
    categories.find(cat => cat.id === 'pottery'),
    categories.find(cat => cat.id === 'clothes'),
    categories.find(cat => cat.id === 'perfumes'),
    categories.find(cat => cat.id === 'tableaux'),
    categories.find(cat => cat.id === 'food')
  ];
  const topCategories = displayCategories;
  const topSellers = sellers.slice(0, 3);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value;
    if (searchTerm.trim()) {
      navigate(`/explore?search=${searchTerm}`);
    }
  };

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'gem': return <Gift size={32} className="text-primary" />;
      case 'coffee': return <HandMetal size={32} className="text-primary" />;
      case 'scissors': return <Palette size={32} className="text-primary" />;
      case 'shirt': return <Shirt size={32} className="text-primary" />;
      case 'image': return <Image size={32} className="text-primary" />;
      case 'utensils': return <Utensils size={32} className="text-primary" />;
      default: return <Star size={32} className="text-primary" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div 
              className="md:w-1/2 text-center md:text-right mb-10 md:mb-0"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                اكتشف <span className="text-yellow-300">إبداعات</span> الحرفيين
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-200">
                منصتك الأولى للعثور على منتجات يدوية فريدة ومصنوعة بحب وشغف.
              </p>
              <form onSubmit={handleSearch} className="flex max-w-lg mx-auto md:mx-0">
                <Input
                  type="search"
                  name="search"
                  placeholder="ابحث عن تحفة فنية..."
                  className="rounded-r-none rounded-l-md py-3 px-4 text-gray-800 flex-grow focus:ring-2 focus:ring-yellow-300"
                />
                <Button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-l-none rounded-r-md px-6 py-3">
                  <Search className="h-5 w-5 ml-2" />
                  بحث
                </Button>
              </form>
            </motion.div>
            <motion.div 
              className="md:w-1/2 flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                <img  alt="منتج يدوي مميز" className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300" src="https://images.unsplash.com/photo-1686825374490-663137bad061" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12 text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            تصفح <span className="text-gradient">أبرز التصنيفات</span>
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {topCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/explore?category=${category.id}`}>
                  <Card className="text-center p-6 hover:shadow-xl transition-shadow duration-300 glass-effect card-hover border-orange-200">
                    <div className="flex justify-center mb-3">
                      {getCategoryIcon(category.icon)}
                    </div>
                    <h3 className="font-semibold text-gray-700">{category.name}</h3>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Gigs Section */}
      <section className="py-16 bg-orange-50">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12 text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            منتجات <span className="text-gradient">مميزة</span>
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredGigs.map((gig, index) => (
              <motion.div
                key={gig.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full card-hover border-amber-200">
                  <div className="relative h-56">
                    <img src={gig.images.length > 0 ? gig.images[0] : "https://images.unsplash.com/photo-1680188700662-5b03bdcf3017"} alt={gig.title} className="w-full h-full object-cover" />
                    <Badge variant="secondary" className="absolute top-2 right-2 bg-amber-500 text-white">{
                      categories.find(cat => cat.id === gig.category)?.name || gig.category
                    }</Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-gray-800 h-14 overflow-hidden">{gig.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      {gig.rating} ({gig.reviewCount} تقييمات)
                    </div>
                    <p className="text-xl font-bold text-primary mb-2">{gig.price} جنيه</p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
                      <Link to={`/gigs/${gig.id}`}>
                        عرض التفاصيل
                        <ArrowRight className="mr-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
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
            className="text-3xl font-bold text-center mb-12 text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            كيف تعمل <span className="text-gradient">منصتنا؟</span>
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: <Search size={48} className="text-primary mx-auto mb-4" />, title: "اكتشف", description: "تصفح آلاف المنتجات اليدوية الفريدة من مختلف الحرفيين." },
              { icon: <HandMetal size={48} className="text-primary mx-auto mb-4" />, title: "اطلب", description: "اختر المنتج الذي يعجبك وقم بطلبه بسهولة وأمان." },
              { icon: <Gift size={48} className="text-primary mx-auto mb-4" />, title: "استلم", description: "استلم تحفتك الفنية المصنوعة يدويًا واستمتع بها." },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                {step.icon}
                <h3 className="text-xl font-semibold mb-2 text-gray-700">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Sellers Section */}
      <section className="py-16 bg-orange-50">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12 text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            تعرف على <span className="text-gradient">أفضل الحرفيين</span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topSellers.map((seller, index) => (
              <motion.div
                key={seller.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 card-hover border-amber-200">
                  <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
                    <AvatarImage src={seller.avatar} alt={seller.name} />
                    <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">{seller.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{seller.skills.slice(0,2).join('، ')}</p>
                  <div className="flex justify-center items-center text-yellow-500 mb-3">
                    <Star size={16} className="mr-1" /> {seller.rating} ({seller.reviewCount} تقييمات)
                  </div>
                  <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                    <Link to={`/profile/${seller.id}`}>عرض الملف الشخصي</Link>
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-amber-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            هل أنت حرفي موهوب؟
          </motion.h2>
          <motion.p 
            className="text-lg md:text-xl mb-8 text-gray-200"
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
            <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-3 text-lg" onClick={() => navigate('/register?role=seller')}>
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
