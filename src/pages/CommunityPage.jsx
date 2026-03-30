import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, Sparkles, Users } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostCard from '@/components/community/PostCard';
import CreatePostModal from '@/components/community/CreatePostModal';

const getInitials = (name = 'U') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const CommunityPage = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('all');
  const [createOpen, setCreateOpen] = useState(searchParams.get('compose') === '1');

  const isMineOnly = searchParams.get('view') === 'mine';
  const useFollowingFilter = activeTab === 'for-you' && !isMineOnly;

  useEffect(() => {
    if (searchParams.get('compose') === '1') {
      setCreateOpen(true);
    }
  }, [searchParams]);

  const feedQuery = useInfiniteQuery({
    queryKey: ['community-feed', activeTab],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      api.community.getFeed(pageParam, useFollowingFilter ? { following_only: '1' } : {}),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.meta?.current_page ?? 1;
      const lastPageNumber = lastPage?.meta?.last_page ?? 1;
      return currentPage < lastPageNumber ? currentPage + 1 : undefined;
    },
  });

  const posts = useMemo(
    () => feedQuery.data?.pages.flatMap((page) => page?.data || []) || [],
    [feedQuery.data]
  );
  const displayedPosts = useMemo(() => {
    if (!isMineOnly || !user?.id) {
      return posts;
    }

    return posts.filter((post) => post?.author?.id === user.id);
  }, [isMineOnly, posts, user?.id]);

  return (
    <div className="min-h-screen bg-roman-50/50 via-white to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-[2rem] bg-roman-500 p-6 text-white shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>

                <h1 className="text-3xl font-bold">مجتمع بازار</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/90">
                  اكتشف آخر التحديثات، ومشاركات البائعين و المشترين الحقيقية من مجتمع بازار.
                </p>
              </div>
            </div>
          </div>

          {!loading && user ? (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex w-full items-center gap-3 rounded-[2rem] border border-neutral-200 bg-white px-5 py-4 text-right shadow-sm transition hover:border-roman-200 hover:shadow-md"
            >
              <Avatar className="h-12 w-12 ring-2 ring-roman-100">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 rounded-full bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                بماذا تفكر؟
              </div>

              <div className="hidden items-center gap-2 rounded-full bg-roman-50 px-4 py-2 text-sm font-medium text-roman-500 sm:flex">
                <Sparkles className="h-4 w-4" />
                شارك تحديثاً
              </div>
            </button>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-roman-200 bg-roman-50/60 px-5 py-4 text-sm text-neutral-600">
              يمكن للزوار مشاهدة المنشورات، وللمشاركة بالتعليقات والتفاعلات يلزم تسجيل الدخول.
              <Link to="/login" className="mr-2 font-semibold text-roman-500">
                تسجيل الدخول
              </Link>
              أو
              <Link to="/register" className="mr-2 font-semibold text-roman-500">
                إنشاء حساب
              </Link>
            </div>
          )}

          {!isMineOnly && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-neutral-100 p-1">
                <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-white">
                  كل المنشورات
                </TabsTrigger>
                <TabsTrigger value="for-you" className="rounded-xl data-[state=active]:bg-white">
                  لك
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          {isMineOnly && (
            <p className="rounded-2xl bg-roman-50 px-4 py-3 text-xs text-neutral-600 ring-1 ring-roman-100">
              يتم عرض منشوراتك أنت فقط.
            </p>
          )}
          {activeTab === 'for-you' && !isMineOnly && (
            <p className="rounded-2xl bg-roman-50 px-4 py-3 text-xs text-neutral-600 ring-1 ring-roman-100">
              تبويب <span className="font-semibold text-roman-500">لك</span> يعرض منشورات الحسابات التي تتابعها فقط.
            </p>
          )}

          {feedQuery.isLoading ? (
            <div className="space-y-4">
              <div className="h-56 animate-pulse rounded-[2rem] bg-neutral-100" />
              <div className="h-56 animate-pulse rounded-[2rem] bg-neutral-100" />
            </div>
          ) : feedQuery.isError ? (
            <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm text-red-600">تعذر تحميل موجز المجتمع حالياً.</p>
              <Button className="mt-4 rounded-xl" onClick={() => feedQuery.refetch()}>
                إعادة المحاولة
              </Button>
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-neutral-200 bg-white p-10 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-900">
                {isMineOnly
                  ? 'لا توجد منشورات خاصة بك بعد'
                  : activeTab === 'for-you'
                    ? 'لا توجد منشورات من المتابَعين'
                    : 'لا توجد منشورات بعد'}
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                {isMineOnly
                  ? 'ابدأ بإنشاء أول منشور لك في المجتمع.'
                  : activeTab === 'for-you'
                  ? user
                    ? 'ابدأ بمتابعة الكتّاب لرؤية منشوراتهم هنا.'
                    : 'سجّل الدخول ثم تابع الكتّاب لرؤية منشوراتهم هنا.'
                  : 'كن أول من يشارك تحديثاً في مجتمع بازار.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {feedQuery.hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl px-6"
                onClick={() => feedQuery.fetchNextPage()}
                disabled={feedQuery.isFetchingNextPage}
              >
                {feedQuery.isFetchingNextPage ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                عرض المزيد
              </Button>
            </div>
          )}
        </div>
      </div>

      {user && <CreatePostModal open={createOpen} onOpenChange={setCreateOpen} />}
    </div>
  );
};

export default CommunityPage;
