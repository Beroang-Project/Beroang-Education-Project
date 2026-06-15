'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles, Users, BarChart3, Layers, BookOpen,
  TrendingUp, Clock, ArrowRight, BrainCircuit, Play, MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useClassStore } from '@/store/classStore';
import { useAssessmentStore } from '@/store/assessmentStore';
import { usePlannerStore } from '@/store/plannerStore';
import { calculateFinalGrade, isDeadlinePassed } from '@/lib/utils';
import { gsap, useGSAP, animations } from '@/lib/gsap-config';
import { MacFolderCard, getDefaultFolderColor } from '@/components/ui/mac-folder-card';


export default function DashboardPage() {
  const { classes, assignments, getStudentsByClass } = useClassStore();
  const { students, classWeights, classKKM } = useAssessmentStore();
  const { history } = usePlannerStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Total students
  const totalStudents = students.length;
  const upcomingAssignments = assignments.filter(a => !isDeadlinePassed(a.deadline)).length;

  // Avg grade across all classes
  const allGrades = classes.flatMap(cls => {
    const classStudents = students.filter(s => s.classId === cls.id);
    const weights = classWeights[cls.id] || cls.gradeWeights;
    const kkm = classKKM[cls.id] || cls.kkm;
    return classStudents.map(s => ({
      grade: calculateFinalGrade(s, { ...cls, gradeWeights: weights, kkm }),
      kkm,
    }));
  });
  const avgGrade = allGrades.length > 0
    ? Math.round(allGrades.reduce((sum, g) => sum + g.grade, 0) / allGrades.length)
    : 0;
  const tuntasCount = allGrades.filter(g => g.grade >= g.kkm).length;

  // GSAP entrance animation
  useGSAP(() => {
    if (!containerRef.current) return;
    animations.staggerFadeIn('.stat-card', 0.1);
    animations.fadeInUp('.chart-section', 0.4);
    animations.staggerFadeIn('.quick-action', 0.08);
    animations.staggerFadeIn('.folder-card', 0.08);

    // Count-up for stat numbers
    const statNums = document.querySelectorAll('.stat-num');
    statNums.forEach((el, i) => {
      const val = parseInt(el.getAttribute('data-value') || '0');
      setTimeout(() => animations.countUp(el as Element, val), i * 150);
    });
  }, { scope: containerRef });

  const statCards = [
    { label: 'Total Siswa', value: totalStudents, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', change: '+2 minggu ini' },
    { label: 'Rata-rata Nilai', value: avgGrade, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10', change: `${tuntasCount} siswa tuntas` },
    { label: 'Tugas Aktif', value: upcomingAssignments, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', change: 'Belum deadline' },
    { label: 'Riwayat AI', value: history.length, icon: Sparkles, color: 'text-violet-400', bg: 'bg-violet-500/10', change: 'Sesi generate' },
  ];

  const quickActions = [
    { label: 'Generate Modul AI', href: '/planner', icon: Sparkles, variant: 'default' as const },
    { label: 'Lihat Kelas X IPA 1', href: '/class/c1', icon: BookOpen, variant: 'outline' as const },
    { label: 'Buka Kanban P5', href: '/p5/p1', icon: Layers, variant: 'outline' as const },
    { label: 'Analytics', href: '/analytics', icon: BarChart3, variant: 'outline' as const },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Selamat datang, Guru Utama 👋</h2>
          <p className="text-muted-foreground text-sm mt-1">Berikut ringkasan aktivitas pembelajaran Anda hari ini.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
            <Link href="/asisten-ai">
              <BrainCircuit className="h-4 w-4 mr-2" />
              Kembangkan Kemampuan Anda
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/planner">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Modul AI
            </Link>
          </Button>
        </div>
      </div>

      {/* Roadmap Quick View (Replaces Activity Chart) */}
      <Card className="chart-section gp-card">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Roadmap Tersimpan (Akses Cepat)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {history.slice(0, 4).map((h, i) => (
              <div key={h.id || i} className="flex-shrink-0 w-64 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/40 transition-colors group cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">{h.subject}</Badge>
                  <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-3 w-3" />
                  </Button>
                </div>
                <h4 className="text-sm font-bold line-clamp-1">{h.cp}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{h.grade}</p>
              </div>
            ))}
            {history.length === 0 && (
              <div className="w-full text-center py-6 text-muted-foreground text-sm">
                Belum ada roadmap yang digenerate.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="stat-card gp-card group cursor-default">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <p className={`text-3xl font-display font-bold ${stat.color} stat-num`} data-value={stat.value}>0</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kelas + Aksi Cepat */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5 items-stretch">
        {/* Kelas — folder 2×2 mengisi sisa ruang */}
        <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full min-h-0 auto-rows-fr">
          {classes.slice(0, 4).map((cls) => {
            const clsStudents = students.filter(s => s.classId === cls.id);
            const weights = classWeights[cls.id] || cls.gradeWeights;
            const kkm = classKKM[cls.id] || cls.kkm;
            const grades = clsStudents.map(s => calculateFinalGrade(s, { ...cls, gradeWeights: weights, kkm }));
            const avg = grades.length ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : 0;
            const tuntas = grades.filter(g => g >= kkm).length;
            const folderColorObj = getDefaultFolderColor(cls.subject);

            return (
              <div key={cls.id} className="folder-card group relative min-w-0 h-full flex flex-col">
                <MacFolderCard
                  title={cls.name}
                  folderColor={folderColorObj.value}
                  textColor={folderColorObj.text}
                  materialCount={0}
                  assignmentCount={0}
                  quizCount={0}
                  className="h-full flex-1"
                >
                  <div className="px-4 pb-4 -mt-2 flex flex-col flex-1">
                    <p className="text-xs font-medium mb-2 opacity-70 line-clamp-1" style={{ color: folderColorObj.text }}>
                      {cls.subject} • {clsStudents.length} siswa
                    </p>

                    <div className="space-y-1.5 mb-3 bg-background/40 backdrop-blur-sm p-2.5 rounded-lg border border-black/5 flex-1">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span style={{ color: folderColorObj.text }}>Rata-rata</span>
                        <span style={{ color: folderColorObj.text }}>{avg}</span>
                      </div>
                      <Progress value={avg} className="h-1.5" indicatorColor={folderColorObj.text} />
                      <div className="flex justify-between text-[10px] font-medium" style={{ color: folderColorObj.text, opacity: 0.8 }}>
                        <span>{tuntas} tuntas</span>
                        <span>{clsStudents.length - tuntas} bantuan</span>
                      </div>
                    </div>

                    <Button size="sm" variant="ghost" className="w-full text-xs h-8 bg-background/50 hover:bg-background mt-auto" style={{ color: folderColorObj.text }} asChild>
                      <Link href={`/class/${encodeURIComponent(cls.subject)}`}>
                        Buka Kelas <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </MacFolderCard>
              </div>
            );
          })}
        </div>

        {/* Aksi Cepat — compact di kanan */}
        <Card className="gp-card w-full lg:w-fit lg:min-w-[260px] lg:max-w-[340px] lg:shrink-0 self-start">
          <CardHeader className="py-3 px-5 border-b border-border/50">
            <CardTitle className="text-sm font-semibold">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-3">
            <div className="grid grid-cols-2 gap-1.5">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant={action.variant === 'default' ? 'default' : 'outline'}
                  size="sm"
                  className={`quick-action h-7 gap-1.5 px-3 text-[11px] font-medium ${
                    action.variant === 'outline'
                      ? 'bg-background hover:bg-muted/50 border-border'
                      : ''
                  }`}
                  asChild
                >
                  <Link href={action.href}>
                    <action.icon className="h-3 w-3 shrink-0" />
                    <span className="truncate">{action.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
