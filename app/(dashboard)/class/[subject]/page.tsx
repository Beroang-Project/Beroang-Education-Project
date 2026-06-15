'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Plus, FileText, Video, Link as LinkIcon, Sparkles,
  BookOpen, ClipboardList, HelpCircle, Clock, AlertCircle,
  Search, ArrowRight, ArrowLeft, Check, Trash2, Eye,
  ChevronRight, TrendingUp, Users, Target, Zap, MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useClassStore } from '@/store/classStore';
import { usePlannerStore } from '@/store/plannerStore';
import { formatDateShort, isDeadlinePassed, cn } from '@/lib/utils';
import { useGSAP, animations, gsap } from '@/lib/gsap-config';
import { FOLDER_COLORS, getDefaultFolderColor } from '@/components/ui/mac-folder-card';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────
type FilterType = 'semua' | 'materi' | 'tugas' | 'kuis';

interface ContentItem {
  id: string;
  type: 'materi' | 'tugas' | 'kuis';
  name: string;
  desc: string;
  date: string;
  icon: 'link' | 'video' | 'pdf' | 'clipboard' | 'help';
  isPassed?: boolean;
  submissionCount?: number;
  totalStudents?: number;
}

const ICON_MAP = {
  link: LinkIcon,
  video: Video,
  pdf: FileText,
  clipboard: ClipboardList,
  help: HelpCircle,
};

// ── Roadmap Steps ──────────────────────────────────────────────────────────────
const ROADMAP_STEPS = [
  { week: 'Minggu 1', name: 'Pengantar & Observasi' },
  { week: 'Minggu 2', name: 'Struktur Dasar' },
  { week: 'Minggu 3', name: 'Proses & Mekanisme' },
  { week: 'Minggu 4', name: 'Eksperimen Lanjut' },
  { week: 'Minggu 5', name: 'Jaringan & Sistem' },
  { week: 'Minggu 6', name: 'Analisis & Evaluasi' },
  { week: 'Minggu 7', name: 'Ekosistem & Integrasi' },
  { week: 'Minggu 8', name: 'Presentasi P5' },
];

