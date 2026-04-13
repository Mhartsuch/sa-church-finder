import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createForumPost,
  createForumReply,
  deleteForumPost,
  deleteForumReply,
  fetchForumPost,
  fetchForumPosts,
} from '@/api/forum';
import {
  CreateForumPostInput,
  IForumPost,
  IForumPostDetailResponse,
  IForumPostListParams,
  IForumPostListResponse,
} from '@/types/forum';

const STALE_TIME = 60000;

export const FORUM_POSTS_QUERY_KEY = ['forum-posts'] as const;
export const FORUM_POST_QUERY_KEY = ['forum-post'] as const;

const invalidateForumQueries = (queryClient: ReturnType<typeof useQueryClient>): void => {
  void queryClient.invalidateQueries({ queryKey: FORUM_POSTS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: FORUM_POST_QUERY_KEY });
};

export const useForumPosts = (params: IForumPostListParams) => {
  return useQuery<IForumPostListResponse, Error>({
    queryKey: [...FORUM_POSTS_QUERY_KEY, params],
    queryFn: () => fetchForumPosts(params),
    staleTime: STALE_TIME,
    placeholderData: (previous) => previous,
  });
};

export const useForumPost = (postId: string | null) => {
  return useQuery<IForumPostDetailResponse, Error>({
    queryKey: [...FORUM_POST_QUERY_KEY, postId],
    queryFn: () => fetchForumPost(postId!),
    staleTime: STALE_TIME,
    enabled: Boolean(postId),
  });
};

export const useCreateForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation<IForumPost, Error, CreateForumPostInput>({
    mutationFn: createForumPost,
    onSuccess: () => {
      invalidateForumQueries(queryClient);
    },
  });
};

export const useCreateForumReply = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { postId: string; body: string }>({
    mutationFn: ({ postId, body }) => createForumReply(postId, body),
    onSuccess: () => {
      invalidateForumQueries(queryClient);
    },
  });
};

export const useDeleteForumPost = () => {
  const queryClient = useQueryClient();

  return useMutation<{ id: string; deleted: boolean }, Error, string>({
    mutationFn: deleteForumPost,
    onSuccess: () => {
      invalidateForumQueries(queryClient);
    },
  });
};

export const useDeleteForumReply = () => {
  const queryClient = useQueryClient();

  return useMutation<{ id: string; deleted: boolean }, Error, string>({
    mutationFn: deleteForumReply,
    onSuccess: () => {
      invalidateForumQueries(queryClient);
    },
  });
};
