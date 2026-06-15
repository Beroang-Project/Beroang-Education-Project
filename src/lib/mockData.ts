import {
  Student,
  Class,
  Assignment,
  Quiz,
  QuizQuestion,
  LearningMaterial,
  P5Group,
  AIPlannerOutput,
} from '@/types';

// ─── Students ────────────────────────────────────────────────────────────────

export const MOCK_STUDENTS: Student[] = [
  // X IPA 1
  { id: 's1', name: 'Ahmad Fauzi', classId: 'c1', p5GroupId: 'g1', scores: { assignments: { a1: 85, a2: 88, a3: 90, a4: 78, a5: 82 }, quizzes: { q1: 90, q2: 88 }, p5Project: 85 } },
  { id: 's2', name: 'Budi Santoso', classId: 'c1', p5GroupId: 'g1', scores: { assignments: { a1: 70, a2: 65, a3: 72, a4: 68, a5: 74 }, quizzes: { q1: 72, q2: 75 }, p5Project: 75 } },
  { id: 's3', name: 'Citra Kirana', classId: 'c1', p5GroupId: 'g1', scores: { assignments: { a1: 92, a2: 95, a3: 88, a4: 91, a5: 89 }, quizzes: { q1: 88, q2: 92 }, p5Project: 90 } },
  { id: 's4', name: 'Dian Sastro', classId: 'c1', p5GroupId: 'g2', scores: { assignments: { a1: 78, a2: 80, a3: 75, a4: 82, a5: 77 }, quizzes: { q1: 75, q2: 80 }, p5Project: 82 } },
  { id: 's5', name: 'Eka Putri', classId: 'c1', p5GroupId: 'g2', scores: { assignments: { a1: 88, a2: 85, a3: 90, a4: 87, a5: 91 }, quizzes: { q1: 85, q2: 89 }, p5Project: 88 } },
  { id: 's6', name: 'Fajar Nugroho', classId: 'c1', p5GroupId: 'g2', scores: { assignments: { a1: 65, a2: 70, a3: 68, a4: 72, a5: 66 }, quizzes: { q1: 68, q2: 70 }, p5Project: 70 } },
  { id: 's7', name: 'Gita Pratiwi', classId: 'c1', p5GroupId: 'g2', scores: { assignments: { a1: 95, a2: 92, a3: 96, a4: 93, a5: 94 }, quizzes: { q1: 95, q2: 93 }, p5Project: 95 } },
  { id: 's8', name: 'Hendra Wijaya', classId: 'c1', p5GroupId: 'g1', scores: { assignments: { a1: 74, a2: 76, a3: 73, a4: 75, a5: 78 }, quizzes: { q1: 76, q2: 74 }, p5Project: 76 } },
  { id: 's9', name: 'Indah Lestari', classId: 'c1', p5GroupId: 'g1', scores: { assignments: { a1: 82, a2: 84, a3: 80, a4: 86, a5: 83 }, quizzes: { q1: 82, q2: 85 }, p5Project: 84 } },
  { id: 's10', name: 'Joko Susilo', classId: 'c1', p5GroupId: 'g2', scores: { assignments: { a1: 60, a2: 62, a3: 58, a4: 64, a5: 61 }, quizzes: { q1: 62, q2: 60 }, p5Project: 65 } },

  // XI IPS 2
  { id: 's11', name: 'Kartika Dewi', classId: 'c2', p5GroupId: 'g3', scores: { assignments: { a6: 88, a7: 90, a8: 85, a9: 87, a10: 89 }, quizzes: { q3: 90, q4: 88 }, p5Project: 88 } },
  { id: 's12', name: 'Luthfi Hakim', classId: 'c2', p5GroupId: 'g3', scores: { assignments: { a6: 75, a7: 78, a8: 76, a9: 80, a10: 77 }, quizzes: { q3: 78, q4: 76 }, p5Project: 78 } },
  { id: 's13', name: 'Maya Sari', classId: 'c2', p5GroupId: 'g3', scores: { assignments: { a6: 92, a7: 88, a8: 94, a9: 91, a10: 90 }, quizzes: { q3: 92, q4: 90 }, p5Project: 91 } },
  { id: 's14', name: 'Nanda Prasetyo', classId: 'c2', p5GroupId: 'g4', scores: { assignments: { a6: 70, a7: 72, a8: 68, a9: 74, a10: 71 }, quizzes: { q3: 72, q4: 70 }, p5Project: 72 } },
  { id: 's15', name: 'Olivia Rahayu', classId: 'c2', p5GroupId: 'g4', scores: { assignments: { a6: 85, a7: 87, a8: 83, a9: 88, a10: 86 }, quizzes: { q3: 86, q4: 85 }, p5Project: 86 } },
  { id: 's16', name: 'Pandu Wibowo', classId: 'c2', p5GroupId: 'g4', scores: { assignments: { a6: 78, a7: 80, a8: 77, a9: 82, a10: 79 }, quizzes: { q3: 80, q4: 78 }, p5Project: 80 } },
  { id: 's17', name: 'Qori Andini', classId: 'c2', p5GroupId: 'g3', scores: { assignments: { a6: 90, a7: 92, a8: 88, a9: 93, a10: 91 }, quizzes: { q3: 90, q4: 92 }, p5Project: 92 } },
  { id: 's18', name: 'Rizky Maulana', classId: 'c2', p5GroupId: 'g4', scores: { assignments: { a6: 65, a7: 68, a8: 63, a9: 70, a10: 66 }, quizzes: { q3: 68, q4: 66 }, p5Project: 68 } },
  { id: 's19', name: 'Sinta Amelia', classId: 'c2', p5GroupId: 'g3', scores: { assignments: { a6: 83, a7: 85, a8: 81, a9: 87, a10: 84 }, quizzes: { q3: 84, q4: 83 }, p5Project: 84 } },
  { id: 's20', name: 'Taufik Rahman', classId: 'c2', p5GroupId: 'g4', scores: { assignments: { a6: 76, a7: 79, a8: 74, a9: 81, a10: 77 }, quizzes: { q3: 78, q4: 76 }, p5Project: 78 } },

  // XII Bahasa 1
  { id: 's21', name: 'Uswatun Hasanah', classId: 'c3', p5GroupId: 'g5', scores: { assignments: { a11: 90, a12: 88, a13: 92, a14: 89, a15: 91 }, quizzes: { q5: 90, q6: 92 }, p5Project: 91 } },
  { id: 's22', name: 'Vina Anggraeni', classId: 'c3', p5GroupId: 'g5', scores: { assignments: { a11: 78, a12: 80, a13: 76, a14: 82, a15: 79 }, quizzes: { q5: 80, q6: 78 }, p5Project: 80 } },
  { id: 's23', name: 'Wahyu Hidayat', classId: 'c3', p5GroupId: 'g5', scores: { assignments: { a11: 85, a12: 87, a13: 83, a14: 88, a15: 86 }, quizzes: { q5: 86, q6: 85 }, p5Project: 86 } },
  { id: 's24', name: 'Xena Putri', classId: 'c3', p5GroupId: 'g6', scores: { assignments: { a11: 72, a12: 75, a13: 70, a14: 77, a15: 73 }, quizzes: { q5: 74, q6: 72 }, p5Project: 74 } },
  { id: 's25', name: 'Yogi Prasetyo', classId: 'c3', p5GroupId: 'g6', scores: { assignments: { a11: 95, a12: 93, a13: 96, a14: 94, a15: 95 }, quizzes: { q5: 96, q6: 94 }, p5Project: 95 } },
  { id: 's26', name: 'Zahra Nadia', classId: 'c3', p5GroupId: 'g6', scores: { assignments: { a11: 88, a12: 90, a13: 86, a14: 91, a15: 89 }, quizzes: { q5: 90, q6: 88 }, p5Project: 89 } },
  { id: 's27', name: 'Arif Budiman', classId: 'c3', p5GroupId: 'g5', scores: { assignments: { a11: 68, a12: 70, a13: 66, a14: 72, a15: 69 }, quizzes: { q5: 70, q6: 68 }, p5Project: 70 } },
  { id: 's28', name: 'Bella Kurnia', classId: 'c3', p5GroupId: 'g6', scores: { assignments: { a11: 82, a12: 84, a13: 80, a14: 86, a15: 83 }, quizzes: { q5: 84, q6: 82 }, p5Project: 83 } },
  { id: 's29', name: 'Chandra Mulia', classId: 'c3', p5GroupId: 'g5', scores: { assignments: { a11: 76, a12: 78, a13: 74, a14: 80, a15: 77 }, quizzes: { q5: 78, q6: 76 }, p5Project: 77 } },
  { id: 's30', name: 'Dewi Ayu', classId: 'c3', p5GroupId: 'g6', scores: { assignments: { a11: 91, a12: 89, a13: 93, a14: 90, a15: 92 }, quizzes: { q5: 92, q6: 90 }, p5Project: 91 } },
];

