import { useState, useRef, useEffect } from 'react';
import { useSendChatMessage } from '@workspace/api-client-react';
import { useSession } from '@/hooks/use-session';
import { useLocation } from 'wouter';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  productLinks?: number[];
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi there! I\'m your NEXCART assistant. How can I help you find the perfect product today?',
      suggestions: ['Show me deals', 'Track my order', 'Suggest a laptop']
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useSession();
  const [, setLocation] = useLocation();
  const sendMessage = useSendChatMessage();

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    sendMessage.mutate(
      { data: { message: text, sessionId } },
      {
        onSuccess: (data) => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: data.reply,
              suggestions: data.suggestions,
              productLinks: data.productIds
            }
          ]);
        },
        onError: () => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: 'Sorry, I encountered an error. Please try asking again.',
            }
          ]);
        }
      }
    );
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_rgba(0,188,212,0.4)] flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <Bot size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-card border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary p-4 text-primary-foreground flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-transparent"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">NEX AI Assistant</h3>
                  <p className="text-xs text-primary-foreground/70 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center relative z-10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10 custom-scrollbar">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs ${
                    msg.role === 'user' ? 'bg-secondary text-white' : 'bg-primary text-white'
                  }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  
                  <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-secondary text-white rounded-tr-sm' 
                        : 'bg-card border border-border text-foreground rounded-tl-sm shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                    
                    {/* Render Product Links */}
                    {msg.productLinks && msg.productLinks.length > 0 && (
                      <div className="flex flex-col gap-2 w-full mt-1">
                        {msg.productLinks.map((id, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setLocation(`/products/${id}`);
                              setIsOpen(false);
                            }}
                            className="text-xs bg-card border border-border hover:border-secondary px-3 py-2 rounded-lg text-left transition-colors flex justify-between items-center shadow-sm"
                          >
                            <span className="truncate">View Product #{id}</span>
                            <Sparkles className="w-3 h-3 text-secondary shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Render Suggestion Chips if it's the last message */}
                    {msg.suggestions && msg.id === messages[messages.length - 1].id && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(suggestion)}
                            className="text-xs border border-secondary text-secondary hover:bg-secondary hover:text-white px-3 py-1.5 rounded-full transition-colors bg-card"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {sendMessage.isPending && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-primary text-white flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-card border border-border rounded-tl-sm flex gap-1">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></motion.div>
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></motion.div>
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></motion.div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-card border-t border-border">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-muted border-transparent focus:border-secondary focus:ring-1 focus:ring-secondary rounded-full px-4 py-3 text-sm transition-all outline-none"
                  disabled={sendMessage.isPending}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sendMessage.isPending}
                  className="w-11 h-11 shrink-0 rounded-full bg-secondary text-white flex items-center justify-center hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} className="translate-x-[1px] translate-y-[-1px]" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
