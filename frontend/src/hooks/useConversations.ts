import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationService } from "@/services/conversation.service";
import type { IConversation } from "@/types";

export function useConversations(activeConversationId?: string) {
  const queryClient = useQueryClient();

  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: conversationService.getConversations,

    refetchInterval: (query) => {
      if (!activeConversationId) {
        return false;
      }

      const conversations = query.state.data ?? [];

      const activeConversation = conversations.find(
        (conversation) => conversation._id === activeConversationId,
      );

      if (!activeConversation || activeConversation.type !== "video") {
        return false;
      }

      const video = activeConversation.videoId;
      // Keep checking until the populated video object is available.
      if (!video || typeof video === "string") {
        return 3000;
      }

      if (video.status === "failed" || video.ragStatus === "failed") {
        return false;
      }

      if (video.status === "ready" && video.ragStatus === "ready") {
        return false;
      }

      return 3000;
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: ({ videoId, title }: { videoId: string; title: string }) =>
      conversationService.createConversation(videoId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: conversationService.deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const updateConversationPinMutation = useMutation({
    mutationFn: ({ conversationId, isPinned }: { conversationId: string; isPinned: boolean }) =>
      conversationService.updateConversationPin(conversationId, isPinned),
    onMutate: async ({ conversationId, isPinned }) => {
      await queryClient.cancelQueries({ queryKey: ["conversations"] });

      const previousConversations = queryClient.getQueryData<IConversation[]>(["conversations"]);

      queryClient.setQueryData<IConversation[]>(["conversations"], (conversations) =>
        conversations?.map((conversation) =>
          conversation._id === conversationId
            ? {
                ...conversation,
                isPinned,
              }
            : conversation,
        ),
      );

      return { previousConversations };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["conversations"], context?.previousConversations);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
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
    updateConversationPin: updateConversationPinMutation.mutateAsync,
    isUpdatingPin: updateConversationPinMutation.isPending,
  };
}
