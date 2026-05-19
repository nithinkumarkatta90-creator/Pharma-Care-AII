import { useState, useEffect, useRef } from 'react';
import { collection, doc, onSnapshot, updateDoc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAuth } from '../App';
import { aiService } from '../services/aiService';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Loader2, 
  Mic, 
  MicOff, 
  Sparkles, 
  MessageSquare, 
  Zap, 
  ShieldCheck,
  ArrowLeft,
  Search,
  Brain,
  Stethoscope,
  Pill
} from 'lucide-react';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';

const QUICK_ACTIONS = [
  { label: "Check Symptoms", icon: Stethoscope, prompt: "I'm feeling unwell. Can you help me analyze my symptoms?" },
  { label: "Medicine Info", icon: Pill, prompt: "Tell me about the side effects and uses of " },
  { label: "Diet Plan", icon: Zap, prompt: "Suggest a healthy diet plan for " },
  { label: "Mental Health", icon: Brain, prompt: "I'm feeling stressed. Can we talk about mental wellness?" }
];

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '64px'; // Reset to base height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(Math.max(scrollHeight, 64), 160) + 'px';
    }
  }, [input]);

  useEffect(() => {
    if (!user) return;

    const chatDoc = doc(db, 'chat_history', user.uid);
    const unsub = onSnapshot(chatDoc, (snap) => {
      if (snap.exists()) {
        setMessages(snap.data().messages || []);
      } else {
        setMessages([]);
      }
      setFetching(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `chat_history/${user.uid}`);
      setFetching(false);
    });

    return unsub;
  }, [user]);

  useEffect(() => {
    const scrollToBottom = () => {
      // Use both methods for maximum compatibility
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
      
      const viewport = scrollRef.current?.closest('[data-slot="scroll-area-viewport"]');
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth'
        });
      }
    };

    // Scroll on message change or loading state
    scrollToBottom();

    // Small delay to ensure layout shifts are accounted for
    const timeout = setTimeout(scrollToBottom, 100);

    // Use ResizeObserver to scroll when content grows
    const viewport = scrollRef.current?.closest('[data-slot="scroll-area-viewport"]');
    const observer = new ResizeObserver(() => {
      scrollToBottom();
    });

    if (viewport?.firstElementChild) {
      observer.observe(viewport.firstElementChild);
    }
    
    // Also scroll on window resize (helps with mobile keyboard)
    window.addEventListener('resize', scrollToBottom);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
      window.removeEventListener('resize', scrollToBottom);
    };
  }, [messages, loading]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast.error('Voice input failed. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info("Listening... Speak clearly into your microphone.");
    }
  };

  const handleSend = async (e?: React.FormEvent, customInput?: string) => {
    if (e) e.preventDefault();
    const messageContent = customInput || input;
    if (!messageContent.trim() || !user) return;

    const userMessage = { role: 'user', content: messageContent, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    
    // Immediate scroll after state change
    const viewport = scrollRef.current?.closest('[data-slot="scroll-area-viewport"]');
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }

    try {
      const aiResponse = await aiService.chat(messages, messageContent);
      const botMessage = { role: 'model', content: aiResponse, timestamp: new Date().toISOString() };
      
      const chatDoc = doc(db, 'chat_history', user.uid);
      await setDoc(chatDoc, {
        uid: user.uid,
        messages: [...newMessages, botMessage],
        updatedAt: new Date().toISOString()
      }, { merge: true });

    } catch (error: any) {
      toast.error('Failed to get AI response');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'chat_history', user.uid));
      toast.success('Chat history cleared');
    } catch (error: any) {
      toast.error('Failed to clear history');
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] flex flex-col gap-2 relative">
      <PageHeader
        icon={MessageSquare}
        title="AI Health Chat"
        description="Your personal AI health assistant, available 24/7."
        color="teal"
        badge="Live"
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        }
      />

      <div className="flex-1 flex flex-col overflow-hidden border border-border/50 shadow-2xl rounded-[2.5rem] bg-card/30 backdrop-blur-sm relative">
        <div className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 px-4 md:px-8">
            <div className="py-8 space-y-8">
              {fetching ? (
                <div className="space-y-8">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className={cn("flex gap-4", i % 2 === 0 ? "flex-row-reverse" : "")}>
                      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
                      <div className="space-y-2 flex-1 max-w-[75%]">
                        <Skeleton className="h-4 w-full rounded-lg" />
                        <Skeleton className="h-4 w-5/6 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {messages.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center py-10 text-center"
                    >
                      <div className="relative mb-6">
                        <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center relative z-10">
                          <Bot className="w-12 h-12 text-primary" />
                        </div>
                        <div className="absolute inset-0 bg-primary/20 blur-3xl -z-10 rounded-full scale-150 opacity-50"></div>
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tight mb-2">
                        AI Health <span className="text-primary">Intelligence</span>
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground max-w-sm mx-auto font-medium leading-relaxed mb-8">
                        Ask me about symptoms, medications, or health tips.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                        {QUICK_ACTIONS.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(undefined, action.prompt)}
                            className="p-4 bg-card border border-border hover:border-primary/40 hover:shadow-md rounded-2xl transition-all duration-300 flex items-center gap-4 text-left group active:scale-95"
                          >
                            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">
                              <action.icon className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-foreground line-clamp-1">{action.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {messages.map((msg, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex gap-4", msg.role === 'user' ? 'flex-row-reverse' : '')}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform hover:scale-105",
                        msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'
                      )}>
                        {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-primary" />}
                      </div>
                      <div className={cn(
                        "max-w-[85%] sm:max-w-[75%] p-5 md:p-6 rounded-[1.5rem] shadow-sm relative group sm:text-base text-sm",
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-card/50 backdrop-blur-md text-foreground rounded-tl-none border border-border/50'
                      )}>
                        <div className={cn(
                          "prose prose-sm max-w-none leading-relaxed",
                          msg.role === 'user' ? "prose-invert" : "dark:prose-invert"
                        )}>
                          <Markdown>{msg.content}</Markdown>
                        </div>
                        <div className={cn(
                          "flex items-center gap-2 mt-3 opacity-50 text-[9px] font-black uppercase tracking-widest",
                          msg.role === 'user' ? 'justify-end' : ''
                        )}>
                          {msg.role === 'model' && <ShieldCheck className="w-3 h-3 text-primary" />}
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="bg-muted/50 p-4 rounded-2xl rounded-tl-none border border-border flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs font-bold text-muted-foreground">Thinking...</span>
                  </div>
                </motion.div>
              )}
              <div ref={scrollRef} className="h-12 w-full flex-shrink-0" />
            </div>
          </ScrollArea>

          <div className="p-4 md:p-6 border-t bg-card/50 backdrop-blur-xl">
            <form onSubmit={handleSend} className="relative flex items-end gap-3 max-w-4xl mx-auto">
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={toggleListening}
                className={cn(
                  "w-12 h-12 rounded-xl transition-all duration-300 flex-shrink-0 border-none",
                  isListening 
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-200 animate-pulse" 
                    : "bg-muted border border-border text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              
              <div className="relative flex-1">
                <Textarea 
                  ref={textareaRef}
                  autoFocus
                  placeholder={isListening ? "Listening..." : "Ask me anything..."} 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="w-full min-h-[48px] max-h-32 pl-4 pr-12 bg-muted border border-border rounded-xl text-base font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all py-3 resize-none overflow-y-auto scrollbar-hide"
                  disabled={loading}
                />
                <div className="absolute right-2 bottom-2">
                  <Button 
                    type="submit" 
                    disabled={loading || !input.trim()} 
                    className="w-8 h-8 rounded-lg bg-primary hover:bg-primary/90 p-0 shadow-lg shadow-primary/20 transition-all active:scale-90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </form>
            <p className="text-[10px] text-center text-muted-foreground mt-4 font-bold uppercase tracking-widest opacity-60">
              AI can make mistakes. Verify with a pro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
