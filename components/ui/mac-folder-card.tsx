'use client';

import * as React from 'react';
import { MoreHorizontal, Pencil, Trash2, BookOpen, ClipboardList, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Pastel color palette per subject
export const FOLDER_COLORS = [
  { label: 'Biologi',    value: '#D1F0DC', text: '#1A4731', dark: '#145C32' },
  { label: 'Ekonomi',    value: '#FEF3C7', text: '#78350F', dark: '#92400E' },
  { label: 'Bahasa ID',  value: '#FCE7F3', text: '#831843', dark: '#9D174D' },
  { label: 'Matematika', value: '#E0E7FF', text: '#312E81', dark: '#3730A3' },
  { label: 'Sejarah',    value: '#FEE2E2', text: '#7F1D1D', dark: '#991B1B' },
  { label: 'Seni',       value: '#FFEDD5', text: '#7C2D12', dark: '#9A3412' },
  { label: 'Inggris',    value: '#E0F2FE', text: '#0C4A6E', dark: '#075985' },
  { label: 'Umum',       value: '#DCFCE7', text: '#14532D', dark: '#166534' },
  { label: 'Sosiologi',  value: '#F3E8FF', text: '#4C1D95', dark: '#5B21B6' },
];

export function getDefaultFolderColor(subject: string) {
  const s = subject.toLowerCase();
  if (s.includes('biologi') || s.includes('kimia') || s.includes('lingkungan')) return FOLDER_COLORS[0];
  if (s.includes('ekonomi') || s.includes('geografi')) return FOLDER_COLORS[1];
  if (s.includes('indonesia') || s.includes('sastra') || s.includes('bahasa')) return FOLDER_COLORS[2];
  if (s.includes('fisika') || s.includes('matematika') || s.includes('informatika')) return FOLDER_COLORS[3];
  if (s.includes('sejarah') || s.includes('pkn')) return FOLDER_COLORS[4];
  if (s.includes('seni') || s.includes('prakarya')) return FOLDER_COLORS[5];
  if (s.includes('inggris') || s.includes('mandarin') || s.includes('arab')) return FOLDER_COLORS[6];
  if (s.includes('sosiologi')) return FOLDER_COLORS[8];
  return FOLDER_COLORS[7];
}

interface MacFolderCardProps {
  title: string;
  folderColor: string;
  textColor: string;
  materialCount: number;
  assignmentCount: number;
  quizCount: number;
  onOpen?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function MacFolderCard({
  title,
  folderColor,
  textColor,
  materialCount,
  assignmentCount,
  quizCount = 0,
  onOpen,
  onEdit,
  onDelete,
  className,
  children,
}: MacFolderCardProps) {
  const totalItems = materialCount + assignmentCount + quizCount;

  // Slightly darker shade for the tab
  const tabColor = folderColor;

  return (
    <div
      onClick={onOpen}
      className={cn('relative cursor-pointer select-none w-full group', className)}
    >
      {/* ── Folder Tab: small pill protruding from top-left ── */}
      <div
        className="flex items-end"
        style={{ height: 14, paddingLeft: 0 }}
      >
        <div
          className="rounded-t-lg"
          style={{
            backgroundColor: tabColor,
            filter: 'brightness(0.9)',
            width: 80,
            height: 14,
            borderRadius: '8px 8px 0 0',
            borderTop: `1.5px solid ${textColor}20`,
            borderLeft: `1.5px solid ${textColor}20`,
            borderRight: `1.5px solid ${textColor}20`,
          }}
        />
      </div>

      {/* ── Folder Body ── */}
      {/*
        Key: rounded-tl-none makes the top-left corner square,
        which connects seamlessly with the bottom of the tab above.
        All other corners are rounded.
      */}
      <div
        className="relative overflow-hidden transition-colors duration-200 group-hover:brightness-95"
        style={{
          backgroundColor: folderColor,
          borderRadius: '0 12px 12px 12px',
          border: `1.5px solid ${textColor}22`,
        }}
      >
        {/* Top row: spacer + menu button */}
        <div className="flex items-center justify-end px-3 pt-3 pb-0">
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  style={{ color: textColor, backgroundColor: `${textColor}15` }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {onEdit && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                    <Pencil className="w-4 h-4 mr-2" /> Edit Folder
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Empty body space (gives folder its height) */}
        {!children && <div style={{ height: 52 }} />}

        {/* Footer info or Children */}
        {children ? (
          children
        ) : (
          <div className="px-4 pb-4">
            <h3
              className="font-bold text-[15px] leading-snug line-clamp-2 mb-1"
              style={{ color: textColor }}
            >
              {title}
            </h3>
            <p
              className="text-[12px] font-medium flex items-center gap-2"
              style={{ color: textColor, opacity: 0.55 }}
            >
              <span className="flex items-center gap-0.5">
                <BookOpen className="w-2.5 h-2.5" /> {materialCount}
              </span>
              <span className="flex items-center gap-0.5">
                <ClipboardList className="w-2.5 h-2.5" /> {assignmentCount}
              </span>
              <span className="flex items-center gap-0.5">
                <HelpCircle className="w-2.5 h-2.5" /> {quizCount}
              </span>
              <span className="ml-auto">{totalItems} konten</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
