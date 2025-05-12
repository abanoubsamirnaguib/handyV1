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
  Eye
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
import { useChat } from '@/contexts/ChatContext';
import { sellers, users } from '@/lib/data';

const AdminMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { conversations, messages } = useChat();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [allConversations, setAllConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);

  // إنشاء قائمة بجميع المحادثات مع بيانات المشاركين
  useEffect(() => {
    if (conversations.length) {
      const mappedConversations = conversations.map(conv => {
        // العثور على بيانات المشاركين
        const participant = conv.participant;
        const lastMsg = messages[conv.id]?.[messages[conv.id]?.length - 1] || {};
        
        // محاولة العثور على المستخدم الآخر المشترك في المحادثة
        const otherParticipantId = lastMsg.senderId !== participant.id ? lastMsg.senderId : null;
        
        // لأغراض العرض فقط نفترض أن المستخدم الآخر هو أحد الحسابات من البيانات
        let otherParticipant = null;
        if (otherParticipantId) {
          otherParticipant = sellers.find(s => s.id === otherParticipantId) || users?.[0] || {
            id: otherParticipantId,
            name: `User ${otherParticipantId.substring(0, 4)}`,
            avatar: ''
          };
        }
        
        return {
          ...conv,
          participant,
          otherParticipant,
          lastMessage: lastMsg,
          messageCount: messages[conv.id]?.length || 0,
          lastActivity: lastMsg.timestamp || new Date().toISOString(),
          isReported: Math.random() > 0.8 // افتراضيًا بعض المحادثات مبلغ عنها للعرض
        };
      });
      
      setAllConversations(mappedConversations);
      setFilteredConversations(mappedConversations);
    }
  }, [conversations, messages]);

  // تطبيق الفلاتر عند تغيير مصطلح البحث أو علامة التبويب النشطة
  useEffect(() => {
    let filtered = [...allConversations];
    
    // تطبيق فلتر البحث
    if (searchTerm) {
      filtered = filtered.filter(conv => {
        const participantName = conv.participant?.name || '';
        const otherParticipantName = conv.otherParticipant?.name || '';
        const lastMessageText = conv.lastMessage?.text || '';
        
        return participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               otherParticipantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               lastMessageText.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    
    // تطبيق فلتر علامة التبويب
    if (activeTab === 'reported') {
      filtered = filtered.filter(conv => conv.isReported);
    }
    
    setFilteredConversations(filtered);
  }, [searchTerm, activeTab, allConversations]);

  const handleViewConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleCloseConversation = () => {
    setSelectedConversation(null);
  };

  const handleResolveReport = (conversationId) => {
    // تحديث حالة المحادثة بإزالة علامة البلاغ
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
          <h1 className="text-3xl font-bold text-gray-800">إدارة المحادثات</h1>
          <p className="text-gray-500 mt-1">مراقبة وإدارة جميع المحادثات بين المستخدمين</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-blue-100 text-blue-700 py-2 px-3">
            <MessageSquare className="h-4 w-4 ml-1" />
            إجمالي المحادثات: {allConversations.length}
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-700 py-2 px-3">
            <AlertCircle className="h-4 w-4 ml-1" />
            بلاغات: {allConversations.filter(c => c.isReported).length}
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
                className="pr-10"
              />
            </div>
          </motion.div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="all">جميع المحادثات</TabsTrigger>
              <TabsTrigger value="reported">البلاغات <Badge className="mr-1 bg-red-500">{allConversations.filter(c => c.isReported).length}</Badge></TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">جميع المحادثات</CardTitle>
                  <CardDescription>مراقبة جميع المحادثات بين المستخدمين</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredConversations.length > 0 ? (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {filteredConversations.map(conv => (
                        <div 
                          key={conv.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedConversation?.id === conv.id ? 'bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'}`}
                          onClick={() => handleViewConversation(conv)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 ml-3">
                                <AvatarImage src={conv.participant.avatar} />
                                <AvatarFallback>{conv.participant.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {conv.participant.name} 
                                  {conv.otherParticipant && <span className="text-gray-500"> ↔ {conv.otherParticipant.name}</span>}
                                </p>
                                {conv.lastMessage && (
                                  <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                    {conv.lastMessage.text}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
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
                  <CardTitle className="text-lg">البلاغات</CardTitle>
                  <CardDescription>المحادثات التي تم الإبلاغ عنها من المستخدمين</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredConversations.length > 0 ? (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {filteredConversations.map(conv => (
                        <div 
                          key={conv.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedConversation?.id === conv.id ? 'bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'}`}
                          onClick={() => handleViewConversation(conv)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 ml-3">
                                <AvatarImage src={conv.participant.avatar} />
                                <AvatarFallback>{conv.participant.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {conv.participant.name} 
                                  {conv.otherParticipant && <span className="text-gray-500"> ↔ {conv.otherParticipant.name}</span>}
                                </p>
                                {conv.lastMessage && (
                                  <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                    {conv.lastMessage.text}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
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
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 ml-3">
                    <AvatarImage src={selectedConversation.participant.avatar} />
                    <AvatarFallback>{selectedConversation.participant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      محادثة بين {selectedConversation.participant.name} 
                      {selectedConversation.otherParticipant && ` و ${selectedConversation.otherParticipant.name}`}
                    </CardTitle>
                    <CardDescription>
                      {selectedConversation.messageCount} رسالة - آخر نشاط: {new Date(selectedConversation.lastActivity).toLocaleDateString('ar-EG')}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex space-x-2 space-x-reverse">
                  {selectedConversation.isReported && (
                    <Button 
                      variant="outline" 
                      className="border-green-200 text-green-600"
                      onClick={() => handleResolveReport(selectedConversation.id)}
                    >
                      <CheckCircle className="ml-2 h-4 w-4" />
                      حل البلاغ
                    </Button>
                  )}
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
                <div className="bg-gray-50 rounded-lg p-4 h-[400px] overflow-y-auto">
                  {messages[selectedConversation.id]?.length > 0 ? (
                    <div className="space-y-4">
                      {messages[selectedConversation.id].map((msg, index) => {
                        const isSentByParticipant = msg.senderId === selectedConversation.participant.id;
                        const sender = isSentByParticipant ? selectedConversation.participant : selectedConversation.otherParticipant;
                        
                        return (
                          <div key={index} className={`flex ${isSentByParticipant ? 'justify-start' : 'justify-end'}`}>
                            <div className={`flex items-start max-w-[70%] ${isSentByParticipant ? 'flex-row' : 'flex-row-reverse'}`}>
                              <Avatar className={`h-8 w-8 ${isSentByParticipant ? 'ml-2' : 'mr-2'}`}>
                                <AvatarImage src={sender?.avatar} />
                                <AvatarFallback>{sender?.name?.charAt(0) || 'U'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className={`px-3 py-2 rounded-lg ${isSentByParticipant ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-900'}`}>
                                  <p className="text-sm">{msg.text}</p>
                                </div>
                                <p className={`text-xs text-gray-500 mt-1 ${isSentByParticipant ? 'text-right' : 'text-left'}`}>
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
              
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <RefreshCw className="h-4 w-4 ml-1" />
                  يتم تحديث المحادثة تلقائيًا
                </div>
                <div>
                  {selectedConversation.isReported ? (
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
                  )}
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
