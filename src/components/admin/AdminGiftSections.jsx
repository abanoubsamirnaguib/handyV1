import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Gift, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Loader2,
  Tag,
  Eye,
  EyeOff,
  GripVertical
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
import { Badge } from '@/components/ui/badge';
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
import { Switch } from "@/components/ui/switch";
import { adminApi } from '@/lib/api';

const AdminGiftSections = () => {
  const { toast } = useToast();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [newSection, setNewSection] = useState({ 
    title: '', 
    tags: [], 
    display_order: 0,
    is_active: true 
  });
  const [currentTag, setCurrentTag] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Load sections from API
  const loadSections = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getGiftSections();
      setSections(response.data || []);
    } catch (error) {
      console.error('Error loading gift sections:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'فشل في تحميل أقسام الهدايا',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  // Add tag to the list
  const handleAddTag = (isEditing = false) => {
    if (!currentTag.trim()) return;

    if (isEditing && editingSection) {
      setEditingSection({
        ...editingSection,
        tags: [...(editingSection.tags || []), currentTag.trim()]
      });
    } else {
      setNewSection({
        ...newSection,
        tags: [...(newSection.tags || []), currentTag.trim()]
      });
    }
    setCurrentTag('');
  };

  // Remove tag from list
  const handleRemoveTag = (tagToRemove, isEditing = false) => {
    if (isEditing && editingSection) {
      setEditingSection({
        ...editingSection,
        tags: editingSection.tags.filter(tag => tag !== tagToRemove)
      });
    } else {
      setNewSection({
        ...newSection,
        tags: newSection.tags.filter(tag => tag !== tagToRemove)
      });
    }
  };

  // Handle create new section
  const handleCreateSection = async () => {
    if (!newSection.title.trim()) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يجب إدخال عنوان القسم',
      });
      return;
    }

    if (!newSection.tags || newSection.tags.length === 0) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يجب إضافة tag واحد على الأقل',
      });
      return;
    }

    try {
      const response = await adminApi.createGiftSection(newSection);
      setSections([...sections, response.data]);
      setNewSection({ title: '', tags: [], display_order: 0, is_active: true });
      setIsAdding(false);
      toast({
        title: 'نجح',
        description: 'تم إضافة القسم بنجاح',
      });
    } catch (error) {
      console.error('Error creating section:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في إضافة القسم',
      });
    }
  };

  // Handle update section
  const handleUpdateSection = async () => {
    if (!editingSection.title.trim()) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يجب إدخال عنوان القسم',
      });
      return;
    }

    if (!editingSection.tags || editingSection.tags.length === 0) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يجب إضافة tag واحد على الأقل',
      });
      return;
    }

    try {
      const response = await adminApi.updateGiftSection(editingSection.id, editingSection);
      setSections(sections.map(s => s.id === editingSection.id ? response.data : s));
      setEditingSection(null);
      toast({
        title: 'نجح',
        description: 'تم تحديث القسم بنجاح',
      });
    } catch (error) {
      console.error('Error updating section:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في تحديث القسم',
      });
    }
  };

  // Handle delete section
  const handleDeleteSection = async (id) => {
    try {
      await adminApi.deleteGiftSection(id);
      setSections(sections.filter(s => s.id !== id));
      toast({
        title: 'نجح',
        description: 'تم حذف القسم بنجاح',
      });
    } catch (error) {
      console.error('Error deleting section:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في حذف القسم',
      });
    }
  };

  // Toggle section active status
  const handleToggleActive = async (section) => {
    try {
      const updatedSection = { ...section, is_active: !section.is_active };
      const response = await adminApi.updateGiftSection(section.id, updatedSection);
      setSections(sections.map(s => s.id === section.id ? response.data : s));
      toast({
        title: 'نجح',
        description: section.is_active ? 'تم إخفاء القسم' : 'تم تفعيل القسم',
      });
    } catch (error) {
      console.error('Error toggling section:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'فشل في تحديث حالة القسم',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Gift className="w-8 h-8 text-purple-500" />
            إدارة أقسام الهدايا
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            قم بإضافة وتنظيم أقسام عرض المنتجات حسب التاجات (Tags)
          </p>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          className="bg-purple-500 hover:bg-purple-600"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          إضافة قسم جديد
        </Button>
      </div>

      {/* New Section Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-500" />
                قسم جديد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">عنوان القسم</label>
                <Input
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  placeholder="مثال: هدايا رمضان"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">التاجات (Tags)</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(false);
                      }
                    }}
                    placeholder="أدخل tag واضغط إضافة"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddTag(false)}
                    variant="outline"
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    إضافة
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newSection.tags?.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag, false)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ترتيب العرض</label>
                <Input
                  type="number"
                  value={newSection.display_order}
                  onChange={(e) => setNewSection({ ...newSection, display_order: parseInt(e.target.value) || 0 })}
                  className="w-32"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={newSection.is_active}
                  onCheckedChange={(checked) => setNewSection({ ...newSection, is_active: checked })}
                />
                <label className="text-sm">تفعيل القسم</label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateSection}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  حفظ القسم
                </Button>
                <Button
                  onClick={() => {
                    setIsAdding(false);
                    setNewSection({ title: '', tags: [], display_order: 0, is_active: true });
                    setCurrentTag('');
                  }}
                  variant="outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Sections List */}
      <div className="grid gap-4">
        {sections.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد أقسام هدايا حتى الآن</p>
            </CardContent>
          </Card>
        ) : (
          sections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {editingSection?.id === section.id ? (
                // Edit Mode
                <Card className="border-2 border-blue-200 dark:border-blue-800">
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">عنوان القسم</label>
                      <Input
                        value={editingSection.title}
                        onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">التاجات (Tags)</label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag(true);
                            }
                          }}
                          placeholder="أدخل tag واضغط إضافة"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={() => handleAddTag(true)}
                          variant="outline"
                        >
                          <Tag className="w-4 h-4 mr-2" />
                          إضافة
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editingSection.tags?.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {tag}
                            <X
                              className="w-3 h-3 cursor-pointer"
                              onClick={() => handleRemoveTag(tag, true)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">ترتيب العرض</label>
                      <Input
                        type="number"
                        value={editingSection.display_order}
                        onChange={(e) => setEditingSection({ ...editingSection, display_order: parseInt(e.target.value) || 0 })}
                        className="w-32"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editingSection.is_active}
                        onCheckedChange={(checked) => setEditingSection({ ...editingSection, is_active: checked })}
                      />
                      <label className="text-sm">تفعيل القسم</label>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleUpdateSection}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        حفظ التعديلات
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingSection(null);
                          setCurrentTag('');
                        }}
                        variant="outline"
                      >
                        <X className="w-4 h-4 mr-2" />
                        إلغاء
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // View Mode
                <Card className={!section.is_active ? 'opacity-60' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <GripVertical className="w-5 h-5 text-gray-400" />
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            {section.title}
                          </h3>
                          {!section.is_active && (
                            <Badge variant="secondary">مخفي</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {section.tags?.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500">
                          ترتيب العرض: {section.display_order}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleToggleActive(section)}
                          variant="outline"
                          size="sm"
                          title={section.is_active ? 'إخفاء القسم' : 'إظهار القسم'}
                        >
                          {section.is_active ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingSection(section);
                            setCurrentTag('');
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                              <AlertDialogDescription>
                                سيتم حذف قسم "{section.title}" نهائياً. لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSection(section.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminGiftSections;
