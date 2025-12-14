import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, PlusCircle, Edit, Trash2, Eye, BarChart2, Loader2, AlertCircle, RefreshCw, Filter, Power, PowerOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { sellerApi } from '@/lib/api';
import { Link, useNavigate } from 'react-router-dom';
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
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import ProductGigSelectionModal from '@/components/ui/product-gig-selection-modal';


const DashboardGigs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userGigs, setUserGigs] = useState([]);
  const [filteredGigs, setFilteredGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingGigs, setDeletingGigs] = useState(new Set());
  const [togglingGigs, setTogglingGigs] = useState(new Set());
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'gig', or 'product'
  const [activeProductsCount, setActiveProductsCount] = useState(0);
  const [showSelectionModal, setShowSelectionModal] = useState(false);

  // Fetch seller's gigs from backend
  useEffect(() => {
    const fetchGigs = async () => {
      if (!user || user.active_role !== 'seller') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await sellerApi.getSellerProducts();
        
        // Handle different response structures
        if (Array.isArray(response)) {
          setUserGigs(response);
        } else if (response && Array.isArray(response.data)) {
          setUserGigs(response.data);
        } else if (response && response.success && Array.isArray(response.data)) {
          setUserGigs(response.data);
        } else {
          setUserGigs([]);
        }
      } catch (error) {
        console.error('Error fetching seller gigs:', error);
        setError('فشل في تحميل الحرف. يرجى المحاولة مرة أخرى.');
        setUserGigs([]);
        toast({
          variant: "destructive",
          title: "خطأ في التحميل",
          description: "فشل في تحميل حرفك. يرجى المحاولة مرة أخرى.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, [user, toast]);

  // Apply type filter
  useEffect(() => {
    if (typeFilter === 'all') {
      setFilteredGigs(userGigs);
    } else {
      setFilteredGigs(userGigs.filter(gig => gig.type === typeFilter));
    }
    
    // Count active products
    const activeCount = userGigs.filter(gig => gig.status === 'active').length;
    setActiveProductsCount(activeCount);
  }, [userGigs, typeFilter]);

  const handleDeleteGig = async (gigId) => {
    try {
      // Add gig to deleting set
      setDeletingGigs(prev => new Set([...prev, gigId]));
      
      await sellerApi.deleteProduct(gigId);
      
      // Update local state
      setUserGigs(prevGigs => prevGigs.filter(gig => gig.id !== gigId));
      
      toast({
        title: "تم حذف الحرفة",
        description: "تم حذف الحرفة بنجاح.",
      });
    } catch (error) {
      console.error('Error deleting gig:', error);
      toast({
        variant: "destructive",
        title: "خطأ في الحذف",
        description: error.message || "فشل في حذف الحرفة. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      // Remove gig from deleting set
      setDeletingGigs(prev => {
        const newSet = new Set(prev);
        newSet.delete(gigId);
        return newSet;
      });
    }
  };

  const handleToggleStatus = async (gigId, currentStatus) => {
    try {
      // Add gig to toggling set
      setTogglingGigs(prev => new Set([...prev, gigId]));
      
      const response = await sellerApi.toggleProductStatus(gigId);
      
      // Update local state with the new product data
      setUserGigs(prevGigs => 
        prevGigs.map(gig => 
          gig.id === gigId 
            ? { ...gig, status: response.product.status }
            : gig
        )
      );
      
      // Update active count
      if (response.active_count !== undefined) {
        setActiveProductsCount(response.active_count);
      }
      
      toast({
        title: response.message || "تم تحديث الحالة",
        description: response.active_count !== undefined 
          ? `المنتجات النشطة: ${response.active_count} من ${response.total_slots || 10}`
          : '',
      });
    } catch (error) {
      console.error('Error toggling gig status:', error);
      toast({
        variant: "destructive",
        title: "خطأ في تغيير الحالة",
        description: error.message || "فشل في تغيير حالة المنتج. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      // Remove gig from toggling set
      setTogglingGigs(prev => {
        const newSet = new Set(prev);
        newSet.delete(gigId);
        return newSet;
      });
    }
  };

  const handleAddNewClick = () => {
    setShowSelectionModal(true);
  };

  const handleSelectProduct = () => {
    navigate('/dashboard/gigs/new?type=product');
  };

  const handleSelectGig = () => {
    navigate('/dashboard/gigs/new?type=gig');
  };

  if (user?.active_role !== 'seller') {
    return (
      <div className="p-6 md:p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-700">غير مصرح لك بالدخول</h1>
        <p className="text-gray-500">هذه الصفحة مخصصة للبائعين فقط.</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">العودة للوحة التحكم</Button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">حرفي</h1>
          <Button disabled className="bg-green-500">
            <PlusCircle className="ml-2 h-5 w-5" /> أضف حرفة جديدة
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-600">جاري تحميل حرفك...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">حرفي</h1>
          <Button onClick={() => navigate('/dashboard/gigs/new')} className="bg-green-500 hover:bg-green-600">
            <PlusCircle className="ml-2 h-5 w-5" /> أضف منتج/حرفة جديدة
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">خطأ في التحميل</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            إعادة المحاولة
          </Button>
        </div>
      </div>    );
  }
  
  const refreshGigs = async () => {
    if (!user || user.active_role !== 'seller') return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await sellerApi.getSellerProducts();
      
      if (Array.isArray(response)) {
        setUserGigs(response);
      } else if (response && Array.isArray(response.data)) {
        setUserGigs(response.data);
      } else if (response && response.success && Array.isArray(response.data)) {
        setUserGigs(response.data);      } else {
        setUserGigs([]);
      }
      
      toast({
        title: "تم تحديث الحرف",
        description: "تم تحديث قائمة حرفك بنجاح.",
      });
    } catch (error) {
      console.error('Error refreshing gigs:', error);
      setError('فشل في تحديث الحرف. يرجى المحاولة مرة أخرى.');
      toast({
        variant: "destructive",
        title: "خطأ في التحديث",
        description: "فشل في تحديث حرفك. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8">      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >        <div>
          <h1 className="text-3xl font-bold text-gray-800">حرفي</h1>
          <p className="text-sm text-gray-600 mt-1">
            المنتجات النشطة: <span className="font-bold text-green-600">{activeProductsCount}</span> من <span className="font-bold">10</span>
          </p>
        </div>
        <div className="flex items-center gap-2">          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {typeFilter === 'all' ? 'الكل' : typeFilter === 'gig' ? 'حرف' : 'منتجات'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>تصفية حسب النوع</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                الكل {typeFilter === 'all' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('gig')}>
                حرف {typeFilter === 'gig' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('product')}>
                منتجات {typeFilter === 'product' && '✓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            onClick={refreshGigs} 
            variant="outline" 
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Button onClick={handleAddNewClick} className="bg-green-500 hover:bg-green-600">
            <PlusCircle className="ml-2 h-5 w-5" /> أضف منتج/حرفة جديد
          </Button>
        </div>
      </motion.div>

      {filteredGigs.length === 0 ? (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            {userGigs.length === 0 
              ? 'ليس لديك حرف معروضة بعد'
              : 'لا توجد حرف تطابق الفلتر المحدد'}
          </h2>
          <p className="text-gray-500">
            {userGigs.length === 0 
              ? 'ابدأ بإضافة حرفك ليراها العملاء!'
              : 'اختر فلتر مختلف لعرض الحرف المتاحة.'}
          </p>
          {userGigs.length === 0 && (
            <Button onClick={handleAddNewClick} className="mt-6 bg-roman-500 hover:bg-roman-500/90 text-white">
              <PlusCircle className="ml-2 h-4 w-4" /> أضف منتجك/حرفتك الأول
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGigs.map((gig, index) => (
            <motion.div
              key={gig.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >              <Card className="shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full border-neutral-300">
                <div className="relative h-48">
                  <img 
                    src={(() => {
                      if (!gig.images || !gig.images.length) {
                        return "https://images.unsplash.com/photo-1690721606848-ac5bdcde45ea";
                      }
                      
                      const firstImage = gig.images[0];
                      
                      // If it's already a string URL, use it directly
                      if (typeof firstImage === 'string') {
                        return firstImage;
                      }
                      
                      // If it's an object with image_url property (backend format)
                      if (firstImage && typeof firstImage === 'object' && firstImage.image_url) {
                        return firstImage.image_url.startsWith('http') 
                          ? firstImage.image_url 
                          : `${import.meta.env.VITE_API_BASE_URL}/storage/${firstImage.image_url}`;
                      }
                      
                      // If it's a File object (for local preview)
                      if (firstImage instanceof File) {
                        return URL.createObjectURL(firstImage);
                      }
                      
                      // Fallback
                      return "https://images.unsplash.com/photo-1690721606848-ac5bdcde45ea";
                    })()} 
                    alt={gig.title} 
                    className="w-full h-full object-cover" 
                  />
                  <Badge variant="secondary" className="absolute top-2 right-2 bg-roman-500 text-white">
                    {gig.category_name || gig.category || 'غير محدد'}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`absolute top-2 left-2 ${
                      gig.type === 'product' 
                        ? 'bg-amber-100 text-amber-800 border-amber-200' 
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}
                  >
                    {gig.type === 'product' ? 'منتج' : 'حرفة'}
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-800 h-14 overflow-hidden">{gig.title}</CardTitle>
                  <CardDescription className="text-sm text-primary font-bold">{gig.price} جنيه</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={
                        gig.status === 'active' ? 'default' : 
                        gig.status === 'inactive' ? 'secondary' :
                        gig.status === 'pending_review' ? 'outline' :
                        'destructive'
                      } 
                      className="text-xs"
                    >
                      {
                        gig.status === 'active' ? 'نشط' : 
                        gig.status === 'inactive' ? 'معطّل' :
                        gig.status === 'pending_review' ? 'قيد المراجعة' : 
                        gig.status === 'rejected' ? 'مرفوض' :
                        'غير نشط'
                      }
                    </Badge>
                    {(gig.status === 'active' || gig.status === 'inactive') && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 mx-4">
                          {gig.status === 'active' ? 'مفعّل' : 'معطّل'}
                        </span>
                        <Switch
                          checked={gig.status === 'active'}
                          onCheckedChange={() => handleToggleStatus(gig.id, gig.status)}
                          disabled={togglingGigs.has(gig.id)}
                          className={togglingGigs.has(gig.id) ? 'opacity-50' : ''}
                        />
                      </div>
                    )}
                  </div>
                  {gig.status === 'rejected' && gig.rejection_reason && (
                    <p className="text-xs text-red-600 mt-1">
                      السبب: {gig.rejection_reason}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-2 pt-4 border-t">                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/dashboard/gigs/edit/${gig.id}`)}
                    className="flex items-center"
                  >
                    <Edit className="ml-1 h-4 w-4" /> تعديل
                  </Button><AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={deletingGigs.has(gig.id)}>
                        {deletingGigs.has(gig.id) ? (
                          <Loader2 className="ml-1 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="ml-1 h-4 w-4" />
                        )}
                        حذف
                      </Button>
                    </AlertDialogTrigger>                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من حذف هذه الحرفة؟</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>لا يمكن التراجع عن هذا الإجراء. سيتم حذف الحرفة "{gig.title}" نهائياً.</p>
                          <div className="bg-yellow-50 p-3 rounded-md">
                            <p className="text-sm text-yellow-800">
                              <strong>سيتم حذف:</strong>
                            </p>
                            <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                              <li>جميع صور الحرفة</li>
                              <li>تفاصيل الحرفة والوصف</li>
                              <li>الكلمات المفتاحية المرتبطة</li>
                            </ul>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={deletingGigs.has(gig.id)}>إلغاء</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteGig(gig.id)} 
                          className="bg-destructive hover:bg-destructive/90"
                          disabled={deletingGigs.has(gig.id)}
                        >
                          {deletingGigs.has(gig.id) ? (
                            <>
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              جاري الحذف...
                            </>
                          ) : (
                            'حذف نهائياً'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <ProductGigSelectionModal
        isOpen={showSelectionModal}
        onClose={() => setShowSelectionModal(false)}
        onSelectProduct={handleSelectProduct}
        onSelectGig={handleSelectGig}
      />
    </div>
  );
};

export default DashboardGigs;
