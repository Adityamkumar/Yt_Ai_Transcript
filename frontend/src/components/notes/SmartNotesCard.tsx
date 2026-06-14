import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, FileText, Sparkles, Loader2 } from 'lucide-react';

interface SmartNotesCardProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  color?: string;
}

export function SmartNotesCard({
  onClick,
  isLoading,
  disabled,
  title = "Smart Notes",
  description = "Generate structured AI notes and actionable insights from this video automatically.",
  icon: Icon = FileText,
  color = "purple"
}: SmartNotesCardProps) {
  const colorClasses = {
    purple: {
      icon: "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/18",
      glow: "bg-purple-600/15 group-hover:bg-purple-600/25",
      border: "hover:border-purple-500/20",
    },
    blue: {
      icon: "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/18",
      glow: "bg-blue-600/15 group-hover:bg-blue-600/25",
      border: "hover:border-blue-500/20",
    },
  };

  const selected = color === 'blue' ? colorClasses.blue : colorClasses.purple;

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`group relative flex w-full h-full flex-col items-start p-5 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-3)] backdrop-blur-md transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${selected.border}`}
    >
      {/* Glow */}
      <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full blur-3xl transition-all duration-500 ${selected.glow}`} />

      {/* Icon */}
      <div className={`relative flex items-center justify-center w-11 h-11 mb-4 rounded-xl transition-colors ${selected.icon}`}>
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>

      {/* Title */}
      <div className="relative flex items-center gap-2 mb-1.5">
        <h3 className="text-base font-semibold text-[var(--text-primary)] group-hover:text-inherit transition-colors">{title}</h3>
        <Sparkles className="w-3.5 h-3.5 text-inherit animate-pulse" />
      </div>

      {/* Description */}
      <p className="relative text-sm text-[var(--text-muted)] text-left leading-relaxed group-hover:text-[var(--text-secondary)] transition-colors">
        {description}
      </p>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/15 backdrop-blur-[2px] rounded-2xl">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-7 h-7 text-inherit animate-spin" />
            <span className="text-xs font-medium text-inherit">Generating...</span>
          </div>
        </div>
      )}
    </motion.button>
  );
}
