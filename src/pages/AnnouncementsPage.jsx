import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { api } from '../lib/api';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  Search, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Filter,
  ArrowRight,
  X
} from 'lucide-react';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    priority: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  const typeOptions = [
    { value: 'info', label: 'معلومات', color: 'bg-success-100 text-neutral-900', icon: Info },
    { value: 'warning', label: 'تحذير', color: 'bg-warning-100 text-warning-800', icon: AlertTriangle },
    { value: 'success', label: 'إنجاز', color: 'bg-success-200 text-success-800', icon: CheckCircle },
    { value: 'error', label: 'خطأ', color: 'bg-roman-100 text-roman-700', icon: AlertCircle }
  ];

  const priorityOptions = [
    { value: 'low', label: 'منخفضة', color: 'bg-neutral-200 text-neutral-900' },
    { value: 'medium', label: 'متوسطة', color: 'bg-success-100 text-success-700' },
    { value: 'high', label: 'عالية', color: 'bg-roman-100 text-roman-700' }
  ];

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAnnouncements(1);
    }, 500); // 500ms delay for search debouncing

    return () => clearTimeout(timeoutId);
  }, [filters.search]);

  // Immediate effect for type and priority filters
  useEffect(() => {
    fetchAnnouncements(1);
  }, [filters.type, filters.priority]);

  // Effect for pagination
  useEffect(() => {
    if (pagination.current_page > 1) {
      fetchAnnouncements(pagination.current_page);
    }
  }, [pagination.current_page]);

  const fetchAnnouncements = async (page = 1) => {
    try {
      setLoading(true);
      
      // تحضير المعاملات
      const params = {
        ...filters,
        page
      };
      
      // إزالة القيم الفارغة
      Object.keys(params).forEach(key => {
        if (!params[key]) {
          delete params[key];
        }
      });
      
      const response = await api.getPublicAnnouncements(params);
      if (response.success) {
        setAnnouncements(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    // Reset pagination to first page when filters change
    if (pagination.current_page !== 1) {
      setPagination(prev => ({
        ...prev,
        current_page: 1
      }));
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      current_page: page
    }));
    fetchAnnouncements(page);
  };

  const getTypeInfo = (type) => typeOptions.find(t => t.value === type);
  const getPriorityInfo = (priority) => priorityOptions.find(p => p.value === priority);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e85856'; // roman-500
      case 'medium': return '#75875b'; // success-500
      case 'low': return '#ced6bf'; // neutral-300
      default: return '#e85856'; // roman-500
    }
  };

  const getPriorityBorderColor = (priority) => {
    switch (priority) {
      case 'high': return '#e85856'; // roman-500
      case 'medium': return '#75875b'; // success-500
      case 'low': return '#a3a3a3'; // neutral-400
      default: return '#e85856'; // roman-500
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-roman-500 to-roman-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">الإعلانات والأخبار</h1>
          <p className="text-xl opacity-90 text-neutral-100">ابق على اطلاع بآخر الأخبار والإعلانات المهمة</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* أدوات البحث والتصفية */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-80">
                <div className="relative">
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-neutral-400" />
                  <Input
                    placeholder="البحث في الإعلانات... (العنوان والمحتوى)"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pr-12 pl-10"
                  />
                  {filters.search && (
                    <button
                      onClick={() => handleFilterChange('search', '')}
                      className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400 hover:text-neutral-900 transition-colors"
                      title="مسح البحث"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="px-4 py-2 border border-neutral-300/30 rounded-md focus:ring-2 focus:ring-roman-500 focus:border-roman-500 bg-white text-neutral-900"
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
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="px-4 py-2 border border-neutral-300/30 rounded-md focus:ring-2 focus:ring-roman-500 focus:border-roman-500 bg-white text-neutral-900"
                >
                  <option value="">جميع الأولويات</option>
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* قائمة الإعلانات */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-roman-500"></div>
            <p className="mt-4 text-neutral-900">جاري تحميل الإعلانات...</p>
          </div>
        ) : announcements.length === 0 ? (
          <Card className="border-neutral-300/20">
            <CardContent className="text-center py-12">
              <Info className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">لا توجد إعلانات</h3>
              <p className="text-neutral-400">لم يتم العثور على إعلانات تطابق معايير البحث</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {announcements.map((announcement) => {
              const typeInfo = getTypeInfo(announcement.type);
              const priorityInfo = getPriorityInfo(announcement.priority);
              const TypeIcon = typeInfo?.icon;
              
              return (
                <Card 
                  key={announcement.id} 
                  className="hover:shadow-lg transition-shadow duration-200 border-r-4 border-neutral-300/20 bg-white/80 backdrop-blur-sm" 
                  style={{borderRightColor: getPriorityBorderColor(announcement.priority)}}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {TypeIcon && (
                          <div className={`p-2 rounded-full ${typeInfo.color}`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <h2 className="text-xl font-bold text-neutral-900 mb-1">
                            {announcement.title}
                          </h2>
                          <div className="flex items-center gap-2">
                            <Badge className={typeInfo?.color}>{typeInfo?.label}</Badge>
                            <Badge className={priorityInfo?.color}>{priorityInfo?.label}</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-neutral-400 flex items-center">
                        <Calendar className="h-4 w-4 ml-1 text-roman-500" />
                        {format(new Date(announcement.created_at), 'dd MMMM yyyy', { locale: ar })}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-neutral-900/80 leading-relaxed whitespace-pre-wrap">
                        {announcement.content}
                      </p>
                    </div>

                    {announcement.image && (
                      <div className="mb-4">
                        <img 
                          src={`${announcement.image}`} 
                          alt={announcement.title}
                          className="max-w-full h-auto rounded-lg shadow-sm"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-success-200">
                      <div className="flex items-center gap-4 text-sm text-neutral-400">
                        {announcement.creator && (
                          <span>بواسطة: <span className="text-roman-500 font-medium">{announcement.creator.name}</span></span>
                        )}
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
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* أزرار التصفح */}
        {pagination.last_page > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="border-roman-500 text-roman-500 hover:bg-roman-500 hover:text-white"
              >
                السابق
              </Button>
              
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={page === pagination.current_page ? "default" : "outline"}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 ${page === pagination.current_page ? 
                    'bg-roman-500 hover:bg-roman-600 text-white' : 
                    'border-roman-500 text-roman-500 hover:bg-roman-500 hover:text-white'}`}
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="border-roman-500 text-roman-500 hover:bg-roman-500 hover:text-white"
              >
                التالي
              </Button>
            </div>
          </div>
        )}

        {/* معلومات إضافية */}
        {announcements.length > 0 && (
          <div className="text-center mt-6 text-sm text-neutral-400">
            عرض {announcements.length} من أصل {pagination.total} إعلان
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage; 