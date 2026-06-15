import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Student, Class } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function isDeadlinePassed(deadline: string): boolean {
  return new Date(deadline) < new Date();
}

export function calculateFinalGrade(
  student: Student,
  cls: Class
): number {
  const assignmentIds = Object.keys(student.scores.assignments);
  const quizIds = Object.keys(student.scores.quizzes);

  const assignmentAvg =
    assignmentIds.length > 0
      ? assignmentIds.reduce((sum, id) => sum + (student.scores.assignments[id] ?? 0), 0) /
        assignmentIds.length
      : 0;

  const quizAvg =
    quizIds.length > 0
      ? quizIds.reduce((sum, id) => sum + (student.scores.quizzes[id] ?? 0), 0) / quizIds.length
      : 0;

  const p5Score = student.scores.p5Project ?? 0;

  const { assignments, quizzes, p5Project } = cls.gradeWeights;
  const total = assignments + quizzes + p5Project;

  if (total === 0) return 0;

  return Math.round(
    (assignmentAvg * assignments + quizAvg * quizzes + p5Score * p5Project) / total
  );
}

export function getStatusBadge(score: number, kkm: number): 'tuntas' | 'belum_tuntas' {
  return score >= kkm ? 'tuntas' : 'belum_tuntas';
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function getAvatarColor(name: string): string {
  const colors = [
    'bg-emerald-500',
    'bg-teal-500',
    'bg-green-600',
    'bg-lime-600',
    'bg-cyan-600',
    'bg-blue-500',
    'bg-violet-500',
    'bg-amber-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}
