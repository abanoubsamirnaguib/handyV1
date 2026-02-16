import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Briefcase, Eye, EyeOff, ShoppingBag, Store, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { AlertCircle } from 'lucide-react';
import { GoogleLoginButton } from '@/components/ui/google-login-button';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, loading, sendEmailVerificationOTP, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(searchParams.get('role') || 'buyer'); // 'buyer' or 'seller'
  const [isBuyer, setIsBuyer] = useState(true);
  const [isSeller, setIsSeller] = useState(searchParams.get('role') === 'seller');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
        phone,
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

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        // The useEffect above will handle the redirect
      }
    } catch (error) {
      console.error('Google registration error:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-roman-500 mx-auto mb-4"></div>
          <p className="text-neutral-900">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Don't render the register form if user is already authenticated
  if (user) {
    return null;
  }

  // Show message if registration is disabled
  if (!settings.registrationsEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Card className="shadow-2xl border-roman-500/20">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-yellow-500/10 rounded-full w-fit mb-4">
                <AlertCircle className="h-10 w-10 text-yellow-500" />
              </div>
              <CardTitle className="text-3xl font-bold text-neutral-900">التسجيل غير متاح حالياً</CardTitle>
              <CardDescription className="text-neutral-900/70 mt-4">
                نعتذر، التسجيل للمستخدمين الجدد غير متاح حالياً. يرجى المحاولة لاحقاً.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col items-center space-y-3">
              <Button variant="outline" onClick={() => navigate('/')} className="w-full border-roman-500/50 text-roman-500 hover:bg-roman-500 hover:text-white">
                العودة إلى الصفحة الرئيسية
              </Button>
              <p className="text-sm text-neutral-900/80">
                لديك حساب بالفعل؟{' '}
                <Link to="/login" className="font-medium text-roman-500 hover:underline">
                  تسجيل الدخول
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-4 py-12"
    style={{ backgroundImage: 'url("public/bgimages2.svg")', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl border-roman-500/20">
          <CardHeader className="text-center">
             <div className="mx-auto p-3 bg-roman-500/10 rounded-full w-fit mb-4">
              <UserPlus className="h-10 w-10 text-roman-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-neutral-900">إنشاء حساب جديد</CardTitle>
            <CardDescription className="text-neutral-900/70">انضم إلينا اليوم واكتشف عالم الإبداع اليدوي.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-neutral-900">الاسم الكامل</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-roman-500/60" />
                  <Input id="name" type="text" placeholder="اسمك الكامل" value={name} onChange={(e) => setName(e.target.value)} required className="pr-10 border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-register" className="text-neutral-900">البريد الإلكتروني</Label>
                 <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-roman-500/60" />
                  <Input id="email-register" type="email" placeholder="example@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pr-10 border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone-register" className="text-neutral-900">رقم الهاتف</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-roman-500/60" />
                  <Input 
                    id="phone-register" 
                    type="tel" 
                    placeholder="01012345678" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                    maxLength={11}
                    dir="rtl"
                    className="pl-10 text-right border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20" 
                  />
                </div>
                <p className="text-xs text-neutral-600">رقم مصري (يبدأ بـ 010، 011، 012، أو 015)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-register" className="text-neutral-900">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-roman-500/60" />
                  <Input id="password-register" type={showPassword ? 'text' : 'password'} placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10 border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-roman-500/60 hover:text-roman-500">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-neutral-900">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-roman-500/60" />
                  <Input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} placeholder="********" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pr-10 border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20" />
                   <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-roman-500/60 hover:text-roman-500">
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>              <div className="space-y-4">
                <Label className="text-neutral-900 text-base font-medium">أريد أن أكون:</Label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 border border-roman-500/20 rounded-lg hover:bg-roman-500/5 transition-colors">
                    <Checkbox
                      id="buyer"
                      checked={isBuyer}
                      onCheckedChange={setIsBuyer}
                      className="data-[state=checked]:bg-roman-500 data-[state=checked]:border-roman-500"
                    />
                    <div className="flex items-center flex-1">
                      <ShoppingBag className="h-5 w-5 text-roman-500 mr-3" />
                      <div>
                        <Label htmlFor="buyer" className="text-neutral-900 font-medium cursor-pointer">
                          مشتري
                        </Label>
                        <p className="text-sm text-neutral-900/70">
                          أريد شراء المنتجات والحرف اليدوية
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 border border-roman-500/20 rounded-lg hover:bg-roman-500/5 transition-colors">
                    <Checkbox
                      id="seller"
                      checked={isSeller}
                      onCheckedChange={setIsSeller}
                      className="data-[state=checked]:bg-roman-500 data-[state=checked]:border-roman-500"
                    />
                    <div className="flex items-center flex-1">
                      <Store className="h-5 w-5 text-roman-500 mr-3" />
                      <div>
                        <Label htmlFor="seller" className="text-neutral-900 font-medium cursor-pointer">
                          بائع (حرفي)
                        </Label>
                        <p className="text-sm text-neutral-900/70">
                          أريد بيع منتجاتي وحرفي اليدوية
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {(isBuyer && isSeller) && (
                  <div className="p-3 bg-roman-500/10 rounded-lg border border-roman-500/20">
                    <p className="text-sm text-roman-500">
                      ✨ رائع! ستتمكن من التبديل بين دوري المشتري والبائع في أي وقت من لوحة التحكم.
                    </p>
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full bg-roman-500 hover:bg-roman-500/90 text-white text-lg py-3" disabled={isLoading || isGoogleLoading}>
                {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-neutral-600">أو</span>
              </div>
            </div>

            {/* Google Registration Button */}
            <GoogleLoginButton 
              onClick={handleGoogleRegister} 
              isLoading={isGoogleLoading}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-3">
            <p className="text-sm text-neutral-900/80">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="font-medium text-roman-500 hover:underline">
                تسجيل الدخول
              </Link>
            </p>
             <Button variant="outline" onClick={() => navigate('/')} className="w-full border-roman-500/50 text-roman-500 hover:bg-roman-500 hover:text-white">
              العودة إلى الصفحة الرئيسية
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
