// GreenPath — TypeScript Interfaces
// Single source of truth for all data shapes. DO NOT change field names.

export interface Student {
  id: string;
  name: string;
  avatar?: string; // URL or initials
  classId: string;
  scores: {
    assignments: Record<string, number>; // key: assignmentId, value: 0-100
    quizzes: Record<string, number>;     // key: quizId, value: 0-100
    p5Project: number;                   // 0-100
  };
  p5GroupId: string;
}

export interface AIPlannerOutput {
  id: string;
  createdAt: string;
  subject: string;
  grade: string;
  semester: string;
  cp: string;         // Capaian Pembelajaran
  p5Theme: string;
  durationWeeks: number;
  output: {
    alurPembelajaran: string;   // Markdown string
    modulAjar: string;          // Markdown string
    aktivitasBelajar: string;   // Markdown string
    quizAsesmen: string;        // Markdown string
    rubrikPenilaian: string;    // Markdown string
    ideIntegrationP5: string;   // Markdown string
  };
}

export interface LearningMaterial {
  id: string;
  classId: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'link';
  url: string;
  createdAt: string;
  fromAI: boolean;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  instructions: string;
  deadline: string; // ISO date string
  weight: number;   // 0-100
  submissions: Record<string, boolean>; // key: studentId, value: submitted
  fromAI: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'essay';
  options?: string[];
  correctAnswer?: number; // index of correct option
}

export interface Quiz {
  id: string;
  classId: string;
  title: string;
  durationMinutes: number;
  questions: QuizQuestion[];
  fromAI: boolean;
}

export interface P5Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface P5Log {
  id: string;
  date: string;
  description: string;
  type: 'update' | 'feedback' | 'milestone';
}

export interface P5Group {
  id: string;
  projectId: string;
  name: string;
  memberIds: string[];
  status: 'proposal' | 'in_progress' | 'documentation' | 'final_report';
  milestones: P5Milestone[];
  logs: P5Log[];
  teacherFeedback: string;
}

export interface Class {
  id: string;
  name: string;        // e.g. "X IPA 1"
  subject: string;
  teacherId: string;
  studentIds: string[];
  aiPlannerOutputId?: string; // ref to AIPlannerOutput
  gradeWeights: {
    assignments: number; // default 40
    quizzes: number;     // default 30
    p5Project: number;   // default 30
  };
  kkm: number; // default 75
}

export interface PlannerFormValues {
  subject: string;
  grade: string;
  semester: string;
  cp: string;
  p5Theme: string;
  durationWeeks: number;
  enableP5Integration: boolean;
}

export type KanbanStatus = P5Group['status'];

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  school: string;
  avatar?: string;
  bio?: string;
  preferences: {
    darkMode: boolean;
    notifications: boolean;
    aiAutoSuggest: boolean;
    language: 'id' | 'en';
  };
}
