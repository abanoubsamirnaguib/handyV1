import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Key, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerWithEmailVerification, sendEmailVerificationOTP } = useAuth();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [registrationData, setRegistrationData] = useState(location.state?.registrationData || null);

  useEffect(() => {
    if (!email || !registrationData) {
      navigate('/register');
    }
  }, [email, registrationData, navigate]);

  const handleVerifyEmail = async (e) => {
    e.preventDefault();

    if (!otpCode || otpCode.length !== 4) {
      return;
    }

    setIsLoading(true);

    // Add the OTP code to the registration data
    const dataWithOTP = {
      ...registrationData,
      otp_code: otpCode
    };

    const success = await registerWithEmailVerification(dataWithOTP);
    
    if (success) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    await sendEmailVerificationOTP(email);
    setIsResending(false);
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
              <CheckCircle className="h-10 w-10 text-roman-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-neutral-900">
              تأكيد البريد الإلكتروني
            </CardTitle>
            <CardDescription className="text-neutral-900/70">
              أدخل رمز التحقق المرسل إلى بريدك الإلكتروني
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Email Display */}
              <div className="bg-success-100/20 p-4 rounded-lg border border-roman-500/20">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-roman-500 ml-2" />
                  <div>
                    <p className="text-sm text-neutral-900/80">تم إرسال رمز التحقق إلى:</p>
                    <p className="font-medium text-neutral-900">{email}</p>
                  </div>
                </div>
              </div>

              {/* Verification Form */}
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-neutral-900">
                    رمز التحقق (4 أرقام)
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-roman-500/60" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="0000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      className="pr-10 text-center text-2xl letter-spacing-widest border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20"
                      required
                    />
                  </div>
                  <p className="text-sm text-neutral-900/60">
                    الرمز صالح لمدة 10 دقائق
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-roman-500 hover:bg-roman-500/90 text-white text-lg py-3"
                  disabled={isLoading || otpCode.length !== 4}
                >
                  {isLoading ? 'جاري التحقق...' : 'تأكيد البريد الإلكتروني'}
                </Button>
              </form>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-sm text-neutral-900/80 mb-2">
                  لم تستلم الرمز؟
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendOTP}
                  disabled={isResending}
                  className="border-roman-500/50 text-roman-500 hover:bg-roman-500 hover:text-white"
                >
                  {isResending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-3">
            <p className="text-sm text-neutral-900/80">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="font-medium text-roman-500 hover:underline">
                تسجيل الدخول
              </Link>
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/register')}
              className="w-full border-roman-500/50 text-roman-500 hover:bg-roman-500 hover:text-white"
            >
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة إلى التسجيل
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage; 