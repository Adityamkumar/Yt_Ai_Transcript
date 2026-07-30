import { useEffect, useCallback, useState, useRef } from 'react';
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

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for YouTube IFrame API messages to detect when video ends
  useEffect(() => {
    if (!state.isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com' && event.origin !== 'http://www.youtube.com') return;

      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          // playerState === 0 means the video has ended
          if (data.event === 'infoDelivery' && data.info && data.info.playerState === 0) {
            closePlayer();
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [state.isOpen, closePlayer]);

  const handleIframeLoad = useCallback(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // Tell the YouTube iframe to start broadcasting events
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'listening', id: 1 }),
        'https://www.youtube.com'
      );
    }
  }, []);

  const embedUrl = state.videoId
    ? `https://www.youtube.com/embed/${state.videoId}?start=${Math.floor(state.startSeconds)}&autoplay=1&rel=0&enablejsapi=1`
    : '';

  if (!state.isOpen) return null;

  return (
    <>
      {/* ─── Backdrop Overlay (Only visible when not minimized) ─── */}
      <AnimatePresence>
        {!state.isMinimized && (
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
            aria-label="YouTube video player backdrop"
          />
        )}
      </AnimatePresence>

      {/* ─── Main Player Container (Morphs between full and mini) ─── */}
      <AnimatePresence>
        <motion.div
          key="player-container"
          layout
          initial={state.isMinimized ? { opacity: 0, y: 80, scale: 0.9 } : { opacity: 0, scale: 0.92, y: 20 }}
          animate={state.isMinimized ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={state.isMinimized ? { opacity: 0, y: 80, scale: 0.9 } : { opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={
            state.isMinimized
              ? 'yt-mini-player'
              : `yt-player-container ${isFullscreen ? 'yt-player-fullscreen' : ''}`
          }
        >
          {/* Header - only visible when NOT minimized */}
          {!state.isMinimized && (
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
          )}

          {/* Persistent Iframe Container */}
          <div
            className={
              state.isMinimized ? 'yt-mini-player-iframe-container' : 'yt-player-iframe-wrapper'
            }
          >
            <iframe
              ref={iframeRef}
              onLoad={handleIframeLoad}
              src={embedUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              className={state.isMinimized ? 'yt-mini-player-iframe' : 'yt-player-iframe'}
            />
          </div>

          {/* Mini Player Info & Actions - only visible when minimized */}
          {state.isMinimized && (
            <>
              <div className="yt-mini-player-info">
                <div className="yt-mini-player-visualizer">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <span className="yt-mini-player-label">Listening…</span>
              </div>

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
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
