import { useState } from 'react';
import { MessageSquare, MessageSquareReply, Send, Star, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ConfirmDialog } from '@/components/layout/ConfirmDialog';
import { deleteReviewResponse, fetchChurchReviews, respondToReview } from '@/api/reviews';
import { useToast } from '@/hooks/useToast';
import { IReview } from '@/types/review';

type ReviewManagerProps = {
  churchId: string;
  churchName: string;
};

const formatDate = (date: string): string =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${
          i < Math.round(rating) ? 'fill-[#FF385C] text-[#FF385C]' : 'fill-muted text-muted'
        }`}
      />
    ))}
  </div>
);

export const ReviewManager = ({ churchId, churchName }: ReviewManagerProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [deletingResponseFor, setDeletingResponseFor] = useState<IReview | null>(null);

  const reviewsQuery = useQuery({
    queryKey: ['leaders-portal', 'reviews', churchId],
    queryFn: () => fetchChurchReviews(churchId, { sort: 'recent', pageSize: 10 }),
    staleTime: 60000,
  });

  const respondMutation = useMutation({
    mutationFn: ({ reviewId, body }: { reviewId: string; body: string }) =>
      respondToReview(reviewId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaders-portal', 'reviews', churchId] });
      queryClient.invalidateQueries({ queryKey: ['church-reviews'] });
      setRespondingTo(null);
      setResponseText('');
      addToast({ message: 'Response posted', variant: 'success' });
    },
    onError: (error: Error) => {
      addToast({ message: error.message, variant: 'error' });
    },
  });

  const deleteResponseMutation = useMutation({
    mutationFn: (reviewId: string) => deleteReviewResponse(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaders-portal', 'reviews', churchId] });
      queryClient.invalidateQueries({ queryKey: ['church-reviews'] });
      setDeletingResponseFor(null);
      addToast({ message: 'Response removed', variant: 'success' });
    },
    onError: (error: Error) => {
      setDeletingResponseFor(null);
      addToast({ message: error.message, variant: 'error' });
    },
  });

  const reviews = reviewsQuery.data?.data ?? [];

  const handleSubmitResponse = (reviewId: string) => {
    const trimmed = responseText.trim();
    if (!trimmed) return;
    respondMutation.mutate({ reviewId, body: trimmed });
  };

  return (
    <div className="rounded-[24px] border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Recent reviews</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Respond to visitor feedback for {churchName}.
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff5f0] text-[#FF385C]">
          <MessageSquare className="h-5 w-5" />
        </div>
      </div>

      {reviewsQuery.isLoading ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-background p-4">
          <p className="text-sm leading-6 text-muted-foreground">
            No reviews yet. When visitors leave feedback, you can respond here.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{review.user.name}</p>
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-3">
                    {review.body}
                  </p>

                  {review.responseBody ? (
                    <div className="mt-3 rounded-xl border border-[#d1e7dd] bg-[#f0faf4] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#166534]">
                          Your response
                        </p>
                        <button
                          type="button"
                          onClick={() => setDeletingResponseFor(review)}
                          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-[#a8083a] transition-colors hover:bg-[#fff0f3]"
                          aria-label="Remove response"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </button>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-foreground">
                        {review.responseBody}
                      </p>
                      {review.respondedAt ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(review.respondedAt)}
                        </p>
                      ) : null}
                    </div>
                  ) : respondingTo === review.id ? (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write a response to this review..."
                        rows={3}
                        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm leading-6 text-foreground placeholder:text-muted-foreground focus:border-[#FF385C] focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRespondingTo(null);
                            setResponseText('');
                          }}
                          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSubmitResponse(review.id)}
                          disabled={!responseText.trim() || respondMutation.isPending}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#1f4d45] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#163b34] disabled:opacity-50"
                        >
                          <Send className="h-3.5 w-3.5" />
                          {respondMutation.isPending ? 'Posting...' : 'Post response'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setRespondingTo(review.id);
                        setResponseText('');
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      <MessageSquareReply className="h-3.5 w-3.5" />
                      Respond
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deletingResponseFor !== null}
        title="Remove this response?"
        description={
          deletingResponseFor
            ? `Your response to ${deletingResponseFor.user.name}'s review will be removed from the public listing.`
            : ''
        }
        confirmLabel="Remove response"
        variant="destructive"
        isPending={deleteResponseMutation.isPending}
        onConfirm={() => {
          if (deletingResponseFor) {
            deleteResponseMutation.mutate(deletingResponseFor.id);
          }
        }}
        onCancel={() => setDeletingResponseFor(null)}
      />
    </div>
  );
};
