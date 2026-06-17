'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Plus, FileText, Video, Link as LinkIcon, Sparkles,
  BookOpen, ClipboardList, HelpCircle, Clock,
  Search, ArrowRight, ArrowLeft, Check, Trash2,
  ChevronRight, TrendingUp, Users, Target, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useClassStore } from '@/store/classStore';
import { usePlannerStore } from '@/store/plannerStore';
import { formatDateShort, isDeadlinePassed, cn } from '@/lib/utils';
import { useGSAP, animations, gsap } from '@/lib/gsap-config';
import { FOLDER_COLORS, getDefaultFolderColor } from '@/components/ui/mac-folder-card';
import Link from 'next/link';

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
  rawType?: string;
  rawUrl?: string;
}

const ICON_MAP = {
  link: LinkIcon,
  video: Video,
  pdf: FileText,
  clipboard: ClipboardList,
  help: HelpCircle,
};

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

function ContentCard({ item, onDelete }: { item: ContentItem; onDelete?: (id: string, type: string) => void }) {
  const Icon = ICON_MAP[item.icon] || FileText;

  const typeConfig = {
    materi: {
      bg: 'bg-primary/10', text: 'text-primary', label: 'Materi',
      iconBg: 'bg-primary/20',
    },
    tugas: {
      bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Tugas',
      iconBg: 'bg-amber-500/20',
    },
    kuis: {
      bg: 'bg-violet-500/10', text: 'text-violet-600', label: 'Kuis',
      iconBg: 'bg-violet-500/20',
    },
  }[item.type];

  return (
    <div className="content-row group flex items-center gap-4 px-5 py-4 hover:bg-accent/40 transition-colors">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", typeConfig.iconBg)}>
        <Icon className={cn("w-4.5 h-4.5", typeConfig.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold text-foreground truncate leading-snug">{item.name}</div>
        <div className="text-[12px] text-muted-foreground truncate mt-0.5">{item.desc}</div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {item.isPassed && (
          <Badge variant="destructive" className="text-[10px] font-bold px-2 py-0.5">Lewat</Badge>
        )}
        <Badge variant="secondary" className={cn('text-[10px] font-bold tracking-wider', typeConfig.bg, typeConfig.text)}>
          {typeConfig.label}
        </Badge>
        <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{item.date}</span>
        </div>
        {onDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-7 w-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => onDelete(item.id, item.type)}
                className="gap-2 text-xs cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3 w-3" /> Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

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
    addMaterial, addMaterialsFromAI, addAssignment, addQuiz,
    deleteMaterial, deleteAssignment, deleteQuiz,
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
  const [quizOpen, setQuizOpen] = useState(false);

  const aiOutput = history.find(h => h.id === cls?.aiPlannerOutputId);
  const hasAI = !!aiOutput;

  const totalTopics = ROADMAP_STEPS.length;
  const doneTopics = Math.min(materials.length, totalTopics);
  const progressPct = Math.round((doneTopics / totalTopics) * 100);

  useGSAP(() => {
    if (!mounted) return;
    animations.fadeInUp('.hero-content', 0.1);
    gsap.fromTo('.ai-banner',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: 'power2.out' }
    );
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

  const allItems: ContentItem[] = useMemo(() => [
    ...materials.map((m): ContentItem => ({
      id: m.id, type: 'materi', name: m.title, desc: m.description,
      date: formatDateShort(m.createdAt),
      icon: m.type === 'video' ? 'video' : m.type === 'link' ? 'link' : 'pdf',
      rawType: m.type, rawUrl: m.url,
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

  const handleDelete = (id: string, type: string) => {
    if (!confirm('Yakin ingin menghapus item ini?')) return;
    if (type === 'materi') { deleteMaterial(id); toast.success('Materi dihapus!'); }
    else if (type === 'tugas') { deleteAssignment(id); toast.success('Tugas dihapus!'); }
    else if (type === 'kuis') { deleteQuiz(id); toast.success('Kuis dihapus!'); }
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
    <div ref={containerRef} className="min-h-screen -mx-6 -mt-6 bg-background p-6 md:p-10 space-y-6">

      {/* AI Planner Banner */}
      <button
        onClick={hasAI ? handleAIMaterials : () => toast.info('Buat rencana belajar di AI Planner terlebih dahulu.')}
        className="ai-banner w-full relative overflow-hidden rounded-2xl border border-primary/20 p-6 text-left transition-shadow group cursor-pointer bg-gradient-to-br from-primary/5 via-background to-primary/10"
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-[blob_7s_ease-in-out_infinite]" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-[blob_7s_ease-in-out_infinite_2s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl animate-[blob_7s_ease-in-out_infinite_4s]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5">
          <div className="shrink-0">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/10 group-hover:bg-primary/15 transition-colors duration-300">
              <Sparkles className="w-7 h-7 text-primary group-hover:rotate-12 transition-transform duration-500" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold tracking-widest uppercase text-primary">AI Planner</span>
              {hasAI && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">✓ Rencana tersedia</span>
              )}
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              {hasAI ? 'Gunakan Rekomendasi AI untuk Kelas Ini' : 'Bangun Rencana Belajar Otomatis dengan AI'}
            </h3>
            <p className="text-[13px] leading-relaxed max-w-lg text-muted-foreground">
              {hasAI
                ? `Modul ${aiOutput?.subject} kelas ${aiOutput?.grade} siap ditambahkan ke materi kelas ini secara otomatis.`
                : 'Dapatkan rencana pembelajaran, modul ajar, aktivitas, dan kuis yang sudah disesuaikan dengan kurikulum Merdeka.'}
            </p>
          </div>
          <div className="shrink-0 relative overflow-hidden px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-colors">
            <span className="relative z-10 flex items-center gap-2">
              {hasAI ? 'Terapkan ke Kelas' : 'Mulai Sekarang'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </div>
        </div>
      </button>

      {/* HERO */}
      <div
        className="relative overflow-hidden rounded-2xl border p-6 md:p-8"
        style={{ backgroundColor: `${themeBg}40`, borderColor: `${themeColor}20` }}
      >
        <div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${themeColor}10, transparent 70%)` }}
        />

        <div className="hero-content relative z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/class')}
            className="flex items-center gap-1.5 text-xs font-semibold mb-5 hover:opacity-70"
            style={{ color: themeColor }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Smart Learning Space
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Left: Title + Meta */}
            <div className="flex-1">
              <div
                className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase rounded-full px-3 py-1 mb-4 border"
                style={{ color: themeColor, backgroundColor: `${themeColor}15`, borderColor: `${themeColor}30` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                {cls.name}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-[1.1] tracking-tight mb-3" style={{ color: themeColor }}>
                {cls.subject}
              </h1>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-[13px]" style={{ color: themeColor, opacity: 0.75 }}>
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{students.length} Siswa</span>
                <span className="w-1 h-1 rounded-full opacity-40" style={{ backgroundColor: themeColor }} />
                <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />{materials.length} Materi</span>
                <span className="w-1 h-1 rounded-full opacity-40" style={{ backgroundColor: themeColor }} />
                <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" />{progressPct}% progress</span>
              </div>
            </div>

            {/* Right: Stat Cards */}
            <div className="flex items-center gap-3 flex-wrap shrink-0">
              {[
                { label: 'Topik', value: `${doneTopics}/${totalTopics}`, icon: Target },
                { label: 'Materi', value: materials.length, icon: BookOpen },
                { label: 'Tugas', value: assignments.length, icon: ClipboardList },
                { label: 'Kuis', value: quizzes.length, icon: HelpCircle },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-xl px-4 py-3 min-w-[88px] border backdrop-blur-sm" style={{ backgroundColor: `${themeColor}0D`, borderColor: `${themeColor}20` }}>
                  <div className="text-2xl font-bold mb-0.5" style={{ color: themeColor }}>{value}</div>
                  <div className="flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase" style={{ color: themeColor, opacity: 0.65 }}>
                    <Icon className="w-3 h-3" />{label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-4 py-3 mt-6 border-t text-[12px]" style={{ borderColor: `${themeColor}20`, color: themeColor }}>
            <span className="font-semibold shrink-0">{doneTopics} dari {totalTopics} topik</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${themeColor}20` }}>
              <div className="progress-bar-fill h-full rounded-full" style={{ width: '0%', backgroundColor: themeColor }} />
            </div>
            <span className="font-bold shrink-0">{progressPct}%</span>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="space-y-10">
        {/* ROADMAP */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[16px] font-bold text-foreground tracking-tight">Roadmap Pembelajaran</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">Progres topik per minggu</p>
            </div>
            <Button variant="ghost" size="sm" className="text-[12px] font-semibold text-[var(--gp-action)] hover:text-[var(--gp-action-hover)] gap-1">
              Lihat detail <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 overflow-x-auto">
            <div className="relative min-w-[700px] h-[280px]">
              {ROADMAP_STEPS.map((step, idx) => {
                const status = getRoadmapStatus(idx);
                const isTop = idx % 2 === 0;
                const leftPct = 10 + (idx * (80 / (ROADMAP_STEPS.length - 1)));

                const colors = {
                  done: { fill: '#22c55e', fillDark: '#16a34a', accent: '#4ade80' },
                  active: { fill: '#3b82f6', fillDark: '#2563eb', accent: '#60a5fa' },
                  upcoming: { fill: '#C3C3C3', fillDark: '#AEAEAE', accent: '#D9D9D9' },
                };
                const c = colors[status];

                return (
                  <div
                    key={idx}
                    className="absolute group cursor-pointer transition-transform hover:scale-110 hover:z-20"
                    style={{ left: `${leftPct}%`, top: isTop ? '30%' : '65%', transform: 'translate(-50%, -50%)' }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap z-30 pointer-events-none">
                      Klik untuk detail
                    </div>

                    {/* Hexagon SVG */}
                    <svg className="w-24 h-20 md:w-28 md:h-24" viewBox="0 0 205 132" fill="none">
                      <path d="M153.181 60.8291C181.381 77.1103 181.381 103.507 153.181 119.789C124.981 136.07 79.2603 136.07 51.0604 119.789C22.8605 103.507 22.8605 77.1103 51.0604 60.8291C79.2603 44.5479 124.981 44.5479 153.181 60.8291Z" fill={c.fill} opacity="0.6" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M174.331 90.3093C174.331 79.6397 167.281 68.9702 153.181 60.8296C124.981 44.5483 79.2603 44.5483 51.0604 60.8296C36.9604 68.9702 29.9105 79.6397 29.9105 90.3093V58.9592C29.9105 48.2897 36.9604 37.6201 51.0604 29.4795C79.2603 13.1982 124.981 13.1982 153.181 29.4795C167.281 37.6201 174.331 48.2897 174.331 58.9592V90.3093Z" fill={c.fill} />
                      <path fillRule="evenodd" clipRule="evenodd" d="M29.9105 90.3091C29.9105 100.979 36.9604 111.648 51.0604 119.789C79.2603 136.07 124.981 136.07 153.181 119.789C167.281 111.648 174.331 100.979 174.331 90.3091V58.959C174.331 69.6286 167.281 80.2981 153.181 88.4388C124.981 104.72 79.2603 104.72 51.0604 88.4388C36.9604 80.2981 29.9105 69.6286 29.9105 58.959V90.3091Z" fill={c.fillDark} />
                      <circle cx="58.9595" cy="58.9595" r="58.9595" transform="matrix(0.866025 -0.5 0.866025 0.5 0 58.96)" fill={c.accent} />
                    </svg>

                    {/* Label */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none drop-shadow-md">
                      {status === 'done' ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <span className={cn('font-bold text-sm', status === 'active' ? 'text-white' : 'text-muted-foreground')}>
                          H{idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Label below */}
                    <div className={cn('absolute left-1/2 -translate-x-1/2 w-28 text-center', isTop ? 'top-[110%]' : 'bottom-[110%]')}>
                      <p className="font-bold text-sm bg-background/80 backdrop-blur-sm rounded px-1 inline-block">{step.week}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 bg-background/90 backdrop-blur-md rounded border px-1.5 py-0.5 shadow-sm">
                        {step.name}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Connecting lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                {ROADMAP_STEPS.slice(0, -1).map((_, idx) => {
                  const left1 = 10 + (idx * (80 / (ROADMAP_STEPS.length - 1)));
                  const left2 = 10 + ((idx + 1) * (80 / (ROADMAP_STEPS.length - 1)));
                  const isTop1 = idx % 2 === 0;
                  const isTop2 = (idx + 1) % 2 === 0;
                  const y1 = isTop1 ? 30 : 65;
                  const y2 = isTop2 ? 30 : 65;
                  const status = getRoadmapStatus(idx);

                  return (
                    <line
                      key={idx}
                      x1={`${left1}%`} y1={`${y1}%`}
                      x2={`${left2}%`} y2={`${y2}%`}
                      stroke={status === 'done' ? '#22c55e' : '#e5e7eb'}
                      strokeWidth="2"
                      strokeDasharray={status === 'upcoming' ? '6 4' : 'none'}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        </section>

        {/* CONTENT LIST */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[16px] font-bold text-foreground tracking-tight">Konten Kelas</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">{allItems.length} item · Materi, Tugas & Kuis</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setMatOpen(true)} className="bg-[var(--gp-action)] hover:bg-[var(--gp-action-hover)] gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Materi
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAssignOpen(true)} className="gap-1.5 hover:border-[var(--gp-border-focus)] hover:text-[var(--gp-action)]">
                <Plus className="w-3.5 h-3.5" /> Tugas
              </Button>
              <Button size="sm" variant="outline" onClick={() => setQuizOpen(true)} className="gap-1.5 hover:border-[var(--gp-border-focus)] hover:text-[var(--gp-action)]">
                <Plus className="w-3.5 h-3.5" /> Kuis
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari konten..."
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-card text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-[var(--gp-border-focus)] transition-colors"
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
                      ? 'border-[var(--gp-border-focus)] text-[var(--gp-action)] bg-[var(--gp-action-light)]'
                      : 'border-border text-muted-foreground bg-card hover:bg-accent/50'
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 border border-dashed border-border rounded-2xl text-muted-foreground gap-3">
              <BookOpen className="w-10 h-10 opacity-20" />
              <p className="text-sm font-medium">
                {search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada konten di kategori ini'}
              </p>
              {!search && (
                <Button variant="ghost" size="sm" onClick={() => setMatOpen(true)} className="text-[var(--gp-action)] hover:text-[var(--gp-action-hover)]">
                  + Tambah materi pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
              {filteredItems.map(item => (
                <ContentCard key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ADD MATERIAL DIALOG */}
      <Dialog open={matOpen} onOpenChange={setMatOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[var(--gp-action)]" /> Tambah Materi Baru
            </DialogTitle>
          </DialogHeader>
          <AddMaterialForm classId={classId} onSuccess={() => { setMatOpen(false); toast.success('Materi ditambahkan!'); }} />
        </DialogContent>
      </Dialog>

      {/* ADD ASSIGNMENT DIALOG */}
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

      {/* ADD QUIZ DIALOG */}
      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-violet-500" /> Buat Kuis Baru
            </DialogTitle>
          </DialogHeader>
          <AddQuizForm classId={classId} onSuccess={() => { setQuizOpen(false); toast.success('Kuis dibuat!'); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddMaterialForm({ classId, onSuccess }: { classId: string; onSuccess: () => void }) {
  const { addMaterial } = useClassStore();
  const [type, setType] = useState('pdf');
  const { register, handleSubmit } = useForm({
    defaultValues: { title: '', description: '', url: '#' },
  });
  const onSubmit = (data: any) => { addMaterial({ ...data, type, classId, fromAI: false }); onSuccess(); };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      <div className="space-y-1.5"><Label>Judul</Label><Input {...register('title')} placeholder="Judul materi..." /></div>
      <div className="space-y-1.5"><Label>Deskripsi</Label><Textarea {...register('description')} placeholder="Deskripsi singkat..." className="min-h-[60px]" /></div>
      <div className="space-y-1.5">
        <Label>Tipe</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="link">Tautan</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5"><Label>URL / Link</Label><Input {...register('url')} placeholder="https://..." /></div>
      <Button type="submit" className="w-full bg-[var(--gp-action)] hover:bg-[var(--gp-action-hover)]">Tambah Materi</Button>
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
      <Button type="submit" className="w-full bg-[var(--gp-action)] hover:bg-[var(--gp-action-hover)]">Buat Tugas</Button>
    </form>
  );
}

function AddQuizForm({ classId, onSuccess }: { classId: string; onSuccess: () => void }) {
  const { addQuiz } = useClassStore();
  const [questions, setQuestions] = useState([{ text: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  const { register, handleSubmit } = useForm({
    defaultValues: { title: '', durationMinutes: 30 },
  });

  const addQuestion = () => setQuestions([...questions, { text: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  const removeQuestion = (idx: number) => setQuestions(questions.filter((_, i) => i !== idx));
  const updateQuestion = (idx: number, field: string, value: any) => {
    const updated = [...questions];
    (updated[idx] as any)[field] = value;
    setQuestions(updated);
  };
  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  const onSubmit = (data: any) => {
    addQuiz({
      classId,
      title: data.title,
      durationMinutes: Number(data.durationMinutes),
      questions: questions.map(q => ({
        id: Date.now().toString() + Math.random(),
        text: q.text,
        type: 'multiple_choice' as const,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
      fromAI: false,
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 max-h-[60vh] overflow-y-auto">
      <div className="space-y-1.5"><Label>Judul Kuis</Label><Input {...register('title')} placeholder="Nama kuis..." /></div>
      <div className="space-y-1.5"><Label>Durasi (menit)</Label><Input type="number" {...register('durationMinutes')} min={5} max={180} /></div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Pertanyaan ({questions.length})</Label>
          <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="gap-1 text-xs">
            <Plus className="w-3 h-3" /> Tambah
          </Button>
        </div>
        {questions.map((q, qi) => (
          <div key={qi} className="p-3 rounded-lg border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Soal {qi + 1}</span>
              {questions.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(qi)} className="h-6 px-2 text-destructive">
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
            <Input value={q.text} onChange={e => updateQuestion(qi, 'text', e.target.value)} placeholder="Tuliskan pertanyaan..." />
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuestion(qi, 'correctAnswer', oi)}
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                      q.correctAnswer === oi ? 'border-[var(--gp-action)] bg-[var(--gp-action)]' : 'border-border'
                    )}
                  >
                    {q.correctAnswer === oi && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <Input value={opt} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Opsi ${oi + 1}`} className="text-xs h-8" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full bg-[var(--gp-action)] hover:bg-[var(--gp-action-hover)]">Buat Kuis</Button>
    </form>
  );
}
