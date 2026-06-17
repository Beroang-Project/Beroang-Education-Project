'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  BookOpen, ClipboardList, HelpCircle,
  Trash2, Pencil, CheckCircle, FolderPlus,
  History, LayoutGrid, List as ListIcon, ChevronRight, Search,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useClassStore } from '@/store/classStore';
import { usePlannerStore } from '@/store/plannerStore';
import { formatDateShort, isDeadlinePassed, cn, generateId } from '@/lib/utils';
import { useGSAP, animations } from '@/lib/gsap-config';
import {
  MacFolderCard, FOLDER_COLORS, getDefaultFolderColor,
} from '@/components/ui/mac-folder-card';
import type { Class } from '@/types';

function groupBySubject(classes: Class[]): Map<string, Class[]> {
  const map = new Map<string, Class[]>();
  for (const cls of classes) {
    if (!map.has(cls.subject)) map.set(cls.subject, []);
    map.get(cls.subject)!.push(cls);
  }
  return map;
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ClassIndexPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { classes, addClass, updateClass, deleteClass, recentSubjects, trackRecentSubject, getMaterialsByClass, getAssignmentsByClass, getQuizzesByClass } = useClassStore();
  const { history } = usePlannerStore();

  const [editOpen, setEditOpen] = useState(false);
  const [editClassId, setEditClassId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0].value);
  const [viewMode, setViewMode] = useState<'folder' | 'list'>('folder');
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { setMounted(true); }, []);

  useGSAP(() => {
    animations.staggerFadeIn('.folder-card', 0.06);
    animations.fadeInUp('.recent-section', 0);
  }, { scope: containerRef });

  const subjectGroups = groupBySubject(classes);
  const subjectEntries = Array.from(subjectGroups.entries());

  const editCls = editClassId ? classes.find(c => c.id === editClassId) : null;

  const handleFolderOpen = (subject: string) => {
    trackRecentSubject(subject);
    router.push(`/class/${encodeURIComponent(subject)}`);
  };

  const openEdit = (cls: Class) => {
    setEditClassId(cls.id);
    const folderColorObj = cls.folderColor
      ? FOLDER_COLORS.find(c => c.value === cls.folderColor) || getDefaultFolderColor(cls.subject)
      : getDefaultFolderColor(cls.subject);
    setEditName(cls.folderName || cls.subject);
    setEditColor(cls.folderColor || folderColorObj.value);
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!editClassId) return;
    updateClass(editClassId, { folderName: editName, folderColor: editColor });
    toast.success('Folder diperbarui!');
    setEditOpen(false);
  };

  const handleCreateFolder = () => {
    if (!newSubjectName.trim()) return;
    addClass({
      name: newClassName || newSubjectName,
      subject: newSubjectName,
      teacherId: 'teacher1',
      studentIds: [],
      folderColor: newFolderColor,
      gradeWeights: { assignments: 40, quizzes: 30, p5Project: 30 },
      kkm: 75,
    });
    toast.success(`Folder "${newSubjectName}" berhasil dibuat!`);
    setNewFolderOpen(false);
    setNewSubjectName('');
    setNewClassName('');
    setNewFolderColor(FOLDER_COLORS[0].value);
  };

  const recentItems = recentSubjects
    .map(s => ({ subject: s, clsList: subjectGroups.get(s) ?? [] }))
    .filter(r => r.clsList.length > 0);

  const handleDeleteFolder = (subject: string, classesToDel: any[]) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kelas ${subject}?`)) {
      classesToDel.forEach(c => deleteClass(c.id));
      toast.success(`Kelas ${subject} berhasil dihapus!`);
    }
  };

  // Filtered subjects
  const filteredEntries = subjectEntries.filter(([subject]) =>
    !search || subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} className="pb-12 space-y-8">

      {/* ── Terkini (Recent) ── */}
      {recentItems.length > 0 && (
        <div className="recent-section">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-[15px] font-bold text-foreground tracking-[-0.2px]">Terkini</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {recentItems.map(({ subject, clsList }) => {
              const repCls = clsList[0];
              const folderColorObj = repCls.folderColor
                ? FOLDER_COLORS.find(c => c.value === repCls.folderColor) || getDefaultFolderColor(subject)
                : getDefaultFolderColor(subject);
              const totalM = clsList.reduce((s, c) => s + getMaterialsByClass(c.id).length, 0);
              const totalA = clsList.reduce((s, c) => s + getAssignmentsByClass(c.id).length, 0);
              const totalQ = clsList.reduce((s, c) => s + getQuizzesByClass(c.id).length, 0);

              return (
                <div key={subject} className="folder-card">
                  <MacFolderCard
                    title={repCls.folderName || subject}
                    folderColor={folderColorObj.value}
                    textColor={folderColorObj.text}
                    materialCount={mounted ? totalM : 0}
                    assignmentCount={mounted ? totalA : 0}
                    quizCount={mounted ? totalQ : 0}
                    onOpen={() => handleFolderOpen(subject)}
                    onEdit={() => openEdit(repCls)}
                    onDelete={() => handleDeleteFolder(subject, clsList)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Semua Mata Pelajaran ── */}
      <div>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <h3 className="text-[15px] font-bold text-foreground tracking-[-0.2px]">Mata Pelajaran</h3>
            <Badge variant="secondary" className="text-[10px] h-5">{filteredEntries.length} Folder</Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari mata pelajaran..."
                className="h-9 w-48 pl-8 pr-3 rounded-lg border border-border bg-card text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-[var(--gp-border-focus)] transition-colors"
              />
            </div>

            {/* View toggle */}
            <div className="flex items-center bg-accent/50 p-1 rounded-lg border border-border">
              <button
                onClick={() => setViewMode('folder')}
                className={cn(
                  'flex items-center justify-center p-1.5 rounded-md transition-all',
                  viewMode === 'folder' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
                title="Tampilan Folder"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex items-center justify-center p-1.5 rounded-md transition-all',
                  viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
                title="Tampilan List"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>

            {/* New folder button */}
            <Button
              size="sm"
              onClick={() => setNewFolderOpen(true)}
              className="bg-[var(--gp-action)] hover:bg-[var(--gp-action-hover)] text-white shrink-0 h-9"
            >
              <FolderPlus className="h-3.5 w-3.5 mr-1.5" />
              Folder Baru
            </Button>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-2xl text-muted-foreground gap-3">
            <Layers className="h-10 w-10 opacity-20" />
            <p className="text-sm font-medium">
              {search ? `Tidak ada mapel dengan nama "${search}"` : 'Belum ada folder mata pelajaran'}
            </p>
            {!search && (
              <Button size="sm" variant="outline" onClick={() => setNewFolderOpen(true)}>
                <FolderPlus className="h-3.5 w-3.5 mr-1.5" /> Buat Folder Pertama
              </Button>
            )}
          </div>
        ) : viewMode === 'folder' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredEntries.map(([subject, clsList]) => {
              const repCls = clsList[0];
              const folderColorObj = repCls.folderColor
                ? FOLDER_COLORS.find(c => c.value === repCls.folderColor) || getDefaultFolderColor(subject)
                : getDefaultFolderColor(subject);
              const totalM = clsList.reduce((s, c) => s + getMaterialsByClass(c.id).length, 0);
              const totalA = clsList.reduce((s, c) => s + getAssignmentsByClass(c.id).length, 0);
              const totalQ = clsList.reduce((s, c) => s + getQuizzesByClass(c.id).length, 0);

              return (
                <div key={subject} className="folder-card">
                  <MacFolderCard
                    title={repCls.folderName || subject}
                    folderColor={folderColorObj.value}
                    textColor={folderColorObj.text}
                    materialCount={mounted ? totalM : 0}
                    assignmentCount={mounted ? totalA : 0}
                    quizCount={mounted ? totalQ : 0}
                    onOpen={() => handleFolderOpen(subject)}
                    onEdit={() => openEdit(repCls)}
                    onDelete={() => handleDeleteFolder(subject, clsList)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filteredEntries.map(([subject, clsList]) => {
              const repCls = clsList[0];
              const folderColorObj = repCls.folderColor
                ? FOLDER_COLORS.find(c => c.value === repCls.folderColor) || getDefaultFolderColor(subject)
                : getDefaultFolderColor(subject);
              const totalM = clsList.reduce((s, c) => s + getMaterialsByClass(c.id).length, 0);
              const totalA = clsList.reduce((s, c) => s + getAssignmentsByClass(c.id).length, 0);
              const totalQ = clsList.reduce((s, c) => s + getQuizzesByClass(c.id).length, 0);
              const totalItems = totalM + totalA + totalQ;

              return (
                <div
                  key={subject}
                  onClick={() => handleFolderOpen(subject)}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl cursor-pointer hover:border-[var(--gp-border-focus)] hover:shadow-sm hover:-translate-y-0.5 transition-all group"
                >
                  {/* Color dot / icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: folderColorObj.value }}
                  >
                    <BookOpen className="w-5 h-5" style={{ color: folderColorObj.text }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-bold text-foreground truncate leading-snug">
                      {repCls.folderName || subject}
                    </h4>
                    <div className="flex items-center gap-3 text-[12px] text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {mounted ? totalM : 0} Materi
                      </span>
                      <span className="flex items-center gap-1">
                        <ClipboardList className="w-3 h-3" /> {mounted ? totalA : 0} Tugas
                      </span>
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" /> {mounted ? totalQ : 0} Kuis
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${folderColorObj.text}15`, color: folderColorObj.text }}
                    >
                      {mounted ? totalItems : 0} konten
                    </span>
                    <div
                      className="flex gap-1"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() => openEdit(repCls)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFolder(subject, clsList)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Edit Folder Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4" /> Edit Folder
            </DialogTitle>
          </DialogHeader>
          {editCls && (
            <div className="space-y-5 pt-2">
              <div className="flex justify-center">
                <div className="w-[180px]">
                  <MacFolderCard
                    title={editName || editCls.subject}
                    folderColor={editColor || getDefaultFolderColor(editCls.subject).value}
                    textColor={FOLDER_COLORS.find(c => c.value === editColor)?.text || getDefaultFolderColor(editCls.subject).text}
                    materialCount={getMaterialsByClass(editCls.id).length}
                    assignmentCount={getAssignmentsByClass(editCls.id).length}
                    quizCount={getQuizzesByClass(editCls.id).length}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Nama Folder</Label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder={editCls.subject} />
              </div>
              <div className="space-y-2">
                <Label>Warna Folder</Label>
                <div className="grid grid-cols-4 gap-2">
                  {FOLDER_COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={(e) => { e.stopPropagation(); setEditColor(color.value); }}
                      className={cn(
                        'h-10 rounded-lg border-2 transition-all flex items-center justify-center',
                        editColor === color.value ? 'border-primary scale-105 shadow-md' : 'border-transparent hover:border-border hover:scale-105'
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    >
                      {editColor === color.value && <CheckCircle className="h-4 w-4" style={{ color: color.text }} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setEditOpen(false)}>Batal</Button>
                <Button className="flex-1" onClick={saveEdit}>Simpan</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Buat Folder Baru Dialog ── */}
      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-4 w-4" /> Buat Folder Baru
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Preview */}
            <div className="flex justify-center">
              <div className="w-[180px]">
                <MacFolderCard
                  title={newSubjectName || 'Nama Mapel'}
                  folderColor={newFolderColor}
                  textColor={FOLDER_COLORS.find(c => c.value === newFolderColor)?.text || '#1E40AF'}
                  materialCount={0}
                  assignmentCount={0}
                  quizCount={0}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Nama Mata Pelajaran <span className="text-destructive">*</span></Label>
              <Input
                value={newSubjectName}
                onChange={e => setNewSubjectName(e.target.value)}
                placeholder="cth: Matematika Lanjut"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nama Kelas (opsional)</Label>
              <Input
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                placeholder="cth: XII IPA 3"
              />
            </div>
            <div className="space-y-2">
              <Label>Warna Folder</Label>
              <div className="grid grid-cols-4 gap-2">
                {FOLDER_COLORS.map(color => (
                  <button
                    key={color.value}
                    onClick={() => setNewFolderColor(color.value)}
                    className={cn(
                      'h-10 rounded-lg border-2 transition-all flex items-center justify-center',
                      newFolderColor === color.value ? 'border-primary scale-105 shadow-md' : 'border-transparent hover:border-border hover:scale-105'
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  >
                    {newFolderColor === color.value && (
                      <CheckCircle className="h-4 w-4" style={{ color: FOLDER_COLORS.find(c => c.value === color.value)?.text }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setNewFolderOpen(false)}>Batal</Button>
              <Button
                className="flex-1 bg-[var(--gp-action)] hover:bg-[var(--gp-action-hover)]"
                onClick={handleCreateFolder}
                disabled={!newSubjectName.trim()}
              >
                Buat Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
