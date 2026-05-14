import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Loader2 } from 'lucide-react';

interface SmartNotesCardProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function SmartNotesCard({ onClick, isLoading, disabled }: SmartNotesCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className="group relative flex w-full h-full flex-col items-start p-5 rounded-3xl border border-white/10 bg-[#1A1A1A]/40 backdrop-blur-md transition-all hover:border-purple-500/40 hover:bg-purple-500/5 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-sm"
    >
      {/* Background Glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl group-hover:bg-purple-600/30 transition-all duration-500" />
      
      <div className="relative flex items-center justify-center w-12 h-12 mb-4 rounded-2xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <FileText className="w-6 h-6" />
        )}
      </div>

      <div className="relative flex items-center gap-2 mb-2">
        <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">Smart Notes</h3>
        <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
      </div>
      
      <p className="relative text-sm text-gray-400 text-left leading-relaxed group-hover:text-gray-300 transition-colors">
        Generate structured AI notes and actionable insights from this video automatically.
      </p>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-3xl">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <span className="text-xs font-medium text-purple-400">Generating...</span>
          </div>
        </div>
      )}
    </motion.button>
  );
}
