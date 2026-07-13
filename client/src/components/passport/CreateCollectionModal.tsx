import { FormEvent, useState } from 'react';
import { X } from 'lucide-react';

import { ICreateCollectionInput } from '@/types/passport';

interface CreateCollectionModalProps {
  isPending: boolean;
  onSubmit: (input: ICreateCollectionInput) => void;
  onClose: () => void;
}

const NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

export const CreateCollectionModal = ({
  isPending,
  onSubmit,
  onClose,
}: CreateCollectionModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const trimmedName = name.trim();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedName) {
      return;
    }

    const input: ICreateCollectionInput = {
      name: trimmedName,
      isPublic,
    };

    const trimmedDescription = description.trim();
    if (trimmedDescription) {
      input.description = trimmedDescription;
    }

    onSubmit(input);
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
          <h3 className="text-lg font-bold text-foreground">New collection</h3>
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
          Group churches into a named list — like &ldquo;Best Music&rdquo; or &ldquo;Historic
          Sanctuaries&rdquo; — and share it with friends.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sunday Morning Favorites"
              maxLength={NAME_MAX_LENGTH}
              required
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Description{' '}
              <span className="normal-case tracking-normal text-muted-foreground/70">
                (optional)
              </span>
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes these churches special?"
              rows={3}
              maxLength={DESCRIPTION_MAX_LENGTH}
              className="mt-2 w-full resize-none rounded-2xl border border-gray-300 bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
            />
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#FF385C]"
            />
            <span>
              <span className="block text-sm font-semibold text-foreground">Share publicly</span>
              <span className="block text-xs text-muted-foreground">
                Public collections show up on your shared passport so friends can explore along
                with you.
              </span>
            </span>
          </label>

          <button
            type="submit"
            disabled={isPending || !trimmedName}
            className="w-full rounded-lg bg-[#FF385C] px-6 py-3.5 text-[16px] font-semibold text-white transition-colors hover:bg-[#b00838] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? 'Creating collection...' : 'Create collection'}
          </button>
        </form>
      </div>
    </div>
  );
};
