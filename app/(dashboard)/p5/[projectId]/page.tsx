'use client';

import { useState, useRef, CSSProperties } from 'react';
import { useParams } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Users, Calendar, CheckCircle2, Circle, ChevronRight, MessageSquare, X, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useP5Store } from '@/store/p5Store';
import { useClassStore } from '@/store/classStore';
import { getInitials, getAvatarColor, cn } from '@/lib/utils';
import { useGSAP, animations } from '@/lib/gsap-config';
import type { P5Group } from '@/types';

type KanbanStatus = P5Group['status'];

const COLUMNS: { id: KanbanStatus; label: string; color: string; bgColor: string }[] = [
  { id: 'proposal', label: 'Proposal', color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20' },
  { id: 'in_progress', label: 'Pelaksanaan', color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/20' },
  { id: 'documentation', label: 'Dokumentasi', color: 'text-violet-400', bgColor: 'bg-violet-500/10 border-violet-500/20' },
  { id: 'final_report', label: 'Laporan Akhir', color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/20' },
];

export default function P5WorkspacePage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const containerRef = useRef<HTMLDivElement>(null);

  const { groups, updateGroupStatus, addFeedback, validateMilestone, addGroup } = useP5Store();
  const { students } = useClassStore();

  const [selectedGroup, setSelectedGroup] = useState<P5Group | null>(null);
  const [feedback, setFeedback] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const projectGroups = groups.filter(g => g.projectId === projectId);

  // Fix for react-beautiful-dnd / @hello-pangea/dnd in strict mode
  useGSAP(() => {
    setMounted(true);
    animations.fadeInUp('.kanban-header', 0);
    animations.staggerFadeIn('.kanban-column', 0.08);
  }, { scope: containerRef });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as KanbanStatus;
    updateGroupStatus(draggableId, newStatus);
    toast.success(`Kelompok dipindahkan ke "${COLUMNS.find(c => c.id === newStatus)?.label}"`);
  };

  const handleSendFeedback = () => {
    if (!selectedGroup || !feedback.trim()) return;
    addFeedback(selectedGroup.id, feedback);
    setFeedback('');
    toast.success('Feedback terkirim!');
    setSelectedGroup(prev => prev ? { ...prev, teacherFeedback: feedback } : null);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    addGroup({
      projectId,
      name: newGroupName,
      memberIds: selectedMembers,
      status: 'proposal',
      milestones: [
        { id: 'm1', title: 'Proposal disetujui', completed: false },
        { id: 'm2', title: 'Pelaksanaan proyek', completed: false },
        { id: 'm3', title: 'Dokumentasi selesai', completed: false },
        { id: 'm4', title: 'Laporan akhir', completed: false },
      ],
    });
    setNewGroupName('');
    setSelectedMembers([]);
    setCreateOpen(false);
    toast.success('Kelompok baru dibuat!');
  };

  const handleDeleteGroup = (groupId: string) => {
    // Mock delete logic
    toast.success('Kelompok berhasil dihapus');
    setSelectedGroup(null);
  };

  const currentGroup = selectedGroup ? groups.find(g => g.id === selectedGroup.id) : null;

  return (
    <div ref={containerRef} className="space-y-5 -mx-6 px-6">
      {/* Header */}
      <div className="kanban-header flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">P5 Project Workspace</h2>
          <p className="text-muted-foreground text-sm mt-1">{projectGroups.length} kelompok • Pantau progres via kanban</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Buat Kelompok
        </Button>
      </div>

      {/* Kanban Board */}
      {mounted && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-4 gap-4">
            {COLUMNS.map((col) => {
              const colGroups = projectGroups.filter(g => g.status === col.id);
              return (
                <div key={col.id} className="kanban-column flex flex-col">
                  {/* Column Header */}
                  <div className={`flex items-center justify-between px-3 py-2 rounded-lg border mb-3 ${col.bgColor}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs h-5 min-w-5 flex items-center justify-center">
                      {colGroups.length}
                    </Badge>
                  </div>

                  {/* Cards */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          'flex-1 rounded-xl min-h-[400px] p-2 space-y-2 transition-all border-2 border-dashed',
                          snapshot.isDraggingOver
                            ? 'border-primary/40 bg-primary/4'
                            : 'border-transparent'
                        )}
                      >
                        {colGroups.map((group, index) => (
                          <Draggable key={group.id} draggableId={group.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={provided.draggableProps.style as CSSProperties}
                                onClick={() => setSelectedGroup(group)}
                                className={cn(
                                  'gp-card p-3.5 cursor-pointer select-none rounded-xl transition-all',
                                  snapshot.isDragging
                                    ? 'shadow-xl shadow-black/25 rotate-1 border-primary/40'
                                    : 'hover:border-primary/30'
                                )}
                              >
                                {/* Group name */}
                                <p className="font-semibold text-sm mb-2">{group.name}</p>

                                {/* Member avatars */}
                                <div className="flex -space-x-2 mb-3">
                                  {group.memberIds.slice(0, 5).map(id => {
                                    const s = students.find(s => s.id === id);
                                    if (!s) return null;
                                    return (
                                      <div key={id} className={`h-6 w-6 rounded-full ${getAvatarColor(s.name)} flex items-center justify-center text-white text-[9px] font-bold border-2 border-background`}>
                                        {getInitials(s.name)}
                                      </div>
                                    );
                                  })}
                                  {group.memberIds.length === 0 && (
                                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                                      <Users className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>

                                {/* Milestone progress */}
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Milestone</span>
                                    <span>{group.milestones.filter(m => m.completed).length}/{group.milestones.length}</span>
                                  </div>
                                  <Progress
                                    value={(group.milestones.filter(m => m.completed).length / group.milestones.length) * 100}
                                    className="h-1.5"
                                  />
                                </div>

                                {/* Last update */}
                                <p className="text-[10px] text-muted-foreground mt-2">
                                  {group.logs.length > 0 ? group.logs[group.logs.length - 1].date : 'Belum ada update'}
                                </p>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {colGroups.length === 0 && !snapshot.isDraggingOver && (
                          <div className="h-24 flex items-center justify-center text-xs text-muted-foreground/40">
                            Tarik kartu ke sini
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Group Detail Sheet */}
      <Sheet open={!!currentGroup} onOpenChange={open => !open && setSelectedGroup(null)}>
        <SheetContent className="w-[420px] overflow-y-auto">
          {currentGroup && (
            <>
              <SheetHeader className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle className="font-display">{currentGroup.name}</SheetTitle>
                    <Badge className={cn('w-fit text-xs mt-1', COLUMNS.find(c => c.id === currentGroup.status)?.bgColor)}>
                      {COLUMNS.find(c => c.id === currentGroup.status)?.label}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteGroup(currentGroup.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </SheetHeader>

              {/* Members */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Anggota Kelompok</p>
                <div className="space-y-1.5">
                  {currentGroup.memberIds.length > 0 ? currentGroup.memberIds.map(id => {
                    const s = students.find(s => s.id === id);
                    if (!s) return null;
                    return (
                      <div key={id} className="flex items-center gap-2">
                        <div className={`h-7 w-7 rounded-full ${getAvatarColor(s.name)} flex items-center justify-center text-white text-[10px] font-bold`}>
                          {getInitials(s.name)}
                        </div>
                        <span className="text-sm">{s.name}</span>
                      </div>
                    );
                  }) : <p className="text-xs text-muted-foreground">Belum ada anggota</p>}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Milestones */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Milestone</p>
                <div className="space-y-2">
                  {currentGroup.milestones.map(m => (
                    <div key={m.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {m.completed
                          ? <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          : <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />}
                        <span className={cn('text-sm', m.completed && 'line-through text-muted-foreground')}>{m.title}</span>
                      </div>
                      {!m.completed && (
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary" onClick={() => { validateMilestone(currentGroup.id, m.id); toast.success('Milestone divalidasi!'); }}>
                          Validasi
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Logs */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Log Progres</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {[...currentGroup.logs].reverse().map(log => (
                    <div key={log.id} className="flex gap-2.5 text-xs">
                      <div className={cn('h-1.5 w-1.5 rounded-full mt-1.5 shrink-0',
                        log.type === 'milestone' ? 'bg-primary' : log.type === 'feedback' ? 'bg-amber-400' : 'bg-blue-400'
                      )} />
                      <div>
                        <p className="text-foreground">{log.description}</p>
                        <p className="text-muted-foreground">{log.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Feedback */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" /> Feedback Guru
                </p>
                {currentGroup.teacherFeedback && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5 mb-3">{currentGroup.teacherFeedback}</p>
                )}
                <Textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Tulis feedback untuk kelompok ini..."
                  className="text-sm min-h-[80px] mb-2"
                />
                <Button size="sm" className="w-full" onClick={handleSendFeedback} disabled={!feedback.trim()}>
                  Kirim Feedback
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Group Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Buat Kelompok Baru</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Nama Kelompok</Label>
                <Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Kelompok Hijau..." />
              </div>
              <div className="space-y-1.5">
                <Label>Pilih Anggota</Label>
                <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-3 bg-muted/20">
                  {students.slice(0, 10).map(s => (
                    <div key={s.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`s-${s.id}`} 
                        checked={selectedMembers.includes(s.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedMembers(prev => [...prev, s.id])
                          else setSelectedMembers(prev => prev.filter(id => id !== s.id))
                        }}
                      />
                      <label htmlFor={`s-${s.id}`} className="text-sm font-medium leading-none cursor-pointer">
                        {s.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
              Buat Kelompok
            </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
