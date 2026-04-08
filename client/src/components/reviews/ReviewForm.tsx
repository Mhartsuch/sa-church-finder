import { FormEvent, useEffect, useState } from 'react';
import { LogIn, MessageSquareText, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ConfirmDialog } from '@/components/layout/ConfirmDialog';
import { useCreateReview, useDeleteReview, useUpdateReview } from '@/hooks/useReviews';
import { useToast } from '@/hooks/useToast';
import { IReview } from '@/types/review';

type ReviewFormState = {
  rating: string;
  body: string;
  welcomeRating: string;
  worshipRating: string;
  sermonRating: string;
  facilitiesRating: string;
};

type ReviewFormProps = {
  churchId: string;
  churchName: string;
  currentUserReview: IReview | null;
  isAuthenticated: boolean;
};

const RATING_OPTIONS = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1];
const CATEGORY_RATING_OPTIONS = [1, 2, 3, 4, 5];
const CATEGORY_FIELDS: Array<{
  field: 'welcomeRating' | 'worshipRating' | 'sermonRating' | 'facilitiesRating';
  label: string;
}> = [
  { field: 'welcomeRating', label: 'Welcome' },
  { field: 'worshipRating', label: 'Worship' },
  { field: 'sermonRating', label: 'Sermon' },
  { field: 'facilitiesRating', label: 'Facilities' },
];

const EMPTY_FORM_STATE: ReviewFormState = {
  rating: '5',
  body: '',
  welcomeRating: '',
  worshipRating: '',
  sermonRating: '',
  facilitiesRating: '',
};

const toFormState = (review: IReview | null): ReviewFormState => {
  if (!review) {
    return EMPTY_FORM_STATE;
  }

  return {
    rating: review.rating.toString(),
    body: review.body,
    welcomeRating: review.welcomeRating?.toString() ?? '',
    worshipRating: review.worshipRating?.toString() ?? '',
    sermonRating: review.sermonRating?.toString() ?? '',
    facilitiesRating: review.facilitiesRating?.toString() ?? '',
  };
};

const parseOptionalRating = (value: string): number | null => {
  if (!value) {
    return null;
  }

  return Number(value);
};

const validateFormState = (formState: ReviewFormState): string | null => {
  const rating = Number(formState.rating);
  const bodyLength = formState.body.trim().length;

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return 'Choose an overall rating between 1 and 5.';
  }

  if (bodyLength < 50) {
    return 'Share at least 50 characters so other visitors have something useful to learn from.';
  }

  if (bodyLength > 2000) {
    return 'Keep the written review under 2000 characters.';
  }

  return null;
};

