import React, { useMemo } from 'react';
import { ChatMessage } from '@/types';
import { SummaryTimestamp } from '../timestamps/SummaryTimestamp';
import { formatTimestamp } from '../timestamps/formatTimestamp';

interface SummaryMessageProps {
  message: ChatMessage;
  videoId: string;
}

interface SummaryData {
  summary: {
    text: string;
    timestamp: number;
    endTimestamp?: number;
  }[];
}

const splitTopicAndDescription = (text: string) => {
  const trimmed = text.trim();
  const colonIndex = trimmed.indexOf(':');
  if (colonIndex > 0 && colonIndex < 80) {
    return {
      topic: trimmed.slice(0, colonIndex).trim(),
      description: trimmed.slice(colonIndex + 1).trim(),
    };
  }

  const sentenceIndex = trimmed.indexOf('. ');
  if (sentenceIndex > 0 && sentenceIndex < 100) {
    return {
      topic: trimmed.slice(0, sentenceIndex).trim(),
      description: trimmed.slice(sentenceIndex + 2).trim(),
    };
  }

  return {
    topic: trimmed,
    description: '',
  };
};

export function SummaryMessage({ message, videoId }: SummaryMessageProps) {
  const data = useMemo((): SummaryData | null => {
    try {
      const parsed = JSON.parse(message.content) as SummaryData;
      if (!parsed || !Array.isArray(parsed.summary)) return null;
      return {
        summary: parsed.summary
          .filter(
            (item) => typeof item?.text === 'string' && Number.isFinite(item?.timestamp),
          )
          .map((item) => ({
            text: item.text.trim(),
            timestamp: Math.max(0, Math.floor(item.timestamp)),
          })),
      };
    } catch {
      return null;
    }
  }, [message.content]);

  if (!data || data.summary.length === 0) {
    return <div className="text-gray-300 whitespace-pre-wrap text-[18px] leading-relaxed">{message.content}</div>;
  }

  return (
    <div className="space-y-4 py-1">
      <h3 className="text-white text-[19px] sm:text-[20px] font-bold leading-tight tracking-tight">
        Key steps covered in the project:
      </h3>

      <div className="space-y-5">
        {data.summary.map((item, index) => {
          const parsed = splitTopicAndDescription(item.text);
          const end = item.endTimestamp && item.endTimestamp > item.timestamp ? item.endTimestamp : undefined;
          const rangeLabel = end
            ? `${formatTimestamp(item.timestamp)} - ${formatTimestamp(end)}`
            : formatTimestamp(item.timestamp);

          return (
            <div
              key={`${item.timestamp}-${index}`}
              className="text-gray-100 text-[17px] sm:text-[18px] leading-[1.55]"
            >
              <p>
                <span className="mr-2 align-top text-gray-300">•</span>
                <span className="font-bold text-white">{parsed.topic}</span>{' '}
                <SummaryTimestamp
                  timestamp={item.timestamp}
                  endTimestamp={end}
                  videoId={videoId}
                  label={rangeLabel}
                />
                {parsed.description ? `: ${parsed.description}` : ''}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
