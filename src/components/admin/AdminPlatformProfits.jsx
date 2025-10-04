import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { Loader2, Filter } from 'lucide-react';

const AdminPlatformProfits = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [profits, setProfits] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ seller_id: '', city_id: '', date_from: '', date_to: '' });
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchProfits();
    loadCities();
  }, [user]);

  const loadCities = async () => {
    try {
      setCitiesLoading(true);
      const res = await adminApi.getCities({ per_page: 100 });
      const list = res?.data?.data || res?.data || res || [];
      setCities(Array.isArray(list) ? list : []);
    } catch (e) {
      // ignore
    } finally {
      setCitiesLoading(false);
    }
  };

  const fetchProfits = async (params = {}) => {
    try {
      setLoading(true);
      const res = await adminApi.getPlatformProfits(params);
      const totalAmount = res?.total ?? 0;
      const list = res?.data?.data || res?.data || [];
      const rows = Array.isArray(list) ? list : [];
      setTotal(Number(totalAmount) || 0);
      setProfits(rows);
    } catch (e) {
      console.error('Failed to load platform profits', e);
      toast({ variant: 'destructive', title: 'خطأ', description: 'تعذر تحميل أرباح المنصة' });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const params = {};
    if (filters.seller_id) params.seller_id = filters.seller_id;
    if (filters.city_id) params.city_id = filters.city_id;
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    fetchProfits(params);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 md:p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-700">غير مصرح لك بالدخول</h1>
        <p className="text-gray-500">هذه الصفحة مخصصة للمشرفين فقط.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">أرباح المنصة</h1>
          <p className="text-gray-500 mt-1">إجمالي الأرباح وتفاصيل الأرباح لكل طلب مكتمل</p>
        </div>
      </motion.div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">ملخص</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border bg-green-50">
              <div className="text-gray-600">إجمالي أرباح المنصة</div>
              <div className="text-2xl font-bold">{Number(total).toFixed(2)} ج.م</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Filter className="w-5 h-5" /> فلاتر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">معرّف البائع</label>
              <Input value={filters.seller_id} onChange={(e) => setFilters({ ...filters, seller_id: e.target.value })} placeholder="ID" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المدينة</label>
              <select
                value={filters.city_id}
                onChange={(e) => setFilters({ ...filters, city_id: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                disabled={citiesLoading}
              >
                <option value="">الكل</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">من تاريخ</label>
              <Input type="date" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">إلى تاريخ</label>
              <Input type="date" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} />
            </div>
            <div>
              <Button onClick={applyFilters} className="w-full" disabled={loading}>
                {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : 'تطبيق'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">تفاصيل الأرباح</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <div className="text-gray-600">جاري التحميل...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">#الطلب</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المدينة</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نسبة العمولة</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">قيمة الربح (ج.م)</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profits.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-2">{row.order_id}</td>
                      <td className="px-4 py-2">{row.city?.name || '-'}</td>
                      <td className="px-4 py-2">{Number(row.commission_percent || 0)}%</td>
                      <td className="px-4 py-2 font-semibold">{Number(row.amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-2">{new Date(row.calculated_on || row.created_at).toLocaleString()}</td>
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

export default AdminPlatformProfits;
