
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Smile, UserCircle, ArrowLeft, Trash2, Search, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
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
    setActiveConversation, 
    sendMessage, 
    markConversationAsRead,
    deleteConversation 
  } = useChat();
  
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (activeConversation) {
      markConversationAsRead(activeConversation);
      scrollToBottom();
    }
  }, [activeConversation, markConversationAsRead]);

  useEffect(() => {
    if (activeConversation) {
      scrollToBottom();
    }
  }, [messages, activeConversation]);

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
      console.error("Error scrolling to bottom:", error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && activeConversation) {
      sendMessage(activeConversation, newMessage);
      setNewMessage('');
      
      // Immediate scroll after sending
      scrollToBottom();
      
      // Additional scroll after a delay to handle any state updates
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    }
  };

  const currentConversationDetails = conversations.find(conv => conv.id === activeConversation);
  const currentMessages = messages[activeConversation] || [];

  const filteredConversations = conversations.filter(conv => 
    conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return <div className="container mx-auto px-4 py-8 text-center">يرجى تسجيل الدخول لعرض الرسائل.</div>;
  }
  
  const navbarHeight = document.querySelector('header')?.offsetHeight || 70;

  return (
    <div className="flex border-t h-full" style={{ height: `calc(100vh - ${navbarHeight}px)`, overflow: 'hidden' }}>
      {/* Sidebar: Conversations List */}
      <aside 
        className={`w-full md:w-1/3 lg:w-1/4 border-l bg-lightBeige p-4 flex flex-col ${activeConversation && 'hidden md:flex'}`}
        style={{ height: '100%', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary">المحادثات</h2>
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
          {filteredConversations.length > 0 ? filteredConversations.map(conv => (
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
              <Avatar className="h-10 w-10 ml-3">
                <AvatarImage src={conv.participant.avatar} />
                <AvatarFallback>{conv.participant.name.charAt(0)}</AvatarFallback>
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
          )) : (
            <p className="text-gray-500 text-center mt-4">لا توجد محادثات.</p>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main 
        className={`flex-1 flex flex-col bg-white ${!activeConversation && 'hidden md:flex'}`}
        style={{ height: '100%' }}
        ref={chatContainerRef}
      >
        {activeConversation && currentConversationDetails ? (
          <>
            {/* Chat Header */}
            <header className="p-3 border-b flex items-center justify-between bg-gray-50 shrink-0" style={{ height: '60px' }}>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setActiveConversation(null)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 ml-3">
                  <AvatarImage src={currentConversationDetails.participant.avatar} />
                  <AvatarFallback>{currentConversationDetails.participant.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-800">{currentConversationDetails.participant.name}</p>
                  <p className="text-xs text-gray-500">
                    متصل الآن
                  </p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-red-100">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>هل أنت متأكد من حذف هذه المحادثة؟</AlertDialogTitle>
                    <AlertDialogDescription>
                      لا يمكن التراجع عن هذا الإجراء. سيتم حذف جميع الرسائل في هذه المحادثة نهائياً.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteConversation(activeConversation)} className="bg-destructive hover:bg-destructive/90">
                      حذف
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </header>

            {/* Messages Area */}
            <div 
              className="messages-container p-4 bg-lightBeige"
              style={{ 
                flex: 1, 
                overflowY: 'auto', 
                height: 'calc(100% - 120px)',
              }}
            >
              <div className="space-y-4">
                {currentMessages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "flex",
                      msg.senderId === user.id ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow",
                      msg.senderId === user.id 
                        ? "bg-primary text-primary-foreground rounded-br-none" 
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    )}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        msg.senderId === user.id ? "text-lightBeige" : "text-gray-500"
                      )}>
                        {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div ref={messagesEndRef} style={{ height: '20px', marginTop: '20px' }} />
            </div>

            {/* Message Input Area */}
            <footer className="p-3 border-t bg-gray-50 shrink-0" style={{ height: '60px' }}>
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2 space-x-reverse">
                <Button variant="ghost" size="icon" type="button">
                  <Paperclip className="h-5 w-5 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon" type="button">
                  <Smile className="h-5 w-5 text-gray-500" />
                </Button>
                <Input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="اكتب رسالتك هنا..." 
                  className="flex-1" 
                  autoFocus
                />
                <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90">
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-100">
            <MessageCircle className="h-24 w-24 text-gray-300 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">ابدأ محادثة جديدة</h3>
            <p className="text-gray-500">اختر محادثة من القائمة الجانبية أو ابدأ محادثة جديدة مع أحد الحرفيين.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
