import { Routes, Route } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { Header } from '@/components/layout/Header';
import HomePage from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { ChurchProfilePage } from '@/pages/ChurchProfilePage';
import AccountPage from '@/pages/AccountPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';

const App = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#fffdfb]">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/churches/:slug" element={<ChurchProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
