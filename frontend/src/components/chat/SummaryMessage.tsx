import React, { useMemo } from "react";
import { ChatMessage } from "@/types";
import { SummaryTimestamp } from "../timestamps/SummaryTimestamp";
import { formatTimestamp } from "../timestamps/formatTimestamp";
import { CitationChip } from "./CitationChip";

interface SummaryMessageProps {
  message: ChatMessage;
  videoId?: string;
}

interface SummaryItem {
  text: string;

  // Video summary fields
  timestamp?: number;
  endTimestamp?: number;

  // PDF summary fields
  startPage?: number;
  endPage?: number;
}

interface SummaryData {
  summary: SummaryItem[];
}

const splitTopicAndDescription = (text: string) => {
  const trimmed = text.trim();

  const colonIndex = trimmed.indexOf(":");
  if (colonIndex > 0 && colonIndex < 80) {
    return {
      topic: trimmed.slice(0, colonIndex).trim(),
      description: trimmed.slice(colonIndex + 1).trim(),
    };
  }

  const sentenceIndex = trimmed.indexOf(". ");
  if (sentenceIndex > 0 && sentenceIndex < 100) {
    return {
      topic: trimmed.slice(0, sentenceIndex).trim(),
      description: trimmed.slice(sentenceIndex + 2).trim(),
    };
  }

  const commaIndex = trimmed.indexOf(", ");
  if (commaIndex > 0 && commaIndex < 100) {
    return {
      topic: trimmed.slice(0, commaIndex + 1).trim(),
      description: trimmed.slice(commaIndex + 2).trim(),
      descriptionPrefix: " ",
    };
  }

  return {
    topic: trimmed,
    description: "",
  };
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export function SummaryMessage({ message, videoId }: SummaryMessageProps) {
  const data = useMemo((): SummaryData | null => {
    try {
      const parsed = JSON.parse(message.content) as SummaryData;

      if (!parsed || !Array.isArray(parsed.summary)) {
        return null;
      }

      const summary = parsed.summary
        .filter((item) => {
          if (!item || typeof item.text !== "string") {
            return false;
          }

          const hasVideoReference = isFiniteNumber(item.timestamp);
          const hasPdfReference = isFiniteNumber(item.startPage);

          return hasVideoReference || hasPdfReference;
        })
        .map((item) => ({
          text: item.text.trim(),
          timestamp: isFiniteNumber(item.timestamp)
            ? Math.max(0, Math.floor(item.timestamp))
            : undefined,
          endTimestamp: isFiniteNumber(item.endTimestamp)
            ? Math.max(0, Math.floor(item.endTimestamp))
            : undefined,
          startPage: isFiniteNumber(item.startPage)
            ? Math.max(1, Math.floor(item.startPage))
            : undefined,
          endPage: isFiniteNumber(item.endPage)
            ? Math.max(1, Math.floor(item.endPage))
            : undefined,
        }));

      return { summary };
    } catch {
      return null;
    }
  }, [message.content]);

  if (!data || data.summary.length === 0) {
    return (
      <div className="whitespace-pre-wrap text-[16px] leading-relaxed text-(--text-secondary)">
        {message.content}
      </div>
    );
  }

  return (
    <div className="space-y-4 py-1">
      <h3 className="text-[17px] font-bold leading-tight tracking-tight text-(--text-primary) sm:text-[18px]">
        {videoId
          ? "Key highlights from this video:"
          : "Key highlights from this document:"}
      </h3>

      <div className="space-y-5">
        {data.summary.map((item, index) => {
          const parsed = splitTopicAndDescription(item.text);

          const isPdfSummary = !videoId && isFiniteNumber(item.startPage);

          const isVideoSummary = !!videoId && isFiniteNumber(item.timestamp);

          const videoEnd =
            isFiniteNumber(item.endTimestamp) &&
            item.endTimestamp > item.timestamp!
              ? item.endTimestamp
              : undefined;

          const pdfStartPage = item.startPage!;

          const rangeLabel = videoEnd
            ? `${formatTimestamp(item.timestamp!)} - ${formatTimestamp(videoEnd)}`
            : formatTimestamp(item.timestamp!);

          return (
            <div
              key={`${item.timestamp ?? item.startPage}-${index}`}
              className="text-[16px] leading-[1.6] text-(--text-primary)/90"
            >
              <p className="flex flex-wrap items-start gap-x-1.5 gap-y-1">
                <span className="mr-1 text-(--text-muted)">•</span>

                <span className="font-bold text-(--text-primary)">
                  {parsed.topic}
                </span>

                {isVideoSummary ? (
                  <SummaryTimestamp
                    timestamp={item.timestamp!}
                    endTimestamp={videoEnd}
                    videoId={videoId!}
                    label={rangeLabel}
                  />
                ) : null}
                {isPdfSummary ? <CitationChip page={pdfStartPage} /> : null}
                {parsed.description ? (
                  <span>
                    {parsed.descriptionPrefix ?? ": "}
                    {parsed.description}
                  </span>
                ) : null}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
