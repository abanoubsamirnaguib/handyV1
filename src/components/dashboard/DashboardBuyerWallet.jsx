import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const DashboardBuyerWallet = () => {
  const { user, refreshUser } = useAuth();
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
    { value: 'bank_transfer', label: 'تحويل بنكي' }
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.getBuyerWithdrawals();
      setRequests(res.withdrawal_requests || []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

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
    } catch (e) {
      toast({ title: 'خطأ', description: 'تعذر إرسال طلب السحب', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <span className="ml-2 inline-flex p-2 rounded-full bg-roman-500/10 text-roman-500"><DollarSign className="h-5 w-5" /></span>
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
                    <Input id="amount" type="number" min={1} max={user?.buyer_wallet_balance ?? 0} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                    <p className="text-sm text-gray-500 mt-1">الرصيد المتاح: {(user?.buyer_wallet_balance ?? 0).toFixed?.(2) || Number(user?.buyer_wallet_balance ?? 0).toFixed(2)} جنيه</p>
                  </div>
                  <div>
                    <Label>طريقة الدفع</Label>
                    <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر طريقة الدفع" />
                      </SelectTrigger>
                      <SelectContent>
                        {allPaymentMethods.map(m => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="payment_details">بيانات الدفع</Label>
                    <Input id="payment_details" value={form.payment_details} onChange={(e) => setForm({ ...form, payment_details: e.target.value })} placeholder={form.payment_method === 'bank_transfer' ? 'رقم الحساب واسم البنك' : 'رقم المحفظة'} />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
                    <Button type="submit" className="bg-green-500 hover:bg-green-600">إرسال</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-success-50">
                <div className="text-sm text-neutral-900/70">الرصيد المتاح</div>
                <div className="text-2xl font-bold text-neutral-900">{(user?.buyer_wallet_balance ?? 0).toFixed?.(2) || Number(user?.buyer_wallet_balance ?? 0).toFixed(2)} جنيه</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle>طلبات السحب</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-neutral-900/70">جارِ التحميل...</div>
            ) : requests.length === 0 ? (
              <div className="text-sm text-neutral-900/70">لا توجد طلبات سحب بعد</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-right">
                  <thead>
                    <tr className="text-neutral-900/70">
                      <th className="p-2">#</th>
                      <th className="p-2">المبلغ</th>
                      <th className="p-2">طريقة الدفع</th>
                      <th className="p-2">البيانات</th>
                      <th className="p-2">الحالة</th>
                      <th className="p-2">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="p-2">{r.id}</td>
                        <td className="p-2">{Number(r.amount).toFixed(2)} جنيه</td>
                        <td className="p-2">{r.payment_method}</td>
                        <td className="p-2">{r.payment_details}</td>
                        <td className="p-2">{r.status}</td>
                        <td className="p-2">{r.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardBuyerWallet;