// ─── Classes ─────────────────────────────────────────────────────────────────

export const MOCK_CLASSES: Class[] = [
  {
    id: 'c1',
    name: 'X IPA 1',
    subject: 'Biologi',
    teacherId: 'teacher1',
    studentIds: ['s1','s2','s3','s4','s5','s6','s7','s8','s9','s10'],
    aiPlannerOutputId: 'ai1',
    gradeWeights: { assignments: 40, quizzes: 30, p5Project: 30 },
    kkm: 75,
  },
  {
    id: 'c2',
    name: 'XI IPS 2',
    subject: 'Ekonomi',
    teacherId: 'teacher1',
    studentIds: ['s11','s12','s13','s14','s15','s16','s17','s18','s19','s20'],
    gradeWeights: { assignments: 40, quizzes: 30, p5Project: 30 },
    kkm: 75,
  },
  {
    id: 'c3',
    name: 'XII Bahasa 1',
    subject: 'Bahasa Indonesia',
    teacherId: 'teacher1',
    studentIds: ['s21','s22','s23','s24','s25','s26','s27','s28','s29','s30'],
    gradeWeights: { assignments: 40, quizzes: 30, p5Project: 30 },
    kkm: 75,
  },
];

// ─── Assignments ──────────────────────────────────────────────────────────────

