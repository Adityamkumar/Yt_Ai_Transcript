import React from 'react';
import { TimestampBadge } from './TimestampBadge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TimestampSummaryCardProps {
  heading: string;
  point: string;
  timestamp: string;
  seconds: number;
  endTimestamp?: string;
  endSeconds?: number;
  videoId: string;
}

export function TimestampSummaryCard({
  heading,
  point,
  timestamp,
  seconds,
  endTimestamp,
  endSeconds,
  videoId,
}: TimestampSummaryCardProps) {
  return (
    <div className="group relative p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all">
      <div className="mb-3">
        <h4 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
          {heading}
        </h4>
      </div>
      
      <div className="text-gray-400 text-sm leading-relaxed markdown-content inline">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
          p: ({children}) => <p className="inline">{children}</p>
        }}>
          {point}
        </ReactMarkdown>
        <span className="ml-2 inline-block">
          <TimestampBadge 
            seconds={seconds} 
            videoId={videoId} 
          />
        </span>
      </div>
    </div>
  );
}
