
import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useChat } from '@/contexts/ChatContext'; // Assuming you have this context
import { useAuth } from '@/contexts/AuthContext';

const DashboardMessages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, setActiveConversation } = useChat(); // Use chat context

  // Filter conversations relevant to the user (simplified)
  const userConversations = conversations.slice(0, 5); // Show first 5 for demo

  const handleViewConversation = (convId) => {
    setActiveConversation(convId);
    navigate('/chat');
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800">الرسائل</h1>
        <Button onClick={() => navigate('/chat')} className="bg-orange-500 hover:bg-orange-600">
          <MessageSquare className="ml-2 h-5 w-5" /> عرض كل الرسائل
        </Button>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-t-4 border-blue-500 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">إجمالي المحادثات</CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{conversations.length}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-t-4 border-orange-500 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">رسائل غير مقروءة</CardTitle>
              <MessageSquare className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-t-4 border-gray-500 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">محادثات مؤرشفة</CardTitle>
              <Archive className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">0</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-gray-700">أحدث الرسائل</CardTitle>
            <CardDescription>نظرة سريعة على أحدث المحادثات النشطة.</CardDescription>
          </CardHeader>
          <CardContent>
            {userConversations.length > 0 ? (
              <ul className="space-y-4">
                {userConversations.map(conv => (
                  <li 
                    key={conv.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => handleViewConversation(conv.id)}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 ml-3">
                        <AvatarImage src={conv.participant.avatar} />
                        <AvatarFallback>{conv.participant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-800">{conv.participant.name}</p>
                        {conv.lastMessage && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                             {conv.lastMessage.senderId === user?.id ? 'أنت: ' : ''}
                             {conv.lastMessage.text}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {conv.lastMessage && (
                        <p className="text-xs text-gray-400 mb-1">
                          {new Date(conv.lastMessage.timestamp).toLocaleTimeString('ar-EG', {hour: '2-digit', minute: '2-digit'})}
                        </p>
                      )}
                      {conv.unreadCount > 0 && (
                        <Badge className="bg-primary text-primary-foreground">{conv.unreadCount}</Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">لا توجد رسائل لعرضها.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardMessages;
