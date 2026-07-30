import { createContext, useContext, useState, useCallback } from 'react';

interface YouTubePlayerState {
  isOpen: boolean;
  isMinimized: boolean;
  videoId: string;
  startSeconds: number;
}

interface YouTubePlayerContextType {
  state: YouTubePlayerState;
  openPlayer: (videoId: string, startSeconds: number) => void;
  closePlayer: () => void;
  minimizePlayer: () => void;
  expandPlayer: () => void;
}

const YouTubePlayerContext = createContext<YouTubePlayerContextType | null>(null);

export function YouTubePlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<YouTubePlayerState>({
    isOpen: false,
    isMinimized: false,
    videoId: '',
    startSeconds: 0,
  });

  const openPlayer = useCallback((videoId: string, startSeconds: number) => {
    setState({ isOpen: true, isMinimized: false, videoId, startSeconds });
  }, []);

  const closePlayer = useCallback(() => {
    setState({ isOpen: false, isMinimized: false, videoId: '', startSeconds: 0 });
  }, []);

  const minimizePlayer = useCallback(() => {
    setState((prev) => ({ ...prev, isMinimized: true }));
  }, []);

  const expandPlayer = useCallback(() => {
    setState((prev) => ({ ...prev, isMinimized: false }));
  }, []);

  return (
    <YouTubePlayerContext.Provider value={{ state, openPlayer, closePlayer, minimizePlayer, expandPlayer }}>
      {children}
    </YouTubePlayerContext.Provider>
  );
}

export function useYouTubePlayer() {
  const context = useContext(YouTubePlayerContext);
  if (!context) {
    throw new Error('useYouTubePlayer must be used within a YouTubePlayerProvider');
  }
  return context;
}
