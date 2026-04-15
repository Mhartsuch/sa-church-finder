import { apiRequest } from '@/lib/api-client';
import { ApiEnvelope } from '@/types/api';
import {
  CreateForumPostInput,
  IForumPost,
  IForumPostDetail,
  IForumPostDetailResponse,
  IForumPostListParams,
  IForumPostListResponse,
} from '@/types/forum';

const buildForumQueryString = (params: IForumPostListParams): string => {
  const qs = new URLSearchParams();

  if (params.category) qs.append('category', params.category);
  if (params.sort) qs.append('sort', params.sort);
  if (params.page !== undefined && params.page > 1) qs.append('page', params.page.toString());
  if (params.pageSize !== undefined) qs.append('pageSize', params.pageSize.toString());

  const queryString = qs.toString();
  return queryString ? `?${queryString}` : '';
};

export const fetchForumPosts = async (
  params: IForumPostListParams = {},
): Promise<IForumPostListResponse> => {
  return apiRequest<IForumPostListResponse>(`/forum/posts${buildForumQueryString(params)}`);
};

export const fetchForumPost = async (id: string): Promise<IForumPostDetailResponse> => {
  return apiRequest<IForumPostDetailResponse>(`/forum/posts/${encodeURIComponent(id)}`);
};

export const createForumPost = async (input: CreateForumPostInput): Promise<IForumPost> => {
  const envelope = await apiRequest<ApiEnvelope<IForumPost>>('/forum/posts', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return envelope.data;
};

export const updateForumPost = async (
  postId: string,
  input: Partial<CreateForumPostInput>,
): Promise<IForumPost> => {
  const envelope = await apiRequest<ApiEnvelope<IForumPost>>(
    `/forum/posts/${encodeURIComponent(postId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  );

  return envelope.data;
};

export const deleteForumPost = async (postId: string): Promise<{ id: string; deleted: boolean }> => {
  const envelope = await apiRequest<ApiEnvelope<{ id: string; deleted: boolean }>>(
    `/forum/posts/${encodeURIComponent(postId)}`,
    {
      method: 'DELETE',
    },
  );

  return envelope.data;
};

export const createForumReply = async (
  postId: string,
  body: string,
): Promise<IForumPostDetail> => {
  const envelope = await apiRequest<ApiEnvelope<IForumPostDetail>>(
    `/forum/posts/${encodeURIComponent(postId)}/replies`,
    {
      method: 'POST',
      body: JSON.stringify({ body }),
    },
  );

  return envelope.data;
};

export const deleteForumReply = async (
  replyId: string,
): Promise<{ id: string; deleted: boolean }> => {
  const envelope = await apiRequest<ApiEnvelope<{ id: string; deleted: boolean }>>(
    `/forum/replies/${encodeURIComponent(replyId)}`,
    {
      method: 'DELETE',
    },
  );

  return envelope.data;
};
