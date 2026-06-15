import type { PlannerFormValues } from '@/types';

export function generateAlurPembelajaran(params: PlannerFormValues): string {
  const weeks = Array.from({ length: params.durationWeeks }, (_, i) => i + 1);
  const topics = getTopicsForSubject(params.subject, params.durationWeeks);
  
  const tableRows = weeks.map((w, i) => 
    `| ${w} | ${topics[i]?.topic || 'Topik ' + w} | ${topics[i]?.activity || 'Diskusi & Eksplorasi'} | ${topics[i]?.p5Connection || params.p5Theme} |`
  ).join('\n');

  return `# Alur Pembelajaran ${params.subject} Kelas ${params.grade}

## Overview
**Mata Pelajaran:** ${params.subject} | **Kelas:** ${params.grade} | **Semester:** ${params.semester} | **Durasi:** ${params.durationWeeks} Minggu${params.p5Theme ? ` | **Tema P5:** ${params.p5Theme}` : ''}

---

| Minggu | Topik | Aktivitas Utama | ${params.enableP5Integration ? 'Integrasi P5' : 'Catatan'} |
|--------|-------|-----------------|${params.enableP5Integration ? '-------------|' : '---------|'}
${tableRows}

## Keterangan
- Setiap pertemuan berlangsung 2 × 45 menit
- Penilaian formatif dilaksanakan setiap 2 minggu
- ${params.enableP5Integration ? `Integrasi P5 tema "${params.p5Theme}" berjalan paralel sepanjang semester` : 'Evaluasi sumatif di akhir semester'}
`;
}

export function generateModulAjar(params: PlannerFormValues): string {
  return `# Modul Ajar — ${params.subject} Kelas ${params.grade}
**Semester:** ${params.semester} | **Durasi:** ${params.durationWeeks} Minggu${params.p5Theme ? ` | **Tema P5:** ${params.p5Theme}` : ''}

## Identitas Modul
- **Mata Pelajaran:** ${params.subject}
- **Kelas/Fase:** ${params.grade} / ${getFase(params.grade)}
- **Penyusun:** GreenPath AI Planner
- **Alokasi Waktu:** ${params.durationWeeks} minggu × 2 pertemuan × 90 menit

## Tujuan Pembelajaran
${params.cp.length > 50 ? params.cp : `Peserta didik kelas ${params.grade} mampu ${params.cp}`}

## Capaian Pembelajaran
${params.cp}

## Profil Pelajar Pancasila yang Dikembangkan
- **Beriman & Bertakwa** — Menghargai nilai-nilai dalam pembelajaran ${params.subject}
- **Bernalar Kritis** — Menganalisis informasi dan data secara objektif
- **Kreatif** — Menghasilkan solusi inovatif terhadap permasalahan nyata
- **Bergotong Royong** — Bekerja sama dalam proyek kelompok${params.enableP5Integration ? `\n- **Mandiri** — Mengelola proyek P5 secara mandiri dan bertanggung jawab` : ''}

## Materi Pokok
${getMateriPokok(params.subject, params.durationWeeks)}

## Metode Pembelajaran
- Discovery Learning
- Project-Based Learning${params.enableP5Integration ? ` (terintegrasi P5: ${params.p5Theme})` : ''}
- Diskusi kelompok dan presentasi
- Observasi dan eksperimen (jika relevan)

## Penilaian
| Aspek | Teknik | Bobot |
|-------|--------|-------|
| Pengetahuan | Tes tertulis, kuis | 40% |
| Keterampilan | Proyek, unjuk kerja | 40% |
| Sikap | Observasi, jurnal | 20% |

## Sumber Belajar
- Buku teks ${params.subject} Kelas ${params.grade} Kurikulum Merdeka
- Sumber digital yang relevan dan terverifikasi
- Lingkungan sekitar sebagai laboratorium nyata${params.enableP5Integration ? `\n- Panduan P5 tema "${params.p5Theme}"` : ''}
`;
}