export const MOCK_ASSIGNMENTS: Assignment[] = [
  // Class c1
  { id: 'a1', classId: 'c1', title: 'Laporan Pengamatan Sel', instructions: 'Amati sel tumbuhan dan sel hewan di bawah mikroskop, laporkan perbedaan strukturnya secara detail.', deadline: '2024-09-20', weight: 20, submissions: { s1: true, s2: true, s3: true, s4: true, s5: true, s6: false, s7: true, s8: true, s9: true, s10: false }, fromAI: false },
  { id: 'a2', classId: 'c1', title: 'Makalah Fotosintesis', instructions: 'Tulis makalah 5 halaman tentang mekanisme fotosintesis dan faktor yang mempengaruhinya.', deadline: '2024-10-05', weight: 20, submissions: { s1: true, s2: true, s3: true, s4: true, s5: true, s6: true, s7: true, s8: false, s9: true, s10: false }, fromAI: false },
  { id: 'a3', classId: 'c1', title: 'Eksperimen Osmosis', instructions: 'Lakukan eksperimen osmosis menggunakan kentang dan larutan garam dengan konsentrasi berbeda.', deadline: '2024-10-25', weight: 20, submissions: { s1: true, s2: true, s3: true, s4: true, s5: true, s6: true, s7: true, s8: true, s9: true, s10: true }, fromAI: true },
  { id: 'a4', classId: 'c1', title: 'Analisis Ekosistem Lokal', instructions: 'Kunjungi satu ekosistem di sekitar sekolah dan buat laporan analisis komponen biotik dan abiotiknya.', deadline: '2024-11-10', weight: 20, submissions: { s1: true, s2: false, s3: true, s4: true, s5: true, s6: false, s7: true, s8: true, s9: true, s10: false }, fromAI: true },
  { id: 'a5', classId: 'c1', title: 'Presentasi Evolusi Darwin', instructions: 'Buat slide presentasi tentang teori evolusi Darwin dan bukti-buktinya.', deadline: '2024-11-30', weight: 20, submissions: { s1: true, s2: true, s3: true, s4: true, s5: true, s6: true, s7: true, s8: true, s9: true, s10: true }, fromAI: false },
  // Class c2
  { id: 'a6', classId: 'c2', title: 'Analisis Inflasi Indonesia', instructions: 'Analisis tren inflasi Indonesia 5 tahun terakhir berdasarkan data BPS.', deadline: '2024-09-25', weight: 20, submissions: { s11: true, s12: true, s13: true, s14: true, s15: true, s16: false, s17: true, s18: false, s19: true, s20: true }, fromAI: false },
  { id: 'a7', classId: 'c2', title: 'Studi Kasus UMKM', instructions: 'Wawancarai satu pelaku UMKM di sekitar dan buat laporan analisis ekonomi mikro.', deadline: '2024-10-10', weight: 20, submissions: { s11: true, s12: true, s13: true, s14: false, s15: true, s16: true, s17: true, s18: false, s19: true, s20: true }, fromAI: false },
  { id: 'a8', classId: 'c2', title: 'Simulasi Investasi Saham', instructions: 'Gunakan simulasi bursa saham untuk mengelola portofolio Rp 10 juta selama 1 bulan.', deadline: '2024-11-05', weight: 20, submissions: { s11: true, s12: true, s13: true, s14: true, s15: true, s16: true, s17: true, s18: true, s19: true, s20: false }, fromAI: true },
  { id: 'a9', classId: 'c2', title: 'Proposal Bisnis', instructions: 'Buat proposal bisnis sederhana dengan analisis SWOT dan proyeksi keuangan 6 bulan.', deadline: '2024-11-20', weight: 20, submissions: { s11: true, s12: false, s13: true, s14: true, s15: true, s16: true, s17: true, s18: false, s19: true, s20: true }, fromAI: true },
  { id: 'a10', classId: 'c2', title: 'Esai Kebijakan Fiskal', instructions: 'Tulis esai argumentatif tentang dampak kebijakan fiskal pemerintah terhadap pertumbuhan ekonomi.', deadline: '2024-12-10', weight: 20, submissions: { s11: true, s12: true, s13: true, s14: true, s15: true, s16: true, s17: true, s18: true, s19: true, s20: true }, fromAI: false },
  // Class c3
  { id: 'a11', classId: 'c3', title: 'Analisis Puisi Chairil Anwar', instructions: 'Analisis 3 puisi Chairil Anwar dari aspek diksi, rima, dan majas.', deadline: '2024-09-22', weight: 20, submissions: { s21: true, s22: true, s23: true, s24: true, s25: true, s26: true, s27: false, s28: true, s29: true, s30: true }, fromAI: false },
  { id: 'a12', classId: 'c3', title: 'Menulis Artikel Opini', instructions: 'Tulis artikel opini 700 kata tentang isu sosial yang sedang hangat di media.', deadline: '2024-10-08', weight: 20, submissions: { s21: true, s22: true, s23: true, s24: false, s25: true, s26: true, s27: true, s28: true, s29: true, s30: true }, fromAI: false },
  { id: 'a13', classId: 'c3', title: 'Drama Mini', instructions: 'Tulis naskah drama pendek 10 menit dan pentaskan di kelas bersama kelompok.', deadline: '2024-11-01', weight: 20, submissions: { s21: true, s22: true, s23: true, s24: true, s25: true, s26: true, s27: true, s28: true, s29: true, s30: true }, fromAI: true },
  { id: 'a14', classId: 'c3', title: 'Review Novel', instructions: 'Baca satu novel sastra Indonesia dan tulis review kritis 1000 kata.', deadline: '2024-11-25', weight: 20, submissions: { s21: true, s22: true, s23: true, s24: true, s25: true, s26: true, s27: false, s28: true, s29: true, s30: true }, fromAI: true },
  { id: 'a15', classId: 'c3', title: 'Debat Bahasa Indonesia', instructions: 'Ikuti sesi debat terstruktur tentang topik yang ditentukan, nilai berdasarkan argumen dan penggunaan bahasa.', deadline: '2024-12-05', weight: 20, submissions: { s21: true, s22: true, s23: true, s24: true, s25: true, s26: true, s27: true, s28: true, s29: true, s30: true }, fromAI: false },
];

