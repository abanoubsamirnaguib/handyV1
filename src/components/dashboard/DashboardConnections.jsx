import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const ConnectionCard = ({ item, isOwnUser, onToggleFollow, followPendingId }) => (
  <Card className="border-neutral-200/60">
    <CardContent className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&color=fff&size=128`}
            alt={item.name}
            className="h-12 w-12 rounded-full object-cover border border-neutral-200"
          />
          <div className="min-w-0">
            <Link to={item.seller_id ? `/sellers/${item.seller_id}` : `/profile/${item.id}`} className="font-semibold text-neutral-900 hover:text-roman-500">
              {item.name}
            </Link>
            <p className="text-xs text-neutral-500 truncate">{item.bio || 'لا يوجد نبذة مختصرة'}</p>
          </div>
        </div>

        {!isOwnUser && (
          <button
            type="button"
            onClick={() => onToggleFollow(item.id, item.followed_by_viewer)}
            disabled={followPendingId === item.id}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
              item.followed_by_viewer
                ? 'bg-success-100 text-neutral-700 hover:bg-success-200'
                : 'bg-roman-500 text-white hover:bg-roman-600'
            }`}
          >
            {item.followed_by_viewer ? 'متابَع' : 'متابعة'}
          </button>
        )}
      </div>
    </CardContent>
  </Card>
);

const DashboardConnections = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('following');
  const [loading, setLoading] = useState(true);
  const [followPendingId, setFollowPendingId] = useState(null);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [counts, setCounts] = useState({ following: 0, followers: 0 });

  const loadConnections = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    try {
      const [followingResponse, followersResponse] = await Promise.all([
        api.community.getFollowing(user.id),
        api.community.getFollowers(user.id),
      ]);

      const nextFollowing = Array.isArray(followingResponse?.data) ? followingResponse.data : [];
      const nextFollowers = Array.isArray(followersResponse?.data) ? followersResponse.data : [];

      setFollowing(nextFollowing);
      setFollowers(nextFollowers);
      setCounts({
        following: Number(followingResponse?.meta?.total || nextFollowing.length),
        followers: Number(followersResponse?.meta?.total || nextFollowers.length),
      });
    } catch (error) {
      console.error('Failed to load followers/following list:', error);
      toast({
        variant: 'destructive',
        title: 'تعذر تحميل البيانات',
        description: 'حدث خطأ أثناء تحميل قائمة المتابعين.',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const updateLocalFollowState = (targetUserId, isFollowing) => {
    setFollowing((prev) => {
      const exists = prev.some((item) => item.id === targetUserId);
      if (isFollowing) {
        if (exists) {
          return prev.map((item) => (item.id === targetUserId ? { ...item, followed_by_viewer: true } : item));
        }

        const followerMatch = followers.find((item) => item.id === targetUserId);
        const fallback = followerMatch || {
          id: targetUserId,
          name: 'مستخدم',
          avatar: null,
          bio: '',
          followed_by_viewer: true,
        };
        return [{ ...fallback, followed_by_viewer: true }, ...prev];
      }

      return prev.filter((item) => item.id !== targetUserId);
    });

    setFollowers((prev) => prev.map((item) => (item.id === targetUserId ? { ...item, followed_by_viewer: isFollowing } : item)));

    setCounts((prev) => ({
      ...prev,
      following: Math.max(0, prev.following + (isFollowing ? 1 : -1)),
    }));
  };

  const handleToggleFollow = async (targetUserId, isCurrentlyFollowing) => {
    if (!user || followPendingId) {
      return;
    }

    const shouldFollow = !isCurrentlyFollowing;
    setFollowPendingId(targetUserId);

    try {
      const response = shouldFollow
        ? await api.community.followAuthor(targetUserId)
        : await api.community.unfollowAuthor(targetUserId);

      const nextFollowing = Boolean(response?.following ?? shouldFollow);
      updateLocalFollowState(targetUserId, nextFollowing);
    } catch (error) {
      console.error('Failed to toggle follow from dashboard:', error);
      toast({
        variant: 'destructive',
        title: 'تعذر تنفيذ العملية',
        description: 'حدث خطأ أثناء تحديث حالة المتابعة.',
      });
    } finally {
      setFollowPendingId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-2 text-neutral-900">
        <Users className="h-6 w-6 text-roman-500" />
        <h1 className="text-2xl font-bold">المتابعون والمتابَعون</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="following">أنت تتابع ({counts.following})</TabsTrigger>
          <TabsTrigger value="followers">يتابعونك ({counts.followers})</TabsTrigger>
        </TabsList>

        <TabsContent value="following" className="mt-6 space-y-3">
          {loading ? (
            <div className="text-sm text-neutral-500">جاري تحميل قائمة المتابَعين...</div>
          ) : following.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">لا تتابع أي حسابات حالياً</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link to="/community">اذهب إلى المجتمع</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            following.map((item) => (
              <ConnectionCard
                key={`following-${item.id}`}
                item={item}
                isOwnUser={item.id === user?.id}
                onToggleFollow={handleToggleFollow}
                followPendingId={followPendingId}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="followers" className="mt-6 space-y-3">
          {loading ? (
            <div className="text-sm text-neutral-500">جاري تحميل قائمة المتابعين...</div>
          ) : followers.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">لا يوجد متابعون حتى الآن</CardTitle>
              </CardHeader>
            </Card>
          ) : (
            followers.map((item) => (
              <ConnectionCard
                key={`followers-${item.id}`}
                item={item}
                isOwnUser={item.id === user?.id}
                onToggleFollow={handleToggleFollow}
                followPendingId={followPendingId}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardConnections;
