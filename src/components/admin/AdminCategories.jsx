import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Tag, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Gem, 
  Star, 
  Heart, 
  ShoppingBag, 
  Book, 
  Camera, 
  Music, 
  Coffee, 
  Gift, 
  Scissors, 
  Axe, 
  Palette, 
  Briefcase, 
  Droplet, 
  Flame, 
  Shirt, 
  Image, 
  Watch, 
  Hammer, 
  Utensils,
  Loader2
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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
import { adminApi } from '@/lib/api';

// Define your icon options
const ICON_OPTIONS = [
  { value: 'gem', label: 'جوهرة', icon: <Gem className="w-5 h-5" /> },
  { value: 'star', label: 'نجمة', icon: <Star className="w-5 h-5" /> },
  { value: 'heart', label: 'قلب', icon: <Heart className="w-5 h-5" /> },
  { value: 'shopping-bag', label: 'تسوق', icon: <ShoppingBag className="w-5 h-5" /> },
  { value: 'book', label: 'كتاب', icon: <Book className="w-5 h-5" /> },
  { value: 'camera', label: 'كاميرا', icon: <Camera className="w-5 h-5" /> },
  { value: 'music', label: 'موسيقى', icon: <Music className="w-5 h-5" /> },
  { value: 'coffee', label: 'قهوة', icon: <Coffee className="w-5 h-5" /> },
  { value: 'gift', label: 'هدية', icon: <Gift className="w-5 h-5" /> },
  { value: 'scissors', label: 'مقص', icon: <Scissors className="w-5 h-5" /> },
  { value: 'axe', label: 'فأس', icon: <Axe className="w-5 h-5" /> },
  { value: 'palette', label: 'لوحة ألوان', icon: <Palette className="w-5 h-5" /> },
  { value: 'briefcase', label: 'حقيبة', icon: <Briefcase className="w-5 h-5" /> },
  { value: 'droplet', label: 'قطرة', icon: <Droplet className="w-5 h-5" /> },
  { value: 'fire', label: 'نار', icon: <Flame className="w-5 h-5" /> },
  { value: 'shirt', label: 'قميص', icon: <Shirt className="w-5 h-5" /> },
  { value: 'image', label: 'صورة', icon: <Image className="w-5 h-5" /> },
  { value: 'watch', label: 'ساعة', icon: <Watch className="w-5 h-5" /> },
  { value: 'hammer', label: 'مطرقة', icon: <Hammer className="w-5 h-5" /> },
  { value: 'utensils', label: 'أدوات مائدة', icon: <Utensils className="w-5 h-5" /> }
];

// Helper to get icon component by value
const getIconComponent = (value) => {
  const found = ICON_OPTIONS.find(opt => opt.value === value);
  return found ? found.icon : null;
};

