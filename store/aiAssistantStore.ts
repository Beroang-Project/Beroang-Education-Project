import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateId } from '@/lib/utils';

export interface AIChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export interface AIChatHistory {
  id: string;
  title: string;
  createdAt: string;
  messages: AIChatMessage[];
  pinned?: boolean;
}

interface AIAssistantState {
  history: AIChatHistory[];
  currentChatId: string | null;

  createChat: (title: string, firstMessage?: AIChatMessage) => string;
  deleteChat: (id: string) => void;
  updateChatTitle: (id: string, title: string) => void;
  updateChatMessages: (id: string, messages: AIChatMessage[]) => void;
  togglePinChat: (id: string) => void;
  setCurrentChat: (id: string | null) => void;
}

export const useAIAssistantStore = create<AIAssistantState>()(
  persist(
    (set) => ({
      history: [
        { id: '1', title: 'Konsultasi Kurikulum', createdAt: '2026-06-15', messages: [] },
        { id: '2', title: 'Rencana Pembelajaran', createdAt: '2026-06-14', messages: [] },
        { id: '3', title: 'Evaluasi Siswa', createdAt: '2026-06-13', messages: [] },
      ],
      currentChatId: null,

      createChat: (title, firstMessage) => {
        const id = generateId();
        const messages = firstMessage ? [firstMessage] : [];
        set((state) => ({
          history: [{ id, title, createdAt: new Date().toISOString(), messages }, ...state.history],
        }));
        return id;
      },

      deleteChat: (id) =>
        set((state) => ({ history: state.history.filter((h) => h.id !== id) })),

      updateChatTitle: (id, title) =>
        set((state) => ({
          history: state.history.map((h) => (h.id === id ? { ...h, title } : h)),
        })),

      updateChatMessages: (id, messages) =>
        set((state) => ({
          history: state.history.map((h) => (h.id === id ? { ...h, messages } : h)),
        })),

      togglePinChat: (id) =>
        set((state) => ({
          history: state.history.map((h) => (h.id === id ? { ...h, pinned: !h.pinned } : h)),
        })),

      setCurrentChat: (id) => set({ currentChatId: id }),
    }),
    {
      name: 'greenpath-ai-assistant',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
