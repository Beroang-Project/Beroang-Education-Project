'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles, BarChart3, Layers, BookOpen,
  Clock, BrainCircuit, Calendar,
  Settings, LayoutGrid, List as ListIcon, ClipboardList, HelpCircle, ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClassStore } from '@/store/classStore';
import { usePlannerStore } from '@/store/plannerStore';
import { useP5Store } from '@/store/p5Store';
import { parseAlurPembelajaran, getTodayCheckpoints, isDeadlinePassed, cn } from '@/lib/utils';
import { useGSAP, animations } from '@/lib/gsap-config';
import { MacFolderCard, getDefaultFolderColor } from '@/components/ui/mac-folder-card';

function getDaysUntil(dateStr: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return 'Selamat pagi';
  if (hour >= 11 && hour < 15) return 'Selamat siang';
  if (hour >= 15 && hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

function getMotivation() {
  const hour = new Date().getHours();
  const pagi = [
    'Awal yang baik adalah setengah dari perjuangan. Semangat mengajar hari ini!',
    'Setiap anak adalah cerminan masa depan. Teruslah memberi inspirasi.',
    'Pagi yang cerah, hati yang penuh semangat. Saatnya berbagi ilmu!',
    'Guru yang hebat adalah mereka yang tak pernah berhenti belajar.',
    'Hari ini adalah kesempatan baru untuk membuat perbedaan.',
  ];
  const siang = [
    'Tengah hari yang produktif! Tetap fokus dan nikmati proses mengajar.',
    'Energi siang adalah waktu terbaik untuk berkreasi. Ayo semangat!',
    'Setiap pelajaran yang kamu sampaikan adalah investasi untuk masa depan.',
    'Jangan lelah untuk terus memberikan yang terbaik bagi siswa.',
    'Perjuanganmu tak akan pernah sia-sia. Teruslah berkarya!',
  ];
  const sore = [
    'Sore yang indah, waktu yang tepat untuk refleksi dan persiapan.',
    'Pekerjaan hari ini hampir selesai. Kamu sudah luar biasa!',
    'Setiap hari adalah proses menjadi versi terbaik dari dirimu.',
    'Sore hari, waktu untuk menikmati hasil kerja hari ini.',
    'Konsistensi adalah kunci. Kamu sudah melangkah jauh hari ini.',
  ];
  const malam = [
    'Malam yang tenang, saatnya beristirahat untuk hari yang lebih baik.',
    'Terima kasih atas dedikasimu hari ini. Istirahatlah dengan tenang.',
    'Malam adalah waktu untuk memulihkan energi. Besok akan lebih baik.',
    'Hari ini sudah luar biasa. Nikmati malammu dengan bahagia.',
    'Sebelum tidur, ingatlah bahwa kamu telah membuat perbedaan hari ini.',
  ];

  const now = hour >= 4 && hour < 11 ? pagi : hour >= 11 && hour < 15 ? siang : hour >= 15 && hour < 18 ? sore : malam;
  return now[Math.floor(Math.random() * now.length)];
}

export default function DashboardPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [motivation, setMotivation] = useState('');
  const [folderViewMode, setFolderViewMode] = useState<'folder' | 'list'>('folder');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dashboard-folder-view') as 'folder' | 'list' | null;
    if (saved) setFolderViewMode(saved);
    setMounted(true);
    setMotivation(getMotivation());
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('dashboard-folder-view', folderViewMode);
    }
  }, [folderViewMode, mounted]);

  const { classes, assignments, getMaterialsByClass, getAssignmentsByClass, getQuizzesByClass } = useClassStore();
  const { history } = usePlannerStore();
  const { groups } = useP5Store();

  const totalSubjects = new Set(classes.map(c => c.subject)).size;

  const upcomingDeadlines = assignments
    .filter(a => !isDeadlinePassed(a.deadline))
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  const todayCheckpoints = history.flatMap(roadmap => {
    const checkpoints = parseAlurPembelajaran(roadmap.output.alurPembelajaran, roadmap.createdAt);
    return getTodayCheckpoints(checkpoints, 1).map(cp => ({
      ...cp,
      roadmapId: roadmap.id,
      roadmapSubject: roadmap.subject,
    }));
  });

  const quickAccess = [
    { label: 'Generate Modul AI', desc: 'Buat roadmap pembelajaran', href: '/planner', icon: Sparkles, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { label: 'Smart Learning Space', desc: 'Kelola materi & tugas', href: '/class', icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10', badge: `${totalSubjects} folder` },
    { label: 'Kanban P5', desc: 'Proyek P5 siswa', href: '/p5/p1', icon: Layers, color: 'text-amber-500', bg: 'bg-amber-500/10', badge: `${groups.length} group` },
    { label: 'Asisten AI', desc: 'Chat dengan AI', href: '/asisten-ai', icon: BrainCircuit, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Analitik', desc: 'Lihat performa kelas', href: '/analytics', icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Pengaturan', desc: 'Profil & preferensi', href: '/settings', icon: Settings, color: 'text-muted-foreground', bg: 'bg-muted' },
  ];

  useGSAP(() => {
    animations.staggerFadeIn('.folder-card', 0.08);
    animations.staggerFadeIn('.quick-access-card', 0.06);
    animations.fadeInUp('.deadline-item', 0.04);
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="space-y-6">

      {/* ── Welcome Banner ── */}
      <div className="relative rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-primary/10 overflow-hidden h-[220px]">
        <img
          src="/bearhai.png"
          alt="Beroang Mascot"
          className="absolute -bottom-[200px] -left-[120px] w-[550px] h-[550px] object-contain pointer-events-none"
        />
        <div className="relative z-10 h-full flex items-center pl-[300px] pr-6">
          <div>
            <h2 className="font-display text-4xl font-bold tracking-tight">{getGreeting()}, Pak Fikri 👋</h2>
            {motivation && <p className="text-muted-foreground text-base mt-1.5 max-w-lg leading-relaxed">{motivation}</p>}
          </div>
        </div>
      </div>

      {/* ── Checkpoint + Deadline (2 columns) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">

        {/* Checkpoint Hari Ini */}
        <Card className="gp-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/50 flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Checkpoint Hari Ini</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {todayCheckpoints.length > 0 ? (
              <div className="divide-y divide-border/50">
                {todayCheckpoints.map((cp, index) => (
                  <div
                    key={index}
                    className="px-5 py-3.5 hover:bg-muted/30 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary font-medium">
                        {cp.roadmapSubject}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        Minggu {cp.week}
                      </Badge>
                    </div>
                    <h4 className="text-[14px] font-semibold text-foreground leading-snug">{cp.topic}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cp.activity}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span className="text-[11px] text-primary font-medium">{cp.p5Integration}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-5">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted mb-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Tidak ada agenda hari ini</p>
                <p className="text-xs text-muted-foreground mt-1">Buat roadmap di AI Teaching Planner</p>
              </div>
            )}
          </div>
        </Card>

        {/* Deadline Mendatang */}
        <Card className="gp-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold">Deadline Mendatang</span>
            </div>
            <Badge variant="secondary" className="text-[10px]">{upcomingDeadlines.length}</Badge>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {upcomingDeadlines.length > 0 ? (
              <div className="divide-y divide-border/50">
                {upcomingDeadlines.map((a) => {
                  const cls = classes.find(c => c.id === a.classId);
                  const days = getDaysUntil(a.deadline);
                  const urgency = days <= 1 ? 'destructive' : days <= 3 ? 'default' : 'secondary';

                  return (
                    <div
                      key={a.id}
                      className="deadline-item px-5 py-3.5 hover:bg-muted/30 transition-colors duration-200 cursor-pointer"
                      onClick={() => cls && router.push(`/class/${encodeURIComponent(cls.subject)}`)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="text-[13px] font-semibold text-foreground truncate">{a.title}</h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{cls?.name || 'Kelas'}</p>
                        </div>
                        <Badge
                          variant={urgency === 'secondary' ? 'outline' : 'secondary'}
                          className={`text-[10px] shrink-0 ${
                            urgency === 'destructive'
                              ? 'bg-red-500/10 text-red-600 border-red-200'
                              : urgency === 'default'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-200'
                              : ''
                          }`}
                        >
                          {days === 0 ? 'Hari ini' : days === 1 ? 'Besok' : `${days} hari`}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 px-5">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted mb-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Tidak ada deadline</p>
                <p className="text-xs text-muted-foreground mt-1">Semua tugas sudah selesai</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Quick Access Grid (2×3) ── */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          Akses Cepat
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {quickAccess.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="quick-access-card group flex flex-col items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors duration-200 text-center"
          >
            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">{item.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            {item.badge && (
              <Badge variant="secondary" className="text-[10px] font-medium">{item.badge}</Badge>
            )}
          </Link>
        ))}
        </div>
      </div>

      {/* ── Folder Terbaru ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Folder Terbaru
          </h3>
          <div className="flex items-center bg-accent/50 p-1 rounded-lg border border-border">
            <button
              onClick={() => setFolderViewMode('folder')}
              className={cn(
                'flex items-center justify-center p-1.5 rounded-md transition-all',
                folderViewMode === 'folder' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
              title="Tampilan Folder"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFolderViewMode('list')}
              className={cn(
                'flex items-center justify-center p-1.5 rounded-md transition-all',
                folderViewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
              title="Tampilan List"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        {folderViewMode === 'folder' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...classes].reverse().slice(0, 4).map((cls) => {
              const folderColorObj = getDefaultFolderColor(cls.subject);
              const totalM = getMaterialsByClass(cls.id).length;
              const totalA = getAssignmentsByClass(cls.id).length;
              const totalQ = getQuizzesByClass(cls.id).length;

              return (
                <div key={cls.id} className="folder-card">
                  <MacFolderCard
                    title={cls.folderName || cls.subject}
                    folderColor={folderColorObj.value}
                    textColor={folderColorObj.text}
                    materialCount={totalM}
                    assignmentCount={totalA}
                    quizCount={totalQ}
                    onOpen={() => router.push(`/class/${encodeURIComponent(cls.subject)}`)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {[...classes].reverse().slice(0, 4).map((cls) => {
              const folderColorObj = getDefaultFolderColor(cls.subject);
              const totalM = getMaterialsByClass(cls.id).length;
              const totalA = getAssignmentsByClass(cls.id).length;
              const totalQ = getQuizzesByClass(cls.id).length;
              const totalItems = totalM + totalA + totalQ;

              return (
                <div
                  key={cls.id}
                  onClick={() => router.push(`/class/${encodeURIComponent(cls.subject)}`)}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors duration-200 group"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: folderColorObj.value }}
                  >
                    <BookOpen className="w-5 h-5" style={{ color: folderColorObj.text }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-bold text-foreground truncate leading-snug">
                      {cls.folderName || cls.subject}
                    </h4>
                    <div className="flex items-center gap-3 text-[12px] text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {totalM} Materi
                      </span>
                      <span className="flex items-center gap-1">
                        <ClipboardList className="w-3 h-3" /> {totalA} Tugas
                      </span>
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" /> {totalQ} Kuis
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${folderColorObj.text}15`, color: folderColorObj.text }}
                    >
                      {totalItems} konten
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
