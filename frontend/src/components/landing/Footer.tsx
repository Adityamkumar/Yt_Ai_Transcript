import { Link } from 'react-router-dom';
import { Github, Zap } from 'lucide-react';

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
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C5CFF] to-[#4DA2FF] flex items-center justify-center shadow-[0_0_12px_rgba(124,92,255,0.4)] group-hover:shadow-[0_0_20px_rgba(124,92,255,0.6)] transition-shadow duration-300">
                <Zap size={14} className="text-white" fill="white" />
              </div>
              <span className="text-[#F5F7FF] font-semibold text-sm tracking-tight">
                EchoMind <span className="text-[#7C5CFF]">AI</span>
              </span>
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
          <span>&copy; {new Date().getFullYear()} EchoMind AI. Crafted for learning.</span>
        </div>

      </div>
    </footer>
  );
}
