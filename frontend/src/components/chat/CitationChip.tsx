import React from 'react';
import { useSourcePanelStore } from '@/stores/sourcePanel.store';

interface CitationChipProps {
  page: number;
}

export function CitationChip({ page }: CitationChipProps) {
  const openSourcePanel = useSourcePanelStore((state) => state.openSourcePanel);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openSourcePanel(page);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openSourcePanel(page);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full border border-[var(--border-soft)] bg-[#111622]/65 hover:bg-[#111622]/90 hover:border-[var(--border-medium)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] text-[var(--accent)] hover:text-[var(--accent-strong)] font-sans text-[11px] font-semibold tracking-wide select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none"
      aria-label={`PDF Source Page ${page}`}
    >
      <span className="text-[12px] shrink-0" aria-hidden="true">
        📄
      </span>
      <span>Page {page}</span>
    </button>
  );
}
