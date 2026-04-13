import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Church,
  Edit3,
  Eye,
  EyeOff,
  Globe,
  Lock,
  MapPin,
  Star,
  Trash2,
  X,
} from 'lucide-react';

import { useAuthSession } from '@/hooks/useAuth';
import {
  useCollection,
  useUpdateCollection,
  useDeleteCollection,
  useRemoveChurchFromCollection,
} from '@/hooks/usePassport';
import { useToast } from '@/hooks/useToast';
import { ConfirmDialog } from '@/components/layout/ConfirmDialog';
import { ICollectionChurch } from '@/types/passport';

/* ------------------------------------------------------------------ */
/*  Collection Page                                                    */
/* ------------------------------------------------------------------ */

export default function CollectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const { addToast } = useToast();

  const { data: collection, isLoading, error } = useCollection(id ?? null);
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();
  const removeChurch = useRemoveChurchFromCollection();

  // Inline editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [removeChurchTarget, setRemoveChurchTarget] = useState<ICollectionChurch | null>(null);

  const isOwner = Boolean(user && collection && user.id === collection.userId);

  /* ---- Inline editing handlers ---- */

  const startEditingName = () => {
    if (!collection) return;
    setEditName(collection.name);
    setIsEditingName(true);
  };

  const saveName = () => {
    if (!collection || !editName.trim()) return;
    updateCollection.mutate(
      { collectionId: collection.id, input: { name: editName.trim() } },
      {
        onSuccess: () => {
          setIsEditingName(false);
          addToast({ message: 'Collection name updated', variant: 'success' });
        },
        onError: () => addToast({ message: 'Failed to update name', variant: 'error' }),
      },
    );
  };

  const startEditingDescription = () => {
    if (!collection) return;
    setEditDescription(collection.description ?? '');
    setIsEditingDescription(true);
  };

  const saveDescription = () => {
    if (!collection) return;
    const value = editDescription.trim() || null;
    updateCollection.mutate(
      { collectionId: collection.id, input: { description: value } },
      {
        onSuccess: () => {
          setIsEditingDescription(false);
          addToast({ message: 'Description updated', variant: 'success' });
        },
        onError: () => addToast({ message: 'Failed to update description', variant: 'error' }),
      },
    );
  };

  /* ---- Visibility toggle ---- */

  const toggleVisibility = () => {
    if (!collection) return;
    updateCollection.mutate(
      { collectionId: collection.id, input: { isPublic: !collection.isPublic } },
      {
        onSuccess: () =>
          addToast({
            message: collection.isPublic ? 'Collection is now private' : 'Collection is now public',
            variant: 'success',
          }),
        onError: () => addToast({ message: 'Failed to update visibility', variant: 'error' }),
      },
    );
  };

  /* ---- Delete collection ---- */

  const confirmDeleteCollection = () => {
    if (!collection) return;
    deleteCollection.mutate(collection.id, {
      onSuccess: () => {
        addToast({ message: 'Collection deleted', variant: 'success' });
        navigate('/passport');
      },
      onError: () => addToast({ message: 'Failed to delete collection', variant: 'error' }),
    });
  };

  /* ---- Remove church ---- */

  const confirmRemoveChurch = () => {
    if (!collection || !removeChurchTarget) return;
    removeChurch.mutate(
      { collectionId: collection.id, churchId: removeChurchTarget.id },
      {
        onSuccess: () => {
          addToast({
            message: `${removeChurchTarget.name} removed from collection`,
            variant: 'success',
          });
          setRemoveChurchTarget(null);
        },
        onError: () => {
          addToast({ message: 'Failed to remove church', variant: 'error' });
          setRemoveChurchTarget(null);
        },
      },
    );
  };

  /* ---- Loading / error states ---- */

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-8 w-64 rounded bg-gray-200" />
          <div className="h-4 w-96 rounded bg-gray-200" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link
          to="/passport"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Passport
        </Link>
        <div className="mt-12 text-center">
          <Church className="mx-auto h-12 w-12 text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Collection not found</h2>
          <p className="mt-1 text-sm text-gray-500">
            This collection may have been deleted or you don&apos;t have permission to view it.
          </p>
        </div>
      </div>
    );
  }

  /* ---- Render ---- */

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to="/passport"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Passport
      </Link>

      {/* ---- Header ---- */}
      <div className="mt-6 space-y-3">
        {/* Name */}
        <div className="flex items-start gap-3">
          {isEditingName ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveName();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
                autoFocus
                className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-2xl font-bold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={saveName}
                disabled={updateCollection.isPending}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingName(false)}
                className="rounded-lg p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{collection.name}</h1>
              {isOwner && (
                <button
                  onClick={startEditingName}
                  className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Edit name"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        {isEditingDescription ? (
          <div className="flex items-start gap-2">
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsEditingDescription(false);
              }}
              autoFocus
              rows={2}
              placeholder="Add a description..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
            <button
              onClick={saveDescription}
              disabled={updateCollection.isPending}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditingDescription(false)}
              className="rounded-lg p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            {collection.description ? (
              <p className="text-sm text-gray-600 leading-relaxed">{collection.description}</p>
            ) : isOwner ? (
              <button
                onClick={startEditingDescription}
                className="text-sm text-gray-400 hover:text-gray-600 italic transition-colors"
              >
                Add a description...
              </button>
            ) : null}
            {collection.description && isOwner && (
              <button
                onClick={startEditingDescription}
                className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Edit description"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Meta row: badges + actions */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Church count */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <Church className="h-3.5 w-3.5" />
            {collection.churchCount} {collection.churchCount === 1 ? 'church' : 'churches'}
          </span>

          {/* Visibility badge */}
          {collection.isPublic ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              <Globe className="h-3.5 w-3.5" />
              Public
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              <Lock className="h-3.5 w-3.5" />
              Private
            </span>
          )}

          {/* Creator */}
          <span className="text-sm text-gray-500">by {collection.user.name}</span>

          {/* Owner actions */}
          {isOwner && (
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={toggleVisibility}
                disabled={updateCollection.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                title={collection.isPublic ? 'Make private' : 'Make public'}
              >
                {collection.isPublic ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span className="hidden sm:inline">Make private</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Make public</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setDeleteDialogOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---- Church grid ---- */}
      {collection.churches.length === 0 ? (
        <div className="mt-16 text-center">
          <Church className="mx-auto h-12 w-12 text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">No churches yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            Start exploring and add churches to this collection.
          </p>
          <Link
            to="/search"
            className="mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <MapPin className="h-4 w-4" />
            Browse churches
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collection.churches.map((church) => (
            <ChurchCard
              key={church.id}
              church={church}
              isOwner={isOwner}
              onRemove={() => setRemoveChurchTarget(church)}
            />
          ))}
        </div>
      )}

      {/* ---- Confirm dialogs ---- */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete collection"
        description={`Are you sure you want to delete "${collection.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        isPending={deleteCollection.isPending}
        onConfirm={confirmDeleteCollection}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      <ConfirmDialog
        open={removeChurchTarget !== null}
        title="Remove church"
        description={
          removeChurchTarget ? `Remove "${removeChurchTarget.name}" from this collection?` : ''
        }
        confirmLabel="Remove"
        variant="destructive"
        isPending={removeChurch.isPending}
        onConfirm={confirmRemoveChurch}
        onCancel={() => setRemoveChurchTarget(null)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Church Card                                                        */
/* ------------------------------------------------------------------ */

function ChurchCard({
  church,
  isOwner,
  onRemove,
}: {
  church: ICollectionChurch;
  isOwner: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative">
      {/* Cover image */}
      <Link to={`/churches/${church.slug}`}>
        {church.coverImageUrl ? (
          <img src={church.coverImageUrl} alt={church.name} className="h-40 w-full object-cover" />
        ) : (
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 h-40 flex items-center justify-center">
            <Church className="h-10 w-10 text-blue-300" />
          </div>
        )}
      </Link>

      {/* Remove button (owner only) */}
      {isOwner && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-gray-500 opacity-0 shadow-sm backdrop-blur-sm transition-opacity hover:text-red-600 group-hover:opacity-100"
          title="Remove from collection"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Card body */}
      <div className="p-4 space-y-2">
        <Link
          to={`/churches/${church.slug}`}
          className="block text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
        >
          {church.name}
        </Link>

        {church.denomination && (
          <p className="text-xs font-medium text-blue-600">{church.denomination}</p>
        )}

        <p className="text-xs text-gray-500 flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="line-clamp-1">
            {church.address}, {church.city}
          </span>
        </p>

        {/* Rating */}
        {church.reviewCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-gray-900">{church.avgRating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({church.reviewCount})</span>
          </div>
        )}

        {/* Notes */}
        {church.notes && (
          <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-2 mt-2 line-clamp-2">
            &ldquo;{church.notes}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
