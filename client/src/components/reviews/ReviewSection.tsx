import { Star } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useCurrentUser } from '@/hooks/useAuth';
import { useChurchReviews, useSaveReview } from '@/hooks/useReviews';
import { buildAuthPageHref } from '@/lib/auth-redirect';
import { formatRating, plural } from '@/lib/format';
import { cn } from '@/lib/utils';
import { IChurch } from '@/types/church';
import { IReview, ReviewSort } from '@/types/review';

const PAGE = 6;

export const ReviewSection = ({ church }: { church: IChurch }) => {
  const [sort, setSort] = useState<ReviewSort>('recent');
  const [limit, setLimit] = useState(PAGE);
  const [editing, setEditing] = useState(false);
  const { data: user } = useCurrentUser();
  const { data, isPending } = useChurchReviews(church.id, sort, limit);
  const location = useLocation();

  const reviews = data?.data ?? [];
  const total = data?.meta.total ?? church.reviewCount;
  const mine = data?.currentUserReview ?? null;

  return (
    <section id="reviews" className="py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-[22px] font-semibold">
          <Star className="h-5 w-5 fill-current" />
          {church.reviewCount > 0
            ? `${formatRating(church.avgRating)} · ${plural(church.reviewCount, 'review')}`
            : 'No reviews yet'}
        </h2>
        {total > 1 && (
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as ReviewSort)}
            aria-label="Sort reviews"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="recent">Most recent</option>
            <option value="highest">Highest rated</option>
            <option value="lowest">Lowest rated</option>
          </select>
        )}
      </div>

      {church.reviewCount === 0 && church.googleRating && (
        <p className="mt-2 text-sm text-gray-500">
          Rated {formatRating(church.googleRating)} from{' '}
          {plural(church.googleReviewCount ?? 0, 'Google review')}.
        </p>
      )}

      <div className="mt-6">
        {!user ? (
          <Link
            to={buildAuthPageHref('/login', `${location.pathname}#reviews`)}
            className="inline-block rounded-lg border border-gray-900 px-5 py-3 font-semibold hover:bg-gray-50"
          >
            Log in to write a review
          </Link>
        ) : editing || (!mine && !isPending) ? (
          <ReviewForm churchId={church.id} existing={mine} onDone={() => setEditing(false)} />
        ) : mine ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-gray-900 px-5 py-3 font-semibold hover:bg-gray-50"
          >
            Edit your review
          </button>
        ) : null}
      </div>

      <div className="mt-10 grid gap-x-16 gap-y-10 md:grid-cols-2">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>

      {reviews.length < total && (
        <button
          type="button"
          onClick={() => setLimit((value) => value + PAGE * 2)}
          className="mt-10 rounded-lg border border-gray-900 px-6 py-3 font-semibold hover:bg-gray-50"
        >
          Show more reviews
        </button>
      )}
    </section>
  );
};

const ReviewItem = ({ review }: { review: IReview }) => (
  <article>
    <div className="flex items-center gap-3">
      {review.user.avatarUrl ? (
        <img src={review.user.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
      ) : (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 font-semibold text-white">
          {review.user.name.charAt(0).toUpperCase()}
        </span>
      )}
      <div>
        <p className="font-semibold">{review.user.name}</p>
        <p className="text-sm text-gray-500">
          {new Date(review.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
    <Stars value={review.rating} className="mt-3" />
    <p className="mt-2 whitespace-pre-line leading-relaxed text-gray-800">{review.body}</p>
  </article>
);

export const Stars = ({ value, className }: { value: number; className?: string }) => (
  <div className={cn('flex gap-0.5', className)} aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={cn(
          'h-3 w-3',
          n <= Math.round(value) ? 'fill-gray-900 text-gray-900' : 'text-gray-300',
        )}
      />
    ))}
  </div>
);

const ReviewForm = ({
  churchId,
  existing,
  onDone,
}: {
  churchId: string;
  existing: IReview | null;
  onDone: () => void;
}) => {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [body, setBody] = useState(existing?.body ?? '');
  const [hover, setHover] = useState(0);
  const { save, remove } = useSaveReview(churchId);

  useEffect(() => {
    setRating(existing?.rating ?? 0);
    setBody(existing?.body ?? '');
  }, [existing]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate(
      { reviewId: existing?.id, input: { rating, body: body.trim() } },
      { onSuccess: onDone },
    );
  };

  const error = save.error ?? remove.error;

  return (
    <form onSubmit={submit} className="max-w-xl rounded-2xl border border-gray-300 p-6">
      <p className="font-semibold">{existing ? 'Update your review' : 'Share your experience'}</p>
      <div className="mt-3 flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n === 1 ? '' : 's'}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => setRating(n)}
          >
            <Star
              className={cn(
                'h-7 w-7',
                n <= (hover || rating) ? 'fill-brand text-brand' : 'text-gray-300',
              )}
            />
          </button>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        minLength={10}
        maxLength={2000}
        required
        placeholder="How was the welcome, the worship, the community?"
        className="mt-4 w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-gray-900"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={!rating || body.trim().length < 10 || save.isPending}
          className="rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white disabled:opacity-40"
        >
          {save.isPending ? 'Saving…' : existing ? 'Update review' : 'Post review'}
        </button>
        {existing && (
          <>
            <button type="button" onClick={onDone} className="px-3 py-3 font-semibold underline">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => remove.mutate(existing.id, { onSuccess: onDone })}
              className="ml-auto px-3 py-3 text-sm text-gray-500 underline hover:text-red-600"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </form>
  );
};
