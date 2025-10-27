import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, UserCircle, ArrowLeft, Trash2, Search, MessageCircle, Image, File, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import ServiceOrderModal from '@/components/chat/ServiceOrderModal';
import MessageAttachment from '@/components/chat/MessageAttachment';
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

const ChatPage = () => {
  const { user } = useAuth();
  const { 
    conversations, 
    messages, 
    activeConversation, 
    loading,
    connected,
    setActiveConversation, 
    sendMessage, 
    markConversationAsRead,
    deleteConversation,
  } = useChat();
  
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [sellerServices, setSellerServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (activeConversation) {
      markConversationAsRead(activeConversation);
      scrollToBottom();
      loadSellerServices();
    }
  }, [activeConversation, markConversationAsRead]);

  const loadSellerServices = async () => {
    const currentConv = conversations.find(conv => conv.id === activeConversation);
    if (!currentConv?.participant?.id) {
      setSellerServices([]);
      return;
    }

    try {
      setLoadingServices(true);
      setSellerServices([]); // Reset services first
      const response = await api.getSellerServices(currentConv.participant.id);
      
      console.log('Raw API response:', response);
      console.log('Response type:', typeof response);
      console.log('Is array:', Array.isArray(response));
      
      // Check if it's a Laravel Resource response with 'data' property
      const services = response?.data || response || [];
      console.log('Processed services:', services);
      console.log('Services length:', services.length);
      
      setSellerServices(services);
    } catch (error) {
      console.error('Error loading seller services:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    if (activeConversation && messages[activeConversation]) {
      scrollToBottom();
    }
  }, [messages, activeConversation]);

  // Debug: Monitor sellerServices changes
  useEffect(() => {
    console.log('sellerServices changed:', sellerServices);
    console.log('sellerServices length:', sellerServices.length);
  }, [sellerServices]);

  // Add window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (activeConversation) {
        setTimeout(scrollToBottom, 100);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeConversation]);

  const scrollToBottom = () => {
    try {
      const messageContainer = document.querySelector('.messages-container');
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    } catch (error) {
      // Handle error silently
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && selectedFiles.length === 0) || !activeConversation || sending) return;

    const currentConversation = conversations.find(conv => conv.id === activeConversation);
    if (!currentConversation) {
      return;
    }

    setSending(true);
    
    try {
      await sendMessage(
        currentConversation.participant.id, 
        newMessage.trim(),
        selectedFiles.length > 0 ? selectedFiles : null
      );
      
      setNewMessage('');
      setSelectedFiles([]);
      
      // Scroll to bottom after sending
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      // Handle error silently or show user-friendly message
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Filter out non-image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    // Calculate how many more images we can add
    const remainingSlots = 5 - selectedFiles.length;
    
    // Take only the allowed number of images
    const filesToAdd = imageFiles.slice(0, remainingSlots);
    
    if (filesToAdd.length < files.length) {
      // Show a message if files were rejected due to limit or type
      alert('يمكنك رفع 5 صور كحد أقصى فقط');
    }
    
    setSelectedFiles([...selectedFiles, ...filesToAdd]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'اليوم';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'أمس';
    } else {
      return date.toLocaleDateString('ar-SA');
    }
  };

  const renderMessage = (message) => {
    const isOwn = message.senderId === user.id;
    const showDate = messages[activeConversation]?.indexOf(message) === 0 || 
      (messages[activeConversation]?.[messages[activeConversation].indexOf(message) - 1] &&
       formatDate(message.timestamp) !== formatDate(messages[activeConversation][messages[activeConversation].indexOf(message) - 1].timestamp));

    return (
      <div key={message.id}>
        {showDate && (
          <div className="flex justify-center my-4">
            <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
              {formatDate(message.timestamp)}
            </span>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex mb-4",
            isOwn ? "justify-start" : "justify-end"
          )}
        >
          <div className={cn(
            "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
            isOwn 
              ? "bg-primary text-primary-foreground mr-2" 
              : "bg-gray-100 text-gray-800 ml-2"
          )}>
            {message.text && (
              <p className="break-words" dir="rtl">{message.text}</p>
            )}
            
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment, index) => (
                  <MessageAttachment 
                    key={index} 
                    attachment={attachment} 
                    isOwn={isOwn}
                  />
                ))}
              </div>
            )}
            
            <p className={cn(
              "text-xs mt-1 opacity-70",
              isOwn ? "text-right" : "text-left"
            )}>
              {formatTime(message.timestamp)}
            </p>
          </div>
        </motion.div>
      </div>
    );
  };

  const currentConversationDetails = conversations.find(conv => conv.id === activeConversation);
  const currentMessages = messages[activeConversation] || [];
  const filteredConversations = conversations.filter(conv => 
    conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to check if a user is online based on last_seen timestamp
  const isUserOnline = (lastSeen) => {
    if (!lastSeen) {
      return false;
    }
    
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    
    // Consider user online if they were active in the last 5 minutes (increased from 2)
    const diffInMinutes = (now - lastSeenDate) / (1000 * 60);
    return diffInMinutes < 5;
  };
  
  // Format last seen time
  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'غير متصل';
    
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    
    // If online in the last 5 minutes (matching isUserOnline)
    if (isUserOnline(lastSeen)) {
      return 'متصل الآن';
    }
    
    // If today
    if (lastSeenDate.toDateString() === now.toDateString()) {
      return `آخر ظهور اليوم ${lastSeenDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastSeenDate.toDateString() === yesterday.toDateString()) {
      return `آخر ظهور أمس ${lastSeenDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show date - using Gregorian calendar with Arabic numerals
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      calendar: 'gregory',
      numberingSystem: 'arabext' // Using extended Arabic-Indic numerals
    };
    const gregorianDate = lastSeenDate.toLocaleDateString('ar-SA', options);
    return `آخر ظهور ${gregorianDate}`;
  };

  // Debug output for online status
  useEffect(() => {
    if (activeConversation && currentConversationDetails) {
      console.log('Current conversation participant:', {
        name: currentConversationDetails.participant.name,
        last_seen: currentConversationDetails.participant.last_seen,
        isOnline: isUserOnline(currentConversationDetails.participant.last_seen)
      });
    }
  }, [activeConversation, currentConversationDetails]);

  if (!user) {
    return <div className="container mx-auto px-4 py-8 text-center">يرجى تسجيل الدخول لعرض الرسائل.</div>;
  }

  const navbarHeight = document.querySelector('header')?.offsetHeight || 70;

  return (
    <div className="flex border-t h-full" style={{ height: `calc(100vh - ${navbarHeight}px)`, overflow: 'hidden' }}>
      
      {/* Sidebar: Conversations List */}
      <aside 
        className={`w-full md:w-1/3 lg:w-1/4 border-l bg-neutral-100 p-4 flex flex-col ${activeConversation && 'hidden md:flex'}`}
        style={{ height: '100%', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary">المحادثات</h2>
          <div className="flex items-center space-x-2">
            {!connected && (
              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" title="غير متصل"></div>
            )}
            {connected && (
              <div className="h-2 w-2 bg-green-500 rounded-full" title="متصل"></div>
            )}
          </div>
        </div>
        
        <div className="relative mb-4">
          <Input 
            type="text" 
            placeholder="بحث في المحادثات..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        
        <div className="flex-grow overflow-y-auto space-y-2 pr-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-500 mt-2">جاري التحميل...</p>
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map(conv => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setActiveConversation(conv.id)}
                className={cn(
                  "flex items-center p-3 rounded-lg cursor-pointer transition-colors hover:bg-orange-100",
                  activeConversation === conv.id ? "bg-orange-200" : "bg-white"
                )}
              >
                <Avatar className="h-10 w-10 ml-3 relative">
                  <AvatarImage src={conv.participant.avatar} />
                  <AvatarFallback>{conv.participant.name.charAt(0)}</AvatarFallback>
                  {isUserOnline(conv.participant.last_seen) && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-800 truncate">{conv.participant.name}</p>
                    {conv.unreadCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground">{conv.unreadCount}</Badge>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage.senderId === user.id ? 'أنت: ' : ''}
                      {conv.lastMessage.text}
                    </p>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500 text-center mt-4">لا توجد محادثات.</p>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main 
        className={`flex-1 flex flex-col bg-white ${!activeConversation && 'hidden md:flex'}`}
        style={{ height: '100%' }}
      >
        {activeConversation && currentConversationDetails ? (
          <>
            {/* Chat Header */}
            <header className="p-3 border-b flex items-center justify-between bg-gray-50 shrink-0" style={{ height: '60px' }}>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setActiveConversation(null)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 ml-3 relative">
                  <AvatarImage src={currentConversationDetails.participant.avatar} />
                  <AvatarFallback>{currentConversationDetails.participant.name.charAt(0)}</AvatarFallback>
                  {isUserOnline(currentConversationDetails.participant.last_seen) && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-800">{currentConversationDetails.participant.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatLastSeen(currentConversationDetails.participant.last_seen)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {/* Show service button only if seller has services */}
                {!loadingServices && sellerServices.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowServiceModal(true)}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <ShoppingBag className="h-4 w-4 mr-1" />
                    طلب خدمة
                  </Button>
                )}
                        
                {/* Show loading indicator while checking for services */}
                {loadingServices && (
                  <div className="text-xs text-gray-500 flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-1"></div>
                    جاري التحقق من الخدمات...
                  </div>
                )}
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-red-100">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>حذف المحادثة</AlertDialogTitle>
                    <AlertDialogDescription>
                      هل أنت متأكد من حذف هذه المحادثة؟ لا يمكن التراجع عن هذا الإجراء.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteConversation(activeConversation)}>
                      حذف
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              </div>
            </header>

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto p-4 messages-container"
              style={{ height: 'calc(100% - 120px)' }}
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : currentMessages.length > 0 ? (
                <>
                  {currentMessages.map(renderMessage)}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">ابدأ محادثة جديدة</p>
                  </div>
                </div>
              )}
            </div>

            {/* File Preview */}
            {selectedFiles.length > 0 && (
              <div className="border-t p-2 bg-gray-50">
                <div className="flex flex-wrap gap-2">
                  <div className="w-full flex justify-between mb-1">
                    <span className="text-xs text-gray-500">{selectedFiles.length}/5 صور</span>
                    {selectedFiles.length > 0 && (
                      <button 
                        type="button" 
                        onClick={() => setSelectedFiles([])}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        مسح الكل
                      </button>
                    )}
                  </div>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-center space-x-2 bg-white p-2 rounded border">
                        <Image className="h-4 w-4" />
                        <span className="text-xs truncate max-w-20">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t bg-white shrink-0 md:pb-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <div className="flex-1 flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={selectedFiles.length >= 5}
                    className={`${selectedFiles.length >= 5 ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                    title={selectedFiles.length >= 5 ? "الحد الأقصى 5 صور" : "إرفاق صور"}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Input
                    type="text"
                    placeholder="اكتب رسالة..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                    dir="rtl"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={(!newMessage.trim() && selectedFiles.length === 0) || sending}
                  className="shrink-0"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">مرحباً بك في الرسائل</h3>
              <p className="text-gray-500">اختر محادثة من القائمة للبدء</p>
            </div>
          </div>
        )}
      </main>

      {/* Service Order Modal */}
      <ServiceOrderModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        sellerId={currentConversationDetails?.participant?.id}
        sellerUserId={currentConversationDetails?.participant?.id}
        sellerName={currentConversationDetails?.participant?.name}
        sellerAvatar={currentConversationDetails?.participant?.avatar}
        preloadedServices={sellerServices}
      />
    </div>
  );
};

export default ChatPage;
