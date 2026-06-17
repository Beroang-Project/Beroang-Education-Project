'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send, BrainCircuit, Sparkles, Calendar, Lightbulb, GraduationCap,
  BookOpen, Target, Users, FileText, Palette, Plus, Copy, Check,
  RefreshCw, ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIAssistantStore, type AIChatMessage } from '@/store/aiAssistantStore';
import { useGSAP, gsap } from '@/lib/gsap-config';
import { generateWithGroq } from '@/lib/groq';
import { toast } from 'sonner';

const QUICK_ACTIONS = [
  { icon: Calendar, title: 'Rencana Pelajaran', prompt: 'Bantu saya membuat rencana pembelajaran yang efektif dan terstruktur untuk kelas' },
  { icon: Lightbulb, title: 'Ide Kreatif', prompt: 'Berikan saya ide kreatif untuk aktivitas belajar mengajar di kelas' },
  { icon: GraduationCap, title: 'Evaluasi Siswa', prompt: 'Bantu saya merancang sistem evaluasi dan penilaian untuk siswa' },
  { icon: Target, title: 'Tujuan Pembelajaran', prompt: 'Bantu saya menentukan tujuan pembelajaran yang terukur dan jelas' },
  { icon: BookOpen, title: 'Materi Pelajaran', prompt: 'Bantu saya menyusun materi pelajaran yang menarik dan mudah dipahami' },
  { icon: Users, title: 'Strategi Kelas', prompt: 'Bagikan strategi untuk mengelola kelas dengan baik dan efektif' },
  { icon: FileText, title: 'Soal Ujian', prompt: 'Bantu saya membuat soal ujian beserta kunci jawabannya' },
  { icon: Palette, title: 'Media Pembelajaran', prompt: 'Bantu saya membuat media pembelajaran yang kreatif dan interaktif' },
];

async function generateAIResponse(userMessage: string): Promise<string> {
  try {
    const response = await generateWithGroq(userMessage);
    return response;
  } catch (error: any) {
    console.error('AI API error:', error);
    if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
      return 'Maaf, layanan AI sedang sibuk. Silakan coba lagi dalam beberapa saat.';
    }
    return generateLocalResponse(userMessage);
  }
}

function generateLocalResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes('rencana') || lower.includes('pelajaran') || lower.includes('plan')) {
    return `## Rencana Pembelajaran\n\nBerikut adalah rencana pembelajaran yang bisa Anda gunakan:\n\n### Tujuan Pembelajaran\n- Siswa memahami konsep dasar materi\n- Siswa dapat menerapkan pengetahuan dalam konteks nyata\n- Siswa mengembangkan keterampilan berpikir kritis\n\n### Kegiatan Pembelajaran\n\n**Pendahuluan (10 menit)**\n- Apersepsi: Mengaitkan materi baru dengan pengetahuan sebelumnya\n- Motivasi: Memberikan contoh relevan dalam kehidupan sehari-hari\n\n**Kegiatan Inti (30 menit)**\n- Eksplorasi: Siswa membaca dan mendiskusikan materi\n- Elaborasi: Diskusi kelompok dan tanya jawab\n- Konfirmasi: Guru memberikan penguatan\n\n**Penutup (5 menit)**\n- Kesimpulan: Siswa menyimpulkan materi\n- Refleksi: Apa yang sudah dipelajari hari ini?\n\n### Penilaian\n- Observasi selama diskusi\n- Tugas kelompok\n- Kuis singkat\n\n> Tips: Sesuaikan durasi dengan kondisi kelas dan kompleksitas materi.`;
  }

  if (lower.includes('soal') || lower.includes('ujian') || lower.includes('evaluasi')) {
    return `## Contoh Soal Ujian\n\nBerikut contoh soal yang bisa digunakan:\n\n### Pilihan Ganda\n\n**1.** Manakah pernyataan yang benar tentang...\n- A. ...\n- B. ...\n- C. ... ✓\n- D. ...\n\n**2.** Jelaskan mengapa...\n\n### Essay\n\n**3.** Analisislah dampak... terhadap...\n\n**4.** Bandingkan dan bedakan antara... dan...\n\n### Kunci Jawaban\n\n\`\`\`\n1. C\n2. (Jawaban siswa harus mencakup penjelasan)\n3. (Jawaban: minimal 3 poin analisis)\n4. (Jawaban: minimal 4 perbedaan)\n\`\`\`\n\n> Tips: Variasikan jenis soal untuk mengukur berbagai tingkat kemampuan siswa.`;
  }

  if (lower.includes('strategi') || lower.includes('kelas') || lower.includes('manajemen')) {
    return `## Strategi Pengelolaan Kelas\n\n### 1. Bangun Hubungan yang Baik\n- Kenali nama dan karakteristik setiap siswa\n- Tunjukkan ketertarikan pada minat mereka\n- Dengarkan pendapat siswa dengan seksama\n\n### 2. Aturan Kelas yang Jelas\n- Buat aturan bersama di awal semester\n- Libatkan siswa dalam pembuatan aturan\n- Konsisten dalam menerapkan aturan\n\n### 3. Teknik Mengajar yang Efektif\n- Variasikan metode pembelajaran\n- Gunakan pendekatan kontekstual\n- Berikan penguatan positif\n\n### 4. Penanganan Gangguan\n- Tetap tenang dan profesional\n- Gunakan teknik redirecting\n- Berikan konsekuensi yang adil\n\n> Ingat: Setiap kelas unik. Sesuaikan strategi dengan karakteristik siswa Anda.`;
  }

  if (lower.includes('ide') || lower.includes('kreatif') || lower.includes('aktivitas')) {
    return `## Ide Kreatif Pembelajaran\n\n### 1. Game-Based Learning\n- Kuis interaktif menggunakan Kahoot atau Quizizz\n- Peran peran (role play) untuk simulasi\n- Board game edukatif\n\n### 2. Collaborative Learning\n- Think-Pair-Share: Berpikir, diskusi berpasangan, bagikan\n- Jigsaw: Setiap siswa jadi ahli topik tertentu\n- Gallery Walk: Presentasi hasil kerja kelompok\n\n### 3. Project-Based Learning\n- Proyek nyata yang terkait kehidupan sehari-hari\n- Pameran hasil karya siswa\n- Presentasi di depan kelas\n\n### 4. Teknologi dalam Pembelajaran\n- Video pembelajaran interaktif\n- Mind mapping digital\n- Virtual field trip\n\n> Kombinasikan beberapa ide untuk pengalaman belajar yang lebih kaya!`;
  }

  return `## Terima kasih atas pertanyaan Anda!\n\nSaya telah mencatat pertanyaan Anda. Berikut beberapa hal yang bisa saya bantu:\n\n- **Rencana Pelajaran** — Buat perencanaan pembelajaran yang terstruktur\n- **Soal Ujian** — Rancang penilaian yang komprehensif\n- **Strategi Kelas** — Tips pengelolaan kelas yang efektif\n- **Ide Kreatif** — Aktivitas belajar yang menyenangkan\n\nSilakan tanyakan lebih spesifik tentang topik yang ingin Anda dalami, dan saya akan memberikan panduan yang lebih terperinci.\n\n> Tips: Semakin spesifik pertanyaan Anda, semakin baik respons yang saya berikan.`;
}

function parseAIResponse(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let codeBlock = false;
  let codeContent = '';
  let codeLang = '';

  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      if (codeBlock) {
        elements.push(
          <div key={`code-${i}`} className="my-3 rounded-xl overflow-hidden border border-border">
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
              <span className="text-[11px] font-mono text-muted-foreground">{codeLang || 'code'}</span>
              <CopyButton text={codeContent.trim()} />
            </div>
            <pre className="p-4 bg-card overflow-x-auto">
              <code className="text-[13px] font-mono text-foreground/90 leading-relaxed">{codeContent.trim()}</code>
            </pre>
          </div>
        );
        codeBlock = false;
        codeContent = '';
        codeLang = '';
      } else {
        codeBlock = true;
        codeLang = line.replace('```', '').trim();
      }
      return;
    }

    if (codeBlock) {
      codeContent += line + '\n';
      return;
    }

    let processed = line;

    // Inline code
    processed = processed.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-[12px] font-mono text-primary">$1</code>');

    // Bold
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');

    // Italic
    processed = processed.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic">$1</em>');

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-[15px] font-bold text-foreground mt-5 mb-2" dangerouslySetInnerHTML={{ __html: processed.replace('### ', '') }} />
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-base font-bold text-foreground mt-6 mb-2" dangerouslySetInnerHTML={{ __html: processed.replace('## ', '') }} />
      );
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-2 border-primary/30 pl-4 py-1 my-2 text-[13px] text-muted-foreground italic" dangerouslySetInnerHTML={{ __html: processed.replace('> ', '') }} />
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={i} className="text-[13px] text-foreground/80 leading-relaxed ml-4 mb-1 list-disc" dangerouslySetInnerHTML={{ __html: processed.replace(/^[-*] /, '') }} />
      );
    } else if (line.match(/^\d+\. /)) {
      elements.push(
        <li key={i} className="text-[13px] text-foreground/80 leading-relaxed ml-4 mb-1 list-decimal" dangerouslySetInnerHTML={{ __html: processed.replace(/^\d+\. /, '') }} />
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(
        <p key={i} className="text-[13px] text-foreground/80 leading-relaxed mb-1" dangerouslySetInnerHTML={{ __html: processed }} />
      );
    }
  });

  return elements;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Tersalin' : 'Salin'}
    </button>
  );
}

function AsistenAIContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chat');
  const { createChat, history, updateChatMessages } = useAIAssistantStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentChat = chatId ? history.find(h => h.id === chatId) : null;

  useGSAP(() => {
    if (!chatId) {
      gsap.fromTo('.ai-hero-icon',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, delay: 0, ease: 'back.out(1.7)' }
      );
      gsap.fromTo('.ai-hero-title',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, delay: 0.15, ease: 'greenIn' }
      );
      gsap.fromTo('.ai-hero-desc',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, delay: 0.3, ease: 'greenIn' }
      );
      gsap.fromTo('.ai-quick-action',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, delay: 0.3, ease: 'greenIn' }
      );
      gsap.fromTo('.ai-input-area',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, delay: 0.5, ease: 'greenIn' }
      );
    } else {
      gsap.fromTo('.ai-chat-header',
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
      gsap.fromTo('.ai-chat-input',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 0.15, ease: 'power2.out' }
      );
    }
  }, { scope: containerRef, dependencies: [chatId] });

  useEffect(() => {
    if (chatId && currentChat) {
      const msgs = currentChat.messages || [];
      if (msgs.length > 0) {
        setMessages(msgs);
        // If last message is from user (no AI response yet), trigger AI response
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg && lastMsg.role === 'user' && !isTyping) {
          setIsTyping(true);
          setTimeout(async () => {
            const aiResponse = await generateAIResponse(lastMsg.content);
            const aiMsg: AIChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'ai',
              content: aiResponse,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            const finalMessages = [...msgs, aiMsg];
            setMessages(finalMessages);
            updateChatMessages(chatId, finalMessages);
            setIsTyping(false);
          }, 500);
        }
      } else {
        const greeting: AIChatMessage = {
          id: 'msg-greeting',
          role: 'ai',
          content: 'Halo! Saya Beroang AI. Ada yang bisa saya bantu untuk mengembangkan kemampuan mengajar Anda hari ini?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([greeting]);
        updateChatMessages(chatId, [greeting]);
      }
    }
  }, [chatId, currentChat?.messages?.length, isTyping, updateChatMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        setTimeout(() => { viewport.scrollTop = viewport.scrollHeight; }, 50);
      }
    }
  }, [messages, isTyping]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, []);

  const handleSend = useCallback((text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isTyping) return;

    let activeChatId = chatId;

    const userMsg: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (!activeChatId) {
      activeChatId = createChat(messageText.slice(0, 30), userMsg);
      router.push(`/asisten-ai?chat=${activeChatId}`);
      return;
    }

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);
    setShowQuickActions(false);

    setTimeout(async () => {
      const aiResponse = await generateAIResponse(messageText);
      const aiMsg: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);
      updateChatMessages(activeChatId!, finalMessages);
      setIsTyping(false);
    }, 500);
  }, [input, isTyping, chatId, messages, createChat, router, updateChatMessages]);

  const handleRegenerate = useCallback(() => {
    if (!chatId || messages.length < 2 || isTyping) return;

    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;

    const newMessages = messages.filter(m => m.id !== messages[messages.length - 1].id);
    setMessages(newMessages);
    setIsTyping(true);

    setTimeout(async () => {
      const aiResponse = await generateAIResponse(lastUserMsg.content);
      const aiMsg: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);
      updateChatMessages(chatId, finalMessages);
      setIsTyping(false);
    }, 500);
  }, [chatId, messages, isTyping, updateChatMessages]);

  const handleQuickAction = useCallback((prompt: string) => {
    setInput(prompt);
    setShowQuickActions(false);
    setTimeout(() => {
      handleSend(prompt);
    }, 100);
  }, [handleSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  if (!chatId) {
    return (
      <div ref={containerRef} className="flex h-[calc(100vh-6rem)] -mx-2">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center mb-10">
            <div className="ai-hero-icon h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
              <BrainCircuit className="h-8 w-8 text-primary" />
            </div>
            <h1 className="ai-hero-title font-display text-3xl font-bold text-foreground mb-2">
              Selamat Datang, Guru!
            </h1>
            <p className="ai-hero-desc text-muted-foreground text-sm max-w-md mx-auto">
              Ada yang bisa saya bantu untuk mengembangkan kemampuan mengajar Anda hari ini?
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3 w-full max-w-3xl mb-8">
            {QUICK_ACTIONS.map((action, index) => (
              <button
                key={`action-${index}`}
                onClick={() => handleQuickAction(action.prompt)}
                className="ai-quick-action group p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-background hover:border-primary/30 hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <action.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground mb-0.5">{action.title}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="ai-input-area w-full max-w-xl">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Mulai percakapan dengan AI..."
                className="w-full h-14 pl-5 pr-14 rounded-2xl border-border/50 bg-background shadow-sm focus-visible:ring-primary/30 text-sm"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl"
                disabled={!input.trim()}
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
      </div>
    );
  }

  const isLastAIMessage = messages.length > 0 && messages[messages.length - 1].role === 'ai';

  return (
    <div ref={containerRef} className="flex flex-col h-[calc(100vh-6rem)] -mx-2">
      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="py-6">
          {messages.map((msg, idx) => (
            <div key={msg.id} className="mb-6 group/message">
              {msg.role === 'user' ? (
                <div className="max-w-3xl mx-auto px-6">
                  <div className="bg-primary text-primary-foreground border border-primary/20 rounded-2xl rounded-tr-sm px-5 py-3.5 ml-auto max-w-[85%]">
                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto px-6">
                  <div className="border border-border/50 rounded-2xl rounded-tl-sm px-5 py-4 bg-background/50">
                    <div className="space-y-0.5">
                      {parseAIResponse(msg.content)}
                    </div>
                    {idx === messages.length - 1 && isLastAIMessage && !isTyping && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                        <CopyButton text={msg.content} />
                        <span className="text-border">|</span>
                        <button
                          onClick={handleRegenerate}
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Ulangi
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="max-w-3xl mx-auto px-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
                <span className="text-xs">Beroang AI sedang mengetik...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions Dropdown */}
      {showQuickActions && (
        <div className="border-t bg-background/95 backdrop-blur-md px-6 py-3">
          <div className="max-w-3xl mx-auto">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Aksi Cepat</p>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_ACTIONS.map((action, index) => (
                <button
                  key={`qa-${index}`}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all text-left"
                >
                  <action.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-[11px] font-medium text-foreground truncate">{action.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="ai-chat-input shrink-0 border-t bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-end gap-2 bg-muted/30 p-2 rounded-2xl border shadow-sm focus-within:ring-1 focus-within:ring-primary/30 transition-all">
            <button
              type="button"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className={cn(
                "h-9 w-9 shrink-0 rounded-xl flex items-center justify-center transition-colors",
                showQuickActions ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Plus className={cn("h-4 w-4 transition-transform", showQuickActions && "rotate-45")} />
            </button>
            <Input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan sesuatu..."
              className="flex-1 min-h-[40px] border-0 bg-transparent shadow-none focus-visible:ring-0 px-2 text-[13px]"
            />
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-xl"
              disabled={!input.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-center text-[10px] text-muted-foreground/60 mt-2">
            Beroang AI adalah AI dan dapat membuat kesalahan. Silakan periksa kembali respons.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AsistenAIPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <BrainCircuit className="h-5 w-5 animate-pulse" />
          <span className="text-sm">Memuat...</span>
        </div>
      </div>
    }>
      <AsistenAIContent />
    </Suspense>
  );
}
