'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Copy, Check, Save, Clock, Trash2, ArrowRight, BookOpen, Activity, FileText, Send, ChevronRight, ChevronLeft, Lightbulb } from 'lucide-react';
import Markdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

// Form steps configuration
const FORM_STEPS = [
  {
    id: 'subject',
    title: 'Mata Pelajaran',
    description: 'Pilih mata pelajaran yang ingin Anda rancang roadmap-nya',
    icon: BookOpen,
  },
  {
    id: 'grade',
    title: 'Kelas & Semester',
    description: 'Tentukan jenjang kelas dan semester',
    icon: Activity,
  },
  {
    id: 'duration',
    title: 'Durasi Pembelajaran',
    description: 'Berapa minggu durasi pembelajaran yang diinginkan?',
    icon: Clock,
  },
  {
    id: 'p5',
    title: 'Tema P5',
    description: 'Pilih tema Projek Penguatan Profil Pelajar Pancasila',
    icon: Sparkles,
  },
  {
    id: 'quiz',
    title: 'Quiz & Asesmen',
    description: 'Apakah Anda ingin menyertakan quiz dalam roadmap?',
    icon: FileText,
  },
];

const SUBJECTS = [
  'Biologi', 'Fisika', 'Kimia', 'Matematika', 'Informatika',
  'Ekonomi', 'Geografi', 'Sejarah', 'Sosiologi', 'PKN',
  'Bahasa Indonesia', 'Bahasa Inggris', 'Seni Budaya', 'Penjaskes'
];

const GRADES = ['X', 'XI', 'XII'];
const SEMESTERS = ['Ganjil', 'Genap'];
const DURATIONS = [2, 4, 6, 8, 12];
const P5_THEMES = [
  'Gaya Hidup Berkelanjutan',
  'Kearifan Lokal',
  'Bhinneka Tunggal Ika',
  'Bangunlah Jiwa dan Raganya',
  'Suara Demokrasi',
  'Kewirausahaan',
];

const MOCK_WEEKS_TEMPLATE: { day: string; label: string; status: 'completed' | 'current' | 'locked' }[] = [
  { day: 'Senin', label: 'Pengantar & Konsep', status: 'completed' },
  { day: 'Selasa', label: 'Eksplorasi Materi', status: 'current' },
  { day: 'Rabu', label: 'Aktivitas Kelompok', status: 'locked' },
  { day: 'Kamis', label: 'Presentasi P5', status: 'locked' },
  { day: 'Jumat', label: 'Kuis & Refleksi', status: 'locked' },
];

const MOCK_WEEKS_LABELS = [
  'Materi Lanjutan',
  'Studi Kasus',
  'Praktikum',
  'Evaluasi P5',
  'Asesmen Sumatif',
  'Proyek Kreatif',
  'Penyusunan Laporan',
  'Presentasi Akhir',
  'Refleksi & Umpan Balik',
  'Persiapan Ujian',
  'Review Materi',
  'Tugas Akhir',
];

function generateWeeks(durationWeeks: number) {
  const weeks = [];
  for (let i = 1; i <= durationWeeks; i++) {
    weeks.push({
      week: i,
      nodes: MOCK_WEEKS_TEMPLATE.map((tpl, idx) => ({
        id: `w${i}-d${idx + 1}`,
        day: tpl.day,
        label: i === 1 ? tpl.label : MOCK_WEEKS_LABELS[(i - 2) % MOCK_WEEKS_LABELS.length],
        status: i === 1 && idx === 0 ? 'completed' as const : i === 1 && idx === 1 ? 'current' as const : 'locked' as const,
      })),
    });
  }
  return weeks;
}