// ─── Quizzes ──────────────────────────────────────────────────────────────────

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'q1', classId: 'c1', title: 'Kuis Sel dan Jaringan', durationMinutes: 30, fromAI: false,
    questions: [
      { id: 'qq1', text: 'Organel sel yang berfungsi sebagai pusat kontrol sel adalah...', type: 'multiple_choice', options: ['Mitokondria', 'Nukleus', 'Ribosom', 'Lisosom'], correctAnswer: 1 },
      { id: 'qq2', text: 'Proses pembelahan sel yang menghasilkan 4 sel anak dengan jumlah kromosom setengah dari induknya adalah...', type: 'multiple_choice', options: ['Mitosis', 'Meiosis', 'Amitosis', 'Sitokinesis'], correctAnswer: 1 },
      { id: 'qq3', text: 'Jelaskan perbedaan antara sel prokariotik dan sel eukariotik!', type: 'essay' },
    ],
  },
  {
    id: 'q2', classId: 'c1', title: 'Kuis Ekologi', durationMinutes: 45, fromAI: true,
    questions: [
      { id: 'qq4', text: 'Hubungan antara lebah dan bunga merupakan contoh simbiosis...', type: 'multiple_choice', options: ['Parasitisme', 'Komensalisme', 'Mutualisme', 'Amensalisme'], correctAnswer: 2 },
      { id: 'qq5', text: 'Organisme yang menduduki puncak piramida makanan disebut...', type: 'multiple_choice', options: ['Produsen', 'Konsumen primer', 'Konsumen puncak', 'Dekomposer'], correctAnswer: 2 },
      { id: 'qq6', text: 'Apa dampak dari berkurangnya keanekaragaman hayati terhadap ekosistem?', type: 'essay' },
    ],
  },
  {
    id: 'q3', classId: 'c2', title: 'Kuis Ekonomi Mikro', durationMinutes: 30, fromAI: false,
    questions: [
      { id: 'qq7', text: 'Hukum permintaan menyatakan bahwa ketika harga naik, maka...', type: 'multiple_choice', options: ['Permintaan naik', 'Permintaan turun', 'Permintaan tetap', 'Penawaran naik'], correctAnswer: 1 },
      { id: 'qq8', text: 'Kondisi di mana pasar dikuasai oleh satu penjual disebut...', type: 'multiple_choice', options: ['Oligopoli', 'Duopoli', 'Monopoli', 'Monopsoni'], correctAnswer: 2 },
    ],
  },
  {
    id: 'q4', classId: 'c2', title: 'Kuis Ekonomi Makro', durationMinutes: 40, fromAI: true,
    questions: [
      { id: 'qq9', text: 'Kebijakan pemerintah yang mengatur pengeluaran dan penerimaan negara disebut kebijakan...', type: 'multiple_choice', options: ['Moneter', 'Fiskal', 'Perdagangan', 'Investasi'], correctAnswer: 1 },
      { id: 'qq10', text: 'Jelaskan dampak inflasi tinggi terhadap perekonomian nasional!', type: 'essay' },
    ],
  },
  {
    id: 'q5', classId: 'c3', title: 'Kuis Teks Sastra', durationMinutes: 35, fromAI: false,
    questions: [
      { id: 'qq11', text: 'Majas yang membandingkan sesuatu dengan menggunakan kata "seperti" atau "bagaikan" disebut...', type: 'multiple_choice', options: ['Metafora', 'Personifikasi', 'Simile', 'Hiperbola'], correctAnswer: 2 },
      { id: 'qq12', text: 'Unsur intrinsik karya sastra yang berkaitan dengan pokok permasalahan dalam cerita adalah...', type: 'multiple_choice', options: ['Tema', 'Alur', 'Tokoh', 'Latar'], correctAnswer: 0 },
    ],
  },
  {
    id: 'q6', classId: 'c3', title: 'Kuis Teks Non-Sastra', durationMinutes: 30, fromAI: true,
    questions: [
      { id: 'qq13', text: 'Teks yang bertujuan untuk memengaruhi pendapat pembaca disebut teks...', type: 'multiple_choice', options: ['Narasi', 'Deskripsi', 'Persuasi', 'Eksposisi'], correctAnswer: 2 },
      { id: 'qq14', text: 'Jelaskan ciri-ciri teks laporan observasi yang baik!', type: 'essay' },
    ],
  },
];

