import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Gift,
  Save,
  RefreshCw,
  Loader2,
  Wallet,
  Users,
  ShoppingBag,
  BadgeDollarSign,
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
  orderGiftAmount: 0,
  orderGiftLimitPerSeller: 0,
  referralSellerGiftAmount: 0,
  referralSellerLimitPerSeller: 0,
};

const DEFAULT_TOTALS = {
  sellers_count: 0,
  referred_accounts_count: 0,
  order_gifts_count: 0,
  referral_seller_gifts_count: 0,
  rewards_count: 0,
  total_rewards_earned: 0,
  total_gift_wallet_balance: 0,
};

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} ج.م`;

const normalizeGiftSettings = (settings = {}) => {
  const normalized = { ...DEFAULT_SETTINGS, ...settings };

  normalized.orderGiftAmount = Number(normalized.orderGiftAmount || normalized.firstOrderGiftAmount || 0);
  normalized.orderGiftLimitPerSeller = Number(normalized.orderGiftLimitPerSeller || 0);
  normalized.referralSellerGiftAmount = Number(normalized.referralSellerGiftAmount || normalized.firstProductGiftAmount || 0);
  normalized.referralSellerLimitPerSeller = Number(normalized.referralSellerLimitPerSeller || normalized.maxLinkUses || 0);

  return normalized;
};

const ProgressBar = ({ title, count, allowed, remaining, percent, colorClass }) => (
  <div className="rounded-lg border p-3 bg-white">
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm font-semibold text-gray-800">{title}</div>
      <div className="text-xs text-gray-500">{Number(percent || 0).toFixed(0)}%</div>
    </div>

    <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden mb-2">
      <div className={`h-full ${colorClass}`} style={{ width: `${Math.max(0, Math.min(100, Number(percent || 0)))}%` }} />
    </div>

    <div className="text-xs text-gray-600">تم {count} من {allowed} - المتبقي {remaining}</div>
  </div>
);

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
      setGiftSettings(normalizeGiftSettings(referralsSettings));

      setSummary(summaryResponse?.summary || []);
      setTotals({ ...DEFAULT_TOTALS, ...(summaryResponse?.totals || {}) });
    } catch (error) {
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
    if (!['admin', 'super_admin'].includes(user?.role)) {
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
        orderGiftAmount: Number(giftSettings.orderGiftAmount || 0),
        orderGiftLimitPerSeller: Number(giftSettings.orderGiftLimitPerSeller || 0),
        referralSellerGiftAmount: Number(giftSettings.referralSellerGiftAmount || 0),
        referralSellerLimitPerSeller: Number(giftSettings.referralSellerLimitPerSeller || 0),
      };

      await adminApi.updateSiteSettings('referrals', payload);
      await loadData({ silent: true });

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ إعدادات الهدايا بنجاح.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'تعذر حفظ إعدادات الهدايا.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!['admin', 'super_admin'].includes(user?.role)) {
    return (
      <div className="p-6 md:p-8 text-center" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-700">غير مصرح لك بالدخول</h1>
        <p className="text-gray-500">هذه الصفحة مخصصة للمشرفين فقط.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 text-center" dir="rtl">
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
          <h1 className="text-3xl font-bold text-gray-800">إدارة هدايا البائعين</h1>
          <p className="text-gray-500 mt-1">إعدادات الهدايا ومتابعة تفاصيل كل بائع.</p>
        </div>

        <Button variant="outline" onClick={() => loadData({ silent: true })} disabled={refreshing || saving}>
          {refreshing ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <RefreshCw className="ml-2 h-4 w-4" />}
          تحديث البيانات
        </Button>
      </motion.div>

      <Card className="border-blue-100 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">إعدادات الهدايا</CardTitle>
          <CardDescription>
            يتم إضافة كل الهدايا إلى محفظة الهدايا للبائع (للشراء فقط - غير قابلة للسحب).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border bg-blue-50 p-4">
            <div>
              <div className="font-medium text-gray-800">تفعيل نظام الهدايا</div>
              <div className="text-sm text-gray-500">عند الإيقاف لن تُمنح هدايا جديدة.</div>
            </div>
            <Switch
              checked={!!giftSettings.enabled}
              onCheckedChange={(checked) => setGiftSettings((prev) => ({ ...prev, enabled: checked }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="orderGiftLimitPerSeller">عدد الأوردرات المسموح بها لكل بائع</Label>
              <Input
                id="orderGiftLimitPerSeller"
                type="number"
                min="0"
                step="1"
                value={giftSettings.orderGiftLimitPerSeller}
                onChange={(e) => setGiftSettings((prev) => ({ ...prev, orderGiftLimitPerSeller: Number(e.target.value || 0) }))}
              />
            </div>

            <div>
              <Label htmlFor="orderGiftAmount">قيمة الهدية لكل أوردر مكتمل</Label>
              <Input
                id="orderGiftAmount"
                type="number"
                min="0"
                step="1"
                value={giftSettings.orderGiftAmount}
                onChange={(e) => setGiftSettings((prev) => ({ ...prev, orderGiftAmount: Number(e.target.value || 0) }))}
              />
            </div>

            <div>
              <Label htmlFor="referralSellerLimitPerSeller">عدد المسجلين المسموح لكل بائع</Label>
              <Input
                id="referralSellerLimitPerSeller"
                type="number"
                min="0"
                step="1"
                value={giftSettings.referralSellerLimitPerSeller}
                onChange={(e) => setGiftSettings((prev) => ({ ...prev, referralSellerLimitPerSeller: Number(e.target.value || 0) }))}
              />
            </div>

            <div>
              <Label htmlFor="referralSellerGiftAmount">قيمة هدية كل بائع مسجل ناجح</Label>
              <Input
                id="referralSellerGiftAmount"
                type="number"
                min="0"
                step="1"
                value={giftSettings.referralSellerGiftAmount}
                onChange={(e) => setGiftSettings((prev) => ({ ...prev, referralSellerGiftAmount: Number(e.target.value || 0) }))}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving || refreshing} className="bg-blue-600 hover:bg-blue-700">
              {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
              حفظ الإعدادات
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-neutral-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">عدد البائعين</span>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-2">{totals.sellers_count}</div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">هدايا الأوردرات</span>
              <ShoppingBag className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-2">{totals.order_gifts_count}</div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">هدايا المسجلين</span>
              <Gift className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-2">{totals.referral_seller_gifts_count}</div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">إجمالي الهدايا</span>
              <BadgeDollarSign className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-2">{formatMoney(totals.total_rewards_earned)}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/40">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">إجمالي رصيد محافظ الهدايا</span>
              <Wallet className="h-4 w-4 text-green-700" />
            </div>
            <div className="text-2xl font-bold text-green-800 mt-2">{formatMoney(totals.total_gift_wallet_balance)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md border-neutral-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">تفاصيل الهدايا لكل بائع</CardTitle>
          <CardDescription>يشمل كل سجلات الهدايا للأوردرات المكتملة وهدايا تسجيل البائعين الجدد.</CardDescription>
        </CardHeader>
        <CardContent>
          {summary.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
              لا توجد بيانات هدايا للبائعين حتى الآن.
            </div>
          ) : (
            <div className="space-y-6">
              {summary.map((item) => (
                <div key={item.seller.id} className="rounded-xl border bg-white p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="font-semibold text-gray-900">{item.seller.name}</div>
                      <div className="text-xs text-gray-500">{item.seller.email}</div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-green-50 border border-green-100 px-3 py-1 text-green-700">
                        رصيد محفظة الهدايا: {formatMoney(item.gift_wallet_balance)}
                      </span>
                      <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-blue-700">
                        إجمالي الهدايا: {formatMoney(item.total_rewards_earned)}
                      </span>
                      <span className="rounded-full bg-amber-50 border border-amber-100 px-3 py-1 text-amber-700">
                        إجمالي مبيعات الأوردرات المكتملة: {formatMoney(item.completed_orders_metrics?.total_revenue)}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <ProgressBar
                      title="تقدم هدايا الأوردرات"
                      count={item.order_gifts.count}
                      allowed={item.order_gifts.allowed}
                      remaining={item.order_gifts.remaining}
                      percent={item.order_gifts.progress_percent}
                      colorClass="bg-green-500"
                    />

                    <ProgressBar
                      title="تقدم هدايا تسجيل البائعين"
                      count={item.referral_seller_gifts.count}
                      allowed={item.referral_seller_gifts.allowed}
                      remaining={item.referral_seller_gifts.remaining}
                      percent={item.referral_seller_gifts.progress_percent}
                      colorClass="bg-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3 bg-neutral-50">
                      <div className="font-medium text-gray-800 mb-3">جدول هدايا الأوردرات</div>
                      {item.order_gifts.rows.length === 0 ? (
                        <div className="text-sm text-gray-500">لا توجد هدايا أوردرات.</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs text-right">
                            <thead>
                              <tr className="border-b text-gray-500">
                                <th className="py-2 px-2">رقم الأوردر</th>
                                <th className="py-2 px-2">اسم العميل</th>
                                <th className="py-2 px-2">قيمة الهدية</th>
                                <th className="py-2 px-2">التاريخ</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.order_gifts.rows.map((row) => (
                                <tr key={row.id} className="border-b last:border-0">
                                  <td className="py-2 px-2">#{row.order_id || '-'}</td>
                                  <td className="py-2 px-2">{row.buyer_name || '-'}</td>
                                  <td className="py-2 px-2 font-semibold text-green-700">+{formatMoney(row.amount)}</td>
                                  <td className="py-2 px-2 text-gray-500">
                                    {row.created_at ? new Date(row.created_at).toLocaleString('ar-EG') : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div className="rounded-lg border p-3 bg-neutral-50">
                      <div className="font-medium text-gray-800 mb-3">جدول هدايا البائعين الجدد</div>
                      {item.referral_seller_gifts.rows.length === 0 ? (
                        <div className="text-sm text-gray-500">لا توجد هدايا تسجيل بائعين.</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs text-right">
                            <thead>
                              <tr className="border-b text-gray-500">
                                <th className="py-2 px-2">اسم البائع المسجل</th>
                                <th className="py-2 px-2">أول منتج مقبول</th>
                                <th className="py-2 px-2">قيمة الهدية</th>
                                <th className="py-2 px-2">التاريخ</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.referral_seller_gifts.rows.map((row) => (
                                <tr key={row.id} className="border-b last:border-0">
                                  <td className="py-2 px-2">{row.registered_seller_name || '-'}</td>
                                  <td className="py-2 px-2">{row.product_title || `#${row.product_id || '-'}`}</td>
                                  <td className="py-2 px-2 font-semibold text-blue-700">+{formatMoney(row.amount)}</td>
                                  <td className="py-2 px-2 text-gray-500">
                                    {row.created_at ? new Date(row.created_at).toLocaleString('ar-EG') : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
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
