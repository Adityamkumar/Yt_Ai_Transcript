import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { ChatSession, ChatMessage } from '@/types';
import { generateId, deriveTitle } from '@/utils';
import { STORAGE_KEYS } from '@/constants';

interface StoreState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  sidebarOpen: boolean;
}

type Action =
  | { type: 'CREATE_SESSION'; payload: { videoId: string; videoUrl: string; videoTitle?: string } }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'SET_ACTIVE_SESSION'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: { sessionId: string; message: ChatMessage } }
  | { type: 'UPDATE_MESSAGE'; payload: { sessionId: string; messageId: string; updates: Partial<ChatMessage> } }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'HYDRATE'; payload: Partial<StoreState> };

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload };

    case 'CREATE_SESSION': {
      const newSession: ChatSession = {
        id: generateId(),
        title: 'New Chat',
        videoId: action.payload.videoId,
        videoUrl: action.payload.videoUrl,
        videoTitle: action.payload.videoTitle,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return {
        ...state,
        sessions: [newSession, ...state.sessions],
        activeSessionId: newSession.id,
      };
    }

    case 'DELETE_SESSION': {
      const sessions = state.sessions.filter((s) => s.id !== action.payload);
      const activeSessionId =
        state.activeSessionId === action.payload
          ? sessions[0]?.id ?? null
          : state.activeSessionId;
      return { ...state, sessions, activeSessionId };
    }

    case 'SET_ACTIVE_SESSION':
      return { ...state, activeSessionId: action.payload };

    case 'ADD_MESSAGE': {
      return {
        ...state,
        sessions: state.sessions.map((s) => {
          if (s.id !== action.payload.sessionId) return s;
          const messages = [...s.messages, action.payload.message];
          const title =
            s.messages.length === 0 && action.payload.message.role === 'user'
              ? deriveTitle(action.payload.message.content)
              : s.title;
          return { ...s, messages, title, updatedAt: new Date() };
        }),
      };
    }

    case 'UPDATE_MESSAGE': {
      return {
        ...state,
        sessions: state.sessions.map((s) => {
          if (s.id !== action.payload.sessionId) return s;
          const messages = s.messages.map((m) =>
            m.id === action.payload.messageId ? { ...m, ...action.payload.updates } : m
          );
          return { ...s, messages, updatedAt: new Date() };
        }),
      };
    }

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };

    default:
      return state;
  }
}

interface StoreContextValue {
  state: StoreState;
  activeSession: ChatSession | null;
  createSession: (videoId: string, videoUrl: string, videoTitle?: string) => string;
  deleteSession: (id: string) => void;
  setActiveSession: (id: string | null) => void;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function loadPersistedState(): Partial<StoreState> {
  try {
    const sessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const activeSessionId = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    const sidebarOpen = localStorage.getItem(STORAGE_KEYS.SIDEBAR_OPEN);
    return {
      sessions: sessions ? normalizeSessions(JSON.parse(sessions)) : [],
      activeSessionId: activeSessionId ?? null,
      sidebarOpen: sidebarOpen !== null ? JSON.parse(sidebarOpen) : true,
    };
  } catch {
    return {};
  }
}

function normalizeSessions(sessions: ChatSession[]): ChatSession[] {
  return sessions.map((session) => ({
    ...session,
    createdAt: new Date(session.createdAt),
    updatedAt: new Date(session.updatedAt),
    messages: session.messages.map((message) => {
      const legacyMessage = message as ChatMessage & { timestamp?: Date | string };
      return {
        ...message,
        createdAt: message.createdAt ?? new Date(legacyMessage.timestamp ?? Date.now()).toISOString(),
      };
    }),
  }));
}

const initialState: StoreState = {
  sessions: [],
  activeSessionId: null,
  sidebarOpen: true,
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const persisted = loadPersistedState();
    dispatch({ type: 'HYDRATE', payload: persisted });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(state.sessions));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, state.activeSessionId ?? '');
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_OPEN, JSON.stringify(state.sidebarOpen));
    } catch {}
  }, [state.sessions, state.activeSessionId, state.sidebarOpen]);

  const activeSession = state.sessions.find((s) => s.id === state.activeSessionId) ?? null;

  const createSession = useCallback((videoId: string, videoUrl: string, videoTitle?: string): string => {
    const id = generateId();
    dispatch({ type: 'CREATE_SESSION', payload: { videoId, videoUrl, videoTitle } });
    return id;
  }, []);

  const deleteSession = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SESSION', payload: id });
  }, []);

  const setActiveSession = useCallback((id: string | null) => {
    dispatch({ type: 'SET_ACTIVE_SESSION', payload: id });
  }, []);

  const addMessage = useCallback((sessionId: string, message: ChatMessage) => {
    dispatch({ type: 'ADD_MESSAGE', payload: { sessionId, message } });
  }, []);

  const updateMessage = useCallback((sessionId: string, messageId: string, updates: Partial<ChatMessage>) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { sessionId, messageId, updates } });
  }, []);

  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);
  const setSidebar = useCallback((open: boolean) => dispatch({ type: 'SET_SIDEBAR', payload: open }), []);

  return (
    <StoreContext.Provider value={{
      state, activeSession, createSession, deleteSession,
      setActiveSession, addMessage, updateMessage, toggleSidebar, setSidebar,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
