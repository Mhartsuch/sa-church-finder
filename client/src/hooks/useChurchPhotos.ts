import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  IChurchPhotoWithMeta,
  ReorderPhotoItem,
  deleteChurchPhoto,
  getChurchPhotos,
  reorderChurchPhotos,
  updateChurchPhotoAltText,
  uploadChurchPhoto,
} from '@/api/church-photos';

const STALE_TIME = 60000;

export const CHURCH_PHOTOS_QUERY_KEY = ['church-photos'] as const;

export const useChurchPhotos = (churchId: string) => {
  return useQuery<IChurchPhotoWithMeta[], Error>({
    queryKey: [...CHURCH_PHOTOS_QUERY_KEY, churchId],
    queryFn: () => getChurchPhotos(churchId),
    staleTime: STALE_TIME,
    enabled: Boolean(churchId),
  });
};

const invalidatePhotoQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  churchId: string,
): void => {
  queryClient.invalidateQueries({ queryKey: [...CHURCH_PHOTOS_QUERY_KEY, churchId] });
  // Also invalidate the church detail so the profile page picks up new photos
  queryClient.invalidateQueries({ queryKey: ['leaders-portal', 'church'] });
  queryClient.invalidateQueries({ queryKey: ['church'] });
};

export const useUploadChurchPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IChurchPhotoWithMeta,
    Error,
    { churchId: string; file: File; altText?: string }
  >({
    mutationFn: ({ churchId, file, altText }) => uploadChurchPhoto(churchId, file, altText),
    onSuccess: (_data, variables) => {
      invalidatePhotoQueries(queryClient, variables.churchId);
    },
  });
};

export const useUpdateChurchPhotoAltText = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IChurchPhotoWithMeta,
    Error,
    { photoId: string; altText: string | null; churchId: string }
  >({
    mutationFn: ({ photoId, altText }) => updateChurchPhotoAltText(photoId, altText),
    onSuccess: (_data, variables) => {
      invalidatePhotoQueries(queryClient, variables.churchId);
    },
  });
};

export const useReorderChurchPhotos = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IChurchPhotoWithMeta[],
    Error,
    { churchId: string; ordering: ReorderPhotoItem[] }
  >({
    mutationFn: ({ churchId, ordering }) => reorderChurchPhotos(churchId, ordering),
    onSuccess: (_data, variables) => {
      invalidatePhotoQueries(queryClient, variables.churchId);
    },
  });
};

export const useDeleteChurchPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; churchId: string },
    Error,
    { photoId: string; churchId: string }
  >({
    mutationFn: ({ photoId }) => deleteChurchPhoto(photoId),
    onSuccess: (_data, variables) => {
      invalidatePhotoQueries(queryClient, variables.churchId);
    },
  });
};
