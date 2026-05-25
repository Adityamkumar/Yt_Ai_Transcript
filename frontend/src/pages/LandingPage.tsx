import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ShowcaseSection } from '@/components/landing/ShowcaseSection';
import { Footer } from '@/components/landing/Footer';
import { useAuth } from '@/store/AuthContext';

/**
 * useOAuthReturn — detects when the browser returns from a Google OAuth redirect
 * and automatically signs the user in.
 *
 * How it works:
 * 1. Before redirecting to Google, loginWithGoogle() sets sessionStorage 'oauth_pending'.
 *    sessionStorage survives same-tab full-page redirects (Google → backend → frontend).
 * 2. On LandingPage mount, if 'oauth_pending' is set, we know this is a real OAuth return.
 *    We clear the flag and call refreshUser() — the cookies are already set by the backend.
 * 3. On success, navigate to /app.
 * 4. On normal anonymous visits, 'oauth_pending' is never set, so nothing happens.
 */
function useOAuthReturn() {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const hasAttempted = useRef(false);

  useEffect(() => {
    // Only act if this is a confirmed OAuth return
    const isOAuthReturn = sessionStorage.getItem('oauth_pending') === 'true';

    if (!isOAuthReturn) return;
    if (loading || user || hasAttempted.current) return;

    hasAttempted.current = true;
    // Clear the flag immediately so it doesn't fire again on remount
    sessionStorage.removeItem('oauth_pending');

    refreshUser().then(() => {
      // refreshUser() sets localStorage 'isAuthenticated' on success
      if (localStorage.getItem('isAuthenticated') === 'true') {
        navigate('/app', { replace: true });
      }
    });
  }, [loading, user, refreshUser, navigate]);
}

export default function LandingPage() {
  useOAuthReturn();

  return (
    <div
      className="min-h-screen text-[#F5F7FF] overflow-x-hidden"
      style={{ background: '#050816' }}
    >
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ShowcaseSection />
      </main>
      <Footer />
    </div>
  );
}
