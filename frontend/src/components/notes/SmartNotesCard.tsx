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
    purple: "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300 border-purple-500/40 hover:bg-purple-500/5",
    blue: "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 border-blue-500/40 hover:bg-blue-500/5"
  };

  const selectedColor = color === 'blue' ? colorClasses.blue : colorClasses.purple;
  const glowColor = color === 'blue' ? 'bg-blue-600/20 group-hover:bg-blue-600/30' : 'bg-purple-600/20 group-hover:bg-purple-600/30';

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`group relative flex w-full h-full flex-col items-start p-5 rounded-3xl border border-white/10 bg-[#1A1A1A]/40 backdrop-blur-md transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-sm ${selectedColor.split(' ').slice(4).join(' ')}`}
    >
      {/* Background Glow */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl transition-all duration-500 ${glowColor}`} />
      
      <div className={`relative flex items-center justify-center w-12 h-12 mb-4 rounded-2xl transition-colors ${selectedColor.split(' ').slice(0, 4).join(' ')}`}>
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <Icon className="w-6 h-6" />
        )}
      </div>

      <div className="relative flex items-center gap-2 mb-2">
        <h3 className="text-lg font-bold text-white group-hover:text-inherit transition-colors">{title}</h3>
        <Sparkles className="w-4 h-4 text-inherit animate-pulse" />
      </div>
      
      <p className="relative text-sm text-gray-400 text-left leading-relaxed group-hover:text-gray-300 transition-colors">
        {description}
      </p>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-3xl">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-inherit animate-spin" />
            <span className="text-xs font-medium text-inherit">Generating...</span>
          </div>
        </div>
      )}
    </motion.button>
  );
}
