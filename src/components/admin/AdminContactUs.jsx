import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Search, 
  Mail,
  Phone,
  User,
  Calendar,
  Eye,
  Check,
  CheckCircle,
  X,
  Trash2,
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
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

const AdminContactUs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [contactMessages, setContactMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({});
  const [adminNotes, setAdminNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast({
        variant: "destructive",
        title: "غير مصرح به",
        description: "هذه الصفحة مخصصة للمشرفين فقط."
      });
      return;
    }
    
    fetchContactMessages();
    fetchStats();
  }, [user, currentPage]);

  useEffect(() => {
    filterMessages();
  }, [searchTerm, activeTab, contactMessages]);

  const fetchContactMessages = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 10
      };

      if (activeTab !== 'all') {
        params.status = activeTab;
      }

      const response = await adminApi.getContactMessages(params);
      if (response?.data) {
        setContactMessages(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
      }
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في تحميل الرسائل',
        description: 'تعذر تحميل رسائل التواصل من الخادم'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminApi.getContactStats();
      if (response?.data) {
        setStats(response.data || {});
      }
    } catch (error) {
      console.error('Error fetching contact stats:', error);
    }
  };

  const filterMessages = () => {
    let filtered = [...contactMessages];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(msg => {
        const searchString = searchTerm.toLowerCase();
        return (
          msg.name?.toLowerCase().includes(searchString) ||
          msg.email?.toLowerCase().includes(searchString) ||
          msg.subject?.toLowerCase().includes(searchString) ||
          msg.message?.toLowerCase().includes(searchString)
        );
      });
    }
    
    setFilteredMessages(filtered);
  };

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    
    // Mark as read if not already read
    if (!message.is_read) {
      try {
        await adminApi.markContactMessageAsRead(message.id);
        // Update local state
        setContactMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, is_read: true } : msg
        ));
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const handleMarkAsResolved = async (messageId, notes) => {
    try {
      setUpdating(true);
      await adminApi.markContactMessageAsResolved(messageId, { admin_notes: notes });
      
      // Update local state
      setContactMessages(prev => prev.map(msg => 
        msg.id === messageId ? { 
          ...msg, 
          is_resolved: true, 
          is_read: true, 
          admin_notes: notes,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id
        } : msg
      ));
      
      setSelectedMessage(null);
      setAdminNotes('');
      await fetchStats(); // Refresh stats
      
      toast({
        title: "تم حل الرسالة",
        description: "تم تعليم الرسالة كمحلولة بنجاح"
      });
    } catch (error) {
      console.error('Error resolving message:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في تحديث الرسالة',
        description: 'تعذر تعليم الرسالة كمحلولة'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      setUpdating(true);
      await adminApi.deleteContactMessage(messageId);
      
      // Update local state
      setContactMessages(prev => prev.filter(msg => msg.id !== messageId));
      setSelectedMessage(null);
      await fetchStats(); // Refresh stats
      
      toast({
        title: "تم حذف الرسالة",
        description: "تم حذف الرسالة بنجاح"
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في حذف الرسالة',
        description: 'تعذر حذف الرسالة'
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (message) => {
    if (message.is_resolved) {
      return <Badge className="bg-green-100 text-green-700">محلولة</Badge>;
    }
    if (message.is_read) {
      return <Badge className="bg-blue-100 text-blue-700">مقروءة</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-700">جديدة</Badge>;
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 md:p-8 text-center" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-700">غير مصرح لك بالدخول</h1>
        <p className="text-gray-500">هذه الصفحة مخصصة للمشرفين فقط.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8" dir="rtl">
      <motion.div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-800">رسائل التواصل</h1>
          <p className="text-gray-500 mt-1">إدارة رسائل العملاء والزوار</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-blue-100 text-blue-700 py-2 px-3">
            <MessageSquare className="h-4 w-4 mr-1" />
            إجمالي الرسائل: {stats.total || 0}
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-700 py-2 px-3">
            <AlertCircle className="h-4 w-4 mr-1" />
            غير مقروءة: {stats.unread || 0}
          </Badge>
          <Badge className="bg-red-100 text-red-700 py-2 px-3">
            <X className="h-4 w-4 mr-1" />
            غير محلولة: {stats.unresolved || 0}
          </Badge>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Messages List */}
        <div className={`w-full ${selectedMessage ? 'lg:w-1/2' : 'lg:w-full'}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في الرسائل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 text-right"
                  dir="rtl"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={fetchContactMessages}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </motion.div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="unread">غير مقروءة <Badge className="ml-1 bg-yellow-500 text-white">{stats.unread || 0}</Badge></TabsTrigger>
              <TabsTrigger value="unresolved">غير محلولة <Badge className="ml-1 bg-red-500 text-white">{stats.unresolved || 0}</Badge></TabsTrigger>
              <TabsTrigger value="resolved">محلولة <Badge className="ml-1 bg-green-500 text-white">{stats.resolved || 0}</Badge></TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between text-right">
                    <span>رسائل التواصل</span>
                    <span className="text-sm font-normal text-gray-500">
                      صفحة {currentPage} من {totalPages}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p className="text-gray-500">جاري تحميل الرسائل...</p>
                    </div>
                  ) : filteredMessages.length > 0 ? (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pl-2">
                      {filteredMessages.map(message => (
                        <div 
                          key={message.id}
                          className={`p-4 rounded-lg cursor-pointer transition-colors ${
                            selectedMessage?.id === message.id 
                              ? 'bg-blue-100 border border-blue-200' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          } ${!message.is_read ? 'ring-2 ring-yellow-200' : ''}`}
                          onClick={() => handleViewMessage(message)}
                        >
                          <div className="flex justify-between items-start mb-2 text-right">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-semibold text-gray-800">{message.name}</span>
                              {getStatusBadge(message)}
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(message.created_at).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2 text-right">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-600" dir="ltr">{message.email}</span>
                            {message.phone && (
                              <>
                                <Phone className="h-3 w-3 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600" dir="ltr">{message.phone}</span>
                              </>
                            )}
                          </div>
                          
                          {message.subject && (
                            <p className="text-sm font-medium text-gray-700 mb-1 text-right">
                              الموضوع: {message.subject}
                            </p>
                          )}
                          
                          <p className="text-sm text-gray-600 truncate text-right">
                            {message.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">لم يتم العثور على رسائل تطابق البحث</p>
                    </div>
                  )}
                </CardContent>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                      التالي
                    </Button>
                    <span className="text-sm text-gray-500">
                      صفحة {currentPage} من {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      السابق
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Message Details */}
        {selectedMessage && (
          <motion.div 
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-blue-200 shadow-lg h-full">
              <CardHeader className="text-right">
                <div className="flex flex-row-reverse items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-right">تفاصيل الرسالة</CardTitle>
                    <CardDescription className="text-right">
                      من {selectedMessage.name} - {new Date(selectedMessage.created_at).toLocaleDateString('ar-EG')}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    {!selectedMessage.is_resolved && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="border-green-200 text-green-600">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            حل الرسالة
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader className="text-right">
                            <AlertDialogTitle>حل رسالة التواصل</AlertDialogTitle>
                            <AlertDialogDescription className="text-right">
                              هل تريد تعليم هذه الرسالة كمحلولة؟ يمكنك إضافة ملاحظات للمراجعة المستقبلية.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="py-4">
                            <Textarea
                              placeholder="ملاحظات إدارية (اختيارية)"
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              rows={3}
                              className="text-right"
                              dir="rtl"
                            />
                          </div>
                          <AlertDialogFooter className="flex-row-reverse">
                            <AlertDialogAction 
                              onClick={() => handleMarkAsResolved(selectedMessage.id, adminNotes)}
                              disabled={updating}
                            >
                              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حل الرسالة'}
                            </AlertDialogAction>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="border-red-200 text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          حذف
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader className="text-right">
                          <AlertDialogTitle>حذف رسالة التواصل</AlertDialogTitle>
                          <AlertDialogDescription className="text-right">
                            هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-row-reverse">
                          <AlertDialogAction 
                            onClick={() => handleDeleteMessage(selectedMessage.id)}
                            disabled={updating}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حذف'}
                          </AlertDialogAction>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedMessage(null)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      إغلاق
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="text-right">
                <div className="space-y-4">
                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 text-right">معلومات المرسل</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm text-gray-700">{selectedMessage.name}</span>
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm text-gray-700" dir="ltr">{selectedMessage.email}</span>
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      {selectedMessage.phone && (
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-sm text-gray-700" dir="ltr">{selectedMessage.phone}</span>
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm text-gray-700">
                          {new Date(selectedMessage.created_at).toLocaleString('ar-EG')}
                        </span>
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  {selectedMessage.subject && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2 text-right">الموضوع</h3>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded-lg text-right">
                        {selectedMessage.subject}
                      </p>
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 text-right">الرسالة</h3>
                    <div className="bg-white border rounded-lg p-4 min-h-[150px]">
                      <p className="text-gray-700 whitespace-pre-wrap text-right">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  {selectedMessage.admin_notes && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2 text-right">ملاحظات إدارية</h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-800 text-right">{selectedMessage.admin_notes}</p>
                        {selectedMessage.resolved_at && (
                          <p className="text-xs text-green-600 mt-2 text-right">
                            تم الحل في: {new Date(selectedMessage.resolved_at).toLocaleString('ar-EG')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminContactUs; 