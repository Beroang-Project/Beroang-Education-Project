'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import {
  User, School, Bell, Cpu, Globe, Moon, Sun, Monitor,
  Settings, Palette, X, ChevronRight, BookOpen, Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useGSAP, animations, gsap } from '@/lib/gsap-config';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type SettingsTab = 'profile' | 'appearance' | 'notifications' | 'language';

interface ProfileData {
  name: string;
  email: string;
  school: string;
  bio: string;
}

interface PreferencesData {
  notifications: boolean;
  aiAutoSuggest: boolean;
  language: string;
}

const settingsNav = [
  {
    label: 'PROFIL',
    items: [
      { id: 'profile' as SettingsTab, label: 'Profil Guru', icon: User },
    ],
  },
  {
    label: 'PREFERENSI',
    items: [
      { id: 'appearance' as SettingsTab, label: 'Tampilan', icon: Palette },
      { id: 'notifications' as SettingsTab, label: 'Notifikasi', icon: Bell },
      { id: 'language' as SettingsTab, label: 'Bahasa', icon: Globe },
    ],
  },
];

const themeOptions = [
  { value: 'light', label: 'Cahaya', desc: 'Tampilan terang untuk kondisi pencahayaan baik', icon: Sun, bg: 'bg-gradient-to-br from-white to-gray-50', border: 'border-gray-200', accent: 'text-yellow-500' },
  { value: 'dark', label: 'Gelap', desc: 'Tampilan gelap untuk kenyamanan mata', icon: Moon, bg: 'bg-gradient-to-br from-gray-800 to-gray-900', border: 'border-gray-700', accent: 'text-blue-400' },
  { value: 'system', label: 'Sistem', desc: 'Mengikuti pengaturan perangkat Anda', icon: Monitor, bg: 'bg-gradient-to-br from-primary/20 to-primary/5', border: 'border-primary/30', accent: 'text-primary' },
];

const profileStorageKey = 'greenpath-profile';
const prefsStorageKey = 'greenpath-preferences';

