import { useEffect, useRef } from "react";
import { FileText, MessageSquare, CornerDownLeft } from "lucide-react";
import { formatRelativeTime } from "@/utils";
import type { SearchResult } from "./search.types";

interface SearchResultItemProps {
  result: SearchResult;
  isSelected: boolean;
  query: string;
  onClick: () => void;
  onMouseEnter: () => void;
}

function HighlightedTitle({ title, query }: { title: string; query: string }) {
  if (!query || query.length < 2) {
    return <span>{title}</span>;
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = title.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="search-highlight">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

export function SearchResultItem({
  result,
  isSelected,
  query,
  onClick,
  onMouseEnter,
}: SearchResultItemProps) {
  const itemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isSelected && itemRef.current) {
      itemRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isSelected]);

  const isPdf = result.type === "conversation"
    ? result.preview === "PDF workspace"
    : result.type === "pdf";

  return (
    <button
      ref={itemRef}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      data-selected={isSelected}
      className="search-result-item"
      role="option"
      aria-selected={isSelected}
    >
      <span className="search-result-icon">
        {isPdf ? <FileText size={14} /> : <MessageSquare size={14} />}
      </span>

      <span className="search-result-content">
        <span className="search-result-title">
          <HighlightedTitle title={result.title.replace(/\*\*/g, "")} query={query} />
        </span>
        <span className="search-result-meta">
          {result.preview}
          {result.updatedAt && (
            <>
              <span className="search-result-dot">·</span>
              {formatRelativeTime(new Date(result.updatedAt))}
            </>
          )}
        </span>
      </span>

      {isSelected && (
        <span className="search-result-enter">
          <CornerDownLeft size={12} />
        </span>
      )}
    </button>
  );
}
