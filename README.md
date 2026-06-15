# GreenPath — AI-Powered Teaching & P5 Operating System

**GreenPath** (Beroang) adalah platform all-in-one untuk guru Indonesia dalam implementasi **Kurikulum Merdeka**. Membantu seluruh alur kerja pengajaran — dari perencanaan, pelaksanaan, asesmen, hingga manajemen proyek **P5** (Projek Penguatan Profil Pelajar Pancasila).

## Fitur

| Modul | Deskripsi |
|-------|-----------|
| **Smart Learning Space** (`/class`) | Kelola folder mata pelajaran, materi, tugas, dan kuis per subjek. Tampilan grid/list dengan Mac-style folder card. |
| **AI Teaching Planner** (`/planner`) | Generate otomatis Alur Pembelajaran, Modul Ajar, Aktivitas Belajar, Quiz, Rubrik, dan Ide Integrasi P5 berbasis prompt. |
| **Assessment Engine** (`/assessment`) | Input nilai siswa dengan KKM dan bobot nilai yang dapat dikonfigurasi. Ekspor ke Excel/PDF. |
| **P5 Project Workspace** (`/p5`) | Kanban board drag-and-drop untuk manajemen proyek P5 (Proposal → Pelaksanaan → Dokumentasi → Laporan Akhir). |
| **Teacher Analytics** (`/analytics`) | Visualisasi grafik nilai rata-rata, status proyek P5, dan aktivitas siswa. Ekspor Excel/PDF. |
| **AI Assistant** (`/asisten-ai`) | Chat asisten AI (Beroang) untuk konsultasi pengembangan pembelajaran. |
| **Settings** (`/settings`) | Profil guru, tema (light/dark/system), preferensi notifikasi & AI, bahasa (id/en). |

## Tech Stack

| Teknologi | Versi |
|-----------|-------|
| [Next.js](https://nextjs.org/) | 16.2.6 |
| [React](https://react.dev/) | 19.2.4 |
| [TypeScript](https://www.typescriptlang.org/) | ^5 |
| [Tailwind CSS v4](https://tailwindcss.com/) | ^4 |
| [shadcn/ui](https://ui.shadcn.com/) (radix-nova) | ^4.11.0 |
| [Zustand](https://zustand-demo.pmnd.rs/) | ^5.0.14 |
| [GSAP](https://gsap.com/) | ^3.15.0 |
| [Recharts](https://recharts.org/) | ^3.8.1 |
| [react-hook-form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | |
| [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) | Drag-and-drop Kanban |
| [xlsx](https://sheetjs.com/) + [jsPDF](https://github.com/parallax/jsPDF) | Ekspor Excel/PDF |
| [next-themes](https://github.com/pacocoursey/next-themes) | Tema light/dark/system |

## Memulai

### Prasyarat

- Node.js 18+ (direkomendasikan 20+)
- npm / yarn / pnpm

### Instalasi

```bash
git clone <repository-url>
cd greenpath
npm install
```

### Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Scripts

| Script | Perintah |
|--------|----------|
| `npm run dev` | `next dev` — development server |
| `npm run build` | `next build` — production build |
| `npm run start` | `next start` — production server |
| `npm run lint` | `eslint` — linting |
| `npm run format` | `prettier --write` — formatting |
| `npm run typecheck` | `tsc --noEmit` — type checking |

## Struktur Proyek

```
app/
├── globals.css                 # Tailwind v4 + design tokens (Forest-Tech)
├── layout.tsx                  # Root layout (ThemeProvider, Toaster)
├── page.tsx                    # Redirect → /dashboard
├── login/                      # Multi-step login
└── (dashboard)/
    ├── layout.tsx              # Sidebar + Header
    ├── dashboard/page.tsx      # Home dashboard
    ├── class/
    │   ├── page.tsx            # Smart Learning Space
    │   └── [subject]/page.tsx  # Subject detail + roadmap
    ├── planner/page.tsx        # AI Teaching Planner
    ├── assessment/[classId]/   # Assessment Engine
    ├── analytics/page.tsx      # Teacher Analytics
    ├── p5/[projectId]/page.tsx # P5 Kanban Workspace
    ├── asisten-ai/page.tsx     # AI Assistant chat
    └── settings/page.tsx       # Settings

components/
├── ui/                         # 28 shadcn/ui components
└── layout/                     # AppSidebar, AppHeader, navigation

store/                          # 5 Zustand stores
├── classStore.ts
├── assessmentStore.ts
├── plannerStore.ts
├── p5Store.ts
└── aiAssistantStore.ts

lib/                            # Utilities, mock data, AI templates
types/                          # TypeScript interfaces
hooks/                          # Custom hooks
```

## Arsitektur Data

Saat ini seluruh data berjalan **client-side** dengan **localStorage** (via Zustand persist middleware) dan **mock data** di `lib/mockData.ts`. Tidak ada backend atau API eksternal.

- AI Planner menggunakan template markdown lokal (`lib/aiTemplates.ts`)
- AI Assistant menggunakan respons simulasi
- Auth menggunakan simulasi delay (1.2 detik)

## Tema & Desain

GreenPath menggunakan palet **Forest-Tech** dengan:
- Nuansa hijau forest (`#4ADE80` — `#071A0E`)
- Cream tones (`#F9F7F3`)
- Emas & merah sebagai aksen
- OKLCH color space
- Utility classes kustom: `.gp-glass`, `.gp-glow`, `.gp-card`, `.gp-gradient-text`

## Lisensi

Hak cipta © 2024 — Proyek internal.
