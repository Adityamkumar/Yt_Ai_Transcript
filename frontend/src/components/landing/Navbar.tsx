import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Github, LayoutDashboard, LogOut, ChevronDown, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { UserAvatar } from '@/components/auth/UserAvatar';
import { LogoutModal } from '@/components/LogoutModal';
import { LumoraLogo } from '@/components/ui/LumoraLogo';

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
      className="absolute top-full right-0 mt-2 w-56 rounded-2xl overflow-hidden z-50 border border-[var(--border-medium)] bg-[var(--surface-1)] shadow-2xl backdrop-blur-xl"
    >
      <div className="px-4 py-3.5 border-b border-[var(--border-soft)]">
        <div className="flex items-center gap-3">
          <UserAvatar name={name} avatar={avatar} size={38} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{name}</p>
            <p className="text-xs text-[var(--text-secondary)] truncate">{email}</p>
          </div>
        </div>
      </div>

      <div className="p-1.5">
        <Link
          to="/app"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors duration-150"
        >
          <LayoutDashboard size={15} />
          Dashboard
        </Link>
        <button
          onClick={() => { onLogout(); onClose(); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/[0.08] transition-colors duration-150"
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
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navbarScrolled = scrolled && !isMobile;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
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
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 bg-[#07080c]"
      >
        <div className="mx-auto h-16 w-full max-w-[1216px] border-x border-b border-[var(--border-soft)] px-4 sm:h-[72px] sm:w-[calc(100%-2rem)] sm:px-6 lg:px-8">
          <motion.div
            animate={{
              width: navbarScrolled ? 'calc(100% - 4rem)' : '100%',
              maxWidth: navbarScrolled ? 940 : 1216,
              y: navbarScrolled ? 10 : 0,
            }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`mx-auto ${
              navbarScrolled ? 'rounded-full border border-[var(--border-soft)] bg-[rgba(8,9,12,0.84)] shadow-[0_18px_50px_rgba(0,0,0,0.32)] backdrop-blur-2xl' : ''
            }`}
          >
            <div className={`relative flex items-center justify-between px-3 transition-[height,padding] duration-200 sm:px-4 lg:px-5 ${
              navbarScrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-[72px]'
            }`}>
            <Link to="/" onClick={handleLogoClick} className="group flex flex-shrink-0 items-center">
              <LumoraLogo size={navbarScrolled ? 'sm' : 'md'} />
            </Link>

            <nav className={`absolute left-1/2 hidden -translate-x-1/2 items-center rounded-full border border-[var(--border-soft)] bg-[rgba(255,255,255,0.025)] md:flex ${
              navbarScrolled ? 'gap-0 p-0.5' : 'gap-0.5 p-1'
            }`}>
              {navLinks.map((link) => (
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1 rounded-full font-medium text-[var(--text-secondary)] transition-all duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] ${
                      navbarScrolled ? 'px-3 py-1.5 text-xs' : 'gap-1.5 px-3.5 py-2 text-[13px]'
                    }`}
                  >
                    {link.icon && <link.icon size={14} />}
                    {link.label}
                  </a>
                ) : (
                  <button
                    key={link.label}
                    onClick={() => navigateSection(link.href)}
                    className={`rounded-full font-medium text-[var(--text-secondary)] transition-all duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] ${
                      navbarScrolled ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-[13px]'
                    }`}
                  >
                    {link.label}
                  </button>
                )
              ))}
            </nav>

            <div className={`hidden items-center md:flex ${navbarScrolled ? 'gap-1' : 'gap-2'}`}>
              
              {user ? (
                <div ref={dropdownRef} className="relative">
                  <motion.button
                    id="user-menu-btn"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-3)] hover:bg-[var(--surface-hover)] transition-all duration-200"
                  >
                    <UserAvatar name={user.name} avatar={user.avatar} size={30} />
                    <span className="text-sm font-medium text-[var(--text-primary)] max-w-[120px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <motion.div
                      animate={{ rotate: dropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={14} className="text-[var(--text-secondary)]" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <UserDropdown
                        name={user.name}
                        email={user.email}
                        avatar={user.avatar}
                        onLogout={() => setLogoutOpen(true)}
                        onClose={() => setDropdownOpen(false)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`rounded-full font-medium text-[var(--text-secondary)] transition-all duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] ${
                      navbarScrolled ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className={`group relative inline-flex items-center overflow-hidden rounded-full border border-[rgba(199,204,255,0.22)] bg-[var(--accent)] font-semibold text-[#08090c] shadow-[0_8px_24px_rgba(157,165,255,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] hover:shadow-[0_12px_30px_rgba(157,165,255,0.3)] ${
                      navbarScrolled ? 'gap-1 px-3 py-1.5 text-xs' : 'gap-1.5 px-4 py-2 text-sm'
                    }`}
                  >
                    <span className="relative">Get started</span>
                    <ArrowUpRight size={navbarScrolled ? 12 : 14} className="relative transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </>
              )}
            </div>

            <button
              id="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-full border border-[var(--border-soft)] p-2 text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] md:hidden"
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
          </motion.div>
        </div>
      </motion.header>

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
              className="fixed bottom-0 right-0 top-0 z-50 flex w-80 max-w-[calc(100vw-1rem)] flex-col border-l border-[var(--border-medium)] bg-[rgba(8,9,12,0.96)] shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex h-16 items-center justify-between border-b border-[var(--border-soft)] px-5">
                <div className="flex items-center gap-2">
                  <button onClick={() => setMobileOpen(false)} className="rounded-full p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {user && (
                <div className="mx-4 my-4 mb-2 px-3 py-3 rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-3)] flex items-center gap-3">
                  <UserAvatar name={user.name} avatar={user.avatar} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{user.email}</p>
                  </div>
                </div>
              )}

              <nav className="flex flex-1 flex-col gap-1 p-4">
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
                        className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                      >
                        {link.icon && <link.icon size={15} />}
                        {link.label}
                      </a>
                    ) : (
                      <button
                        onClick={() => navigateSection(link.href)}
                        className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                      >
                        {link.label}
                      </button>
                    )}
                  </motion.div>
                ))}
              </nav>

              <div className="flex flex-col gap-2 border-t border-[var(--border-soft)] p-4">
                {user ? (
                  <>
                    <Link
                      to="/app"
                      className="w-full rounded-xl border border-[var(--border-medium)] py-2.5 text-center text-sm text-[var(--text-secondary)] transition-all duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { setLogoutOpen(true); setMobileOpen(false); }}
                      className="w-full rounded-xl border border-red-500/20 py-2.5 text-center text-sm text-red-400 transition-all duration-200 hover:bg-red-500/[0.04] hover:text-red-300"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="w-full rounded-xl border border-[var(--border-medium)] py-2.5 text-center text-sm text-[var(--text-secondary)] transition-all duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="group relative flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-xl border border-[rgba(199,204,255,0.22)] bg-[var(--accent)] py-2.5 text-center text-sm font-semibold text-[#08090c] transition-all duration-200 hover:bg-[var(--accent-strong)]"
                    >
                      <span className="relative">Get started free</span>
                      <ArrowUpRight size={14} className="relative transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <LogoutModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={logout}
      />
    </>
  );
}
