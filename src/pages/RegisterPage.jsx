import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Briefcase, Eye, EyeOff, ShoppingBag, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, loading, sendEmailVerificationOTP } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(searchParams.get('role') || 'buyer'); // 'buyer' or 'seller'
  const [isBuyer, setIsBuyer] = useState(true);
  const [isSeller, setIsSeller] = useState(searchParams.get('role') === 'seller');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect authenticated users
  useEffect(() => {
    if (!loading && user) {
      // Redirect to the intended page if available
      const from = location.state?.from?.pathname;
      
      if (from) {
        navigate(from, { replace: true });
        return;
      }
      
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate, location.state]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "كلمتا المرور غير متطابقتين",
        description: "يرجى التأكد من تطابق كلمتي المرور.",
      });
      return;
    }
    
    if (!isBuyer && !isSeller) {
      toast({
        variant: "destructive",
        title: "يجب اختيار دور واحد على الأقل",
        description: "يرجى اختيار ما إذا كنت تريد أن تكون مشترياً أو بائعاً أو كليهما.",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Send OTP for email verification first
    const success = await sendEmailVerificationOTP(email);

    if (success) {
      // Prepare registration data
      const primaryRole = isSeller ? 'seller' : 'buyer';
      const registrationData = {
        name,
        email,
        password,
        role: primaryRole,
        is_buyer: isBuyer,
        is_seller: isSeller,
      };

      // Navigate to email verification page with registration data
      navigate('/verify-email', { 
        state: { 
          email, 
          registrationData 
        } 
      });
    }
    
    setIsLoading(false);
  };

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lightBeige">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olivePrimary mx-auto mb-4"></div>
          <p className="text-darkOlive">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Don't render the register form if user is already authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-lightBeige p-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl border-olivePrimary/20">
          <CardHeader className="text-center">
             <div className="mx-auto p-3 bg-olivePrimary/10 rounded-full w-fit mb-4">
              <UserPlus className="h-10 w-10 text-olivePrimary" />
            </div>
            <CardTitle className="text-3xl font-bold text-darkOlive">إنشاء حساب جديد</CardTitle>
            <CardDescription className="text-darkOlive/70">انضم إلينا اليوم واكتشف عالم الإبداع اليدوي.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-darkOlive">الاسم الكامل</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-olivePrimary/60" />
                  <Input id="name" type="text" placeholder="اسمك الكامل" value={name} onChange={(e) => setName(e.target.value)} required className="pr-10 border-olivePrimary/30 focus:border-olivePrimary focus:ring-olivePrimary/20" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-register" className="text-darkOlive">البريد الإلكتروني</Label>
                 <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-olivePrimary/60" />
                  <Input id="email-register" type="email" placeholder="example@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pr-10 border-olivePrimary/30 focus:border-olivePrimary focus:ring-olivePrimary/20" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-register" className="text-darkOlive">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-olivePrimary/60" />
                  <Input id="password-register" type={showPassword ? 'text' : 'password'} placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10 border-olivePrimary/30 focus:border-olivePrimary focus:ring-olivePrimary/20" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-olivePrimary/60 hover:text-olivePrimary">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-darkOlive">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-olivePrimary/60" />
                  <Input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} placeholder="********" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pr-10 border-olivePrimary/30 focus:border-olivePrimary focus:ring-olivePrimary/20" />
                   <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-olivePrimary/60 hover:text-olivePrimary">
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>              <div className="space-y-4">
                <Label className="text-darkOlive text-base font-medium">أريد أن أكون:</Label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 border border-olivePrimary/20 rounded-lg hover:bg-olivePrimary/5 transition-colors">
                    <Checkbox
                      id="buyer"
                      checked={isBuyer}
                      onCheckedChange={setIsBuyer}
                      className="data-[state=checked]:bg-olivePrimary data-[state=checked]:border-olivePrimary"
                    />
                    <div className="flex items-center flex-1">
                      <ShoppingBag className="h-5 w-5 text-olivePrimary mr-3" />
                      <div>
                        <Label htmlFor="buyer" className="text-darkOlive font-medium cursor-pointer">
                          مشتري
                        </Label>
                        <p className="text-sm text-darkOlive/70">
                          أريد شراء المنتجات والحرف اليدوية
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 border border-olivePrimary/20 rounded-lg hover:bg-olivePrimary/5 transition-colors">
                    <Checkbox
                      id="seller"
                      checked={isSeller}
                      onCheckedChange={setIsSeller}
                      className="data-[state=checked]:bg-olivePrimary data-[state=checked]:border-olivePrimary"
                    />
                    <div className="flex items-center flex-1">
                      <Store className="h-5 w-5 text-olivePrimary mr-3" />
                      <div>
                        <Label htmlFor="seller" className="text-darkOlive font-medium cursor-pointer">
                          بائع (حرفي)
                        </Label>
                        <p className="text-sm text-darkOlive/70">
                          أريد بيع منتجاتي وحرفي اليدوية
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {(isBuyer && isSeller) && (
                  <div className="p-3 bg-olivePrimary/10 rounded-lg border border-olivePrimary/20">
                    <p className="text-sm text-olivePrimary">
                      ✨ رائع! ستتمكن من التبديل بين دوري المشتري والبائع في أي وقت من لوحة التحكم.
                    </p>
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full bg-burntOrange hover:bg-burntOrange/90 text-white text-lg py-3" disabled={isLoading}>
                {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-3">
            <p className="text-sm text-darkOlive/80">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="font-medium text-olivePrimary hover:underline">
                تسجيل الدخول
              </Link>
            </p>
             <Button variant="outline" onClick={() => navigate('/')} className="w-full border-olivePrimary/50 text-olivePrimary hover:bg-olivePrimary hover:text-white">
              العودة إلى الصفحة الرئيسية
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
