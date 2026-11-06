import { useMutation } from '@tanstack/react-query';
import { FormEvent, ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { changePassword, resendVerificationEmail } from '@/api/auth';
import { Field, FormError } from '@/components/auth/AuthLayout';
import { Stars } from '@/components/reviews/ReviewSection';
import { useCurrentUser, useDeleteAccount, useUpdateProfile } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useUserReviews } from '@/hooks/useReviews';
import { AuthUser } from '@/types/auth';

const AccountPage = () => {
  useDocumentTitle('Account');
  const { data: user } = useCurrentUser();
  if (!user) return null;

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-10">
      <h1 className="text-[32px] font-semibold">Account</h1>
      <p className="mt-1 text-gray-600">
        <span className="font-semibold">{user.name}</span>, {user.email}
      </p>
      <div className="mt-10 divide-y divide-gray-200">
        <ProfileSection user={user} />
        <VerificationSection user={user} />
        <PasswordSection />
        <ReviewsSection userId={user.id} />
        <DeleteSection user={user} />
      </div>
    </main>
  );
};

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="py-8">
    <h2 className="text-lg font-semibold">{title}</h2>
    <div className="mt-4">{children}</div>
  </section>
);

const button = 'rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white disabled:opacity-50';

const ProfileSection = ({ user }: { user: AuthUser }) => {
  const [name, setName] = useState(user.name);
  const update = useUpdateProfile();
  return (
    <Section title="Name">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          update.mutate({ userId: user.id, name: name.trim() });
        }}
      >
        <div className="flex-1">
          <Field
            label="Display name"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className={button}
          disabled={update.isPending || name.trim() === user.name}
        >
          {update.isSuccess && name.trim() === user.name ? 'Saved' : 'Save'}
        </button>
      </form>
      <FormError error={update.error} />
    </Section>
  );
};

const VerificationSection = ({ user }: { user: AuthUser }) => {
  const resend = useMutation({ mutationFn: resendVerificationEmail });
  if (user.emailVerified) return null;
  return (
    <Section title="Verify your email">
      <p className="text-gray-600">Confirm {user.email} so we can reach you about your account.</p>
      <button
        type="button"
        className={`${button} mt-4`}
        disabled={resend.isPending || resend.isSuccess}
        onClick={() => resend.mutate()}
      >
        {resend.isSuccess ? 'Email sent' : 'Resend verification email'}
      </button>
      <FormError error={resend.error} />
    </Section>
  );
};

const PasswordSection = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const change = useMutation({ mutationFn: changePassword });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    change.mutate(form, { onSuccess: () => setForm({ currentPassword: '', newPassword: '' }) });
  };
  return (
    <Section title="Password">
      <form onSubmit={submit} className="space-y-3">
        <FormError error={change.error} />
        {change.isSuccess && <p className="text-sm text-green-700">Password updated.</p>}
        <Field
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
        />
        <Field
          label="New password (8+ characters)"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
        <button type="submit" className={button} disabled={change.isPending}>
          Update password
        </button>
      </form>
    </Section>
  );
};

const ReviewsSection = ({ userId }: { userId: string }) => {
  const { data: reviews = [] } = useUserReviews(userId);
  return (
    <Section title="Your reviews">
      {reviews.length === 0 ? (
        <p className="text-gray-500">You haven’t reviewed any churches yet.</p>
      ) : (
        <ul className="space-y-6">
          {reviews.map((review) => (
            <li key={review.id} className="flex gap-4">
              {review.church.coverImageUrl && (
                <img
                  src={review.church.coverImageUrl}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0">
                <Link
                  to={`/churches/${review.church.slug}#reviews`}
                  className="font-semibold hover:underline"
                >
                  {review.church.name}
                </Link>
                <Stars value={review.rating} className="mt-1" />
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{review.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
};

const DeleteSection = ({ user }: { user: AuthUser }) => {
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const remove = useDeleteAccount();
  const navigate = useNavigate();
  return (
    <Section title="Delete account">
      <p className="text-gray-600">This permanently removes your account, wishlist, and reviews.</p>
      {confirming ? (
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            remove.mutate(
              { userId: user.id, password: password || undefined },
              { onSuccess: () => navigate('/') },
            );
          }}
        >
          <FormError error={remove.error} />
          <Field
            label="Password (leave blank if you sign in with Google)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white"
              disabled={remove.isPending}
            >
              Permanently delete
            </button>
            <button
              type="button"
              className="px-3 font-semibold underline"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="mt-4 font-semibold text-red-600 underline"
          onClick={() => setConfirming(true)}
        >
          Delete my account
        </button>
      )}
    </Section>
  );
};

export default AccountPage;
