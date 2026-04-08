import { useState } from 'react';

export const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="mx-auto max-w-[1760px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="rounded-2xl bg-muted p-8 text-center">
          <h2 className="text-[22px] font-bold">You&apos;re on the list! 🎉</h2>
          <p className="mt-2 text-[15px] text-muted-foreground">
            We&apos;ll send you updates about new churches, community events, and local stories.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1760px] px-4 py-12 sm:px-6 lg:px-10">
      <div className="rounded-2xl bg-muted p-8 text-center sm:p-12">
        <h2 className="text-[22px] font-bold">Stay connected with your community</h2>
        <p className="mx-auto mt-2 max-w-lg text-[15px] text-muted-foreground">
          Get weekly updates on church events, new listings, and stories from San Antonio&apos;s
          faith community.
        </p>
        <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-md gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-[14px] outline-none transition-colors focus:border-foreground"
          />
          <button
            type="submit"
            className="rounded-xl px-6 py-3 text-[14px] font-bold text-white transition-transform hover:scale-[1.02]"
            style={{ background: 'linear-gradient(to right, #E61E4D, #E31C5F, #D70466)' }}
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};
