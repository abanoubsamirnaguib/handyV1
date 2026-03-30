import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Loader2, Link2, Search, ShoppingBag, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiFormFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import SharedReviewCard from '@/components/community/SharedReviewCard';

const resolveVideoPreview = (url) => {
  const value = (url || '').trim();

  if (!value) {
    return null;
  }

  const normalizedInput = (() => {
    const iframeMatch = value.match(/<iframe[^>]+src=["']([^"']+)["'][^>]*>/i);

    if (!iframeMatch) {
      return value;
    }

    const src = (iframeMatch[1] || '').replace(/&amp;/g, '&');

    try {
      const parsedSrc = new URL(src);
      const hrefValue = parsedSrc.searchParams.get('href');
      if (hrefValue) {
        return decodeURIComponent(hrefValue);
      }
    } catch {
      const hrefMatch = src.match(/[?&]href=([^&\s"']+)/i);
      if (hrefMatch) {
        return decodeURIComponent(hrefMatch[1].replace(/&amp;/g, '&'));
      }
    }

    return src;
  })();

  const youtubeMatch = normalizedInput.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
  if (youtubeMatch) {
    return {
      provider: 'youtube',
      embed_url: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      thumbnail_url: `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`,
    };
  }

  const vimeoMatch = normalizedInput.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch) {
    return {
      provider: 'vimeo',
      embed_url: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      thumbnail_url: null,
    };
  }

  const tiktokMatch = normalizedInput.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i);
  if (tiktokMatch) {
    return {
      provider: 'tiktok',
      embed_url: `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`,
      thumbnail_url: null,
    };
  }

  const facebookMatch =
    normalizedInput.match(/(?:facebook\.com\/watch\/\?[^"\s]*\bv=|facebook\.com\/video\.php\?[^"\s]*\bv=)([A-Za-z0-9._-]+)/i) ||
    normalizedInput.match(/facebook\.com\/(?:[^/]+\/)?videos?\/([0-9]+)/i) ||
    normalizedInput.match(/facebook\.com\/reel\/([A-Za-z0-9._-]+)/i) ||
    normalizedInput.match(/facebook\.com\/share\/v\/([A-Za-z0-9._-]+)/i) ||
    normalizedInput.match(/fb\.watch\/([A-Za-z0-9_-]+)/i);

  if (facebookMatch) {
    return {
      provider: 'facebook',
      embed_url: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(normalizedInput)}&show_text=0`,
      thumbnail_url: null,
    };
  }

  return null;
};

const renderStars = (rating = 0) => (
  <div className="flex items-center gap-1 text-amber-400">
    {Array.from({ length: 5 }, (_, index) => (
      <span key={index}>{index < rating ? '★' : '☆'}</span>
    ))}
  </div>
);

const CreatePostModal = ({ open, onOpenChange }) => {
  const { user, switchRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('post');
  const [body, setBody] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [reviewSearch, setReviewSearch] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productNote, setProductNote] = useState('');

  const sharableReviewsQuery = useQuery({
    queryKey: ['community-sharable-reviews'],
    queryFn: () => api.community.getSharableReviews(),
    enabled: open && activeTab === 'review' && Boolean(user?.is_seller),
  });

  const sharableProductsQuery = useQuery({
    queryKey: ['community-sharable-products'],
    queryFn: () => api.community.getSharableProducts(),
    enabled: open && activeTab === 'product' && Boolean(user?.is_seller),
  });

  const createPostMutation = useMutation({
    mutationFn: (payload) => api.community.createPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      queryClient.invalidateQueries({ queryKey: ['community-sharable-reviews'] });

      toast({
        title: 'تم نشر المنشور',
        description: 'أصبح منشورك متاحاً الآن في مجتمع بازار.',
      });

      handleClose(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'تعذر نشر المنشور',
        description: error.message || 'حاول مرة أخرى.',
      });
    },
  });

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

  const filteredReviews = useMemo(() => {
    const reviews = sharableReviewsQuery.data?.data || [];
    const search = reviewSearch.trim().toLowerCase();

    if (!search) {
      return reviews;
    }

    return reviews.filter((review) =>
      [review.user?.name, review.product?.title, review.product?.name, review.comment]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search))
    );
  }, [reviewSearch, sharableReviewsQuery.data]);

  const filteredProducts = useMemo(() => {
    const products = sharableProductsQuery.data?.data || [];
    const search = productSearch.trim().toLowerCase();

    if (!search) {
      return products;
    }

    return products.filter((product) =>
      [product.title, product.name, product.category_name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search))
    );
  }, [productSearch, sharableProductsQuery.data]);

  const embedPreview = useMemo(() => resolveVideoPreview(videoUrl), [videoUrl]);

  const resetState = () => {
    setActiveTab('post');
    setBody('');
    setUploadedImages([]);
    setVideoUrl('');
    setShowVideoInput(false);
    setVideoError('');
    setUploadingImages(false);
    setReviewSearch('');
    setSelectedReview(null);
    setReviewNote('');
    setProductSearch('');
    setSelectedProduct(null);
    setProductNote('');
  };

  const handleClose = (nextOpen) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      resetState();
    }
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (!files.length) {
      return;
    }

    if (videoUrl.trim()) {
      setVideoError('لا يمكن إضافة صور وفيديو معاً');
      return;
    }

    const availableSlots = 5 - uploadedImages.length;
    const nextFiles = files.slice(0, availableSlots);

    if (!availableSlots) {
      toast({
        variant: 'destructive',
        title: 'تم الوصول لحد الصور',
        description: 'يمكنك رفع 5 صور كحد أقصى لكل منشور.',
      });
      return;
    }

    for (const file of nextFiles) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'ملف غير مدعوم',
          description: `${file.name} ليس صورة.`,
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'حجم الملف كبير',
          description: `${file.name} يتجاوز حد 10MB.`,
        });
        return;
      }
    }

    try {
      setUploadingImages(true);

      const uploaded = await Promise.all(
        nextFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);

          const response = await apiFormFetch('upload', {
            method: 'POST',
            body: formData,
          });

          return {
            path: response.path,
            url: response.url,
            name: file.name,
          };
        })
      );

      setUploadedImages((current) => [...current, ...uploaded].slice(0, 5));
      setVideoError('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'فشل رفع الصور',
        description: error.message || 'تعذر رفع صورة أو أكثر.',
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleVideoValidation = () => {
    if (!videoUrl.trim()) {
      setVideoError('');
      return;
    }

    if (uploadedImages.length) {
      setVideoError('لا يمكن إضافة صور وفيديو معاً');
      return;
    }

    if (!resolveVideoPreview(videoUrl)) {
      setVideoError('الروابط المدعومة: YouTube و Vimeo و TikTok و Facebook فقط.');
      return;
    }

    setVideoError('');
  };

  const submitStandardPost = () => {
    if (!body.trim() && !uploadedImages.length && !videoUrl.trim()) {
      toast({
        variant: 'destructive',
        title: 'أضف محتوى أولاً',
        description: 'اكتب منشوراً أو أضف صوراً أو رابط فيديو.',
      });
      return;
    }

    if (uploadedImages.length && videoUrl.trim()) {
      setVideoError('لا يمكن إضافة صور وفيديو معاً');
      return;
    }

    if (videoUrl.trim() && !resolveVideoPreview(videoUrl)) {
      setVideoError('الروابط المدعومة: YouTube و Vimeo و TikTok و Facebook فقط.');
      return;
    }

    createPostMutation.mutate({
      type: 'standard',
      body: body.trim() || null,
      images: uploadedImages.map((image) => image.path),
      embed_url: videoUrl.trim() || null,
    });
  };

  const submitReviewShare = () => {
    if (!selectedReview) {
      toast({
        variant: 'destructive',
        title: 'اختر تقييماً',
        description: 'اختر تقييماً لمشاركته أولاً.',
      });
      return;
    }

    createPostMutation.mutate({
      type: 'review_share',
      review_id: selectedReview.id,
      body: reviewNote.trim() || null,
    });
  };

  const submitProductShare = () => {
    if (!selectedProduct) {
      toast({
        variant: 'destructive',
        title: 'اختر منتجاً',
        description: 'اختر منتجاً من منتجاتك لمشاركته أولاً.',
      });
      return;
    }

    createPostMutation.mutate({
      type: 'standard',
      body: productNote.trim() || null,
      shared_product_id: selectedProduct.id,
      images: [],
      embed_url: null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-3xl border-0 p-0 shadow-2xl">
        <div className="bg-gradient-to-br from-white via-roman-50/30 to-amber-50/40">
          <DialogHeader className="border-b border-neutral-100 px-6 py-5 text-right">
            <DialogTitle className="text-2xl text-neutral-900">إنشاء منشور</DialogTitle>
            <DialogDescription>
              شارك تحديثاتك أو صورك أو أبرز تقييماً حقيقياً من عملائك.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className={`grid w-full ${user?.is_seller ? 'grid-cols-3' : 'grid-cols-1'} rounded-2xl bg-neutral-100 p-1`}>
                <TabsTrigger value="post" className="rounded-xl data-[state=active]:bg-white">
                  منشور
                </TabsTrigger>
                {user?.is_seller ? (
                  <TabsTrigger value="product" className="rounded-xl data-[state=active]:bg-white">
                    مشاركة منتج
                  </TabsTrigger>
                ) : null}
                {user?.is_seller ? (
                  <TabsTrigger value="review" className="rounded-xl data-[state=active]:bg-white">
                    مشاركة تقييم
                  </TabsTrigger>
                ) : null}
              </TabsList>

              <TabsContent value="post" className="mt-6 space-y-4">
                <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
                  <Textarea
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    placeholder="بماذا تفكر؟"
                    className="min-h-[180px] resize-none rounded-2xl border-0 bg-transparent px-0 py-0 text-base shadow-none focus-visible:ring-0"
                    maxLength={2000}
                  />

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImages}
                      >
                        {uploadingImages ? (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ImagePlus className="ml-2 h-4 w-4" />
                        )}
                        صور
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => setShowVideoInput((current) => !current)}
                      >
                        <Link2 className="ml-2 h-4 w-4" />
                        رابط فيديو
                      </Button>
                    </div>

                    <span className="text-xs text-neutral-700">{body.length}/2000</span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  {showVideoInput && (
                    <div className="mt-4 space-y-2">
                      <Input
                        value={videoUrl}
                        onChange={(event) => setVideoUrl(event.target.value)}
                        onBlur={handleVideoValidation}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            handleVideoValidation();
                          }
                        }}
                      placeholder="ألصق رابط YouTube أو Vimeo أو TikTok أو Facebook (أو كود iframe)"
                        className="rounded-2xl border-roman-500/20"
                      />

                      {videoError && <p className="text-sm text-red-500">{videoError}</p>}

                      {embedPreview && !videoError && (
                        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                          <div className="flex items-center gap-3 p-3">
                            {embedPreview.thumbnail_url ? (
                              <img
                                src={embedPreview.thumbnail_url}
                                alt="Video preview"
                                className="h-20 w-32 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-20 w-32 items-center justify-center rounded-xl bg-neutral-900 text-sm font-medium text-white">
                                {embedPreview.provider}
                              </div>
                            )}
                            <div>
                              <Badge variant="secondary" className="mb-2 capitalize">
                                {embedPreview.provider}
                              </Badge>
                              <p className="text-sm text-neutral-600">سيتم التحقق من الرابط نهائياً من الخادم.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {uploadedImages.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {uploadedImages.map((image, index) => (
                        <div key={`${image.path}-${index}`} className="relative">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="h-24 w-24 rounded-2xl object-cover ring-1 ring-neutral-200"
                          />
                          <button
                            type="button"
                            onClick={() => setUploadedImages((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                            className="absolute -left-2 -top-2 rounded-full bg-white p-1 text-neutral-500 shadow"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={submitStandardPost}
                    disabled={createPostMutation.isPending || uploadingImages}
                    className="rounded-xl px-6"
                  >
                    {createPostMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                    نشر المنشور
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="review" className="mt-6">
                {!user?.is_seller ? null : user.active_role !== 'seller' ? (
                  <div className="rounded-3xl border border-dashed border-amber-200 bg-amber-50 p-5 text-center">
                    <p className="mb-4 text-sm text-neutral-700">بدّل إلى وضع البائع لمشاركة التقييمات.</p>
                    <Button type="button" onClick={() => switchRole('seller')} className="rounded-xl">
                      التبديل لوضع البائع
                    </Button>
                  </div>
                ) : selectedReview ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-xl"
                        onClick={() => setSelectedReview(null)}
                      >
                        الرجوع للتقييمات
                      </Button>

                      {selectedReview.already_shared && (
                        <Badge variant="secondary" className="rounded-full bg-neutral-200 text-neutral-600">
                          تمت مشاركته
                        </Badge>
                      )}
                    </div>

                    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
                      <Textarea
                        value={reviewNote}
                        onChange={(event) => setReviewNote(event.target.value)}
                        placeholder="أضف ملاحظة (اختياري)"
                        maxLength={2000}
                        className="min-h-[130px] rounded-2xl border-roman-500/20"
                      />
                      <div className="mt-2 text-left text-xs text-neutral-700">{reviewNote.length}/2000</div>
                    </div>

                    <SharedReviewCard review={selectedReview} />

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={submitReviewShare}
                        disabled={createPostMutation.isPending || selectedReview.already_shared}
                        className="rounded-xl px-6"
                      >
                        {createPostMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                        مشاركة التقييم
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-700" />
                      <Input
                        value={reviewSearch}
                        onChange={(event) => setReviewSearch(event.target.value)}
                        placeholder="ابحث باسم المشتري أو المنتج"
                        className="rounded-2xl border-roman-500/20 pr-10"
                      />
                    </div>

                    {sharableReviewsQuery.isLoading ? (
                      <div className="space-y-3">
                        <div className="h-28 animate-pulse rounded-3xl bg-neutral-100" />
                        <div className="h-28 animate-pulse rounded-3xl bg-neutral-100" />
                      </div>
                    ) : filteredReviews.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-500">
                        لا توجد تقييمات منشورة متاحة للمشاركة حالياً.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredReviews.map((review) => (
                          <div
                            key={review.id}
                            className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-neutral-900">{review.user?.name || 'مشتري'}</span>
                                  <span className="text-sm text-neutral-700">على</span>
                                  <span className="truncate text-sm font-medium text-neutral-600">
                                    {review.product?.title || review.product?.name || 'منتج'}
                                  </span>
                                </div>
                                <div className="mb-2">{renderStars(review.rating)}</div>
                                <p className="line-clamp-2 text-sm text-neutral-600">
                                  {review.comment || 'لا يوجد تعليق مكتوب.'}
                                </p>
                              </div>

                              {review.already_shared ? (
                                <Badge variant="secondary" className="rounded-full bg-neutral-200 text-neutral-600">
                                  تمت مشاركته
                                </Badge>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  className="rounded-xl"
                                  onClick={() => setSelectedReview(review)}
                                >
                                  مشاركة
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="product" className="mt-6">
                {!user?.is_seller ? null : user.active_role !== 'seller' ? (
                  <div className="rounded-3xl border border-dashed border-amber-200 bg-amber-50 p-5 text-center">
                    <p className="mb-4 text-sm text-neutral-700">بدّل إلى وضع البائع لمشاركة منتجاتك.</p>
                    <Button type="button" onClick={() => switchRole('seller')} className="rounded-xl">
                      التبديل لوضع البائع
                    </Button>
                  </div>
                ) : selectedProduct ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-xl"
                        onClick={() => setSelectedProduct(null)}
                      >
                        الرجوع للمنتجات
                      </Button>
                    </div>

                    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
                      <Textarea
                        value={productNote}
                        onChange={(event) => setProductNote(event.target.value)}
                        placeholder="اكتب تعليقك على المنتج (اختياري)"
                        maxLength={2000}
                        className="min-h-[130px] rounded-2xl border-roman-500/20"
                      />
                      <div className="mt-2 text-left text-xs text-neutral-700">{productNote.length}/2000</div>
                    </div>

                    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
                      <div className="flex items-center gap-4">
                        <div className="h-20 w-20 overflow-hidden rounded-2xl bg-neutral-100">
                          {selectedProduct.image ? (
                            <img src={selectedProduct.image} alt={selectedProduct.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-700">
                              <ShoppingBag className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 text-right">
                          <p className="truncate text-base font-semibold text-neutral-900">{selectedProduct.title || selectedProduct.name}</p>
                          <p className="mt-1 text-sm text-neutral-700">{selectedProduct.category_name || 'بدون تصنيف'}</p>
                          <p className="mt-1 text-sm font-medium text-roman-500">{selectedProduct.price} جنيه</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={submitProductShare}
                        disabled={createPostMutation.isPending}
                        className="rounded-xl px-6"
                      >
                        {createPostMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                        نشر مشاركة المنتج
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-700" />
                      <Input
                        value={productSearch}
                        onChange={(event) => setProductSearch(event.target.value)}
                        placeholder="ابحث باسم المنتج أو التصنيف"
                        className="rounded-2xl border-roman-500/20 pr-10"
                      />
                    </div>

                    {sharableProductsQuery.isLoading ? (
                      <div className="space-y-3">
                        <div className="h-24 animate-pulse rounded-3xl bg-neutral-100" />
                        <div className="h-24 animate-pulse rounded-3xl bg-neutral-100" />
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-500">
                        لا توجد منتجات نشطة متاحة للمشاركة حالياً.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredProducts.map((product) => (
                          <div key={product.id} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div className="h-14 w-14 overflow-hidden rounded-xl bg-neutral-100">
                                  {product.image ? (
                                    <img src={product.image} alt={product.title || product.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-neutral-700">
                                      <ShoppingBag className="h-4 w-4" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 text-right">
                                  <p className="truncate font-semibold text-neutral-900">{product.title || product.name}</p>
                                  <p className="text-xs text-neutral-700">{product.category_name || 'بدون تصنيف'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-roman-500">{product.price} جنيه</span>
                                <Button type="button" size="sm" className="rounded-xl" onClick={() => setSelectedProduct(product)}>
                                  اختيار
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
