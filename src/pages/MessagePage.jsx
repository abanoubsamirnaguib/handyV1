import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getSellerById } from '@/lib/data';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';

const MessagePage = () => {  const { id } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { startNewChat, sendMessage, messages, activeConversation } = useChat();
  const messageEndRef = useRef(null);

  // For local UI state
  const [currentMessage, setCurrentMessage] = useState('');
  
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
    
    // Otherwise show date
    return `آخر ظهور ${lastSeenDate.toLocaleDateString('ar-SA')}`;
  };

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login', { state: { from: `/message/${id}` } });
      return;
    }

    // Fetch seller data
    try {
      const sellerData = getSellerById(id);
      if (!sellerData) {
        setError('لم يتم العثور على الحرفي');
        setLoading(false);
        return;
      }
      
      setSeller(sellerData);
      // Initialize chat with the seller ID
      const conversationId = startNewChat(id);
      setLoading(false);
    } catch (err) {
      console.error("Error in MessagePage:", err);
      setError('حدث خطأ أثناء تحميل البيانات');
      setLoading(false);
    }
  }, [id, navigate, user, startNewChat]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || !activeConversation) return;

    // Send message using chat context
    sendMessage(activeConversation, currentMessage);
    
    // Clear the input
    setCurrentMessage('');
  };
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation, messages]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-lg">جاري التحميل...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">😕</div>
        <h1 className="text-2xl font-bold mb-4">{error}</h1>
        <p className="mb-8">لم نتمكن من العثور على الحرفي المطلوب</p>
        <Button asChild>
          <a href="/explore?tab=sellers">العودة إلى قائمة الحرفيين</a>
        </Button>
      </div>
    );
  }

  if (!seller) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="ml-2" 
            onClick={() => navigate(-1)}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">محادثة مع {seller.name}</h1>
        </div>        <Card className="border-neutral-200/50 mb-6">
          <CardHeader className="bg-neutral-100/20 pb-3">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-roman-500 flex items-center justify-center text-white font-bold ml-3 relative">
                {seller.name.charAt(0)}
                {isUserOnline(seller.last_seen) && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div>
                <CardTitle>{seller.name}</CardTitle>
                <p className="text-sm text-gray-500">
                  {formatLastSeen(seller.last_seen)}
                </p>
              </div>
            </div>
          </CardHeader>          <CardContent className="p-0">
            <div className="h-[400px] overflow-y-auto p-4">
              {!activeConversation || !messages[activeConversation] || messages[activeConversation].length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">                  <div className="w-16 h-16 rounded-full bg-neutral-100/50 flex items-center justify-center mb-4">
                    <Send className="h-8 w-8 text-roman-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">ابدأ محادثة جديدة</h3>
                  <p className="text-gray-500 max-w-md">
                    قم بإرسال رسالة إلى {seller.name} للاستفسار عن المنتجات أو طلب منتج مخصص.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages[activeConversation].map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.senderId === user.id ? 'justify-start' : 'justify-end'}`}
                    >
                      <div 
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.senderId === user.id 
                            ? 'bg-roman-500 text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p dir="rtl">{msg.text}</p>
                        <p className={`text-xs mt-1 ${
                          msg.senderId === user.id ? 'text-neutral-100' : 'text-gray-500'
                        }`}>
                          {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>
              )}
            </div>
          </CardContent>          <CardFooter className="p-3 border-t">
            <form onSubmit={handleSendMessage} className="w-full flex">
              <Input 
                value={currentMessage} 
                onChange={(e) => setCurrentMessage(e.target.value)} 
                placeholder="اكتب رسالتك هنا..." 
                className="ml-2"
              />
              <Button type="submit" className="bg-roman-500 hover:bg-roman-500/90 text-white">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>

        <Card className="border-neutral-200/50">
          <CardHeader>
            <CardTitle className="text-xl">معلومات الحرفي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">نبذة</h3>
              <p className="text-gray-700">{seller.bio}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">المهارات</h3>
              <div className="flex flex-wrap gap-2">
                {seller.skills.map((skill, index) => (
                  <span key={index} className="bg-success-100/20 text-neutral-900 px-2 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">وقت الاستجابة</h3>
              <p className="text-gray-700">{seller.responseTime}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default MessagePage;
