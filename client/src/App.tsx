import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { ChurchProfileSkeleton } from '@/components/church/ChurchProfileSkeleton';
import { EventsSkeleton } from '@/components/layout/EventsSkeleton';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { InstallPrompt } from '@/components/layout/InstallPrompt';
import { MobileNav } from '@/components/layout/MobileNav';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { PageFallback } from '@/components/layout/PageFallback';
import { RouteErrorBoundary } from '@/components/layout/RouteErrorBoundary';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { ToastContainer } from '@/components/layout/Toast';
import { ToastProvider } from '@/hooks/ToastProvider';

// Eagerly loaded: home + search are the primary entry points
import HomePage from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';

// Lazy-loaded: secondary pages split into separate chunks
const ChurchProfilePage = lazy(() =>
  import('@/pages/ChurchProfilePage').then((m) => ({ default: m.ChurchProfilePage })),
);
const AccountPage = lazy(() => import('@/pages/AccountPage'));
const ComparePage = lazy(() => import('@/pages/ComparePage'));
const EventsDiscoveryPage = lazy(() => import('@/pages/EventsDiscoveryPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage'));
const HelpCenterPage = lazy(() => import('@/pages/HelpCenterPage'));
const SafetyInformationPage = lazy(() => import('@/pages/SafetyInformationPage'));
const AccessibilityPage = lazy(() => import('@/pages/AccessibilityPage'));
const ReportConcernPage = lazy(() => import('@/pages/ReportConcernPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const SitemapPage = lazy(() => import('@/pages/SitemapPage'));
const LeadersPortalPage = lazy(() => import('@/pages/LeadersPortalPage'));
const ForumPage = lazy(() => import('@/pages/ForumPage'));
const PassportPage = lazy(() => import('@/pages/PassportPage'));
const CollectionPage = lazy(() => import('@/pages/CollectionPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const AnalyticsDashboardPage = lazy(() => import('@/pages/AnalyticsDashboardPage'));

const App = () => {
  return (
    <ToastProvider>
      <div className="mobile-nav-spacer flex min-h-screen flex-col bg-background">
        <OfflineBanner />
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route
            path="/churches/:slug"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<ChurchProfileSkeleton />}>
                  <ChurchProfilePage />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/events"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<EventsSkeleton />}>
                  <EventsDiscoveryPage />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/compare"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  <ComparePage />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/login"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  <LoginPage />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/register"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  <RegisterPage />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  <ForgotPasswordPage />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/reset-password"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  <ResetPasswordPage />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/verify-email"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  <VerifyEmailPage />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/help-center"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  <HelpCenterPage />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/safety-information"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  <SafetyInformationPage />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/accessibility"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  <AccessibilityPage />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/report-a-concern"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  <ReportConcernPage />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/privacy"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  <PrivacyPage />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/terms"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  <TermsPage />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/sitemap"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  <SitemapPage />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/forum"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  <ForumPage />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/passport"
            element={
              <RequireAuth>
                <RouteErrorBoundary>
                  <Suspense fallback={<PageFallback />}>
                    <PassportPage />
                  </Suspense>
                </RouteErrorBoundary>
              </RequireAuth>
            }
          />
          <Route
            path="/users/:id/passport"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  <PassportPage />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/collections/:id"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  <CollectionPage />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/leaders"
            element={
              <RequireAuth>
                <RouteErrorBoundary>
                  <Suspense fallback={<PageFallback />}>
                    <LeadersPortalPage />
                  </Suspense>
                </RouteErrorBoundary>
              </RequireAuth>
            }
          />
          <Route
            path="/account"
            element={
              <RequireAuth>
                <RouteErrorBoundary>
                  <Suspense fallback={<PageFallback />}>
                    <AccountPage />
                  </Suspense>
                </RouteErrorBoundary>
              </RequireAuth>
            }
          />
          <Route
            path="/analytics"
            element={
              <RequireAuth>
                <RouteErrorBoundary>
                  <Suspense fallback={<PageFallback />}>
                    <AnalyticsDashboardPage />
                  </Suspense>
                </RouteErrorBoundary>
              </RequireAuth>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<PageFallback />}>
                <NotFoundPage />
              </Suspense>
            }
          />
        </Routes>
        <Footer />
        <MobileNav />
        <InstallPrompt />
      </div>
      <ToastContainer />
    </ToastProvider>
  );
};

export default App;