// ── Content Card ──────────────────────────────────────────────────────────────
function ContentCard({ item }: { item: ContentItem }) {
  const Icon = ICON_MAP[item.icon] || FileText;

  const typeConfig = {
    materi: {
      bg: '#EEF3E9', text: '#3A5C2A', label: 'Materi',
      iconBg: '#D6EDD0', badge: 'bg-[#EEF3E9] text-[#3A5C2A]',
    },
    tugas: {
      bg: '#FEF3C7', text: '#92400E', label: 'Tugas',
      iconBg: '#FDE68A', badge: 'bg-[#FEF3C7] text-[#92400E]',
    },
    kuis: {
      bg: '#EDE9FE', text: '#5B21B6', label: 'Kuis',
      iconBg: '#DDD6FE', badge: 'bg-[#EDE9FE] text-[#5B21B6]',
    },
  }[item.type];

  return (
    <div className="content-row group flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-accent/40 transition-colors">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
        style={{ backgroundColor: typeConfig.iconBg }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color: typeConfig.text }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold text-foreground truncate leading-snug">{item.name}</div>
        <div className="text-[12px] text-muted-foreground truncate mt-0.5">{item.desc}</div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {item.isPassed && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500">Lewat</span>
        )}
        <span className={cn('text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full', typeConfig.badge)}>
          {typeConfig.label}
        </span>
        <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{item.date}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ClassPage() {
  const params = useParams();
  const router = useRouter();
  const subjectName = decodeURIComponent(params.subject as string);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    classes, getMaterialsByClass, getAssignmentsByClass,
    getQuizzesByClass, getStudentsByClass,
    addMaterial, addMaterialsFromAI, addAssignment,
    deleteMaterial,
  } = useClassStore();
  const { history } = usePlannerStore();

  const cls = classes.find(c => c.subject === subjectName);
  const classId = cls?.id || '';

  const materials = classId ? getMaterialsByClass(classId) : [];
  const assignments = classId ? getAssignmentsByClass(classId) : [];
  const quizzes = classId ? getQuizzesByClass(classId) : [];
  const students = classId ? getStudentsByClass(classId) : [];

  const folderColorObj = cls?.folderColor
    ? FOLDER_COLORS.find(c => c.value === cls.folderColor) || getDefaultFolderColor(cls?.subject || '')
    : getDefaultFolderColor(cls?.subject || '');
  const themeColor = folderColorObj.text;
  const themeBg = folderColorObj.value;

  const [filter, setFilter] = useState<FilterType>('semua');
  const [search, setSearch] = useState('');
  const [matOpen, setMatOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const aiOutput = history.find(h => h.id === cls?.aiPlannerOutputId);
  const hasAI = !!aiOutput;

  const totalTopics = ROADMAP_STEPS.length;
  const doneTopics = Math.min(materials.length, totalTopics);
  const progressPct = Math.round((doneTopics / totalTopics) * 100);

  useGSAP(() => {
    if (!mounted) return;
    animations.fadeInUp('.hero-content', 0.1);
    gsap.fromTo('.progress-bar-fill',
      { width: '0%' },
      { width: `${progressPct}%`, duration: 1.2, delay: 0.4, ease: 'power3.out' }
    );
    gsap.fromTo('.roadmap-step',
      { opacity: 0, x: -12 },
      { opacity: 1, x: 0, duration: 0.45, stagger: 0.07, delay: 0.3, ease: 'back.out(1.2)' }
    );
    animations.staggerFadeIn('.content-row', 0.5);
  }, { scope: containerRef, dependencies: [progressPct, mounted] });

  // Build content items
  const allItems: ContentItem[] = useMemo(() => [
    ...materials.map((m): ContentItem => ({
      id: m.id, type: 'materi', name: m.title, desc: m.description,
      date: formatDateShort(m.createdAt),
      icon: m.type === 'video' ? 'video' : m.type === 'link' ? 'link' : 'pdf',
    })),
    ...assignments.map((a): ContentItem => ({
      id: a.id, type: 'tugas', name: a.title, desc: a.instructions,
      date: formatDateShort(a.deadline), icon: 'clipboard',
      isPassed: isDeadlinePassed(a.deadline),
      submissionCount: Object.values(a.submissions).filter(Boolean).length,
      totalStudents: students.length,
    })),
    ...quizzes.map((q): ContentItem => ({
      id: q.id, type: 'kuis', name: q.title,
      desc: `${q.questions.length} soal · ${q.durationMinutes} menit`,
      date: formatDateShort(new Date().toISOString()), icon: 'help',
    })),
  ], [materials, assignments, quizzes, students]);

  const filteredItems = useMemo(() =>
    allItems.filter(item => {
      const matchFilter = filter === 'semua' || item.type === filter;
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    }),
    [allItems, filter, search]
  );

  const getRoadmapStatus = (idx: number): 'done' | 'active' | 'upcoming' => {
    if (idx < doneTopics) return 'done';
    if (idx === doneTopics) return 'active';
    return 'upcoming';
  };

  const handleAIMaterials = () => {
    if (!aiOutput) return;
    addMaterialsFromAI(classId, [
      { classId, title: `Modul Ajar ${aiOutput.subject} Kelas ${aiOutput.grade}`, description: aiOutput.output.modulAjar.substring(0, 120) + '...', type: 'pdf', url: '#', fromAI: true },
      { classId, title: `Aktivitas Belajar — ${aiOutput.subject}`, description: aiOutput.output.aktivitasBelajar.substring(0, 120) + '...', type: 'link', url: '#', fromAI: true },
      { classId, title: `Quiz & Asesmen ${aiOutput.subject}`, description: aiOutput.output.quizAsesmen.substring(0, 120) + '...', type: 'pdf', url: '#', fromAI: true },
    ]);
    toast.success('3 materi dari AI berhasil ditambahkan!');
  };

  if (!mounted) return null;

  if (!cls) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <BookOpen className="w-12 h-12 opacity-20 mx-auto mb-3" />
        <p className="font-medium mb-2">Kelas tidak ditemukan</p>
        <Link href="/class" className="text-primary text-sm hover:underline">
          ← Kembali ke Smart Learning Space
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen -mx-6 -mt-6 bg-background">

      {/* ── HERO ── */}
      <div
        className="relative overflow-hidden px-6 md:px-10 pt-8 pb-0"
        style={{ background: `linear-gradient(135deg, ${themeBg} 0%, ${themeBg}CC 100%)` }}
      >
        {/* subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* big decorative circle */}
        <div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${themeColor}18, transparent 70%)` }}
        />

        <div className="hero-content relative z-10">
          {/* Back button */}
          <button
            onClick={() => router.push('/class')}
            className="flex items-center gap-1.5 text-xs font-semibold mb-5 transition-opacity hover:opacity-70"
            style={{ color: themeColor }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Smart Learning Space
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8">
            {/* Left: Title + Meta */}
            <div className="flex-1">
              <div
                className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase rounded-full px-3 py-1 mb-4 border"
                style={{ color: themeColor, backgroundColor: `${themeColor}15`, borderColor: `${themeColor}30` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                {cls.name}
              </div>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-[1.1] tracking-tight mb-4"
                style={{ color: themeColor }}
              >
                {cls.subject}
              </h1>

              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-[13px] mb-6" style={{ color: themeColor, opacity: 0.75 }}>
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{students.length} Siswa</span>
                <span className="w-1 h-1 rounded-full opacity-40" style={{ backgroundColor: themeColor }} />
                <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" />{ROADMAP_STEPS.length} Topik</span>
                <span className="w-1 h-1 rounded-full opacity-40" style={{ backgroundColor: themeColor }} />
                <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />{materials.length} Materi</span>
                <span className="w-1 h-1 rounded-full opacity-40" style={{ backgroundColor: themeColor }} />
                <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" />{progressPct}% progress</span>
              </div>

              {/* Stat mini-cards */}
              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { label: 'Topik', value: `${doneTopics}/${totalTopics}`, icon: Target },
                  { label: 'Materi', value: materials.length, icon: BookOpen },
                  { label: 'Tugas', value: assignments.length, icon: ClipboardList },
                  { label: 'Kuis', value: quizzes.length, icon: HelpCircle },
                ].map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-xl px-4 py-3 min-w-[88px] border backdrop-blur-sm"
                    style={{ backgroundColor: `${themeColor}0D`, borderColor: `${themeColor}20` }}
                  >
                    <div className="text-2xl font-bold mb-0.5" style={{ color: themeColor }}>{value}</div>
                    <div className="flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase" style={{ color: themeColor, opacity: 0.65 }}>
                      <Icon className="w-3 h-3" />
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: AI Card */}
            <div className="shrink-0 lg:w-64">
              <button
                onClick={hasAI ? handleAIMaterials : () => toast.info('Buat rencana belajar di AI Planner terlebih dahulu.')}
                className="w-full text-left rounded-2xl p-5 border transition-all hover:scale-[1.02] hover:shadow-lg"
                style={{ backgroundColor: `${themeColor}12`, borderColor: `${themeColor}25` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${themeColor}22` }}>
                    <Sparkles className="w-3.5 h-3.5" style={{ color: themeColor }} />
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: themeColor }}>AI Planner</span>
                  {hasAI && <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${themeColor}25`, color: themeColor }}>Aktif</span>}
                </div>
                <div className="text-[15px] font-bold leading-snug mb-2" style={{ color: themeColor }}>
                  {hasAI ? 'Gunakan Rekomendasi AI' : 'Buat Rencana Belajar'}
                </div>
                <p className="text-[11px] leading-relaxed mb-4" style={{ color: themeColor, opacity: 0.75 }}>
                  {hasAI
                    ? `Tambahkan modul ${aiOutput?.subject} kelas ${aiOutput?.grade} secara otomatis`
                    : 'Jadwal & materi otomatis berdasarkan kurikulum Anda'}
                </p>
                <div className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: themeColor }}>
                  Mulai <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>

          {/* Progress bar strip */}
          <div
            className="flex items-center gap-4 py-3 border-t text-[12px]"
            style={{ borderColor: `${themeColor}25`, color: themeColor }}
          >
            <span className="font-semibold shrink-0">{doneTopics} dari {totalTopics} topik</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${themeColor}25` }}>
              <div className="progress-bar-fill h-full rounded-full" style={{ width: '0%', backgroundColor: themeColor }} />
            </div>
            <span className="font-bold shrink-0">{progressPct}%</span>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="px-6 md:px-10 py-8 space-y-10">

        {/* ── ROADMAP ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[16px] font-bold text-foreground tracking-tight">Roadmap Pembelajaran</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">Progres topik per minggu</p>
            </div>
            <button className="text-[12px] font-semibold text-[#1F7D47] hover:text-[#145C32] transition-colors flex items-center gap-1">
              Lihat detail <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 overflow-x-auto">
            <div className="flex items-start gap-0 min-w-max">
              {ROADMAP_STEPS.map((step, idx) => {
                const status = getRoadmapStatus(idx);
                const isLast = idx === ROADMAP_STEPS.length - 1;
                return (
                  <div key={idx} className="flex items-start">
                    <div className="roadmap-step flex flex-col items-center cursor-pointer group">
                      <div className={cn(
                        'w-11 h-11 flex items-center justify-center text-sm font-bold relative transition-transform group-hover:scale-110 select-none rounded-full',
                        status === 'done' ? 'bg-[#1F7D47] text-white shadow-sm shadow-green-200' :
                        status === 'active' ? 'ring-2 ring-offset-2 text-white rounded-2xl' : 'bg-muted text-muted-foreground',
                      )}
                      style={status === 'active' ? { backgroundColor: themeColor, ringColor: themeColor } : {}}
                      >
                        {status === 'done' ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div className="mt-3 text-center w-[76px]">
                        <span className="block text-[10px] font-semibold text-muted-foreground mb-0.5">{step.week}</span>
                        <span className={cn('block text-[11px] font-bold leading-tight', status === 'active' ? 'text-foreground' : 'text-muted-foreground')}>
                          {step.name}
                        </span>
                      </div>
                    </div>
                    {!isLast && (
                      <div className="flex items-center h-11 w-8 shrink-0 mt-0">
                        <div className={cn('h-0.5 w-full', status === 'done' ? 'bg-[#1F7D47]' : 'bg-border')} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CONTENT LIST ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[16px] font-bold text-foreground tracking-tight">Konten Kelas</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">{allItems.length} item · Materi, Tugas & Kuis</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMatOpen(true)}
                className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#1F7D47] text-white text-[13px] font-semibold hover:bg-[#145C32] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Materi
              </button>
              <button
                onClick={() => setAssignOpen(true)}
                className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-card border border-border text-muted-foreground text-[13px] font-semibold hover:border-[#4DB87A] hover:text-[#1F7D47] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Tugas
              </button>
            </div>
          </div>

          {/* Toolbar: search + filter */}
          <div className="flex items-center gap-2.5 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari konten..."
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-card text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-[#4DB87A] transition-colors"
              />
            </div>
            <div className="flex gap-1.5">
              {(['semua', 'materi', 'tugas', 'kuis'] as FilterType[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={cn(
                    'h-9 px-4 rounded-lg text-[13px] font-semibold transition-all border',
                    filter === tab
                      ? 'border-[#4DB87A] text-[#1F7D47] bg-[#EEF3E9]'
                      : 'border-border text-muted-foreground bg-card hover:bg-accent/50'
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 border border-dashed border-border rounded-2xl text-muted-foreground gap-3">
              <BookOpen className="w-10 h-10 opacity-20" />
              <p className="text-sm font-medium">
                {search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada konten di kategori ini'}
              </p>
              {!search && (
                <button
                  onClick={() => setMatOpen(true)}
                  className="text-[13px] font-semibold text-[#1F7D47] hover:underline"
                >
                  + Tambah materi pertama
                </button>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
              {filteredItems.map(item => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── ADD MATERIAL DIALOG ── */}
      <Dialog open={matOpen} onOpenChange={setMatOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#1F7D47]" /> Tambah Materi Baru
            </DialogTitle>
          </DialogHeader>
          <AddMaterialForm classId={classId} onSuccess={() => { setMatOpen(false); toast.success('Materi ditambahkan!'); }} />
        </DialogContent>
      </Dialog>

      {/* ── ADD ASSIGNMENT DIALOG ── */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-amber-500" /> Buat Tugas Baru
            </DialogTitle>
          </DialogHeader>
          <AddAssignmentForm classId={classId} students={students} onSuccess={() => { setAssignOpen(false); toast.success('Tugas dibuat!'); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Forms ─────────────────────────────────────────────────────────────────────
function AddMaterialForm({ classId, onSuccess }: { classId: string; onSuccess: () => void }) {
  const { addMaterial } = useClassStore();
  const { register, handleSubmit } = useForm({
    defaultValues: { title: '', description: '', type: 'pdf' as const, url: '#' },
  });
  const onSubmit = (data: any) => { addMaterial({ ...data, classId, fromAI: false }); onSuccess(); };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      <div className="space-y-1.5"><Label>Judul</Label><Input {...register('title')} placeholder="Judul materi..." /></div>
      <div className="space-y-1.5"><Label>Deskripsi</Label><Textarea {...register('description')} placeholder="Deskripsi singkat..." className="min-h-[60px]" /></div>
      <div className="space-y-1.5">
        <Label>Tipe</Label>
        <select {...register('type')} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
          <option value="pdf">PDF</option><option value="video">Video</option><option value="link">Tautan</option>
        </select>
      </div>
      <div className="space-y-1.5"><Label>URL / Link</Label><Input {...register('url')} placeholder="https://..." /></div>
      <Button type="submit" className="w-full bg-[#1F7D47] hover:bg-[#145C32]">Tambah Materi</Button>
    </form>
  );
}

function AddAssignmentForm({ classId, students, onSuccess }: { classId: string; students: any[]; onSuccess: () => void }) {
  const { addAssignment } = useClassStore();
  const { register, handleSubmit } = useForm({
    defaultValues: { title: '', instructions: '', deadline: '', weight: 20 },
  });
  const onSubmit = (data: any) => {
    const subs = Object.fromEntries(students.map(s => [s.id, false]));
    addAssignment({ ...data, classId, submissions: subs, fromAI: false, weight: Number(data.weight) });
    onSuccess();
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      <div className="space-y-1.5"><Label>Judul Tugas</Label><Input {...register('title')} placeholder="Nama tugas..." /></div>
      <div className="space-y-1.5"><Label>Instruksi</Label><Textarea {...register('instructions')} placeholder="Instruksi lengkap..." className="min-h-[80px]" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Deadline</Label><Input type="date" {...register('deadline')} /></div>
        <div className="space-y-1.5"><Label>Bobot (%)</Label><Input type="number" {...register('weight')} min={1} max={100} /></div>
      </div>
      <Button type="submit" className="w-full">Buat Tugas</Button>
    </form>
  );
}
