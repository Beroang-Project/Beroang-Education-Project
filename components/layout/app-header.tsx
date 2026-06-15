'use client';

import { usePathname } from 'next/navigation';
import { Bell, Moon, Sun, Search, Command } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/planner': 'AI Teaching Planner',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith('/class/')) return 'Smart Learning Space';
  if (pathname.startsWith('/assessment/')) return 'Assessment Engine';
  if (pathname.startsWith('/p5/')) return 'P5 Project Workspace';
  return 'GreenPath';
}

export function AppHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [openSearch, setOpenSearch] = useState(false);
  const router = useRouter();

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenSearch((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpenSearch(false);
    command();
  };

  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="mr-2 h-4 hidden md:block" />
      </div>

      {/* Page title */}
      <div className="flex-1">
        <h1 className="font-display font-bold text-lg text-foreground leading-none">{title}</h1>
      </div>

      {/* Search trigger */}
      <button
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-muted-foreground text-xs hover:border-primary/40 hover:bg-muted transition-all cursor-pointer"
        onClick={() => setOpenSearch(true)}
      >
        <Search className="h-3.5 w-3.5" />
        <span>Cari halaman...</span>
        <kbd className="ml-2 px-1.5 py-0.5 rounded bg-background border border-border text-[10px] flex items-center gap-0.5">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <CommandDialog open={openSearch} onOpenChange={setOpenSearch}>
        <CommandInput placeholder="Ketik perintah atau cari..." />
        <CommandList>
          <CommandEmpty>Tidak ada hasil yang ditemukan.</CommandEmpty>
          <CommandGroup heading="Saran">
            <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>Beranda</CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/planner'))}>AI Teaching Planner</CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/p5/p1'))}>P5 Workspace</CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/analytics'))}>Analytics</CommandItem>
          </CommandGroup>
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

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle tema</TooltipContent>
        </Tooltip>

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
