import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ShowcaseSection } from '@/components/landing/ShowcaseSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { Footer } from '@/components/landing/Footer';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export default function LandingPage() {
  useAuthRedirect();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07080c] text-[#F5F7FF]">
      <Navbar />
      <main className="bg-[#07080c]">
        <div className="mx-auto max-w-[1216px] overflow-hidden border-x border-[var(--border-soft)] bg-[#07080c]">
          <HeroSection />
          <FeaturesSection />
          <ShowcaseSection />
          <TestimonialsSection />
          <FinalCTASection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
