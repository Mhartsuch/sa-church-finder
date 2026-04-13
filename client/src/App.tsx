import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { ToastContainer } from '@/components/layout/Toast';
import { ToastProvider } from '@/hooks/useToast';

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

const PageFallback = () => (
  <div className="flex flex-1 items-center justify-center py-20">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
  </div>
);

const App = () => {
  return (
    <ToastProvider>
      <div className="mobile-nav-spacer flex min-h-screen flex-col bg-background">
        <OfflineBanner />
        <ScrollToTop />
        <Header />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/events" element={<EventsDiscoveryPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/churches/:slug" element={<ChurchProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/help-center" element={<HelpCenterPage />} />
            <Route path="/safety-information" element={<SafetyInformationPage />} />
            <Route path="/accessibility" element={<AccessibilityPage />} />
            <Route path="/report-a-concern" element={<ReportConcernPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />
            <Route
              path="/leaders"
              element={
                <RequireAuth>
                  <LeadersPortalPage />
                </RequireAuth>
              }
            />
            <Route
              path="/account"
              element={
                <RequireAuth>
                  <AccountPage />
                </RequireAuth>
              }
            />
          </Routes>
        </Suspense>
        <Footer />
        <MobileNav />
      </div>
      <ToastContainer />
    </ToastProvider>
  );
};

export default App;