// ─── Learning Materials ───────────────────────────────────────────────────────

export const MOCK_MATERIALS: LearningMaterial[] = [
  { id: 'm1', classId: 'c1', title: 'Struktur Sel Hewan & Tumbuhan', description: 'Panduan komprehensif mengenai organel sel, fungsi, dan perbedaannya antara sel hewan dan tumbuhan.', type: 'pdf', url: '#', createdAt: '2024-09-01', fromAI: false },
  { id: 'm2', classId: 'c1', title: 'Animasi Mitosis & Meiosis', description: 'Video animasi 3D yang menjelaskan proses pembelahan sel secara detail.', type: 'video', url: '#', createdAt: '2024-09-05', fromAI: false },
  { id: 'm3', classId: 'c1', title: 'Referensi Ekologi Mendalam', description: 'Artikel ilmiah tentang ekosistem, rantai makanan, dan keseimbangan lingkungan.', type: 'link', url: '#', createdAt: '2024-10-01', fromAI: true },
  { id: 'm4', classId: 'c2', title: 'Konsep Dasar Ekonomi Mikro', description: 'Materi dasar tentang permintaan, penawaran, dan keseimbangan pasar.', type: 'pdf', url: '#', createdAt: '2024-09-02', fromAI: false },
  { id: 'm5', classId: 'c2', title: 'Data Ekonomi Indonesia 2024', description: 'Dashboard interaktif data ekonomi makro Indonesia dari BPS.', type: 'link', url: '#', createdAt: '2024-09-10', fromAI: false },
  { id: 'm6', classId: 'c3', title: 'Antologi Puisi Indonesia Modern', description: 'Kumpulan puisi modern Indonesia dari berbagai penyair terkemuka.', type: 'pdf', url: '#', createdAt: '2024-09-03', fromAI: false },
  { id: 'm7', classId: 'c3', title: 'Teknik Menulis Artikel Opini', description: 'Panduan step-by-step menulis artikel opini yang efektif dan persuasif.', type: 'video', url: '#', createdAt: '2024-09-12', fromAI: true },
];

// ─── P5 Groups ────────────────────────────────────────────────────────────────