const AdminCategories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [allCategories, setAllCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ id: '', name: '', icon: '', description: '' });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
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
    }
    
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getCategories();
      setAllCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في تحميل التصنيفات',
        description: 'تعذر تحميل التصنيفات من الخادم'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteCategory = async (categoryId) => {
    try {
      setUpdating(true);
      await adminApi.deleteCategory(categoryId);
      setAllCategories(prev => prev.filter(category => category.id !== categoryId));
      toast({
        title: "تم حذف التصنيف",
        description: "تم حذف التصنيف بنجاح"
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في الحذف',
        description: 'تعذر حذف التصنيف من الخادم'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory({ ...category });
  };
  const handleSaveEdit = async () => {
    if (!editingCategory.name) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "اسم التصنيف مطلوب"
      });
      return;
    }
    
    try {
      setUpdating(true);
      const updated = await adminApi.updateCategory(editingCategory.id, {
        name: editingCategory.name,
        icon: editingCategory.icon,
        description: editingCategory.description
      });
      
      setAllCategories(prev => prev.map(cat => cat.id === editingCategory.id ? updated.data : cat));
      toast({
        title: "تم تحديث التصنيف",
        description: `تم تحديث التصنيف "${editingCategory.name}" بنجاح`
      });
      setEditingCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في التحديث',
        description: 'تعذر تحديث التصنيف في الخادم'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };
  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "اسم التصنيف مطلوب"
      });
      return;
    }
    
    try {
      setUpdating(true);
      const created = await adminApi.createCategory({
        name: newCategory.name,
        icon: newCategory.icon,
        description: newCategory.description
      });
      
      setAllCategories(prev => [...prev, created.data]);
      toast({
        title: "تم إضافة التصنيف",
        description: `تم إضافة التصنيف "${newCategory.name}" بنجاح`
      });
      setNewCategory({ id: '', name: '', icon: '', description: '' });
      setIsAddingCategory(false);
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في الإضافة',
        description: 'تعذر إضافة التصنيف إلى الخادم'
      });
    } finally {
      setUpdating(false);
    }
  };
  const handleCancelAdd = () => {
    setNewCategory({ id: '', name: '', icon: '', description: '' });
    setIsAddingCategory(false);
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
        <h2 className="text-lg font-semibold text-gray-700">جاري تحميل التصنيفات...</h2>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة التصنيفات</h1>
          <p className="text-gray-500 mt-1">إضافة وتعديل وحذف تصنيفات المنتجات</p>
        </div>        <Button 
          onClick={() => setIsAddingCategory(true)} 
          className="bg-blue-600 hover:bg-blue-700" 
          disabled={isAddingCategory || updating}
        >
          {updating ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <PlusCircle className="ml-2 h-5 w-5" />}
          إضافة تصنيف جديد
        </Button>
      </motion.div>

      {isAddingCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-blue-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">إضافة تصنيف جديد</CardTitle>
            </CardHeader>            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم التصنيف</label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="مثال: المجوهرات"
                    className="w-full"
                    disabled={updating}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الأيقونة</label>
                  <div className="relative">
                    <select
                      value={newCategory.icon}
                      onChange={e => setNewCategory({ ...newCategory, icon: e.target.value })}
                      className="w-full border rounded px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                      disabled={updating}
                    >
                      <option value="">اختر أيقونة</option>
                      {ICON_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <span className="absolute left-3 top-2.5 pointer-events-none">
                      {getIconComponent(newCategory.icon)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <Input
                  value={newCategory.description || ""}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full"
                  placeholder="اكتب وصف التصنيف هنا"
                  disabled={updating}
                />
              </div>

              <div className="flex justify-end mt-4 space-x-2 space-x-reverse">
                <Button onClick={handleCancelAdd} variant="outline" className="border-gray-300" disabled={updating}>
                  <X className="ml-2 h-4 w-4" /> إلغاء
                </Button>
                <Button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700" disabled={updating}>
                  {updating ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                  حفظ
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allCategories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {editingCategory && editingCategory.id === category.id ? (
              <Card className="border-blue-200 shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">تعديل التصنيف</CardTitle>
                  <CardDescription className="text-gray-500 mt-1">
                    يمكنك تعديل اسم التصنيف أو الأيقونة أو الوصف ثم الضغط على "حفظ" لتحديث البيانات.
                  </CardDescription>
                </CardHeader>                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">اسم التصنيف</label>
                      <Input
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        className="w-full"
                        disabled={updating}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الأيقونة</label>
                      <div className="relative">
                        <select
                          value={editingCategory.icon}
                          onChange={e => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                          className="w-full border rounded px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                          disabled={updating}
                        >
                          <option value="">اختر أيقونة</option>
                          {ICON_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <span className="absolute left-3 top-2.5 pointer-events-none">
                          {getIconComponent(editingCategory.icon)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                      <Input
                        value={editingCategory.description || ""}
                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                        className="w-full"
                        placeholder="اكتب وصف التصنيف هنا"
                        disabled={updating}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 space-x-2 space-x-reverse">
                    <Button onClick={handleCancelEdit} variant="outline" className="border-gray-300" disabled={updating}>
                      <X className="ml-2 h-4 w-4" /> إلغاء
                    </Button>
                    <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700" disabled={updating}>
                      {updating ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                      حفظ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg hover:shadow-xl transition-shadow border-blue-100">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                      <Tag className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-800">{category.name}</CardTitle>
                      <CardDescription className="text-xs text-blue-500 mt-1">
                        {category.description || "لا يوجد وصف لهذا التصنيف."}
                      </CardDescription>
                    </div>
                  </div>                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>الأيقونة: {getIconComponent(category.icon) || category.icon}</span>
                  </div>
                  <div className="flex justify-end mt-4 space-x-2 space-x-reverse"><Button 
                      onClick={() => handleEditCategory(category)} 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-200 text-blue-600"
                      disabled={updating}
                    >
                      <Edit className="ml-1 h-4 w-4" /> تعديل
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={updating}>
                          {updating ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <Trash2 className="ml-1 h-4 w-4" />}
                          حذف
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>هل أنت متأكد من حذف هذا التصنيف؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            سيؤدي هذا الإجراء إلى حذف التصنيف "{category.name}" نهائيًا.
                            قد يؤثر هذا على المنتجات المرتبطة بهذا التصنيف.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCategory(category.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;
