import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '@/services/conversation.service';

export function useConversations() {
  const queryClient = useQueryClient();

  const conversationsQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: conversationService.getConversations,
  });

  const createConversationMutation = useMutation({
    mutationFn: ({ videoId, title }: { videoId: string; title: string }) =>
      conversationService.createConversation(videoId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: conversationService.deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    conversations: conversationsQuery.data ?? [],
    isLoading: conversationsQuery.isLoading,
    isError: conversationsQuery.isError,
    createConversation: createConversationMutation.mutateAsync,
    isCreating: createConversationMutation.isPending,
    deleteConversation: deleteConversationMutation.mutateAsync,
    isDeleting: deleteConversationMutation.isPending,
  };
}
