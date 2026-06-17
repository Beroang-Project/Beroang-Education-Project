'use client';

import { useRef, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { FileSpreadsheet, FileDown, TrendingUp, Users, Award, Layers, Clock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAssessmentStore } from '@/store/assessmentStore';
import { useClassStore } from '@/store/classStore';
import { useP5Store } from '@/store/p5Store';
import { usePlannerStore } from '@/store/plannerStore';
import { calculateFinalGrade, getInitials, getAvatarColor, cn, isDeadlinePassed } from '@/lib/utils';
import { useGSAP, animations } from '@/lib/gsap-config';

const PIE_COLORS = ['#4ade80', '#60a5fa', '#f59e0b'];

const trendData = [
  { week: 'Mg 1', 'X IPA 1': 28, 'XI IPS 2': 22, 'XII Bahasa 1': 18 },
  { week: 'Mg 2', 'X IPA 1': 32, 'XI IPS 2': 25, 'XII Bahasa 1': 20 },
  { week: 'Mg 3', 'X IPA 1': 25, 'XI IPS 2': 28, 'XII Bahasa 1': 22 },
  { week: 'Mg 4', 'X IPA 1': 38, 'XI IPS 2': 30, 'XII Bahasa 1': 26 },
  { week: 'Mg 5', 'X IPA 1': 35, 'XI IPS 2': 32, 'XII Bahasa 1': 28 },
  { week: 'Mg 6', 'X IPA 1': 42, 'XI IPS 2': 36, 'XII Bahasa 1': 30 },
];

export default function AnalyticsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedClass, setSelectedClass] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const { students, classWeights, classKKM } = useAssessmentStore();
  const { classes, assignments } = useClassStore();
  const { groups } = useP5Store();
  const { history } = usePlannerStore();

  const totalStudents = students.length;
  const upcomingAssignments = assignments.filter(a => !isDeadlinePassed(a.deadline)).length;

  const allGrades = classes.flatMap(cls => {
    const clsStudents = students.filter(s => s.classId === cls.id);
    const weights = classWeights[cls.id] || cls.gradeWeights;
    const kkm = classKKM[cls.id] || cls.kkm;
    return clsStudents.map(s => ({
      grade: calculateFinalGrade(s, { ...cls, gradeWeights: weights, kkm }),
      kkm,
    }));
  });
  const avgGrade = allGrades.length > 0
    ? Math.round(allGrades.reduce((sum, g) => sum + g.grade, 0) / allGrades.length)
    : 0;
  const tuntasCount = allGrades.filter(g => g.grade >= g.kkm).length;

  const statCards = [
    { label: 'Total Siswa', value: totalStudents, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', change: '+2 minggu ini' },
    { label: 'Rata-rata Nilai', value: avgGrade, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10', change: `${tuntasCount} siswa tuntas` },
    { label: 'Tugas Aktif', value: upcomingAssignments, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', change: 'Belum deadline' },
    { label: 'Riwayat AI', value: history.length, icon: Sparkles, color: 'text-violet-400', bg: 'bg-violet-500/10', change: 'Sesi generate' },
  ];

  useGSAP(() => {
    animations.staggerFadeIn('.stat-card', 0.1);
    animations.staggerFadeIn('.chart-card', 0.1);
    animations.staggerFadeIn('.summary-row', 0.05);
  }, { scope: containerRef });

  // Bar chart: avg grade per class
  const barData = classes.map(cls => {
    const clsStudents = students.filter(s => s.classId === cls.id);
    const weights = classWeights[cls.id] || cls.gradeWeights;
    const kkm = classKKM[cls.id] || cls.kkm;
    const grades = clsStudents.map(s => calculateFinalGrade(s, { ...cls, gradeWeights: weights, kkm }));
    const avg = grades.length ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : 0;
    return { name: cls.name, 'Rata-rata Nilai': avg, KKM: kkm };
  });

  // Pie chart: P5 status
  const p5All = groups;
  const pieData = [
    { name: 'Selesai', value: p5All.filter(g => g.status === 'final_report').length },
    { name: 'Berjalan', value: p5All.filter(g => g.status === 'in_progress' || g.status === 'documentation').length },
    { name: 'Belum Mulai', value: p5All.filter(g => g.status === 'proposal').length },
  ].filter(d => d.value > 0);

  // Summary table
  const summaryStudents = selectedClass === 'all'
    ? students
    : students.filter(s => s.classId === selectedClass);

  const totalPages = Math.ceil(summaryStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = summaryStudents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleExport = async (type: 'excel' | 'pdf') => {
    if (type === 'excel') {
      const { utils, writeFile } = await import('xlsx');
      const data = summaryStudents.map(s => {
        const cls = classes.find(c => c.id === s.classId)!;
        const weights = classWeights[s.classId] || cls?.gradeWeights;
        const kkm = classKKM[s.classId] || cls?.kkm || 75;
        return { Nama: s.name, Kelas: cls?.name, 'Nilai Akhir': calculateFinalGrade(s, { ...cls, gradeWeights: weights, kkm }), Status: calculateFinalGrade(s, { ...cls, gradeWeights: weights, kkm }) >= kkm ? 'Tuntas' : 'Belum Tuntas' };
      });
      const ws = utils.json_to_sheet(data);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Analytics');
      writeFile(wb, 'GreenPath_Analytics.xlsx');
      toast.success('Export Excel berhasil!');
    } else {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('GreenPath — Laporan Analytics', 14, 20);
      doc.setFontSize(11);
      summaryStudents.forEach((s, i) => {
        const cls = classes.find(c => c.id === s.classId)!;
        const weights = classWeights[s.classId] || cls?.gradeWeights;
        const kkm = classKKM[s.classId] || cls?.kkm || 75;
        const grade = calculateFinalGrade(s, { ...cls, gradeWeights: weights, kkm });
        doc.text(`${i + 1}. ${s.name} (${cls?.name}) — ${grade}`, 14, 35 + i * 7);
      });
      doc.save('GreenPath_Analytics.pdf');
      toast.success('Export PDF berhasil!');
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Teacher Analytics</h2>
          <p className="text-muted-foreground text-sm mt-1">Visualisasi performa kelas dan progres P5</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')} className="text-xs gap-1.5">
            <FileSpreadsheet className="h-3.5 w-3.5 text-green-500" /> Export Excel
          </Button>
          <Button size="sm" onClick={() => handleExport('pdf')} className="text-xs gap-1.5">
            <FileDown className="h-3.5 w-3.5" /> Export PDF
          </Button>
        </div>
      </div>

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

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        {/* Bar Chart */}
        <Card className="chart-card col-span-2 gp-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Rata-rata Nilai per Kelas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }} />
                <Bar dataKey="Rata-rata Nilai" fill="#4ade80" radius={[6, 6, 0, 0]} />
                <Bar dataKey="KKM" fill="#f59e0b" radius={[6, 6, 0, 0]} opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="chart-card gp-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Status Proyek P5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="font-semibold">{d.value} kelompok</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Chart */}
      <Card className="chart-card gp-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Tren Aktivitas Siswa per Minggu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="X IPA 1" stroke="#4ade80" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="XI IPS 2" stroke="#60a5fa" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="XII Bahasa 1" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card className="gp-card">
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" /> Rekap Seluruh Siswa
          </CardTitle>
          <Select value={selectedClass} onValueChange={(val) => { setSelectedClass(val); setCurrentPage(1); }}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left pb-3 font-medium">Nama Siswa</th>
                  <th className="text-left pb-3 font-medium">Kelas</th>
                  <th className="text-center pb-3 font-medium">Tugas</th>
                  <th className="text-center pb-3 font-medium">Kuis</th>
                  <th className="text-center pb-3 font-medium">P5</th>
                  <th className="text-center pb-3 font-medium text-primary">Nilai Akhir</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((s) => {
                  const cls = classes.find(c => c.id === s.classId)!;
                  const weights = classWeights[s.classId] || cls?.gradeWeights;
                  const kkm = classKKM[s.classId] || cls?.kkm || 75;
                  const final = cls ? calculateFinalGrade(s, { ...cls, gradeWeights: weights, kkm }) : 0;
                  const tuntas = final >= kkm;
                  const asgIds = Object.keys(s.scores.assignments);
                  const qIds = Object.keys(s.scores.quizzes);
                  const asgAvg = asgIds.length ? Math.round(asgIds.reduce((sum, id) => sum + s.scores.assignments[id], 0) / asgIds.length) : 0;
                  const qAvg = qIds.length ? Math.round(qIds.reduce((sum, id) => sum + s.scores.quizzes[id], 0) / qIds.length) : 0;
                  return (
                    <tr key={s.id} className="summary-row border-b border-border/40 hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded-full ${getAvatarColor(s.name)} flex items-center justify-center text-white text-[9px] font-bold`}>
                            {getInitials(s.name)}
                          </div>
                          <span className="text-xs font-medium">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-xs text-muted-foreground">{cls?.name}</td>
                      <td className="py-2.5 text-center text-xs">{asgAvg}</td>
                      <td className="py-2.5 text-center text-xs">{qAvg}</td>
                      <td className="py-2.5 text-center text-xs">{s.scores.p5Project}</td>
                      <td className="py-2.5 text-center text-sm font-bold text-primary">{final}</td>
                      <td className="py-2.5 text-center">
                        <Badge variant="outline" className={cn("text-[10px]", tuntas ? 'text-green-500 border-green-200 bg-green-500/10' : 'text-red-500 border-red-200 bg-red-500/10')}>
                          {tuntas ? 'Tuntas' : 'Remedial'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between py-3 px-2">
                <span className="text-xs text-muted-foreground">
                  Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, summaryStudents.length)} dari {summaryStudents.length} siswa
                </span>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" size="sm" className="h-7 px-2 text-xs" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">Hal {currentPage} / {totalPages}</span>
                  <Button 
                    variant="outline" size="sm" className="h-7 px-2 text-xs" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
