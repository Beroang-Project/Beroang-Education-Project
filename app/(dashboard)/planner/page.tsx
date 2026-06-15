'use client';

import { useState, useRef } from 'react';
import { Sparkles, Copy, Check, Save, Clock, Trash2, ArrowRight, BookOpen, Activity, FileText, Send, ChevronRight, ChevronLeft, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { usePlannerStore } from '@/store/plannerStore';
import { useClassStore } from '@/store/classStore';
import { formatDateShort, cn } from '@/lib/utils';
import { useGSAP, animations } from '@/lib/gsap-config';
import type { PlannerFormValues } from '@/types';
import { IsometricCircle } from '@/components/ui/isometric-circle';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock Data for Roadmap Nodes (Hari Senin - Jumat)
const MOCK_WEEKS = [
  {
    week: 1,
    nodes: [
      { id: 'd1', day: 'Senin', label: 'Pengantar & Konsep', status: 'completed' },
      { id: 'd2', day: 'Selasa', label: 'Eksplorasi Materi', status: 'current' },
      { id: 'd3', day: 'Rabu', label: 'Aktivitas Kelompok', status: 'locked' },
      { id: 'd4', day: 'Kamis', label: 'Presentasi P5', status: 'locked' },
      { id: 'd5', day: 'Jumat', label: 'Kuis & Refleksi', status: 'locked' },
    ]
  },
  {
    week: 2,
    nodes: [
      { id: 'd6', day: 'Senin', label: 'Materi Lanjutan', status: 'locked' },
      { id: 'd7', day: 'Selasa', label: 'Studi Kasus', status: 'locked' },
      { id: 'd8', day: 'Rabu', label: 'Praktikum', status: 'locked' },
      { id: 'd9', day: 'Kamis', label: 'Evaluasi P5', status: 'locked' },
      { id: 'd10', day: 'Jumat', label: 'Asesmen Sumatif', status: 'locked' },
    ]
  }
];

const TEMPLATES = [
  "Buat roadmap Biologi SMA Kelas X tentang Ekosistem dengan integrasi P5 Gaya Hidup Berkelanjutan.",
  "Rancang alur pembelajaran Matematika SMP Kelas VIII materi SPLDV selama 4 minggu.",
  "Roadmap Sejarah SMA Kelas XI tentang Kemerdekaan Indonesia beserta rubrik penilaiannya.",
  "Modul ajar Bahasa Inggris SD Kelas V tema My Family dengan aktivitas interaktif."
];

export default function RoadmapPlannerPage() {
  const { generateOutput, currentOutput, isGenerating, history, clearCurrent, deleteHistory } = usePlannerStore();
  const { classes } = useClassStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [prompt, setPrompt] = useState('');
  const [activeWeek, setActiveWeek] = useState(1);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: 'Halo! Saya AI Assistant Anda. Ada yang ingin diubah atau ditambahkan pada roadmap ini?' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    animations.fadeInUp('.roadmap-header', 0);
    animations.fadeInUp('.prompt-card', 0.1);
    animations.staggerFadeIn('.template-card', 0.2);
    if (currentOutput) {
      animations.staggerFadeIn('.roadmap-node', 0.1);
    }
  }, { scope: containerRef, dependencies: [currentOutput, activeWeek] });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // We parse basic info from prompt as a mock, since the form is gone
    const mockParams: PlannerFormValues = {
      subject: prompt.includes('Biologi') ? 'Biologi' : 'Mata Pelajaran',
      grade: 'X',
      semester: '1',
      cp: prompt,
      p5Theme: 'Gaya Hidup Berkelanjutan',
      durationWeeks: 4,
      enableP5Integration: true
    };

    try {
      await generateOutput(mockParams);
      toast.success('Roadmap berhasil dibuat!');
      setActiveWeek(1);
    } catch {
      toast.error('Gagal membuat roadmap.');
    }
  };

  const handleChatSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatMessage.trim()) return;
    
    setChatHistory(prev => [...prev, { role: 'user', content: chatMessage }]);
    setChatMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: 'ai', content: 'Baik, saya telah menyesuaikan roadmap sesuai saran Anda. Silakan periksa perubahan pada minggu ke-2.' }]);
    }, 1000);
  };

  const handleSaveToClass = () => {
    toast.success('Roadmap berhasil disimpan dan diterapkan ke kelas!');
  };

  const currentWeekData = MOCK_WEEKS.find(w => w.week === activeWeek);

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto space-y-8">
      
      {/* State 1: Prompting Interface */}
      {!currentOutput && !isGenerating && (
        <div className="py-12 space-y-10">
          <div className="roadmap-header text-center space-y-3">
            <Badge variant="secondary" className="px-3 py-1 mb-2 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Teaching Assistant
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
              Bangun <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Roadmap</span><br />Pembelajaran Anda!
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
              Ketikkan materi, kelas, atau capaian pembelajaran. AI kami akan merancang alur yang terstruktur, lengkap dengan modul dan integrasi P5.
            </p>
          </div>

          <div className="prompt-card max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-emerald-400/30 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <Card className="relative bg-card/80 backdrop-blur-sm border-border shadow-2xl rounded-2xl overflow-hidden">
                <Textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Contoh: Buat roadmap Biologi SMA Kelas X tentang Ekosistem dengan integrasi P5..."
                  className="min-h-[120px] text-lg border-0 focus-visible:ring-0 resize-none p-6 bg-transparent"
                />
                <div className="p-3 bg-muted/30 border-t border-border flex justify-between items-center">
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
                          <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Tambah Referensi
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tambah Referensi Materi</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Upload File atau Masukkan URL</label>
                            <Input type="file" className="cursor-pointer" />
                            <div className="text-center text-xs text-muted-foreground py-2">ATAU</div>
                            <Input type="url" placeholder="https://..." />
                          </div>
                          <Button className="w-full" onClick={() => toast.success('Referensi ditambahkan')}>Simpan Referensi</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Button 
                    onClick={handleGenerate} 
                    disabled={!prompt.trim() || isGenerating}
                    className="rounded-full px-6 shadow-lg shadow-primary/25"
                  >
                    Generate Roadmap <Send className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES.map((t, i) => (
              <Card 
                key={i} 
                className="template-card cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all gp-card"
                onClick={() => setPrompt(t)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-background rounded-md border text-muted-foreground">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* State 2: Loading State */}
      {isGenerating && (
        <div className="py-20 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
            <Sparkles className="h-12 w-12 text-primary animate-bounce relative z-10" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-display font-semibold">Merancang Roadmap...</h3>
            <p className="text-sm text-muted-foreground">Menganalisis capaian pembelajaran dan menyusun alur P5</p>
          </div>
          <div className="w-full max-w-md space-y-3 pt-4">
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-2 w-4/5 mx-auto rounded-full" />
          </div>
        </div>
      )}

      {/* State 3: Visual Roadmap Output */}
      {currentOutput && !isGenerating && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold">Roadmap Pembelajaran</h2>
              <p className="text-muted-foreground text-sm">{currentOutput.subject} • Kelas {currentOutput.grade}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearCurrent}>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Buat Baru
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Save className="h-3.5 w-3.5 mr-1.5" /> Simpan ke Kelas
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Pilih Kelas Tujuan</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 py-4">
                    {classes.map(c => (
                      <Button key={c.id} variant="outline" className="w-full justify-start" onClick={handleSaveToClass}>
                        {c.name} - {c.subject}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Isometric Roadmap Visualization */}
          <Card className="gp-card border-border/60 overflow-hidden relative min-h-[500px] flex flex-col bg-background/50">
            <CardHeader className="border-b bg-muted/10 px-6 py-4 flex-row items-center justify-between z-10 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background"
                  disabled={activeWeek === 1} onClick={() => setActiveWeek(prev => prev - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-lg">Minggu {activeWeek}</CardTitle>
                <Button 
                  variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background"
                  disabled={activeWeek === MOCK_WEEKS.length} onClick={() => setActiveWeek(prev => prev + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Badge variant="outline" className="bg-background">
                Tema P5: {currentOutput.p5Theme}
              </Badge>
            </CardHeader>
            
            <CardContent className="flex-1 p-0 flex items-center justify-center relative overflow-hidden bg-dot-pattern">
              <div className="relative w-full h-[400px] flex items-center justify-center">
                {currentWeekData?.nodes.map((node, i) => {
                  const isTop = i % 2 === 0;
                  const xPos = (i * 20) + 10; // 10%, 30%, 50%, etc.
                  const yPos = isTop ? '30%' : '65%';
                  
                  return (
                    <div 
                      key={node.id} 
                      className="absolute group cursor-pointer transition-transform hover:scale-110 hover:z-20"
                      style={{ left: `${xPos}%`, top: yPos, transform: 'translate(-50%, -50%)' }}
                      onClick={() => setSelectedNode(node)}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap z-30 pointer-events-none">
                        Klik untuk detail
                      </div>

                      {/* Isometric SVG Circle */}
                      <IsometricCircle 
                        className="w-28 h-20 md:w-32 md:h-24" 
                        active={node.status === 'completed' || node.status === 'current'}
                        color={node.status === 'completed' ? '#4ade80' : node.status === 'current' ? '#60a5fa' : '#D9D9D9'}
                      />
                      
                      {/* Label over circle */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none drop-shadow-md">
                        <span className={cn("font-bold text-sm", node.status !== 'locked' ? 'text-white' : 'text-muted-foreground')}>
                          H{i + 1}
                        </span>
                      </div>

                      {/* Text below */}
                      <div className="absolute top-[110%] left-1/2 -translate-x-1/2 w-28 text-center">
                        <p className="font-bold text-sm bg-background/80 backdrop-blur-sm rounded px-1 inline-block">{node.day}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 bg-background/90 backdrop-blur-md rounded border px-1.5 py-0.5 shadow-sm">
                          {node.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* AI Chatbot Revision Tool */}
          <Card className="gp-card border-border/60">
            <CardHeader className="border-b bg-muted/10 px-6 py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Sesuaikan Roadmap dengan AI
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-[300px]">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={cn("flex gap-3 max-w-[80%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                      <Avatar className="h-8 w-8 border">
                        {msg.role === 'ai' ? <AvatarFallback className="bg-primary/20 text-primary"><Sparkles className="h-4 w-4"/></AvatarFallback> : <AvatarFallback>GU</AvatarFallback>}
                      </Avatar>
                      <div className={cn("p-3 rounded-xl text-sm", msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-3 border-t bg-muted/10">
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <Input 
                    value={chatMessage} 
                    onChange={e => setChatMessage(e.target.value)}
                    placeholder="Contoh: Tambahkan kuis di hari Rabu..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!chatMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail Side Sheet */}
      <Sheet open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0 flex flex-col border-l-border/50">
          {selectedNode && currentOutput && (
            <>
              <div className="p-6 bg-muted/20 border-b relative">
                <Badge variant="outline" className="mb-3 bg-background">Minggu {activeWeek}</Badge>
                <SheetHeader>
                  <SheetTitle className="text-2xl font-display">Hari {selectedNode.day}</SheetTitle>
                  <SheetDescription className="text-base text-foreground/80">{currentOutput.subject}</SheetDescription>
                </SheetHeader>
              </div>
              
              <div className="p-6 space-y-6 flex-1 bg-background">
                
                {/* Content Cards replicating the wireframe "Roadmap detail.jpg" */}
                <div className="space-y-4">
                  
                  {/* Modul Card */}
                  <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-500" /> Modul Pembelajaran
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Pendahuluan materi {selectedNode.label}. Siswa membaca modul ajar halaman 12-15 tentang konsep dasar.
                      </p>
                      <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-xs">Baca Modul Penuh <ArrowRight className="h-3 w-3 ml-1" /></Button>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Aktivitas Card */}
                    <Card className="border-border/60 shadow-sm">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Activity className="h-4 w-4 text-emerald-500" /> Aktivitas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                        Diskusi kelompok kecil memecahkan masalah kontekstual.
                      </CardContent>
                    </Card>

                    {/* P5 Card */}
                    <Card className="border-border/60 shadow-sm bg-primary/5 border-primary/20">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-primary">
                          <Sparkles className="h-4 w-4" /> Integrasi P5
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                        Observasi lingkungan sekolah terkait {currentOutput.p5Theme}.
                      </CardContent>
                    </Card>
                  </div>

                  {/* Asesmen Card */}
                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4 text-orange-500" /> Kuis Singkat
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                      5 Soal pilihan ganda untuk menguji pemahaman konsep awal.
                    </CardContent>
                  </Card>

                </div>
              </div>

              <div className="p-6 bg-muted/20 border-t flex justify-end gap-3 mt-auto">
                <Button variant="outline" onClick={() => setSelectedNode(null)}>Tutup</Button>
                <Button>Edit Detail</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* History Section (only show when not generating) */}
      {!isGenerating && history.length > 0 && !currentOutput && (
        <div className="pt-10 border-t mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-display font-semibold text-lg">Roadmap Tersimpan</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((h) => (
              <Card key={h.id} className="history-row hover:border-primary/30 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">{h.subject}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Kelas {h.grade} • {formatDateShort(h.createdAt)}
                    </p>
                    <Badge variant="secondary" className="mt-2 text-[10px] bg-muted">{h.p5Theme}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs">Buka</Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteHistory(h.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
