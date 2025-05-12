
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { getSellerById } from '@/lib/data';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Load conversations from localStorage
    const storedConversations = localStorage.getItem('conversations');
    const storedMessages = localStorage.getItem('messages');
    
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    } else {
      // Initialize with mock data if no conversations exist
      initializeMockData();
    }
    
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, [user]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
    if (Object.keys(messages).length > 0) {
      localStorage.setItem('messages', JSON.stringify(messages));
    }
  }, [conversations, messages]);

  const initializeMockData = () => {
    if (!user) return;

    const mockSellers = [
      {
        id: 's1',
        name: 'ليلى حسن',
        avatar: '',
        lastSeen: new Date().toISOString(),
      },
      {
        id: 's2',
        name: 'كريم محمود',
        avatar: '',
        lastSeen: new Date().toISOString(),
      },
    ];

    const mockConversations = mockSellers.map(seller => ({
      id: uuidv4(),
      participant: seller,
      unreadCount: 0,
      lastMessage: {
        text: 'مرحباً، كيف يمكنني مساعدتك؟',
        timestamp: new Date().toISOString(),
        senderId: seller.id,
      },
    }));

    const mockMessages = {};
    mockConversations.forEach(conv => {
      mockMessages[conv.id] = [
        {
          id: uuidv4(),
          text: 'مرحباً، كيف يمكنني مساعدتك؟',
          timestamp: new Date().toISOString(),
          senderId: conv.participant.id,
        },
      ];
    });

    setConversations(mockConversations);
    setMessages(mockMessages);
  };

  const startConversation = (participant) => {
    // Check if conversation already exists
    const existingConv = conversations.find(
      (conv) => conv.participant.id === participant.id
    );

    if (existingConv) {
      setActiveConversation(existingConv.id);
      return existingConv.id;
    }

    // Create new conversation
    const newConversationId = uuidv4();
    const newConversation = {
      id: newConversationId,
      participant,
      unreadCount: 0,
      lastMessage: null,
    };

    setConversations([...conversations, newConversation]);
    setMessages({ ...messages, [newConversationId]: [] });
    setActiveConversation(newConversationId);
    
    return newConversationId;
  };

  const sendMessage = (conversationId, text) => {
    if (!user || !text.trim()) return;

    const newMessage = {
      id: uuidv4(),
      text,
      timestamp: new Date().toISOString(),
      senderId: user.id,
    };

    // Update messages using functional update to ensure we're using the latest state
    setMessages(prevMessages => {
      const currentConvoMessages = [...(prevMessages[conversationId] || [])];
      return {
        ...prevMessages,
        [conversationId]: [...currentConvoMessages, newMessage],
      };
    });

    // Update conversation with last message
    setConversations(prevConversations => 
      prevConversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              lastMessage: newMessage,
            }
          : conv
      )
    );

    // Simulate reply after 1-3 seconds
    setTimeout(() => {
      simulateReply(conversationId);
    }, 1000 + Math.random() * 2000);

    return newMessage;
  };

  const simulateReply = (conversationId) => {
    const conversation = conversations.find((conv) => conv.id === conversationId);
    if (!conversation) return;

    const replies = [
      'شكراً لتواصلك معي! كيف يمكنني مساعدتك؟',
      'سعيد بالتحدث معك. هل لديك أي استفسارات حول منتجاتي؟',
      'أهلاً! نعم، المنتج متوفر حالياً.',
      'يمكنني تخصيص المنتج حسب طلبك، ما هي المواصفات التي تريدها؟',
      'وقت التسليم المتوقع هو أسبوع واحد. هل هذا مناسب لك؟',
    ];

    const replyText = replies[Math.floor(Math.random() * replies.length)];
    const replyMessage = {
      id: uuidv4(),
      text: replyText,
      timestamp: new Date().toISOString(),
      senderId: conversation.participant.id,
    };

    // Update messages - make sure we're properly preserving the existing messages
    setMessages(prevMessages => {
      const currentConvoMessages = [...(prevMessages[conversationId] || [])];
      return {
        ...prevMessages,
        [conversationId]: [...currentConvoMessages, replyMessage],
      };
    });

    // Update conversation with last message and increment unread count if not active
    setConversations(prevConversations => 
      prevConversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              lastMessage: replyMessage,
              unreadCount: activeConversation === conversationId ? 0 : conv.unreadCount + 1,
            }
          : conv
      )
    );

    // Show notification if not the active conversation
    if (activeConversation !== conversationId) {
      toast({
        title: `رسالة جديدة من ${conversation.participant.name}`,
        description: replyText.length > 30 ? replyText.substring(0, 30) + '...' : replyText,
      });
    }
  };

  const markConversationAsRead = (conversationId) => {
    setConversations(
      conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  const deleteConversation = (conversationId) => {
    setConversations(conversations.filter((conv) => conv.id !== conversationId));
    
    // Remove messages for this conversation
    const updatedMessages = { ...messages };
    delete updatedMessages[conversationId];
    setMessages(updatedMessages);
    
    if (activeConversation === conversationId) {
      setActiveConversation(null);
    }
    
    toast({
      title: 'تم حذف المحادثة',
      description: 'تم حذف المحادثة بنجاح',
    });
  };

  const value = {
    conversations,
    messages,
    activeConversation,
    setActiveConversation,
    startConversation,
    sendMessage,
    markConversationAsRead,
    deleteConversation,
    startNewChat: (sellerId, initialMessage) => {
      // Try to find seller in existing conversations
      const existingSellerData = conversations.find(conv => 
        conv.participant && conv.participant.id === sellerId
      )?.participant;
      
      if (existingSellerData) {
        return startConversation(existingSellerData);
      }
      
      // If seller not found in conversations, fetch from data.js
      const sellerData = getSellerById(sellerId);
      
      if (sellerData) {
        return startConversation({
          id: sellerId,
          name: sellerData.name,
          avatar: sellerData.avatar || '',
          lastSeen: new Date().toISOString()
        });
      }
      
      // Fallback if seller can't be found
      return startConversation({ 
        id: sellerId, 
        name: "الحرفي",
        avatar: "",
        lastSeen: new Date().toISOString()
      });
    }
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
