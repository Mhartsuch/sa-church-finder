import { apiRequest } from '@/lib/api-client';
import { ApiEnvelope } from '@/types/api';
import { IChurchPhoto } from '@/types/church';

export interface IChurchPhotoWithMeta extends IChurchPhoto {
  churchId: string;
  createdAt: string;
}

export const getChurchPhotos = async (churchId: string): Promise<IChurchPhotoWithMeta[]> => {
  const envelope = await apiRequest<ApiEnvelope<IChurchPhotoWithMeta[]>>(
    `/churches/${encodeURIComponent(churchId)}/photos`,
  );

  return envelope.data;
};

export const uploadChurchPhoto = async (
  churchId: string,
  file: File,
  altText?: string,
): Promise<IChurchPhotoWithMeta> => {
  const formData = new FormData();
  formData.append('photo', file);
  if (altText) {
    formData.append('altText', altText);
  }

  const envelope = await apiRequest<ApiEnvelope<IChurchPhotoWithMeta>>(
    `/churches/${encodeURIComponent(churchId)}/photos`,
    {
      method: 'POST',
      body: formData,
      skipJsonContentType: true,
    },
  );

  return envelope.data;
};

export const updateChurchPhotoAltText = async (
  photoId: string,
  altText: string | null,
): Promise<IChurchPhotoWithMeta> => {
  const envelope = await apiRequest<ApiEnvelope<IChurchPhotoWithMeta>>(
    `/churches/photos/${encodeURIComponent(photoId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ altText }),
    },
  );

  return envelope.data;
};

export interface ReorderPhotoItem {
  photoId: string;
  displayOrder: number;
}

export const reorderChurchPhotos = async (
  churchId: string,
  ordering: ReorderPhotoItem[],
): Promise<IChurchPhotoWithMeta[]> => {
  const envelope = await apiRequest<ApiEnvelope<IChurchPhotoWithMeta[]>>(
    `/churches/${encodeURIComponent(churchId)}/photos/reorder`,
    {
      method: 'PUT',
      body: JSON.stringify({ ordering }),
    },
  );

  return envelope.data;
};

export const deleteChurchPhoto = async (
  photoId: string,
): Promise<{ id: string; churchId: string }> => {
  const envelope = await apiRequest<ApiEnvelope<{ id: string; churchId: string }>>(
    `/churches/photos/${encodeURIComponent(photoId)}`,
    {
      method: 'DELETE',
    },
  );

  return envelope.data;
};
