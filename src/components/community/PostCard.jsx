import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeOff, Heart, Loader2, MessageCircle, MoreHorizontal, Pencil, Share2, ShoppingBag, Trash2, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CommentsSection from '@/components/community/CommentsSection';
import EmbedCard from '@/components/community/EmbedCard';
import SharedReviewCard from '@/components/community/SharedReviewCard';

const formatDate = (dateString) => {
  if (!dateString) {
    return '';
  }

  return new Date(dateString).toLocaleString('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getInitials = (name = 'U') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const getRoleIndicator = (post) => {
  const isSeller = post?.type === 'review_share' || post?.author?.active_role === 'seller';

  if (isSeller) {
    return { emoji: '🏷️', label: 'بائع', variant: 'accent' };
  }

  return { emoji: '🛒', label: 'مشتري', variant: 'secondary' };
};

const getShareUrl = (postId) => `${window.location.origin}/community/posts/${postId}`;

const SharedProductCard = ({ product }) => {
  if (!product?.id) {
    return null;
  }

  return (
    <Link
      to={`/gigs/${product.id}`}
      className="block overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 transition hover:border-roman-300 hover:bg-white"
    >
      <div className="flex items-center gap-3 p-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
          {product.image ? (
            <img src={product.image} alt={product.title || product.name || 'منتج'} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-700">
              <ShoppingBag className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-900">{product.title || product.name}</p>
          <p className="mt-1 text-xs text-neutral-700">{product.category_name || 'منتج من المتجر'}</p>
          <p className="mt-1 text-sm font-medium text-roman-500">{product.price} جنيه</p>
        </div>
      </div>
    </Link>
  );
};

const updateFeedFollowState = (data, authorId, isFollowed) => {
  if (!data?.pages) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: (page.data || []).map((item) =>
        item.author?.id === authorId
          ? {
              ...item,
              author: {
                ...item.author,
                followed_by_viewer: isFollowed,
              },
            }
          : item
      ),
    })),
  };
};

const updateFeedPost = (data, postId, updater) => {
  if (!data?.pages) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: (page.data || []).map((item) => (item.id === postId ? updater(item) : item)),
    })),
  };
};

