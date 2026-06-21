import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ShowcaseSection } from '@/components/landing/ShowcaseSection';
import { Footer } from '@/components/landing/Footer';
import { TracingBeam } from '@/components/ui/tracing-beam';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export default function LandingPage() {
  useAuthRedirect();

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


