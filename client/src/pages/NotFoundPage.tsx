import { Home, Search, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useDocumentHead } from '@/hooks/useDocumentHead';

const NotFoundPage = () => {
  const navigate = useNavigate();

  useDocumentHead({
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist.',
    canonicalPath: '/404',
  });

  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-md text-center">
        <p className="text-7xl font-bold text-[#FF385C]">404</p>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Page not found
        </h1>

        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have been moved or no
          longer exists.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>

          <Link
            to="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FF385C] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e0314f] sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>

          <Link
            to="/search"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:w-auto"
          >
            <Search className="h-4 w-4" />
            Search churches
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
