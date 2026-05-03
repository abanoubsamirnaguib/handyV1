import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { sellerApi } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

function isoToDatetimeLocal(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

export default function SellerProductDiscountDialog({ open, onOpenChange, product, onSaved }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [discountType, setDiscountType] = useState('none');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [discountFixed, setDiscountFixed] = useState('');
  const [schedule, setSchedule] = useState('always');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  useEffect(() => {
    if (!open || !product) return;
    const t = product.discount_type || 'none';
    setDiscountType(t === 'percentage' || t === 'fixed' ? t : 'none');
    setDiscountPercentage(
      product.discount_percentage != null ? String(product.discount_percentage) : ''
    );
    setDiscountFixed(
      product.discount_fixed_amount != null ? String(product.discount_fixed_amount) : ''
    );
    const sch = product.discount_schedule || 'always';
    setSchedule(sch === 'scheduled' ? 'scheduled' : 'always');
    setStartsAt(isoToDatetimeLocal(product.discount_starts_at));
    setEndsAt(isoToDatetimeLocal(product.discount_ends_at));
  }, [open, product]);

  const handleSubmit = async () => {
    if (!product?.id) return;

    if (discountType !== 'none') {
      if (discountType === 'percentage') {
        const n = parseFloat(String(discountPercentage).replace(',', '.'));
        if (!Number.isFinite(n) || n <= 0 || n > 100) {
          toast({
            variant: 'destructive',
            title: 'نسبة غير صحيحة',
            description: 'أدخل نسبة بين 0.01 و 100.',
          });
          return;
        }
      }
      if (discountType === 'fixed') {
        const n = parseFloat(String(discountFixed).replace(',', '.'));
        if (!Number.isFinite(n) || n <= 0) {
          toast({
            variant: 'destructive',
            title: 'قيمة غير صحيحة',
            description: 'أدخل قيمة خصم أكبر من صفر.',
          });
          return;
        }
        if (n >= Number(product.price)) {
          toast({
            variant: 'destructive',
            title: 'قيمة كبيرة جداً',
            description: 'يجب أن يكون الخصم أقل من سعر المنتج.',
          });
          return;
        }
      }

      if (schedule === 'scheduled') {
        if (!startsAt || !endsAt) {
          toast({
            variant: 'destructive',
            title: 'التواريخ مطلوبة',
            description: 'حدّد تاريخ ووقت البداية والنهاية للعرض.',
          });
          return;
        }
        if (new Date(endsAt) <= new Date(startsAt)) {
          toast({
            variant: 'destructive',
            title: 'الفترة غير صحيحة',
            description: 'يجب أن يكون نهاية العرض بعد بدايته.',
          });
          return;
        }
      }
    }

    let payload;
    if (discountType === 'none') {
      payload = { discount_type: 'none' };
    } else {
      payload = {
        discount_type: discountType,
        discount_schedule: schedule,
        discount_percentage:
          discountType === 'percentage'
            ? parseFloat(String(discountPercentage).replace(',', '.'))
            : null,
        discount_fixed_amount:
          discountType === 'fixed'
            ? parseFloat(String(discountFixed).replace(',', '.'))
            : null,
        discount_starts_at: schedule === 'scheduled' ? new Date(startsAt).toISOString() : null,
        discount_ends_at: schedule === 'scheduled' ? new Date(endsAt).toISOString() : null,
      };
    }

    try {
      setSaving(true);
      const res = await sellerApi.updateProductDiscount(product.id, payload);
      toast({
        title: 'تم الحفظ',
        description: res.message || 'تم تحديث إعدادات الخصم.',
      });
      if (res.product && typeof onSaved === 'function') {
        onSaved(res.product);
      }
      onOpenChange(false);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'فشل الحفظ',
        description: e.message || 'تعذر حفظ الخصم.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-right" dir="rtl">
        <DialogHeader>
          <DialogTitle>خصم على المنتج</DialogTitle>
          <DialogDescription className="text-right">
            {product?.title ? `إعداد عرض السعر لـ «${product.title}» — السعر الأساسي: ${product.price} ج.م` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>نوع العرض</Label>
            <Select value={discountType} onValueChange={setDiscountType}>
              <SelectTrigger>
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">لا يوجد عرض</SelectItem>
                <SelectItem value="percentage">نسبة مئوية</SelectItem>
                <SelectItem value="fixed">خصم مبلغ ثابت</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {discountType === 'percentage' && (
            <div className="space-y-2">
              <Label htmlFor="disc-pct">نسبة الخصم (%)</Label>
              <Input
                id="disc-pct"
                type="number"
                step="0.01"
                min="0.01"
                max="100"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
              />
            </div>
          )}

          {discountType === 'fixed' && (
            <div className="space-y-2">
              <Label htmlFor="disc-fixed">قيمة الخصم (جنيه)</Label>
              <Input
                id="disc-fixed"
                type="number"
                step="0.01"
                min="0.01"
                value={discountFixed}
                onChange={(e) => setDiscountFixed(e.target.value)}
              />
            </div>
          )}

          {discountType !== 'none' && (
            <>
              <div className="space-y-2">
                <Label>مدة العرض</Label>
                <Select value={schedule} onValueChange={setSchedule}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">طوال الوقت</SelectItem>
                    <SelectItem value="scheduled">فترة محددة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {schedule === 'scheduled' && (
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="disc-start">يبدأ في</Label>
                    <Input
                      id="disc-start"
                      type="datetime-local"
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disc-end">ينتهي في</Label>
                    <Input
                      id="disc-end"
                      type="datetime-local"
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 flex-row-reverse">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-roman-500 hover:bg-roman-500/90">
            {saving ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              'حفظ'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
