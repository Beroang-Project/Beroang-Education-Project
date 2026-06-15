'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { User, School, Bell, Cpu, Globe, Save, Moon, Sun, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState({ name: 'Guru Utama', email: 'guru@sma1.sch.id', school: 'SMA Negeri 1', bio: 'Guru Biologi dengan pengalaman 8 tahun mengajar Kurikulum Merdeka.' });
  const [prefs, setPrefs] = useState({ notifications: true, aiAutoSuggest: true, language: 'id' });

  const handleSave = () => toast.success('Pengaturan berhasil disimpan!');

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Kelola profil dan preferensi akun Anda</p>
      </div>

      {/* Profile */}
      <Card className="gp-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Profil Guru
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">GU</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">Ganti Foto</Button>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG maks 2MB</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nama Lengkap</Label>
              <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><School className="h-3.5 w-3.5" /> Asal Sekolah</Label>
            <Input value={profile.school} onChange={e => setProfile(p => ({ ...p, school: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Bio Singkat</Label>
            <Textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} className="min-h-[80px] text-sm" />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="gp-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold">Tampilan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Monitor },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${theme === opt.value ? 'border-primary bg-primary/8' : 'border-border hover:border-primary/40'}`}
              >
                <opt.icon className={`h-5 w-5 ${theme === opt.value ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium ${theme === opt.value ? 'text-primary' : 'text-muted-foreground'}`}>{opt.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="gp-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" /> Preferensi AI & Notifikasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'notifications', label: 'Notifikasi Deadline', desc: 'Ingatkan tugas yang mendekati deadline', icon: Bell },
            { key: 'aiAutoSuggest', label: 'Saran AI Otomatis', desc: 'AI memberikan rekomendasi konten saat membuka kelas', icon: Cpu },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <Switch
                checked={prefs[item.key as keyof typeof prefs] as boolean}
                onCheckedChange={v => setPrefs(p => ({ ...p, [item.key]: v }))}
              />
            </div>
          ))}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Bahasa Antarmuka</p>
                <p className="text-xs text-muted-foreground">Bahasa yang digunakan di GreenPath</p>
              </div>
            </div>
            <Select value={prefs.language} onValueChange={v => setPrefs(p => ({ ...p, language: v }))}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full" size="lg">
        <Save className="h-4 w-4 mr-2" /> Simpan Perubahan
      </Button>
    </div>
  );
}
