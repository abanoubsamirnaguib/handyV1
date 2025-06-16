import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Key, Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyPasswordResetOTP, resetPassword, sendPasswordResetOTP } = useAuth();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 4) {
      return;
    }

    setIsVerifyingOTP(true);
    const success = await verifyPasswordResetOTP(email, otpCode);
    
    if (success) {
      setOtpVerified(true);
    }
    
    setIsVerifyingOTP(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return;
    }

    if (password.length < 6) {
      return;
    }

    setIsLoading(true);
    const success = await resetPassword(email, otpCode, password, confirmPassword);
    
    if (success) {
      navigate('/login');
    }
    
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    await sendPasswordResetOTP(email);
    setIsResending(false);
  };

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
              <Shield className="h-10 w-10 text-olivePrimary" />
            </div>
            <CardTitle className="text-3xl font-bold text-darkOlive">
              تغيير كلمة المرور
            </CardTitle>
            <CardDescription className="text-darkOlive/70">
              أدخل رمز التحقق وكلمة المرور الجديدة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Email Display */}
              <div className="bg-lightGreen/20 p-3 rounded-lg border border-olivePrimary/20">
                <p className="text-sm text-darkOlive/80">البريد الإلكتروني:</p>
                <p className="font-medium text-darkOlive">{email}</p>
              </div>

              {/* OTP Verification */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-darkOlive">
                    رمز التحقق (4 أرقام)
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-olivePrimary/60" />
                      <Input
                        id="otp"
                        type="text"
                        placeholder="0000"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        className="pr-10 text-center text-lg letter-spacing-wider border-olivePrimary/30 focus:border-olivePrimary focus:ring-olivePrimary/20"
                        disabled={otpVerified}
                      />
                    </div>
                    {!otpVerified && (
                      <Button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={isVerifyingOTP || otpCode.length !== 4}
                        className="bg-olivePrimary hover:bg-olivePrimary/90"
                      >
                        {isVerifyingOTP ? 'جاري التحقق...' : 'تحقق'}
                      </Button>
                    )}
                  </div>
                  {otpVerified && (
                    <div className="flex items-center text-green-600 text-sm">
                      <Shield className="h-4 w-4 ml-1" />
                      تم التحقق بنجاح
                    </div>
                  )}
                </div>

                {!otpVerified && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendOTP}
                    disabled={isResending}
                    className="w-full border-olivePrimary/50 text-olivePrimary hover:bg-olivePrimary hover:text-white"
                  >
                    {isResending ? 'جاري الإرسال...' : 'إعادة إرسال رمز التحقق'}
                  </Button>
                )}
              </div>

              {/* Password Reset Form */}
              {otpVerified && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-darkOlive">
                      كلمة المرور الجديدة
                    </Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-darkOlive">
                      تأكيد كلمة المرور
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-olivePrimary/60" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="********"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pr-10 border-olivePrimary/30 focus:border-olivePrimary focus:ring-olivePrimary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-olivePrimary/60 hover:text-olivePrimary"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-burntOrange hover:bg-burntOrange/90 text-white text-lg py-3"
                    disabled={isLoading}
                  >
                    {isLoading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-3">
            <p className="text-sm text-darkOlive/80">
              تذكرت كلمة المرور؟{' '}
              <Link to="/login" className="font-medium text-olivePrimary hover:underline">
                تسجيل الدخول
              </Link>
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full border-olivePrimary/50 text-olivePrimary hover:bg-olivePrimary hover:text-white"
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

export default ResetPasswordPage; 