function RoadmapPlannerContent() {
  const searchParams = useSearchParams();
  const roadmapId = searchParams.get('id');
  
  const { generateOutput, currentOutput, isGenerating, history, clearCurrent, deleteHistory, setCurrentOutput } = usePlannerStore();
  const { classes, linkAIOutput } = useClassStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PlannerFormValues>({
    subject: '',
    grade: '',
    semester: '',
    cp: '',
    p5Theme: '',
    durationWeeks: 4,
    enableP5Integration: true,
    enableQuiz: true,
  });

  const [activeWeek, setActiveWeek] = useState(1);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: 'Halo! Saya AI Assistant Anda. Ada yang ingin diubah atau ditambahkan pada roadmap ini?' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [mockWeeks, setMockWeeks] = useState(() => generateWeeks(formData.durationWeeks));

  useEffect(() => {
    setMockWeeks(generateWeeks(formData.durationWeeks));
  }, [formData.durationWeeks]);

  // Load roadmap from history if id is provided
  useEffect(() => {
    if (roadmapId) {
      const roadmap = history.find(h => h.id === roadmapId);
      if (roadmap) {
        setCurrentOutput(roadmap);
      }
    }
  }, [roadmapId, history, setCurrentOutput]);

  useGSAP(() => {
    animations.fadeInUp('.roadmap-header', 0);
    animations.fadeInUp('.prompt-card', 0.1);
    animations.staggerFadeIn('.template-card', 0.2);
    if (currentOutput) {
      animations.staggerFadeIn('.roadmap-node', 0.1);
    }
  }, { scope: containerRef, dependencies: [currentOutput, activeWeek] });

  const updateFormData = (field: keyof PlannerFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGenerate = async () => {
    // Build CP (Capaian Pembelajaran) from subject and grade
    const cpText = `Peserta didik mampu memahami dan menerapkan konsep ${formData.subject} kelas ${formData.grade} dalam konteks kehidupan sehari-hari.`;
    
    const params: PlannerFormValues = {
      ...formData,
      cp: cpText,
    };

    try {
      await generateOutput(params);
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

  const handleSaveToClass = (classId: string) => {
    if (currentOutput) {
      linkAIOutput(classId, currentOutput.id);
      toast.success('Roadmap berhasil disimpan dan diterapkan ke kelas!');
    }
  };

  const currentWeekData = mockWeeks.find(w => w.week === activeWeek);
  const isLastStep = currentStep === FORM_STEPS.length - 1;
  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.subject !== '';
      case 1: return formData.grade !== '' && formData.semester !== '';
      case 2: return formData.durationWeeks > 0;
      case 3: return formData.p5Theme !== '';
      case 4: return true; // Quiz step always valid
      default: return true;
    }
  };

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto space-y-8">
      
      {/* State 1: Multi-Step Form Interface */}
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
              Jawab pertanyaan berikut untuk membuat roadmap pembelajaran yang terstruktur.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              {FORM_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full transition-all",
                      isActive && "bg-[var(--gp-action)] text-white scale-110",
                      isCompleted && "bg-[var(--gp-action-light)] text-[var(--gp-action)]",
                      !isActive && !isCompleted && "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    {index < FORM_STEPS.length - 1 && (
                      <div className={cn(
                        "w-12 h-1 mx-2 rounded-full",
                        index < currentStep ? "bg-[var(--gp-action)]" : "bg-muted"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Form Card */}
            <Card className="gp-card border-border/60">
              <CardHeader className="border-b bg-muted/10">
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const Icon = FORM_STEPS[currentStep].icon;
                    return <Icon className="h-5 w-5 text-primary" />;
                  })()}
                  {FORM_STEPS[currentStep].title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{FORM_STEPS[currentStep].description}</p>
              </CardHeader>
              <CardContent className="p-6">
                {/* Step 0: Subject */}
                {currentStep === 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SUBJECTS.map(subject => (
                      <button
                        key={subject}
                        onClick={() => updateFormData('subject', subject)}
                        className={cn(
                          "p-3 rounded-lg border text-left transition-all hover:border-[var(--gp-border-focus)]",
                          formData.subject === subject 
                            ? "border-[var(--gp-border-focus)] bg-[var(--gp-action-light)] text-[var(--gp-action)]" 
                            : "border-border hover:bg-muted/50"
                        )}
                      >
                        <span className="text-sm font-medium">{subject}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 1: Grade & Semester */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Kelas</Label>
                      <div className="flex gap-3">
                        {GRADES.map(grade => (
                          <button
                            key={grade}
                            onClick={() => updateFormData('grade', grade)}
                            className={cn(
                              "flex-1 p-4 rounded-lg border text-center transition-all hover:border-[var(--gp-border-focus)]",
                              formData.grade === grade 
                                ? "border-[var(--gp-border-focus)] bg-[var(--gp-action-light)] text-[var(--gp-action)]" 
                                : "border-border hover:bg-muted/50"
                            )}
                          >
                            <span className="text-lg font-bold">{grade}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Semester</Label>
                      <div className="flex gap-3">
                        {SEMESTERS.map(semester => (
                          <button
                            key={semester}
                            onClick={() => updateFormData('semester', semester)}
                            className={cn(
                              "flex-1 p-4 rounded-lg border text-center transition-all hover:border-[var(--gp-border-focus)]",
                              formData.semester === semester 
                                ? "border-[var(--gp-border-focus)] bg-[var(--gp-action-light)] text-[var(--gp-action)]" 
                                : "border-border hover:bg-muted/50"
                            )}
                          >
                            <span className="text-sm font-medium">{semester}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Duration */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Durasi Pembelajaran (Minggu)</Label>
                    <div className="flex gap-3 flex-wrap">
                      {DURATIONS.map(duration => (
                        <button
                          key={duration}
                          onClick={() => updateFormData('durationWeeks', duration)}
                          className={cn(
                            "px-6 py-4 rounded-lg border text-center transition-all hover:border-primary/50 min-w-[100px]",
                            formData.durationWeeks === duration 
                              ? "border-primary bg-primary/10 text-primary" 
                              : "border-border hover:bg-muted/50"
                          )}
                        >
                          <span className="text-2xl font-bold">{duration}</span>
                          <span className="text-sm block text-muted-foreground">minggu</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Durasi akan menentukan jumlah minggu dalam roadmap pembelajaran.
                    </p>
                  </div>
                )}

                {/* Step 3: P5 Theme */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Tema P5</Label>
                    <RadioGroup 
                      value={formData.p5Theme} 
                      onValueChange={(value) => updateFormData('p5Theme', value)}
                      className="space-y-3"
                    >
                      {P5_THEMES.map(theme => (
                        <div key={theme} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value={theme} id={theme} />
                          <Label htmlFor={theme} className="flex-1 cursor-pointer">{theme}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <div className="pt-2">
                      <Label className="text-sm font-medium mb-2 block">Atau masukkan tema sendiri</Label>
                      <Input
                        placeholder="Tema P5 custom..."
                        value={formData.p5Theme && !P5_THEMES.includes(formData.p5Theme) ? formData.p5Theme : ''}
                        onChange={(e) => updateFormData('p5Theme', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Quiz */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Quiz & Asesmen</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => updateFormData('enableQuiz', true)}
                        className={cn(
                          "p-6 rounded-lg border text-left transition-all hover:border-primary/50",
                          formData.enableQuiz 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Check className={cn("h-5 w-5", formData.enableQuiz ? "text-primary" : "text-muted-foreground")} />
                          <span className="font-medium">Ya, sertakan quiz</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          AI akan membuat quiz formatif dan asesmen untuk setiap topik.
                        </p>
                      </button>
                      <button
                        onClick={() => updateFormData('enableQuiz', false)}
                        className={cn(
                          "p-6 rounded-lg border text-left transition-all hover:border-primary/50",
                          !formData.enableQuiz 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Check className={cn("h-5 w-5", !formData.enableQuiz ? "text-primary" : "text-muted-foreground")} />
                          <span className="font-medium">Tidak perlu quiz</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Roadmap hanya berisi materi dan aktivitas pembelajaran.
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Kembali
                  </Button>
                  
                  {isLastStep ? (
                    <Button 
                      onClick={handleGenerate}
                      disabled={!canProceed()}
                      className="bg-[var(--gp-action)] hover:bg-[var(--gp-action-hover)] px-6"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Roadmap
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="bg-[var(--gp-action)] hover:bg-[var(--gp-action-hover)]"
                    >
                      Selanjutnya
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
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
              <Button variant="outline" size="sm" onClick={clearCurrent} className="text-[var(--gp-action)] hover:text-[var(--gp-action-hover)]">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Buat Baru
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-[var(--gp-action)] hover:bg-[var(--gp-action-hover)]">
                    <Save className="h-3.5 w-3.5 mr-1.5" /> Simpan ke Kelas
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Pilih Kelas Tujuan</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 py-4">
                    {classes.map(c => (
                      <Button key={c.id} variant="outline" className="w-full justify-start" onClick={() => handleSaveToClass(c.id)}>
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
                  disabled={activeWeek === mockWeeks.length} onClick={() => setActiveWeek(prev => prev + 1)}
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
                {/* Connecting Lines SVG - behind nodes */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                  {currentWeekData?.nodes.slice(0, -1).map((node, i) => {
                    const isTop1 = i % 2 === 0;
                    const isTop2 = (i + 1) % 2 === 0;
                    const x1 = (i * 20) + 10;
                    const x2 = ((i + 1) * 20) + 10;
                    const y1 = isTop1 ? 30 : 65;
                    const y2 = isTop2 ? 30 : 65;
                    const nextNode = currentWeekData.nodes[i + 1];
                    const lineColor = node.status === 'completed' ? '#22c55e' : '#e5e7eb';
                    return (
                      <line
                        key={`line-${i}`}
                        x1={`${x1}%`} y1={`${y1}%`}
                        x2={`${x2}%`} y2={`${y2}%`}
                        stroke={lineColor}
                        strokeWidth="2"
                        strokeDasharray={nextNode.status === 'locked' ? '6 4' : 'none'}
                      />
                    );
                  })}
                </svg>

                {/* Nodes */}
                {currentWeekData?.nodes.map((node, i) => {
                  const isTop = i % 2 === 0;
                  const xPos = (i * 20) + 10; // 10%, 30%, 50%, etc.
                  const yPos = isTop ? '30%' : '65%';
                  
                  return (
                    <div 
                      key={node.id} 
                      className="absolute group cursor-pointer transition-transform hover:scale-110 hover:z-20"
                      style={{ left: `${xPos}%`, top: yPos, transform: 'translate(-50%, -50%)', zIndex: 10 }}
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

          {/* AI Output Content */}
          <Card className="gp-card border-border/60">
            <CardHeader className="border-b bg-muted/10 px-6 py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Detail Output AI
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="modulAjar" className="w-full">
                <TabsList variant="line" className="w-full justify-start px-6 h-10 border-b">
                  <TabsTrigger value="modulAjar" className="text-xs data-[state=active]:text-[var(--gp-action)]">Modul Ajar</TabsTrigger>
                  <TabsTrigger value="alurPembelajaran" className="text-xs data-[state=active]:text-[var(--gp-action)]">Alur Pembelajaran</TabsTrigger>
                  <TabsTrigger value="aktivitasBelajar" className="text-xs data-[state=active]:text-[var(--gp-action)]">Aktivitas</TabsTrigger>
                  <TabsTrigger value="quizAsesmen" className="text-xs data-[state=active]:text-[var(--gp-action)]">Quiz</TabsTrigger>
                  <TabsTrigger value="rubrikPenilaian" className="text-xs data-[state=active]:text-[var(--gp-action)]">Rubrik</TabsTrigger>
                  <TabsTrigger value="ideIntegrationP5" className="text-xs data-[state=active]:text-[var(--gp-action)]">Ide P5</TabsTrigger>
                </TabsList>
                {['modulAjar', 'alurPembelajaran', 'aktivitasBelajar', 'quizAsesmen', 'rubrikPenilaian', 'ideIntegrationP5'].map((key) => (
                  <TabsContent key={key} value={key} className="p-6">
                    <div className="flex justify-end mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-[var(--gp-action)] hover:text-[var(--gp-action-hover)] hover:border-[var(--gp-border-focus)]"
                        onClick={() => {
                          navigator.clipboard.writeText(currentOutput.output[key as keyof typeof currentOutput.output]);
                          toast.success('Berhasil disalin ke clipboard!');
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" /> Salin
                      </Button>
                    </div>
                    <div className="prose prose-sm prose-greenpath max-w-none">
                      <Markdown>{currentOutput.output[key as keyof typeof currentOutput.output]}</Markdown>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
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
              <Card key={h.id} className="gp-card history-row hover:border-[var(--gp-border-focus)] transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">{h.subject}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Kelas {h.grade} • {formatDateShort(h.createdAt)}
                    </p>
                    <Badge variant="secondary" className="mt-2 text-[10px] bg-muted">{h.p5Theme}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs text-[var(--gp-action)] hover:text-[var(--gp-action-hover)]" onClick={() => { setCurrentOutput(h); }}>Buka</Button>
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

// Wrap in Suspense boundary for useSearchParams
export default function RoadmapPlannerPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><p className="text-muted-foreground">Loading...</p></div>}>
      <RoadmapPlannerContent />
    </Suspense>
  );
}
