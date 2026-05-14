import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookmarkService } from '@/services/bookmark.service';
import { IBookmark } from '@/types';
import toast from 'react-hot-toast';

export function useBookmarks() {
  const queryClient = useQueryClient();

  const { data: bookmarks = [], isLoading, error } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: bookmarkService.getBookmarks,
  });

  const createBookmarkMutation = useMutation({
    mutationFn: bookmarkService.createBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success('Added to bookmarks', {
        style: {
          background: '#1A1A1A',
          color: '#F5F7FF',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add bookmark');
    },
  });

  const deleteBookmarkMutation = useMutation({
    mutationFn: bookmarkService.deleteBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success('Removed from bookmarks');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete bookmark');
    },
  });

  return {
    bookmarks,
    isLoading,
    error,
    createBookmark: createBookmarkMutation.mutate,
    isCreating: createBookmarkMutation.isPending,
    deleteBookmark: deleteBookmarkMutation.mutate,
    isDeleting: deleteBookmarkMutation.isPending,
  };
}
