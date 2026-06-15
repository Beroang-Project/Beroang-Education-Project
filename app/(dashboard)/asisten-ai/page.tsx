'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, BrainCircuit, Bot, Clock, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGSAP, animations } from '@/lib/gsap-config';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

const HISTORY_MOCK = [
  { id: '1', title: 'Brainstorming Ide Modul', date: 'Hari ini' },
  { id: '2', title: 'Referensi P5 Lingkungan', date: 'Kemarin' },
  { id: '3', title: 'Cara Meningkatkan Partisipasi', date: '3 Hari yang lalu' },
];

export default function AsistenAIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      role: 'ai',
      content: 'Halo! Saya AI Assistant Beroang. Ada yang bisa saya bantu untuk mengembangkan kemampuan Anda hari ini?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    animations.fadeInUp('.ai-sidebar', 0);
    animations.fadeInUp('.ai-chat', 0.1);
  }, { scope: containerRef });

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Tentu, saya bisa membantu Anda mengembangkan kemampuan mengajar. Berikut beberapa referensi dan langkah yang bisa Anda ambil berdasarkan kebutuhan tersebut.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div ref={containerRef} className="flex h-[calc(100vh-6rem)] gap-4 -mx-2">
      
      {/* Sidebar History */}
      <Card className="ai-sidebar w-64 flex-shrink-0 flex flex-col border-border/50">
        <CardHeader className="p-4 border-b bg-muted/10">
          <Button className="w-full justify-start text-xs font-semibold" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Percakapan Baru
          </Button>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Riwayat Percakapan
                </p>
                <div className="space-y-1">
                  {HISTORY_MOCK.map((item) => (
                    <Button 
                      key={item.id} 
                      variant="ghost" 
                      className="w-full justify-start text-left h-auto py-2.5 px-3 hover:bg-muted/50"
                    >
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.date}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="ai-chat flex-1 flex flex-col border-border/50 relative overflow-hidden bg-dot-pattern">
        
        {/* Chat Header */}
        <div className="h-14 border-b bg-background/80 backdrop-blur-md flex items-center px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <BrainCircuit className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm">Beroang AI Assistant</h3>
              <p className="text-[10px] text-muted-foreground">Kembangkan Kemampuan Anda</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-6 max-w-3xl mx-auto pb-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-4 w-full", msg.role === 'user' ? "flex-row-reverse" : "")}>
                <Avatar className={cn("h-8 w-8 border shrink-0 mt-1", msg.role === 'ai' ? "bg-primary/5" : "bg-muted")}>
                  {msg.role === 'ai' ? <AvatarFallback className="text-primary"><Bot className="h-4 w-4"/></AvatarFallback> : <AvatarFallback>GU</AvatarFallback>}
                </Avatar>
                
                <div className={cn("flex flex-col gap-1 max-w-[80%]", msg.role === 'user' ? "items-end" : "items-start")}>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-medium text-muted-foreground">{msg.role === 'ai' ? 'Beroang AI' : 'Anda'}</span>
                    <span className="text-[10px] text-muted-foreground/60">{msg.timestamp}</span>
                  </div>
                  <div className={cn("p-3.5 rounded-2xl text-sm leading-relaxed", 
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-background border shadow-sm rounded-tl-sm"
                  )}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-4 w-full">
                <Avatar className="h-8 w-8 border shrink-0 mt-1 bg-primary/5">
                  <AvatarFallback className="text-primary"><Bot className="h-4 w-4"/></AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1 max-w-[80%] items-start">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-medium text-muted-foreground">Beroang AI</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-background border shadow-sm rounded-tl-sm flex items-center gap-1.5 h-10 px-4">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-background/80 backdrop-blur-md border-t">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSend} className="relative flex items-end gap-2 bg-muted/30 p-2 rounded-2xl border shadow-sm focus-within:ring-1 focus-within:ring-primary/30 transition-all">
              <Input 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Tanyakan sesuatu untuk mengembangkan kemampuan Anda..."
                className="flex-1 min-h-[44px] border-0 bg-transparent shadow-none focus-visible:ring-0 px-4"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="h-10 w-10 shrink-0 rounded-xl"
                disabled={!input.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI Model</span>
              <span className="flex items-center gap-1"><BrainCircuit className="h-3 w-3" /> Context Aware</span>
            </div>
          </div>
        </div>

      </Card>
    </div>
  );
}
