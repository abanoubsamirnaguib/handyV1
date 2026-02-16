import React, { useState } from 'react';
import { Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const PhoneRequiredModal = ({ isOpen, onClose, onSubmit, canSkip = false }) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate Egyptian phone number
    const phoneRegex = /^(010|011|012|015)[0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      toast({
        variant: "destructive",
        title: "رقم الهاتف غير صحيح",
        description: "يرجى إدخال رقم هاتف مصري صحيح (يبدأ بـ 010، 011، 012، أو 015 ويتكون من 11 رقم)",
      });
      return;
    }

    setIsLoading(true);
    const success = await onSubmit(phone);
    setIsLoading(false);

    if (success) {
      setPhone('');
      onClose();
    }
  };

  const handleSkip = () => {
    setPhone('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={canSkip ? onClose : undefined}>
      <DialogContent className="sm:max-w-md" hideCloseButton={!canSkip}>
        <DialogHeader>
          <div className="mx-auto p-3 bg-roman-500/10 rounded-full w-fit mb-4">
            <Phone className="h-8 w-8 text-roman-500" />
          </div>
          <DialogTitle className="text-center text-2xl">أضف رقم هاتفك</DialogTitle>
          <DialogDescription className="text-center">
            نحتاج إلى رقم هاتفك للتواصل معك بخصوص طلباتك ومنتجاتك
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone-modal" className="text-neutral-900">رقم الهاتف</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-roman-500/60" />
              <Input 
                id="phone-modal" 
                type="tel" 
                placeholder="01012345678" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
                maxLength={11}
                className="pr-10 border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20"
                autoFocus
              />
            </div>
            <p className="text-xs text-neutral-600">رقم مصري (يبدأ بـ 010، 011، 012، أو 015)</p>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button 
              type="submit" 
              className="w-full bg-roman-500 hover:bg-roman-500/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'جاري الحفظ...' : 'حفظ رقم الهاتف'}
            </Button>
            {canSkip && (
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-neutral-600"
                onClick={handleSkip}
                disabled={isLoading}
              >
                تخطي الآن
              </Button>
            )}
          </DialogFooter>
        </form>

        {!canSkip && (
          <p className="text-xs text-center text-neutral-600 mt-2">
            يجب إضافة رقم الهاتف للمتابعة
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PhoneRequiredModal;
