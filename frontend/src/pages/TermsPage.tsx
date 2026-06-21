import { Link } from 'react-router-dom';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div
      className="min-h-screen text-[#F5F7FF] overflow-x-hidden flex flex-col"
      style={{ background: 'var(--canvas)' }}
    >
      <Navbar />
      
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 md:py-20 w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#4DA2FF] flex items-center justify-center shadow-[0_0_15px_rgba(124,92,255,0.3)]">
            <FileText size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-xs font-mono text-[var(--text-muted)] mt-1">Last Updated: June 21, 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-sm text-[var(--text-secondary)] leading-relaxed">
          <section className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-soft)] rounded-2xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using EchoMind AI ("Service"), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not access or use the Service.
            </p>
          </section>

          <section className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-soft)] rounded-2xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-3">2. Description of Service</h2>
            <p>
              EchoMind AI is a learning workspace tool that allows users to fetch and store YouTube transcripts, parse PDF documents, index content for vector search, and run semantic queries using generative AI models.
            </p>
          </section>

          <section className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-soft)] rounded-2xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-3">3. User Obligations</h2>
            <p className="mb-4">
              When using the Service, you agree to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide accurate credentials and login details when registering via email or Google OAuth.</li>
              <li>Only query and analyze videos or PDF documents that you are legally authorized to access.</li>
              <li>Not use the Service for any illegal, harmful, or abusive scraping/automated queries that violate YouTube's or our service providers' policies.</li>
            </ul>
          </section>

          <section className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-soft)] rounded-2xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-3">4. Intellectual Property</h2>
            <p>
              All core platform designs, systems, codebase, trademarks, and brand assets of EchoMind AI are the intellectual property of EchoMind AI. User-supplied documents, transcripts, and chat conversation logs remain the property of the respective user.
            </p>
          </section>

          <section className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-soft)] rounded-2xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-3">5. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "as is" and "as available" without any warranty of any kind, either express or implied. We do not guarantee that the Service will be completely error-free, uninterrupted, or that AI models will return 100% accurate responses.
            </p>
          </section>

          <section className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-soft)] rounded-2xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-3">6. Limitation of Liability</h2>
            <p>
              Under no circumstances shall EchoMind AI or its developers be liable for any indirect, incidental, special, or consequential damages arising out of the use or inability to use the Service.
            </p>
          </section>

          <section className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-soft)] rounded-2xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-3">7. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Your continued use of the Service following any modifications constitutes your acceptance of the revised terms.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
