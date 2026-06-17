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
import { generateWithGroqSmart } from '@/lib/groq';
import { generateId } from '@/lib/utils';
import { MOCK_AI_OUTPUT } from '@/lib/mockData';

interface PlannerState {
  history: AIPlannerOutput[];
  currentOutput: AIPlannerOutput | null;
  isGenerating: boolean;

  generateOutput: (params: PlannerFormValues) => Promise<AIPlannerOutput>;
  setCurrentOutput: (output: AIPlannerOutput) => void;
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

        try {
          // Use Groq API
          const prompt = `Buat modul ajar lengkap untuk mata pelajaran ${params.subject} kelas ${params.grade} semester ${params.semester}.
          
          Capaian Pembelajaran: ${params.cp}
          ${params.p5Theme ? `Tema P5: ${params.p5Theme}` : ''}
          Durasi: ${params.durationWeeks} minggu
          ${params.enableQuiz ? 'Sertakan quiz dan asesmen.' : ''}
          
          Format output dalam markdown dengan struktur:
          # Modul Ajar - ${params.subject} Kelas ${params.grade}
          ## Tujuan Pembelajaran
          ## Materi Pokok
          ## Langkah Pembelajaran
          ## Penilaian
          ## Integrasi P5${params.p5Theme ? ` (${params.p5Theme})` : ''}`;

          const aiResponse = await generateWithGroqSmart(prompt);
          
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
              alurPembelajaran: aiResponse,
              modulAjar: aiResponse,
              aktivitasBelajar: generateAktivitasBelajar(params),
              quizAsesmen: params.enableQuiz ? generateQuiz(params) : 'Tidak ada quiz yang diminta.',
              rubrikPenilaian: generateRubrik(params),
              ideIntegrationP5: params.p5Theme ? generateIdeP5(params) : 'Tidak ada integrasi P5.',
            },
          };

          set((state) => ({
            isGenerating: false,
            currentOutput: output,
            history: [output, ...state.history],
          }));

          return output;
        } catch (error) {
          // Fallback to mock templates if API fails
          console.warn('Gemini API failed, using mock templates:', error);
          
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
              quizAsesmen: params.enableQuiz ? generateQuiz(params) : 'Tidak ada quiz yang diminta.',
              rubrikPenilaian: generateRubrik(params),
              ideIntegrationP5: params.p5Theme ? generateIdeP5(params) : 'Tidak ada integrasi P5.',
            },
          };

          set((state) => ({
            isGenerating: false,
            currentOutput: output,
            history: [output, ...state.history],
          }));

          return output;
        }
      },

      saveToClass: (_classId) => {
        // Handled by classStore — just a confirmation signal
      },

      setCurrentOutput: (output) => set({ currentOutput: output }),

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
