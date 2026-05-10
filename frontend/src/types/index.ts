// ─── API Response ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

// ─── Video / Transcript ───────────────────────────────────────────────────────

export interface VideoData {
  _id: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  transcript: string;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptResponse extends ApiResponse<VideoData | string> {}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  videoId: string;
  videoUrl: string;
  videoTitle?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AskQuestionPayload {
  videoId: string;
  question: string;
}

export interface AskQuestionResponse extends ApiResponse<string> {}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type AppState = 'idle' | 'extracting' | 'ready' | 'error';

export interface AppStore {
  sessions: ChatSession[];
  activeSessionId: string | null;
  sidebarOpen: boolean;
}
