import { useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Camera,
  GripVertical,
  ImagePlus,
  Pencil,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

import { ConfirmDialog } from '@/components/layout/ConfirmDialog';
import {
  useChurchPhotos,
  useDeleteChurchPhoto,
  useReorderChurchPhotos,
  useUpdateChurchPhotoAltText,
  useUploadChurchPhoto,
} from '@/hooks/useChurchPhotos';
import { useToast } from '@/hooks/useToast';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type PhotoManagerProps = {
  churchId: string;
  churchName: string;
};

export const PhotoManager = ({ churchId, churchName }: PhotoManagerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const { data: photos, isLoading, error } = useChurchPhotos(churchId);
  const uploadMutation = useUploadChurchPhoto();
  const deleteMutation = useDeleteChurchPhoto();
  const reorderMutation = useReorderChurchPhotos();
  const updateAltTextMutation = useUpdateChurchPhotoAltText();

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editingAltText, setEditingAltText] = useState<{ photoId: string; altText: string } | null>(
    null,
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset the input so the same file can be selected again
    event.target.value = '';

    if (!ALLOWED_TYPES.has(file.type)) {
      addToast({ message: 'Only JPEG, PNG, and WebP images are allowed', variant: 'error' });
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      addToast({ message: 'Photo must be 10 MB or smaller', variant: 'error' });
      return;
    }

    uploadMutation.mutate(
      { churchId, file },
      {
        onSuccess: () => {
          addToast({ message: 'Photo uploaded', variant: 'success' });
        },
        onError: (err: Error) => {
          addToast({ message: err.message, variant: 'error' });
        },
      },
    );
  };

  const handleDelete = () => {
    if (!pendingDeleteId) return;

    deleteMutation.mutate(
      { photoId: pendingDeleteId, churchId },
      {
        onSuccess: () => {
          setPendingDeleteId(null);
          addToast({ message: 'Photo deleted', variant: 'success' });
        },
        onError: (err: Error) => {
          setPendingDeleteId(null);
          addToast({ message: err.message, variant: 'error' });
        },
      },
    );
  };

  const handleMoveUp = (index: number) => {
    if (!photos || index <= 0) return;

    const newOrder = photos.map((p, i) => ({
      photoId: p.id,
      displayOrder: i,
    }));

    // Swap the two items
    const temp = newOrder[index].displayOrder;
    newOrder[index].displayOrder = newOrder[index - 1].displayOrder;
    newOrder[index - 1].displayOrder = temp;

    reorderMutation.mutate(
      { churchId, ordering: newOrder },
      {
        onError: (err: Error) => {
          addToast({ message: err.message, variant: 'error' });
        },
      },
    );
  };

  const handleMoveDown = (index: number) => {
    if (!photos || index >= photos.length - 1) return;

    const newOrder = photos.map((p, i) => ({
      photoId: p.id,
      displayOrder: i,
    }));

    const temp = newOrder[index].displayOrder;
    newOrder[index].displayOrder = newOrder[index + 1].displayOrder;
    newOrder[index + 1].displayOrder = temp;

    reorderMutation.mutate(
      { churchId, ordering: newOrder },
      {
        onError: (err: Error) => {
          addToast({ message: err.message, variant: 'error' });
        },
      },
    );
  };

  const handleSaveAltText = () => {
    if (!editingAltText) return;

    const trimmed = editingAltText.altText.trim();

    updateAltTextMutation.mutate(
      {
        photoId: editingAltText.photoId,
        altText: trimmed || null,
        churchId,
      },
      {
        onSuccess: () => {
          setEditingAltText(null);
          addToast({ message: 'Alt text updated', variant: 'success' });
        },
        onError: (err: Error) => {
          addToast({ message: err.message, variant: 'error' });
        },
      },
    );
  };

  const pendingPhoto = photos?.find((p) => p.id === pendingDeleteId);

  return (
    <div className="rounded-[24px] border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Photos</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage photos for {churchName}. The first photo is used as the cover image.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-[#FF385C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b00838] disabled:opacity-60"
        >
          {uploadMutation.isPending ? (
            <>
              <Upload className="h-4 w-4 animate-pulse" />
              Uploading...
            </>
          ) : (
            <>
              <ImagePlus className="h-4 w-4" />
              Add photo
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">Loading photos...</p>
      ) : error ? (
        <p className="mt-4 text-sm leading-6 text-red-600">
          Failed to load photos: {error.message}
        </p>
      ) : !photos || photos.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-background p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff5f0] text-[#FF385C]">
            <Camera className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            No photos yet. Add photos so visitors can see what your church looks like.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-2xl border border-border bg-background"
            >
              {/* Cover badge for first photo */}
              {index === 0 && (
                <div className="absolute left-2 top-2 z-10 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                  Cover photo
                </div>
              )}

              {/* Photo image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={photo.url}
                  alt={photo.altText || `${churchName} photo`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />

                {/* Overlay actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={reorderMutation.isPending}
                      className="rounded-full bg-white/90 p-2 text-foreground shadow-md transition-colors hover:bg-white"
                      aria-label="Move up"
                      title="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  )}
                  {index < photos.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={reorderMutation.isPending}
                      className="rounded-full bg-white/90 p-2 text-foreground shadow-md transition-colors hover:bg-white"
                      aria-label="Move down"
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Photo controls */}
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                  <GripVertical className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate text-xs">
                    {photo.altText || (
                      <span className="italic text-muted-foreground/60">No alt text</span>
                    )}
                  </span>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingAltText({
                        photoId: photo.id,
                        altText: photo.altText || '',
                      })
                    }
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Edit alt text"
                    title="Edit alt text"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(photo.id)}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete photo"
                    title="Delete photo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alt text editor modal */}
      {editingAltText && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px] animate-modal-overlay"
          onClick={() => setEditingAltText(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Edit alt text"
            className="w-full max-w-md overflow-hidden rounded-2xl bg-card p-4 shadow-[0_20px_80px_rgba(0,0,0,0.25)] animate-modal-slide-up sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-foreground">Edit alt text</h3>
              <button
                type="button"
                onClick={() => setEditingAltText(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-[14px] text-muted-foreground">
              Describe this photo for visitors using screen readers.
            </p>
            <textarea
              value={editingAltText.altText}
              onChange={(e) => setEditingAltText({ ...editingAltText, altText: e.target.value })}
              placeholder="e.g. Interior of the sanctuary with wooden pews and stained glass windows"
              maxLength={300}
              rows={3}
              className="mt-3 w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#FF385C] focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
            />
            <div className="mt-1 text-right text-xs text-muted-foreground">
              {editingAltText.altText.length}/300
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingAltText(null)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAltText}
                disabled={updateAltTextMutation.isPending}
                className="rounded-xl bg-[#FF385C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b00838] disabled:opacity-60"
              >
                {updateAltTextMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete this photo?"
        description={
          pendingPhoto ? `This photo will be permanently removed from ${churchName}'s listing.` : ''
        }
        confirmLabel="Delete photo"
        variant="destructive"
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
};
