
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    setIsLoading(true);
    const success = await login({ email, password });
    setIsLoading(false);
    if (success) {
      // The useEffect above will handle the redirect
    }
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

  // Don't render the login form if user is already authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-lightBeige p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-olivePrimary/20">
          <CardHeader className="text-center">
            <div className="mx-auto p-3 bg-olivePrimary/10 rounded-full w-fit mb-4">
              <LogIn className="h-10 w-10 text-olivePrimary" />
            </div>
            <CardTitle className="text-3xl font-bold text-darkOlive">تسجيل الدخول</CardTitle>
            <CardDescription className="text-darkOlive/70">مرحباً بعودتك! أدخل بياناتك للمتابعة.</CardDescription>
          </CardHeader>
          <div className="mx-4 mb-4 p-3 bg-lightGreen/30 border-r-4 border-olivePrimary rounded-md text-sm">
            <div className="flex items-start">
              <HelpCircle className="h-5 w-5 text-olivePrimary ml-2 mt-0.5" />
              <div>
                <p className="font-semibold text-darkOlive mb-1">أمثلة للاختبار:</p>
                <p className="text-darkOlive/80 mb-1"><strong>مشتري:</strong> nora@example.com/ password123</p>
                <p className="text-darkOlive/80 mb-1"><strong>بائع:</strong> sara@example.com / password123</p>
                <p className="text-darkOlive/80"><strong>مسؤول:</strong> admin@example.com / admin123</p>
              </div>
            </div>
          </div>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-darkOlive">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-olivePrimary/60" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pr-10 border-olivePrimary/30 focus:border-olivePrimary focus:ring-olivePrimary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-darkOlive">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-olivePrimary/60" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 border-olivePrimary/30 focus:border-olivePrimary focus:ring-olivePrimary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-olivePrimary/60 hover:text-olivePrimary"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                {/* <div className="flex items-center">
                  <Checkbox id="remember-me" />
                  <Label htmlFor="remember-me" className="mr-2 text-sm text-gray-600">تذكرني</Label>
                </div> */}
                <Link to="#" className="text-sm text-burntOrange hover:underline">
                  هل نسيت كلمة المرور؟
                </Link>
              </div>
              <Button type="submit" className="w-full bg-burntOrange hover:bg-burntOrange/90 text-white text-lg py-3" disabled={isLoading}>
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-3">
            <p className="text-sm text-darkOlive/80">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="font-medium text-olivePrimary hover:underline">
                إنشاء حساب جديد
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

export default LoginPage;
