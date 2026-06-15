import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateId } from '@/lib/utils';

export interface AIChatHistory {
  id: string;
  title: string;
  createdAt: string;
}

interface AIAssistantState {
  history: AIChatHistory[];
  currentChatId: string | null;

  createChat: (title: string) => string;
  deleteChat: (id: string) => void;
  setCurrentChat: (id: string | null) => void;
}

export const useAIAssistantStore = create<AIAssistantState>()(
  persist(
    (set) => ({
      history: [
        { id: '1', title: 'Konsultasi Kurikulum', createdAt: '2026-06-15' },
        { id: '2', title: 'Rencana Pembelajaran', createdAt: '2026-06-14' },
        { id: '3', title: 'Evaluasi Siswa', createdAt: '2026-06-13' },
      ],
      currentChatId: null,

      createChat: (title) => {
        const id = generateId();
        set((state) => ({
          history: [{ id, title, createdAt: new Date().toISOString() }, ...state.history],
        }));
        return id;
      },

      deleteChat: (id) =>
        set((state) => ({ history: state.history.filter((h) => h.id !== id) })),

      setCurrentChat: (id) => set({ currentChatId: id }),
    }),
    {
      name: 'greenpath-ai-assistant',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
