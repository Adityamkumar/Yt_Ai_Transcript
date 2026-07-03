import { useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { SEARCH_PLACEHOLDER } from "./search.constants";

interface SearchInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  loading: boolean;
}

export function SearchInput({ query, onQueryChange, loading }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="search-input-container">
      <div className="search-input-icon">
        {loading ? (
          <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
        ) : (
          <Search size={18} className="text-[var(--text-muted)]" />
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={SEARCH_PLACEHOLDER}
        className="search-input-field"
        aria-label="Search conversations"
        autoComplete="off"
        spellCheck={false}
      />

      <div className="search-input-actions">
        {query.length > 0 ? (
          <button
            onClick={() => onQueryChange("")}
            className="search-input-clear"
            aria-label="Clear search"
            type="button"
          >
            <X size={14} />
          </button>
        ) : (
          <kbd className="search-kbd">ESC</kbd>
        )}
      </div>
    </div>
  );
}
