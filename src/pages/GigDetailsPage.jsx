import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, MessageSquare, Heart, ChevronLeft, ChevronRight, CheckCircle, ShieldCheck, Truck, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { api, apiFetch } from '@/lib/api';
import WishlistButton from '@/components/ui/WishlistButton';

const GigDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { startConversation, setActiveConversation } = useChat();

  const [gig, setGig] = useState(null);
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedGigs, setRelatedGigs] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  // Handle share link functionality
  const handleShare = async () => {
    const currentUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: gig?.title,
          text: gig?.description,
          url: currentUrl,
        });
      } else {
        await navigator.clipboard.writeText(currentUrl);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
        toast({
          title: "تم نسخ الرابط",
          description: "تم نسخ رابط المنتج إلى الحافظة"
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Handle wishlist changes for related products
  const handleWishlistChange = (productId, isInWishlist) => {
    setRelatedGigs(prevGigs => 
      prevGigs.map(gig => 
        gig.id === productId 
          ? { ...gig, in_wishlist: isInWishlist }
          : gig
      )
    );
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Fetch product details from backend
    apiFetch(`Listpoducts/${id}`)
      .then(async (data) => {
        if (!data || !data.data) {
          setError('لم يتم العثور على المنتج');
          setLoading(false);
          return;
        }
        const prod = data.data;
        // Normalize images array and handle backend image_url format
        let images = [];
        if (Array.isArray(prod.images) && prod.images.length > 0) {
          images = prod.images.map(img => {
            if (typeof img === 'object' && img.image_url) {
              return img.image_url.startsWith('http')
          ? img.image_url
          : `${import.meta.env.VITE_API_BASE_URL}/storage/${img.image_url}`;
            }
            return img.url || img;
          });
        }

        const normalizedGig = {
          id: prod.id,
          title: prod.title,
          description: prod.description,
          price: prod.price,
          type : prod.type || 'gig',
          images,
          category: prod.category,
          rating: prod.rating || 0,
          reviewCount: prod.reviewCount || prod.review_count || 0,
          sellerId: prod.sellerId || prod.seller_id || prod.seller?.id,
          deliveryTime: prod.delivery_time || prod.deliveryTime || 'غير محدد',
          tags: Array.isArray(prod.tags) ? prod.tags : (prod.tags ? [prod.tags] : []),
          quantity: prod.quantity || 1,
        };
        setGig(normalizedGig);
        // Fetch seller
        if (normalizedGig.sellerId) {
          const sellerRes = await api.getSeller(normalizedGig.sellerId);
          const sellerData = sellerRes.data;
          setSeller({
            id: sellerData.id,
            name: sellerData.user?.name || '',
            avatar: sellerData.user?.avatar || '',
            skills: sellerData.skills || sellerData.categories || [],
            rating: sellerData.rating || 0,
            reviewCount: sellerData.reviewCount || sellerData.review_count || 0,
            bio: sellerData.bio || sellerData.user?.bio || '',
            location: sellerData.location || sellerData.user?.location || '',
            memberSince: sellerData.member_since || sellerData.memberSince || '',
            completedOrders: sellerData.completed_orders || sellerData.completedOrders || 0,
            user: sellerData.user,
          });
        }
        // Fetch related gigs from backend
        apiFetch(`Listpoducts/${id}/related`).then(relatedData => {
          if (relatedData && Array.isArray(relatedData.data)) {
            setRelatedGigs(relatedData.data.map(prod => ({
              id: prod.id,
              title: prod.title,
              price: prod.price,
              images: Array.isArray(prod.images) && prod.images.length > 0
                ? prod.images.map(img => img.image_url || img.url || img)
                : [],
              category: prod.category,
              rating: prod.rating || 0,
              reviewCount: prod.reviewCount || prod.review_count || 0,
              in_wishlist: prod.in_wishlist || false, // Preserve wishlist status
            })));
          } else {
            setRelatedGigs([]);
          }
        }).catch(() => setRelatedGigs([]));
        
        // Fetch product reviews from backend
        api.getProductReviews(id).then(reviewsData => {
          // Handle both wrapped and direct array responses
          const reviewsArray = Array.isArray(reviewsData) ? reviewsData : (reviewsData?.data || []);
          if (reviewsArray && Array.isArray(reviewsArray)) {
            const formattedReviews = reviewsArray.map(review => ({
              id: review.id,
              gigId: normalizedGig.id,
              userId: review.user?.id,
              userName: review.user?.name || 'مستخدم',
              rating: review.rating,
              comment: review.comment,
              date: review.created_at,
              order_id: review.order_id,
              image_url: review.image_url || review.image || null
            }));
            setReviews(formattedReviews);
          }
        }).catch(() => setReviews([]));
        
        setLoading(false);
      })
      .catch(() => {
        setError('تعذر تحميل تفاصيل المنتج');
        setLoading(false);
      });
  }, [id, navigate]);

  // Check if product is in wishlist when gig data is loaded
  useEffect(() => {
    if (gig && user) {
      checkWishlistStatus();
    }
  }, [gig, user]);

  const checkWishlistStatus = async () => {
    try {
      const response = await api.checkWishlistStatus(gig.id);
      setIsInWishlist(response.in_wishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toast({
        title: 'تسجيل الدخول مطلوب',
        description: 'يجب تسجيل الدخول لإضافة المنتجات لقائمة الأمنيات',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    try {
      setWishlistLoading(true);
      const response = await api.toggleWishlist(gig.id);
      
      if (response.success) {
        setIsInWishlist(response.action === 'added');
        toast({
          title: response.action === 'added' ? 'تمت الإضافة' : 'تمت الإزالة',
          description: response.message,
        });
      } else {
        toast({
          title: 'خطأ',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحديث قائمة الأمنيات',
        variant: 'destructive',
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">جاري تحميل تفاصيل المنتج...</div>;
  }
  if (error || !gig || !seller) {
    return <div className="container mx-auto px-4 py-8 text-center">{error || 'تعذر تحميل تفاصيل المنتج'}</div>;
  }

  const handleAddToCart = () => {
    const success = addToCart({ ...gig, quantity });
    if (!success) {
      // إذا فشلت العملية بسبب عدم تسجيل الدخول، يتم إعادة التوجيه
      navigate('/login');
      return;
    }
    // رسالة النجاح يتم عرضها من داخل addToCart
  };

  const handleContactSeller = async () => {
    console.log('seller',seller);
    if (!user) {
      toast({ variant: "destructive", title: "يرجى تسجيل الدخول", description: "يجب عليك تسجيل الدخول أولاً للتواصل مع البائع." });
      navigate('/login');
      return;
    }
    if (user.id === seller.user?.id) {
      toast({ variant: "destructive", title: "لا يمكن مراسلة نفسك", description: "لا يمكنك بدء محادثة مع نفسك." });
      return;
    }
    try {
      // Prepare product info for the conversation
      const productInfo = {
        id: gig.id,
        type: gig.type || 'gig', // 'gig' or 'product' - matching database values
        title: gig.title,
        image: gig.images && gig.images.length > 0 ? gig.images[0] : null,
        price: gig.price,
      };
      
      const conversationId = await startConversation(seller.user, productInfo);
      setActiveConversation(conversationId);
      navigate('/chat');
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const handleImageNavigation = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentImageIndex + 1) % (gig.images.length || 1)
      : (currentImageIndex - 1 + (gig.images.length || 1)) % (gig.images.length || 1);
    setCurrentImageIndex(newIndex);
  };
  
  // const handleSubmitReview = (e) => {
  //   e.preventDefault();
  //   if (!user) {
  //     toast({ variant: "destructive", title: "يرجى تسجيل الدخول", description: "يجب عليك تسجيل الدخول لترك تقييم." });
  //     return;
  //   }
  //   if (newRating === 0 || !newReview.trim()) {
  //     toast({ variant: "destructive", title: "بيانات غير كاملة", description: "يرجى تقديم تقييم نصي وتقييم بالنجوم." });
  //     return;
  //   }
  //   const reviewData = {
  //     id: `r${reviews.length + 1}`,
  //     gigId: gig.id,
  //     userId: user.id,
  //     userName: user.name,
  //     rating: newRating,
  //     comment: newReview,
  //     date: new Date().toISOString().split('T')[0],
  //   };
  //   setReviews([reviewData, ...reviews]);
  //   setNewReview('');
  //   setNewRating(0);
  //   toast({ title: "تم إرسال التقييم", description: "شكراً لك على تقييم هذا المنتج." });
  // };

  const gigImages = gig.images && gig.images.length > 0 
    ? gig.images 
    : [
        `https://images.unsplash.com/photo-1667974241877-3f3c2f324bb7?q=80&w=1000`, 
        `https://images.unsplash.com/photo-1632065509860-4fbcfc89ed7c?q=80&w=1000`, 
        `https://images.unsplash.com/photo-1580265862291-4251b8c7e836?q=80&w=1000`
      ];


  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="relative">
            <motion.div 
              className="aspect-square rounded-lg overflow-hidden shadow-xl border border-roman-500/20"
              key={currentImageIndex}
              initial={{ opacity: 0.8, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <img  
                src={gigImages[currentImageIndex]} 
                alt={`${gig.title} - صورة ${currentImageIndex + 1}`} 
                className="w-full h-full object-cover" />
            </motion.div>
            {gigImages.length > 1 && (
              <>                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/70 hover:bg-white border-roman-500/30"
                  onClick={() => handleImageNavigation('prev')}
                >
                  <ChevronRight className="h-6 w-6 text-roman-500" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/70 hover:bg-white border-roman-500/30"
                  onClick={() => handleImageNavigation('next')}
                >
                  <ChevronLeft className="h-6 w-6 text-roman-500" />
                </Button>
              </>
            )}
            <div className="flex justify-center mt-4 space-x-2 space-x-reverse">
              {gigImages.map((img, index) => (
                <button 
                  key={index} 
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 ${index === currentImageIndex ? 'border-roman-500' : 'border-transparent'} transition-all`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img src={img} alt={`صورة مصغرة ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Gig Details */}
          <div className="space-y-6">            <motion.h1 
              className="text-3xl lg:text-4xl font-bold text-neutral-900 text-right"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {gig.title}
            </motion.h1>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center text-warning-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.round(Number(gig.rating) || 0) ? 'fill-current' : ''}`} />
                ))}
                <span className="mr-2 text-neutral-900/70">({typeof gig.rating === 'number' ? gig.rating.toFixed(1) : Number(gig.rating || 0).toFixed(1)} / {reviews.length} تقييمات)</span>
              </div>
              <Badge variant="secondary" className="bg-success-100/50 text-roman-500">{gig.category.name}</Badge>
            </div>

            <p className="text-neutral-900/80 leading-relaxed text-right">{gig.description}</p>
            
            <div className="text-2xl font-bold text-roman-500">
              {(gig.type === 'gig') && (gig.price === '0.00') 
                ? 'الحرفة قابلة للتفاوض'
                : `${gig.price} جنيه`}
            </div>

            {gig.type !== 'gig' && (
              <div className="flex items-center space-x-3 space-x-reverse">
                <Label htmlFor="quantity" className="text-neutral-900">الكمية المتوفرة:</Label>
                <div className="flex items-center space-x-2 space-x-reverse text-neutral-900 font-medium">
                  {gig.quantity} 
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2 flex-1">
                {gig.type === 'gig' ? (
                  <Button size="lg" onClick={handleContactSeller} className="bg-roman-500 hover:bg-roman-500/90 text-white flex-1">
                    <MessageSquare className="ml-2 h-5 w-5" /> تواصل مع البائع
                  </Button>
                ) : (
                  <Button size="lg" onClick={handleAddToCart} className="bg-roman-500 hover:bg-roman-500/90 text-white flex-1">
                    <ShoppingCart className="ml-2 h-5 w-5" /> أضف إلى السلة
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className={`border-roman-500/50 hover:bg-roman-500 hover:text-white ${
                    isInWishlist 
                      ? 'bg-roman-500 text-white border-roman-500 hover:bg-roman-500/90' 
                      : 'text-roman-500'
                  }`}
                >
                  <Heart className={`ml-2 h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} /> 
                  {wishlistLoading 
                    ? 'جاري التحديث...' 
                    : isInWishlist 
                      ? 'إزالة من المفضلة' 
                      : 'أضف إلى المفضلة'
                  }
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleShare}
                  className="px-4 border-roman-500/50 hover:bg-roman-500 hover:text-white"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

            </div>            <div className="grid grid-cols-2 gap-4 text-sm text-neutral-900/80">
                <div className="flex items-center"><ShieldCheck className="h-5 w-5 text-roman-500 ml-2" /> دفع آمن ومضمون</div>
                <div className="flex items-center"><Truck className="h-5 w-5 text-roman-500 ml-2" /> شحن لجميع المحافظات</div>
                <div className="flex items-center"><CheckCircle className="h-5 w-5 text-warning-500 ml-2" /> منتج يدوي أصلي</div>
                <div className="flex items-center"><MessageSquare className="h-5 w-5 text-warning-500 ml-2" /> دعم فني مباشر</div>
            </div>

            <Separator />

            {/* Seller Info */}
            <Card className="bg-success-100/30 border-roman-500/20">
              <CardHeader>
                <CardTitle className="text-xl text-neutral-900">معلومات البائع</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center space-x-4 space-x-reverse">
                <Avatar className="h-16 w-16 border-2 border-roman-500">
                  <AvatarImage src={seller.avatar} alt={seller.name} />
                  <AvatarFallback className="bg-roman-500 text-white">{seller.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Link to={`/sellers/${seller.id}`} className="text-lg font-semibold text-roman-500 hover:underline">{seller.name}</Link>
                  <p className="text-sm text-neutral-900/70">{seller.location}</p>
                  <div className="flex items-center text-sm text-warning-500">
                    <Star className="h-4 w-4 mr-1" /> {seller.rating} ({seller.reviewCount} تقييمات)
                  </div>
                </div>                <Button variant="outline" onClick={handleContactSeller} className="mr-auto border-roman-500/50 text-roman-500 hover:bg-roman-500 hover:text-white">
                  <MessageSquare className="ml-2 h-4 w-4" /> تواصل مع البائع
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs: Description, Reviews, Related */}
        <div className="mt-12">
          {/* For simplicity, we'll just stack them. shadcn/ui Tabs can be used for a tabbed interface */}
          <section className="mb-10">

            <h2 className="text-2xl font-bold text-neutral-900 mb-4 text-right">تفاصيل إضافية</h2>            <div className="prose max-w-none text-neutral-900/80 text-right">
              <p>وقت التسليم المتوقع: {gig.deliveryTime || 'غير محدد'}</p>
              <p>الوسوم: {Array.isArray(gig.tags) && gig.tags.length > 0
                ? gig.tags.map(tag => tag.tag_name).join(', ')
                : 'لا توجد وسوم'}</p>
              {/* Add more detailed description if available */}
            </div>
          </section>

          <Separator className="my-8" />

          {/* Reviews Section */}
  <section className="mb-10">
    <h2 className="text-2xl font-bold text-neutral-900 mb-6 text-right">تقييمات العملاء ({reviews.length})</h2>
    {/* {user && (
      <form onSubmit={handleSubmitReview} className="mb-8 p-4 border rounded-lg bg-success-100/20 border-roman-500/20">
        <h3 className="text-lg font-semibold mb-2 text-neutral-900 text-right">أضف تقييمك</h3>        <div className="flex items-center mb-2">
          {[5, 4, 3, 2, 1].map(star => (
            <button type="button" key={star} onClick={() => setNewRating(star)}>
              <Star className={`h-6 w-6 cursor-pointer ${newRating >= star ? 'text-warning-500 fill-current' : 'text-success-500'}`} />
            </button>
          ))}
        </div>
        <Textarea 
          value={newReview} 
          onChange={(e) => setNewReview(e.target.value)} 
          placeholder="اكتب تقييمك هنا..." 
          rows={3}
          className="mb-2 border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20"
        />
        <Button type="submit" className="bg-roman-500 hover:bg-roman-500/90 text-white">إرسال التقييم</Button>
      </form>
    )} */}
    {reviews.length > 0 ? (
      <div className="space-y-6">
        {reviews.map(review => (
          <Card key={review.id} className="shadow-sm border-roman-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3 space-x-reverse">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-roman-500 text-white">{review.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 space-x-reverse mb-1">
                    <p className="font-semibold text-neutral-900">{review.userName}</p>                    <div className="flex text-warning-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-neutral-900/60 mb-2">{new Date(review.date).toLocaleDateString('ar-EG')}</p>
                  <p className="text-neutral-900/80 mb-2">{review.comment}</p>
                  {review.image_url && (
                    <div className="mt-3">
                      <img 
                        src={review.image_url} 
                        alt={`صورة التقييم من ${review.userName}`}
                        className="max-w-xs h-auto rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ maxHeight: '300px' }}
                        onClick={() => window.open(review.image_url, '_blank')}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <p className="text-neutral-900/70">لا توجد تقييمات لهذا المنتج حتى الآن.</p>
    )}
  </section>

          <Separator className="my-8" />

          {/* Related Gigs Section */}
          {relatedGigs.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-6 text-right">منتجات مشابهة من نفس البائع</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" dir="rtl">
                {relatedGigs.map(relatedGig => (
                  <Link key={relatedGig.id} to={`/gigs/${relatedGig.id}`} className="block">
                    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 card-hover border-roman-500/20 cursor-pointer" dir="rtl">
                      <div className="relative h-48">
                        <img 
                          src={relatedGig.images && relatedGig.images.length > 0 
                            ? relatedGig.images[0] 
                            : `https://images.unsplash.com/photo-1635865165118-917ed9e20936`} 
                          alt={relatedGig.title} 
                          className="w-full h-full object-cover" 
                        />
                        <Badge variant="secondary" className="absolute top-2 right-2 bg-roman-500 text-white">{relatedGig.category?.name}</Badge>
                        <div className="absolute top-2 left-2" onClick={(e) => e.stopPropagation()}>
                          <div onClick={(e) => e.preventDefault()}>
                            <WishlistButton productId={relatedGig.id} inWishlist={relatedGig.in_wishlist} onWishlistChange={handleWishlistChange} size="md" />
                          </div>
                        </div>
                      </div>
                      <CardHeader className="pb-1 text-right">
                        <CardTitle className="text-md font-semibold text-neutral-900 h-12 overflow-hidden">{relatedGig.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-3 text-right">
                        <p className="text-lg font-bold text-roman-500">{relatedGig.price} جنيه</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default GigDetailsPage;
