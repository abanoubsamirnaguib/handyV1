import React, { useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, EyeOff, Loader2, RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { adminApi } from '@/lib/api';

const formatDate = (value) => {
  if (!value) {
    return 'غير متوفر';
  }

  return new Date(value).toLocaleString('ar-EG', {
    year: 'numeric',
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

const renderMediaSection = (post) => {
  const media = post.media || [];

  if (!media.length) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="mb-2 text-xs font-medium text-neutral-500">صور المنشور</div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {media.slice(0, 4).map((item) => (
          <a
            key={item.id}
            href={item.file_url}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50"
          >
            <img
              src={item.file_url}
              alt="صورة المنشور"
              className="h-32 w-full object-cover transition duration-200 group-hover:scale-[1.02]"
            />
          </a>
        ))}
      </div>
      {media.length > 4 ? (
        <div className="mt-2 text-xs text-neutral-500">+{media.length - 4} صور إضافية داخل المنشور</div>
      ) : null}
    </div>
  );
};

const renderEmbedSection = (post) => {
  const embed = post.embed;

  if (!embed?.embed_url) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
      <div className="mb-2 text-xs font-medium text-neutral-500">رابط الفيديو المضمّن</div>
      {embed.thumbnail_url ? (
        <a href={embed.embed_url} target="_blank" rel="noreferrer" className="mb-3 block overflow-hidden rounded-xl border border-neutral-200">
          <img src={embed.thumbnail_url} alt="معاينة الفيديو" className="h-40 w-full object-cover" />
        </a>
      ) : null}
      <a
        href={embed.embed_url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex max-w-full items-center gap-2 break-all text-sm font-medium text-roman-500 hover:text-roman-600"
      >
        <ExternalLink className="h-4 w-4 shrink-0" />
        <span className="truncate">{embed.embed_url}</span>
      </a>
    </div>
  );
};

const AdminCommunityPosts = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringPostId, setRestoringPostId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchHiddenPosts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await adminApi.getHiddenCommunityPosts({ page });

      setPosts(response.data || []);
      setCurrentPage(response.meta?.current_page || page);
      setTotalPages(response.meta?.last_page || 1);
      setTotalItems(response.meta?.total || 0);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'تعذر تحميل المنشورات المخفية',
        description: error.message || 'حاول مرة أخرى.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHiddenPosts(currentPage);
  }, [currentPage]);

  const handleRestore = async (postId) => {
    try {
      setRestoringPostId(postId);
      await adminApi.restoreCommunityPost(postId);

      toast({
        title: 'تمت إعادة المنشور',
        description: 'عاد المنشور للظهور في المجتمع.',
      });

      const targetPage = posts.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;

      if (targetPage !== currentPage) {
        setCurrentPage(targetPage);
      } else {
        await fetchHiddenPosts(targetPage);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'تعذر إعادة المنشور',
        description: error.message || 'حاول مرة أخرى.',
      });
    } finally {
      setRestoringPostId(null);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">منشورات المجتمع</h1>
          <p className="mt-1 text-sm text-neutral-500">إدارة المنشورات المخفية وإعادتها للنشر من لوحة المدير.</p>
        </div>
        <Badge className="w-fit bg-amber-100 text-amber-700 hover:bg-amber-100">
          {totalItems} منشور مخفي
        </Badge>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <EyeOff className="h-5 w-5 text-amber-600" />
              المنشورات المخفية
            </CardTitle>
            <CardDescription>يمكنك إعادة أي منشور مخفي ليظهر مرة أخرى في صفحة المجتمع.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-fit rounded-xl"
            onClick={() => fetchHiddenPosts(currentPage)}
            disabled={loading}
          >
            {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="ml-2 h-4 w-4" />}
            تحديث
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center text-neutral-500">
              <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              جار تحميل المنشورات المخفية...
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-neutral-900">لا توجد منشورات مخفية</h2>
              <p className="mt-2 text-sm text-neutral-500">عندما يقوم المدير بإخفاء منشور، سيظهر هنا ويمكن استرجاعه.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex items-center gap-3">
                        <Avatar className="h-11 w-11">
                          <AvatarImage src={post.author?.avatar_url} />
                          <AvatarFallback>{getInitials(post.author?.name || 'عضو')}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-neutral-900">{post.author?.name || 'عضو غير معروف'}</div>
                          <div className="text-xs text-neutral-500">{formatDate(post.created_at)}</div>
                        </div>
                      </div>

                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-full">
                          {post.type === 'review_share' ? 'مشاركة مراجعة' : 'منشور عادي'}
                        </Badge>
                        <Badge className="rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100">
                          {post.status === 'hidden' ? 'مخفي' : post.status}
                        </Badge>
                        <Badge variant="outline" className="rounded-full">
                          {post.counts?.comments || 0} تعليق
                        </Badge>
                        <Badge variant="outline" className="rounded-full">
                          {post.counts?.reactions || 0} تفاعل
                        </Badge>
                      </div>

                      <p className="whitespace-pre-wrap break-words text-sm leading-7 text-neutral-700">
                        {post.body?.trim() || 'هذا المنشور لا يحتوي على نص.'}
                      </p>

                      {renderMediaSection(post)}
                      {renderEmbedSection(post)}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        className="rounded-xl bg-roman-500 hover:bg-roman-600"
                        onClick={() => handleRestore(post.id)}
                        disabled={restoringPostId === post.id}
                      >
                        {restoringPostId === post.id ? (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCcw className="ml-2 h-4 w-4" />
                        )}
                        إعادة النشر
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {totalPages > 1 ? (
                <div className="flex flex-col gap-3 border-t border-neutral-100 pt-4 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm text-neutral-500">
                    الصفحة {currentPage} من {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronRight className="ml-2 h-4 w-4" />
                      السابق
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages || loading}
                    >
                      التالي
                      <ChevronLeft className="mr-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCommunityPosts;
