import { Routes, Route } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { ToastContainer } from '@/components/layout/Toast';
import { ToastProvider } from '@/hooks/useToast';
import HomePage from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { ChurchProfilePage } from '@/pages/ChurchProfilePage';
import AccountPage from '@/pages/AccountPage';
import ComparePage from '@/pages/ComparePage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import HelpCenterPage from '@/pages/HelpCenterPage';
import SafetyInformationPage from '@/pages/SafetyInformationPage';
import AccessibilityPage from '@/pages/AccessibilityPage';
import ReportConcernPage from '@/pages/ReportConcernPage';
import PrivacyPage from '@/pages/PrivacyPage';
import TermsPage from '@/pages/TermsPage';
import SitemapPage from '@/pages/SitemapPage';
import LeadersPortalPage from '@/pages/LeadersPortalPage';

const App = () => {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/compare" element={<ComparePage />} />
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
        <Footer />
        <MobileNav />
      </div>
      <ToastContainer />
    </ToastProvider>
  );
};

export default App;
