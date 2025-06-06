import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Shield, 
  User,
  Ban,
  CheckCircle,
  X,
  Eye,
  Mail,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { adminApi } from '@/lib/api';

const AdminUsers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { startConversation, setActiveConversation } = useChat();
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast({
        variant: "destructive",
        title: "غير مصرح به",
        description: "هذه الصفحة مخصصة للمشرفين فقط."
      });
      return;
    }    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      
      const response = await adminApi.getUsers(params);
      setUsers(response.data || []);
      setFilteredUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات المستخدمين"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // تطبيق الفلاتر
    let result = [...users];
    
    if (searchTerm) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toString().includes(searchTerm.toLowerCase())
      );
    }
    
    if (roleFilter) {
      result = result.filter(user => user.role === roleFilter);
    }
    
    if (statusFilter) {
      result = result.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(result);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const handleSuspendUser = async (userId) => {
    try {
      setUpdating(true);
      await adminApi.updateUserStatus(userId, 'suspended');
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, status: 'suspended' };
        }
        return u;
      }));
      toast({
        title: "تم تعليق المستخدم",
        description: "تم تعليق حساب المستخدم بنجاح."
      });
    } catch (error) {
      console.error('Error suspending user:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء تعليق المستخدم"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      setUpdating(true);
      await adminApi.updateUserStatus(userId, 'active');
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, status: 'active' };
        }
        return u;
      }));
      toast({
        title: "تم تفعيل المستخدم",
        description: "تم تفعيل حساب المستخدم بنجاح."
      });
    } catch (error) {
      console.error('Error activating user:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء تفعيل المستخدم"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleViewUserProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleResetPassword = (userId) => {
    toast({
      title: "إعادة تعيين كلمة المرور",
      description: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريد المستخدم."
    });
  };

  const handleChatWithUser = (userData) => {
    if (userData.id === user.id) {
      toast({ 
        variant: "destructive", 
        title: "لا يمكن مراسلة نفسك", 
        description: "لا يمكنك بدء محادثة مع نفسك." 
      });
      return;
    }
    
    // Format user data for chat context
    const chatParticipant = {
      id: userData.id,
      name: userData.name,
      avatar: userData.avatar || '',
      lastSeen: userData.last_login || new Date().toISOString()
    };
    
    // Start a conversation with the user
    const conversationId = startConversation(chatParticipant);
    setActiveConversation(conversationId);
    navigate('/chat');
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 ml-1" />نشط</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500 hover:bg-red-600"><Ban className="h-3 w-3 ml-1" />معلق</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500 hover:bg-gray-600"><X className="h-3 w-3 ml-1" />غير نشط</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin':
        return <Badge className="bg-purple-500 hover:bg-purple-600"><ShieldAlert className="h-3 w-3 ml-1" />مشرف</Badge>;
      case 'seller':
        return <Badge className="bg-blue-500 hover:bg-blue-600"><UserCheck className="h-3 w-3 ml-1" />بائع</Badge>;
      case 'buyer':
        return <Badge className="bg-green-500 hover:bg-green-600"><User className="h-3 w-3 ml-1" />مشتري</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 md:p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-700">غير مصرح لك بالدخول</h1>
        <p className="text-gray-500">هذه الصفحة مخصصة للمشرفين فقط.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-700">جاري تحميل المستخدمين...</h2>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة المستخدمين</h1>
          <p className="text-gray-500 mt-1">عرض وإدارة جميع حسابات المستخدمين</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-green-100 text-green-700 py-2 px-3">
            <User className="h-4 w-4 ml-1" /> المشترين: {users.filter(u => u.role === 'buyer').length}
          </Badge>
          <Badge className="bg-blue-100 text-blue-700 py-2 px-3">
            <UserCheck className="h-4 w-4 ml-1" /> البائعين: {users.filter(u => u.role === 'seller').length}
          </Badge>
          <Badge className="bg-red-100 text-red-700 py-2 px-3">
            <Ban className="h-4 w-4 ml-1" /> معلق: {users.filter(u => u.status === 'suspended').length}
          </Badge>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-grow">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="البحث عن مستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="w-full md:w-1/4">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full">
              <UserCheck className="h-4 w-4 ml-2" />
              <SelectValue placeholder="فلترة حسب الدور" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">الكل</SelectItem>
              <SelectItem value="buyer">مشتري</SelectItem>
              <SelectItem value="seller">بائع</SelectItem>
              <SelectItem value="admin">مشرف</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-1/4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <Shield className="h-4 w-4 ml-2" />
              <SelectValue placeholder="فلترة حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">الكل</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="suspended">معلق</SelectItem>
              <SelectItem value="inactive">غير نشط</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <UserX className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">لا يوجد مستخدمين</h2>
          <p className="text-gray-500">لم يتم العثور على مستخدمين يطابقون معايير البحث.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((userData, index) => (
            <motion.div
              key={userData.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow border-blue-100 h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 ml-3">
                        <AvatarImage src={userData.avatar} />
                        <AvatarFallback>{userData.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg text-gray-800">{userData.name}</CardTitle>
                        <CardDescription className="text-gray-500">{userData.email}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(userData.status)}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الدور:</span>
                      {getRoleBadge(userData.role)}
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ التسجيل:</span>
                      <span>{userData.created_at ? new Date(userData.created_at).toLocaleDateString('ar-SA') : 'غير محدد'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">آخر تسجيل دخول:</span>
                      <span>{userData.last_login ? new Date(userData.last_login).toLocaleDateString('ar-SA') : 'لم يسجل دخول'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">{userData.role === 'buyer' ? 'عدد الطلبات:' : 'عدد المنتجات:'}</span>
                      <span>{userData.role === 'buyer' ? (userData.orders_count || 0) : (userData.products_count || 0)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="grid grid-cols-1 gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-blue-200 text-blue-600"
                    onClick={() => handleViewUserProfile(userData.id)}
                  >
                    <Eye className="ml-1 h-4 w-4" />  عرض الملف الشخصي
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-blue-200 text-blue-600"
                    onClick={() => handleChatWithUser(userData)}
                  >
                    <MessageSquare className="ml-1 h-4 w-4" /> محادثة
                  </Button>

                  
                  {userData.status === 'active' ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="col-span-2"
                          disabled={updating}
                        >
                          {updating ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <Ban className="ml-1 h-4 w-4" />}
                          تعليق الحساب
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>هل أنت متأكد من تعليق هذا الحساب؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            سيؤدي هذا إلى منع المستخدم "{userData.name}" من استخدام النظام مؤقتًا
                            حتى تقوم بإلغاء التعليق.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleSuspendUser(userData.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            تعليق الحساب
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 col-span-2"
                      onClick={() => handleActivateUser(userData.id)}
                      disabled={updating}
                    >
                      {updating ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <CheckCircle className="ml-1 h-4 w-4" />}
                      تفعيل الحساب
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
