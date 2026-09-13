import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import { LumoraLogo } from '@/components/ui/LumoraLogo';

export function Footer() {
  return (
    <footer className="relative mx-auto -mt-px w-full max-w-[1216px] border-x border-t border-[var(--border-soft)] bg-[#07080c]">
      <div className="grid grid-cols-1 md:grid-cols-4">
        {/* Brand */}
        <div className="border-b border-[var(--border-soft)] p-6 sm:p-8 md:min-h-[250px] md:border-b-0 md:border-r">
          <Link to="/" className="inline-flex items-center">
            <LumoraLogo size="sm" />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-[var(--text-secondary)]">
            Turn videos and documents into clear, useful knowledge.
          </p>
        </div>

        {/* Resources */}
        <div className="border-b border-[var(--border-soft)] p-6 sm:p-8 md:min-h-[250px] md:border-b-0 md:border-r">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Resources</h2>
          <nav className="mt-4 flex flex-col items-start gap-4" aria-label="Resources">
            <a
              href="https://github.com/Adityamkumar/Yt_Ai_Transcript"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-white"
            >
              <Github size={14} />
              GitHub Repository
            </a>
          </nav>
        </div>

        {/* Workspace */}
        <div className="border-b border-[var(--border-soft)] p-6 sm:p-8 md:min-h-[250px] md:border-b-0 md:border-r">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Workspace Chrome</h2>
          <nav className="mt-4 flex flex-col items-start gap-4" aria-label="Workspace">
            <Link to="/login" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-white">
              Login to Session
            </Link>
            <Link to="/signup" className="text-sm font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]">
              Create New Account
            </Link>
          </nav>
        </div>

        {/* Legal */}
        <div className="p-6 sm:p-8 md:min-h-[250px]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Legal</h2>
          <nav className="mt-4 flex flex-col items-start gap-4" aria-label="Legal">
            <Link to="/privacy" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-white">
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>

      <div className="border-t border-[var(--border-soft)] px-6 py-4 text-center text-xs text-[var(--text-muted)] sm:px-8 sm:py-5">
        &copy; {new Date().getFullYear()} Lumora. Crafted for learning.
      </div>
    </footer>
  );
}