export const MOCK_P5_GROUPS: P5Group[] = [
  {
    id: 'g1', projectId: 'p1', name: 'Kelompok Hijau Lestari',
    memberIds: ['s1', 's2', 's3', 's8', 's9'],
    status: 'in_progress',
    milestones: [
      { id: 'ms1', title: 'Proposal disetujui', completed: true, completedAt: '2024-09-15' },
      { id: 'ms2', title: 'Survei lapangan', completed: true, completedAt: '2024-09-22' },
      { id: 'ms3', title: 'Eksekusi aksi hijau', completed: false },
      { id: 'ms4', title: 'Dokumentasi selesai', completed: false },
    ],
    logs: [
      { id: 'l1', date: '2024-09-15', description: 'Proposal disetujui oleh guru', type: 'milestone' },
      { id: 'l2', date: '2024-09-22', description: 'Melakukan survei area taman sekolah', type: 'update' },
      { id: 'l3', date: '2024-09-28', description: 'Bagus! Lanjutkan dengan perencanaan aksi nyata.', type: 'feedback' },
    ],
    teacherFeedback: 'Progres sangat bagus! Pastikan dokumentasi foto setiap kegiatan.',
  },
  {
    id: 'g2', projectId: 'p1', name: 'Tim Daur Ulang Kreatif',
    memberIds: ['s4', 's5', 's6', 's7', 's10'],
    status: 'documentation',
    milestones: [
      { id: 'ms5', title: 'Proposal disetujui', completed: true, completedAt: '2024-09-10' },
      { id: 'ms6', title: 'Pengumpulan bahan daur ulang', completed: true, completedAt: '2024-09-20' },
      { id: 'ms7', title: 'Workshop kreasi', completed: true, completedAt: '2024-10-05' },
      { id: 'ms8', title: 'Pameran karya', completed: false },
    ],
    logs: [
      { id: 'l4', date: '2024-09-10', description: 'Proposal disetujui', type: 'milestone' },
      { id: 'l5', date: '2024-10-05', description: 'Workshop pembuatan tas dari plastik bekas sukses!', type: 'update' },
    ],
    teacherFeedback: 'Kreativitas luar biasa! Siapkan pameran yang menarik.',
  },
  {
    id: 'g3', projectId: 'p2', name: 'Wirausaha Muda Mandiri',
    memberIds: ['s11', 's12', 's13', 's17', 's19'],
    status: 'final_report',
    milestones: [
      { id: 'ms9', title: 'Business plan', completed: true, completedAt: '2024-09-12' },
      { id: 'ms10', title: 'Uji coba produk', completed: true, completedAt: '2024-10-01' },
      { id: 'ms11', title: 'Penjualan perdana', completed: true, completedAt: '2024-10-20' },
      { id: 'ms12', title: 'Laporan keuangan', completed: true, completedAt: '2024-11-01' },
    ],
    logs: [
      { id: 'l6', date: '2024-11-01', description: 'Semua milestone selesai! Laporan final sedang dipersiapkan.', type: 'milestone' },
    ],
    teacherFeedback: 'Hasil yang sangat memuaskan! Siap untuk presentasi.',
  },
  {
    id: 'g4', projectId: 'p2', name: 'Agen Literasi Keuangan',
    memberIds: ['s14', 's15', 's16', 's18', 's20'],
    status: 'proposal',
    milestones: [
      { id: 'ms13', title: 'Identifikasi target sasaran', completed: false },
      { id: 'ms14', title: 'Desain program edukasi', completed: false },
      { id: 'ms15', title: 'Pelaksanaan workshop', completed: false },
      { id: 'ms16', title: 'Evaluasi dampak', completed: false },
    ],
    logs: [
      { id: 'l7', date: '2024-09-28', description: 'Proposal awal sudah dikumpulkan, menunggu review guru', type: 'update' },
    ],
    teacherFeedback: '',
  },
  {
    id: 'g5', projectId: 'p3', name: 'Jurnalis Sekolah Digital',
    memberIds: ['s21', 's22', 's23', 's27', 's29'],
    status: 'in_progress',
    milestones: [
      { id: 'ms17', title: 'Rancangan media', completed: true, completedAt: '2024-09-18' },
      { id: 'ms18', title: 'Produksi konten perdana', completed: true, completedAt: '2024-10-10' },
      { id: 'ms19', title: 'Distribusi ke komunitas', completed: false },
      { id: 'ms20', title: 'Evaluasi dan laporan', completed: false },
    ],
    logs: [
      { id: 'l8', date: '2024-10-10', description: 'Edisi pertama majalah digital sudah terbit!', type: 'update' },
      { id: 'l9', date: '2024-10-12', description: 'Bagus sekali! Pastikan distribusi menjangkau seluruh warga sekolah.', type: 'feedback' },
    ],
    teacherFeedback: 'Konten sangat berkualitas! Tambahkan lebih banyak liputan kegiatan sekolah.',
  },
  {
    id: 'g6', projectId: 'p3', name: 'Pelestari Budaya Nusantara',
    memberIds: ['s24', 's25', 's26', 's28', 's30'],
    status: 'documentation',
    milestones: [
      { id: 'ms21', title: 'Riset budaya lokal', completed: true, completedAt: '2024-09-20' },
      { id: 'ms22', title: 'Workshop budaya', completed: true, completedAt: '2024-10-15' },
      { id: 'ms23', title: 'Pameran digital', completed: true, completedAt: '2024-11-01' },
      { id: 'ms24', title: 'Laporan akhir', completed: false },
    ],
    logs: [
      { id: 'l10', date: '2024-11-01', description: 'Pameran digital sukses dengan 200+ pengunjung virtual!', type: 'milestone' },
    ],
    teacherFeedback: 'Pameran digital sangat kreatif dan informatif!',
  },
];

