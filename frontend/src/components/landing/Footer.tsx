import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import { LumoraLogo } from '@/components/ui/LumoraLogo';

export function Footer() {
  return (
    <footer
      className="relative py-12 sm:py-16"
      style={{
        background: 'var(--canvas)',
        borderTop: '1px solid var(--border-soft)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand Left Column */}
          <div className="md:col-span-6 flex flex-col items-start gap-3.5">
            <Link to="/" className="flex items-center">
              <LumoraLogo size="sm" />
            </Link>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed">
              A minimalist, AI-powered knowledge operating system. Extract, map, and converse with video and document databases.
            </p>

          </div>

          {/* Links Middle Columns */}
          <div className="md:col-span-3 flex flex-col items-start gap-3">
            <span className="text-[10px] font-mono font-bold tracking-wider text-[var(--text-muted)] uppercase">Resources</span>
            <a
              href="https://github.com/Adityamkumar/Yt_Ai_Transcript"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              <Github size={13} />
              GitHub Repository
            </a>
            <a
              href="https://github.com/Adityamkumar/Yt_Ai_Transcript/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              Issue Tracker
            </a>
          </div>

          <div className="md:col-span-3 flex flex-col items-start gap-3">
            <span className="text-[10px] font-mono font-bold tracking-wider text-[var(--text-muted)] uppercase">Workspace Chrome</span>
            <Link
              to="/login"
              className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              Login to Session
            </Link>
            <Link
              to="/signup"
              className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)] transition-colors"
            >
              Create New Account
            </Link>
          </div>

        </div>

        {/* Copyright divider block */}
        <div
          className="mt-12 pt-6 text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-[var(--text-muted)]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span>&copy; {new Date().getFullYear()} Lumora. Crafted for learning.</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
