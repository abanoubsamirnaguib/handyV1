import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { apiUrl, api } from '@/lib/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Replace all getApiUrl and API_BASE_URL usage with apiUrl

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Helper to get token from localStorage
  const getToken = () => localStorage.getItem('token');
  
  // Update online status periodically
  useEffect(() => {
    if (!user) return;
    
    // Update online status immediately
    api.updateOnlineStatus().catch(err => console.error('Failed to update online status:', err));
    
    // Set up interval to update online status every 15 seconds (reduced from 30)
    const intervalId = setInterval(() => {
      api.updateOnlineStatus().catch(err => console.error('Failed to update online status:', err));
    }, 15000); // 15 seconds
    
    // Set up visibility change listener to update status when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        api.updateOnlineStatus().catch(err => console.error('Failed to update online status:', err));
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);
  
  // Fetch user info if token exists
  useEffect(() => {
    const token = getToken();
    if (token) {
      setLoading(true);
      fetch(apiUrl('me'), {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
        .then(async (res) => {
          if (res.ok) {
            const data = (await res.json()).data;
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
          } else {
            // Token is invalid, clear it
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        })
        .catch((error) => {
          // Network error or other issues, clear auth data
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // No token, user is not authenticated
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const res = await fetch(apiUrl('login'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        
        toast({
          variant: 'destructive',
          title: 'فشل تسجيل الدخول',
          description: errorData.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        });
        return false;
      }
      
      const data = (await res.json());
      localStorage.setItem('token', data.token);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: `مرحباً بك ${data.user.name}`,
      });
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'حدث خطأ أثناء تسجيل الدخول',
      });
      return false;
    }
  };  
  const register = async (userData) => {
    try {
      const res = await fetch(apiUrl('register'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
      });      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        
        toast({
          variant: 'destructive',
          title: 'فشل إنشاء الحساب',
          description: errorData.message || 'حدث خطأ أثناء إنشاء الحساب',
        });
        return false;
      }
      
      const data = await res.json();
      
      // Automatically set user and token after successful registration
      localStorage.setItem('token', data.token);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast({
        title: 'تم إنشاء الحساب بنجاح',
        description: `مرحباً بك ${userData.name}`,
      });
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'حدث خطأ أثناء إنشاء الحساب',
      });
      return false;
    }
  };

  const logout = async () => {
    const token = getToken();
    if (token) {
      try {
        await fetch(apiUrl('logout'), {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast({
      title: 'تم تسجيل الخروج',
      description: 'نتمنى رؤيتك مرة أخرى قريباً',
    });
  };

  const updateProfile = async (updatedData) => {
    try {
      const token = getToken();
      if (!token || !user) {
        throw new Error('Not authenticated');
      }
        // Ensure we're sending the correct data structure
      const dataToSend = {
        name: updatedData.name || user.name,
        bio: updatedData.bio || user.bio || '',
        location: updatedData.location || user.location || '',
        avatar: typeof updatedData.avatar === 'string' ? updatedData.avatar : (user.avatar || ''),
        phone: typeof updatedData.phone === 'string' ? updatedData.phone : (user.phone || '')
      };
        // If skills are provided and user's active_role is seller, include them in the request
      if (Array.isArray(updatedData.skills) && (user.active_role === 'seller')) {
        dataToSend.skills = updatedData.skills;
      }
      
      const res = await fetch(apiUrl(`users/${user.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Update failed: ${res.status} ${errorText}`);
      }
        const updatedUser = (await res.json()).data;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast({
        title: 'تم تحديث الملف الشخصي',
        description: 'تم تحديث بياناتك بنجاح',
      });
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث الملف الشخصي',
      });
      return false;
    }
  };

  // Upload profile image
  const uploadProfileImage = async (imageFile) => {
    try {
      const token = getToken();
      if (!token || !user) {
        throw new Error('Not authenticated');
      }

      const response = await api.uploadProfileImage(user.id, imageFile);
      
      // Update user data with new avatar
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast({
        title: 'تم تحديث صورة الملف الشخصي',
        description: 'تم تحديث صورتك الشخصية بنجاح',
      });

      return {
        success: true,
        data: updatedUser,
        avatarUrl: response.avatar_url
      };
    } catch (error) {
      console.error('Profile image upload failed:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في رفع الصورة',
        description: 'حدث خطأ أثناء رفع صورة الملف الشخصي',
      });
      return { success: false, error: error.message };
    }
  };

  const switchRole = async (targetRole) => {
    try {
      const token = getToken();
      if (!token || !user) {
        throw new Error('Not authenticated');
      }
      
      const res = await fetch(apiUrl('switch-role'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: targetRole }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to switch role');
      }
      
      const data = (await res.json());
      const updatedUser = data.user;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast({
        title: 'تم تبديل الدور بنجاح',
        description: `تم التبديل إلى دور ${targetRole === 'seller' ? 'البائع' : 'المشتري'}`,
      });
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء تبديل الدور',
      });
      return false;
    }
  };

  const enableSellerMode = async () => {
    try {
      const token = getToken();
      if (!token || !user) {
        throw new Error('Not authenticated');
      }
      
      const res = await fetch(apiUrl('enable-seller-mode'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to enable seller mode');
      }
      
      const data = (await res.json());
      const updatedUser = data.user;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast({
        title: 'تم تفعيل وضع البائع',
        description: 'يمكنك الآن إضافة منتجات وإدارة متجرك',
      });
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء تفعيل وضع البائع',
      });
      return false;
    }
  };

  const changePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
    try {
      const token = getToken();
      if (!token || !user) throw new Error('Not authenticated');
      const res = await fetch(apiUrl('change-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          variant: 'destructive',
          title: 'خطأ',
          description: data.message || 'حدث خطأ أثناء تغيير كلمة المرور',
        });
        return false;
      }
      toast({
        title: 'تم تغيير كلمة المرور',
        description: data.message || 'تم تغيير كلمة المرور بنجاح.',
      });
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء تغيير كلمة المرور',
      });
      return false;
    }
  };

  // OTP-related functions
  const sendEmailVerificationOTP = async (email) => {
    try {
      await api.sendEmailVerificationOTP(email);
      toast({
        title: 'تم الإرسال بنجاح',
        description: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
      });
      return true;
    } catch (error) {
      const errorMessage = error.message.includes('Email is already verified') 
        ? 'البريد الإلكتروني مُفعل بالفعل'
        : 'حدث خطأ أثناء إرسال رمز التحقق';
      
      toast({
        variant: 'destructive',
        title: 'خطأ في الإرسال',
        description: errorMessage,
      });
      return false;
    }
  };

  const verifyEmail = async (email, otpCode) => {
    try {
      await api.verifyEmail(email, otpCode);
      toast({
        title: 'تم التحقق بنجاح',
        description: 'تم تأكيد بريدك الإلكتروني بنجاح',
      });
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ في التحقق',
        description: 'رمز التحقق غير صحيح أو منتهي الصلاحية',
      });
      return false;
    }
  };

  const registerWithEmailVerification = async (userData) => {
    try {
      const data = await api.registerWithVerification(userData);
      
      // Set user and token after successful registration
      localStorage.setItem('token', data.token);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast({
        title: 'تم إنشاء الحساب بنجاح',
        description: `مرحباً بك ${userData.name}`,
      });
      return true;
    } catch (error) {
      const errorMessage = error.message.includes('Invalid or expired verification code')
        ? 'رمز التحقق غير صحيح أو منتهي الصلاحية'
        : 'حدث خطأ أثناء إنشاء الحساب';
      
      toast({
        variant: 'destructive',
        title: 'فشل إنشاء الحساب',
        description: errorMessage,
      });
      return false;
    }
  };

  const sendPasswordResetOTP = async (email) => {
    try {
      await api.sendPasswordResetOTP(email);
      toast({
        title: 'تم الإرسال بنجاح',
        description: 'تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
      });
      return true;
    } catch (error) {
      const errorMessage = error.message.includes('No user found')
        ? 'لا يوجد مستخدم بهذا البريد الإلكتروني'
        : 'حدث خطأ أثناء إرسال رمز إعادة التعيين';
      
      toast({
        variant: 'destructive',
        title: 'خطأ في الإرسال',
        description: errorMessage,
      });
      return false;
    }
  };

  const verifyPasswordResetOTP = async (email, otpCode) => {
    try {
      await api.verifyPasswordResetOTP(email, otpCode);
      toast({
        title: 'تم التحقق بنجاح',
        description: 'رمز التحقق صحيح، يمكنك الآن تغيير كلمة المرور',
      });
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'رمز غير صحيح',
        description: 'رمز التحقق غير صحيح أو منتهي الصلاحية',
      });
      return false;
    }
  };

  const resetPassword = async (email, otpCode, password, passwordConfirmation) => {
    try {
      await api.resetPassword(email, otpCode, password, passwordConfirmation);
      toast({
        title: 'تم تغيير كلمة المرور بنجاح',
        description: 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة',
      });
      return true;
    } catch (error) {
      const errorMessage = error.message.includes('Invalid or expired reset code')
        ? 'رمز التحقق غير صحيح أو منتهي الصلاحية'
        : error.message.includes('password')
        ? 'كلمتا المرور غير متطابقتين أو ضعيفتان'
        : 'حدث خطأ أثناء تغيير كلمة المرور';
      
      toast({
        variant: 'destructive',
        title: 'خطأ في تغيير كلمة المرور',
        description: errorMessage,
      });
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    uploadProfileImage,
    switchRole,
    enableSellerMode,
    changePassword,
    // OTP functions
    sendEmailVerificationOTP,
    verifyEmail,
    registerWithEmailVerification,
    sendPasswordResetOTP,
    verifyPasswordResetOTP,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
