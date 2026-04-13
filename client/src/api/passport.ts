import { apiRequest } from '@/lib/api-client';
import {
  IAward,
  IChurchCollection,
  IChurchVisit,
  ICollectionChurch,
  ICollectionWithChurches,
  ICreateCollectionInput,
  ICreateVisitInput,
  IPassport,
  IUpdateCollectionInput,
  IUpdateVisitInput,
  IVisitsResponse,
} from '@/types/passport';

// --- Visits ---

type VisitEnvelope = {
  data: IChurchVisit;
  meta?: { newAwards: IAward[] };
  message?: string;
};

export const createVisit = async (
  churchId: string,
  input: ICreateVisitInput,
): Promise<{ visit: IChurchVisit; newAwards: IAward[] }> => {
  const envelope = await apiRequest<VisitEnvelope>(
    `/churches/${encodeURIComponent(churchId)}/visits`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
  return {
    visit: envelope.data,
    newAwards: envelope.meta?.newAwards ?? [],
  };
};

export const updateVisit = async (
  visitId: string,
  input: IUpdateVisitInput,
): Promise<IChurchVisit> => {
  const envelope = await apiRequest<{ data: IChurchVisit }>(
    `/visits/${encodeURIComponent(visitId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  );
  return envelope.data;
};

export const deleteVisit = async (visitId: string): Promise<void> => {
  await apiRequest(`/visits/${encodeURIComponent(visitId)}`, {
    method: 'DELETE',
  });
};

export const fetchUserVisits = async (
  userId: string,
  page = 1,
  pageSize = 20,
): Promise<IVisitsResponse> => {
  return apiRequest<IVisitsResponse>(
    `/users/${encodeURIComponent(userId)}/visits?page=${page}&pageSize=${pageSize}`,
  );
};

// --- Passport ---

export const fetchPassport = async (userId: string): Promise<IPassport> => {
  const envelope = await apiRequest<{ data: IPassport }>(
    `/users/${encodeURIComponent(userId)}/passport`,
  );
  return envelope.data;
};

// --- Collections ---

export const createCollection = async (
  input: ICreateCollectionInput,
): Promise<IChurchCollection> => {
  const envelope = await apiRequest<{ data: IChurchCollection }>('/collections', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return envelope.data;
};

export const fetchUserCollections = async (userId: string): Promise<IChurchCollection[]> => {
  const envelope = await apiRequest<{ data: IChurchCollection[] }>(
    `/users/${encodeURIComponent(userId)}/collections`,
  );
  return envelope.data;
};

export const fetchCollection = async (collectionId: string): Promise<ICollectionWithChurches> => {
  const envelope = await apiRequest<{ data: ICollectionWithChurches }>(
    `/collections/${encodeURIComponent(collectionId)}`,
  );
  return envelope.data;
};

export const updateCollection = async (
  collectionId: string,
  input: IUpdateCollectionInput,
): Promise<IChurchCollection> => {
  const envelope = await apiRequest<{ data: IChurchCollection }>(
    `/collections/${encodeURIComponent(collectionId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  );
  return envelope.data;
};

export const deleteCollection = async (collectionId: string): Promise<void> => {
  await apiRequest(`/collections/${encodeURIComponent(collectionId)}`, {
    method: 'DELETE',
  });
};

export const addChurchToCollection = async (
  collectionId: string,
  churchId: string,
  notes?: string,
): Promise<ICollectionChurch> => {
  const envelope = await apiRequest<{ data: ICollectionChurch }>(
    `/collections/${encodeURIComponent(collectionId)}/churches/${encodeURIComponent(churchId)}`,
    {
      method: 'POST',
      body: JSON.stringify({ notes }),
    },
  );
  return envelope.data;
};

export const removeChurchFromCollection = async (
  collectionId: string,
  churchId: string,
): Promise<void> => {
  await apiRequest(
    `/collections/${encodeURIComponent(collectionId)}/churches/${encodeURIComponent(churchId)}`,
    {
      method: 'DELETE',
    },
  );
};
