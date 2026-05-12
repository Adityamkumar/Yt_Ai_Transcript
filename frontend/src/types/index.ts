export interface ApiResponse<T = unknown> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoData {
  _id: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  transcript: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageRole = 'user' | 'assistant';

export interface IMessage {
  _id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface IConversation {
  _id: string;
  userId: string;
  videoId: string | VideoData;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage extends IMessage {
  isLoading?: boolean;
  error?: string;
}

export interface AskQuestionPayload {
  videoId: string;
  question: string;
  recentMessages?: { role: MessageRole; content: string }[];
  stream?: boolean;
}

export type AppState = 'idle' | 'extracting' | 'ready' | 'error';
