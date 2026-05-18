import { TimestampBadge } from './TimestampBadge';
import { formatTimestamp } from './formatTimestamp';

interface SummaryTimestampProps {
  timestamp: number;
  endTimestamp?: number;
  videoId: string;
  label?: string;
}

export function SummaryTimestamp({ timestamp, endTimestamp, videoId, label }: SummaryTimestampProps) {
  if (typeof endTimestamp === 'number' && endTimestamp > timestamp) {
    return (
      <TimestampBadge
        seconds={timestamp}
        videoId={videoId}
        className="ml-2 align-middle px-2 py-0.5 text-[13px] leading-none rounded-lg"
      >
        {label ?? `${formatTimestamp(timestamp)} - ${formatTimestamp(endTimestamp)}`}
      </TimestampBadge>
    );
  }

  return (
    <TimestampBadge
      seconds={timestamp}
      videoId={videoId}
      className="ml-2 align-middle px-2 py-0.5 text-[13px] leading-none rounded-lg"
    >
      {label ?? formatTimestamp(timestamp)}
    </TimestampBadge>
  );
}
