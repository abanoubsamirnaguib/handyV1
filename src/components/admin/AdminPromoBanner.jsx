import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Save } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { adminApi } from '@/lib/api';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

function toDatetimeLocalValue(isoOrEmpty) {
  if (!isoOrEmpty || typeof isoOrEmpty !== 'string') return '';
  const d = new Date(isoOrEmpty);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(local) {
  if (!local || !local.trim()) return '';
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString();
}

const AdminPromoBanner = () => {
  const { toast } = useToast();
  const { refreshSettings } = useSiteSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    enabled: false,
    title: '',
    description: '',
    linkUrl: '',
    timerLocal: '',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminApi.getSiteSettings();
        const p = res?.settings?.promoBanner;
        if (!cancelled && p) {
          setForm({
            enabled: Boolean(p.enabled),
            title: p.title || '',
            description: p.description || '',
            linkUrl: p.linkUrl || '',
            timerLocal: toDatetimeLocalValue(p.timerEnd),
          });
        }
      } catch (e) {
        if (!cancelled) {
          toast({
            title: 'تعذر تحميل الإعدادات',
            description: e?.message || 'حاول مرة أخرى',
            variant: 'destructive',
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateSiteSettings('promoBanner', {
        enabled: form.enabled,
        title: form.title.trim(),
        description: form.description.trim(),
        timerEnd: fromDatetimeLocalValue(form.timerLocal),
        linkUrl: form.linkUrl.trim(),
      });
      await refreshSettings();
      toast({
        title: 'تم الحفظ',
        description: 'تم تحديث البانر الترويجي.',
      });
    } catch (e) {
      toast({
        title: 'فشل الحفظ',
        description: e?.message || 'حاول مرة أخرى',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-[40vh] items-center justify-center text-muted-foreground"
      >
        جاري التحميل...
      </div>
    );
  }

  return (
    <motion.div
      dir="rtl"
      lang="ar"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto max-w-3xl px-4 py-8"
    >
      <Card className="border-blue-100 shadow-lg">
        <CardHeader className="space-y-1 text-start">
          <CardTitle className="flex items-center justify-start gap-2 text-2xl text-gray-800">
            البانر الترويجي
            <Sparkles className="h-7 w-7 shrink-0 text-violet-600" />
          </CardTitle>
          <CardDescription className="text-start">
            يظهر البانر أسفل القائمة في الصفحة الرئيسية وصفحة الاستكشاف فقط. يمكن للزائر إغلاقه
            أو سحبه جانباً على الجوال؛ بعد الإغلاق يبقى مخفياً لمدة ساعة ثم يظهر مرة أخرى إذا كان
            ما زال مفعّلاً.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-start">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border/80 bg-muted/30 px-4 py-3">
            <div className="min-w-0 flex-1 space-y-0.5">
              <Label htmlFor="promo-enabled" className="text-base">
                تفعيل البانر
              </Label>
              <p className="text-xs text-muted-foreground">
                عند التفعيل، تأكد من إدخال عنوان أو وصف على الأقل.
              </p>
            </div>
            <Switch
              id="promo-enabled"
              checked={form.enabled}
              onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: v }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-title">العنوان</Label>
            <Input
              id="promo-title"
              dir="rtl"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="مثال: تخفيضات نهاية الأسبوع"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-desc">الوصف</Label>
            <Textarea
              id="promo-desc"
              dir="rtl"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="وصف قصير يظهر تحت العنوان"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-timer">انتهاء العد التنازلي</Label>
            <Input
              id="promo-timer"
              type="datetime-local"
              dir="ltr"
              value={form.timerLocal}
              onChange={(e) =>
                setForm((f) => ({ ...f, timerLocal: e.target.value }))
              }
              className="text-start"
            />
            <p className="text-xs text-muted-foreground">
              اختياري. يظهر عدّاد بجانب النص حتى هذا التاريخ والوقت (بتوقيت جهازك).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-link">رابط الزر (اختياري)</Label>
            <Input
              id="promo-link"
              dir="ltr"
              value={form.linkUrl}
              onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
              placeholder="/explore أو https://..."
            />
            <p className="text-xs text-muted-foreground">
              روابط داخلية تبدأ بـ / أو رابطاً كاملاً يفتح في تاب جديد.
            </p>
          </div>

          <Button
            type="button"
            className="w-full gap-2 bg-violet-600 hover:bg-violet-700"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            <Save className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminPromoBanner;
