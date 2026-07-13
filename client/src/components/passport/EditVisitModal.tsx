import { FormEvent, useState } from 'react';
import { Star, X } from 'lucide-react';

import { IUpdateVisitInput } from '@/types/passport';

interface EditVisitModalProps {
  churchName: string;
  initialNotes: string | null;
  initialRating: number | null;
  isPending: boolean;
  onSubmit: (input: IUpdateVisitInput) => void;
  onClose: () => void;
}

const NOTES_MAX_LENGTH = 1000;

export const EditVisitModal = ({
  churchName,
  initialNotes,
  initialRating,
  isPending,
  onSubmit,
  onClose,
}: EditVisitModalProps) => {
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [rating, setRating] = useState<number | null>(initialRating);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      notes: notes.trim(),
      rating,
    });
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
          <h3 className="text-lg font-bold text-foreground">Edit visit</h3>
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
          Update your notes and rating for{' '}
          <span className="font-semibold text-foreground">{churchName}</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Notes{' '}
              <span className="normal-case tracking-normal text-muted-foreground/70">
                (optional)
              </span>
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What stood out about your visit?"
              rows={3}
              maxLength={NOTES_MAX_LENGTH}
              className="mt-2 w-full resize-none rounded-2xl border border-gray-300 bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
            />
          </label>

          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Rating{' '}
              <span className="normal-case tracking-normal text-muted-foreground/70">
                (optional — tap the selected star to clear)
              </span>
            </span>
            <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isFilled =
                  hoveredStar !== null ? starValue <= hoveredStar : starValue <= (rating ?? 0);
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue === rating ? null : starValue)}
                    onMouseEnter={() => setHoveredStar(starValue)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="rounded p-1 transition-colors hover:bg-muted"
                    aria-label={`Rate ${starValue} star${starValue === 1 ? '' : 's'}`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        isFilled ? 'fill-[#FF385C] text-[#FF385C]' : 'text-gray-300'
                      }`}
                    />
                  </button>
                );
              })}
              {rating !== null && (
                <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-[#FF385C] px-6 py-3.5 text-[16px] font-semibold text-white transition-colors hover:bg-[#b00838] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? 'Saving changes...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
