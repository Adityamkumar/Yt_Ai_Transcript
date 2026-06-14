import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ShowcaseSection } from '@/components/landing/ShowcaseSection';
import { Footer } from '@/components/landing/Footer';
import { useAuth } from '@/store/AuthContext';
import { TracingBeam } from '@/components/ui/tracing-beam';

function useOAuthReturn() {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const hasAttempted = useRef(false);

  useEffect(() => {
    const isOAuthReturn = sessionStorage.getItem('oauth_pending') === 'true';

    if (!isOAuthReturn) return;
    if (loading || user || hasAttempted.current) return;

    hasAttempted.current = true;
    sessionStorage.removeItem('oauth_pending');

    refreshUser().then(() => {
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
      style={{ background: 'var(--canvas)' }}
    >
      <Navbar />
      <main>
        <TracingBeam className="max-w-7xl px-6 md:px-16 lg:px-24">
          <HeroSection />
          <FeaturesSection />
          <ShowcaseSection />
        </TracingBeam>
      </main>
      <Footer />
    </div>
  );
}


