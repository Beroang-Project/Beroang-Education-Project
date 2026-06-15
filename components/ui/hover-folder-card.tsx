"use client";

import { motion } from "framer-motion";
import { MoreHorizontal, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "blue" | "violet" | "red" | "green" | "orange";

const themeConfig: Record<Variant, {
  containerBg: string;
  pocketBg: string;
}> = {
  blue: {
    containerBg: "bg-gradient-to-br from-[#5A9CF9] to-[#2B60E6]",
    pocketBg: "bg-[#242424] dark:bg-[#1C1C1E]",
  },
  violet: {
    containerBg: "bg-gradient-to-br from-[#A78BFA] to-[#6D28D9]",
    pocketBg: "bg-[#242424] dark:bg-[#1C1C1E]",
  },
  red: {
    containerBg: "bg-gradient-to-br from-[#F87171] to-[#DC2626]",
    pocketBg: "bg-[#242424] dark:bg-[#1C1C1E]",
  },
  green: {
    containerBg: "bg-gradient-to-br from-[#34D399] to-[#059669]",
    pocketBg: "bg-[#242424] dark:bg-[#1C1C1E]",
  },
  orange: {
    containerBg: "bg-gradient-to-br from-[#FBBF24] to-[#D97706]",
    pocketBg: "bg-[#242424] dark:bg-[#1C1C1E]",
  }
};

interface HoverFolderCardProps {
  variant: Variant;
  title: string;
  itemCount: number;
  onClick?: () => void;
  className?: string;
}

export function HoverFolderCard({ variant, title, itemCount, onClick, className }: HoverFolderCardProps) {
  const c = themeConfig[variant] || themeConfig.blue;

  // Static positions for the 3 papers
  const papers = [
    { rotate: -8, x: -30, y: 30, scale: 0.85 },
    { rotate: -2, x: 0, y: 20, scale: 0.9 },
    { rotate: 6, x: 30, y: 35, scale: 0.85 },
  ];

  return (
    <motion.div
      onClick={onClick}
      whileHover="hover"
      initial="rest"
      animate="rest"
      className={cn(
        "w-full aspect-square max-h-[220px] max-w-[260px] mx-auto relative cursor-pointer rounded-[28px] overflow-hidden shadow-sm border-[3px] border-[#1C1C1E]/5 dark:border-white/5",
        c.containerBg,
        className
      )}
    >
      {/* Glossy overlay on the background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />

      {/* The 3 Papers */}
      <div className="absolute inset-0 flex items-start justify-center pt-8">
        {papers.map((p, i) => (
          <motion.div
            key={i}
            variants={{
              rest: { y: p.y, x: p.x, rotate: p.rotate, scale: p.scale },
              hover: { y: p.y - 12, x: p.x, rotate: p.rotate, scale: p.scale }
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.05 }}
            className="absolute w-[100px] h-[140px] bg-white rounded-xl shadow-lg border border-black/5 p-3 flex flex-col gap-2"
            style={{ zIndex: i }}
          >
            {/* Minimal document lines */}
            <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2" />
            <div className="w-4/5 h-1.5 bg-gray-200 rounded-full" />
            <div className="w-full h-1.5 bg-gray-200 rounded-full" />
            <div className="w-3/5 h-1.5 bg-gray-200 rounded-full" />
          </motion.div>
        ))}
      </div>

      {/* Front Pocket */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[65%] z-10 flex flex-col justify-between p-6 pb-5",
          c.pocketBg
        )}
        style={{
          clipPath: "polygon(0 0, 35% 0, 50% 22%, 100% 22%, 100% 100%, 0 100%)"
        }}
      >
        {/* Top area of pocket: Title and Ellipsis */}
        <div className="flex justify-between items-start mt-[10%]">
          <div>
            <h3 className="text-white font-display font-medium text-lg tracking-tight">
              {title}
            </h3>
            <p className="text-white/50 text-xs font-medium mt-0.5">
              Catatan & Lainnya
            </p>
          </div>
          <div className="h-6 w-6 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 cursor-pointer transition-colors -mt-1 -mr-1">
            <MoreHorizontal className="h-4 w-4" />
          </div>
        </div>

        {/* Bottom area of pocket: Icon and count */}
        <div className="flex items-center gap-1.5 text-white/60">
          <FileText className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{itemCount} Files</span>
        </div>
      </div>
    </motion.div>
  );
}
