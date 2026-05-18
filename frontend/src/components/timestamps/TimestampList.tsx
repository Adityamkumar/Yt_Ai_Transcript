import React from 'react';
import { TimestampBadge } from './TimestampBadge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TimestampItem {
  text: string;
  timestamp: string;
  seconds: number;
  endTimestamp?: string;
  endSeconds?: number;
}

interface TimestampListProps {
  items: TimestampItem[];
  videoId: string;
  dotColor?: string;
}

export function TimestampList({ items, videoId, dotColor = 'bg-purple-500' }: TimestampListProps) {
  return (
    <ul className="space-y-4">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-4 group">
          <div className={`mt-2.5 h-1.5 w-1.5 rounded-full ${dotColor} shrink-0 group-hover:scale-125 transition-transform`} />
          
          <div className="flex-1 min-w-0">
            <div className="text-gray-300 text-[15px] leading-relaxed markdown-content inline">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                p: ({children}) => <p className="inline">{children}</p>
              }}>
                {item.text}
              </ReactMarkdown>
              <span className="ml-2 inline-block">
                <TimestampBadge 
                  seconds={item.seconds} 
                  videoId={videoId} 
                />
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
