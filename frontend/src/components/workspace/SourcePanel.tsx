import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useSourcePanelStore } from '@/stores/sourcePanel.store';
import { PdfDocument } from '@/types';


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface SourcePanelProps {
  pdf: PdfDocument;
}

export function SourcePanel({ pdf }: SourcePanelProps) {
  const { selectedPage, isSourcePanelOpen, closeSourcePanel, setSelectedPage } = useSourcePanelStore();
  const [numPages, setNumPages] = useState<number | null>(pdf.pageCount || null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [panelWidth, setPanelWidth] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [direction, setDirection] = useState(1); 
  const prevPageRef = useRef(selectedPage || 1);

  const currentPage = selectedPage || 1;

  
  useEffect(() => {
    if (selectedPage) {
      if (selectedPage > prevPageRef.current) {
        setDirection(1);
      } else if (selectedPage < prevPageRef.current) {
        setDirection(-1);
      }
      prevPageRef.current = selectedPage;
    }
  }, [selectedPage]);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        const maxWidth = Math.min(650, Math.round(window.innerWidth * 0.52));
        setPanelWidth((current) => current ? Math.min(current, maxWidth) : current);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isSourcePanelOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSourcePanel();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSourcePanelOpen, closeSourcePanel]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePrevPage = () => {
    if (selectedPage && selectedPage > 1) {
      setSelectedPage(selectedPage - 1);
    }
  };

  const handleNextPage = () => {
    if (selectedPage && numPages && selectedPage < numPages) {
      setSelectedPage(selectedPage + 1);
    }
  };

  const panelTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: isResizing ? 0 : 0.3,
  } as const;

  const resizePanel = (clientX: number) => {
    const minWidth = 380;
    const maxWidth = Math.min(650, Math.round(window.innerWidth * 0.52));
    const nextWidth = window.innerWidth - clientX;
    setPanelWidth(Math.min(maxWidth, Math.max(minWidth, nextWidth)));
  };

  
  const pageVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
    }),
  };

  const pageTransition = {
    x: { type: 'spring', stiffness: 300, damping: 30 },
    opacity: { duration: 0.2 },
  } as const;

  return (
    <AnimatePresence>
      {isSourcePanelOpen && (
        <>
          {/* Backdrop is only needed while the docked panel becomes a mobile drawer. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={closeSourcePanel}
            className="fixed inset-0 z-40 bg-black lg:hidden"
          />

          {/* Docked workspace panel */}
          <motion.div
            custom={isDesktop}
            initial={isDesktop ? { width: 0, opacity: 0 } : { y: '100%' }}
            animate={isDesktop ? { width: panelWidth ? `${panelWidth}px` : '38%', opacity: 1 } : { y: 0 }}
            exit={isDesktop ? { width: 0, opacity: 0 } : { y: '100%' }}
            transition={panelTransition}
            style={{
              minWidth: isDesktop ? '380px' : undefined,
              maxWidth: isDesktop ? '650px' : undefined,
            }}
            className="relative flex shrink-0 flex-col overflow-hidden bg-[var(--surface-2)] shadow-2xl backdrop-blur-md fixed bottom-0 left-0 z-50 h-[80vh] w-full rounded-t-3xl border-t border-[var(--border-soft)] lg:relative lg:bottom-auto lg:left-auto lg:top-0 lg:z-10 lg:h-full lg:rounded-t-none lg:border-t-0"
          >
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize document panel"
              onPointerDown={(event) => {
                if (!isDesktop) return;
                event.currentTarget.setPointerCapture(event.pointerId);
                setIsResizing(true);
                resizePanel(event.clientX);
              }}
              onPointerMove={(event) => {
                if (isResizing) resizePanel(event.clientX);
              }}
              onPointerUp={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
                setIsResizing(false);
              }}
              onPointerCancel={() => setIsResizing(false)}
              className="group/resize absolute inset-y-0 left-0 z-20 hidden w-3 cursor-col-resize touch-none lg:block"
            />
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-5 py-4 shrink-0">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {pdf.title}
                </h3>
                <p className="truncate text-xs text-[var(--text-muted)]">
                  Source Document Context
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <button
                  onClick={closeSourcePanel}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-soft)] text-[var(--text-muted)] transition-all hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                  aria-label="Close document preview"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Page Controls */}
            <div className="flex items-center justify-between bg-[var(--surface-3)] px-5 py-2.5 border-b border-[var(--border-soft)] shrink-0">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface-2)] text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:hover:bg-[var(--surface-2)]"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                Page {currentPage} of {numPages || '--'}
              </span>

              <button
                onClick={handleNextPage}
                disabled={!numPages || currentPage >= numPages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface-2)] text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:hover:bg-[var(--surface-2)]"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* PDF Viewport */}
            <div 
              className="pdf-viewport-container flex flex-1 items-start justify-center overflow-y-auto bg-[#0a0d14] p-5"
            >
              <Document
                file={pdf.fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex flex-col items-center justify-center py-20 gap-3 w-full">
                    <Loader2 className="animate-spin text-[var(--accent)]" size={28} />
                    <span className="text-xs text-[var(--text-muted)] font-medium">Loading document page...</span>
                  </div>
                }
                error={
                  <div className="flex flex-col items-center justify-center py-20 text-center px-4 w-full">
                    <span className="text-2xl mb-2">⚠️</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Failed to load PDF</span>
                    <span className="text-xs text-[var(--text-muted)] mt-1">Please try opening the original document.</span>
                  </div>
                }
              >
                <div className="relative overflow-hidden w-full flex justify-center">
                  <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                      key={currentPage}
                      custom={direction}
                      variants={pageVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={pageTransition}
                      className="w-full flex justify-center"
                    >
                      <Page
                        pageNumber={currentPage}
                        width={600}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="shadow-xl rounded-lg overflow-hidden border border-[var(--border-soft)] bg-white"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </Document>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
