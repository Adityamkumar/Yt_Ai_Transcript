import React from 'react';
import { formatTimestamp } from './formatTimestamp';

interface TimestampBadgeProps {
  seconds: number;
  videoId: string;
  className?: string;
  children?: React.ReactNode;
}

export function TimestampBadge({ seconds, videoId, className = "", children }: TimestampBadgeProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://youtube.com/watch?v=${videoId}&t=${seconds}s`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors font-mono text-[11px] font-bold border border-blue-500/20 gap-1 ${className}`}
    >
      {children ?? formatTimestamp(seconds)}
    </button>
  );
}
