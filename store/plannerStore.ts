import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AIPlannerOutput, PlannerFormValues } from '@/types';
import {
  generateAlurPembelajaran,
  generateModulAjar,
  generateAktivitasBelajar,
  generateQuiz,
  generateRubrik,
  generateIdeP5,
} from '@/lib/aiTemplates';
import { generateId } from '@/lib/utils';
import { MOCK_AI_OUTPUT } from '@/lib/mockData';

interface PlannerState {
  history: AIPlannerOutput[];
  currentOutput: AIPlannerOutput | null;
  isGenerating: boolean;

  generateOutput: (params: PlannerFormValues) => Promise<AIPlannerOutput>;
  saveToClass: (classId: string) => void;
  clearCurrent: () => void;
  deleteHistory: (id: string) => void;
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      history: [MOCK_AI_OUTPUT],
      currentOutput: null,
      isGenerating: false,

      generateOutput: async (params) => {
        set({ isGenerating: true });

        // Simulate AI latency: 2-3 seconds
        const delay = 2000 + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));

        const output: AIPlannerOutput = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          subject: params.subject,
          grade: params.grade,
          semester: params.semester,
          cp: params.cp,
          p5Theme: params.p5Theme,
          durationWeeks: params.durationWeeks,
          output: {
            alurPembelajaran: generateAlurPembelajaran(params),
            modulAjar: generateModulAjar(params),
            aktivitasBelajar: generateAktivitasBelajar(params),
            quizAsesmen: generateQuiz(params),
            rubrikPenilaian: generateRubrik(params),
            ideIntegrationP5: generateIdeP5(params),
          },
        };

        set((state) => ({
          isGenerating: false,
          currentOutput: output,
          history: [output, ...state.history],
        }));

        return output;
      },

      saveToClass: (_classId) => {
        // Handled by classStore — just a confirmation signal
      },

      clearCurrent: () => set({ currentOutput: null }),

      deleteHistory: (id) =>
        set((state) => ({ history: state.history.filter((h) => h.id !== id) })),
    }),
    {
      name: 'greenpath-planner',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
