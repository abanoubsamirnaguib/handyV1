
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
  // New: Add product to chat
  const addProductToChat = (conversationId, product) => {
    if (!conversationId || !product) return;
    
    const productMessage = {
      id: uuidv4(),
      productId: product.id,
      product: product,
      isProduct: true,
      timestamp: new Date().toISOString(),
      senderId: user?.id, // sent by current user
    };
    
    // Update messages
    setMessages(prevMessages => {
      const currentConvoMessages = [...(prevMessages[conversationId] || [])];
      return {
        ...prevMessages,
        [conversationId]: [...currentConvoMessages, productMessage],
      };
    });
    
    // Update conversation with last message indication (product shared)
    setConversations(prevConversations => 
      prevConversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              lastMessage: {
                text: `تم مشاركة منتج: ${product.name}`,
                timestamp: new Date().toISOString(),
                senderId: user?.id,
              },
            }
          : conv
      )
    );
    
    return productMessage;
  };
  
  // New: Handle deposit payment in chat
  const handleDepositPayment = (conversationId, paymentDetails) => {
    if (!conversationId || !paymentDetails) return;
    
    const paymentMessage = {
      id: uuidv4(),
      isPayment: true,
      paymentType: 'deposit',
      paymentDetails,
      timestamp: new Date().toISOString(),
      senderId: user?.id,
    };
    
    // Update messages
    setMessages(prevMessages => {
      const currentConvoMessages = [...(prevMessages[conversationId] || [])];
      return {
        ...prevMessages,
        [conversationId]: [...currentConvoMessages, paymentMessage],
      };
    });
    
    // Update conversation with last message
    setConversations(prevConversations => 
      prevConversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              lastMessage: {
                text: `تم دفع عربون بقيمة ${paymentDetails.amount} ريال`,
                timestamp: new Date().toISOString(),
                senderId: user?.id,
              },
            }
          : conv
      )
    );
    
    // Simulate seller response after payment
    setTimeout(() => {
      const sellerResponse = {
        id: uuidv4(),
        text: `شكراً لدفع العربون. سأبدأ العمل على طلبك فوراً! يمكنك متابعة حالة الطلب من صفحة الطلبات.`,
        timestamp: new Date(Date.now() + 2000).toISOString(),
        senderId: paymentDetails.sellerId || conversations.find(c => c.id === conversationId)?.participant?.id,
      };
      
      // Update messages with seller response
      setMessages(prevMessages => {
        const currentConvoMessages = [...(prevMessages[conversationId] || [])];
        return {
          ...prevMessages,
          [conversationId]: [...currentConvoMessages, sellerResponse],
        };
      });
      
      // Update conversation with last message
      setConversations(prevConversations => 
        prevConversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                lastMessage: sellerResponse,
                unreadCount: activeConversation === conversationId ? 0 : conv.unreadCount + 1,
              }
            : conv
        )
      );
      
      // Show notification
      if (activeConversation !== conversationId) {
        toast({
          title: `رسالة جديدة من ${conversations.find(c => c.id === conversationId)?.participant?.name}`,
          description: sellerResponse.text.substring(0, 30) + '...',
        });
      }
    }, 3000);
    
    return paymentMessage;
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
    // New functions
    addProductToChat,
    handleDepositPayment,
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
