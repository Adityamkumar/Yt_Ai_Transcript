import { useQuery } from '@tanstack/react-query';
import { messageService } from '@/services/message.service';

export function useMessages(conversationId: string | undefined) {
  const messagesQuery = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => (conversationId ? messageService.getMessages(conversationId) : Promise.resolve([])),
    enabled: !!conversationId,
  });

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    isError: messagesQuery.isError,
  };
}
