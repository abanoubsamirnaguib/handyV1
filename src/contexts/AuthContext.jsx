import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Helper to get API base URL from env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000';
const getApiUrl = (path) => {
  console.log('Using API URL:', `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`);
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
      console.log('Fetching user info with token:', token);
      fetch(getApiUrl('/api/me'), {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include', // Important for cookies
      })
        .then(async (res) => {
          console.log('User info response status:', res.status);
          if (res.ok) {
            const data = await res.json();
            console.log('User data received:', data);
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
          } else {
            console.error('Failed to fetch user info:', await res.text());
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching user info:', error);
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
      // First, try to get CSRF cookie
      try {
        console.log('Fetching CSRF cookie...');
        const csrfResponse = await fetch(getApiUrl('/sanctum/csrf-cookie'), {
          method: 'GET',
          credentials: 'include', // Important for cookies
        });
        
        if (!csrfResponse.ok) {
          console.error('Failed to get CSRF cookie:', csrfResponse.status, csrfResponse.statusText);
        }
      } catch (csrfError) {
        console.error('Failed to get CSRF cookie:', csrfError);
        // Continue anyway, might work with just the token
      }
      
      // Extract CSRF token from cookies if available
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
      
      console.log('Attempting to login with credentials:', { email: credentials.email });
      const res = await fetch(getApiUrl('/api/login'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrfToken && { 'X-XSRF-TOKEN': decodeURIComponent(csrfToken) })
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        toast({
          variant: 'destructive',
          title: 'فشل تسجيل الدخول',
          description: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        });
        return false;
      }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: `مرحباً بك ${data.user.name}`,
      });
      return true;
    } catch (error) {
      console.error('Login error:', error.message || error);
      let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
      
      // Check if it's a connection error
      if (error.message && error.message.includes('Failed to fetch') || 
          error.name === 'TypeError' && error.message.includes('NetworkError')) {
        errorMessage = 'فشل الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.';
      }
      
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: errorMessage,
      });
      return false;
    }
  };

  const register = async (userData) => {
    try {
      // First, try to get CSRF cookie for registration
      try {
        console.log('Fetching CSRF cookie for registration...');
        const csrfResponse = await fetch(getApiUrl('/sanctum/csrf-cookie'), {
          method: 'GET',
          credentials: 'include', // Important for cookies
        });
        
        if (!csrfResponse.ok) {
          console.error('Failed to get CSRF cookie for registration:', csrfResponse.status, csrfResponse.statusText);
        }
      } catch (csrfError) {
        console.error('Failed to get CSRF cookie for registration:', csrfError);
      }
      
      // Extract CSRF token from cookies if available
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
      
      const res = await fetch(getApiUrl('/api/register'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrfToken && { 'X-XSRF-TOKEN': decodeURIComponent(csrfToken) })
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        toast({
          variant: 'destructive',
          title: 'فشل إنشاء الحساب',
          description: errorData.message || 'حدث خطأ أثناء إنشاء الحساب',
        });
        return false;
      }
      // Auto-login after register
      const data = await res.json();
      // Now login
      const loginSuccess = await login({
        email: userData.email,
        password: userData.password,
      });
      if (loginSuccess) {
        toast({
          title: 'تم إنشاء الحساب بنجاح',
          description: `مرحباً بك ${userData.name}`,
        });
        return true;
      }
      return false;
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
      
      console.log('Updating profile with token:', token);
      console.log('Update data:', updatedData);
      
      // Ensure we're sending the correct data structure
      const dataToSend = {
        name: updatedData.name || user.name,
        bio: updatedData.bio || user.bio || '',
        location: updatedData.location || user.location || '',
        skills: Array.isArray(updatedData.skills) ? updatedData.skills : (user.skills || [])
      };
      
      console.log('Sending update request to:', getApiUrl(`/api/users/${user.id}`));
      console.log('Data being sent:', dataToSend);
      
      const res = await fetch(getApiUrl(`/api/users/${user.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });
      
      console.log('Update response status:', res.status, res.statusText);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Update failed:', errorText);
        throw new Error(`Update failed: ${res.status} ${errorText}`);
      }
      
      const updatedUser = await res.json();
      console.log('Received updated user data from API:', updatedUser);
      
      // Make sure skills array is present and properly formatted
      if (updatedData.skills && Array.isArray(updatedData.skills)) {
        updatedUser.skills = updatedData.skills;
      }
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('Updated user data in localStorage:', JSON.parse(localStorage.getItem('user')));
      
      toast({
        title: 'تم تحديث الملف الشخصي',
        description: 'تم تحديث بياناتك بنجاح',
      });
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
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
