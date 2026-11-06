import { lazy, ReactNode, Suspense, useEffect } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { RequireAuth } from '@/components/auth/AuthLayout';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import BrowsePage from '@/pages/BrowsePage';

const ChurchPage = lazy(() => import('@/pages/ChurchPage'));
const WishlistsPage = lazy(() => import('@/pages/WishlistsPage'));
const AccountPage = lazy(() => import('@/pages/AccountPage'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));
const auth = () => import('@/pages/AuthPages');
const LoginPage = lazy(() => auth().then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => auth().then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => auth().then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => auth().then((m) => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => auth().then((m) => ({ default: m.VerifyEmailPage })));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/** Old `/search?...` links now land on the browse page with the same filters. */
const SearchRedirect = () => {
  const { search } = useLocation();
  return <Navigate to={{ pathname: '/', search }} replace />;
};

const NotFound = () => (
  <main className="mx-auto max-w-lg px-6 py-32 text-center">
    <h1 className="text-5xl font-semibold">Page not found</h1>
    <p className="mt-4 text-gray-500">We can’t seem to find the page you’re looking for.</p>
    <Link
      to="/"
      className="mt-8 inline-block rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white"
    >
      Browse churches
    </Link>
  </main>
);

const Protected = ({ children }: { children: ReactNode }) => <RequireAuth>{children}</RequireAuth>;

const App = () => {
  const { pathname } = useLocation();
  const isBrowse = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <ScrollToTop />
      <Header wide={isBrowse || pathname === '/wishlists'} />
      <div className="flex-1">
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <Routes>
            <Route path="/" element={<BrowsePage />} />
            <Route path="/search" element={<SearchRedirect />} />
            <Route path="/churches/:slug" element={<ChurchPage />} />
            <Route
              path="/wishlists"
              element={
                <Protected>
                  <WishlistsPage />
                </Protected>
              }
            />
            <Route
              path="/account"
              element={
                <Protected>
                  <AccountPage />
                </Protected>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/privacy" element={<LegalPage kind="privacy" />} />
            <Route path="/terms" element={<LegalPage kind="terms" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
      {!isBrowse && <Footer />}
    </div>
  );
};

export default App;
