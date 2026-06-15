import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Student } from '@/types';
import { MOCK_STUDENTS } from '@/lib/mockData';

interface AssessmentState {
  students: Student[];
  classWeights: Record<string, { assignments: number; quizzes: number; p5Project: number }>;
  classKKM: Record<string, number>;

  // Grade editing
  updateScore: (
    studentId: string,
    type: 'assignments' | 'quizzes' | 'p5Project',
    key: string,
    value: number
  ) => void;

  // Weight & KKM
  setWeights: (classId: string, weights: { assignments: number; quizzes: number; p5Project: number }) => void;
  setKKM: (classId: string, kkm: number) => void;

  getStudentsByClass: (classId: string) => Student[];
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      students: MOCK_STUDENTS,
      classWeights: {
        c1: { assignments: 40, quizzes: 30, p5Project: 30 },
        c2: { assignments: 40, quizzes: 30, p5Project: 30 },
        c3: { assignments: 40, quizzes: 30, p5Project: 30 },
      },
      classKKM: { c1: 75, c2: 75, c3: 75 },

      updateScore: (studentId, type, key, value) =>
        set((state) => ({
          students: state.students.map((s) => {
            if (s.id !== studentId) return s;
            if (type === 'p5Project') {
              return { ...s, scores: { ...s.scores, p5Project: value } };
            }
            return {
              ...s,
              scores: {
                ...s.scores,
                [type]: { ...s.scores[type], [key]: value },
              },
            };
          }),
        })),

      setWeights: (classId, weights) =>
        set((state) => ({
          classWeights: { ...state.classWeights, [classId]: weights },
        })),

      setKKM: (classId, kkm) =>
        set((state) => ({
          classKKM: { ...state.classKKM, [classId]: kkm },
        })),

      getStudentsByClass: (classId) => get().students.filter((s) => s.classId === classId),
    }),
    {
      name: 'greenpath-assessment',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
