import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from '../ui/use-toast';
import { adminApi } from '../../lib/api';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle
} from 'lucide-react';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    priority: '',
    status: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    priority: 'medium',
    is_active: true,
    starts_at: '',
    ends_at: '',
    image: null
  });

  const typeOptions = [
    { value: 'info', label: 'معلومات', color: 'bg-success-100 text-neutral-900', icon: Info },
    { value: 'warning', label: 'تحذير', color: 'bg-warning-100 text-warning-700', icon: AlertTriangle },
    { value: 'success', label: 'إنجاز', color: 'bg-success-200 text-roman-500', icon: CheckCircle },
    { value: 'error', label: 'خطأ', color: 'bg-warning-500/20 text-warning-500', icon: AlertCircle }
  ];

  const priorityOptions = [
    { value: 'low', label: 'منخفضة', color: 'bg-neutral-500/20 text-neutral-700' },
    { value: 'medium', label: 'متوسطة', color: 'bg-success-100 text-roman-500' },
    { value: 'high', label: 'عالية', color: 'bg-warning-500/20 text-warning-500' }
  ];

  useEffect(() => {
    fetchAnnouncements();
    fetchStats();
  }, [filters]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAnnouncements(filters);
      if (response.success) {
        setAnnouncements(response.data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الإعلانات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminApi.getAnnouncementStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = new FormData();
      
      // Add required fields
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('type', formData.type);
      submitData.append('priority', formData.priority);
      submitData.append('is_active', formData.is_active ? '1' : '0');
      
      // Add optional date fields only if they have values
      if (formData.starts_at && formData.starts_at.trim() !== '') {
        submitData.append('starts_at', formData.starts_at);
      }
      if (formData.ends_at && formData.ends_at.trim() !== '') {
        submitData.append('ends_at', formData.ends_at);
      }
      
      // Add image only if selected
      if (formData.image && formData.image instanceof File) {
        submitData.append('image', formData.image);
      }

      let response;
      if (editingAnnouncement) {
        submitData.append('_method', 'PUT');
        response = await adminApi.updateAnnouncement(editingAnnouncement.id, submitData);
      } else {
        response = await adminApi.createAnnouncement(submitData);
      }

      if (response.success) {
        toast({
          title: "نجح",
          description: editingAnnouncement ? "تم تحديث الإعلان بنجاح" : "تم إنشاء الإعلان بنجاح"
        });
        setIsDialogOpen(false);
        resetForm();
        fetchAnnouncements();
        fetchStats();
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في حفظ الإعلان",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
    
    try {
      const response = await adminApi.deleteAnnouncement(id);
      if (response.success) {
        toast({
          title: "نجح",
          description: "تم حذف الإعلان بنجاح"
        });
        fetchAnnouncements();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الإعلان",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await adminApi.toggleAnnouncementStatus(id);
      if (response.success) {
        toast({
          title: "نجح",
          description: response.message
        });
        fetchAnnouncements();
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: "خطأ",
        description: "فشل في تغيير حالة الإعلان",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'info',
      priority: 'medium',
      is_active: true,
      starts_at: '',
      ends_at: '',
      image: null
    });
    setEditingAnnouncement(null);
  };

  const openEditDialog = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      is_active: announcement.is_active,
      starts_at: announcement.starts_at ? announcement.starts_at.split('T')[0] : '',
      ends_at: announcement.ends_at ? announcement.ends_at.split('T')[0] : '',
      image: null
    });
    setIsDialogOpen(true);
  };

  const getTypeInfo = (type) => typeOptions.find(t => t.value === type);
  const getPriorityInfo = (priority) => priorityOptions.find(p => p.value === priority);

  const getStatusBadge = (announcement) => {
    if (!announcement.is_active) {
      return <Badge variant="secondary">غير نشط</Badge>;
    }
    
    const now = new Date();
    const startsAt = announcement.starts_at ? new Date(announcement.starts_at) : null;
    const endsAt = announcement.ends_at ? new Date(announcement.ends_at) : null;
    
    if (startsAt && startsAt > now) {
      return <Badge className="bg-orange-100 text-orange-800">مجدول</Badge>;
    }
    
    if (endsAt && endsAt < now) {
      return <Badge variant="secondary">منتهي</Badge>;
    }
    
    return <Badge className="bg-green-100 text-green-800">نشط</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* إحصائيات */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">إجمالي الإعلانات</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">نشط</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.visible}</div>
              <div className="text-sm text-gray-600">مرئي للزوار</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
              <div className="text-sm text-gray-600">غير نشط</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* أدوات التحكم */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>إدارة الإعلانات</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة إعلان جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingAnnouncement ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">عنوان الإعلان</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                        placeholder="أدخل عنوان الإعلان"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">نوع الإعلان</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        {typeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">محتوى الإعلان</label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      required
                      rows={4}
                      placeholder="أدخل محتوى الإعلان"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">الأولوية</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        {priorityOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">الحالة</label>
                      <select
                        value={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="true">نشط</option>
                        <option value="false">غير نشط</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">تاريخ البداية (اختياري)</label>
                      <Input
                        type="date"
                        value={formData.starts_at}
                        onChange={(e) => setFormData({...formData, starts_at: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">تاريخ النهاية (اختياري)</label>
                      <Input
                        type="date"
                        value={formData.ends_at}
                        onChange={(e) => setFormData({...formData, ends_at: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">صورة الإعلان (اختياري)</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 space-x-reverse">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      إلغاء
                    </Button>
                    <Button type="submit">
                      {editingAnnouncement ? 'تحديث' : 'إنشاء'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* فلاتر البحث */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-60">
              <div className="relative">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في الإعلانات..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pr-10"
                />
              </div>
            </div>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">جميع الأنواع</option>
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">جميع الأولويات</option>
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>

          {/* قائمة الإعلانات */}
          {loading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">لا توجد إعلانات</div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => {
                const typeInfo = getTypeInfo(announcement.type);
                const priorityInfo = getPriorityInfo(announcement.priority);
                const TypeIcon = typeInfo?.icon;
                
                return (
                  <Card key={announcement.id} className="border-r-4" style={{borderRightColor: typeInfo?.color.includes('blue') ? '#3b82f6' : typeInfo?.color.includes('green') ? '#10b981' : typeInfo?.color.includes('yellow') ? '#f59e0b' : '#ef4444'}}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {TypeIcon && <TypeIcon className="h-4 w-4" />}
                            <h3 className="text-lg font-semibold">{announcement.title}</h3>
                            <Badge className={typeInfo?.color}>{typeInfo?.label}</Badge>
                            <Badge className={priorityInfo?.color}>{priorityInfo?.label}</Badge>
                            {getStatusBadge(announcement)}
                          </div>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">{announcement.content}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>بواسطة: {announcement.creator?.name}</span>
                            <span>
                              <Calendar className="h-4 w-4 inline ml-1" />
                              {format(new Date(announcement.created_at), 'dd/MM/yyyy', { locale: ar })}
                            </span>
                            {announcement.starts_at && (
                              <span>
                                يبدأ: {format(new Date(announcement.starts_at), 'dd/MM/yyyy', { locale: ar })}
                              </span>
                            )}
                            {announcement.ends_at && (
                              <span>
                                ينتهي: {format(new Date(announcement.ends_at), 'dd/MM/yyyy', { locale: ar })}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(announcement.id)}
                            className="p-2"
                          >
                            {announcement.is_active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(announcement)}
                            className="p-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(announcement.id)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnnouncements; 