// ─── Sample AI Planner Output ─────────────────────────────────────────────────

export const MOCK_AI_OUTPUT: AIPlannerOutput = {
  id: 'ai1',
  createdAt: '2024-09-01T08:00:00Z',
  subject: 'Biologi',
  grade: 'X',
  semester: 'Ganjil',
  cp: 'Peserta didik mampu menganalisis struktur sel, proses metabolisme, dan keterkaitan antara komponen ekosistem dalam kehidupan sehari-hari.',
  p5Theme: 'Gaya Hidup Berkelanjutan',
  durationWeeks: 8,
  output: {
    alurPembelajaran: `# Alur Pembelajaran Biologi Kelas X — Semester Ganjil

## Overview
**Mata Pelajaran:** Biologi | **Kelas:** X | **Durasi:** 8 Minggu | **Tema P5:** Gaya Hidup Berkelanjutan

---

| Minggu | Topik | Aktivitas Utama | Integrasi P5 |
|--------|-------|-----------------|--------------|
| 1 | Pengantar Biologi & Sel | Observasi sel dengan mikroskop | Dampak polutan pada sel |
| 2 | Struktur Sel Prokariotik & Eukariotik | Komparasi diagram, diskusi | Bakteri pengurai limbah |
| 3 | Transpor Membran | Eksperimen osmosis | Air bersih dan kehidupan |
| 4 | Metabolisme Sel | Simulasi enzim | Energi terbarukan |
| 5 | Jaringan Tumbuhan | Pengamatan preparat | Pertanian berkelanjutan |
| 6 | Jaringan Hewan | Studi kasus kesehatan | Gizi & lingkungan |
| 7 | Ekosistem | Field trip lingkungan sekolah | Konservasi lokal |
| 8 | Evaluasi & Presentasi | Presentasi proyek P5 | Showcase Gaya Hidup Berkelanjutan |`,
    modulAjar: `# Modul Ajar — Biologi Kelas X
**Semester:** Ganjil | **Durasi:** 8 Minggu | **Tema P5:** Gaya Hidup Berkelanjutan

## Identitas Modul
- **Mata Pelajaran:** Biologi
- **Kelas/Fase:** X / Fase E
- **Penyusun:** GreenPath AI Planner
- **Tahun Pelajaran:** 2024/2025

## Tujuan Pembelajaran
Peserta didik kelas X mampu menganalisis struktur sel, proses metabolisme, dan keterkaitan antara komponen ekosistem dalam kehidupan sehari-hari, serta mengintegrasikan pemahaman tersebut ke dalam proyek P5 bertema "Gaya Hidup Berkelanjutan".

## Capaian Pembelajaran
Peserta didik mampu menganalisis struktur sel, proses metabolisme, dan keterkaitan antara komponen ekosistem dalam kehidupan sehari-hari.

## Profil Pelajar Pancasila yang Dikembangkan
- **Beriman & Bertakwa** — Menyadari alam sebagai amanah
- **Bernalar Kritis** — Menganalisis data saintifik
- **Kreatif** — Solusi inovatif masalah lingkungan
- **Bergotong Royong** — Proyek kelompok P5

## Materi Pokok
1. Sel: unit dasar kehidupan
2. Metabolisme: fotosintesis dan respirasi
3. Jaringan tumbuhan dan hewan
4. Ekosistem dan interaksi makhluk hidup`,
    aktivitasBelajar: `# Aktivitas Belajar — Biologi Kelas X

## Minggu 1: Pengantar & Observasi Sel
**Durasi:** 2 × 45 menit

### Aktivitas 1: Ice Breaking Saintifik
- Siswa menebak benda hidup/mati dari gambar
- Diskusi: Apa pembeda makhluk hidup?

### Aktivitas 2: Observasi Mikroskop
- Siswa mempersiapkan preparat sel bawang dan pipi
- Gambar dan beri label bagian sel yang terlihat
- **Koneksi P5:** Diskusi dampak polutan terhadap sel

## Minggu 3: Eksperimen Osmosis
**Durasi:** 3 × 45 menit

### Prosedur:
1. Siapkan potongan kentang 3 cm × 1 cm (5 buah)
2. Rendam dalam larutan: air murni, NaCl 5%, NaCl 10%, NaCl 15%, NaCl 20%
3. Ukur perubahan panjang setelah 30 menit
4. Buat grafik dan analisis

**Output:** Laporan eksperimen dengan kesimpulan tentang osmosis`,
    quizAsesmen: `# Quiz & Asesmen — Biologi Kelas X

## Kuis Formatif Minggu 1-2

### Pilihan Ganda

**1.** Organel sel yang berfungsi sebagai pusat kontrol aktivitas sel adalah...
- A) Mitokondria
- B) **Nukleus** ✓
- C) Ribosom  
- D) Vakuola

**2.** Perbedaan utama sel prokariotik dengan eukariotik adalah...
- A) Jumlah sitoplasma
- B) **Ada tidaknya membran inti** ✓
- C) Ukuran sel
- D) Warna sel

**3.** Proses yang menghasilkan 4 sel anak dengan kromosom haploid disebut...
- A) Mitosis
- B) Amitosis
- C) **Meiosis** ✓
- D) Fragmentasi

### Soal Uraian

**1.** Jelaskan perbedaan antara sel prokariotik dan eukariotik! Berikan masing-masing 2 contoh organisme! *(Skor: 20)*

**2.** Mengapa sel merupakan unit dasar kehidupan? Kaitkan dengan ciri-ciri makhluk hidup! *(Skor: 20)*`,
    rubrikPenilaian: `# Rubrik Penilaian — Biologi Kelas X

## Rubrik Penilaian Proyek P5: Gaya Hidup Berkelanjutan

| Kriteria | Bobot | 85-100 (Sangat Baik) | 70-84 (Baik) | 55-69 (Cukup) | <55 (Kurang) |
|----------|-------|---------------------|--------------|----------------|--------------|
| **Kreativitas Solusi** | 30% | Ide orisinal, dapat diterapkan, berdampak nyata | Ide relevan, ada inovasi minor | Ide umum, kurang inovatif | Tidak ada inovasi |
| **Kolaborasi Tim** | 25% | Pembagian tugas merata, komunikasi aktif | Kolaborasi baik, ada sedikit dominasi | Kolaborasi minimal | Tidak ada kerja tim |
| **Kualitas Laporan** | 25% | Sistematis, data akurat, analisis mendalam | Sistematis, data cukup | Kurang sistematis | Tidak lengkap |
| **Presentasi** | 20% | Percaya diri, visual menarik, menjawab pertanyaan | Cukup percaya diri, visual OK | Kurang percaya diri | Tidak dapat presentasi |`,
    ideIntegrationP5: `# Ide Integrasi P5 — Biologi × Gaya Hidup Berkelanjutan

## Koneksi Tema dengan Materi Biologi

### 1. Sel & Lingkungan Hidup Sehat
**Materi:** Struktur Sel → **Aksi P5:** Kampanye "Sel Sehat, Tubuh Kuat"
- Siswa membuat infografis dampak polutan terhadap sel manusia
- Presentasi ke adik kelas tentang bahaya zat kimia berbahaya

### 2. Ekosistem Sekolahku
**Materi:** Ekologi → **Aksi P5:** Audit Ekosistem Sekolah
- Petakan semua komponen biotik dan abiotik di area sekolah
- Buat rekomendasi peningkatan biodiversitas sekolah
- **Output:** Taman mini sekolah atau kebun vertikal

### 3. Zero Waste Lab
**Materi:** Metabolisme → **Aksi P5:** Lab Bebas Limbah
- Hitung dan kurangi limbah praktikum biologi
- Cari alternatif bahan praktikum yang ramah lingkungan

### 4. Biomonitoring Air Sekolah
**Materi:** Jaringan & Ekosistem → **Aksi P5:** Uji Kualitas Air
- Gunakan bioindikator (makhluk hidup) untuk menilai kualitas air
- Laporkan hasil ke sekolah dan sarankan tindakan perbaikan`,
  },
};
