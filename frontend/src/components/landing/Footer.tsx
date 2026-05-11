import { Link } from 'react-router-dom';
import { Github, Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer
      className="relative py-12 sm:py-16"
      style={{
        background: '#050816',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7C5CFF] to-[#4DA2FF] flex items-center justify-center shadow-[0_0_12px_rgba(124,92,255,0.4)] group-hover:shadow-[0_0_20px_rgba(124,92,255,0.6)] transition-shadow duration-300">
                <Zap size={13} className="text-white" fill="white" />
              </div>
              <span className="text-[#F5F7FF] font-semibold text-sm tracking-tight">
                EchoMind <span className="text-[#7C5CFF]">AI</span>
              </span>
            </Link>
            <p className="text-xs text-[#94A3B8] max-w-[220px] text-center sm:text-left leading-relaxed">
              Turn any YouTube video into an intelligent conversation with AI.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/Adityamkumar/Yt_Ai_Transcript"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-[#F5F7FF] transition-colors duration-200"
              >
                <Github size={16} />
                GitHub
              </a>
              <Link
                to="/login"
                className="text-sm text-[#94A3B8] hover:text-[#F5F7FF] transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm text-[#7C5CFF] hover:text-[#9b7fff] transition-colors duration-200 font-medium"
              >
                Get Started
              </Link>
            </div>


          </div>
        </div>

        {/* Copyright */}
        <div
          className="mt-10 pt-6 text-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-xs text-[#94A3B8]/50">
            © {new Date().getFullYear()} EchoMind AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
