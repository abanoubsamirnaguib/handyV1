import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import PostCard from '@/components/community/PostCard';

const CommunityPostPage = () => {
  const { postId } = useParams();

  const postQuery = useQuery({
    queryKey: ['community-post', postId],
    queryFn: async () => {
      const response = await api.community.getPost(postId);
      return response?.data || response;
    },
    enabled: Boolean(postId),
  });

  return (
    <div className="min-h-screen bg-roman-50/50 via-white to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-neutral-900">تفاصيل المنشور</h1>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/community" className="inline-flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                العودة لكل المنشورات
              </Link>
            </Button>
          </div>

          {postQuery.isLoading ? (
            <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-roman-500" />
              <p className="mt-3 text-sm text-neutral-600">جاري تحميل المنشور...</p>
            </div>
          ) : postQuery.isError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm text-red-700">تعذر تحميل المنشور. ربما تم حذفه أو إخفاؤه.</p>
              <Button className="mt-4 rounded-xl" onClick={() => postQuery.refetch()}>
                إعادة المحاولة
              </Button>
            </div>
          ) : !postQuery.data?.id ? (
            <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-10 text-center shadow-sm">
              <p className="text-sm text-neutral-600">هذا المنشور غير متاح حالياً.</p>
            </div>
          ) : (
            <PostCard post={postQuery.data} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPostPage;