const removeFeedPost = (data, postId) => {
  if (!data?.pages) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: (page.data || []).filter((item) => item.id !== postId),
    })),
  };
};

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [localPost, setLocalPost] = useState(post);
  const [showComments, setShowComments] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isRemoved, setIsRemoved] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [hideOpen, setHideOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editBody, setEditBody] = useState(post.body || '');

  useEffect(() => {
    setLocalPost(post);
    setEditBody(post.body || '');
    setIsRemoved(false);
  }, [post]);

  const reactionMutation = useMutation({
    mutationFn: () => api.community.toggleReaction(localPost.id),
    onMutate: async () => {
      const wasReacted = Boolean(localPost.viewer_reaction);

      setLocalPost((current) => ({
        ...current,
        viewer_reaction: wasReacted ? null : 'like',
        counts: {
          ...current.counts,
          reactions: Math.max(0, (current.counts?.reactions || 0) + (wasReacted ? -1 : 1)),
        },
      }));
    },
    onError: (error) => {
      setLocalPost(post);
      toast({
        variant: 'destructive',
        title: 'تعذر تحديث التفاعل',
        description: error.message || 'حاول مرة أخرى.',
      });
    },
    onSuccess: (response) => {
      setLocalPost((current) => ({
        ...current,
        viewer_reaction: response.reacted ? response.reaction_type || 'like' : null,
        counts: {
          ...current.counts,
          reactions: response.count ?? current.counts?.reactions ?? 0,
        },
      }));
    },
  });

  const followMutation = useMutation({
    mutationFn: ({ authorId, shouldFollow }) =>
      shouldFollow ? api.community.followAuthor(authorId) : api.community.unfollowAuthor(authorId),
    onMutate: async ({ authorId, shouldFollow }) => {
      await queryClient.cancelQueries({ queryKey: ['community-feed'] });
      const previousFeedQueries = queryClient.getQueriesData({ queryKey: ['community-feed'] });

      queryClient.setQueriesData({ queryKey: ['community-feed'] }, (current) =>
        updateFeedFollowState(current, authorId, shouldFollow)
      );

      setLocalPost((current) => ({
        ...current,
        author: {
          ...current.author,
          followed_by_viewer: shouldFollow,
        },
      }));

      return {
        previousFeedQueries,
        previousLocalPost: localPost,
      };
    },
    onError: (error, _variables, context) => {
      context?.previousFeedQueries?.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      setLocalPost(context?.previousLocalPost || post);
      toast({
        variant: 'destructive',
        title: 'تعذر تحديث المتابعة',
        description: error.message || 'حاول مرة أخرى.',
      });
    },
    onSuccess: (response, variables) => {
      queryClient.setQueriesData({ queryKey: ['community-feed'] }, (current) =>
        updateFeedFollowState(current, variables.authorId, Boolean(response.following))
      );
      setLocalPost((current) => ({
        ...current,
        author: {
          ...current.author,
          followed_by_viewer: Boolean(response.following),
        },
      }));
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
    },
  });

  const editPostMutation = useMutation({
    mutationFn: (payload) => api.community.updatePost(localPost.id, payload),
    onSuccess: (updatedPost) => {
      queryClient.setQueriesData({ queryKey: ['community-feed'] }, (current) =>
        updateFeedPost(current, localPost.id, () => updatedPost)
      );
      setLocalPost(updatedPost);
      setEditBody(updatedPost.body || '');
      setEditOpen(false);
      toast({
        title: 'تم تحديث المنشور',
        description: 'تم حفظ تعديلاتك بنجاح.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'تعذر تعديل المنشور',
        description: error.message || 'حاول مرة أخرى.',
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: () => api.community.deletePost(localPost.id),
    onSuccess: () => {
      queryClient.setQueriesData({ queryKey: ['community-feed'] }, (current) => removeFeedPost(current, localPost.id));
      setDeleteOpen(false);
      setIsRemoved(true);
      toast({
        title: 'تم حذف المنشور',
        description: 'لن يظهر هذا المنشور بعد الآن في المجتمع.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'تعذر حذف المنشور',
        description: error.message || 'حاول مرة أخرى.',
      });
    },
  });

  const hidePostMutation = useMutation({
    mutationFn: () => api.community.hidePost(localPost.id),
    onSuccess: () => {
      queryClient.setQueriesData({ queryKey: ['community-feed'] }, (current) => removeFeedPost(current, localPost.id));
      setHideOpen(false);
      setIsRemoved(true);
      toast({
        title: 'تم إخفاء المنشور',
        description: 'لن يظهر هذا المنشور بعد الآن في المجتمع.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'تعذر إخفاء المنشور',
        description: error.message || 'حاول مرة أخرى.',
      });
    },
  });

  const handleReaction = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    reactionMutation.mutate();
  };

  const handleShare = async () => {
    const shareUrl = getShareUrl(localPost.id);

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'منشور من مجتمع بازار',
          text: localPost.body || 'شاهد هذا المنشور في مجتمع بازار',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'تم نسخ الرابط',
          description: 'تم نسخ رابط المنشور.',
        });
      }
    } catch {
      // Ignore share cancellation.
    }
  };

  const openAuthorProfile = () => {
    const author = localPost.author;
    if (!author?.id) {
      return;
    }

    if (author.seller_id) {
      navigate(`/sellers/${author.seller_id}`);
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    navigate(`/profile/${author.id}`);
  };

  const handleFollowToggle = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const authorId = localPost.author?.id;
    if (!authorId || user.id === authorId) {
      return;
    }

    const shouldFollow = !Boolean(localPost.author?.followed_by_viewer);

    followMutation.mutate({
      authorId,
      shouldFollow,
    });
  };

  const handleEditSave = () => {
    const normalizedBody = editBody.trim();

    if (normalizedBody === (localPost.body || '').trim()) {
      setEditOpen(false);
      return;
    }

    editPostMutation.mutate({
      body: normalizedBody || null,
    });
  };

  const visibleMedia = useMemo(() => (localPost.media || []).slice(0, 4), [localPost.media]);
  const extraMediaCount = Math.max(0, (localPost.media?.length || 0) - 4);

  const renderMediaGrid = () => {
    if (!visibleMedia.length) {
      return null;
    }

    if (visibleMedia.length === 1) {
      return (
        <div className="overflow-hidden rounded-2xl">
          <button type="button" onClick={() => setPreviewImage(visibleMedia[0].file_url)} className="block w-full text-right">
            <img src={visibleMedia[0].file_url} alt="صورة المنشور" className="max-h-[480px] w-full object-cover" />
          </button>
        </div>
      );
    }

    if (visibleMedia.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-2">
          {visibleMedia.map((media) => (
            <button key={media.id} type="button" onClick={() => setPreviewImage(media.file_url)} className="block text-right">
              <img
                src={media.file_url}
                alt="صورة المنشور"
                className="h-56 w-full rounded-2xl object-cover"
              />
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setPreviewImage(visibleMedia[0].file_url)} className="block text-right">
          <img
            src={visibleMedia[0].file_url}
            alt="صورة المنشور"
            className="h-[320px] w-full rounded-2xl object-cover"
          />
        </button>
        <div className="grid grid-rows-2 gap-2">
          {visibleMedia.slice(1, 3).map((media) => (
            <button key={media.id} type="button" onClick={() => setPreviewImage(media.file_url)} className="block text-right">
              <img
                src={media.file_url}
                alt="صورة المنشور"
                className="h-[156px] w-full rounded-2xl object-cover"
              />
            </button>
          ))}
          {visibleMedia[3] && (
            <button
              type="button"
              onClick={() => setPreviewImage(visibleMedia[3].file_url)}
              className="relative block text-right"
            >
              <img
                src={visibleMedia[3].file_url}
                alt="صورة المنشور"
                className="h-[156px] w-full rounded-2xl object-cover"
              />
              {extraMediaCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/45 text-lg font-semibold text-white">
                  +{extraMediaCount} المزيد
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  const authorName = localPost.author?.name || 'عضو في بازار';
  const roleIndicator = getRoleIndicator(localPost);
  const isAdmin = ['admin', 'super_admin'].includes(user?.role);
  const isPostOwner = Boolean(user && user.id === localPost.author?.id);
  const canEditPost = isPostOwner;
  const canHidePost = isAdmin;
  const canDeletePost = isPostOwner || isAdmin;
  const canManagePost = canEditPost || canHidePost || canDeletePost;

  if (isRemoved) {
    return null;
  }

  return (
    <article
      id={`post-${localPost.id}`}
      className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"
    >
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <Avatar className="h-11 w-11 ring-2 ring-roman-100">
              <AvatarImage src={localPost.author?.avatar_url} />
              <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={openAuthorProfile}
                  className="truncate font-semibold text-neutral-900 transition hover:text-roman-500"
                >
                  {authorName}
                </button>
                <span
                  className="inline-flex items-center justify-center text-lg leading-none px-1"
                  title={roleIndicator.label}
                  aria-label={roleIndicator.label}
                >
                  <span aria-hidden="true">{roleIndicator.emoji}</span>
                  <span className="sr-only">{roleIndicator.label}</span>
                </span>
              </div>
              <div className="mt-1 text-xs text-neutral-700">{formatDate(localPost.created_at)}</div>
            </div>
          </div>

          {canManagePost ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {canEditPost ? (
                  <DropdownMenuItem onClick={() => setEditOpen(true)} className="justify-between gap-2">
                    <span>تعديل</span>
                    <Pencil className="h-4 w-4" />
                  </DropdownMenuItem>
                ) : null}
                {canHidePost ? (
                  <DropdownMenuItem
                    onClick={() => setHideOpen(true)}
                    className="justify-between gap-2 text-amber-600 focus:text-amber-600"
                  >
                    <span>إخفاء</span>
                    <EyeOff className="h-4 w-4" />
                  </DropdownMenuItem>
                ) : null}
                {canDeletePost ? (
                  <DropdownMenuItem
                    onClick={() => setDeleteOpen(true)}
                    className="justify-between gap-2 text-red-600 focus:text-red-600"
                  >
                    <span>حذف</span>
                    <Trash2 className="h-4 w-4" />
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : user && user.id !== localPost.author?.id ? (
            <button
              type="button"
              onClick={handleFollowToggle}
              disabled={followMutation.isPending}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
                localPost.author?.followed_by_viewer
                  ? 'bg-success-100 text-neutral-700 hover:bg-success-200'
                  : 'bg-roman-500 text-white hover:bg-roman-600'
              }`}
            >
              {localPost.author?.followed_by_viewer ? 'متابَع' : 'متابعة'}
            </button>
          ) : null}
        </div>

        {localPost.body && (
          <p
            className={`mb-4 whitespace-pre-wrap break-words leading-7 text-neutral-700 ${
              localPost.type === 'review_share' ? 'italic text-neutral-600' : ''
            }`}
          >
            {localPost.body}
          </p>
        )}

        <div className="space-y-4">
          {localPost.type === 'standard' && renderMediaGrid()}
          {localPost.type === 'standard' && localPost.embed && <EmbedCard embed={localPost.embed} />}
          {localPost.shared_product && <SharedProductCard product={localPost.shared_product} />}
          {localPost.type === 'review_share' && <SharedReviewCard review={localPost.shared_review} />}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReaction}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition ${
              localPost.viewer_reaction
                ? 'bg-rose-50 text-rose-600'
                : 'text-neutral-500 hover:bg-neutral-50 hover:text-rose-600'
            }`}
          >
            <Heart className={`h-4 w-4 ${localPost.viewer_reaction ? 'fill-current' : ''}`} />
            <span>{localPost.counts?.reactions || 0}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowComments((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-neutral-500 transition hover:bg-neutral-50 hover:text-roman-500"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{localPost.counts?.comments || 0}</span>
          </button>
        </div>

          <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-neutral-500 transition hover:bg-neutral-50 hover:text-roman-500"
        >
          <Share2 className="h-4 w-4" />
            مشاركة
        </button>
      </div>

      {showComments && (
        <CommentsSection
          postId={localPost.id}
          onCountChange={(delta) => {
            setLocalPost((current) => ({
              ...current,
              counts: {
                ...current.counts,
                comments: Math.max(0, (current.counts?.comments || 0) + delta),
              },
            }));
          }}
        />
      )}

      {localPost.type === 'review_share' && localPost.shared_review?.product_id && (
        <div className="border-t border-neutral-100 px-5 py-3 text-sm">
          <Link
            to={`/gigs/${localPost.shared_review.product_id}`}
            className="font-medium text-roman-500 hover:text-roman-600"
          >
            عرض المنتج المرتبط
          </Link>
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-xl rounded-3xl p-0">
          <div className="p-6">
            <DialogHeader className="text-right">
              <DialogTitle>تعديل المنشور</DialogTitle>
              <DialogDescription>يمكنك تعديل النص فقط، وسيبقى نوع المنشور والمرفقات كما هي.</DialogDescription>
            </DialogHeader>

            <div className="mt-5 space-y-3">
              <Textarea
                value={editBody}
                onChange={(event) => setEditBody(event.target.value)}
                maxLength={2000}
                className="min-h-[180px] rounded-2xl border-roman-500/20"
                placeholder="اكتب تحديثك هنا"
              />
              <div className="text-left text-xs text-neutral-700">{editBody.length}/2000</div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setEditOpen(false)}>
                إلغاء
              </Button>
              <Button
                type="button"
                className="rounded-xl"
                onClick={handleEditSave}
                disabled={editPostMutation.isPending}
              >
                {editPostMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                حفظ التعديلات
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={hideOpen} onOpenChange={setHideOpen}>
        <AlertDialogContent className="max-w-md rounded-3xl text-right">
          <AlertDialogHeader>
            <AlertDialogTitle>إخفاء المنشور</AlertDialogTitle>
            <AlertDialogDescription>
              هل تريد إخفاء هذا المنشور من المجتمع؟ سيختفي عن المستخدمين من الخلاصة بعد التأكيد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-amber-500 text-white hover:bg-amber-600"
              onClick={(event) => {
                event.preventDefault();
                hidePostMutation.mutate();
              }}
              disabled={hidePostMutation.isPending}
            >
              {hidePostMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
              تأكيد الإخفاء
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="max-w-md rounded-3xl text-right">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المنشور</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المنشور؟ لن يظهر بعد الآن في المجتمع بعد التأكيد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-red-600 hover:bg-red-700"
              onClick={(event) => {
                event.preventDefault();
                deletePostMutation.mutate();
              }}
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {previewImage && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            className="absolute left-4 top-4 rounded-full bg-white/90 p-2 text-neutral-700"
            onClick={() => setPreviewImage(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={previewImage}
            alt="معاينة الصورة"
            className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
};

export default PostCard;
