import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import echo, { updateEchoAuth } from '@/lib/echo';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [activeChannels, setActiveChannels] = useState(new Set());
  const { user } = useAuth();
  const { toast } = useToast();
  // Track the last time a conversation was marked as read to avoid rapid duplicate requests
  const lastMarkReadRef = useRef({});
  // Track the last online status update time
  const lastOnlineUpdateRef = useRef(0);

  // Load conversations when component mounts
  useEffect(() => {
    if (user) {
      // Update Echo auth headers with current token and load conversations
      updateEchoAuth();
      loadConversations();
      
      // Update online status immediately
      updateOnlineStatus();
      
      // Set up interval to refresh conversations every 8 minutes to get updated online status
      const conversationsIntervalId = setInterval(() => {
        loadConversations();
      }, 480000); // 8 minutes
      
      // Set up interval to update user's own online status every minute
      const onlineStatusIntervalId = setInterval(() => {
        updateOnlineStatus();
      }, 480000); // 8 minutes
      
      return () => {
        clearInterval(conversationsIntervalId);
        clearInterval(onlineStatusIntervalId);
        disconnectFromChannels();
      };
    }
    return () => {
      disconnectFromChannels();
    };
  }, [user]);

  // Setup channels when conversations change
  useEffect(() => {
    if (user && conversations.length > 0) {
      // Only set up Pusher connection if not already connected or if channels have changed
      const conversationIds = conversations.map(conv => `conversation.${conv.id}`).sort().join(',');
      const channelIds = Array.from(activeChannels).sort().join(',');
      
      // Check if we need to update channels (new conversations or missing channels)
      if (!connected || conversationIds !== channelIds) {
        setupPusherConnection();
      }
    }
  }, [user, conversations, connected, activeChannels]);

  // Update user's online status
  const updateOnlineStatus = async () => {
    if (!user) return;
    
    // Throttle updates to once per minute
    const now = Date.now();
    if (now - lastOnlineUpdateRef.current < 60000) return;
    
    lastOnlineUpdateRef.current = now;
    
    try {
      await api.updateOnlineStatus();
    } catch (error) {
      // Silent fail - don't show errors to user for background updates
    }
  };

  // Setup Pusher connection and event listeners
  const setupPusherConnection = () => {
    if (!user || !echo) return;

    try {
      // Force reconnect to ensure fresh connection
      if (echo.connector && echo.connector.pusher) {
        echo.connector.pusher.disconnect();
        setTimeout(() => {
          echo.connector.pusher.connect();
        }, 500);
      }

      // Listen for new messages on all user's conversations
      conversations.forEach(conversation => {
        const channelName = `conversation.${conversation.id}`;
        
        // Skip if channel already exists
        if (activeChannels.has(channelName)) {
          // Try re-binding to ensure event listener is active
          try {
            // Direct access to the channel using its name
            const channelKey = `private-${channelName}`;
            // Get existing channel directly using Pusher's channels object
            const existingChannel = echo.connector.pusher.channels.channels[channelKey];
            if (existingChannel) {
              // Unbind all possible event formats
              existingChannel.unbind('message.sent');
              existingChannel.unbind('.message.sent');
              
              // Rebind with standard format
              existingChannel.bind('message.sent', (e) => {
                if (e && e.message) {
                  handleNewMessage(e.message);
                } else if (e) {
                  handleNewMessage(e);
                }
              });
              
              // Also try Laravel's dot prefix format
              existingChannel.bind('.message.sent', (e) => {
                if (e && e.message) {
                  handleNewMessage(e.message);
                } else if (e) {
                  handleNewMessage(e);
                }
              });
            }
          } catch (err) {
            // Silent fail for rebinding errors
          }
          return;
        }
        
        const channel = echo.private(channelName);
        
        // Listen for message events with different formats
        channel.listen('message.sent', (e) => {
          if (e && e.message) {
            handleNewMessage(e.message);
          } else if (e) {
            handleNewMessage(e);
          }
        });
        
        // Also try with Laravel's default namespace format
        channel.listen('.message.sent', (e) => {
          if (e && e.message) {
            handleNewMessage(e.message);
          } else if (e) {
            handleNewMessage(e);
          }
        });
        
        // Listen for client whisper events
        channel.listenForWhisper('message.sent', (e) => {
          if (e) handleNewMessage(e);
        });

        // Track active channels
        setActiveChannels(prev => new Set([...prev, channelName]));
      });

      setConnected(true);
    } catch (error) {
      toast({
        title: "اتصال خطأ",
        description: "فشل في الاتصال بخدمة الرسائل المباشرة",
        variant: "destructive",
      });
      setConnected(false);
    }
  };

  // Disconnect from all channels
  const disconnectFromChannels = () => {
    if (echo && activeChannels.size > 0) {
      activeChannels.forEach(channelName => {
        try {
          echo.leave(channelName);
        } catch (error) {
          // Silent fail for channel leave errors
        }
      });
    }
    setActiveChannels(new Set());
    setConnected(false);
  };

  // Setup channel for a specific conversation
  const setupChannelForConversation = (conversationId) => {
    if (!user || !echo) return;

    const channelName = `conversation.${conversationId}`;
    
    // Skip if channel already exists
    if (activeChannels.has(channelName)) return;
    
    try {
      const channel = echo.private(channelName);
      
      // Listen for messages - only use one event format
      // The MessageSent event is broadcast with the 'message.sent' name (without dot prefix)
      channel.listen('message.sent', (e) => {
        console.log('Received message event:', e);
        if (e && e.message) {
          handleNewMessage(e.message);
        } else if (e) {
          handleNewMessage(e);
        }
      });
      
      // Track active channels
      setActiveChannels(prev => new Set([...prev, channelName]));
    } catch (error) {
      // Silent fail for individual channel setup
    }
  };

  // Load conversations from API
  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await api.getConversations();
      setConversations(data);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل المحادثات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a specific conversation
  const loadMessages = async (conversationId) => {
    try {
      setLoading(true);
      const response = await api.getMessages(conversationId);
      
      // Handle the response format - the API now returns an array of messages directly
      const conversationMessages = Array.isArray(response) ? response : [];
      
      // Normalize attachment properties for consistency
      const normalizedMessages = conversationMessages.map(message => ({
        ...message,
        attachments: message.attachments ? message.attachments.map(attachment => ({
          id: attachment.id,
          file_url: attachment.file_url || attachment.url,
          file_type: attachment.file_type || attachment.type
        })) : []
      }));
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: normalizedMessages
      }));
      
      return normalizedMessages;
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل الرسائل",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Handle new incoming message from Pusher
  const handleNewMessage = (message) => {
    // Try to handle different message structures
    // Sometimes the message might be nested inside a message property
    const actualMessage = message.message || message;
    
    // Extract conversation_id which might be in different places
    const conversationId = actualMessage.conversation_id || 
                          actualMessage.conversationId || 
                          (typeof actualMessage === 'string' ? activeConversation : null);
    
    if (!actualMessage || !conversationId) return;
    
    // Extract sender ID to check if it's from current user
    const senderId = actualMessage.sender_id || actualMessage.senderId;
    if (senderId === user?.id) return;
    
    // Check if message already exists to prevent duplicates
    const conversationMessages = messages[conversationId] || [];
    const messageId = actualMessage.id || actualMessage._id;
    const messageExists = messageId && conversationMessages.some(msg => msg.id === messageId);
    
    if (messageExists) return;
    
    // Extract all possible field names to handle different data structures
    const id = actualMessage.id || actualMessage._id;
    const text = actualMessage.message_text || actualMessage.text || actualMessage.content;
    const timestamp = actualMessage.message_time || actualMessage.timestamp || actualMessage.created_at || new Date().toISOString();
    const sender = actualMessage.sender;
    
    // Handle attachments with consistent property names
    const attachments = actualMessage.attachments ? actualMessage.attachments.map(attachment => ({
      id: attachment.id,
      file_url: attachment.file_url || attachment.url,
      file_type: attachment.file_type || attachment.type
    })) : [];
    
    const readStatus = actualMessage.read_status || actualMessage.readStatus;
    
    // Add message to the conversation
    setMessages(prev => ({
      ...prev,
      [conversationId]: [
        ...(prev[conversationId] || []),
        {
          id,
          text,
          timestamp,
          senderId,
          sender,
          attachments,
          readStatus,
        }
      ]
    }));

    // Update conversation list
    setConversations(prev => {
      const updatedConversations = prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: {
              id,
              text,
              timestamp,
              senderId,
            },
            unreadCount: senderId !== user?.id 
              && activeConversation !== conversationId
              ? conv.unreadCount + 1 
              : conv.unreadCount,
            lastMessageTime: timestamp,
          };
        }
        return conv;
      });

      // Sort by last message time
      return updatedConversations.sort((a, b) => 
        new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      );
    });

    // Show toast notification if not in active conversation
    if (senderId !== user?.id && activeConversation !== conversationId) {
      toast({
        title: "رسالة جديدة",
        description: `${sender?.name || 'مستخدم'}: ${text}`,
      });
    }

    // Auto-mark as read if user is viewing the conversation
    if (activeConversation === conversationId && senderId !== user?.id) {
      markConversationAsRead(conversationId);
    }
  };

  // Send a new message
  const sendMessage = async (recipientId, messageText, attachments = null) => {
    if (!user || (!messageText?.trim() && !attachments)) {
      toast({
        title: "خطأ",
        description: "يجب إدخال نص الرسالة أو إرفاق ملف",
        variant: "destructive",
      });
      return;
    }

    try {
      let response;
      
      if (attachments && attachments.length > 0) {
        const formData = new FormData();
        formData.append('recipient_id', recipientId);
        if (messageText?.trim()) {
          formData.append('message_text', messageText);
        }
        
        attachments.forEach((file, index) => {
          formData.append(`attachments[${index}]`, file);
        });
        
        response = await api.sendMessageWithFiles(formData);
      } else {
        response = await api.sendMessage({
          recipient_id: recipientId,
          message_text: messageText,
        });
      }

      // Add message to local state immediately as fallback
      // This ensures the message appears even if Pusher broadcast fails
      if (response.message) {
        const messageData = {
          id: response.message.id,
          text: response.message.text,
          timestamp: response.message.timestamp,
          senderId: response.message.senderId,
          sender: response.message.sender,
          attachments: response.message.attachments ? response.message.attachments.map(attachment => ({
            id: attachment.id,
            file_url: attachment.file_url || attachment.url,
            file_type: attachment.file_type || attachment.type
          })) : [],
          readStatus: response.message.readStatus,
        };

        // Find or create conversation
        let conversationId = activeConversation;
        if (!conversationId) {
          // Find conversation with this recipient
          const existingConv = conversations.find(conv => 
            conv.participant.id === recipientId
          );
          conversationId = existingConv?.id;
        }

        if (conversationId) {
          // Add message to local state
          setMessages(prev => {
            const newMessages = {
              ...prev,
              [conversationId]: [
                ...(prev[conversationId] || []),
                messageData
              ]
            };

            return newMessages;
          });

          // Update conversation list with latest message
          setConversations(prev => 
            prev.map(conv => 
              conv.id === conversationId 
                ? {
                    ...conv,
                    lastMessage: {
                      id: messageData.id,
                      text: messageData.text,
                      timestamp: messageData.timestamp,
                      senderId: messageData.senderId,
                    },
                    lastMessageTime: messageData.timestamp,
                  }
                : conv
            )
          );
        }
      }

      return response.message;
    } catch (error) {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في إرسال الرسالة",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Start a new conversation
  const startConversation = async (recipient) => {
    if (!recipient || !recipient.id) return;

    const recipientId = recipient.id; // Extract the ID from the recipient object

    try {
      const response = await api.startConversation(recipientId);

      if (!response.conversationId || !response.participant) return;

      // Check if conversation already exists in our list
      const existingConv = conversations.find(conv => conv.id === response.conversationId);
      
      if (!existingConv) {
        const newConversation = {
          id: response.conversationId,
          participant: response.participant,
          lastMessage: null,
          unreadCount: 0,
          lastMessageTime: new Date().toISOString(),
        };
        
        setConversations(prev => [newConversation, ...prev]);
        
        // Set up Pusher channel for this new conversation
        setupChannelForConversation(response.conversationId);
      }
      
      setActiveConversation(response.conversationId);
      
      // Load messages if not already loaded
      if (!messages[response.conversationId]) {
        await loadMessages(response.conversationId);
      }
      
      return response.conversationId;
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في بدء المحادثة",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Set active conversation and load messages
  const setActiveConversationHandler = async (conversationId) => {
    setActiveConversation(conversationId);
    
    if (conversationId && !messages[conversationId]) {
      await loadMessages(conversationId);
    }
  };

  // Mark conversation as read
  const markConversationAsRead = async (conversationId) => {
    if (!conversationId) return;

    // If there is no unread messages, don't send the request
    const conv = conversations.find(c => c.id === conversationId);
    if (conv && conv.unreadCount === 0) {
      return;
    }

    // Debounce: skip if this conversation was marked as read in the last 5 seconds
    const now = Date.now();
    const lastTime = lastMarkReadRef.current[conversationId] || 0;
    if (now - lastTime < 5000) return;

    lastMarkReadRef.current[conversationId] = now;

    try {
      await api.markAsRead(conversationId);

      // Update local state
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      // Silent fail for mark as read errors
    }
  };

  // Delete conversation
  const deleteConversation = async (conversationId) => {
    try {
      await api.deleteConversation(conversationId);
      
      // Remove from local state
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[conversationId];
        return newMessages;
      });
      
      // Disconnect from Pusher channel
      const channelName = `conversation.${conversationId}`;
      if (echo) {
        try {
          echo.leave(channelName);
        } catch (error) {
          // Silent fail for channel leave errors
        }
      }
      setActiveChannels(prev => {
        const newChannels = new Set(prev);
        newChannels.delete(channelName);
        return newChannels;
      });
      
      if (activeConversation === conversationId) {
        setActiveConversation(null);
      }
      
      toast({
        title: "تم الحذف",
        description: "تم حذف المحادثة بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف المحادثة",
        variant: "destructive",
      });
    }
  };

  // Monitor Echo connection status
  useEffect(() => {
    if (!echo || !echo.connector || !echo.connector.pusher) return;

    const handleConnected = () => {
      setConnected(true);
    };

    const handleDisconnected = () => {
      setConnected(false);
    };

    const handleError = (error) => {
      setConnected(false);
      toast({
        title: "خطأ في الاتصال",
        description: "تم قطع الاتصال بخدمة الرسائل المباشرة",
        variant: "destructive",
      });
    };

    // Listen to Pusher connection events
    echo.connector.pusher.connection.bind('connected', handleConnected);
    echo.connector.pusher.connection.bind('disconnected', handleDisconnected);
    echo.connector.pusher.connection.bind('error', handleError);

    return () => {
      if (echo.connector && echo.connector.pusher) {
        echo.connector.pusher.connection.unbind('connected', handleConnected);
        echo.connector.pusher.connection.unbind('disconnected', handleDisconnected);
        echo.connector.pusher.connection.unbind('error', handleError);
      }
    };
  }, [echo, toast]);

  const value = {
    conversations,
    messages,
    activeConversation,
    loading,
    connected,
    setActiveConversation: setActiveConversationHandler,
    sendMessage,
    startConversation,
    markConversationAsRead,
    deleteConversation,
    loadConversations,
    loadMessages,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
