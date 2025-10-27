import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  MapPin, 
  Mail, 
  Calendar, 
  Clock, 
  Award, 
  Package,
  ArrowRight, 
  Loader2, 
  MessageSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import WishlistButton from '@/components/ui/WishlistButton';

const SellerProfilePage = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [sellerGigs, setSellerGigs] = useState([]);
  const [sellerReviews, setSellerReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startConversation, setActiveConversation } = useChat();
  const { toast } = useToast();

  // Handle wishlist changes
  const handleWishlistChange = (productId, isInWishlist) => {
    setSellerGigs(prevGigs => 
      prevGigs.map(gig => 
        gig.id === productId 
          ? { ...gig, in_wishlist: isInWishlist }
          : gig
      )
    );
  };

  useEffect(() => {
    // Fetch seller data from backend API
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        // Fetch seller profile from API
        const sellerResponse = (await api.getSeller(id)).data;
        if (!sellerResponse) {
          setError('لم يتم العثور على الحرفي');
          setLoading(false);
          return;
        }
        // Transform API response to match component's expected structure
        const sellerData = {
          id: sellerResponse.id, // This is seller.id from sellers table
          user_id: sellerResponse.user?.id, // This is user.id from users table
          name: sellerResponse.user?.name || 'بدون اسم',
          email: sellerResponse.user?.email || '',
          bio: sellerResponse.bio || 'لا يوجد وصف',
          location: sellerResponse.location || 'غير محدد',
          rating: sellerResponse.rating || 0,
          reviewCount: sellerResponse.review_count || 0,
          memberSince: sellerResponse.member_since || new Date().toISOString(),
          skills: Array.isArray(sellerResponse.skills) ? sellerResponse.skills : [],
          completedOrders: sellerResponse.completed_orders || 0,
          responseTime: sellerResponse.response_time || 'غير محدد',
          avatar: sellerResponse.user?.avatar || '',
          cover_image: sellerResponse.user?.cover_image || '',
          products: sellerResponse.products || [],
          user: sellerResponse.user // Keep the full user object for startConversation
        };
        setSeller(sellerData);
        // Fetch seller's products/gigs
        const productsResponse = sellerData.products;
        if (productsResponse && Array.isArray(productsResponse)) {
          // Transform API response to match component's expected structure for gigs
          const gigsData = productsResponse.map(product => ({
            id: product.id,
            title: product.title || 'عنوان غير محدد',
            price: product.price || 0,
            category: product.category?.name || 'غير مصنف',
            rating: product.rating || 0,
            reviewCount: product.review_count || 0,
            images: Array.isArray(product.images) ? product.images.map(img => img.url || img.image_url || img) : [],
            description: product.description || '',
            in_wishlist: product.in_wishlist || false, // Preserve wishlist status
          }));
          setSellerGigs(gigsData);
        } else {
          setSellerGigs([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching seller data:', err);
        if (err.message && err.message.includes('404')) {
          setError('لم يتم العثور على الحرفي');
        } else {
          setError('حدث خطأ أثناء تحميل البيانات، الرجاء المحاولة مرة أخرى');
        }
        setLoading(false);
      }
    };
    fetchSellerData();
  }, [id, navigate]);

  // Function to load seller reviews
  const loadSellerReviews = async () => {
    if (!seller?.id || sellerReviews.length > 0) return; // Don't load if already loaded
    
    setReviewsLoading(true);
    try {
      const reviewsData = await api.getSellerReviews(seller.id);
      if (reviewsData && Array.isArray(reviewsData.data)) {
        setSellerReviews(reviewsData.data);
      }
    } catch (error) {
      console.error('Error loading seller reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-lg">جاري تحميل بيانات الحرفي...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">😕</div>
        <h1 className="text-2xl font-bold mb-4">{error}</h1>
        <p className="mb-8">لم نتمكن من العثور على الحرفي المطلوب</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/explore?tab=sellers">العودة إلى قائمة الحرفيين</Link>
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            العودة إلى الصفحة السابقة
          </Button>
        </div>
      </div>
    );
  }

  if (!seller) {
    return null;
  }
  
  const handleContactSeller = async () => {
    if (!user) {
      toast({ 
        variant: "destructive", 
        title: "يرجى تسجيل الدخول", 
        description: "يجب عليك تسجيل الدخول أولاً للتواصل مع الحرفي." 
      });
      navigate('/login', { state: { from: `/sellers/${id}` } });
      return;
    }
    
    // Compare user IDs, not seller ID with user ID
    if (user.id === seller.user_id) {
      toast({ 
        variant: "destructive", 
        title: "لا يمكن مراسلة نفسك", 
        description: "لا يمكنك بدء محادثة مع نفسك." 
      });
      return;
    }
    
    try {
      // Start a conversation with the seller - pass user object, not seller object
      const conversationId = await startConversation(seller.user);
      setActiveConversation(conversationId);
      navigate('/chat');
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >        {/* Seller Profile Header */}        <Card className="mb-8 overflow-hidden border-neutral-200/50">
          <div className="h-48 bg-roman-500 relative">
            {seller.cover_image ? (
              <img 
                src={seller.cover_image} 
                alt="غلاف الحرفي" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <>
                <img 
                  src="https://images.unsplash.com/photo-1692975716697-4abaff365786" 
                  alt="غلاف افتراضي للحرفي" 
                  className="w-full h-full object-cover opacity-30" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-roman-500/40 to-transparent"></div>
              </>
            )}
            <div className="absolute -bottom-16 right-8 h-32 w-32 rounded-full bg-white shadow-lg border-4 border-white overflow-hidden">
              {seller.avatar ? (
                <img 
                  src={seller.avatar} 
                  alt={seller.name}
                  className="w-full h-full object-cover opacity-30"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-roman-500">
                  {seller.name.charAt(0)}
                </div>
              )}
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
                    <Badge key={index} variant="outline" className="border-roman-500/30 bg-success-100/10">
                      {seller.skills[index]}
                    </Badge>
                  ))}
                </div>
              </div>              <div className="mt-6 md:mt-0 flex md:flex-col gap-3">
                <Button 
                  onClick={handleContactSeller} 
                  className="bg-warning-500 hover:bg-warning-600 text-white"
                >
                  <MessageSquare className="ml-2 h-4 w-4" />
                  تواصل مع الحرفي
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seller Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-neutral-200/50 bg-neutral-100/10">
            <CardContent className="p-6 flex items-center">
              <Star className="h-10 w-10 text-yellow-500 ml-4" />
              <div>
                <p className="text-sm text-gray-500">التقييم</p>
                <p className="text-2xl font-bold">
                  {seller.rating} <span className="text-sm text-gray-500">({seller.reviewCount})</span>
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-neutral-200/50 bg-neutral-100/10">
            <CardContent className="p-6 flex items-center">
              <Package className="h-10 w-10 text-roman-500 ml-4" />
              <div>
                <p className="text-sm text-gray-500">الطلبات المكتملة</p>
                <p className="text-2xl font-bold">{seller.completedOrders}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-neutral-200/50 bg-neutral-100/10">
            <CardContent className="p-6 flex items-center">
              <Clock className="h-10 w-10 text-success-500 ml-4" />
              <div>
                <p className="text-sm text-gray-500">وقت الاستجابة</p>
                <p className="text-2xl font-bold">{seller.responseTime}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-neutral-200/50 bg-neutral-100/10">
            <CardContent className="p-6 flex items-center">
              <Award className="h-10 w-10 text-warning-500 ml-4" />
              <div>
                <p className="text-sm text-gray-500">الخبرة</p>
                <p className="text-2xl font-bold">
                  {(() => {
                    const now = new Date();
                    const joined = new Date(seller.memberSince);
                    let years = now.getFullYear() - joined.getFullYear();
                    let months = now.getMonth() - joined.getMonth();
                    if (months < 0) {
                      years -= 1;
                      months += 12;
                    }
                    return (
                      <>
                        {years > 0 && <span>{years} سنة{years > 1 ? '' : ''}</span>}
                        {years > 0 && months > 0 && ' و '}
                        {months > 0 && <span>{months} شهر{months > 1 ? '' : ''}</span>}
                        {years === 0 && months === 0 && <span>أقل من شهر</span>}
                      </>
                    );
                  })()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="products" className="w-full" onValueChange={(value) => {
          if (value === 'reviews') {
            loadSellerReviews();
          }
        }}>
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-8">
            <TabsTrigger value="products" className="text-lg">المنتجات</TabsTrigger>
            <TabsTrigger value="reviews" className="text-lg">التقييمات ({seller?.reviewCount || 0})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <h2 className="text-2xl font-bold mb-6">منتجات الحرفي</h2>
            {sellerGigs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {sellerGigs.map((gig) => (
                  <Card key={gig.id} className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full card-hover border-neutral-200/50">
                    <div className="relative h-56">
                      <img 
                        src={gig.images && gig.images.length > 0 
                          ? gig.images[0] 
                          : "https://images.unsplash.com/photo-1680188700662-5b03bdcf3017"} 
                        alt={gig.title} 
                        className="w-full h-full object-cover" 
                      />
                      <Badge variant="secondary" className="absolute top-2 right-2 bg-roman-500 text-white">{gig.category}</Badge>
                      <div className="absolute top-2 left-2">
                        <WishlistButton productId={gig.id} inWishlist={gig.in_wishlist} onWishlistChange={handleWishlistChange} size="md" />
                      </div>
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
                      <Button asChild className="w-full bg-roman-500 hover:bg-roman-500/90 text-white">
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
            {reviewsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">جاري تحميل التقييمات...</p>
              </div>
            ) : sellerReviews.length > 0 ? (
              <div className="space-y-6" dir="rtl">
                {sellerReviews.map((review) => (
                  <Card key={review.id} className="border-neutral-200/50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {review.user?.avatar ? (
                            <img 
                              src={review.user.avatar} 
                              alt={review.user.name || 'مستخدم'}
                              className="w-12 h-12 rounded-full object-cover border-2 border-neutral-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-roman-500 rounded-full flex items-center justify-center text-white font-bold">
                              {review.user?.name?.charAt(0) || 'م'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-800 text-right">{review.user?.name || 'مستخدم'}</h4>
                              <p className="text-sm text-gray-500 text-right">
                                {new Date(review.created_at).toLocaleDateString('ar-EG')}
                              </p>
                            </div>
                          </div>
                          
                          {review.product && (
                            <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                              {review.product.image ? (
                                <img 
                                  src={review.product.image} 
                                  alt={review.product.title}
                                  className="w-12 h-12 rounded-lg object-cover border border-neutral-200"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                                  <Package className="h-6 w-6 text-roman-500" />
                                </div>
                              )}
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-700 block text-right">
                                  {review.product.title}
                                </span>
                                <span className="text-xs text-gray-500 block text-right">
                                  {review.product.category_name}
                                </span>
                              </div>
                            </div>
                          )}
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          {review.comment && (
                            <p className="text-gray-700 leading-relaxed text-right">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-600 mb-2">لا توجد تقييمات حتى الآن</p>
                <p className="text-gray-500">سيظهر هنا تقييمات العملاء عند شراء منتجات هذا الحرفي</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default SellerProfilePage;