const ReviewForm = ({
  churchId,
  churchName,
  currentUserReview,
  isAuthenticated,
}: ReviewFormProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();
  const deleteReviewMutation = useDeleteReview();
  const { addToast } = useToast();
  const [formState, setFormState] = useState<ReviewFormState>(() => toFormState(currentUserReview));
  const [formError, setFormError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setFormState(toFormState(currentUserReview));
    setFormError(null);
  }, [currentUserReview]);

  const bodyLength = formState.body.trim().length;
  const isPending =
    createReviewMutation.isPending ||
    updateReviewMutation.isPending ||
    deleteReviewMutation.isPending;

  const handleRequireAuth = () => {
    navigate('/login', {
      state: {
        from: {
          pathname: location.pathname,
          search: location.search,
          hash: '#reviews',
        },
      },
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const validationError = validateFormState(formState);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = {
      rating: Number(formState.rating),
      body: formState.body.trim(),
      welcomeRating: parseOptionalRating(formState.welcomeRating),
      worshipRating: parseOptionalRating(formState.worshipRating),
      sermonRating: parseOptionalRating(formState.sermonRating),
      facilitiesRating: parseOptionalRating(formState.facilitiesRating),
    };

    try {
      if (currentUserReview) {
        await updateReviewMutation.mutateAsync({
          reviewId: currentUserReview.id,
          ...payload,
        });
        addToast({ message: 'Review updated successfully', variant: 'success' });
      } else {
        await createReviewMutation.mutateAsync({
          churchId,
          ...payload,
        });
        addToast({
          message: 'Review published \u2014 thank you for sharing your experience!',
          variant: 'success',
        });
      }
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to save your review right now.',
      );
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!currentUserReview) {
      return;
    }

    setFormError(null);

    try {
      await deleteReviewMutation.mutateAsync(currentUserReview.id);
      setIsDeleteDialogOpen(false);
      addToast({ message: 'Review deleted', variant: 'success' });
    } catch (error) {
      setIsDeleteDialogOpen(false);
      setFormError(
        error instanceof Error ? error.message : 'Unable to delete your review right now.',
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-[28px] border border-dashed border-border bg-card p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0f3] text-[#FF385C]">
          <MessageSquareText className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-foreground">Share your visit</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Signed-in members can leave one review per church and edit it later as they get to know
          the community better.
        </p>
        <button
          type="button"
          onClick={handleRequireAuth}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
        >
          <LogIn className="h-4 w-4" />
          Sign in to write a review
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] border border-border bg-card p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            {currentUserReview ? 'Update your review' : 'Write a review'}
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {currentUserReview
              ? 'You can keep this feedback up to date anytime.'
              : 'Tell future visitors what stood out during your visit.'}
          </p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          One review per church
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-foreground">Overall rating</span>
          <select
            value={formState.rating}
            onChange={(event) => {
              setFormState((current) => ({
                ...current,
                rating: event.target.value,
              }));
            }}
            disabled={isPending}
            className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground disabled:cursor-not-allowed disabled:opacity-70"
          >
            {RATING_OPTIONS.map((option) => (
              <option key={option} value={option.toString()}>
                {option.toFixed(1)} / 5
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-2xl border border-[#ffe0e7] bg-card px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Written review</p>
          <p className="mt-1 text-sm text-muted-foreground">{bodyLength}/2000 characters</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Aim for at least 50 characters so it is actually useful.
          </p>
        </div>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-foreground">
          What was your experience like?
        </span>
        <textarea
          value={formState.body}
          onChange={(event) => {
            setFormState((current) => ({
              ...current,
              body: event.target.value,
            }));
          }}
          disabled={isPending}
          rows={6}
          placeholder="Share what welcomed you, what the service felt like, and what future visitors should know."
          className="mt-2 w-full rounded-[24px] border border-border bg-card px-4 py-3 text-sm leading-6 text-foreground outline-none transition-colors focus:border-foreground disabled:cursor-not-allowed disabled:opacity-70"
        />
      </label>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {CATEGORY_FIELDS.map(({ field, label }) => (
          <label key={field} className="block">
            <span className="text-sm font-semibold text-foreground">{label}</span>
            <select
              value={formState[field]}
              onChange={(event) => {
                setFormState((current) => ({
                  ...current,
                  [field]: event.target.value,
                }));
              }}
              disabled={isPending}
              className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground disabled:cursor-not-allowed disabled:opacity-70"
            >
              <option value="">Skip for now</option>
              {CATEGORY_RATING_OPTIONS.map((option) => (
                <option key={option} value={option.toString()}>
                  {option} / 5
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {formError ? (
        <div className="mt-4 rounded-2xl border border-[#ffc2cc] bg-[#fff0f3] px-4 py-3 text-sm text-[#a8083a]">
          {formError}
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[#FF385C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b00838] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending
            ? currentUserReview
              ? 'Saving changes...'
              : 'Publishing review...'
            : currentUserReview
              ? 'Save changes'
              : 'Publish review'}
        </button>

        {currentUserReview ? (
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Trash2 className="h-4 w-4" />
            Delete review
          </button>
        ) : null}
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Delete review?"
        description={`Your review for ${churchName} will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete review"
        variant="destructive"
        isPending={deleteReviewMutation.isPending}
        onConfirm={() => {
          void handleDeleteConfirmed();
        }}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </form>
  );
};

export default ReviewForm;
