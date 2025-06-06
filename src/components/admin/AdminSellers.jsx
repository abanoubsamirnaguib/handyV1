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
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
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

const AdminSellers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { startConversation, setActiveConversation } = useChat();
  
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  useEffect(() => {
    if (user?.role !== 'admin') {
      toast({
        variant: "destructive",
        title: "غير مصرح به",
        description: "هذه الصفحة مخصصة للمشرفين فقط."
      });
      return;    }
    fetchSellers(); // Fetch first page
  }, [user]);

  // Fetch sellers when search, filter, or page changes
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchSellers();
    }
  }, [searchTerm, statusFilter, currentPage, user]);
  const fetchSellers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage
      };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      
      const response = await adminApi.getSellers(params);
      
      // Handle Laravel pagination response with SellerResource::collection
      if (response.data && Array.isArray(response.data)) {
        // Direct data array (SellerResource::collection structure)
        setSellers(response.data || []);
        setFilteredSellers(response.data || []);
        setCurrentPage(response.meta?.current_page || 1);
        setTotalPages(response.meta?.last_page || 1);
        setTotalItems(response.meta?.total || 0);
        setItemsPerPage(response.meta?.per_page || 5);
      } else {
        // Fallback for non-paginated response
        setSellers(response.data || []);
        setFilteredSellers(response.data || []);
      }
      
    } catch (error) {
      console.error('Error fetching sellers:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات البائعين"
      });
    } finally {
      setLoading(false);
    }
  };
  // Handle search and filter changes
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };
  // Helper function to handle post-status-change updates
  const handlePostStatusChange = (sellerId, newStatus) => {
    // Update the main sellers list first
    setSellers(prev => prev.map(seller => {
      if (seller.id === sellerId) {
        return { 
          ...seller, 
          user: {
            ...seller.user,
            status: newStatus
          }
        };
      }
      return seller;
    }));
    
    // If there's a status filter active and the new status doesn't match,
    // we need to remove this seller from the filtered list
    if (statusFilter && statusFilter !== newStatus) {
      setFilteredSellers(prev => prev.filter(seller => seller.id !== sellerId));
    } else {
      // Otherwise, update the seller in the filtered list
      setFilteredSellers(prev => prev.map(seller => {
        if (seller.id === sellerId) {
          return { 
            ...seller, 
            user: {
              ...seller.user,
              status: newStatus
            }
          };
        }
        return seller;
      }));
    }
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };  // Update filtered sellers when main seller list, search or status filter changes
  useEffect(() => {
    // Update local filter without refetching from server
    let filtered = [...sellers];
    
    // Apply any local filters if needed
    if (statusFilter) {
      filtered = filtered.filter(seller => seller.user?.status === statusFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(seller => 
        seller.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredSellers(filtered);
  }, [sellers, statusFilter, searchTerm]);const handleApproveSeller = async (sellerId) => {
    try {
      setUpdating(true);
      await adminApi.updateSellerStatus(sellerId, 'active');
      // Use the helper function to update local state
      handlePostStatusChange(sellerId, 'active');
      
      toast({
        title: "تمت الموافقة على البائع",
        description: "تم تفعيل حساب البائع بنجاح."
      });
    } catch (error) {
      console.error('Error approving seller:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء الموافقة على البائع"
      });
    } finally {
      setUpdating(false);
    }
  };  const handleRejectSeller = async (sellerId) => {
    try {
      setUpdating(true);
      await adminApi.updateSellerStatus(sellerId, 'rejected');
      // Use the helper function to update local state
      handlePostStatusChange(sellerId, 'rejected');
      
      toast({
        title: "تم رفض البائع",
        description: "تم رفض حساب البائع."
      });
    } catch (error) {
      console.error('Error rejecting seller:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء رفض البائع"
      });
    } finally {
      setUpdating(false);
    }
  };  const handleSuspendSeller = async (sellerId) => {
    try {
      setUpdating(true);
      await adminApi.updateSellerStatus(sellerId, 'suspended');
      // Use the helper function to update local state
      handlePostStatusChange(sellerId, 'suspended');
      
      toast({
        title: "تم تعليق البائع",
        description: "تم تعليق حساب البائع بنجاح."
      });
    } catch (error) {
      console.error('Error suspending seller:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء تعليق البائع"
      });
    } finally {
      setUpdating(false);
    }
  };const handleViewSellerProfile = (sellerId) => {
    navigate(`/sellers/${sellerId}`);
  };
  
  const handleChatWithUser = (seller) => {
    if (seller.user.id === user.id) {
      toast({ 
        variant: "destructive", 
        title: "لا يمكن مراسلة نفسك", 
        description: "لا يمكنك بدء محادثة مع نفسك." 
      });
      return;
    }
    
    // Format user data for chat context
    const chatParticipant = {
      id: seller.user.id,
      name: seller.user.name,
      avatar: seller.user.avatar || '',
      lastSeen: new Date().toISOString()
    };
    
    // Start a conversation with the seller
    const conversationId = startConversation(chatParticipant);
    setActiveConversation(conversationId);
    navigate('/chat');
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600"><Check className="h-3 w-3 ml-1" />نشط</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Shield className="h-3 w-3 ml-1" />بانتظار الموافقة</Badge>;
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

  if (loading) {
    return (
      <div className="p-6 md:p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-700">جاري تحميل البائعين...</h2>
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
          <p className="text-gray-500 mt-1">عرض وإدارة جميع حسابات البائعين</p>
        </div>
        <div className="flex flex-wrap gap-2">          <Badge className="bg-green-100 text-green-700 py-2 px-3">
            <UserCheck className="h-4 w-4 ml-1" /> نشط: {sellers.filter(s => s.user?.status === 'active').length}
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-700 py-2 px-3">
            <Shield className="h-4 w-4 ml-1" /> بانتظار الموافقة: {sellers.filter(s => s.user?.status === 'pending').length}
          </Badge>
          <Badge className="bg-orange-100 text-red-700 py-2 px-3">
            <Ban className="h-4 w-4 ml-1" /> معلق: {sellers.filter(s => s.user?.status === 'suspended').length}
          </Badge>
          <Badge className="bg-red-100 text-gray-700 py-2 px-3">
            <X className="h-4 w-4 ml-1" /> مرفوض: {sellers.filter(s => s.user?.status === 'rejected').length}
          </Badge>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-4"
      >        <div className="relative flex-grow">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="البحث عن بائع..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="w-full md:w-1/4">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full">
              <Shield className="h-4 w-4 ml-2" />
              <SelectValue placeholder="فلترة حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">الكل</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="pending">بانتظار الموافقة</SelectItem>
              <SelectItem value="suspended">معلق</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>      {filteredSellers.length === 0 ? (
        <div className="text-center py-12">
          <UserX className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">لا يوجد بائعين</h2>
          <p className="text-gray-500">لم يتم العثور على بائعين يطابقون معايير البحث.</p>
        </div>
      ) : (
        <>
          {/* Items count display */}
                  <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-600">
                    عرض {((currentPage - 1) * itemsPerPage) + 1} إلى {Math.min(currentPage * itemsPerPage, totalItems)} من {totalItems} بائع
                  </p>
                  <p className="text-sm text-gray-600">
                    الصفحة {currentPage} من {totalPages}
                  </p>
                  </div>

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
                      <AvatarImage src={seller.user.avatar} />
                      <AvatarFallback>{seller.user.name?.charAt(0) || 'S'}</AvatarFallback>
                      </Avatar>
                      <div>
                      <CardTitle className="text-lg text-gray-800">{seller.user.name}</CardTitle>
                      <CardDescription className="text-gray-500">{seller.user.email}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(seller.user.status)}
                    </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                    <div className="space-y-3 text-sm">                    <div className="flex justify-between">
                      <span className="text-gray-600">الوصف:</span>
                      <span className="text-right max-w-[200px] truncate">{seller.user?.bio || 'لا يوجد وصف'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">التقييم:</span>
                      <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current ml-1" />
                      <span>{seller.rating ? parseFloat(seller.rating).toFixed(1) : '0.0'}</span>
                      <span className="text-gray-400 mr-1">({seller.review_count || 0})</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ الانضمام:</span>
                      <span>{seller.member_since ? new Date(seller.member_since).toLocaleDateString('en-GB') : 'غير محدد'}</span>
                    </div>                      <div className="flex justify-between">
                      <span className="text-gray-600">المهارات:</span>
                      <span>
                      {Array.isArray(seller.skills) && seller.skills.length > 0
                        ? seller.skills.join(', ')
                        : 'لا يوجد'}
                      </span>
                    </div>
                    </div>
                    </CardContent> 
                    <CardFooter className="grid grid-cols-2 gap-2 pt-4 border-t">
                    <Button 
                    variant="outline" 
                    size="sm"
                    className="border-blue-200 text-blue-600"
                    onClick={() => handleViewSellerProfile(seller.id)}
                    >
                    <Eye className="ml-1 h-4 w-4" /> عرض الملف الشخصي
                    </Button>
                    <Button 
                    variant="outline" 
                    size="sm"
                    className="border-blue-200 text-blue-600"
                    onClick={() => handleChatWithUser(seller)}
                    >
                    <MessageSquare className="ml-1 h-4 w-4" /> محادثة
                    </Button>
                      {seller.user.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-2 col-span-2">
                      <Button 
                      variant="default" 
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => handleApproveSeller(seller.id)}
                      disabled={updating}
                      >
                      {updating ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <Check className="ml-1 h-4 w-4" />}
                      موافقة
                      </Button>
                      <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleRejectSeller(seller.id)}
                      disabled={updating}
                      >
                      {updating ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <X className="ml-1 h-4 w-4" />}
                      رفض
                      </Button>
                    </div>
                    )}
                      {seller.user.status === 'active' && (
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
                      سيؤدي هذا إلى منع البائع "{seller.user.name}" من بيع المنتجات مؤقتًا
                      حتى تقوم بإلغاء التعليق.
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
                      {seller.user.status === 'suspended' && (
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 col-span-2"
                      onClick={() => handleApproveSeller(seller.id)}
                      disabled={updating}
                    >
                      {updating ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <Check className="ml-1 h-4 w-4" />}
                      إعادة تفعيل
                    </Button>
                    )}
                    </CardFooter>
                    </Card>
                  </motion.div>
                  ))}
                  </div>

                  {/* Pagination Controls */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center gap-2 mt-8"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              <ChevronRight className="h-4 w-4" />
              السابق
            </Button>

            <div className="flex items-center gap-1">
              {/* Show first page */}
              {currentPage > 3 && (
                <>
                  <Button
                    variant={1 === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    className={1 === currentPage ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    1
                  </Button>
                  {currentPage > 4 && <span className="px-2 text-gray-500">...</span>}
                </>
              )}

              {/* Show pages around current page */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                const pageNum = startPage + i;
                
                if (pageNum > totalPages || pageNum < 1) return null;
                if (currentPage <= 3 || pageNum !== 1) {
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={pageNum === currentPage ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      {pageNum}
                    </Button>
                  );
                }
                return null;
              })}

              {/* Show last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                  <Button
                    variant={totalPages === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    className={totalPages === currentPage ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
            >
              التالي
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
        </>
      )}
    </div>
  );
};

export default AdminSellers;
