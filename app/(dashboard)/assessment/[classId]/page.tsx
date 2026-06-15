'use client';

import { useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  FileSpreadsheet, FileDown, Sparkles, Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { useAssessmentStore } from '@/store/assessmentStore';
import { useClassStore } from '@/store/classStore';
import { usePlannerStore } from '@/store/plannerStore';
import { calculateFinalGrade, getInitials, getAvatarColor, cn } from '@/lib/utils';
import { useGSAP, animations } from '@/lib/gsap-config';
import type { Student } from '@/types';

export default function AssessmentPage() {
  const params = useParams();
  const classId = params.classId as string;
  const containerRef = useRef<HTMLDivElement>(null);

  const { students: allStudents, classWeights, classKKM, updateScore, setWeights, setKKM } = useAssessmentStore();
  const { classes, assignments, quizzes } = useClassStore();
  const { history } = usePlannerStore();

  const cls = classes.find(c => c.id === classId);
  const students = allStudents.filter(s => s.classId === classId);
  const classAssignments = assignments.filter(a => a.classId === classId);
  const classQuizzes = quizzes.filter(q => q.classId === classId);

  const weights = classWeights[classId] || cls?.gradeWeights || { assignments: 40, quizzes: 30, p5Project: 30 };
  const kkm = classKKM[classId] || cls?.kkm || 75;
  const aiOutput = history.find(h => h.id === cls?.aiPlannerOutputId);

  const [editingCell, setEditingCell] = useState<{ studentId: string; col: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  useGSAP(() => {
    animations.fadeInUp('.assessment-toolbar', 0);
    animations.fadeInUp('.grade-table-wrapper', 0.15);
  }, { scope: containerRef });

  const getStudentFinalGrade = (student: Student) => {
    if (!cls) return 0;
    return calculateFinalGrade(student, { ...cls, gradeWeights: weights, kkm });
  };

  const handleCellClick = (studentId: string, col: string, currentVal: number) => {
    setEditingCell({ studentId, col });
    setEditValue(String(currentVal));
  };

  const handleCellSave = (student: Student, col: string) => {
    const val = Math.min(100, Math.max(0, parseInt(editValue) || 0));
    if (col.startsWith('a_')) updateScore(student.id, 'assignments', col.replace('a_', ''), val);
    else if (col.startsWith('q_')) updateScore(student.id, 'quizzes', col.replace('q_', ''), val);
    else if (col === 'p5') updateScore(student.id, 'p5Project', '', val);
    setEditingCell(null);

    // Flash effect on the cell
    const cell = document.querySelector(`[data-cell="${student.id}-${col}"]`);
    if (cell) {
      cell.classList.add('bg-primary/20');
      setTimeout(() => cell.classList.remove('bg-primary/20'), 500);
    }
  };

  const handleExportExcel = async () => {
    const { utils, writeFile } = await import('xlsx');
    const data = students.map(s => {
      const row: Record<string, string | number> = { Nama: s.name };
      classAssignments.forEach(a => { row[a.title] = s.scores.assignments[a.id] ?? '-'; });
      classQuizzes.forEach(q => { row[q.title] = s.scores.quizzes[q.id] ?? '-'; });
      row['P5 Project'] = s.scores.p5Project;
      row['Nilai Akhir'] = getStudentFinalGrade(s);
      row['Status'] = getStudentFinalGrade(s) >= kkm ? 'Tuntas' : 'Belum Tuntas';
      return row;
    });
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Nilai');
    writeFile(wb, `Nilai_${cls?.name || classId}.xlsx`);
    toast.success('File Excel berhasil diunduh!');
  };

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Laporan Nilai — ${cls?.name} (${cls?.subject})`, 14, 20);
    doc.setFontSize(11);
    students.forEach((s, i) => {
      const grade = getStudentFinalGrade(s);
      const status = grade >= kkm ? 'Tuntas' : 'Belum Tuntas';
      doc.text(`${i + 1}. ${s.name} — Nilai Akhir: ${grade} (${status})`, 14, 35 + i * 8);
    });
    doc.save(`Laporan_${cls?.name || classId}.pdf`);
    toast.success('File PDF berhasil diunduh!');
  };

  if (!cls) return <div className="p-6 text-muted-foreground">Kelas tidak ditemukan.</div>;

  return (
    <div ref={containerRef} className="space-y-5">
      {/* Toolbar */}
      <div className="assessment-toolbar flex flex-wrap items-center gap-4 p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Batas KKM:</span>
          <Select value={String(kkm)} onValueChange={v => setKKM(classId, Number(v))}>
            <SelectTrigger className="w-20 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[60, 65, 70, 75, 80, 85].map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Separator orientation="vertical" className="h-8 hidden sm:block" />

        {/* Weight sliders */}
        {[
          { key: 'assignments', label: 'Tugas' },
          { key: 'quizzes', label: 'Kuis' },
          { key: 'p5Project', label: 'P5' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">{label} ({weights[key as keyof typeof weights]}%):</span>
            <Slider
              min={0} max={100} step={5}
              value={[weights[key as keyof typeof weights]]}
              onValueChange={([v]) => setWeights(classId, { ...weights, [key]: v })}
              className="w-24"
            />
          </div>
        ))}

        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="text-xs gap-1.5">
            <FileSpreadsheet className="h-3.5 w-3.5 text-green-500" /> Export Excel
          </Button>
          <Button size="sm" onClick={handleExportPDF} className="text-xs gap-1.5">
            <FileDown className="h-3.5 w-3.5" /> Cetak PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Grade Table */}
        <Card className="grade-table-wrapper col-span-2 gp-card">
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Lembar Nilai</CardTitle>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" /> Klik sel untuk mengedit nilai
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left pb-3 pl-2 font-medium w-8">#</th>
                  <th className="text-left pb-3 font-medium min-w-[150px]">Nama Siswa</th>
                  {classAssignments.slice(0, 3).map((a, i) => (
                    <th key={a.id} className="text-center pb-3 font-medium px-2 min-w-[70px]">Tugas {i + 1}</th>
                  ))}
                  {classQuizzes.slice(0, 2).map((q, i) => (
                    <th key={q.id} className="text-center pb-3 font-medium px-2 min-w-[70px]">Kuis {i + 1}</th>
                  ))}
                  <th className="text-center pb-3 font-medium px-2 min-w-[80px]">P5 Project</th>
                  <th className="text-center pb-3 font-medium px-2 min-w-[90px] text-primary">Nilai Akhir</th>
                  <th className="text-center pb-3 font-medium px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const final = getStudentFinalGrade(student);
                  const tuntas = final >= kkm;
                  return (
                    <tr key={student.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 pl-2 text-muted-foreground text-xs">{idx + 1}</td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-7 w-7 rounded-full ${getAvatarColor(student.name)} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                            {getInitials(student.name)}
                          </div>
                          <span className="font-medium text-xs">{student.name}</span>
                        </div>
                      </td>
                      {classAssignments.slice(0, 3).map((a) => {
                        const col = `a_${a.id}`;
                        const val = student.scores.assignments[a.id] ?? 0;
                        const isEditing = editingCell?.studentId === student.id && editingCell?.col === col;
                        return (
                          <td key={a.id} className="py-2.5 px-2 text-center" data-cell={`${student.id}-${col}`}>
                            {isEditing ? (
                              <input
                                autoFocus
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={() => handleCellSave(student, col)}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); handleCellSave(student, col); } if (e.key === 'Escape') setEditingCell(null); }}
                                className="w-14 text-center rounded-md border border-primary bg-primary/10 text-foreground text-sm font-semibold outline-none py-0.5"
                              />
                            ) : (
                              <button
                                onClick={() => handleCellClick(student.id, col, val)}
                                className="w-full text-center hover:bg-primary/10 rounded-md py-0.5 px-1 transition-colors cursor-pointer text-sm font-medium"
                              >
                                {val || '—'}
                              </button>
                            )}
                          </td>
                        );
                      })}
                      {classQuizzes.slice(0, 2).map((q) => {
                        const col = `q_${q.id}`;
                        const val = student.scores.quizzes[q.id] ?? 0;
                        const isEditing = editingCell?.studentId === student.id && editingCell?.col === col;
                        return (
                          <td key={q.id} className="py-2.5 px-2 text-center" data-cell={`${student.id}-${col}`}>
                            {isEditing ? (
                              <input
                                autoFocus
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={() => handleCellSave(student, col)}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); handleCellSave(student, col); } if (e.key === 'Escape') setEditingCell(null); }}
                                className="w-14 text-center rounded-md border border-primary bg-primary/10 text-foreground text-sm font-semibold outline-none py-0.5"
                              />
                            ) : (
                              <button onClick={() => handleCellClick(student.id, col, val)} className="w-full text-center hover:bg-primary/10 rounded-md py-0.5 px-1 transition-colors cursor-pointer text-sm font-medium">
                                {val || '—'}
                              </button>
                            )}
                          </td>
                        );
                      })}
                      {/* P5 */}
                      <td className="py-2.5 px-2 text-center" data-cell={`${student.id}-p5`}>
                        {editingCell?.studentId === student.id && editingCell?.col === 'p5' ? (
                          <input
                            autoFocus
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => handleCellSave(student, 'p5')}
                            onKeyDown={e => { if (e.key === 'Enter') handleCellSave(student, 'p5'); if (e.key === 'Escape') setEditingCell(null); }}
                            className="w-14 text-center rounded-md border border-primary bg-primary/10 text-foreground text-sm font-semibold outline-none py-0.5"
                          />
                        ) : (
                          <button onClick={() => handleCellClick(student.id, 'p5', student.scores.p5Project)} className="w-full text-center hover:bg-primary/10 rounded-md py-0.5 px-1 transition-colors cursor-pointer text-sm font-medium">
                            {student.scores.p5Project || '—'}
                          </button>
                        )}
                      </td>
                      {/* Final */}
                      <td className="py-2.5 px-2 text-center">
                        <span className="font-bold text-sm text-primary">{final}</span>
                      </td>
                      {/* Status */}
                      <td className="py-2.5 px-2 text-center">
                        <Badge className={cn('text-[10px] px-2 font-semibold border', tuntas ? 'badge-tuntas' : 'badge-belum-tuntas')}>
                          {tuntas ? 'Tuntas' : 'Belum Tuntas'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Rubrik Panel */}
        <Card className="gp-card h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Rubrik AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiOutput ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Panduan penilaian untuk <strong>P5 Project</strong> berdasarkan rancangan AI Planner.</p>
                <Separator />
                {[
                  { label: 'Kreativitas Solusi', weight: 30, desc: 'Kemampuan siswa menghasilkan ide orisinal yang relevan', scores: ['85-100: Sangat inovatif, dapat diterapkan.', '70-84: Ada ide, butuh pengembangan.', '< 70: Tidak orisinal.'] },
                  { label: 'Kolaborasi Tim', weight: 30, desc: 'Pembagian tugas dan komunikasi antar anggota kelompok', scores: ['85-100: Sinergi tinggi, semua terlibat aktif.', '70-84: Kolaborasi baik.', '< 70: Tidak ada kerja tim.'] },
                  { label: 'Presentasi', weight: 40, desc: 'Kejelasan penyampaian materi dan penggunaan media visual', scores: ['85-100: Percaya diri, visual menarik.', '70-84: Cukup percaya diri.', '< 70: Tidak dapat presentasi.'] },
                ].map((rubrik) => (
                  <div key={rubrik.label} className="p-3 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold">{rubrik.label}</p>
                      <Badge variant="secondary" className="text-[10px]">Bobot: {rubrik.weight}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{rubrik.desc}</p>
                    {rubrik.scores.map((s, i) => (
                      <p key={i} className={`text-[11px] ${i === 2 ? 'text-red-400' : 'text-muted-foreground'}`}>• {s}</p>
                    ))}
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full text-xs">Sesuaikan Rubrik</Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Generate modul di AI Planner lalu simpan ke kelas ini untuk melihat rubrik.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