export function generateAktivitasBelajar(params: PlannerFormValues): string {
  const activities = getSampleActivities(params.subject, params.grade, params.p5Theme);
  
  return `# Aktivitas Belajar — ${params.subject} Kelas ${params.grade}

${activities.map((act, i) => `## Minggu ${i + 1}: ${act.title}
**Durasi:** 2 × 45 menit | **Metode:** ${act.method}

### Tujuan
${act.objective}

### Langkah Pembelajaran

**Pendahuluan (10 menit)**
- Guru menyampaikan tujuan pembelajaran
- Apersepsi: ${act.apersepsi}

**Inti (70 menit)**
${act.steps.map((s, j) => `${j + 1}. ${s}`).join('\n')}

**Penutup (10 menit)**
- Refleksi pembelajaran
- Penugasan untuk pertemuan berikutnya
${params.enableP5Integration && act.p5Connection ? `\n**Koneksi P5 — ${params.p5Theme}**\n${act.p5Connection}` : ''}

---
`).join('\n')}`;
}

export function generateQuiz(params: PlannerFormValues): string {
  const questions = getSampleQuestions(params.subject, params.grade);
  
  return `# Quiz & Asesmen — ${params.subject} Kelas ${params.grade}

## Kuis Formatif — Penilaian Tengah Semester

### A. Pilihan Ganda *(Bobot: 60%)*

${questions.pg.map((q, i) => `**${i + 1}.** ${q.question}
${q.options.map((o, j) => `   ${String.fromCharCode(65 + j)}) ${o}`).join('\n')}
*(Jawaban: ${String.fromCharCode(65 + q.correct)})*

`).join('')}

### B. Uraian *(Bobot: 40%)*

${questions.essay.map((q, i) => `**${i + 1}.** ${q.question}
*Skor: ${q.score} poin*

**Pedoman Penskoran:**
${q.rubric}

`).join('')}

## Kuis Sumatif — Penilaian Akhir Semester

| No | Kompetensi Dasar | Tingkat Kognitif | Jumlah Soal |
|----|-----------------|-----------------|-------------|
| 1  | Pemahaman konsep dasar | C1-C2 | 10 |
| 2  | Penerapan konsep | C3-C4 | 8 |
| 3  | Analisis & evaluasi | C4-C5 | 5 |
| 4  | Kreasi & sintesis | C6 | 2 |

> Total: 25 soal (20 PG + 5 Uraian) | Durasi: 90 menit
`;
}