function loadProfile(): ProfileData {
  if (typeof window === 'undefined') return { name: 'Guru Utama', email: 'guru@sma1.sch.id', school: 'SMA Negeri 1', bio: 'Guru Biologi dengan pengalaman 8 tahun mengajar Kurikulum Merdeka.' };
  try {
    const raw = localStorage.getItem(profileStorageKey);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { name: 'Guru Utama', email: 'guru@sma1.sch.id', school: 'SMA Negeri 1', bio: 'Guru Biologi dengan pengalaman 8 tahun mengajar Kurikulum Merdeka.' };
}

function loadPreferences(): PreferencesData {
  if (typeof window === 'undefined') return { notifications: true, aiAutoSuggest: true, language: 'id' };
  try {
    const raw = localStorage.getItem(prefsStorageKey);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { notifications: true, aiAutoSuggest: true, language: 'id' };
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [profile, setProfile] = useState<ProfileData>({ name: '', email: '', school: '', bio: '' });
  const [prefs, setPrefs] = useState<PreferencesData>({ notifications: true, aiAutoSuggest: true, language: 'id' });
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setPrefs(loadPreferences());
    setProfileLoaded(true);
    setMounted(true);
  }, []);

  const animateTabSwitch = useCallback(() => {
    if (contentRef.current) {
      const sections = contentRef.current.querySelectorAll('.settings-section');
      if (sections.length > 0) {
        gsap.fromTo(
          sections,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out', clearProps: 'transform,opacity' }
        );
      }
    }
  }, []);

  useGSAP(() => {
    if (panelRef.current) {
      animations.scaleIn(panelRef.current, 0);
    }
    const navItems = containerRef.current?.querySelectorAll('.settings-nav-item');
    if (navItems && navItems.length > 0) {
      animations.staggerFadeIn(navItems, 0.03);
    }
    setTimeout(animateTabSwitch, 100);
  }, { scope: containerRef });

  useEffect(() => {
    if (mounted) animateTabSwitch();
  }, [activeTab, mounted, animateTabSwitch]);

  const handleSaveProfile = () => {
    localStorage.setItem(profileStorageKey, JSON.stringify(profile));
    toast.success('Profil berhasil disimpan!');
  };

  const handleSavePrefs = () => {
    localStorage.setItem(prefsStorageKey, JSON.stringify(prefs));
    toast.success('Pengaturan berhasil disimpan!');
  };

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
  };

  const initials = profile.name ? profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'GU';

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        ref={panelRef}
        className="w-full max-w-5xl h-[85vh] bg-background rounded-2xl shadow-2xl border border-border flex overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Sidebar ── */}
        <div className="w-64 border-r border-border bg-card/50 flex flex-col shrink-0">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <h1 className="font-display text-xl font-bold">Pengaturan</h1>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-4">
            {settingsNav.map((section) => (
              <div key={section.label}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-2">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={cn(
                        "settings-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                        activeTab === item.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {activeTab === item.id && <ChevronRight className="h-4 w-4 opacity-50" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile.name || 'Guru Utama'}</p>
                <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto">
          <div ref={contentRef} className="p-6 max-w-2xl">

            {/* ═══ Profile Tab ═══ */}
            {activeTab === 'profile' && (
              <div className="settings-section space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Profil Guru</h2>
                  <p className="text-sm text-muted-foreground">Kelola informasi profil Anda</p>
                </div>

                <div className="flex items-center gap-5 p-5 rounded-xl border border-border bg-card/50">
                  <Avatar className="h-20 w-20 shrink-0 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold mb-1">{profile.name || 'Guru Utama'}</p>
                    <Button variant="outline" size="sm" className="text-xs">
                      <User className="h-3.5 w-3.5 mr-1.5" /> Ganti Foto
                    </Button>
                    <p className="text-[11px] text-muted-foreground mt-1.5">JPG, PNG maks 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Nama Lengkap</Label>
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                      placeholder="Nama lengkap Anda"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <School className="h-3.5 w-3.5" /> Asal Sekolah
                  </Label>
                  <Input
                    value={profile.school}
                    onChange={(e) => setProfile(p => ({ ...p, school: e.target.value }))}
                    placeholder="Nama sekolah Anda"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Bio Singkat</Label>
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Ceritakan sedikit tentang diri Anda..."
                    className="min-h-[100px] text-sm resize-none"
                  />
                </div>

                <Button onClick={handleSaveProfile} className="w-full bg-[var(--gp-action)] hover:bg-[var(--gp-action-hover)]">
                  <Save className="h-4 w-4 mr-2" /> Simpan Perubahan
                </Button>
              </div>
            )}

            {/* ═══ Appearance Tab ═══ */}
            {activeTab === 'appearance' && (
              <div className="settings-section space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Tampilan</h2>
                  <p className="text-sm text-muted-foreground">Sesuaikan tampilan workspace Anda agar lebih nyaman</p>
                </div>

                {!mounted ? (
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse space-y-3">
                        <div className="h-32 rounded-xl bg-muted" />
                        <div className="h-4 w-24 rounded bg-muted" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {themeOptions.map((opt) => {
                      const isActive = theme === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setTheme(opt.value)}
                          className={cn(
                            "group text-left rounded-xl border-2 p-3 transition-all duration-200",
                            isActive
                              ? "border-primary shadow-lg shadow-primary/10"
                              : "border-border hover:border-primary/30 hover:shadow-md"
                          )}
                        >
                          <div className={cn("h-28 rounded-lg mb-3 border overflow-hidden flex flex-col justify-end p-2", opt.bg, opt.border)}>
                            <div className="space-y-1.5">
                              <div className={cn("h-1.5 rounded-full w-8", isActive ? "bg-primary" : "bg-foreground/15")} />
                              <div className="flex gap-1">
                                <div className={cn("h-1 rounded-full flex-1", isActive ? "bg-primary/60" : "bg-foreground/10")} />
                                <div className={cn("h-1 rounded-full flex-[0.6]", isActive ? "bg-primary/40" : "bg-foreground/8")} />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <div className={cn(
                              "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                              isActive ? "border-primary" : "border-muted-foreground/30"
                            )}>
                              {isActive && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="text-sm font-semibold block">{opt.label}</span>
                              <span className="text-[11px] text-muted-foreground leading-tight block">{opt.desc}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ═══ Notifications Tab ═══ */}
            {activeTab === 'notifications' && (
              <div className="settings-section space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Notifikasi</h2>
                  <p className="text-sm text-muted-foreground">Atur preferensi notifikasi Anda</p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      key: 'notifications' as const,
                      label: 'Notifikasi Deadline',
                      desc: 'Ingatkan tugas yang mendekati deadline secara otomatis',
                      icon: Bell,
                      color: 'text-amber-500',
                      bg: 'bg-amber-500/10',
                    },
                    {
                      key: 'aiAutoSuggest' as const,
                      label: 'Saran AI Otomatis',
                      desc: 'AI memberikan rekomendasi konten saat membuka kelas',
                      icon: Cpu,
                      color: 'text-blue-500',
                      bg: 'bg-blue-500/10',
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", item.bg)}>
                          <item.icon className={cn("h-5 w-5", item.color)} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{item.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={prefs[item.key]}
                        onCheckedChange={(v) => setPrefs(p => ({ ...p, [item.key]: v }))}
                      />
                    </div>
                  ))}
                </div>

                <Button onClick={handleSavePrefs} className="w-full bg-[var(--gp-action)] hover:bg-[var(--gp-action-hover)]">
                  <Save className="h-4 w-4 mr-2" /> Simpan Perubahan
                </Button>
              </div>
            )}

            {/* ═══ Language Tab ═══ */}
            {activeTab === 'language' && (
              <div className="settings-section space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Bahasa</h2>
                  <p className="text-sm text-muted-foreground">Pilih bahasa untuk antarmuka GreenPath</p>
                </div>

                <div className="space-y-3">
                  {[
                    { value: 'id', label: 'Bahasa Indonesia', desc: 'Bahasa default untuk pengguna Indonesia', flag: '🇮🇩' },
                    { value: 'en', label: 'English', desc: 'English language for international users', flag: '🇺🇸' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setPrefs(p => ({ ...p, language: opt.value }));
                        localStorage.setItem(prefsStorageKey, JSON.stringify({ ...prefs, language: opt.value }));
                        toast.success(`Bahasa diubah ke ${opt.label}`);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200",
                        prefs.language === opt.value
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                          : "border-border hover:border-primary/30 hover:shadow-sm"
                      )}
                    >
                      <span className="text-2xl">{opt.flag}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{opt.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                        prefs.language === opt.value ? "border-primary" : "border-muted-foreground/30"
                      )}>
                        {prefs.language === opt.value && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <Separator />

                <div className="p-4 rounded-xl border border-border bg-muted/30">
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Tentang Bahasa</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Saat ini GreenPath mendukung Bahasa Indonesia dan English. Perubahan bahasa akan mempengaruhi seluruh teks antarmuka di aplikasi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Close Button ── */}
        <button
          onClick={() => router.push('/dashboard')}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors z-10"
          aria-label="Tutup pengaturan"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
