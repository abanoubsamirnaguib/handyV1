import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Helper to get API base URL from env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000';
const getApiUrl = (path) => {
  return `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Helper to get token from localStorage
  const getToken = () => localStorage.getItem('token');

  // Fetch user info if token exists
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetch(getApiUrl('/api/me'), {
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
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
          setLoading(false);
        })
        .catch((error) => {
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const res = await fetch(getApiUrl('/api/login'), {
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
      const res = await fetch(getApiUrl('/api/register'), {
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
      
      const data = (await res.json()).data;
      
      // Since registration returns a token, we can directly set the user
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
        await fetch(getApiUrl('/api/logout'), {
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
        skills: Array.isArray(updatedData.skills) ? updatedData.skills : (user.skills || [])
      };
      
      const res = await fetch(getApiUrl(`/api/users/${user.id}`), {
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
      
      // Make sure skills array is present and properly formatted
      if (updatedData.skills && Array.isArray(updatedData.skills)) {
        updatedUser.skills = updatedData.skills;
      }
      
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
