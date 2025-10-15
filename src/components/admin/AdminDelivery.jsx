import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  User, 
  Mail, 
  Phone,
  Shield,
  RotateCcw,
  Package,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Calendar,
  Clock,
  UserPlus,
  UserCheck
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const AdminDelivery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [deliveryPersonnel, setDeliveryPersonnel] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast({
        variant: "destructive",
        title: "غير مصرح به",
        description: "هذه الصفحة مخصصة للمشرفين فقط."
      });
      return;
    }
    fetchDeliveryPersonnel();
    fetchAvailableOrders();
  }, [user]);

  const fetchDeliveryPersonnel = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDeliveryPersonnel();
      // Handle paginated response - extract data from pagination object
      const personnelData = response.data?.data || response.data || [];
      setDeliveryPersonnel(Array.isArray(personnelData) ? personnelData : []);
    } catch (error) {
      console.error('Error fetching delivery personnel:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات موظفي التوصيل"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableOrders = async () => {
    try {
      const response = await adminApi.getAvailableOrders();
      setAvailableOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching available orders:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPersonnel) {
        await adminApi.updateDeliveryPersonnel(editingPersonnel.id, formData);
        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث بيانات موظف التوصيل بنجاح"
        });
      } else {
        await adminApi.createDeliveryPersonnel(formData);
        toast({
          title: "تم الإنشاء بنجاح",
          description: "تم إنشاء حساب موظف التوصيل بنجاح وإرسال بيانات الدخول عبر الإيميل"
        });
      }
      
      setIsDialogOpen(false);
      setEditingPersonnel(null);
      setFormData({ name: '', email: '', phone: '' });
      fetchDeliveryPersonnel();
    } catch (error) {
      console.error('Error saving delivery personnel:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ البيانات"
      });
    }
  };

  const handleEdit = (personnel) => {
    setEditingPersonnel(personnel);
    setFormData({
      name: personnel.name,
      email: personnel.email,
      phone: personnel.phone,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (personnelId) => {
    try {
      await adminApi.deleteDeliveryPersonnel(personnelId);
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف موظف التوصيل بنجاح"
      });
      fetchDeliveryPersonnel();
    } catch (error) {
      console.error('Error deleting delivery personnel:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء حذف موظف التوصيل"
      });
    }
  };

  const handleResetPassword = async (personnelId) => {
    try {
      await adminApi.resetDeliveryPersonnelPassword(personnelId);
      toast({
        title: "تم إعادة تعيين كلمة المرور",
        description: "تم إرسال كلمة المرور الجديدة عبر الإيميل"
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء إعادة تعيين كلمة المرور"
      });
    }
  };

  const handleAssignOrder = async (orderId, personnelId) => {
    try {
      await adminApi.assignOrder(orderId, personnelId);
      toast({
        title: "تم تعيين الطلب بنجاح",
        description: "تم تعيين الطلب لموظف التوصيل بنجاح"
      });
      setShowAssignDialog(false);
      setSelectedOrder(null);
      fetchAvailableOrders();
    } catch (error) {
      console.error('Error assigning order:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء تعيين الطلب"
      });
    }
  };

  const filteredPersonnel = Array.isArray(deliveryPersonnel) 
    ? deliveryPersonnel.filter(personnel =>
        personnel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        personnel.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        personnel.phone?.includes(searchTerm)
      )
    : [];

  const getStatusBadge = (isAvailable) => {
    if (isAvailable) {
      return <Badge className="bg-green-500 text-white">متاح</Badge>;
    }
    return <Badge variant="secondary">غير متاح</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Truck className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">إدارة موظفي التوصيل</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingPersonnel(null);
                setFormData({ name: '', email: '', phone: '' });
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              إضافة موظف جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingPersonnel ? 'تعديل موظف التوصيل' : 'إضافة موظف توصيل جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingPersonnel ? 
                  'قم بتعديل بيانات موظف التوصيل' : 
                  'أدخل بيانات موظف التوصيل الجديد. سيتم إرسال بيانات الدخول عبر الإيميل'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingPersonnel ? 'تحديث' : 'إضافة'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="البحث عن موظف التوصيل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              إجمالي الموظفين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {deliveryPersonnel.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              الموظفين المتاحين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {deliveryPersonnel.filter(p => p.is_available).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              الطلبات المتاحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {availableOrders.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Personnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPersonnel.map((personnel) => (
          <motion.div
            key={personnel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={personnel.avatar} />
                      <AvatarFallback>
                        {personnel.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{personnel.name}</CardTitle>
                      <CardDescription>{personnel.email}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(personnel.is_available)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{personnel.phone}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(personnel)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    تعديل
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResetPassword(personnel.id)}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    إعادة تعيين
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        حذف
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          سيتم حذف موظف التوصيل {personnel.name} نهائياً. هذا الإجراء لا يمكن التراجع عنه.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(personnel.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredPersonnel.length === 0 && (
        <div className="text-center py-12">
          <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            لا توجد موظفين توصيل
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'لم يتم العثور على موظفين مطابقين للبحث' : 'قم بإضافة موظف توصيل جديد للبدء'}
          </p>
        </div>
      )}

      {/* Order Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعيين طلب لموظف التوصيل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>اختر موظف التوصيل</Label>
              <Select onValueChange={(value) => {
                if (selectedOrder) {
                  handleAssignOrder(selectedOrder.id, value);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر موظف التوصيل" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryPersonnel.filter(p => p.is_available).map(personnel => (
                    <SelectItem key={personnel.id} value={personnel.id.toString()}>
                      {personnel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDelivery; 