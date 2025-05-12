import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCheck, 
  Search, 
  Shield, 
  X, 
  Check, 
  User, 
  Briefcase,
  Star,
  Package,
  Ban,
  UserX,
  Eye
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
import { sellers as mockSellers } from '@/lib/data';
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

const AdminSellers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
    // إضافة حالات إضافية للبائعين (مثل 'pending' و 'suspended')
  const [sellers, setSellers] = useState([
    ...mockSellers.map(seller => ({ ...seller, status: 'active' })),
    {
      id: 's5new',
      name: 'محمد سعيد',
      bio: 'متخصص في الأعمال الخشبية التقليدية',
      avatar: '',
      rating: 0,
      reviewCount: 0,
      joinDate: '2025-04-15',
      skills: ['النحت الخشبي', 'صناعة الأثاث الخشبي'],
      completedOrders: 0,
      status: 'pending',
    },    {
      id: 's6new',
      name: 'نور يوسف',
      bio: 'مصممة أزياء ومنسوجات تقليدية',
      avatar: '',
      rating: 3.2,
      reviewCount: 8,
      joinDate: '2025-01-10',
      skills: ['تصميم الأزياء', 'النسيج اليدوي', 'التطريز'],
      completedOrders: 12,
      status: 'suspended',
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filteredSellers, setFilteredSellers] = useState([...sellers]);

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast({
        variant: "destructive",
        title: "غير مصرح به",
        description: "هذه الصفحة مخصصة للمشرفين فقط."
      });
    }
  }, [user, toast]);

  useEffect(() => {
    // تطبيق الفلاتر
    let result = [...sellers];
    
    if (searchTerm) {
      result = result.filter(seller => 
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (statusFilter) {
      result = result.filter(seller => seller.status === statusFilter);
    }
    
    setFilteredSellers(result);
  }, [searchTerm, statusFilter, sellers]);

  const handleApproveSeller = (sellerId) => {
    setSellers(prev => prev.map(seller => {
      if (seller.id === sellerId) {
        return { ...seller, status: 'active' };
      }
      return seller;
    }));
    
    toast({
      title: "تمت الموافقة على البائع",
      description: "تم تفعيل حساب البائع بنجاح."
    });
  };

  const handleRejectSeller = (sellerId) => {
    setSellers(prev => prev.map(seller => {
      if (seller.id === sellerId) {
        return { ...seller, status: 'rejected' };
      }
      return seller;
    }));
    
    toast({
      title: "تم رفض البائع",
      description: "تم رفض حساب البائع."
    });
  };

  const handleSuspendSeller = (sellerId) => {
    setSellers(prev => prev.map(seller => {
      if (seller.id === sellerId) {
        return { ...seller, status: 'suspended' };
      }
      return seller;
    }));
    
    toast({
      title: "تم تعليق حساب البائع",
      description: "تم تعليق حساب البائع بنجاح."
    });
  };

  const handleActivateSeller = (sellerId) => {
    setSellers(prev => prev.map(seller => {
      if (seller.id === sellerId) {
        return { ...seller, status: 'active' };
      }
      return seller;
    }));
    
    toast({
      title: "تم تفعيل حساب البائع",
      description: "تم تفعيل حساب البائع بنجاح."
    });
  };

  const handleViewSellerProfile = (sellerId) => {
    navigate(`/profile/${sellerId}`);
  };

  const handleViewSellerProducts = (sellerId) => {
    // يمكن توجيه المستخدم إلى صفحة خاصة بمنتجات هذا البائع
    toast({
      title: "عرض منتجات البائع",
      description: "سيتم توجيهك إلى صفحة منتجات البائع."
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600"><Check className="h-3 w-3 ml-1" />مفعّل</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Shield className="h-3 w-3 ml-1" />في انتظار الموافقة</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500 hover:bg-red-600"><Ban className="h-3 w-3 ml-1" />معلق</Badge>;
      case 'rejected':
        return <Badge className="bg-gray-500 hover:bg-gray-600"><X className="h-3 w-3 ml-1" />مرفوض</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة البائعين</h1>
          <p className="text-gray-500 mt-1">مراجعة واعتماد وإدارة حسابات البائعين</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-green-100 text-green-700 py-2 px-3">
            <Check className="h-4 w-4 ml-1" />
            مفعّل: {sellers.filter(s => s.status === 'active').length}
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-700 py-2 px-3">
            <Shield className="h-4 w-4 ml-1" />
            في الانتظار: {sellers.filter(s => s.status === 'pending').length}
          </Badge>
          <Badge className="bg-red-100 text-red-700 py-2 px-3">
            <Ban className="h-4 w-4 ml-1" />
            معلق: {sellers.filter(s => s.status === 'suspended').length}
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
            placeholder="البحث عن بائع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="w-full md:w-1/3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <UserCheck className="h-4 w-4 ml-2" />
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">الكل</SelectItem>
              <SelectItem value="active">مفعّل</SelectItem>
              <SelectItem value="pending">في انتظار الموافقة</SelectItem>
              <SelectItem value="suspended">معلق</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {filteredSellers.length === 0 ? (
        <div className="text-center py-12">
          <UserX className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">لا يوجد بائعين</h2>
          <p className="text-gray-500">لم يتم العثور على بائعين يطابقون معايير البحث.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSellers.map((seller, index) => (
            <motion.div
              key={seller.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow border-blue-100 h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 ml-3">
                        <AvatarImage src={seller.avatar} />
                        <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg text-gray-800">{seller.name}</CardTitle>
                        <CardDescription className="text-gray-500">#{seller.id}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(seller.status)}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-3 text-sm">
                    <p className="text-gray-600 line-clamp-2">{seller.bio}</p>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">التقييم:</span>
                      <span className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 ml-1" />
                        {seller.rating} ({seller.reviewCount})
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ الانضمام:</span>
                      <span>{seller.joinDate || '2025-01-01'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">الطلبات المكتملة:</span>
                      <span>{seller.completedOrders}</span>
                    </div>
                    
                    {seller.skills && (
                      <div>
                        <span className="text-gray-600 block mb-1">المهارات:</span>
                        <div className="flex flex-wrap gap-1">
                          {seller.skills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-blue-200 text-blue-600"
                    onClick={() => handleViewSellerProfile(seller.id)}
                  >
                    <User className="ml-1 h-4 w-4" /> الملف الشخصي
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-green-200 text-green-600"
                    onClick={() => handleViewSellerProducts(seller.id)}
                  >
                    <Package className="ml-1 h-4 w-4" /> المنتجات
                  </Button>
                  
                  {seller.status === 'pending' && (
                    <>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleApproveSeller(seller.id)}
                      >
                        <Check className="ml-1 h-4 w-4" /> قبول
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRejectSeller(seller.id)}
                      >
                        <X className="ml-1 h-4 w-4" /> رفض
                      </Button>
                    </>
                  )}
                  
                  {seller.status === 'active' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="col-span-2"
                        >
                          <Ban className="ml-1 h-4 w-4" /> تعليق الحساب
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>هل أنت متأكد من تعليق هذا الحساب؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            سيؤدي هذا إلى منع البائع "{seller.name}" من البيع مؤقتًا 
                            حتى تقوم بإلغاء التعليق. سيظل بإمكانه تسجيل الدخول إلى حسابه.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleSuspendSeller(seller.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            تعليق الحساب
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  
                  {seller.status === 'suspended' && (
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 col-span-2"
                      onClick={() => handleActivateSeller(seller.id)}
                    >
                      <Check className="ml-1 h-4 w-4" /> إلغاء التعليق وتفعيل الحساب
                    </Button>
                  )}
                  
                  {seller.status === 'rejected' && (
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 col-span-2"
                      onClick={() => handleApproveSeller(seller.id)}
                    >
                      <Check className="ml-1 h-4 w-4" /> الموافقة على الحساب
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

export default AdminSellers;
