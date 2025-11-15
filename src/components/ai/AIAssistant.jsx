import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { api, assetUrl } from '@/lib/api';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AIAssistant = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !hasGreeted && messages.length === 0) {
      // Send greeting message automatically when opening for the first time
      sendGreetingMessage();
      setHasGreeted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendGreetingMessage = async () => {
    setLoading(true);

    try {
      const response = await api.chatWithAI('', []);

      const aiMessage = {
        role: 'assistant',
        content: response.message,
        type: response.type || 'text',
        products: response.products || [],
        sellers: response.sellers || [],
        timestamp: new Date()
      };
      setMessages([aiMessage]);
    } catch (error) {
      console.error('AI Assistant error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
        type: 'text',
        timestamp: new Date()
      };
      setMessages([errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (messageText = null) => {
    const text = messageText || input.trim();
    
    // Don't allow empty messages
    if (!text || text.trim() === '') return;

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Check if message is a search query (contains search keywords)
    const searchKeywords = ['أريد', 'عاوز', 'ابحث', 'منتج', 'شراء', 'بائع', 'تاجر', 'عندك', 'عندي', 'أحتاج', 'محتاج', 'خدمة', 'خدمه'];
    const isSearchQuery = searchKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );

    // Add loading message - with text for search queries, without text for others
    const loadingMessage = {
      role: 'assistant',
      content: isSearchQuery ? 'حالياً بدور على طلبك يا جميل...' : '',
      type: 'loading',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await api.chatWithAI(text, history);

      // Remove loading message if exists and add actual response
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => msg.type !== 'loading');
        const aiMessage = {
          role: 'assistant',
          content: response.message,
          type: response.type || 'text',
          products: response.products || [],
          sellers: response.sellers || [],
          timestamp: new Date()
        };
        return [...withoutLoading, aiMessage];
      });
    } catch (error) {
      console.error('AI Assistant error:', error);
      // Remove loading message if exists and add error message
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => msg.type !== 'loading');
        const errorMessage = {
          role: 'assistant',
          content: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
          type: 'text',
          timestamp: new Date()
        };
        return [...withoutLoading, errorMessage];
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-24 right-6 z-50 flex flex-col items-center gap-2 md:bottom-6"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-roman-500 hover:bg-roman-600 text-white rounded-full p-3 shadow-lg flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isOpen ? (
            <X size={20} />
          ) : (
            <div className="relative">
              <img 
                src="https://avatar.iran.liara.run/public/girl?bg=e85856" 
                alt="ميرنا" 
                className="w-10 h-10 rounded-full border-2 border-white shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white"></div>
            </div>
          )}
        </motion.button>
        {!isOpen && (
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold text-gray-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-md whitespace-nowrap"
          >
            ميرنا
          </motion.span>
        )}
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-32 right-6 w-96 h-[450px] z-40 bg-white rounded-lg shadow-2xl flex flex-col md:bottom-24"
            dir="rtl"
          >
            <Card className="h-full flex flex-col border-0 shadow-none">
              <CardHeader className="bg-roman-500 text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src="https://avatar.iran.liara.run/public/girl?bg=e85856" 
                      alt="ميرنا" 
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">ميرنا</h3>
                    <p className="text-xs text-white/80">مساعدك الذكي في بازار</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="relative">
                        <img 
                          src="https://avatar.iran.liara.run/public/girl?bg=e85856" 
                          alt="ميرنا" 
                          className="w-8 h-8 rounded-full border-2 border-roman-200"
                        />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-roman-500 text-white'
                          : msg.type === 'loading'
                          ? 'bg-roman-100 text-roman-700 border border-roman-200'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {msg.type === 'loading' ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-roman-500" />
                          {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                        </div>
                      ) : (
                        msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                      
                      {/* Products */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-semibold mb-2">المنتجات:</p>
                          {msg.products.map((product) => (
                            <Link
                              key={product.id}
                              to={product.link}
                              className="block p-2 bg-white rounded border hover:shadow-md transition"
                            >
                              <div className="flex gap-2">
                                {product.image && (
                                  <img
                                    src={assetUrl(product.image)}
                                    alt={product.title}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="font-semibold text-sm">{product.title}</p>
                                  <p className="text-xs text-gray-600">{product.price} ريال</p>
                                  {product.seller_name && (
                                    <p className="text-xs text-blue-600">من: {product.seller_name}</p>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Sellers */}
                      {msg.sellers && msg.sellers.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-semibold mb-2">البائعون:</p>
                          {msg.sellers.map((seller) => (
                            <Link
                              key={seller.id}
                              to={seller.link}
                              className="block p-2 bg-white rounded border hover:shadow-md transition"
                            >
                              <div className="flex gap-2 items-center">
                                {seller.avatar && (
                                  <img
                                    src={assetUrl(seller.avatar)}
                                    alt={seller.name}
                                    className="w-12 h-12 rounded-full"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="font-semibold text-sm">{seller.name}</p>
                                  <div className="flex gap-2 items-center">
                                    <Badge variant="outline" className="text-xs">
                                      ⭐ {seller.rating}
                                    </Badge>
                                    <span className="text-xs text-gray-600">
                                      {seller.review_count} تقييم
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="relative">
                        {user?.avatar ? (
                          <img 
                            src={assetUrl(user.avatar)} 
                            alt={user.name || 'المستخدم'} 
                            className="w-8 h-8 rounded-full border-2 border-roman-200"
                          />
                        ) : (
                          <img 
                            src="https://avatar.iran.liara.run/public/girl?bg=e85856" 
                            alt="المستخدم" 
                            className="w-8 h-8 rounded-full border-2 border-roman-200"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب رسالتك..."
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={loading || !input.trim()}
                    className="bg-roman-500 hover:bg-roman-600"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;

