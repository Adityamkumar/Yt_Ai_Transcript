export interface ApiResponse<T = unknown> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface VideoData {
  _id: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  transcript: string;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptResponse extends ApiResponse<VideoData | string> {}

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  isLoading?: boolean;
  error?: string;
}

export interface ConversationMessage {
  role: MessageRole;
  content: string;
  createdAt: string;
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
  recentMessages?: ConversationMessage[];
  stream?: boolean;
}

export interface AskQuestionResponse extends ApiResponse<string> {}

export type AppState = 'idle' | 'extracting' | 'ready' | 'error';

export interface AppStore {
  sessions: ChatSession[];
  activeSessionId: string | null;
  sidebarOpen: boolean;
}
