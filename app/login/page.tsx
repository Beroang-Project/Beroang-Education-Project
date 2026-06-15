'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Leaf, Eye, EyeOff, GraduationCap, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginForm = z.infer<typeof loginSchema>;

type Step = 'role' | 'login' | 'onboarding';
type Role = 'teacher' | 'student';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<Role>('teacher');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (_data: LoginForm) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsLoading(false);
    toast.success('Selamat datang di GreenPath! 🌿');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col w-[52%] relative overflow-hidden bg-sidebar p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 w-72 h-72 rounded-full bg-emerald-400/8 blur-3xl" />
        </div>

        {/* SVG leaf decoration */}
        <svg className="absolute right-12 top-24 opacity-10" width="220" height="300" viewBox="0 0 220 300" fill="none">
          <path d="M110 10 C10 80 0 200 110 290 C220 200 210 80 110 10Z" fill="#4ade80" />
          <path d="M110 10 L110 290" stroke="#4ade80" strokeWidth="2" opacity="0.5"/>
          <path d="M110 60 C80 80 70 120 80 160" stroke="#4ade80" strokeWidth="1.5" opacity="0.4"/>
          <path d="M110 100 C140 115 150 145 145 175" stroke="#4ade80" strokeWidth="1.5" opacity="0.4"/>
        </svg>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 mb-auto">
          <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Leaf className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-display font-bold text-sidebar-foreground text-xl">GreenPath</p>
            <p className="text-xs text-sidebar-foreground/50">AI Teaching & P5 OS</p>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 mt-auto">
          <h2 className="font-display font-bold text-4xl text-sidebar-foreground leading-tight mb-4">
            Satu platform.<br />
            <span className="text-primary">Semua alur kerja guru.</span>
          </h2>
          <p className="text-sidebar-foreground/60 text-base leading-relaxed mb-8 max-w-sm">
            Rencanakan pembelajaran, kelola kelas, nilai siswa, dan pantau proyek P5 dalam satu sistem yang terhubung.
          </p>

          {/* Feature list */}
          {['AI generate modul ajar dalam 3 detik', 'Nilai siswa terhitung otomatis real-time', 'Kanban P5 dengan drag & drop', 'Export Excel & PDF satu klik'].map((feat) => (
            <div key={feat} className="flex items-center gap-2.5 mb-2.5">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm text-sidebar-foreground/70">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Logo for mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-xl">GreenPath</span>
          </div>

          {/* Step: Role Selection */}
          {step === 'role' && (
            <div>
              <h2 className="font-display font-bold text-2xl mb-1">Masuk sebagai apa?</h2>
              <p className="text-muted-foreground text-sm mb-8">Pilih peran Anda di GreenPath</p>

              <div className="space-y-3 mb-8">
                {([
                  { value: 'teacher', label: 'Guru', desc: 'Kelola kelas, buat materi, nilai siswa', icon: GraduationCap },
                  { value: 'student', label: 'Siswa', desc: 'Akses materi, kerjakan tugas & kuis', icon: BookOpen },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRole(opt.value)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer',
                      role === opt.value
                        ? 'border-primary bg-primary/8'
                        : 'border-border hover:border-primary/40 bg-card'
                    )}
                  >
                    <div className={cn(
                      'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                      role === opt.value ? 'bg-primary/20' : 'bg-muted'
                    )}>
                      <opt.icon className={cn('h-5 w-5', role === opt.value ? 'text-primary' : 'text-muted-foreground')} />
                    </div>
                    <div>
                      <p className={cn('font-semibold text-sm', role === opt.value ? 'text-primary' : 'text-foreground')}>{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                    {role === opt.value && <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />}
                  </button>
                ))}
              </div>

              <Button className="w-full" onClick={() => setStep('login')}>
                Lanjut sebagai {role === 'teacher' ? 'Guru' : 'Siswa'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step: Login form */}
          {step === 'login' && (
            <div>
              <button onClick={() => setStep('role')} className="text-xs text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1 cursor-pointer">
                ← Ganti peran
              </button>
              <h2 className="font-display font-bold text-2xl mb-1">
                Masuk sebagai {role === 'teacher' ? 'Guru' : 'Siswa'}
              </h2>
              <p className="text-muted-foreground text-sm mb-8">Selamat datang kembali di GreenPath</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="guru@sekolah.sch.id"
                    {...register('email')}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('password')}
                      className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>

                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                      Masuk...
                    </span>
                  ) : 'Masuk ke GreenPath'}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Demo: gunakan email & password apapun
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
