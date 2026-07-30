import React from 'react';
import { formatTimestamp } from './formatTimestamp';
import { useYouTubePlayer } from '@/store/YouTubePlayerContext';

interface TimestampBadgeProps {
  seconds: number;
  videoId: string;
  className?: string;
  children?: React.ReactNode;
}

export function TimestampBadge({ seconds, videoId, className = "", children }: TimestampBadgeProps) {
  const { openPlayer } = useYouTubePlayer();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openPlayer(videoId, seconds);
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

