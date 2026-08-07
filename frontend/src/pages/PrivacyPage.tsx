import { Link } from 'react-router-dom';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
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
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-xs font-mono text-[var(--text-muted)] mt-1">Last Updated: June 21, 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-sm text-[var(--text-secondary)] leading-relaxed">
          <section className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-soft)] rounded-2xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              Welcome to Lumora ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your data when you use our YouTube transcript extractor and learning assistant platform.
            </p>
          </section>

          <section className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-soft)] rounded-2xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-3">2. Information We Collect</h2>
            <p className="mb-4">
              We collect information to provide better services to all our users. The types of personal information we collect include:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Credentials:</strong> When you sign up, we collect your name, email address, password, or authentication credentials from third-party login providers (such as Google OAuth).</li>
              <li><strong>Usage Data:</strong> We may save YouTube URLs, PDF documents, conversation history, and user queries submitted to our AI models to provide persistent workspaces and contextual history.</li>
              <li><strong>Cookies:</strong> We use secure, HTTP-only cookies to handle user sessions, token expiry, and user preferences.</li>
            </ul>
          </section>

          <section className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-soft)] rounded-2xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <p className="mb-4">
              We use the collected information for various operational and product improvement purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To initialize, run, and maintain your personal workspace and database.</li>
              <li>To retrieve relevant transcript fragments and PDF context matching your AI learning queries.</li>
              <li>To personalize your chat experience, save bookmarks, and handle authentication redirects.</li>
              <li>To analyze platform security, prevent abuse, and troubleshoot technical operations.</li>
            </ul>
          </section>

          <section className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-soft)] rounded-2xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-3">4. Sharing and Disclosure</h2>
            <p>
              Lumora does not sell, lease, or trade your personal data. We only pass relevant text chunks to third-party generative AI models (such as Gemini) to fulfill your query requests. We ensure no proprietary or sensitive configuration settings are exposed to external entities.
            </p>
          </section>

          <section className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-soft)] rounded-2xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-3">5. Data Security</h2>
            <p>
              We implement industry-standard administrative, physical, and electronic security measures to safeguard your personal data against accidental loss, unauthorized access, alteration, or disclosure. However, no internet-based network transmission is completely secure, and we cannot guarantee absolute data protection.
            </p>
          </section>

          <section className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-soft)] rounded-2xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-3">6. Your Rights</h2>
            <p>
              You have the right to request deletion of your account and associated conversations or workspace documents. To purge your user logs, delete your documents and clear your chat history directly within the workspace interface, or contact our support team.
            </p>
          </section>

          <section className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-soft)] rounded-2xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-3">7. Contact Us</h2>
            <p>
              If you have any questions or suggestions regarding this Privacy Policy, please contact us at: <a href="mailto:adityasharma841460@gmail.com" className="text-[#7C5CFF] hover:underline">adityasharma841460@gmail.com</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
