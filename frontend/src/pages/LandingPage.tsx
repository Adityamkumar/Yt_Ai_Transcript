import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ShowcaseSection } from '@/components/landing/ShowcaseSection';
import { TrustSection } from '@/components/landing/TrustSection';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
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
        <TrustSection />
      </main>
      <Footer />
    </div>
  );
}
