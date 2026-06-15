import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Class, LearningMaterial, Assignment, Quiz, Student } from '@/types';
import { MOCK_CLASSES, MOCK_STUDENTS, MOCK_ASSIGNMENTS, MOCK_QUIZZES, MOCK_MATERIALS } from '@/lib/mockData';
import { generateId } from '@/lib/utils';

interface ClassState {
  classes: Class[];
  students: Student[];
  materials: LearningMaterial[];
  assignments: Assignment[];
  quizzes: Quiz[];

  // Class actions
  addClass: (cls: Omit<Class, 'id'>) => void;
  updateClass: (id: string, updates: Partial<Class>) => void;
  deleteClass: (id: string) => void;
  linkAIOutput: (classId: string, aiOutputId: string) => void;

  // Material actions
  addMaterial: (material: Omit<LearningMaterial, 'id' | 'createdAt'>) => void;
  deleteMaterial: (id: string) => void;
  addMaterialsFromAI: (classId: string, materials: Omit<LearningMaterial, 'id' | 'createdAt'>[]) => void;

  // Assignment actions
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  submitAssignment: (assignmentId: string, studentId: string) => void;
  deleteAssignment: (id: string) => void;

  // Quiz actions
  addQuiz: (quiz: Omit<Quiz, 'id'>) => void;
  deleteQuiz: (id: string) => void;

  // Getters
  getClassById: (id: string) => Class | undefined;
  getStudentsByClass: (classId: string) => Student[];
  getMaterialsByClass: (classId: string) => LearningMaterial[];
  getAssignmentsByClass: (classId: string) => Assignment[];
  getQuizzesByClass: (classId: string) => Quiz[];

  // Recent tracking
  recentSubjects: string[];
  trackRecentSubject: (subject: string) => void;
}

export const useClassStore = create<ClassState>()(
  persist(
    (set, get) => ({
      classes: MOCK_CLASSES,
      students: MOCK_STUDENTS,
      materials: MOCK_MATERIALS,
      assignments: MOCK_ASSIGNMENTS,
      quizzes: MOCK_QUIZZES,
      recentSubjects: [],

      addClass: (cls) =>
        set((state) => ({ classes: [...state.classes, { ...cls, id: generateId() }] })),

      updateClass: (id, updates) =>
        set((state) => ({
          classes: state.classes.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteClass: (id) =>
        set((state) => ({
          classes: state.classes.filter((c) => c.id !== id),
        })),

      linkAIOutput: (classId, aiOutputId) =>
        set((state) => ({
          classes: state.classes.map((c) =>
            c.id === classId ? { ...c, aiPlannerOutputId: aiOutputId } : c
          ),
        })),

      addMaterial: (material) =>
        set((state) => ({
          materials: [
            ...state.materials,
            { ...material, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      deleteMaterial: (id) =>
        set((state) => ({ materials: state.materials.filter((m) => m.id !== id) })),

      addMaterialsFromAI: (classId, newMaterials) =>
        set((state) => ({
          materials: [
            ...state.materials,
            ...newMaterials.map((m) => ({
              ...m,
              id: generateId(),
              createdAt: new Date().toISOString(),
              classId,
              fromAI: true,
            })),
          ],
        })),

      addAssignment: (assignment) =>
        set((state) => ({
          assignments: [...state.assignments, { ...assignment, id: generateId() }],
        })),

      updateAssignment: (id, updates) =>
        set((state) => ({
          assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),

      submitAssignment: (assignmentId, studentId) =>
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === assignmentId
              ? { ...a, submissions: { ...a.submissions, [studentId]: true } }
              : a
          ),
        })),

      deleteAssignment: (id) =>
        set((state) => ({ assignments: state.assignments.filter((a) => a.id !== id) })),

      addQuiz: (quiz) =>
        set((state) => ({ quizzes: [...state.quizzes, { ...quiz, id: generateId() }] })),

      deleteQuiz: (id) =>
        set((state) => ({ quizzes: state.quizzes.filter((q) => q.id !== id) })),

      getClassById: (id) => get().classes.find((c) => c.id === id),
      getStudentsByClass: (classId) => get().students.filter((s) => s.classId === classId),
      getMaterialsByClass: (classId) => get().materials.filter((m) => m.classId === classId),
      getAssignmentsByClass: (classId) => get().assignments.filter((a) => a.classId === classId),
      getQuizzesByClass: (classId) => get().quizzes.filter((q) => q.classId === classId),

      trackRecentSubject: (subject) =>
        set((state) => ({
          recentSubjects: [
            subject,
            ...state.recentSubjects.filter((s) => s !== subject),
          ].slice(0, 6),
        })),
    }),
    {
      name: 'greenpath-classes',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
