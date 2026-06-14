import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, Github, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { UserAvatar } from '@/components/auth/UserAvatar';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
  { label: 'Github', href: 'https://github.com/Adityamkumar/Yt_Ai_Transcript', icon: Github, external: true },
];


interface UserDropdownProps {
  name: string;
  email: string;
  avatar?: string;
  onLogout: () => void;
  onClose: () => void;
}

function UserDropdown({ name, email, avatar, onLogout, onClose }: UserDropdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute top-full right-0 mt-2 w-56 rounded-2xl overflow-hidden z-50"
      style={{
        background: 'rgba(11, 16, 32, 0.96)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,92,255,0.08)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {}
      <div className="px-4 py-3.5 border-b border-white/[0.07]">
        <div className="flex items-center gap-3">
          <UserAvatar name={name} avatar={avatar} size={38} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{name}</p>
            <p className="text-xs text-[#94A3B8] truncate">{email}</p>
          </div>
        </div>
      </div>

      {}
      <div className="p-1.5">
        <Link
          to="/app"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#94A3B8] hover:text-white hover:bg-white/[0.06] transition-colors duration-150"
        >
          <LayoutDashboard size={15} />
          Dashboard
        </Link>
        <button
          onClick={() => { onLogout(); onClose(); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#94A3B8] hover:text-red-400 hover:bg-red-500/[0.08] transition-colors duration-150"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </motion.div>
  );
}


export function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const navigateSection = (path: string) => {
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
            ? 'bg-[var(--canvas)]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C5CFF] to-[#4DA2FF] flex items-center justify-center shadow-[0_0_16px_rgba(124,92,255,0.5)] group-hover:shadow-[0_0_24px_rgba(124,92,255,0.7)] transition-shadow duration-300">
                <Zap size={16} className="text-white" fill="white" />
              </div>
              <span className="text-[#F5F7FF] font-semibold text-base tracking-tight">
                EchoMind <span className="text-[#7C5CFF]">AI</span>
              </span>
            </Link>

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
                    onClick={() => navigateSection(link.href)}
                    className="px-3.5 py-2 text-sm text-[#94A3B8] hover:text-[#F5F7FF] transition-colors duration-200 rounded-lg hover:bg-white/5"
                  >
                    {link.label}
                  </button>
                )
              ))}
            </nav>

            {}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <div ref={dropdownRef} className="relative">
                  <motion.button
                    id="user-menu-btn"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-2xl border border-white/[0.1] hover:border-white/[0.18] bg-white/[0.04] hover:bg-white/[0.07] transition-all duration-200"
                  >
                    <UserAvatar name={user.name} avatar={user.avatar} size={30} />
                    <span className="text-sm font-medium text-[#E2E8F0] max-w-[120px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <motion.div
                      animate={{ rotate: dropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={14} className="text-[#94A3B8]" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <UserDropdown
                        name={user.name}
                        email={user.email}
                        avatar={user.avatar}
                        onLogout={logout}
                        onClose={() => setDropdownOpen(false)}
                      />
                    )}
                  </AnimatePresence>
                </div>
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

            {}
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

      {}
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

              {}
              {user && (
                <div className="mx-4 mb-2 px-3 py-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex items-center gap-3">
                  <UserAvatar name={user.name} avatar={user.avatar} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-[#94A3B8] truncate">{user.email}</p>
                  </div>
                </div>
              )}

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
                        onClick={() => navigateSection(link.href)}
                        className="w-full text-left flex items-center px-4 py-3 text-sm text-[#94A3B8] hover:text-[#F5F7FF] hover:bg-white/5 rounded-lg transition-colors duration-200"
                      >
                        {link.label}
                      </button>
                    )}
                  </motion.div>
                ))}
              </nav>

              <div className="p-4 border-t border-[rgba(255,255,255,0.06)] flex flex-col gap-2">
                {user ? (
                  <>
                    <Link
                      to="/app"
                      className="w-full text-center py-2.5 text-sm text-[#94A3B8] hover:text-[#F5F7FF] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] rounded-lg transition-all duration-200"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-center py-2.5 text-sm text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 rounded-lg transition-all duration-200"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

