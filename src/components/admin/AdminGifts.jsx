import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Gift,
  Save,
  RefreshCw,
  Loader2,
  UserPlus,
  Wallet,
  Users,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';

const DEFAULT_SETTINGS = {
  enabled: true,
  registrationGiftAmount: 0,
  firstProductGiftAmount: 0,
  firstOrderGiftAmount: 0,
  maxLinkUses: 0,
};

const DEFAULT_TOTALS = {
  referrers_count: 0,
  referred_accounts_count: 0,
  rewards_count: 0,
  total_rewards_earned: 0,
};

const normalizeReferralSettings = (referralSettings = {}) => {
  const normalized = { ...DEFAULT_SETTINGS, ...referralSettings };

  if (normalized.registrationGiftAmount === undefined && normalized.bonusAmount !== undefined) {
    normalized.registrationGiftAmount = Number(normalized.bonusAmount || 0);
  }

  normalized.registrationGiftAmount = Number(normalized.registrationGiftAmount || 0);
  normalized.firstProductGiftAmount = Number(normalized.firstProductGiftAmount || 0);
  normalized.firstOrderGiftAmount = Number(normalized.firstOrderGiftAmount || 0);
  normalized.maxLinkUses = Number(normalized.maxLinkUses || 0);

  return normalized;
};

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} ج.م`;

const AdminGifts = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [giftSettings, setGiftSettings] = useState(DEFAULT_SETTINGS);
  const [summary, setSummary] = useState([]);
  const [totals, setTotals] = useState(DEFAULT_TOTALS);

  const loadData = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [settingsResponse, summaryResponse] = await Promise.all([
        adminApi.getSiteSettings(),
        adminApi.getReferralSummary(),
      ]);

      const referralsSettings = settingsResponse?.settings?.referrals || {};
      setGiftSettings(normalizeReferralSettings(referralsSettings));

      setSummary(summaryResponse?.summary || []);
      setTotals(summaryResponse?.totals || DEFAULT_TOTALS);
    } catch (error) {
      console.error('Failed to load gifts data:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'تعذر تحميل بيانات الهدايا.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'admin') {
      setLoading(false);
      return;
    }

    loadData();
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        enabled: !!giftSettings.enabled,
        registrationGiftAmount: Number(giftSettings.registrationGiftAmount || 0),
        firstProductGiftAmount: Number(giftSettings.firstProductGiftAmount || 0),
        firstOrderGiftAmount: Number(giftSettings.firstOrderGiftAmount || 0),
        maxLinkUses: Number(giftSettings.maxLinkUses || 0),
      };

      await adminApi.updateSiteSettings('referrals', payload);
      await loadData({ silent: true });

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ قيم الهدايا بنجاح.',
      });
    } catch (error) {
      console.error('Failed to save gift settings:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'تعذر حفظ قيم الهدايا.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 md:p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-700">غير مصرح لك بالدخول</h1>
        <p className="text-gray-500">هذه الصفحة مخصصة للمشرفين فقط.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-700">جاري تحميل صفحة الهدايا...</h2>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8" dir="rtl">
      <motion.div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة الهدايا</h1>
          <p className="text-gray-500 mt-1">إعداد قيم هدايا الدعوات ومتابعة المستفيدين منها.</p>
        </div>

        <Button
          variant="outline"
          onClick={() => loadData({ silent: true })}
          disabled={refreshing || saving}
        >
          {refreshing ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <RefreshCw className="ml-2 h-4 w-4" />}
          تحديث البيانات
        </Button>
      </motion.div>

      <Card className="border-blue-100 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">قيم الهدايا</CardTitle>
          <CardDescription>
            كل هدية يتم إضافتها إلى محفظة الهدايا للمشتري، ويمكن استخدامها في الدفع فقط ولا يمكن سحبها.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border bg-blue-50 p-4">
            <div>
              <div className="font-medium text-gray-800">تفعيل نظام هدايا الدعوات</div>
              <div className="text-sm text-gray-500">عند الإيقاف لن يتم منح أي هدايا جديدة حتى إعادة التفعيل.</div>
            </div>
            <Switch
              checked={!!giftSettings.enabled}
              onCheckedChange={(checked) => setGiftSettings((prev) => ({ ...prev, enabled: checked }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="registrationGiftAmount">قيمة الدخول أول مرة</Label>
              <Input
                id="registrationGiftAmount"
                type="number"
                min="0"
                step="1"
                value={giftSettings.registrationGiftAmount}
                onChange={(e) => setGiftSettings((prev) => ({ ...prev, registrationGiftAmount: Number(e.target.value || 0) }))}
              />
            </div>

            <div>
              <Label htmlFor="firstProductGiftAmount">قيمة رفع أول منتج</Label>
              <Input
                id="firstProductGiftAmount"
                type="number"
                min="0"
                step="1"
                value={giftSettings.firstProductGiftAmount}
                onChange={(e) => setGiftSettings((prev) => ({ ...prev, firstProductGiftAmount: Number(e.target.value || 0) }))}
              />
            </div>

            <div>
              <Label htmlFor="firstOrderGiftAmount">قيمة عمل أول أوردر مكتمل</Label>
              <Input
                id="firstOrderGiftAmount"
                type="number"
                min="0"
                step="1"
                value={giftSettings.firstOrderGiftAmount}
                onChange={(e) => setGiftSettings((prev) => ({ ...prev, firstOrderGiftAmount: Number(e.target.value || 0) }))}
              />
            </div>

            <div>
              <Label htmlFor="maxLinkUses">عدد مرات استخدام رابط الإحالة</Label>
              <Input
                id="maxLinkUses"
                type="number"
                min="0"
                step="1"
                value={giftSettings.maxLinkUses}
                onChange={(e) => setGiftSettings((prev) => ({ ...prev, maxLinkUses: Number(e.target.value || 0) }))}
              />
              <p className="text-xs text-gray-500 mt-1">0 = بدون حد أقصى</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving || refreshing} className="bg-blue-600 hover:bg-blue-700">
              {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
              حفظ قيم الهدايا
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-neutral-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">أصحاب روابط الدعوة</span>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-2">{totals.referrers_count}</div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">مسجلون عبر الروابط</span>
              <UserPlus className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-2">{totals.referred_accounts_count}</div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">عدد الهدايا</span>
              <Gift className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-2">{totals.rewards_count}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/40">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">إجمالي الهدايا الممنوحة</span>
              <Wallet className="h-4 w-4 text-green-700" />
            </div>
            <div className="text-2xl font-bold text-green-800 mt-2">{formatMoney(totals.total_rewards_earned)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md border-neutral-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">المستخدمون أصحاب روابط الدعوة</CardTitle>
          <CardDescription>عرض الحسابات التي سجلت عبر كل رابط وقيمة الهدايا المكتسبة.</CardDescription>
        </CardHeader>
        <CardContent>
          {summary.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
              لا توجد بيانات دعوات حتى الآن.
            </div>
          ) : (
            <div className="space-y-4">
              {summary.map((item) => (
                <div key={item.referrer.id} className="rounded-xl border bg-white p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="font-semibold text-gray-900">{item.referrer.name}</div>
                      <div className="text-xs text-gray-500">{item.referrer.email}</div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-green-700 mr-2">
                        <Sparkles className="h-3 w-3 ml-1" />
                        إجمالي مكتسب: {formatMoney(item.total_rewards_earned)}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                        رصيد المحفظة: {formatMoney(item.gift_wallet_balance)}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-right text-sm">
                      <thead>
                        <tr className="text-gray-500 border-b">
                          <th className="py-2 px-2">الحساب المسجل بالرابط</th>
                          <th className="py-2 px-2">إجمالي الهدايا منه</th>
                          <th className="py-2 px-2">تفاصيل الهدايا</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.referred_users.map((referred) => (
                          <tr key={referred.id} className="border-b last:border-0 align-top">
                            <td className="py-2 px-2">
                              <div className="font-medium text-gray-900">{referred.name}</div>
                              <div className="text-xs text-gray-500">{referred.email}</div>
                            </td>
                            <td className="py-2 px-2 font-semibold text-gray-900">{formatMoney(referred.earned_from_this_user)}</td>
                            <td className="py-2 px-2">
                              {referred.rewards.length === 0 ? (
                                <span className="text-xs text-gray-400">لا توجد هدايا بعد</span>
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {referred.rewards.map((reward) => (
                                    <span key={reward.id} className="text-xs rounded-full bg-neutral-100 border px-2 py-1 text-neutral-700">
                                      {reward.reward_type_label}: {formatMoney(reward.amount)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGifts;
