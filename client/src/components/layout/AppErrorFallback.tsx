export const AppErrorFallback = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffdfb] px-6 py-16 text-stone-900">
      <div className="w-full max-w-lg rounded-[2rem] border border-stone-200 bg-white/95 p-8 shadow-[0_24px_80px_-48px_rgba(68,64,60,0.55)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
          Unexpected Error
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-900">
          We hit a snag loading SA Church Finder.
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Refreshing the page usually gets things back on track. If the problem keeps happening, we
          will have the error details ready when Sentry is configured for this environment.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
          >
            Reload page
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:text-stone-900"
          >
            Go home
          </a>
        </div>
      </div>
    </main>
  );
};
