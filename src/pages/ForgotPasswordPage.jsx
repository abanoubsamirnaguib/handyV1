import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { sendPasswordResetOTP } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await sendPasswordResetOTP(email);
    
    if (success) {
      // Navigate to reset password page with email
      navigate('/reset-password', { state: { email } });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-roman-500/20">
          <CardHeader className="text-center">
            <div className="mx-auto p-3 bg-roman-500/10 rounded-full w-fit mb-4">
              <KeyRound className="h-10 w-10 text-roman-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-neutral-900">
              استعادة كلمة المرور
            </CardTitle>
            <CardDescription className="text-neutral-900/70">
              أدخل بريدك الإلكتروني لتلقي رمز التحقق
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-900">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-roman-500/60" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pr-10 border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-roman-500 hover:bg-roman-500/90 text-white text-lg py-3" 
                disabled={isLoading}
              >
                {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-3">
            <p className="text-sm text-neutral-900/80">
              تذكرت كلمة المرور؟{' '}
              <Link to="/login" className="font-medium text-roman-500 hover:underline">
                تسجيل الدخول
              </Link>
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full border-roman-500/50 text-roman-500 hover:bg-roman-500 hover:text-white"
            >
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة إلى الصفحة الرئيسية
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage; 