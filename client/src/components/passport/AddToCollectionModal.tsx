import { FormEvent, useState } from 'react';
import { BookOpen, Globe, Lock, Plus, X } from 'lucide-react';

import { useAuthSession } from '@/hooks/useAuth';
import {
  useAddChurchToCollection,
  useCreateCollection,
  useUserCollections,
} from '@/hooks/usePassport';
import { useToast } from '@/hooks/useToast';
import { ApiRequestError } from '@/lib/api-client';
import { IChurchCollection } from '@/types/passport';

interface AddToCollectionModalProps {
  churchId: string;
  churchName: string;
  onClose: () => void;
}

const NAME_MAX_LENGTH = 100;

const isAlreadyInCollectionError = (error: unknown): boolean => {
  return error instanceof ApiRequestError && error.status === 409;
};

export const AddToCollectionModal = ({
  churchId,
  churchName,
  onClose,
}: AddToCollectionModalProps) => {
  const { user } = useAuthSession();
  const { addToast } = useToast();
  const { data: collections = [], isLoading } = useUserCollections(user?.id ?? null);
  const addChurchMutation = useAddChurchToCollection();
  const createCollectionMutation = useCreateCollection();

  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const isCreatingAndAdding = createCollectionMutation.isPending || addChurchMutation.isPending;

  const handleAddToCollection = async (collection: IChurchCollection) => {
    try {
      await addChurchMutation.mutateAsync({ collectionId: collection.id, churchId });
      addToast({
        message: `Added ${churchName} to "${collection.name}"`,
        variant: 'success',
      });
      onClose();
    } catch (error) {
      if (isAlreadyInCollectionError(error)) {
        addToast({
          message: `${churchName} is already in "${collection.name}" — you're all set!`,
          variant: 'info',
        });
        onClose();
        return;
      }

      addToast({
        message:
          error instanceof Error
            ? error.message
            : 'Unable to add that church to the collection right now.',
        variant: 'error',
      });
    }
  };

  const handleCreateAndAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = newCollectionName.trim();
    if (!trimmedName) {
      return;
    }

    try {
      const created = await createCollectionMutation.mutateAsync({ name: trimmedName });
      await addChurchMutation.mutateAsync({ collectionId: created.id, churchId });
      addToast({
        message: `Created "${created.name}" and added ${churchName}`,
        variant: 'success',
      });
      onClose();
    } catch (error) {
      addToast({
        message:
          error instanceof Error
            ? error.message
            : 'Unable to create that collection right now.',
        variant: 'error',
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-modal-slide-up rounded-2xl bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Add to collection</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-5 text-sm text-muted-foreground">
          Save <span className="font-semibold text-foreground">{churchName}</span> to one of your
          collections.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF385C]" />
          </div>
        ) : collections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-muted-foreground">
              You don&apos;t have any collections yet — start your first one below.
            </p>
          </div>
        ) : (
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {collections.map((collection) => {
              const isAddPending =
                addChurchMutation.isPending &&
                addChurchMutation.variables?.collectionId === collection.id;

              return (
                <li key={collection.id}>
                  <button
                    type="button"
                    onClick={() => {
                      void handleAddToCollection(collection);
                    }}
                    disabled={addChurchMutation.isPending}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-300 bg-card px-4 py-3 text-left transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        <span className="truncate">{collection.name}</span>
                        {collection.isPublic ? (
                          <Globe className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                        ) : (
                          <Lock className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                        )}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {collection.churchCount}{' '}
                        {collection.churchCount === 1 ? 'church' : 'churches'}
                      </span>
                    </span>
                    <span className="flex-shrink-0 text-sm font-semibold text-[#FF385C]">
                      {isAddPending ? 'Adding...' : 'Add'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5 border-t border-gray-100 pt-4">
          {isCreateFormOpen || collections.length === 0 ? (
            <form onSubmit={handleCreateAndAdd} className="space-y-3">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  New collection name
                </span>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Sunday Morning Favorites"
                  maxLength={NAME_MAX_LENGTH}
                  required
                  className="mt-2 w-full rounded-2xl border border-gray-300 bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                />
              </label>
              <button
                type="submit"
                disabled={isCreatingAndAdding || !newCollectionName.trim()}
                className="w-full rounded-lg bg-[#FF385C] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b00838] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isCreatingAndAdding ? 'Creating...' : 'Create collection & add church'}
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreateFormOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline hover:no-underline"
            >
              <Plus className="h-4 w-4" />
              New collection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
