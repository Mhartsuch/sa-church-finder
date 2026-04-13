import { FormEvent, useState } from 'react';
import { Star, X } from 'lucide-react';

import { AWARD_METADATA, IAward } from '@/types/passport';

interface LogVisitModalProps {
  churchId: string;
  churchName: string;
  isPending: boolean;
  onSubmit: (input: { visitedAt: string; notes?: string; rating?: number }) => void;
  onClose: () => void;
}

const todayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getAwardDisplayName = (award: IAward): string => {
  const meta = AWARD_METADATA[award.awardType];
  return meta ? `${meta.icon} ${meta.name}` : award.awardType;
};

export const getAwardDescription = (award: IAward): string => {
  const meta = AWARD_METADATA[award.awardType];
  return meta?.description ?? '';
};

export const LogVisitModal = ({
  churchId: _churchId,
  churchName,
  isPending,
  onSubmit,
  onClose,
}: LogVisitModalProps) => {
  const [visitDate, setVisitDate] = useState(todayDateString);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const input: { visitedAt: string; notes?: string; rating?: number } = {
      visitedAt: new Date(visitDate + 'T12:00:00').toISOString(),
    };

    if (notes.trim()) {
      input.notes = notes.trim();
    }

    if (rating !== null) {
      input.rating = rating;
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
          <h3 className="text-lg font-bold text-foreground">Log a visit</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-5 text-sm text-muted-foreground">
          Record your visit to <span className="font-semibold text-foreground">{churchName}</span>{' '}
          for your passport.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Visit date
            </span>
            <input
              type="date"
              value={visitDate}
              max={todayDateString()}
              onChange={(e) => setVisitDate(e.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
            />
          </label>

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
              maxLength={500}
              className="mt-2 w-full resize-none rounded-2xl border border-gray-300 bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
            />
          </label>

          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Rating{' '}
              <span className="normal-case tracking-normal text-muted-foreground/70">
                (optional)
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
                        isFilled
                          ? 'fill-[#FF385C] text-[#FF385C]'
                          : 'text-gray-300'
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
            disabled={isPending || !visitDate}
            className="w-full rounded-lg bg-[#FF385C] px-6 py-3.5 text-[16px] font-semibold text-white transition-colors hover:bg-[#b00838] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? 'Logging visit...' : 'Log visit'}
          </button>
        </form>
      </div>
    </div>
  );
};
