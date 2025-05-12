
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (credentials) => {
    try {
      // For demo purposes, we'll use mock data
      // In a real app, this would be an API call
      const mockUsers = [
        {
          id: '1',
          email: 'user@example.com',
          password: 'password',
          name: 'أحمد محمد',
          role: 'buyer',
          avatar: '',
        },
        {
          id: '2',
          email: 'seller@example.com',
          password: 'password',
          name: 'سارة أحمد',
          role: 'seller',
          avatar: '',
          bio: 'حرفية متخصصة في صناعة المجوهرات اليدوية',
          skills: ['المجوهرات', 'الفضة', 'الأحجار الكريمة'],
        },
        {
          id: 'admin1',
          email: 'admin@example.com',
          password: 'admin123',
          name: 'مدير النظام',
          role: 'admin',
          avatar: '',
        },
      ];

      const foundUser = mockUsers.find(
        (user) => user.email === credentials.email && user.password === credentials.password
      );

      if (foundUser) {
        // Remove password before storing
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        toast({
          title: 'تم تسجيل الدخول بنجاح',
          description: `مرحباً بك ${userWithoutPassword.name}`,
        });
        return true;
      } else {
        toast({
          variant: 'destructive',
          title: 'فشل تسجيل الدخول',
          description: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        });
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'حدث خطأ أثناء تسجيل الدخول',
      });
      return false;
    }
  };

  const register = (userData) => {
    try {
      // For demo purposes, we'll just create a new user object
      // In a real app, this would be an API call
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        avatar: '',
      };

      // Remove password before storing
      const { password, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      toast({
        title: 'تم إنشاء الحساب بنجاح',
        description: `مرحباً بك ${userWithoutPassword.name}`,
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: 'تم تسجيل الخروج',
      description: 'نتمنى رؤيتك مرة أخرى قريباً',
    });
  };

  const updateProfile = (updatedData) => {
    try {
      const updatedUser = { ...user, ...updatedData };
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

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
