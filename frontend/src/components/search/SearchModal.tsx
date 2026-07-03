import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSearch } from "./useSearch";
import { SearchInput } from "./SearchInput";
import { SearchResultList } from "./SearchResultList";
import type { SearchResult } from "./search.types";
import "./SearchModal.css";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30,
      delay: 0.02,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -10,
    transition: { duration: 0.15 },
  },
};

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const {
    query,
    setQuery,
    results,
    loading,
    error,
    selectedIndex,
    setSelectedIndex,
    moveSelection,
    selectedResult,
    reset,
    hasQuery,
    hasResults,
    isRecent,
  } = useSearch();

  const handleSelect = useCallback(
    (result: SearchResult) => {
      if (["jwt", "redis", "docker", "pdf"].includes(result.id)) {
        setQuery(result.title);
      } else {
        navigate(`/workspace/${result.id}`);
        onClose();
      }
    },
    [navigate, onClose, setQuery],
  );

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          handleClose();
          break;

        case "ArrowDown":
          e.preventDefault();
          moveSelection("down");
          break;

        case "ArrowUp":
          e.preventDefault();
          moveSelection("up");
          break;

        case "Enter":
          e.preventDefault();
          if (selectedResult) {
            handleSelect(selectedResult);
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, handleClose, moveSelection, selectedResult, handleSelect]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="search-modal-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="search-modal-backdrop"
            onClick={handleClose}
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="search-modal-container"
            role="dialog"
            aria-modal="true"
            aria-label="Search conversations"
          >
            <div className="search-modal-accent" />

            <SearchInput
              query={query}
              onQueryChange={setQuery}
              loading={loading}
            />

            {results.length > 0 && (
              <div className="search-modal-divider" />
            )}

            <SearchResultList
              results={results}
              loading={loading}
              error={error}
              query={query}
              hasQuery={hasQuery}
              isRecent={isRecent}
              selectedIndex={selectedIndex}
              onSelect={handleSelect}
              onHover={setSelectedIndex}
            />

            {hasResults && (
              <div className="search-modal-footer">
                <div className="search-footer-hints">
                  <span className="search-footer-hint">
                    <kbd className="search-kbd-sm">↑↓</kbd>
                    <span>Navigate</span>
                  </span>
                  <span className="search-footer-hint">
                    <kbd className="search-kbd-sm">↵</kbd>
                    <span>Open</span>
                  </span>
                  <span className="search-footer-hint">
                    <kbd className="search-kbd-sm">esc</kbd>
                    <span>Close</span>
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
