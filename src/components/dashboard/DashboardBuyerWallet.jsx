import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Gift, Users, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { getReferralInviteUrl } from '@/lib/referralUrl';

const defaultGiftData = {
  gift_wallet_balance: 0,
  total_earned_gift: 0,
  referred_users_count: 0,
  settings: {
    orderGiftAmount: 0,
    orderGiftLimitPerSeller: 0,
    referralSellerGiftAmount: 0,
    referralSellerLimitPerSeller: 0,
  },
  progress: {
    orders: { allowed: 0, count: 0, remaining: 0, percent: 0 },
    referrals: { allowed: 0, count: 0, remaining: 0, percent: 0 },
  },
  order_rewards: [],
  referral_seller_rewards: [],
};

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} جنيه`;

const ProgressBar = ({ title, value, colorClass, details }) => {
  const safePercent = Math.max(0, Math.min(100, Number(value || 0)));

  return (
    <div className="p-4 rounded-lg border bg-white space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-neutral-900">{title}</div>
        <div className="text-xs text-neutral-600">{safePercent.toFixed(0)}%</div>
      </div>

      <div className="h-3 w-full rounded-full bg-neutral-100 overflow-hidden">
        <div className={`h-full ${colorClass}`} style={{ width: `${safePercent}%` }} />
      </div>

      <div className="text-xs text-neutral-700">{details}</div>
    </div>
  );
};

const SellerGiftsWallet = ({ user }) => {
  const { toast } = useToast();
  const referralInviteUrl = useMemo(() => getReferralInviteUrl(user), [user]);
  const [loading, setLoading] = useState(true);
  const [giftData, setGiftData] = useState(defaultGiftData);

  const fetchGiftData = async () => {
    try {
      const res = await api.getMyReferrals();
      setGiftData({
        ...defaultGiftData,
        ...res,
        settings: {
          ...defaultGiftData.settings,
          ...(res?.settings || {}),
        },
        progress: {
          orders: {
            ...defaultGiftData.progress.orders,
            ...(res?.progress?.orders || {}),
          },
          referrals: {
            ...defaultGiftData.progress.referrals,
            ...(res?.progress?.referrals || {}),
          },
        },
        order_rewards: res?.order_rewards || [],
        referral_seller_rewards: res?.referral_seller_rewards || [],
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'تعذر تحميل بيانات الهدايا.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiftData();
  }, []);

  const copyReferralLink = async () => {
    if (!referralInviteUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(referralInviteUrl);
      toast({ title: 'تم النسخ', description: 'تم نسخ رابط الدعوة.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'تعذر نسخ الرابط.' });
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-neutral-700">جاري تحميل بيانات المحفظة...</div>;
  }

  const orderProgress = giftData.progress.orders;
  const referralProgress = giftData.progress.referrals;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Gift className="h-5 w-5 text-amber-600" />
            محفظة هدايا البائع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100">
              <div className="text-sm text-neutral-700">رصيد محفظة الهدايا</div>
              <div className="text-2xl font-bold text-neutral-900">{formatMoney(giftData.gift_wallet_balance)}</div>
              <div className="text-xs text-neutral-600 mt-1">للشراء فقط - غير قابل للسحب</div>
            </div>

            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
              <div className="text-sm text-neutral-700">إجمالي الهدايا المكتسبة</div>
              <div className="text-2xl font-bold text-neutral-900">{formatMoney(giftData.total_earned_gift)}</div>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <div className="text-sm text-neutral-700">المسجلون عبر رابطك</div>
              <div className="text-2xl font-bold text-neutral-900">{giftData.referred_users_count}</div>
            </div>

            <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="text-sm text-neutral-700">كود الدعوة</div>
              <div className="text-xl font-semibold text-neutral-900 break-all">{user?.referral_code || '—'}</div>
            </div>
          </div>

          {referralInviteUrl && (
            <div className="p-4 rounded-lg border bg-neutral-50">
              <div className="text-sm text-neutral-700 mb-2">رابط الدعوة الخاص بك</div>
              <div className="flex flex-col md:flex-row gap-2">
                <Input readOnly value={referralInviteUrl} className="bg-white" />
                <Button type="button" variant="outline" onClick={copyReferralLink}>
                  نسخ
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProgressBar
              title="بار هدايا استكمال الأوردرات"
              value={orderProgress.percent}
              colorClass="bg-green-500"
              details={`تم ${orderProgress.count} من ${orderProgress.allowed} | متبقي ${orderProgress.remaining}`}
            />
            <ProgressBar
              title="بار هدايا البائعين المسجلين"
              value={referralProgress.percent}
              colorClass="bg-blue-500"
              details={`تم ${referralProgress.count} من ${referralProgress.allowed} | متبقي ${referralProgress.remaining}`}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-green-600" />
            جدول هدايا استكمال الأوردرات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {giftData.order_rewards.length === 0 ? (
            <div className="text-sm text-neutral-600">لا توجد هدايا أوردرات حتى الآن.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-right">
                <thead>
                  <tr className="border-b text-neutral-600">
                    <th className="py-2 px-2">رقم الأوردر</th>
                    <th className="py-2 px-2">اسم المشتري</th>
                    <th className="py-2 px-2">قيمة الهدية</th>
                    <th className="py-2 px-2">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {giftData.order_rewards.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="py-2 px-2">#{row.order_id || '-'}</td>
                      <td className="py-2 px-2">{row?.buyer?.name || '-'}</td>
                      <td className="py-2 px-2 font-semibold text-green-700">+{formatMoney(row.amount)}</td>
                      <td className="py-2 px-2 text-neutral-600">{row.created_at ? new Date(row.created_at).toLocaleString('ar-EG') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            جدول هدايا المسجلين الجدد
          </CardTitle>
        </CardHeader>
        <CardContent>
          {giftData.referral_seller_rewards.length === 0 ? (
            <div className="text-sm text-neutral-600">لا توجد هدايا تسجيل بائعين جدد حتى الآن.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-right">
                <thead>
                  <tr className="border-b text-neutral-600">
                    <th className="py-2 px-2">اسم البائع المسجل</th>
                    <th className="py-2 px-2">أول منتج مقبول</th>
                    <th className="py-2 px-2">قيمة الهدية</th>
                    <th className="py-2 px-2">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {giftData.referral_seller_rewards.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="py-2 px-2">{row?.registered_seller?.name || '-'}</td>
                      <td className="py-2 px-2">{row.product_title || `#${row.product_id || '-'}`}</td>
                      <td className="py-2 px-2 font-semibold text-blue-700">+{formatMoney(row.amount)}</td>
                      <td className="py-2 px-2 text-neutral-600">{row.created_at ? new Date(row.created_at).toLocaleString('ar-EG') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const BuyerWallet = ({ user, refreshUser }) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ amount: '', payment_method: '', payment_details: '' });

  const allPaymentMethods = [
    { value: 'vodafone_cash', label: 'فودافون كاش' },
    { value: 'instapay', label: 'انستا باي' },
    { value: 'etisalat_cash', label: 'اتصالات كاش' },
    { value: 'orange_cash', label: 'أورانج كاش' },
    { value: 'bank_transfer', label: 'تحويل بنكي' },
  ];

  const fetchRequests = async () => {
    try {
      const res = await api.getBuyerWithdrawals();
      setRequests(res.withdrawal_requests || []);
    } catch (error) {
      // Ignore request errors in wallet history section.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    if (!form.amount || !form.payment_method || !form.payment_details) {
      toast({ title: 'خطأ', description: 'يرجى ملء جميع الحقول', variant: 'destructive' });
      return;
    }

    if (parseFloat(form.amount) > (user?.buyer_wallet_balance ?? 0)) {
      toast({ title: 'خطأ', description: 'المبلغ المطلوب أكبر من الرصيد المتاح', variant: 'destructive' });
      return;
    }

    try {
      const res = await api.createBuyerWithdrawalRequest(form);
      toast({ title: 'نجاح', description: res.message || 'تم إرسال طلب السحب بنجاح' });
      setShowDialog(false);
      setForm({ amount: '', payment_method: '', payment_details: '' });
      await fetchRequests();
      await refreshUser?.();
    } catch (error) {
      toast({ title: 'خطأ', description: 'تعذر إرسال طلب السحب', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <span className="inline-flex p-2 rounded-full bg-roman-500/10 text-roman-500">
                <DollarSign className="h-5 w-5" />
              </span>
              محفظتي
            </CardTitle>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600">سحب رصيد</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>طلب سحب رصيد</DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">المبلغ (جنيه)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="1"
                      min={1}
                      max={user?.buyer_wallet_balance ?? 0}
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      الرصيد المتاح: {Number(user?.buyer_wallet_balance ?? 0).toFixed(2)} جنيه
                    </p>
                  </div>

                  <div>
                    <Label>طريقة الدفع</Label>
                    <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر طريقة الدفع" />
                      </SelectTrigger>
                      <SelectContent>
                        {allPaymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="payment_details">بيانات الدفع</Label>
                    <Input
                      id="payment_details"
                      value={form.payment_details}
                      onChange={(e) => setForm({ ...form, payment_details: e.target.value })}
                      placeholder={form.payment_method === 'bank_transfer' ? 'رقم الحساب واسم البنك' : 'رقم المحفظة'}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                      إلغاء
                    </Button>
                    <Button type="submit" className="bg-green-500 hover:bg-green-600">
                      إرسال
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-success-50">
                <div className="text-sm text-neutral-900/70">الرصيد المتاح</div>
                <div className="text-2xl font-bold text-neutral-900">{Number(user?.buyer_wallet_balance ?? 0).toFixed(2)} جنيه</div>
              </div>
              <div className="p-4 rounded-lg bg-yellow-50">
                <div className="text-sm text-neutral-900/70">رصيد الهدايا (للشراء فقط)</div>
                <div className="text-2xl font-bold text-neutral-900">{Number(user?.gift_wallet_balance ?? 0).toFixed(2)} جنيه</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>طلبات السحب</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-neutral-700">جارِ التحميل...</div>
          ) : requests.length === 0 ? (
            <div className="text-sm text-neutral-700">لا توجد طلبات سحب بعد</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-right">
                <thead>
                  <tr className="text-neutral-700 border-b">
                    <th className="p-2">#</th>
                    <th className="p-2">المبلغ</th>
                    <th className="p-2">طريقة الدفع</th>
                    <th className="p-2">البيانات</th>
                    <th className="p-2">الحالة</th>
                    <th className="p-2">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="p-2">{row.id}</td>
                      <td className="p-2">{Number(row.amount).toFixed(2)} جنيه</td>
                      <td className="p-2">{row.payment_method}</td>
                      <td className="p-2">{row.payment_details}</td>
                      <td className="p-2">{row.status}</td>
                      <td className="p-2">{row.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const DashboardBuyerWallet = () => {
  const { user, refreshUser } = useAuth();
  const isSellerView = user?.active_role === 'seller';

  if (isSellerView) {
    return <SellerGiftsWallet user={user} />;
  }

  return <BuyerWallet user={user} refreshUser={refreshUser} />;
};

export default DashboardBuyerWallet;
