import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Trash2, RotateCcw } from 'lucide-react';
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
  
  // Don't render if user has explicitly disabled AI assistant
  if (user && user.show_ai_assistant === false) {
    return null;
  }
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Drag and visibility states
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [hasMoved, setHasMoved] = useState(false);
  const buttonRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const longPressTimer = useRef(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load position and visibility from localStorage on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('mernaButtonPosition');
    const savedVisibility = localStorage.getItem('mernaButtonVisible');
    
    if (savedPosition) {
      try {
        const pos = JSON.parse(savedPosition);
        setPosition(pos);
      } catch (e) {
        console.error('Error loading button position:', e);
        // Set default position on error
        const buttonSize = window.innerWidth < 768 ? 56 : 64;
        setPosition({ 
          x: window.innerWidth - buttonSize - 24, 
          y: window.innerHeight - buttonSize - 24 
        });
      }
    } else {
      // Default position (bottom right)
      const buttonSize = window.innerWidth < 768 ? 56 : 64;
      setPosition({ 
        x: window.innerWidth - buttonSize - 24, 
        y: window.innerHeight - buttonSize - 24 
      });
    }
    
    if (savedVisibility === 'false') {
      setIsHidden(true);
    }
  }, []);

  // Save position to localStorage when it changes
  useEffect(() => {
    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem('mernaButtonPosition', JSON.stringify(position));
    }
  }, [position]);

  // Save visibility to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('mernaButtonVisible', String(!isHidden));
  }, [isHidden]);

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

  // Drag handlers for touch (mobile)
  const handleTouchStart = (e) => {
    if (isOpen) return; // Don't drag when chat is open
    
    const touch = e.touches[0];
    dragStartPos.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    };
    setIsDragging(true);
    setHasMoved(false);
    setShowDeleteButton(false);
    
    // Long press to show delete button
    longPressTimer.current = setTimeout(() => {
      if (isDragging) {
        setShowDeleteButton(true);
      }
    }, 500);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isOpen) return;
    
    clearTimeout(longPressTimer.current);
    setHasMoved(true);
    const touch = e.touches[0];
    const newX = touch.clientX - dragStartPos.current.x;
    const newY = touch.clientY - dragStartPos.current.y;
    
    // Constrain to screen bounds
    const buttonSize = isMobile ? 56 : 64;
    const padding = 12;
    const maxX = window.innerWidth - buttonSize - padding;
    const maxY = window.innerHeight - buttonSize - padding;
    
    setPosition({
      x: Math.max(padding, Math.min(newX, maxX)),
      y: Math.max(padding, Math.min(newY, maxY))
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setHasMoved(false);
    clearTimeout(longPressTimer.current);
  };

  // Drag handlers for mouse (desktop)
  const handleMouseDown = (e) => {
    if (isOpen) return; // Don't drag when chat is open
    
    // Don't start dragging if clicking directly on a button (but allow dragging from container)
    const clickedButton = e.target.closest('button');
    if (clickedButton && clickedButton !== e.currentTarget) {
      // If we clicked on a button that's not the container itself, don't drag
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    setIsDragging(true);
    setHasMoved(false);
    setShowDeleteButton(false);
  };

  const handleMouseUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
      setHasMoved(false);
    }
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging && !isOpen) {
      const handleMouseMoveGlobal = (e) => {
        setHasMoved(true);
        const newX = e.clientX - dragStartPos.current.x;
        const newY = e.clientY - dragStartPos.current.y;
        
        // Constrain to screen bounds
        const buttonSize = isMobile ? 56 : 64;
        const padding = 12;
        const maxX = window.innerWidth - buttonSize - padding;
        const maxY = window.innerHeight - buttonSize - padding;
        
        setPosition({
          x: Math.max(padding, Math.min(newX, maxX)),
          y: Math.max(padding, Math.min(newY, maxY))
        });
      };
      
      const handleMouseUpGlobal = () => {
        setIsDragging(false);
        setHasMoved(false);
      };
      
      window.addEventListener('mousemove', handleMouseMoveGlobal);
      window.addEventListener('mouseup', handleMouseUpGlobal);
      return () => {
        window.removeEventListener('mousemove', handleMouseMoveGlobal);
        window.removeEventListener('mouseup', handleMouseUpGlobal);
      };
    }
  }, [isDragging, isMobile, isOpen]);

  // Handle window resize to keep button in bounds
  useEffect(() => {
    const handleResize = () => {
      const buttonSize = isMobile ? 56 : 64;
      const padding = 12;
      const maxX = window.innerWidth - buttonSize - padding;
      const maxY = window.innerHeight - buttonSize - padding;
      
      setPosition(prev => ({
        x: Math.max(padding, Math.min(prev.x, maxX)),
        y: Math.max(padding, Math.min(prev.y, maxY))
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Delete/hide button
  const handleDelete = (e) => {
    e.stopPropagation();
    setIsHidden(true);
    setIsOpen(false);
    setShowDeleteButton(false);
  };

  // Restore button
  const handleRestore = () => {
    setIsHidden(false);
    // Reset to default position
    const buttonSize = isMobile ? 56 : 64;
    const padding = 24;
    setPosition({ 
      x: window.innerWidth - buttonSize - padding, 
      y: window.innerHeight - buttonSize - padding 
    });
  };

  return (
    <>
      {/* Restore Button - shown when button is hidden */}
      {isHidden && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleRestore}
          className="fixed bottom-6 left-6 z-50 bg-roman-500 hover:bg-roman-600 text-white rounded-full p-3 shadow-lg flex items-center justify-center transition-colors md:bottom-6 md:left-6"
          title="استعادة ميرنا"
        >
          <RotateCcw size={20} />
        </motion.button>
      )}

      {/* Floating Button */}
      {!isHidden && (
        <motion.div
          ref={buttonRef}
          className="fixed z-50 flex flex-col items-center gap-2 touch-none"
          data-drag-handle
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseEnter={() => {
            if (!isMobile && !isOpen && !isDragging) {
              setShowDeleteButton(true);
            }
          }}
          onMouseLeave={() => {
            if (!isMobile) {
              setShowDeleteButton(false);
            }
          }}
          whileHover={!isDragging ? { scale: 1.05 } : {}}
          whileTap={!isDragging ? { scale: 0.95 } : {}}
        >
          <div className="relative">
            <motion.button
              onClick={(e) => {
                // Only open/close if we didn't drag
                if (!isDragging && !hasMoved) {
                  setIsOpen(!isOpen);
                }
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                // Prevent dragging when clicking directly on button
                e.stopPropagation();
              }}
              className={`bg-roman-500 hover:bg-roman-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors pointer-events-auto ${
                isMobile 
                  ? 'w-14 h-14 p-2' 
                  : 'w-16 h-16 p-3'
              }`}
              whileHover={!isDragging ? { scale: 1.1 } : {}}
              whileTap={!isDragging ? { scale: 0.9 } : {}}
              disabled={isDragging}
            >
              {isOpen ? (
                <X size={isMobile ? 18 : 20} />
              ) : (
                <div className="relative">
                  <img 
                    src="https://avatar.iran.liara.run/public/girl?bg=e85856" 
                    alt="ميرنا" 
                    className={`rounded-full border-2 border-white shadow-md ${
                      isMobile 
                        ? 'w-8 h-8' 
                        : 'w-10 h-10'
                    }`}
                  />
                  <div className={`absolute -bottom-1 -right-1 bg-success-500 rounded-full border-2 border-white ${
                    isMobile 
                      ? 'w-3 h-3' 
                      : 'w-4 h-4'
                  }`}></div>
                </div>
              )}
            </motion.button>
            
            {/* Delete Button - shown on long press or hover */}
            {showDeleteButton && !isOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleDelete}
                className="absolute -top-2 -right-2 bg-warning-500 hover:bg-warning-600 text-white rounded-full p-1.5 shadow-lg z-10"
                title="حذف الزر"
              >
                <Trash2 size={14} />
              </motion.button>
            )}
          </div>
          
          {!isOpen && (
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`font-semibold text-gray-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-md whitespace-nowrap ${
                isMobile 
                  ? 'text-[10px]' 
                  : 'text-xs'
              }`}
            >
              ميرنا
            </motion.span>
          )}
        </motion.div>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-32 right-6 left-4 md:left-auto md:w-96 h-[450px] z-40 bg-white rounded-lg shadow-2xl flex flex-col md:bottom-24"
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

