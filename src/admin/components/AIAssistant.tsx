import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Send, X, Loader2, Minimize2, Maximize2, Copy } from 'lucide-react';
import { chatWithAssistant } from '../services/aiService';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIAssistant() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Halo! Saya asisten admin Anda. Ada yang bisa saya bantu terkait data dashboard?' }
  ]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized]);

  const cleanText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/__/g, '')
      .replace(/_/g, '')
      .replace(/#/g, '')
      .replace(/`/g, '')
      .replace(/^\s*[-•]\s+/gm, '')
      .trim();
  };

  const getDisplayText = (index: number, text: string) => {
    const cleaned = cleanText(text);
    const maxChars = 900;
    if (expanded[index] || cleaned.length <= maxChars) return cleaned;
    return `${cleaned.slice(0, maxChars)}…`;
  };

  const handleCopyChat = () => {
    const chatText = messages
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${cleanText(m.content)}`)
      .join('\n\n');
    navigator.clipboard.writeText(chatText);
    toast({
        title: "Chat Disalin",
        description: "Seluruh percakapan berhasil disalin ke clipboard.",
    });
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(cleanText(text));
    toast({
        title: "Teks Disalin",
        description: "Pesan berhasil disalin ke clipboard.",
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Gather context
      const pageContext = `URL: ${window.location.origin}${location.pathname}\nPage Title: ${document.title}\nPage Content Preview: ${document.body.innerText.slice(0, 1500)}...`;
      
      const response = await chatWithAssistant(userMessage, pageContext); 
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Maaf, terjadi kesalahan saat menghubungi layanan AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg z-50 animate-bounce hover:animate-none bg-gradient-to-r from-primary to-purple-600 border-2 border-white dark:border-gray-800"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="h-7 w-7" />
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-6 right-6 w-80 md:w-[400px] shadow-2xl z-50 transition-all duration-300 flex flex-col border-none ring-1 ring-black/5 dark:ring-white/10",
      isMinimized ? "h-16 rounded-t-xl" : "h-[600px] rounded-xl"
    )}>
      <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-t-xl shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <CardTitle className="text-sm font-bold">AI Assistant</CardTitle>
            <span className="text-[10px] text-primary-foreground/80 font-medium">Online & Ready</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-primary-foreground hover:bg-white/20 rounded-full transition-colors" 
            onClick={handleCopyChat}
            title="Salin Chat"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-white/20 rounded-full transition-colors" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-white/20 rounded-full transition-colors" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      {!isMinimized && (
        <>
          <CardContent className="p-0 flex-1 overflow-hidden bg-slate-50 dark:bg-zinc-950/50">
            <ScrollArea className="h-full px-4 py-4" viewportRef={scrollRef}>
              <div className="space-y-5">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300",
                      msg.role === 'user'
                        ? "ml-auto bg-primary text-primary-foreground rounded-br-none" 
                        : "bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-bl-none text-slate-800 dark:text-slate-200"
                    )}
                  >
                    <div 
                        className="whitespace-pre-wrap break-words leading-relaxed max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
                    >
                        {getDisplayText(i, msg.content)}
                    </div>
                    {cleanText(msg.content).length > 900 && (
                      <button
                        type="button"
                        className={cn(
                          "mt-2 text-[11px] underline underline-offset-4 opacity-80 hover:opacity-100 transition-opacity",
                          msg.role === 'user' ? "text-primary-foreground/80 text-right" : "text-slate-500 text-left"
                        )}
                        onClick={() => setExpanded((prev) => ({ ...prev, [i]: !prev[i] }))}
                      >
                        {expanded[i] ? 'Tutup' : 'Lihat selengkapnya'}
                      </button>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className={cn(
                          "text-[10px] opacity-70",
                          msg.role === 'user' ? "text-primary-foreground/70" : "text-slate-400"
                      )}>
                          {msg.role === 'user' ? 'You' : 'AI'}
                      </span>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => handleCopyMessage(msg.content)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                          title="Salin pesan ini"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex w-max max-w-[80%] flex-col gap-2 rounded-2xl px-4 py-3 text-sm bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-bl-none shadow-sm">
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground animate-pulse">Sedang berpikir...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-3 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex w-full items-end gap-2"
            >
              <Input
                placeholder="Ketik pesan..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 min-h-[40px] max-h-[100px] resize-none focus-visible:ring-1 focus-visible:ring-primary bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input.trim()}
                className={cn(
                    "h-10 w-10 rounded-full transition-all duration-200",
                    input.trim() ? "bg-primary hover:bg-primary/90" : "bg-muted text-muted-foreground"
                )}
              >
                <Send className="h-4 w-4 ml-0.5" />
              </Button>
            </form>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
