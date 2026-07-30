import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Headphones, MonitorPlay } from 'lucide-react';
import { useYouTubePlayer } from '@/store/YouTubePlayerContext';

export function YouTubePlayerModal() {
  const { state, closePlayer, minimizePlayer, expandPlayer } = useYouTubePlayer();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Escape key handler
  useEffect(() => {
    if (!state.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (state.isMinimized) {
          closePlayer();
        } else if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          closePlayer();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.isOpen, state.isMinimized, closePlayer, isFullscreen]);

  // Lock body scroll only when modal is fully open (not minimized)
  useEffect(() => {
    if (state.isOpen && !state.isMinimized) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [state.isOpen, state.isMinimized]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closePlayer();
      }
    },
    [closePlayer]
  );

  // Reset fullscreen when modal closes
  useEffect(() => {
    if (!state.isOpen) {
      setIsFullscreen(false);
    }
  }, [state.isOpen]);

  const embedUrl = state.videoId
    ? `https://www.youtube.com/embed/${state.videoId}?start=${Math.floor(state.startSeconds)}&autoplay=1&rel=0`
    : '';

  if (!state.isOpen) return null;

  // ─── Minimized: floating mini-player ───
  if (state.isMinimized) {
    return (
      <AnimatePresence>
        <motion.div
          key="mini-player"
          initial={{ opacity: 0, y: 80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.9 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="yt-mini-player"
        >
          {/* Hidden iframe keeps audio playing */}
          <div className="yt-mini-player-iframe-container">
            <iframe
              src={embedUrl}
              title="YouTube video player (background)"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              className="yt-mini-player-iframe"
            />
          </div>

          {/* Visualizer / listening indicator */}
          <div className="yt-mini-player-info">
            <div className="yt-mini-player-visualizer">
              <span /><span /><span /><span />
            </div>
            <span className="yt-mini-player-label">Listening…</span>
          </div>

          {/* Actions */}
          <div className="yt-mini-player-actions">
            <button
              onClick={expandPlayer}
              className="yt-player-btn"
              title="Expand player"
              aria-label="Expand player"
            >
              <MonitorPlay size={16} />
            </button>
            <button
              onClick={closePlayer}
              className="yt-player-btn yt-player-btn-close"
              title="Stop & close"
              aria-label="Stop and close player"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ─── Full modal ───
  return (
    <AnimatePresence>
      <motion.div
        key="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="yt-player-overlay"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-label="YouTube video player"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`yt-player-container ${isFullscreen ? 'yt-player-fullscreen' : ''}`}
        >
          {/* Header bar */}
          <div className="yt-player-header">
            <div className="yt-player-header-label">
              <div className="yt-player-header-dot" />
              <span>YouTube Player</span>
            </div>
            <div className="yt-player-header-actions">
              <button
                onClick={minimizePlayer}
                className="yt-player-btn yt-player-btn-listen"
                title="Listen in background"
                aria-label="Minimize to background player"
              >
                <Headphones size={15} />
              </button>
              <button
                onClick={toggleFullscreen}
                className="yt-player-btn"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                onClick={closePlayer}
                className="yt-player-btn yt-player-btn-close"
                title="Close"
                aria-label="Close video player"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Iframe wrapper */}
          <div className="yt-player-iframe-wrapper">
            <iframe
              src={embedUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              className="yt-player-iframe"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
