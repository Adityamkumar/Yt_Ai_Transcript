import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, Github } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
  { label: 'Github', href: 'https://github.com/Adityamkumar/Yt_Ai_Transcript', icon: Github, external: true },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navigate = (path: string) => {
    if (location.pathname !== '/') {
      window.location.href = '/' + path;
    } else {
      const el = document.querySelector(path);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[rgba(5,8,22,0.85)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C5CFF] to-[#4DA2FF] flex items-center justify-center shadow-[0_0_16px_rgba(124,92,255,0.5)] group-hover:shadow-[0_0_24px_rgba(124,92,255,0.7)] transition-shadow duration-300">
                <Zap size={16} className="text-white" fill="white" />
              </div>
              <span className="text-[#F5F7FF] font-semibold text-base tracking-tight">
                EchoMind <span className="text-[#7C5CFF]">AI</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 text-sm text-[#94A3B8] hover:text-[#F5F7FF] transition-colors duration-200 rounded-lg hover:bg-white/5"
                  >
                    {link.icon && <link.icon size={14} />}
                    {link.label}
                  </a>
                ) : (
                  <button
                    key={link.label}
                    onClick={() => navigate(link.href)}
                    className="px-3.5 py-2 text-sm text-[#94A3B8] hover:text-[#F5F7FF] transition-colors duration-200 rounded-lg hover:bg-white/5"
                  >
                    {link.label}
                  </button>
                )
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    to="/app"
                    className="px-4 py-2 text-sm text-[#94A3B8] hover:text-[#F5F7FF] transition-colors duration-200 rounded-lg hover:bg-white/5"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="relative px-4 py-2 text-sm font-medium text-white rounded-lg overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-white/10 group-hover:bg-white/15 transition-colors duration-200" />
                    <span className="relative">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm text-[#94A3B8] hover:text-[#F5F7FF] transition-colors duration-200 rounded-lg hover:bg-white/5"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="relative px-4 py-2 text-sm font-medium text-white rounded-lg overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#7C5CFF] to-[#4DA2FF] opacity-100 group-hover:opacity-90 transition-opacity duration-200" />
                    <span className="absolute inset-0 bg-gradient-to-r from-[#7C5CFF] to-[#4DA2FF] blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
                    <span className="relative">Get Started</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-[#94A3B8] hover:text-[#F5F7FF] hover:bg-white/5 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X size={20} />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#0B1020] border-l border-[rgba(255,255,255,0.08)] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 h-16">
                <span className="text-[#F5F7FF] font-semibold text-sm">EchoMind <span className="text-[#7C5CFF]">AI</span></span>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg text-[#94A3B8] hover:bg-white/5 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <nav className="flex flex-col gap-1 p-4 flex-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                  >
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#94A3B8] hover:text-[#F5F7FF] hover:bg-white/5 rounded-lg transition-colors duration-200"
                      >
                        {link.icon && <link.icon size={15} />}
                        {link.label}
                      </a>
                    ) : (
                      <button
                        onClick={() => navigate(link.href)}
                        className="w-full text-left flex items-center px-4 py-3 text-sm text-[#94A3B8] hover:text-[#F5F7FF] hover:bg-white/5 rounded-lg transition-colors duration-200"
                      >
                        {link.label}
                      </button>
                    )}
                  </motion.div>
                ))}
              </nav>
              <div className="p-4 border-t border-[rgba(255,255,255,0.06)] flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full text-center py-2.5 text-sm text-[#94A3B8] hover:text-[#F5F7FF] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] rounded-lg transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="relative w-full text-center py-2.5 text-sm font-medium text-white rounded-lg overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[#7C5CFF] to-[#4DA2FF]" />
                  <span className="relative">Get Started Free</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
