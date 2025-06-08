import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, MessageSquare, Heart, Share2, ChevronLeft, ChevronRight, CheckCircle, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
        const normalizedGig = {
          id: prod.id,
          title: prod.title,
          description: prod.description,
          price: prod.price,
          images: Array.isArray(prod.images) && prod.images.length > 0
            ? prod.images.map(img => img.image_url || img.url || img)
            : [],
          category: prod.category,
          rating: prod.rating || 0,
          reviewCount: prod.reviewCount || prod.review_count || 0,
          sellerId: prod.sellerId || prod.seller_id || prod.seller?.id,
          deliveryTime: prod.delivery_time || prod.deliveryTime || 'غير محدد',
          tags: Array.isArray(prod.tags) ? prod.tags : (prod.tags ? [prod.tags] : []),
        };
        setGig(normalizedGig);
        // Fetch seller
        if (normalizedGig.sellerId) {
          const sellerRes = await api.getSeller(normalizedGig.sellerId);
          const sellerData = sellerRes.data;
          setSeller({
            id: sellerData.id,
            name: sellerData.user?.name || '',
            avatar: sellerData.avatar || sellerData.profile_image || '',
            skills: sellerData.skills || sellerData.categories || [],
            rating: sellerData.rating || 0,
            reviewCount: sellerData.reviewCount || sellerData.review_count || 0,
            bio: sellerData.bio || '',
            location: sellerData.location || '',
            memberSince: sellerData.member_since || sellerData.memberSince || '',
            completedOrders: sellerData.completed_orders || sellerData.completedOrders || 0,
          });
        }
        // Optionally: fetch reviews and related gigs if backend supports
        setLoading(false);
      })
      .catch(() => {
        setError('تعذر تحميل تفاصيل المنتج');
        setLoading(false);
      });
  }, [id, navigate]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">جاري تحميل تفاصيل المنتج...</div>;
  }
  if (error || !gig || !seller) {
    return <div className="container mx-auto px-4 py-8 text-center">{error || 'تعذر تحميل تفاصيل المنتج'}</div>;
  }

  const handleAddToCart = () => {
    addToCart({ ...gig, quantity });
    toast({
      title: 'تمت الإضافة إلى السلة',
      description: `${gig.title} (الكمية: ${quantity}) تمت إضافتها إلى سلة التسوق.`,
    });
  };

  const handleContactSeller = () => {
    if (!user) {
      toast({ variant: "destructive", title: "يرجى تسجيل الدخول", description: "يجب عليك تسجيل الدخول أولاً للتواصل مع البائع." });
      navigate('/login');
      return;
    }
    if (user.id === seller.id) {
      toast({ variant: "destructive", title: "لا يمكن مراسلة نفسك", description: "لا يمكنك بدء محادثة مع نفسك." });
      return;
    }
    const conversationId = startConversation(seller);
    setActiveConversation(conversationId);
    navigate('/chat');
  };

  const handleImageNavigation = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentImageIndex + 1) % (gig.images.length || 1)
      : (currentImageIndex - 1 + (gig.images.length || 1)) % (gig.images.length || 1);
    setCurrentImageIndex(newIndex);
  };
  
  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "يرجى تسجيل الدخول", description: "يجب عليك تسجيل الدخول لترك تقييم." });
      return;
    }
    if (newRating === 0 || !newReview.trim()) {
      toast({ variant: "destructive", title: "بيانات غير كاملة", description: "يرجى تقديم تقييم نصي وتقييم بالنجوم." });
      return;
    }
    const reviewData = {
      id: `r${reviews.length + 1}`,
      gigId: gig.id,
      userId: user.id,
      userName: user.name,
      rating: newRating,
      comment: newReview,
      date: new Date().toISOString().split('T')[0],
    };
    setReviews([reviewData, ...reviews]);
    setNewReview('');
    setNewRating(0);
    toast({ title: "تم إرسال التقييم", description: "شكراً لك على تقييم هذا المنتج." });
  };

  const gigImages = gig.images && gig.images.length > 0 
    ? gig.images 
    : [
        `https://images.unsplash.com/photo-1667974241877-3f3c2f324bb7?q=80&w=1000`, 
        `https://images.unsplash.com/photo-1632065509860-4fbcfc89ed7c?q=80&w=1000`, 
        `https://images.unsplash.com/photo-1580265862291-4251b8c7e836?q=80&w=1000`
      ];


  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="relative">
            <motion.div 
              className="aspect-square rounded-lg overflow-hidden shadow-xl border border-olivePrimary/20"
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
              <>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/70 hover:bg-white border-olivePrimary/30"
                  onClick={() => handleImageNavigation('prev')}
                >
                  <ChevronLeft className="h-6 w-6 text-olivePrimary" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/70 hover:bg-white border-olivePrimary/30"
                  onClick={() => handleImageNavigation('next')}
                >
                  <ChevronRight className="h-6 w-6 text-olivePrimary" />
                </Button>
              </>
            )}
            <div className="flex justify-center mt-4 space-x-2 space-x-reverse">
              {gigImages.map((img, index) => (
                <button 
                  key={index} 
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 ${index === currentImageIndex ? 'border-olivePrimary' : 'border-transparent'} transition-all`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img src={img} alt={`صورة مصغرة ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Gig Details */}
          <div className="space-y-6">
            <motion.h1 
              className="text-3xl lg:text-4xl font-bold text-darkOlive"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {gig.title}
            </motion.h1>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center text-burntOrange">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.round(Number(gig.rating) || 0) ? 'fill-current' : ''}`} />
                ))}
                <span className="ml-2 text-darkOlive/70">({typeof gig.rating === 'number' ? gig.rating.toFixed(1) : Number(gig.rating || 0).toFixed(1)} / {reviews.length} تقييمات)</span>
              </div>
              <Badge variant="secondary" className="bg-lightGreen/50 text-olivePrimary">{gig.category.name}</Badge>
            </div>

            <p className="text-darkOlive/80 leading-relaxed">{gig.description}</p>
            
            <div className="text-3xl font-bold text-olivePrimary">{gig.price} جنيه</div>

            <div className="flex items-center space-x-3 space-x-reverse">
              <Label htmlFor="quantity" className="text-darkOlive">الكمية:</Label>
              <Input 
                type="number" 
                id="quantity" 
                value={quantity} 
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))} 
                min="1" 
                className="w-20 text-center border-olivePrimary/30 focus:border-olivePrimary focus:ring-olivePrimary/20"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={handleAddToCart} className="bg-burntOrange hover:bg-burntOrange/90 text-white flex-1">
                <ShoppingCart className="ml-2 h-5 w-5" /> أضف إلى السلة
              </Button>
              <Button size="lg" variant="outline" className="border-olivePrimary/50 text-olivePrimary hover:bg-olivePrimary hover:text-white flex-1">
                <Heart className="ml-2 h-5 w-5" /> أضف إلى المفضلة
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-darkOlive/80">
                <div className="flex items-center"><ShieldCheck className="h-5 w-5 text-olivePrimary ml-2" /> دفع آمن ومضمون</div>
                <div className="flex items-center"><Truck className="h-5 w-5 text-olivePrimary ml-2" /> شحن لجميع المحافظات</div>
                <div className="flex items-center"><CheckCircle className="h-5 w-5 text-burntOrange ml-2" /> منتج يدوي أصلي</div>
                <div className="flex items-center"><MessageSquare className="h-5 w-5 text-burntOrange ml-2" /> دعم فني مباشر</div>
            </div>

            <Separator />

            {/* Seller Info */}
            <Card className="bg-lightGreen/30 border-olivePrimary/20">
              <CardHeader>
                <CardTitle className="text-xl text-darkOlive">معلومات البائع</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center space-x-4 space-x-reverse">
                <Avatar className="h-16 w-16 border-2 border-olivePrimary">
                  <AvatarImage src={seller.avatar} alt={seller.name} />
                  <AvatarFallback className="bg-olivePrimary text-white">{seller.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Link to={`/sellers/${seller.id}`} className="text-lg font-semibold text-olivePrimary hover:underline">{seller.name}</Link>
                  <p className="text-sm text-darkOlive/70">{seller.location}</p>
                  <div className="flex items-center text-sm text-burntOrange">
                    <Star className="h-4 w-4 mr-1" /> {seller.rating} ({seller.reviewCount} تقييمات)
                  </div>
                </div>
                <Button variant="outline" onClick={handleContactSeller} className="mr-auto border-olivePrimary/50 text-olivePrimary hover:bg-olivePrimary hover:text-white">
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

            <h2 className="text-2xl font-bold text-darkOlive mb-4">تفاصيل إضافية</h2>
            <div className="prose max-w-none text-darkOlive/80">
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
            <h2 className="text-2xl font-bold text-darkOlive mb-6">تقييمات العملاء ({reviews.length})</h2>
            {user && (
              <form onSubmit={handleSubmitReview} className="mb-8 p-4 border rounded-lg bg-lightGreen/20 border-olivePrimary/20">
                <h3 className="text-lg font-semibold mb-2 text-darkOlive">أضف تقييمك</h3>
                <div className="flex items-center mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button type="button" key={star} onClick={() => setNewRating(star)}>
                      <Star className={`h-6 w-6 cursor-pointer ${newRating >= star ? 'text-burntOrange fill-current' : 'text-lightGreen'}`} />
                    </button>
                  ))}
                </div>
                <Textarea 
                  value={newReview} 
                  onChange={(e) => setNewReview(e.target.value)} 
                  placeholder="اكتب تقييمك هنا..." 
                  rows={3}
                  className="mb-2 border-olivePrimary/30 focus:border-olivePrimary focus:ring-olivePrimary/20"
                />
                <Button type="submit" className="bg-burntOrange hover:bg-burntOrange/90 text-white">إرسال التقييم</Button>
              </form>
            )}
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map(review => (
                  <Card key={review.id} className="shadow-sm border-olivePrimary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-3 space-x-reverse">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-olivePrimary text-white">{review.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2 space-x-reverse mb-1">
                            <p className="font-semibold text-darkOlive">{review.userName}</p>
                            <div className="flex text-burntOrange">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-darkOlive/60 mb-2">{new Date(review.date).toLocaleDateString('ar-EG')}</p>
                          <p className="text-darkOlive/80">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-darkOlive/70">لا توجد تقييمات لهذا المنتج حتى الآن.</p>
            )}
          </section>

          <Separator className="my-8" />

          {/* Related Gigs Section */}
          {relatedGigs.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-darkOlive mb-6">منتجات مشابهة من نفس البائع</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedGigs.map(relatedGig => (
                  <Card key={relatedGig.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 card-hover border-olivePrimary/20">
                    <div className="relative h-48">
                      <img 
                        src={relatedGig.images && relatedGig.images.length > 0 
                          ? relatedGig.images[0] 
                          : `https://images.unsplash.com/photo-1635865165118-917ed9e20936`} 
                        alt={relatedGig.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <CardHeader className="pb-1">
                      <CardTitle className="text-md font-semibold text-darkOlive h-12 overflow-hidden">{relatedGig.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-lg font-bold text-olivePrimary">{relatedGig.price} جنيه</p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full border-olivePrimary/50 text-olivePrimary hover:bg-olivePrimary hover:text-white">
                        <Link to={`/gigs/${relatedGig.id}`}>عرض التفاصيل</Link>
                      </Button>
                    </CardFooter>
                  </Card>
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
