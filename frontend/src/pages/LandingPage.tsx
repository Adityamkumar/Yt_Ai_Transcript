import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ShowcaseSection } from '@/components/landing/ShowcaseSection';
import { Footer } from '@/components/landing/Footer';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export default function LandingPage() {
  useAuthRedirect();

  return (
    <div className="min-h-screen overflow-x-hidden text-[#F5F7FF]">
      <Navbar />
      <main>
        <HeroSection />
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24">
          <FeaturesSection />
          <ShowcaseSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}




