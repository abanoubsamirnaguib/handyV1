
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Briefcase, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(searchParams.get('role') || 'buyer'); // 'buyer' or 'seller'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    const success = await register({ name, email, password, role });
    setIsLoading(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-white p-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl border-orange-200">
          <CardHeader className="text-center">
             <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
              <UserPlus className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800">إنشاء حساب جديد</CardTitle>
            <CardDescription className="text-gray-500">انضم إلينا اليوم واكتشف عالم الإبداع اليدوي.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">الاسم الكامل</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input id="name" type="text" placeholder="اسمك الكامل" value={name} onChange={(e) => setName(e.target.value)} required className="pr-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-register" className="text-gray-700">البريد الإلكتروني</Label>
                 <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input id="email-register" type="email" placeholder="example@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pr-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-register" className="text-gray-700">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input id="password-register" type={showPassword ? 'text' : 'password'} placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} placeholder="********" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pr-10" />
                   <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary">
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-700">أرغب في التسجيل كـ:</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role" className="w-full">
                    <div className="flex items-center">
                      {role === 'seller' ? <Briefcase className="ml-2 h-5 w-5 text-gray-400" /> : <User className="ml-2 h-5 w-5 text-gray-400" />}
                      <SelectValue placeholder="اختر نوع الحساب" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">
                      <div className="flex items-center"><User className="ml-2 h-5 w-5" /> مشتري</div>
                    </SelectItem>
                    <SelectItem value="seller">
                      <div className="flex items-center"><Briefcase className="ml-2 h-5 w-5" /> بائع (حرفي)</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-3" disabled={isLoading}>
                {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-3">
            <p className="text-sm text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                تسجيل الدخول
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

export default RegisterPage;