export function generateRubrik(params: PlannerFormValues): string {
  return `# Rubrik Penilaian — ${params.subject} Kelas ${params.grade}

## Rubrik Penilaian Tugas / Proyek

| Kriteria | Bobot | 85–100 (Sangat Baik) | 70–84 (Baik) | 55–69 (Cukup) | < 55 (Kurang) |
|----------|-------|---------------------|--------------|----------------|---------------|
| **Pemahaman Konsep** | 30% | Konsep dipahami mendalam, contoh tepat & orisinal | Konsep dipahami, contoh relevan | Pemahaman dasar, contoh terbatas | Konsep tidak dipahami |
| **Kualitas Analisis** | 25% | Analisis kritis, didukung data valid | Analisis cukup, ada dukungan data | Analisis dangkal | Tidak ada analisis |
| **Kreativitas** | 20% | Pendekatan sangat inovatif | Pendekatan kreatif | Pendekatan konvensional | Tidak ada kreativitas |
| **Penyajian** | 15% | Sistematis, bahasa baku, visual menarik | Cukup sistematis, bahasa baik | Kurang sistematis | Tidak terstruktur |
| **Sikap & Proses** | 10% | Aktif, tepat waktu, kolaboratif | Cukup aktif, tepat waktu | Pasif, tepat waktu | Pasif, tidak tepat waktu |
${params.enableP5Integration ? `
## Rubrik P5 — ${params.p5Theme}

| Kriteria P5 | Bobot | 85–100 | 70–84 | 55–69 | < 55 |
|-------------|-------|--------|-------|-------|------|
| **Relevansi dengan Tema** | 35% | Sangat relevan, memberikan dampak nyata | Relevan, dampak terukur | Cukup relevan | Tidak relevan |
| **Kolaborasi Tim** | 25% | Pembagian tugas merata, sinergi tinggi | Kolaborasi baik | Kolaborasi minimal | Tidak ada kerja tim |
| **Dampak Nyata** | 25% | Berdampak signifikan bagi komunitas | Berdampak kecil | Belum berdampak | Tidak ada dampak |
| **Refleksi & Dokumentasi** | 15% | Refleksi mendalam, dokumentasi lengkap | Refleksi baik | Refleksi dangkal | Tidak ada refleksi |
` : ''}
## Konversi Nilai

| Rentang Nilai | Predikat | Deskripsi |
|--------------|----------|-----------|
| 85 – 100 | A (Sangat Baik) | Melampaui Capaian Pembelajaran |
| 70 – 84 | B (Baik) | Mencapai Capaian Pembelajaran |
| 55 – 69 | C (Cukup) | Mendekati Capaian Pembelajaran |
| < 55 | D (Kurang) | Belum Mencapai Capaian Pembelajaran |

> **KKM:** 70 | Remedial diberikan untuk nilai di bawah KKM
`;
}

