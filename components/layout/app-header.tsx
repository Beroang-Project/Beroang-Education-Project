'use client';

import { usePathname } from 'next/navigation';
import { Bell, PanelLeftClose, PanelLeft, Home, BrainCircuit, Map, BookOpen, Package, BarChart3, Settings, Plus, Sparkles, FileText, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useMemo } from 'react';
import { ModeToggle } from '@/components/mode-toggle';
import { useGSAP, gsap } from '@/lib/gsap-config';
import { useAssessmentStore } from '@/store/assessmentStore';
import { useClassStore } from '@/store/classStore';
import { useP5Store } from '@/store/p5Store';
import { calculateFinalGrade, cn } from '@/lib/utils';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Beranda',
  '/planner': 'Roadmap',
  '/analytics': 'Analitik',
  '/settings': 'Pengaturan',
  '/asisten-ai': 'Asisten AI',
  '/assessment': 'Assessment',
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith('/class/')) return 'Smart Learning Space';
  if (pathname.startsWith('/assessment/')) return 'Assessment';
  if (pathname.startsWith('/p5/')) return 'Ruang P5';
  return 'GreenPath';
}

interface AppHeaderProps {
  openSearch: boolean;
  setOpenSearch: (open: boolean) => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function AppHeader({ openSearch, setOpenSearch, sidebarCollapsed, onToggleSidebar }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { students, classWeights, classKKM } = useAssessmentStore();
  const { classes } = useClassStore();
  const { groups } = useP5Store();

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 1) return [];
    const query = searchQuery.toLowerCase();
    return students
      .filter(s => s.name.toLowerCase().startsWith(query))
      .slice(0, 5)
      .map(student => {
        const cls = classes.find(c => c.id === student.classId);
        if (!cls) return null;
        const weights = classWeights[student.classId] || cls.gradeWeights;
        const kkm = classKKM[student.classId] || cls.kkm;
        const finalGrade = calculateFinalGrade(student, { ...cls, gradeWeights: weights, kkm });
        const p5Group = groups.find(g => g.id === student.p5GroupId);
        const teammates = p5Group
          ? p5Group.memberIds
              .filter(id => id !== student.id)
              .map(id => students.find(s => s.id === id)?.name)
              .filter(Boolean)
          : [];
        return {
          ...student,
          className: cls.name || cls.subject || '-',
          subject: cls.subject || '-',
          finalGrade,
          kkm,
          p5Group: p5Group?.name || null,
          p5Status: p5Group?.status || null,
          teammates,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [searchQuery, students, classes, classWeights, classKKM, groups]);

  useGSAP(() => {
    gsap.from(headerRef.current, { y: -10, opacity: 0, duration: 0.5, ease: 'power2.out' });
  }, { scope: headerRef });

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && e.ctrlKey) {
        e.preventDefault();
        setOpenSearch(!openSearch);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [openSearch, setOpenSearch]);

  const runCommand = (command: () => void) => {
    setOpenSearch(false);
    command();
  };

  const title = getPageTitle(pathname);

  return (
    <header ref={headerRef} className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleSidebar}
            title={sidebarCollapsed ? 'Tampilkan Sidebar' : 'Sembunyikan Sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        )}
        <Separator orientation="vertical" className="mr-2 h-4 hidden md:block" />
      </div>

      {/* Page title */}
      <div className="flex-1">
        <h1 className="font-display font-bold text-lg text-foreground leading-none">{title}</h1>
      </div>

      <CommandDialog open={openSearch} onOpenChange={(open) => { setOpenSearch(open); if (!open) setSearchQuery(''); }}>
        <CommandInput placeholder="Cari siswa, halaman, atau perintah..." value={searchQuery} onValueChange={setSearchQuery} />
        <CommandList>
          <CommandEmpty>Tidak ada hasil yang ditemukan.</CommandEmpty>

          {searchResults.length > 0 && (
            <CommandGroup heading="Siswa">
              {searchResults.map((student) => (
                <CommandItem
                  key={student.id}
                  onSelect={() => runCommand(() => router.push(`/assessment/${student.classId}`))}
                  className="flex flex-col items-start gap-1 py-3"
                >
                  <div className="flex items-center gap-2 w-full">
                    <User className="h-4 w-4 shrink-0" />
                    <span className="font-semibold">{student.name}</span>
                    <span className="text-[11px] text-muted-foreground ml-auto">{student.className}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground pl-6 w-full">
                    <span className={cn(
                      "font-semibold",
                      student.finalGrade >= student.kkm ? "text-primary" : "text-destructive"
                    )}>
                      Nilai: {student.finalGrade}
                    </span>
                    {student.p5Group && (
                      <span>P5: {student.p5Group}</span>
                    )}
                    {student.teammates.length > 0 && (
                      <span>Tim: {student.teammates.join(', ')}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {searchQuery.length < 1 && (
            <>
              <CommandGroup heading="Navigasi">
                <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
                  <Home className="h-4 w-4" />
                  <span>Beranda</span>
                  <CommandShortcut>⌘H</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/asisten-ai'))}>
                  <BrainCircuit className="h-4 w-4" />
                  <span>Asisten AI</span>
                  <CommandShortcut>⌘A</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/planner'))}>
                  <Map className="h-4 w-4" />
                  <span>AI Teaching Planner</span>
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/class'))}>
                  <BookOpen className="h-4 w-4" />
                  <span>Smart Learning Space</span>
                  <CommandShortcut>⌘L</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/p5/p1'))}>
                  <Package className="h-4 w-4" />
                  <span>Ruang P5</span>
                  <CommandShortcut>⌘5</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/analytics'))}>
                  <BarChart3 className="h-4 w-4" />
                  <span>Analitik</span>
                  <CommandShortcut>⌘D</CommandShortcut>
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Aksi Cepat">
                <CommandItem onSelect={() => runCommand(() => router.push('/planner'))}>
                  <Sparkles className="h-4 w-4" />
                  <span>Buat Roadmap Baru</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/class'))}>
                  <Plus className="h-4 w-4" />
                  <span>Buat Folder Kelas Baru</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/asisten-ai'))}>
                  <MessageSquare className="h-4 w-4" />
                  <span>Percakapan AI Baru</span>
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Pengaturan">
                <CommandItem onSelect={() => runCommand(() => router.push('/settings'))}>
                  <Settings className="h-4 w-4" />
                  <span>Pengaturan</span>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative" aria-label="Notifikasi">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 p-0 flex items-center justify-center text-[8px] bg-primary text-primary-foreground border-0">
                2
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex flex-col gap-1 p-2 max-h-64 overflow-y-auto">
              <div className="flex flex-col gap-1 p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted">
                <span className="text-xs font-semibold">Modul AI Selesai</span>
                <span className="text-[11px] text-muted-foreground">Modul Biologi Bab 2 berhasil di-generate.</span>
              </div>
              <div className="flex flex-col gap-1 p-2 rounded-lg cursor-pointer hover:bg-muted">
                <span className="text-xs font-semibold">Tugas Masuk</span>
                <span className="text-[11px] text-muted-foreground">15 siswa kelas X IPA 1 mengumpulkan tugas.</span>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer border border-border hover:border-primary/40 transition-colors">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">GU</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Guru Utama</p>
                <p className="text-xs leading-none text-muted-foreground">guru@greenpath.id</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
