import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Switch } from '../ui/switch';
import { toast } from '../ui/use-toast';
import { adminApi } from '../../lib/api';
import { getStorageUrl } from '@/lib/assets';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

const AdminHomeSliders = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);

  const [form, setForm] = useState({
    media_type: 'image',
    media: null,
    target_url: '',
    display_order: 0,
    is_active: true,
  });

  const sortedSlides = useMemo(() => {
    return [...slides].sort((a, b) => {
      const aOrder = Number(a.display_order ?? 0);
      const bOrder = Number(b.display_order ?? 0);
      if (aOrder !== bOrder) return aOrder - bOrder;
      return Number(a.id) - Number(b.id);
    });
  }, [slides]);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getHomeSliders();
      if (response?.success) {
        setSlides(response.data || []);
      } else {
        setSlides([]);
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل سلايدر الرئيسية',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingSlide(null);
    setForm({
      media_type: 'image',
      media: null,
      target_url: '',
      display_order: 0,
      is_active: true,
    });
  };

  const openCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = (slide) => {
    setEditingSlide(slide);
    setForm({
      media_type: slide.media_type || 'image',
      media: null,
      target_url: slide.target_url || '',
      display_order: slide.display_order ?? 0,
      is_active: !!slide.is_active,
    });
    setIsDialogOpen(true);
  };

  const buildSubmitData = () => {
    const submitData = new FormData();
    submitData.append('media_type', form.media_type);
    submitData.append('is_active', form.is_active ? '1' : '0');
    submitData.append('display_order', String(Number(form.display_order ?? 0)));

    if (form.target_url && form.target_url.trim() !== '') {
      submitData.append('target_url', form.target_url.trim());
    } else {
      // allow clearing
      submitData.append('target_url', '');
    }

    if (form.media instanceof File) {
      submitData.append('media', form.media);
    }

    return submitData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submitData = buildSubmitData();

      if (!editingSlide && !(form.media instanceof File)) {
        toast({
          title: 'تنبيه',
          description: 'يرجى اختيار ملف (صورة أو فيديو)',
          variant: 'destructive',
        });
        return;
      }

      let response;
      if (editingSlide) {
        response = await adminApi.updateHomeSlider(editingSlide.id, submitData);
      } else {
        response = await adminApi.createHomeSlider(submitData);
      }

      if (response?.success) {
        toast({
          title: 'نجح',
          description: editingSlide ? 'تم تحديث السلايد بنجاح' : 'تم إنشاء السلايد بنجاح',
        });
        setIsDialogOpen(false);
        resetForm();
        fetchSlides();
      } else {
        toast({
          title: 'خطأ',
          description: response?.message || 'فشل في حفظ السلايد',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error?.response?.data?.message || error?.message || 'فشل في حفظ السلايد',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا السلايد؟')) return;

    try {
      const response = await adminApi.deleteHomeSlider(id);
      if (response?.success) {
        toast({
          title: 'نجح',
          description: 'تم حذف السلايد بنجاح',
        });
        fetchSlides();
      } else {
        toast({
          title: 'خطأ',
          description: response?.message || 'فشل في حذف السلايد',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error?.response?.data?.message || 'فشل في حذف السلايد',
        variant: 'destructive',
      });
    }
  };

  const renderPreview = (slide) => {
    const src = getStorageUrl(slide.media_url || slide.media_path);

    if (slide.media_type === 'video') {
      return (
        <video
          className="w-full h-40 object-cover rounded-md bg-black"
          src={src}
          muted
          playsInline
          controls
        />
      );
    }

    return (
      <img
        className="w-full h-40 object-cover rounded-md bg-neutral-100"
        src={src}
        alt={`Slide ${slide.id}`}
        loading="lazy"
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">سلايدر الرئيسية</h1>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="bg-roman-500 hover:bg-roman-500/90 text-white">
              <Plus className="ml-2 h-4 w-4" />
              إضافة سلايد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingSlide ? 'تعديل سلايد' : 'إضافة سلايد'}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-900">نوع الملف</label>
                <select
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={form.media_type}
                  onChange={(e) => setForm((prev) => ({ ...prev, media_type: e.target.value }))}
                >
                  <option value="image">صورة</option>
                  <option value="video">فيديو</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-900">
                  {editingSlide ? 'تغيير الملف (اختياري)' : 'الملف (مطلوب)'}
                </label>
                <Input
                  type="file"
                  accept={form.media_type === 'video' ? 'video/mp4,video/webm,video/ogg' : 'image/*'}
                  onChange={(e) => setForm((prev) => ({ ...prev, media: e.target.files?.[0] || null }))}
                />
                <p className="text-xs text-neutral-900/60">الحد الأقصى: 5MB</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-900">رابط الانتقال (اختياري)</label>
                <Input
                  value={form.target_url}
                  onChange={(e) => setForm((prev) => ({ ...prev, target_url: e.target.value }))}
                  placeholder="/explore أو https://example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-900">الترتيب</label>
                  <Input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm((prev) => ({ ...prev, display_order: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-900">نشط</label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.is_active}
                      onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))}
                    />
                    <span className="text-sm text-neutral-900/70">{form.is_active ? 'نشط' : 'غير نشط'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" className="bg-roman-500 hover:bg-roman-500/90 text-white">
                  {editingSlide ? 'حفظ التعديلات' : 'إنشاء'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-neutral-900">السلايدز</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-neutral-900/60">جاري التحميل...</div>
          ) : sortedSlides.length === 0 ? (
            <div className="py-10 text-center text-neutral-900/60">لا توجد سلايدز</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedSlides.map((slide) => (
                <Card key={slide.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    {renderPreview(slide)}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-neutral-900">
                        <div className="font-semibold">سلايد #{slide.id}</div>
                        <div className="text-neutral-900/60">ترتيب: {slide.display_order ?? 0}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {slide.is_active ? (
                          <Eye className="h-4 w-4 text-roman-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-neutral-500" />
                        )}
                      </div>
                    </div>

                    {slide.target_url ? (
                      <div className="text-xs text-neutral-900/60 break-all">{slide.target_url}</div>
                    ) : null}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => openEdit(slide)}
                      >
                        <Edit className="ml-2 h-4 w-4" />
                        تعديل
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleDelete(slide.id)}
                      >
                        <Trash2 className="ml-2 h-4 w-4" />
                        حذف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHomeSliders;
