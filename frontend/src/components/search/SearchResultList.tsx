import { SearchX } from "lucide-react";
import type { SearchResult } from "./search.types";
import { SearchResultItem } from "./SearchResultItem";
import {
  SEARCH_EMPTY_TITLE,
  SEARCH_EMPTY_SUBTITLE,
  SEARCH_ERROR_MESSAGE,
  SEARCH_MIN_QUERY_LENGTH,
} from "./search.constants";

interface SearchResultListProps {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  query: string;
  hasQuery: boolean;
  isRecent: boolean;
  selectedIndex: number;
  onSelect: (result: SearchResult) => void;
  onHover: (index: number) => void;
}

function SearchSkeleton() {
  return (
    <div className="search-skeleton-container">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="search-skeleton-row">
          <div className="search-skeleton-icon shimmer-loader" />
          <div className="search-skeleton-content">
            <div className="search-skeleton-title shimmer-loader" />
            <div className="search-skeleton-meta shimmer-loader" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchEmpty() {
  return (
    <div className="search-empty-state">
      <SearchX size={28} className="text-[var(--text-muted)]" />
      <p className="search-empty-title">{SEARCH_EMPTY_TITLE}</p>
      <p className="search-empty-subtitle">{SEARCH_EMPTY_SUBTITLE}</p>
    </div>
  );
}

function SearchError({ message }: { message: string }) {
  return (
    <div className="search-error-state">
      <p className="search-error-message">{message}</p>
      <p className="search-error-hint">{SEARCH_ERROR_MESSAGE}</p>
    </div>
  );
}

function SearchHint() {
  return (
    <div className="search-hint-state">
      <p className="search-hint-text">
        Type at least {SEARCH_MIN_QUERY_LENGTH} characters to search
      </p>
    </div>
  );
}

export function SearchResultList({
  results,
  loading,
  error,
  query,
  hasQuery,
  isRecent,
  selectedIndex,
  onSelect,
  onHover,
}: SearchResultListProps) {
  if (!hasQuery && query.length > 0) {
    return <SearchHint />;
  }

  if (loading && results.length === 0) {
    return <SearchSkeleton />;
  }

  if (error) {
    return <SearchError message={error} />;
  }

  if (!isRecent && !loading && results.length === 0) {
    return <SearchEmpty />;
  }

  if (!hasQuery && !isRecent) {
    return null;
  }

  return (
    <div className="search-results-list-container">
      {isRecent && results.length > 0 && (
        <div className="search-section-header">
          Recent Conversations
        </div>
      )}
      <div className="search-results-list" role="listbox" aria-label="Search results">
        {results.map((result, index) => (
          <SearchResultItem
            key={result.id}
            result={result}
            isSelected={index === selectedIndex}
            query={query}
            onClick={() => onSelect(result)}
            onMouseEnter={() => onHover(index)}
          />
        ))}
      </div>
    </div>
  );
}
