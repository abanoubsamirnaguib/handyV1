import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  MapPin, 
  Mail, 
  Calendar, 
  Clock, 
  Award, 
  Package,
  ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSellerById, getGigsBySellerId } from '@/lib/data';

const SellerProfilePage = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [sellerGigs, setSellerGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch seller data
    try {
      const sellerData = getSellerById(id);
      if (!sellerData) {
        setError('لم يتم العثور على الحرفي');
        setLoading(false);
        return;
      }
      
      setSeller(sellerData);
      
      // Fetch seller's gigs
      const gigs = getGigsBySellerId(id);
      setSellerGigs(gigs);
      
      setLoading(false);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل البيانات');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-lg">جاري التحميل...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">😕</div>
        <h1 className="text-2xl font-bold mb-4">{error}</h1>
        <p className="mb-8">لم نتمكن من العثور على الحرفي المطلوب</p>
        <Button asChild>
          <Link to="/explore?tab=sellers">العودة إلى قائمة الحرفيين</Link>
        </Button>
      </div>
    );
  }

  if (!seller) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Seller Profile Header */}        <Card className="mb-8 overflow-hidden border-lightBeige/50">
          <div className="h-48 bg-gradient-to-r from-olivePrimary to-burntOrange relative">
            <div className="absolute -bottom-16 right-8 h-32 w-32 rounded-full bg-white flex items-center justify-center text-5xl font-bold text-olivePrimary shadow-lg border-4 border-white">
              {seller.name.charAt(0)}
            </div>
          </div>
          <CardContent className="pt-20 pb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{seller.name}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 text-gray-400 ml-1" />
                  <span>{seller.location}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="h-4 w-4 text-gray-400 ml-1" />
                  <span>عضو منذ {new Date(seller.memberSince).toLocaleDateString('ar-EG')}</span>
                </div>
                <p className="text-gray-700 mb-4 max-w-3xl">{seller.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {seller.skills.map((_, index) => (
                    <Badge key={index} variant="outline" className="border-olivePrimary/30 bg-lightGreen/10">
                      {seller.skills[index]}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="mt-6 md:mt-0 flex md:flex-col gap-3">
                <Button asChild className="bg-burntOrange hover:bg-burntOrange/90 text-white">
                  <Link to={`/message/${seller.id}`}>
                    <Mail className="ml-2 h-4 w-4" />
                    تواصل مع الحرفي
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seller Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">          <Card className="border-lightBeige/50 bg-lightBeige/10">
            <CardContent className="p-6 flex items-center">
              <Star className="h-10 w-10 text-yellow-500 ml-4" />
              <div>
                <p className="text-sm text-gray-500">التقييم</p>
                <p className="text-2xl font-bold">{seller.rating} <span className="text-sm text-gray-500">({seller.reviewCount})</span></p>
              </div>
            </CardContent>
          </Card>          <Card className="border-lightBeige/50 bg-lightBeige/10">
            <CardContent className="p-6 flex items-center">
              <Package className="h-10 w-10 text-blue-500 ml-4" />
              <div>
                <p className="text-sm text-gray-500">الطلبات المكتملة</p>
                <p className="text-2xl font-bold">{seller.completedOrders}</p>
              </div>
            </CardContent>
          </Card>          <Card className="border-lightBeige/50 bg-lightBeige/10">
            <CardContent className="p-6 flex items-center">
              <Clock className="h-10 w-10 text-green-500 ml-4" />
              <div>
                <p className="text-sm text-gray-500">وقت الاستجابة</p>
                <p className="text-2xl font-bold">{seller.responseTime}</p>
              </div>
            </CardContent>
          </Card>          <Card className="border-lightBeige/50 bg-lightBeige/10">
            <CardContent className="p-6 flex items-center">
              <Award className="h-10 w-10 text-purple-500 ml-4" />
              <div>
                <p className="text-sm text-gray-500">الخبرة</p>
                <p className="text-2xl font-bold">{Math.floor((new Date() - new Date(seller.memberSince)) / (1000 * 60 * 60 * 24 * 30))} شهر</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs: Products, Reviews, etc. */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-8">
            <TabsTrigger value="products" className="text-lg">المنتجات</TabsTrigger>
            <TabsTrigger value="reviews" className="text-lg">التقييمات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <h2 className="text-2xl font-bold mb-6">منتجات الحرفي</h2>
            {sellerGigs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {sellerGigs.map((gig) => (
                  <Card key={gig.id} className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full card-hover border-lightBeige/50">
                    <div className="relative h-56">
                      <img 
                        src={gig.images && gig.images.length > 0 
                          ? gig.images[0] 
                          : "https://images.unsplash.com/photo-1680188700662-5b03bdcf3017"} 
                        alt={gig.title} 
                        className="w-full h-full object-cover" 
                      />
                      <Badge variant="secondary" className="absolute top-2 right-2 bg-olivePrimary text-white">{gig.category}</Badge>
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
                      <Button asChild className="w-full bg-burntOrange hover:bg-burntOrange/90 text-white">
                        <Link to={`/gigs/${gig.id}`}>
                          عرض التفاصيل
                          <ArrowRight className="mr-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-xl text-gray-600">لا توجد منتجات لعرضها حالياً</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reviews">
            <h2 className="text-2xl font-bold mb-6">تقييمات العملاء</h2>
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-xl text-gray-600">لا توجد تقييمات لعرضها حالياً</p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default SellerProfilePage;
