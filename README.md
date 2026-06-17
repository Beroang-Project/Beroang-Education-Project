<div align="center">

# 🐻 Beroang

**Platform all-in-one untuk guru Indonesia dalam implementasi Kurikulum Merdeka**

*Dari perencanaan, pelaksanaan, asesmen, hingga manajemen proyek P5 — semua dalam satu platform.*

![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-Internal-4ADE80?style=flat-square)

</div>

---

## ✨ Fitur Utama

| Modul | Route | Deskripsi |
|-------|-------|-----------|
| 🗂️ **Smart Learning Space** | `/class` | Kelola folder mata pelajaran, materi, tugas, dan kuis per subjek. Tampilan grid/list dengan Mac-style folder card. |
| 🤖 **AI Teaching Planner** | `/planner` | Generate otomatis Alur Pembelajaran, Modul Ajar, Aktivitas Belajar, Quiz, Rubrik, dan Ide Integrasi P5 berbasis prompt. |
| 📊 **Assessment Engine** | `/assessment` | Input nilai siswa dengan KKM dan bobot nilai yang dapat dikonfigurasi. Ekspor ke Excel/PDF. |
| 📋 **P5 Project Workspace** | `/p5` | Kanban board drag-and-drop untuk manajemen proyek P5 — dari Proposal hingga Laporan Akhir. |
| 📈 **Teacher Analytics** | `/analytics` | Visualisasi grafik nilai rata-rata, status proyek P5, dan aktivitas siswa. Ekspor Excel/PDF. |
| 💬 **AI Assistant** | `/asisten-ai` | Chat asisten AI (Beroang) untuk konsultasi pengembangan pembelajaran. |
| ⚙️ **Settings** | `/settings` | Profil guru, tema (light/dark/system), preferensi notifikasi & AI, bahasa (id/en). |

---

## 🚀 Memulai

### Prasyarat

- **Node.js** 18+ (direkomendasikan 20+)
- **npm** / yarn / pnpm

### Instalasi

```bash
# Clone repositori
git clone <repository-url>
cd greenpath

# Install dependensi
npm install
```

### Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Build Production

```bash
npm run build
npm start
```

---

## 📜 Scripts

| Script | Perintah | Deskripsi |
|--------|----------|-----------|
| `dev` | `next dev` | Jalankan development server |
| `build` | `next build` | Build untuk production |
| `start` | `next start` | Jalankan production server |
| `lint` | `eslint` | Linting kode |
| `format` | `prettier --write` | Format kode |
| `typecheck` | `tsc --noEmit` | Pengecekan tipe TypeScript |

---

## 🛠️ Tech Stack

### Core

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| [Next.js](https://nextjs.org/) | 16.2.6 | Framework utama |
| [React](https://react.dev/) | 19.2.4 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | ^5 | Type safety |
| [Tailwind CSS v4](https://tailwindcss.com/) | ^4 | Styling |
| [shadcn/ui](https://ui.shadcn.com/) | radix-nova | Komponen UI |

### State & Animasi

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| [Zustand](https://zustand-demo.pmnd.rs/) | ^5.0.14 | State management |
| [GSAP](https://gsap.com/) | ^3.15.0 | Animasi |
| [Recharts](https://recharts.org/) | ^3.8.1 | Grafik & chart |

### Utilitas

| Teknologi | Kegunaan |
|-----------|----------|
| [react-hook-form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Form & validasi |
| [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) | Drag-and-drop Kanban |
| [xlsx](https://sheetjs.com/) + [jsPDF](https://github.com/parallax/jsPDF) | Ekspor Excel/PDF |
| [next-themes](https://github.com/pacocoursey/next-themes) | Tema light/dark/system |

---

## 🗂️ Struktur Proyek

```
beroang/
├── app/
│   ├── globals.css                 # Tailwind v4 + design tokens (Forest-Tech)
│   ├── layout.tsx                  # Root layout (ThemeProvider, Toaster)
│   ├── page.tsx                    # Redirect → /dashboard
│   ├── login/                      # Multi-step login
│   └── (dashboard)/
│       ├── layout.tsx              # Sidebar + Header
│       ├── dashboard/page.tsx      # Home dashboard
│       ├── class/
│       │   ├── page.tsx            # Smart Learning Space
│       │   └── [subject]/page.tsx  # Subject detail + roadmap
│       ├── planner/page.tsx        # AI Teaching Planner
│       ├── assessment/[classId]/   # Assessment Engine
│       ├── analytics/page.tsx      # Teacher Analytics
│       ├── p5/[projectId]/page.tsx # P5 Kanban Workspace
│       ├── asisten-ai/page.tsx     # AI Assistant chat
│       └── settings/page.tsx       # Settings
│
├── components/
│   ├── ui/                         # 28 shadcn/ui components
│   └── layout/                     # AppSidebar, AppHeader, navigasi
│
├── store/                          # 5 Zustand stores
│   ├── classStore.ts
│   ├── assessmentStore.ts
│   ├── plannerStore.ts
│   ├── p5Store.ts
│   └── aiAssistantStore.ts
│
├── lib/                            # Utilities, mock data, AI templates
├── types/                          # TypeScript interfaces
└── hooks/                          # Custom hooks
```

---

## 🏗️ Arsitektur Data

> **Client-side only** — Tidak ada backend atau API eksternal.

Seluruh data saat ini berjalan **client-side** dengan:

- **localStorage** via Zustand persist middleware
- **Mock data** di `lib/mockData.ts`
- **AI Planner** menggunakan template markdown lokal (`lib/aiTemplates.ts`)
- **AI Assistant** menggunakan respons simulasi
- **Auth** menggunakan simulasi delay (1.2 detik)

---

## 🎨 Desain & Tema

Beroang menggunakan palet **Forest-Tech** yang terinspirasi dari nuansa alam dan teknologi modern.

### Palet Warna

| Token | Hex | Deskripsi |
|-------|-----|-----------|
| 🟩 Primary | `#4ADE80` | Hijau forest utama |
| 🟫 Dark | `#071A0E` | Background gelap |
| 🟨 Cream | `#F9F7F3` | Surface terang |
| 🟡 Gold | `#D4A017` | Aksen emas |

### Utility Classes Kustom

```css
.gp-glass          /* Efek glassmorphism */
.gp-glow           /* Efek glow hijau */
.gp-card           /* Card dengan styling Forest-Tech */
.gp-gradient-text  /* Teks dengan gradient */
```

> Menggunakan **OKLCH color space** untuk representasi warna yang lebih akurat dan performa rendering yang optimal.

---

## 📄 Lisensi

Hak cipta © 2024 — Proyek Internal Beroang.

---

<div align="center">
  <sub>Dibuat dengan 💚 untuk guru-guru Indonesia</sub>
</div>
