import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { P5Group } from '@/types';
import { MOCK_P5_GROUPS } from '@/lib/mockData';
import { generateId } from '@/lib/utils';

interface P5State {
  groups: P5Group[];

  addGroup: (group: Omit<P5Group, 'id' | 'logs' | 'teacherFeedback'>) => void;
  updateGroupStatus: (groupId: string, status: P5Group['status']) => void;
  addFeedback: (groupId: string, feedback: string) => void;
  validateMilestone: (groupId: string, milestoneId: string) => void;
  addLog: (groupId: string, description: string, type: 'update' | 'feedback' | 'milestone') => void;
  deleteGroup: (groupId: string) => void;

  getGroupsByProject: (projectId: string) => P5Group[];
  getGroupById: (id: string) => P5Group | undefined;
}

export const useP5Store = create<P5State>()(
  persist(
    (set, get) => ({
      groups: MOCK_P5_GROUPS,

      addGroup: (group) =>
        set((state) => ({
          groups: [
            ...state.groups,
            {
              ...group,
              id: generateId(),
              logs: [{ id: generateId(), date: new Date().toISOString().split('T')[0], description: 'Kelompok dibuat', type: 'update' }],
              teacherFeedback: '',
            },
          ],
        })),

      updateGroupStatus: (groupId, status) =>
        set((state) => ({
          groups: state.groups.map((g) => (g.id === groupId ? { ...g, status } : g)),
        })),

      addFeedback: (groupId, feedback) =>
        set((state) => ({
          groups: state.groups.map((g) => {
            if (g.id !== groupId) return g;
            return {
              ...g,
              teacherFeedback: feedback,
              logs: [
                ...g.logs,
                {
                  id: generateId(),
                  date: new Date().toISOString().split('T')[0],
                  description: `Feedback guru: ${feedback}`,
                  type: 'feedback' as const,
                },
              ],
            };
          }),
        })),

      validateMilestone: (groupId, milestoneId) =>
        set((state) => ({
          groups: state.groups.map((g) => {
            if (g.id !== groupId) return g;
            const updatedMilestones = g.milestones.map((m) =>
              m.id === milestoneId
                ? { ...m, completed: true, completedAt: new Date().toISOString().split('T')[0] }
                : m
            );
            const milestone = g.milestones.find((m) => m.id === milestoneId);
            return {
              ...g,
              milestones: updatedMilestones,
              logs: [
                ...g.logs,
                {
                  id: generateId(),
                  date: new Date().toISOString().split('T')[0],
                  description: `Milestone "${milestone?.title}" divalidasi`,
                  type: 'milestone' as const,
                },
              ],
            };
          }),
        })),

      addLog: (groupId, description, type) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  logs: [
                    ...g.logs,
                    {
                      id: generateId(),
                      date: new Date().toISOString().split('T')[0],
                      description,
                      type,
                    },
                  ],
                }
              : g
          ),
        })),

      deleteGroup: (groupId) =>
        set((state) => ({ groups: state.groups.filter((g) => g.id !== groupId) })),

      getGroupsByProject: (projectId) => get().groups.filter((g) => g.projectId === projectId),
      getGroupById: (id) => get().groups.find((g) => g.id === id),
    }),
    {
      name: 'greenpath-p5',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
