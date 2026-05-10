export const API_BASE_URL = '/api/v1';

export const API_ENDPOINTS = {
  TRANSCRIPT: `${API_BASE_URL}/video/transcript`,
  CHAT_ASK: `${API_BASE_URL}/chat/ask`,
} as const;

export const APP_NAME = 'EchoMind AI';
export const APP_TAGLINE = 'Turn any YouTube video into a focused, searchable AI conversation.';
export const APP_DESCRIPTION =
  'Paste a YouTube link, index the transcript, and ask precise questions about the content.';

export const SUGGESTED_PROMPTS = [
  { label: 'Summarize', text: 'Give me a concise summary of this video.' },
  { label: 'Key Takeaways', text: 'What are the 5 most important takeaways from this video?' },
  { label: 'Main Ideas', text: 'What are the main ideas discussed in this video?' },
  { label: 'Questions', text: 'What questions does this video answer?' },
  { label: 'Data Points', text: 'What data, statistics, or numbers are mentioned?' },
  { label: 'Action Items', text: 'What actionable advice or next steps does this video suggest?' },
] as const;

export const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
} as const;

export const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
} as const;

export const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

export const SIDEBAR_WIDTH = 280;
export const SIDEBAR_COLLAPSED_WIDTH = 0;

export const STORAGE_KEYS = {
  SESSIONS: 'echomind_sessions',
  ACTIVE_SESSION: 'echomind_active_session',
  SIDEBAR_OPEN: 'echomind_sidebar_open',
} as const;