export function generateIdeP5(params: PlannerFormValues): string {
  if (!params.enableP5Integration || !params.p5Theme) {
    return `# Ide Integrasi P5\n\n> Integrasi P5 tidak diaktifkan untuk perencanaan ini. Aktifkan switch "Integrasi P5" dan pilih tema untuk mendapatkan rekomendasi koneksi P5.`;
  }

  return `# Ide Integrasi P5 — ${params.subject} × ${params.p5Theme}

## Konsep Koneksi

Mata pelajaran **${params.subject}** untuk kelas **${params.grade}** memiliki koneksi natural dengan tema P5 "**${params.p5Theme}**" melalui pendekatan berikut:

## Ide Proyek P5 yang Direkomendasikan

### Proyek 1: Investigasi Masalah Lokal
**Durasi:** 4 minggu | **Kelompok:** 4–5 siswa
- Siswa mengidentifikasi masalah nyata di lingkungan sekolah/komunitas yang berkaitan dengan ${params.subject.toLowerCase()}
- Merancang solusi berbasis pengetahuan yang dipelajari di kelas
- Implementasi solusi dalam skala kecil
- **Output:** Laporan investigasi + presentasi kepada pemangku kepentingan

### Proyek 2: Kampanye Edukasi Sebaya
**Durasi:** 3 minggu | **Kelompok:** 3–4 siswa
- Buat konten edukasi (poster, video pendek, infografis) tentang tema "${params.p5Theme}"
- Distribusikan ke warga sekolah dan komunitas online
- **Output:** Portofolio media edukasi + laporan dampak

### Proyek 3: Aksi Nyata Komunitas
**Durasi:** Sepanjang semester | **Seluruh kelas**
- Rancang dan implementasikan satu aksi nyata yang berkaitan dengan "${params.p5Theme}"
- Pantau dan evaluasi dampak secara berkala
- **Output:** Laporan dampak + rekomendasi keberlanjutan

## Timeline Integrasi

| Fase | Minggu | Aktivitas Kelas | Aktivitas P5 |
|------|--------|-----------------|--------------|
| Eksplorasi | 1–2 | Materi konsep dasar | Identifikasi masalah |
| Perencanaan | 3–4 | Pendalaman materi | Rancang solusi |
| Eksekusi | 5–${params.durationWeeks - 1} | Penerapan konsep | Implementasi aksi |
| Refleksi | ${params.durationWeeks} | Evaluasi bersama | Presentasi hasil P5 |

## Tips untuk Guru
✅ Hubungkan setiap diskusi kelas dengan konteks nyata tema P5
✅ Gunakan data/temuan proyek P5 sebagai bahan diskusi kelas
✅ Jadikan proyek P5 sebagai konteks soal penilaian
✅ Undang stakeholder komunitas untuk melihat hasil kerja siswa
`;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getFase(grade: string): string {
  const g = parseInt(grade.replace(/\D/g, ''));
  if (g <= 6) return 'Fase C/D';
  if (g <= 9) return 'Fase D';
  return 'Fase E/F';
}

function getTopicsForSubject(subject: string, weeks: number) {
  const templates: Record<string, { topic: string; activity: string; p5Connection: string }[]> = {
    'Biologi': [
      { topic: 'Pengantar & Sel', activity: 'Observasi mikroskop', p5Connection: 'Dampak polutan pada sel' },
      { topic: 'Jaringan Tumbuhan', activity: 'Pengamatan preparat', p5Connection: 'Pertanian berkelanjutan' },
      { topic: 'Jaringan Hewan', activity: 'Studi kasus', p5Connection: 'Gizi & lingkungan' },
      { topic: 'Metabolisme Sel', activity: 'Simulasi enzim', p5Connection: 'Energi terbarukan' },
      { topic: 'Transpor Membran', activity: 'Eksperimen osmosis', p5Connection: 'Air bersih' },
      { topic: 'Ekosistem', activity: 'Field trip', p5Connection: 'Konservasi lokal' },
      { topic: 'Keanekaragaman Hayati', activity: 'Survey biodiversitas', p5Connection: 'Pelestarian spesies' },
      { topic: 'Evaluasi & P5', activity: 'Presentasi proyek', p5Connection: 'Showcase hasil P5' },
    ],
    'default': Array.from({ length: 16 }, (_, i) => ({
      topic: `Topik ${i + 1}`,
      activity: 'Diskusi & eksplorasi',
      p5Connection: 'Koneksi tema P5',
    })),
  };
  
  const list = templates[subject] || templates['default'];
  return Array.from({ length: weeks }, (_, i) => list[i % list.length]);
}

function getMateriPokok(subject: string, weeks: number): string {
  const materials: Record<string, string[]> = {
    'Biologi': ['1. Struktur dan fungsi sel', '2. Jaringan tumbuhan dan hewan', '3. Metabolisme sel', '4. Ekosistem dan keanekaragaman hayati'],
    'Ekonomi': ['1. Konsep dasar ekonomi', '2. Permintaan dan penawaran', '3. Pasar dan harga', '4. Kebijakan ekonomi'],
    'Bahasa Indonesia': ['1. Teks sastra dan non-sastra', '2. Kaidah kebahasaan', '3. Teks argumentatif', '4. Karya sastra Indonesia'],
  };
  
  const list = materials[subject] || ['1. Konsep dasar', '2. Penerapan', '3. Analisis', '4. Evaluasi'];
  return list.slice(0, Math.ceil(weeks / 4)).join('\n');
}

function getSampleActivities(subject: string, grade: string, p5Theme: string) {
  return [
    {
      title: `Pengantar ${subject} Kelas ${grade}`,
      method: 'Diskusi & Discovery Learning',
      objective: `Siswa memahami gambaran umum ${subject} dan kaitannya dengan kehidupan sehari-hari`,
      apersepsi: `Tanya jawab tentang pengalaman siswa terkait ${subject.toLowerCase()}`,
      steps: [
        'Guru menyajikan fenomena menarik terkait materi',
        'Siswa berdiskusi dalam kelompok kecil (4 orang)',
        'Presentasi hasil diskusi kelompok',
        'Guru memberikan penguatan konsep',
        'Siswa mencatat poin penting di jurnal belajar',
      ],
      p5Connection: p5Theme ? `Hubungkan fenomena yang dipelajari dengan tema "${p5Theme}" — identifikasi masalah nyata yang bisa diselesaikan dengan pengetahuan ini` : '',
    },
    {
      title: 'Eksplorasi Konsep Inti',
      method: 'Inquiry Learning',
      objective: 'Siswa menganalisis konsep inti melalui eksplorasi mandiri dan kolaboratif',
      apersepsi: 'Review materi sebelumnya dengan kuis kilat 5 menit',
      steps: [
        'Siswa merumuskan pertanyaan penelitian',
        'Pengumpulan data/informasi dari berbagai sumber',
        'Analisis data dalam kelompok',
        'Presentasi temuan dan peer review',
        'Kesimpulan bersama dipandu guru',
      ],
      p5Connection: p5Theme ? `Siswa mengidentifikasi bagaimana konsep yang dipelajari relevan dengan proyek P5 mereka bertema "${p5Theme}"` : '',
    },
    {
      title: 'Penerapan & Praktik',
      method: 'Project-Based Learning',
      objective: 'Siswa menerapkan konsep dalam konteks nyata melalui proyek mini',
      apersepsi: 'Studi kasus singkat yang relevan dengan kehidupan siswa',
      steps: [
        'Briefing tugas proyek mini (10 menit)',
        'Kerja mandiri/kelompok mengerjakan proyek',
        'Konsultasi dengan guru (rolling)',
        'Finishing dan persiapan presentasi',
        'Presentasi singkat (2 menit per kelompok)',
      ],
      p5Connection: p5Theme ? `Proyek mini ini menjadi bagian dari portofolio P5 "${p5Theme}"` : '',
    },
  ];
}

function getSampleQuestions(subject: string, grade: string) {
  const pools: Record<string, { pg: { question: string; options: string[]; correct: number }[]; essay: { question: string; score: number; rubric: string }[] }> = {
    'Biologi': {
      pg: [
        { question: 'Organel sel yang berfungsi menghasilkan energi adalah...', options: ['Nukleus', 'Mitokondria', 'Ribosom', 'Vakuola'], correct: 1 },
        { question: 'Proses masuknya air ke dalam sel melalui membran semipermeabel disebut...', options: ['Difusi', 'Osmosis', 'Transpor aktif', 'Eksositosis'], correct: 1 },
        { question: 'Organisme yang dapat membuat makanan sendiri disebut...', options: ['Konsumen', 'Dekomposer', 'Produsen', 'Parasit'], correct: 2 },
      ],
      essay: [
        { question: `Jelaskan perbedaan antara sel prokariotik dan eukariotik! Berikan 2 contoh untuk masing-masing!`, score: 20, rubric: '- Menyebutkan perbedaan inti: ada tidaknya membran inti (5 poin)\n- Perbedaan struktur lain (5 poin)\n- Contoh prokariotik tepat (5 poin)\n- Contoh eukariotik tepat (5 poin)' },
        { question: `Bagaimana cara kerja enzim dalam reaksi metabolisme? Jelaskan konsep "lock and key"!`, score: 20, rubric: '- Definisi enzim sebagai katalis (5 poin)\n- Penjelasan lock and key (10 poin)\n- Contoh enzim dan substrat (5 poin)' },
      ],
    },
    'default': {
      pg: [
        { question: `Konsep dasar ${subject} yang paling fundamental adalah...`, options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'], correct: 0 },
        { question: `Penerapan ${subject} dalam kehidupan sehari-hari dapat ditemukan pada...`, options: ['Situasi A', 'Situasi B', 'Situasi C', 'Situasi D'], correct: 1 },
      ],
      essay: [
        { question: `Jelaskan konsep utama dalam ${subject} Kelas ${grade} dan berikan contoh penerapannya!`, score: 25, rubric: '- Penjelasan konsep (10 poin)\n- Contoh relevan (10 poin)\n- Bahasa yang baik (5 poin)' },
      ],
    },
  };
  
  return pools[subject] || pools['default'];
}
