import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import { ThemeProvider } from '@/store/ThemeContext';
import { YouTubePlayerProvider } from '@/store/YouTubePlayerContext';
import { YouTubePlayerModal } from '@/components/YouTubePlayerModal';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { AuthErrorScreen } from '@/components/auth/AuthErrorScreen';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const BookmarksPage = lazy(() => import('@/features/bookmarks/BookmarksPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function RouteLoading() {
  return (
    <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#7C5CFF] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, authStatus } = useAuth();

  if (authStatus === 'checking') {
    return <AuthLoadingScreen />;
  }

  if (!user || authStatus === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRouter() {
  const { authStatus, refreshUser } = useAuth();

  if (authStatus === 'checking') {
    return <AuthLoadingScreen />;
  }

  if (authStatus === 'error') {
    return <AuthErrorScreen onRetry={refreshUser} />;
  }

  return (
    <>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={authStatus === 'authenticated' ? <Navigate to="/app" replace /> : <LandingPage />} />
          <Route path="/login" element={authStatus === 'authenticated' ? <Navigate to="/app" replace /> : <LoginPage />} />
          <Route path="/signup" element={authStatus === 'authenticated' ? <Navigate to="/app" replace /> : <SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <HomePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace/:conversationId"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <HomePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookmarks"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <BookmarksPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <YouTubePlayerModal />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <YouTubePlayerProvider>
              <AppRouter />
            </YouTubePlayerProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}


