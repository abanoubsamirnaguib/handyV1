import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Edit, Trash2, Save, X, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';

const AdminCities = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newCity, setNewCity] = useState({ name: '', delivery_fee: '', platform_commission_percent: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', delivery_fee: '', platform_commission_percent: '' });

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchCities();
  }, [user]);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCities({ per_page: 100 });
      const list = res?.data?.data || res?.data || res || [];
      setCities(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Failed to load cities', e);
      toast({ variant: 'destructive', title: 'خطأ', description: 'تعذر تحميل المدن' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCity.name || newCity.delivery_fee === '' || newCity.platform_commission_percent === '') {
      toast({ variant: 'destructive', title: 'بيانات ناقصة', description: 'أكمل الحقول المطلوبة' });
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: newCity.name,
        delivery_fee: Number(newCity.delivery_fee),
        platform_commission_percent: Number(newCity.platform_commission_percent),
      };
      const res = await adminApi.createCity(payload);
      setCities(prev => [...prev, res.data || res]);
      setNewCity({ name: '', delivery_fee: '', platform_commission_percent: '' });
      setIsAdding(false);
      toast({ title: 'تمت الإضافة', description: 'تمت إضافة المدينة بنجاح' });
    } catch (e) {
      console.error('Create city failed', e);
      toast({ variant: 'destructive', title: 'خطأ', description: 'تعذر إضافة المدينة' });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (city) => {
    setEditingId(city.id);
    setEditForm({
      name: city.name,
      delivery_fee: city.delivery_fee,
      platform_commission_percent: city.platform_commission_percent,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', delivery_fee: '', platform_commission_percent: '' });
  };

  const saveEdit = async (id) => {
    try {
      setSaving(true);
      const payload = {
        name: editForm.name,
        delivery_fee: Number(editForm.delivery_fee),
        platform_commission_percent: Number(editForm.platform_commission_percent),
      };
      const res = await adminApi.updateCity(id, payload);
      const updated = res.data || res;
      setCities(prev => prev.map(c => (c.id === id ? updated : c)));
      setEditingId(null);
      toast({ title: 'تم الحفظ', description: 'تم تحديث المدينة بنجاح' });
    } catch (e) {
      console.error('Update city failed', e);
      toast({ variant: 'destructive', title: 'خطأ', description: 'تعذر تحديث المدينة' });
    } finally {
      setSaving(false);
    }
  };

  const deleteCity = async (id) => {
    try {
      setSaving(true);
      await adminApi.deleteCity(id);
      setCities(prev => prev.filter(c => c.id !== id));
      toast({ title: 'تم الحذف', description: 'تم حذف المدينة' });
    } catch (e) {
      console.error('Delete city failed', e);
      toast({ variant: 'destructive', title: 'خطأ', description: 'تعذر حذف المدينة' });
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
        <h2 className="text-lg font-semibold text-gray-700">جاري تحميل المدن...</h2>
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
          <h1 className="text-3xl font-bold text-gray-800">إدارة المدن</h1>
          <p className="text-gray-500 mt-1">إضافة وتعديل وحذف المدن ورسومها ونسبة عمولة المنصة</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700" disabled={isAdding || saving}>
          {saving ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <PlusCircle className="ml-2 h-5 w-5" />}
          إضافة مدينة
        </Button>
      </motion.div>

      {isAdding && (
        <Card className="border-blue-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">مدينة جديدة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم المدينة</label>
                <Input value={newCity.name} onChange={(e) => setNewCity({ ...newCity, name: e.target.value })} placeholder="مثال: القاهرة" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رسوم التوصيل (ج.م)</label>
                <Input type="number" step="1" value={newCity.delivery_fee} onChange={(e) => setNewCity({ ...newCity, delivery_fee: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نسبة عمولة المنصة (%)</label>
                <Input type="number" step="1" value={newCity.platform_commission_percent} onChange={(e) => setNewCity({ ...newCity, platform_commission_percent: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="flex gap-3 mt-4 justify-end">
              <Button variant="outline" onClick={() => setIsAdding(false)} disabled={saving}><X className="ml-2 h-4 w-4" />إلغاء</Button>
              <Button onClick={handleAdd} disabled={saving}><Save className="ml-2 h-4 w-4" />حفظ</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">المدن</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المدينة</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رسوم التوصيل</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نسبة العمولة (%)</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cities.map((city) => (
                  <tr key={city.id}>
                    <td className="px-4 py-2">
                      {editingId === city.id ? (
                        <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                      ) : (
                        <span className="font-medium">{city.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editingId === city.id ? (
                        <Input type="number" step="1" value={editForm.delivery_fee} onChange={(e) => setEditForm({ ...editForm, delivery_fee: e.target.value })} />
                      ) : (
                        <span>{Number(city.delivery_fee || 0)} ج.م</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editingId === city.id ? (
                        <Input type="number" step="1" value={editForm.platform_commission_percent} onChange={(e) => setEditForm({ ...editForm, platform_commission_percent: e.target.value })} />
                      ) : (
                        <span>{Number(city.platform_commission_percent || 0)}%</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-left rtl:text-right whitespace-nowrap">
                      {editingId === city.id ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit(city.id)} disabled={saving}><Save className="ml-2 h-4 w-4" />حفظ</Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} disabled={saving}><X className="ml-2 h-4 w-4" />إلغاء</Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(city)}><Edit className="ml-2 h-4 w-4" />تعديل</Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteCity(city.id)} disabled={saving}><Trash2 className="ml-2 h-4 w-4" />حذف</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCities;
