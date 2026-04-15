import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addChurchToCollection,
  createCollection,
  createVisit,
  deleteCollection,
  deleteVisit,
  fetchCollection,
  fetchPassport,
  fetchUserCollections,
  fetchUserVisits,
  removeChurchFromCollection,
  updateCollection,
  updateVisit,
} from '@/api/passport';
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

const STALE_TIME = 60_000;

export const PASSPORT_QUERY_KEY = ['passport'] as const;
export const VISITS_QUERY_KEY = ['visits'] as const;
export const COLLECTIONS_QUERY_KEY = ['collections'] as const;
export const COLLECTION_QUERY_KEY = ['collection'] as const;

// --- Passport ---

export const usePassport = (userId: string | null) => {
  return useQuery<IPassport, Error>({
    queryKey: [...PASSPORT_QUERY_KEY, userId],
    queryFn: () => fetchPassport(userId!),
    staleTime: STALE_TIME,
    enabled: Boolean(userId),
  });
};

// --- Visits ---

export const useUserVisits = (userId: string | null, page = 1, pageSize = 20) => {
  return useQuery<IVisitsResponse, Error>({
    queryKey: [...VISITS_QUERY_KEY, userId, page, pageSize],
    queryFn: () => fetchUserVisits(userId!, page, pageSize),
    staleTime: STALE_TIME,
    enabled: Boolean(userId),
  });
};

export const useCreateVisit = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { visit: IChurchVisit; newAwards: IAward[] },
    Error,
    { churchId: string; input: ICreateVisitInput }
  >({
    mutationFn: ({ churchId, input }) => createVisit(churchId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VISITS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PASSPORT_QUERY_KEY });
    },
  });
};

export const useUpdateVisit = () => {
  const queryClient = useQueryClient();

  return useMutation<IChurchVisit, Error, { visitId: string; input: IUpdateVisitInput }>({
    mutationFn: ({ visitId, input }) => updateVisit(visitId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VISITS_QUERY_KEY });
    },
  });
};

export const useDeleteVisit = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteVisit,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VISITS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PASSPORT_QUERY_KEY });
    },
  });
};

// --- Collections ---

export const useUserCollections = (userId: string | null) => {
  return useQuery<IChurchCollection[], Error>({
    queryKey: [...COLLECTIONS_QUERY_KEY, userId],
    queryFn: () => fetchUserCollections(userId!),
    staleTime: STALE_TIME,
    enabled: Boolean(userId),
  });
};

export const useCollection = (collectionId: string | null) => {
  return useQuery<ICollectionWithChurches, Error>({
    queryKey: [...COLLECTION_QUERY_KEY, collectionId],
    queryFn: () => fetchCollection(collectionId!),
    staleTime: STALE_TIME,
    enabled: Boolean(collectionId),
  });
};

export const useCreateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation<IChurchCollection, Error, ICreateCollectionInput>({
    mutationFn: createCollection,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PASSPORT_QUERY_KEY });
    },
  });
};

export const useUpdateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IChurchCollection,
    Error,
    { collectionId: string; input: IUpdateCollectionInput }
  >({
    mutationFn: ({ collectionId, input }) => updateCollection(collectionId, input),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
      queryClient.setQueryData(
        [...COLLECTION_QUERY_KEY, updated.id],
        (current: ICollectionWithChurches | undefined) =>
          current ? { ...current, ...updated } : current,
      );
    },
  });
};

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteCollection,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PASSPORT_QUERY_KEY });
    },
  });
};

export const useAddChurchToCollection = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ICollectionChurch,
    Error,
    { collectionId: string; churchId: string; notes?: string }
  >({
    mutationFn: ({ collectionId, churchId, notes }) =>
      addChurchToCollection(collectionId, churchId, notes),
    onSuccess: (_data, { collectionId }) => {
      void queryClient.invalidateQueries({
        queryKey: [...COLLECTION_QUERY_KEY, collectionId],
      });
      void queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
    },
  });
};

export const useRemoveChurchFromCollection = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { collectionId: string; churchId: string }>({
    mutationFn: ({ collectionId, churchId }) => removeChurchFromCollection(collectionId, churchId),
    onSuccess: (_data, { collectionId }) => {
      void queryClient.invalidateQueries({
        queryKey: [...COLLECTION_QUERY_KEY, collectionId],
      });
      void queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
    },
  });
};
