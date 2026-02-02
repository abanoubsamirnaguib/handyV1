import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Trash2, 
  Eye, 
  Bookmark,
  Search,
  Filter,
  Star,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Check
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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
import { adminApi, api } from '@/lib/api';
import { useCategories } from '@/hooks/useCache';

const AdminProducts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);  const [updating, setUpdating] = useState(false);
    // Pagination state for traditional pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  // Rejection dialog state
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedProductToReject, setSelectedProductToReject] = useState(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);useEffect(() => {
    if (user?.role !== 'admin') {
      toast({
        variant: "destructive",
        title: "غير مصرح به",
        description: "هذه الصفحة مخصصة للمشرفين فقط."
      });
      return;    }
    fetchProducts(); // Fetch first page
    fetchCategories();
  }, [user]);// Fetch products when search, filter, or page changes
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchProducts();
    }
  }, [searchTerm, categoryFilter, statusFilter, currentPage, user]);  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage
      };
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      
      const response = await adminApi.getProducts(params);
      
      // Debug: Log the actual response structure
      console.log('Full API Response:', response);
        // Handle Laravel pagination response with ProductResource::collection
      if (response.data && Array.isArray(response.data)) {
        // Direct data array (ProductResource::collection structure)
        setProducts(response.data || []);
        setCurrentPage(response.meta.current_page || 1);
        setTotalPages(response.meta.last_page || 1);
        setTotalItems(response.meta.total || 0);
        setItemsPerPage(response.meta.per_page || 5);
      } 
      
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات المنتجات"
      });
    } finally {
      setLoading(false);
    }
  };
  // Use cached categories from React Query
  const { data: categoriesData } = useCategories();
  
  useEffect(() => {
    if (categoriesData) {
      // Handle different response structures
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      } else if (categoriesData.data && Array.isArray(categoriesData.data)) {
        setCategories(categoriesData.data);
      } else {
        setCategories([]);
      }
    }
  }, [categoriesData]);  // Handle search and filter changes
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
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
  };

  const handleDeleteProduct = async (productId) => {
    try {
      setUpdating(true);
      await adminApi.deleteProduct(productId);
      // Refresh the current page after deletion
      await fetchProducts();
      toast({
        title: "تم حذف المنتج",
        description: "تم حذف المنتج بنجاح."
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المنتج"
      });
    } finally {
      setUpdating(false);
    }
  };


  const handleViewProduct = (productId) => {
    navigate(`/gigs/${productId}`);
  };

  const openRejectDialog = (productId) => {
    setSelectedProductToReject(productId);
    setRejectionReason('');
    setShowRejectDialog(true);
  };

  const handleRejectProduct = async () => {
    if (!selectedProductToReject) return;
    
    if (!rejectionReason.trim()) {
      toast({
        variant: "destructive",
        title: "سبب الرفض مطلوب",
        description: "يرجى إدخال سبب رفض المنتج."
      });
      return;
    }

    try {
      setUpdating(true);
      await adminApi.updateProductStatus(selectedProductToReject, 'rejected', rejectionReason);
      setProducts(prev => prev.map(p => p.id === selectedProductToReject ? { ...p, status: 'rejected' } : p));
      toast({
        title: "تم رفض المنتج",
        description: "تم رفض المنتج بنجاح وإرسال الإشعار للبائع."
      });
      // Close dialog and reset state
      setShowRejectDialog(false);
      setSelectedProductToReject(null);
      setRejectionReason('');
      // Refresh products to remove rejected product from pending_review list
      await fetchProducts();
    } catch (error) {
      console.error('Error rejecting product:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء رفض المنتج"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleApproveProduct = async (productId) => {
    try {
      setUpdating(true);
      await adminApi.updateProductStatus(productId, 'active');
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'active' } : p));
      toast({
        title: "تم الموافقة على المنتج",
        description: "تم تفعيل المنتج بنجاح."
      });
      // Refresh products to remove approved product from pending_review list
      await fetchProducts();
    } catch (error) {
      console.error('Error approving product:', error);
      
      // Check if error is due to seller limit
      if (error.response?.error === 'seller_limit_reached') {
        toast({
          variant: "destructive",
          title: "تعذر الموافقة على المنتج",
          description: error.response.message || error.message || "البائع وصل للحد الأقصى من المنتجات المفعلة (10 منتجات).",
          duration: 5000
        });
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: error.message || "حدث خطأ أثناء الموافقة على المنتج"
        });
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleFeatured = async (productId) => {
    try {
      setUpdating(true);
      const product = products.find(p => p.id === productId);
      const newFeaturedStatus = !product?.featured;
      
      await adminApi.toggleProductFeatured(productId, newFeaturedStatus);
      
      // Update the product in the current page
      setProducts(prev => prev.map(product => {
        if (product.id === productId) {
          return { ...product, featured: newFeaturedStatus };
        }
        return product;
      }));
      
      toast({
        title: newFeaturedStatus ? "تمييز المنتج" : "إلغاء تمييز المنتج",
        description: newFeaturedStatus 
          ? "تم تمييز المنتج بنجاح."
          : "تم إلغاء تمييز المنتج بنجاح."
      });
    } catch (error) {
      console.error('Error toggling product featured status:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء تغيير حالة تمييز المنتج"
      });
    } finally {
      setUpdating(false);
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
        <h2 className="text-lg font-semibold text-gray-700">جاري تحميل المنتجات...</h2>
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
          <h1 className="text-3xl font-bold text-gray-800">إدارة المنتجات</h1>
          <p className="text-gray-500 mt-1">استعراض وإدارة المنتجات المعروضة</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-4"
      >        <div className="relative flex-grow">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="البحث عن منتج..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="w-full md:w-1/3">
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full">
              <Filter className="h-4 w-4 ml-2" />
              <SelectValue placeholder="تصفية حسب التصنيف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">الكل</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-1/3">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full">
              <Filter className="h-4 w-4 ml-2" />
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">الكل</SelectItem>
              <SelectItem value="active">مفعل</SelectItem>
              <SelectItem value="inactive">معطل</SelectItem>
              <SelectItem value="pending_review">في انتظار المراجعة</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">لا توجد منتجات</h2>
          <p className="text-gray-500">لم يتم العثور على منتجات تطابق معايير البحث.</p>
        </div>
      ) : (        <>          {/* Products info header */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              عرض {((currentPage - 1) * itemsPerPage) + 1} إلى {Math.min(currentPage * itemsPerPage, totalItems)} من {totalItems} منتج
            </p>
            <p className="text-sm text-gray-600">
              الصفحة {currentPage} من {totalPages}
            </p>
          </div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => {
            const category = categories.find(c => c.id === product.category_id);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow border-blue-100 h-full flex flex-col">
                  <CardHeader className="pb-2 relative">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-gray-800 line-clamp-2">{product.title}</CardTitle>
                      <div className="flex gap-2 items-center">
                        <Badge
                          className={
                            product.status === 'active'
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-gray-400 hover:bg-gray-500'
                          }
                        >
                          {product.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                        <Badge
                          className={product.featured 
                            ? "bg-yellow-500 hover:bg-yellow-600" 
                            : "bg-gray-400 hover:bg-gray-500"}
                        >
                          {product.featured ? "مميز" : "غير مميز"}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-gray-500 line-clamp-2">
                      {product.description.substring(0, 100)}...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">معرف البائع:</span>
                        <span className="font-semibold">{product.seller_name || product.seller?.user?.name || product.sellerId || 'غير محدد'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">التصنيف:</span>
                        <Badge variant="outline" className="border-blue-200 text-blue-600">
                          {category?.name || product.category_name || 'غير محدد'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">النوع:</span>
                        <Badge variant="outline" className={product.type === 'gig' ? "border-purple-200 text-purple-600" : "border-orange-200 text-orange-600"}>
                          {product.type === 'gig' ? 'حرفة' : 'منتج جاهز'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">السعر:</span>
                        {product.price == 0 ? (
          <span className="font-semibold text-blue-600">حرفة قابلة للتفاوض</span>
                        ) : (
                          <span className="font-semibold text-green-600">{product.price} جنيه</span>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">عدد الطلبات:</span>
                        <span className="font-semibold">{product.orders_count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">التقييم:</span>
                        <span className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 ml-1" />
                          {product.rating} ({product.reviewCount})
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="grid grid-cols-2 gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-blue-200 text-blue-600"
                      onClick={() => handleViewProduct(product.id)}
                    >
                      <Eye className="ml-1 h-4 w-4" /> عرض
                    </Button>
                    {product.status === 'pending_review' ? (
                      <>
                        <Button 
                          variant="default"
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          disabled={updating}
                          onClick={() => handleApproveProduct(product.id)}
                        >
                          <Check className="ml-1 h-4 w-4" /> موافقة
                        </Button>
                        <AlertDialog 
                          open={showRejectDialog && selectedProductToReject === product.id} 
                          onOpenChange={(open) => {
                            if (!open) {
                              setShowRejectDialog(false);
                              setSelectedProductToReject(null);
                              setRejectionReason('');
                            }
                          }}
                        >
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive"
                              size="sm"
                              className="bg-red-500 hover:bg-red-600"
                              disabled={updating}
                              onClick={() => openRejectDialog(product.id)}
                            >
                              <X className="ml-1 h-4 w-4" /> رفض
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>رفض المنتج</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من رغبتك في رفض المنتج "{product.title}"؟
                                سيتم إشعار البائع بالرفض وطلب إعادة إنشاء المنتج.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="my-4">
                              <label className="block text-sm font-medium mb-2">سبب الرفض (مطلوب)</label>
                              <Textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="أدخل سبب رفض المنتج... (مثال: المحتوى غير مناسب، الصور غير واضحة، الوصف غير كافٍ)"
                                rows={4}
                                className="w-full"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                سيتم إرسال هذا السبب للبائع في الإشعار
                              </p>
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => {
                                setShowRejectDialog(false);
                                setSelectedProductToReject(null);
                                setRejectionReason('');
                              }}>
                                إلغاء
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleRejectProduct}
                                disabled={updating || !rejectionReason.trim()}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {updating ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                    جاري الرفض...
                                  </>
                                ) : (
                                  'رفض المنتج'
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    ) : product.status === 'rejected' || product.status === 'inactive' ? (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          disabled={updating}
                          onClick={async () => {
                            setUpdating(true);
                            try {
                              await adminApi.updateProductStatus(product.id, 'active');
                              setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'active' } : p));
                              toast({
                                title: 'تم تفعيل المنتج',
                                description: 'تم تفعيل المنتج بنجاح.'
                              });
                            } catch (error) {
                              toast({
                                variant: 'destructive',
                                title: 'خطأ',
                                description: 'حدث خطأ أثناء تفعيل المنتج'
                              });
                            } finally {
                              setUpdating(false);
                            }
                          }}
                        >
                          تفعيل
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant={product.featured ? "outline" : "default"}
                          size="sm"
                          className={product.featured 
                            ? "border-yellow-500 text-yellow-600" 
                            : "bg-yellow-500 hover:bg-yellow-600"}
                          onClick={() => handleToggleFeatured(product.id)}
                        >
                          <Bookmark className="ml-1 h-4 w-4" />
                          {product.featured ? "إلغاء التمييز" : "تمييز"}
                        </Button>
                        <Button
                          variant={product.status === 'active' ? 'destructive' : 'default'}
                          size="sm"
                          className={product.status === 'active' ? 'bg-gray-400 hover:bg-gray-500' : 'bg-green-500 hover:bg-green-600'}
                          disabled={updating}
                          onClick={async () => {
                            setUpdating(true);
                            try {
                              const newStatus = product.status === 'active' ? 'inactive' : 'active';
                              await adminApi.updateProductStatus(product.id, newStatus);
                              setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
                              toast({
                                title: newStatus === 'active' ? 'تم تفعيل المنتج' : 'تم إلغاء تفعيل المنتج',
                                description: newStatus === 'active' ? 'تم تفعيل المنتج بنجاح.' : 'تم إلغاء تفعيل المنتج بنجاح.'
                              });
                            } catch (error) {
                              toast({
                                variant: 'destructive',
                                title: 'خطأ',
                                description: 'حدث خطأ أثناء تغيير حالة المنتج'
                              });
                            } finally {
                              setUpdating(false);
                            }
                          }}
                        >
                          {product.status === 'active' ? 'تعطيل' : 'تفعيل'}
                        </Button>
                      </>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="ml-1 h-4 w-4" /> حذف
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>هل أنت متأكد من حذف هذا المنتج؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            سيؤدي هذا الإجراء إلى حذف المنتج "{product.title}" نهائيًا.
                            لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>              </motion.div>
            );
          })}          </div>

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

export default AdminProducts;
