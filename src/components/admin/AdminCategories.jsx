import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, PlusCircle, Edit, Trash2, Save, X } from 'lucide-react';
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
import { categories } from '@/lib/data';
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

const AdminCategories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [allCategories, setAllCategories] = useState([...categories]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ id: '', name: '', icon: '' });
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // تأكد من أن المستخدم هو مشرف
  useEffect(() => {
    if (user?.role !== 'admin') {
      toast({
        variant: "destructive",
        title: "غير مصرح به",
        description: "هذه الصفحة مخصصة للمشرفين فقط."
      });
    }
  }, [user, toast]);

  const handleDeleteCategory = (categoryId) => {
    setAllCategories(prev => prev.filter(category => category.id !== categoryId));
    toast({
      title: "تم حذف التصنيف",
      description: "تم حذف التصنيف بنجاح"
    });
  };

  const handleEditCategory = (category) => {
    setEditingCategory({ ...category });
  };

  const handleSaveEdit = () => {
    if (!editingCategory.id || !editingCategory.name) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "جميع الحقول مطلوبة"
      });
      return;
    }
    
    setAllCategories(prev => prev.map(cat => 
      cat.id === editingCategory.id ? editingCategory : cat
    ));
    
    toast({
      title: "تم تحديث التصنيف",
      description: `تم تحديث التصنيف "${editingCategory.name}" بنجاح`
    });
    
    setEditingCategory(null);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  const handleAddCategory = () => {
    if (!newCategory.id || !newCategory.name) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "جميع الحقول مطلوبة"
      });
      return;
    }
    
    // تحقق من وجود التصنيف
    if (allCategories.some(cat => cat.id === newCategory.id)) {
      toast({
        variant: "destructive",
        title: "تصنيف موجود",
        description: "معرف التصنيف موجود بالفعل"
      });
      return;
    }
    
    setAllCategories(prev => [...prev, newCategory]);
    
    toast({
      title: "تم إضافة التصنيف",
      description: `تم إضافة التصنيف "${newCategory.name}" بنجاح`
    });
    
    setNewCategory({ id: '', name: '', icon: '' });
    setIsAddingCategory(false);
  };

  const handleCancelAdd = () => {
    setNewCategory({ id: '', name: '', icon: '' });
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
        </div>
        <Button 
          onClick={() => setIsAddingCategory(true)} 
          className="bg-blue-600 hover:bg-blue-700" 
          disabled={isAddingCategory}
        >
          <PlusCircle className="ml-2 h-5 w-5" /> إضافة تصنيف جديد
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
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">معرف التصنيف</label>
                  <Input
                    value={newCategory.id}
                    onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
                    placeholder="مثال: jewelry"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم التصنيف</label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="مثال: المجوهرات"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الأيقونة</label>
                  <Input
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                    placeholder="مثال: gem"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4 space-x-2 space-x-reverse">
                <Button onClick={handleCancelAdd} variant="outline" className="border-gray-300">
                  <X className="ml-2 h-4 w-4" /> إلغاء
                </Button>
                <Button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="ml-2 h-4 w-4" /> حفظ
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
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">معرف التصنيف</label>
                      <Input
                        value={editingCategory.id}
                        onChange={(e) => setEditingCategory({ ...editingCategory, id: e.target.value })}
                        className="w-full"
                        disabled // لا يمكن تعديل المعرف
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">اسم التصنيف</label>
                      <Input
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الأيقونة</label>
                      <Input
                        value={editingCategory.icon}
                        onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-4 space-x-2 space-x-reverse">
                    <Button onClick={handleCancelEdit} variant="outline" className="border-gray-300">
                      <X className="ml-2 h-4 w-4" /> إلغاء
                    </Button>
                    <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
                      <Save className="ml-2 h-4 w-4" /> حفظ
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
                    <CardTitle className="text-lg text-gray-800">{category.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>معرف التصنيف: {category.id}</span>
                    <span>الأيقونة: {category.icon}</span>
                  </div>
                  <div className="flex justify-end mt-4 space-x-2 space-x-reverse">
                    <Button 
                      onClick={() => handleEditCategory(category)} 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-200 text-blue-600"
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
