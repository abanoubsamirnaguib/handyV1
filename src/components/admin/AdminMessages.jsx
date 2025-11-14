import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Search, 
  UserCheck, 
  X, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Eye,
  Loader2
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';

const AdminMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [allConversations, setAllConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [reports, setReports] = useState([]);

  // Load conversations and stats on component mount
  useEffect(() => {
    const loadData = async () => {
      await loadReports(); // Load reports first
      await loadConversations(); // Then load conversations
      await loadStats();
    };
    loadData();
  }, []);

  const loadConversations = async (reportsData = null) => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await adminApi.getAllConversations(params);
      if (response.success) {
        // Use provided reports or state reports
        const reportsToUse = reportsData || reports;
        // Get reported conversation IDs
        const reportedIds = new Set(reportsToUse.map(r => r.conversation_id));
        
        const mappedConversations = response.data.map(conv => ({
          id: conv.id,
          buyer: conv.buyer,
          seller: conv.seller,
          lastMessage: conv.lastMessage,
          messageCount: conv.messageCount,
          lastActivity: conv.lastMessageTime || conv.createdAt,
          isReported: reportedIds.has(conv.id)
        }));
        
        setAllConversations(mappedConversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل المحادثات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const response = await adminApi.getChatReports({ status: 'pending' });
      if (response.success) {
        setReports(response.data);
        // Reload conversations to update isReported status
        if (allConversations.length > 0) {
          loadConversations(response.data);
        }
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminApi.getChatStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error loading chat stats:', error);
    }
  };

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        loadConversations();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // تطبيق الفلاتر عند تغيير علامة التبويب النشطة
  useEffect(() => {
    let filtered = [...allConversations];
    
    // تطبيق فلتر علامة التبويب
    if (activeTab === 'reported') {
      const reportedIds = new Set(reports.map(r => r.conversation_id));
      filtered = filtered.filter(conv => reportedIds.has(conv.id));
    }
    
    setFilteredConversations(filtered);
  }, [activeTab, allConversations, reports]);

  const handleViewConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setMessagesLoading(true);
    
    try {
      const response = await adminApi.getConversationMessages(conversation.id);
      if (response.success) {
        setSelectedMessages(response.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل الرسائل",
        variant: "destructive"
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleCloseConversation = () => {
    setSelectedConversation(null);
  };

  const handleResolveReport = async (conversationId) => {
    // Find the report for this conversation
    const report = reports.find(r => r.conversation_id === conversationId && r.status === 'pending');
    
    if (!report) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "لم يتم العثور على البلاغ"
      });
      return;
    }

    try {
      await adminApi.resolveChatReport(report.id, {
        status: 'resolved',
        admin_notes: 'تم حل البلاغ من لوحة التحكم'
      });
      
      // Update local state
      setReports(prev => prev.filter(r => r.id !== report.id));
      setAllConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return { ...conv, isReported: false };
        }
        return conv;
      }));
      
      toast({
        title: "تم حل البلاغ",
        description: "تم حل البلاغ المتعلق بهذه المحادثة."
      });
      
      // إغلاق المحادثة المحددة إذا كانت هي نفسها
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error('Error resolving report:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء حل البلاغ"
      });
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

  return (
    <div className="p-6 md:p-8 space-y-8" dir="rtl">
      <motion.div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-row-reverse"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-800">جميع المحادثات</h1>
          <p className="text-gray-500 mt-1">مراقبة جميع المحادثات بين المستخدمين</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <Badge className="bg-blue-100 text-blue-700 py-2 px-3">
            <MessageSquare className="h-4 w-4 ml-1" />
            إجمالي المحادثات: {stats.total_conversations || allConversations.length}
          </Badge>
          <Badge className="bg-green-100 text-green-700 py-2 px-3">
            <RefreshCw className="h-4 w-4 ml-1" />
            نشطة: {stats.active_conversations || 0}
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-700 py-2 px-3">
            <AlertCircle className="h-4 w-4 ml-1" />
            بلاغات: {reports.length}
          </Badge>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* قائمة المحادثات */}
        <div className={`w-full ${selectedConversation ? 'lg:w-1/3' : 'lg:w-full'}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في المحادثات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right"
                dir="rtl"
              />
            </div>
          </motion.div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="all">جميع المحادثات</TabsTrigger>
              <TabsTrigger value="reported">البلاغات <Badge className="ml-1 bg-red-500">{reports.length}</Badge></TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-right">جميع المحادثات</CardTitle>
                  <CardDescription className="text-right">مراقبة جميع المحادثات بين المستخدمين</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
                      <p className="text-gray-500">جاري تحميل المحادثات...</p>
                    </div>
                  ) : filteredConversations.length > 0 ? (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {filteredConversations.map(conv => (
                        <div 
                          key={conv.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedConversation?.id === conv.id ? 'bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'}`}
                          onClick={() => handleViewConversation(conv)}
                        >
                          <div className="flex justify-between items-start flex-row-reverse text-right">
                            <div className="flex items-center flex-row-reverse">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={conv.buyer.avatar} />
                                <AvatarFallback>{conv.buyer.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="text-right">
                                <p className="font-semibold text-gray-800">
                                  {conv.buyer.name} 
                                  <span className="text-gray-500"> ↔ {conv.seller.name}</span>
                                </p>
                                {conv.lastMessage && (
                                  <p className="text-xs text-gray-500 truncate max-w-[200px] text-right">
                                    {conv.lastMessage.text}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400">
                                  {conv.messageCount} رسالة
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-start">
                              {conv.isReported && (
                                <Badge className="bg-red-500 mb-1" size="sm">
                                  <AlertCircle className="h-3 w-3 ml-1" />مُبلغ عنها
                                </Badge>
                              )}
                              <span className="text-xs text-gray-400">
                                {new Date(conv.lastActivity).toLocaleDateString('ar-EG')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">لم يتم العثور على محادثات تطابق البحث</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reported" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-right">البلاغات</CardTitle>
                  <CardDescription className="text-right">المحادثات التي تم الإبلاغ عنها من المستخدمين</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
                      <p className="text-gray-500">جاري تحميل البلاغات...</p>
                    </div>
                  ) : filteredConversations.length > 0 ? (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {filteredConversations.map(conv => (
                        <div 
                          key={conv.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedConversation?.id === conv.id ? 'bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'}`}
                          onClick={() => handleViewConversation(conv)}
                        >
                          <div className="flex justify-between items-start flex-row-reverse text-right">
                            <div className="flex items-center flex-row-reverse">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={conv.buyer.avatar} />
                                <AvatarFallback>{conv.buyer.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="text-right">
                                <p className="font-semibold text-gray-800">
                                  {conv.buyer.name} 
                                  <span className="text-gray-500"> ↔ {conv.seller.name}</span>
                                </p>
                                {conv.lastMessage && (
                                  <p className="text-xs text-gray-500 truncate max-w-[200px] text-right">
                                    {conv.lastMessage.text}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400">
                                  {conv.messageCount} رسالة
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-start">
                              <Badge className="bg-red-500 mb-1" size="sm">
                                <AlertCircle className="h-3 w-3 ml-1" />مُبلغ عنها
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {new Date(conv.lastActivity).toLocaleDateString('ar-EG')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-3" />
                      <p className="text-gray-500">لا توجد بلاغات حاليًا</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* عرض المحادثة المحددة */}
        {selectedConversation && (
          <motion.div 
            className="w-full lg:w-2/3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-blue-200 shadow-lg h-full">
              <CardHeader className="flex flex-row items-center justify-between flex-row-reverse text-right">
                <div className="flex items-center flex-row-reverse">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={selectedConversation.buyer.avatar} />
                    <AvatarFallback>{selectedConversation.buyer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-right">
                    <CardTitle className="text-lg">
                      محادثة بين {selectedConversation.buyer.name} و {selectedConversation.seller.name}
                    </CardTitle>
                    <CardDescription>
                      {selectedConversation.messageCount} رسالة - آخر نشاط: {new Date(selectedConversation.lastActivity).toLocaleDateString('ar-EG')}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2 flex-row-reverse">
                  {(() => {
                    const hasPendingReport = reports.some(r => 
                      r.conversation_id === selectedConversation.id && r.status === 'pending'
                    );
                    return hasPendingReport ? (
                      <Button 
                        variant="outline" 
                        className="border-green-200 text-green-600"
                        onClick={() => handleResolveReport(selectedConversation.id)}
                      >
                        <CheckCircle className="ml-2 h-4 w-4" />
                        حل البلاغ
                      </Button>
                    ) : null;
                  })()}
                  <Button 
                    variant="outline" 
                    className="border-gray-200"
                    onClick={handleCloseConversation}
                  >
                    <X className="ml-2 h-4 w-4" />
                    إغلاق
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* عرض معلومات البلاغ إذا كانت المحادثة مبلغ عنها */}
                {(() => {
                  const report = reports.find(r => 
                    r.conversation_id === selectedConversation.id && r.status === 'pending'
                  );
                  return report ? (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg" dir="rtl">
                      <div className="flex items-start justify-between mb-3 flex-row-reverse">
                        <div className="flex items-center flex-row-reverse">
                          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                          <h3 className="text-lg font-semibold text-red-800">معلومات البلاغ</h3>
                        </div>
                        <Badge className="bg-red-500 text-white">مُبلغ عنها</Badge>
                      </div>
                      <div className="space-y-3 text-right">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">المبلغ:</p>
                          <p className="text-sm text-gray-900">{report.reporter?.name || 'غير معروف'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">سبب الإبلاغ:</p>
                          <p className="text-sm text-gray-900 bg-white p-2 rounded border">{report.reason}</p>
                        </div>
                        {report.description && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">تفاصيل إضافية:</p>
                            <p className="text-sm text-gray-900 bg-white p-2 rounded border whitespace-pre-wrap">{report.description}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500">
                            تاريخ الإبلاغ: {new Date(report.created_at).toLocaleString('ar-EG')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
                
                <div className="bg-gray-50 rounded-lg p-4 h-[400px] overflow-y-auto">
                  {messagesLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin mb-3" />
                      <p className="text-gray-500">جاري تحميل الرسائل...</p>
                    </div>
                  ) : selectedMessages.length > 0 ? (
                    <div className="space-y-4">
                      {selectedMessages.map((msg, index) => {
                        const isSentByBuyer = msg.senderId === selectedConversation.buyer.id;
                        const sender = isSentByBuyer ? selectedConversation.buyer : selectedConversation.seller;
                        
                        return (
                          <div key={msg.id || index} className={`flex ${isSentByBuyer ? 'justify-start' : 'justify-end'} flex-row-reverse`}>
                            <div className={`flex items-start max-w-[70%] ${isSentByBuyer ? 'flex-row-reverse' : 'flex-row'}`}>
                              <Avatar className={`h-8 w-8 ${isSentByBuyer ? 'mr-2' : 'ml-2'}`}>
                                <AvatarImage src={sender?.avatar} />
                                <AvatarFallback>{sender?.name?.charAt(0) || 'U'}</AvatarFallback>
                              </Avatar>
                              <div className="text-right">
                                <div className={`px-3 py-2 rounded-lg ${isSentByBuyer ? 'bg-gray-200 text-gray-900' : 'bg-blue-100 text-blue-900'}`}>
                                  <p className="text-sm" dir="rtl">{msg.text}</p>
                                </div>
                                <p className={`text-xs text-gray-500 mt-1 text-right`}>
                                  {new Date(msg.timestamp).toLocaleTimeString('ar-EG', {hour: '2-digit', minute: '2-digit'})}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">لا توجد رسائل في هذه المحادثة</p>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t pt-4 flex-row-reverse">
                <div className="flex items-center text-sm text-gray-500 flex-row-reverse">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  يتم تحديث المحادثة تلقائيًا
                </div>
                <div>
                  {(() => {
                    const hasPendingReport = reports.some(r => 
                      r.conversation_id === selectedConversation.id && r.status === 'pending'
                    );
                    return hasPendingReport ? (
                      <Button 
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleResolveReport(selectedConversation.id)}
                      >
                        <CheckCircle className="ml-2 h-4 w-4" />
                        حل البلاغ
                      </Button>
                    ) : (
                      <Button variant="outline" className="border-blue-200 text-blue-600">
                        <Eye className="ml-2 h-4 w-4" />
                        مراقبة المحادثة
                      </Button>
                    );
                  })()}
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
