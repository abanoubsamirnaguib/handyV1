
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login({ email, password });
    setIsLoading(false);
    if (success) {
      navigate('/dashboard'); // Or to previous page
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-white p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-orange-200">
          <CardHeader className="text-center">
            <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
              <LogIn className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800">تسجيل الدخول</CardTitle>
            <CardDescription className="text-gray-500">مرحباً بعودتك! أدخل بياناتك للمتابعة.</CardDescription>
          </CardHeader>
          <div className="mx-4 mb-4 p-3 bg-amber-50 border-r-4 border-orange-500 rounded-md text-sm">
            <div className="flex items-start">
              <HelpCircle className="h-5 w-5 text-primary ml-2 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-700 mb-1">أمثلة للاختبار:</p>
                <p className="text-gray-600 mb-1"><strong>مشتري:</strong> user@example.com / password</p>
                <p className="text-gray-600 mb-1"><strong>بائع:</strong> seller@example.com / password</p>
                <p className="text-gray-600"><strong>مسؤول:</strong> admin@example.com / admin123</p>
              </div>
            </div>
          </div>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pr-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary"
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
                <Link to="#" className="text-sm text-primary hover:underline">
                  هل نسيت كلمة المرور؟
                </Link>
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-3" disabled={isLoading}>
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-3">
            <p className="text-sm text-gray-600">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                إنشاء حساب جديد
              </Link>
            </p>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              العودة إلى الصفحة الرئيسية
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
