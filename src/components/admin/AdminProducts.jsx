import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Eye, 
  Bookmark,
  Search,
  Filter,
  Star
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
import { categories, gigs as products } from '@/lib/data';
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

const AdminProducts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [allProducts, setAllProducts] = useState([...products]);
  const [filteredProducts, setFilteredProducts] = useState([...products]);

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
    let result = [...allProducts];
    
    if (searchTerm) {
      result = result.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter) {
      result = result.filter(product => product.category === categoryFilter);
    }
    
    setFilteredProducts(result);
  }, [searchTerm, categoryFilter, allProducts]);

  const handleDeleteProduct = (productId) => {
    setAllProducts(prev => prev.filter(product => product.id !== productId));
    toast({
      title: "تم حذف المنتج",
      description: "تم حذف المنتج بنجاح."
    });
  };

  const handleAddProduct = () => {
    toast({
      title: "إضافة منتج جديد",
      description: "سيتم تحويلك إلى صفحة إضافة منتج."
    });
    // في تطبيق حقيقي، هنا سيتم التحويل إلى صفحة إضافة منتج
    // navigate('/admin/products/new');
  };

  const handleEditProduct = (productId) => {
    toast({
      title: "تعديل المنتج",
      description: `سيتم تحويلك إلى صفحة تعديل المنتج ${productId}.`
    });
    // في تطبيق حقيقي، هنا سيتم التحويل إلى صفحة تعديل المنتج
    // navigate(`/admin/products/edit/${productId}`);
  };

  const handleViewProduct = (productId) => {
    toast({
      title: "عرض المنتج",
      description: `سيتم تحويلك إلى صفحة عرض المنتج ${productId}.`
    });
    navigate(`/gigs/${productId}`);
  };

  const handleToggleFeatured = (productId) => {
    setAllProducts(prev => prev.map(product => {
      if (product.id === productId) {
        return { ...product, featured: !product.featured };
      }
      return product;
    }));
    
    const product = allProducts.find(p => p.id === productId);
    
    toast({
      title: product?.featured ? "إلغاء تمييز المنتج" : "تمييز المنتج",
      description: product?.featured 
        ? "تم إلغاء تمييز المنتج بنجاح."
        : "تم تمييز المنتج بنجاح."
    });
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
          <h1 className="text-3xl font-bold text-gray-800">إدارة المنتجات</h1>
          <p className="text-gray-500 mt-1">استعراض وإدارة المنتجات المعروضة</p>
        </div>
        <Button 
          onClick={handleAddProduct} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle className="ml-2 h-5 w-5" /> إضافة منتج جديد
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-grow">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="البحث عن منتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="w-full md:w-1/3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
      </motion.div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">لا توجد منتجات</h2>
          <p className="text-gray-500">لم يتم العثور على منتجات تطابق معايير البحث.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => {
            const category = categories.find(c => c.id === product.category);
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
                      <Badge
                        className={product.featured 
                          ? "bg-yellow-500 hover:bg-yellow-600" 
                          : "bg-gray-400 hover:bg-gray-500"}
                      >
                        {product.featured ? "مميز" : "غير مميز"}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-500 line-clamp-2">
                      {product.description.substring(0, 100)}...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">التصنيف:</span>
                        <Badge variant="outline" className="border-blue-200 text-blue-600">
                          {category?.name || product.category}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">السعر:</span>
                        <span className="font-semibold text-green-600">{product.price} جنيه</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">التقييم:</span>
                        <span className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 ml-1" />
                          {product.rating} ({product.reviewCount})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">معرف البائع:</span>
                        <span>{product.sellerId}</span>
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
                      variant="outline" 
                      size="sm"
                      className="border-green-200 text-green-600" 
                      onClick={() => handleEditProduct(product.id)}
                    >
                      <Edit className="ml-1 h-4 w-4" /> تعديل
                    </Button>
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
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
