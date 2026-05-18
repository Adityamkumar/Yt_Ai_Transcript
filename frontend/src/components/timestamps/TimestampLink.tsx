import React from 'react';

interface TimestampLinkProps {
  seconds: number;
  videoId: string;
  children: React.ReactNode;
}

export function TimestampLink({ seconds, videoId, children }: TimestampLinkProps) {
  const handleClick = () => {
    const url = `https://youtube.com/watch?v=${videoId}&t=${seconds}s`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="text-purple-400 hover:text-purple-300 underline decoration-purple-500/30 underline-offset-4 decoration-2 transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}
