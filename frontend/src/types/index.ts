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

export interface ITranscriptChunk {
  text: string;
  start: number;
  end: number;
  duration: number;
}

export interface VideoData {
  _id: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  transcript: ITranscriptChunk[];
  title: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageRole = 'user' | 'assistant';
export type MessageType = 'chat' | 'notes' | 'summary';

export interface IMessage {
  _id: string;
  conversationId: string;
  role: MessageRole;
  type: MessageType;
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
  isBookmarked?: boolean;
}

export interface IBookmark {
  _id: string;
  userId: string;
  conversationId: string | { _id: string; title: string };
  messageId: string;
  type: MessageType;
  title: string;
  content: string;
  createdAt: string;
}

export interface AskQuestionPayload {
  videoId: string;
  question: string;
  recentMessages?: { role: MessageRole; content: string }[];
  stream?: boolean;
  type?: MessageType;
}

export type AppState = 'idle' | 'extracting' | 'ready' | 'error';

export interface NotesResponse {
  title: string;
  subtitle: string;
  overview: string[];
  mainConcepts: {
    heading: string;
    points: string[];
  }[];
  keyInsights: string[];
  actionableTakeaways: string[];
  examples: string[];
}

