import type { ChatMessage, ConversationMessage } from '@/types';

const DEFAULT_RECENT_MESSAGE_LIMIT = 10;

export function getRecentMessages(
  messages: ChatMessage[],
  limit = DEFAULT_RECENT_MESSAGE_LIMIT
): ConversationMessage[] {
  return messages
    .filter((message) => !message.isLoading && message.content.trim().length > 0)
    .slice(-limit)
    .map((message) => ({
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
    }));
}

export function formatConversationHistory(messages: ConversationMessage[]): string {
  if (messages.length === 0) return 'No prior conversation.';

  return messages
    .map((message) => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`)
    .join('\n\n');
}

export function buildContextPrompt(
  transcript: string,
  recentMessages: ConversationMessage[],
  currentUserMessage: string
): string {
  return [
    'You are EchoMind AI.',
    '',
    'Use the transcript and recent conversation context to answer naturally and conversationally.',
    'If the user asks follow-up questions, use previous conversation context.',
    '',
    'Transcript:',
    transcript,
    '',
    'Recent Conversation:',
    formatConversationHistory(recentMessages),
    '',
    'Current User Message:',
    currentUserMessage,
  ].join('\n');
}
