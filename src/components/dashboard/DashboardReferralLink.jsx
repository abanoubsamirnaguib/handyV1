import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Link2, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getReferralInviteUrl } from '@/lib/referralUrl';

const DashboardReferralLink = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.id && !user?.referral_code) {
      refreshUser();
    }
  }, [user?.id, user?.referral_code, refreshUser]);

  const referralUrl = useMemo(() => getReferralInviteUrl(user), [user]);

  if (!user) return null;

  const handleCopy = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast({ title: 'تم النسخ', description: 'تم نسخ رابط الدعوة إلى الحافظة.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'تعذر النسخ',
        description: 'جرّب نسخ الرابط يدويًا.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="mb-6 border-roman-500/20 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-neutral-900">
            <Link2 className="h-5 w-5 text-roman-500 flex-shrink-0" />
            <h3 className="text-lg font-semibold">رابط الدعوة</h3>
          </div>
          <p className="text-sm text-neutral-600">
            شارك الرابط مع الأصدقاء للتسجيل عبر حسابك.
            {user.referral_code && (
              <span className="block mt-1 font-mono text-neutral-800">
                الكود: {user.referral_code}
              </span>
            )}
          </p>
          {referralUrl ? (
            <button
              type="button"
              onClick={handleCopy}
              className="w-full text-right rounded-lg border border-roman-500/25 bg-roman-500/5 px-4 py-3 text-sm text-neutral-900 break-all hover:bg-roman-500/10 focus:outline-none focus:ring-2 focus:ring-roman-500/40 transition-colors cursor-pointer"
            >
              <span className="inline-flex items-start gap-2 justify-end w-full">
                {copied ? (
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Link2 className="h-4 w-4 text-roman-500 flex-shrink-0 mt-0.5" />
                )}
                <span className="underline-offset-2 group-hover:underline">{referralUrl}</span>
              </span>
              <span className="block text-xs text-neutral-500 mt-2">
                انقر للنسخ إلى الحافظة
              </span>
            </button>
          ) : (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              لا يوجد رمز دعوة بعد. اطلب من المسؤول تشغيل أمر تعبئة رموز الإحالة، أو حدّث الصفحة لاحقًا.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardReferralLink;
