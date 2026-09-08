import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MailCheck, X } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { WorkspaceActions } from '@/components/workspace-actions/WorkspaceActions';
import { SearchModal } from '@/components/search/SearchModal';
import { useUIStore } from '@/store/useUIStore';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { WorkspaceAction } from '@/components/workspace-actions/workspaceActionConfig';
import { useAuth } from '@/store/AuthContext';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';
import { EMAIL_VERIFICATION_REQUIRED_EVENT } from '@/lib/axios';
import { useResendEmailVerificationRateLimit } from '@/hooks/useResendEmailVerificationRateLimit';

interface AppLayoutProps {
  children: React.ReactNode;
}

function EmailVerificationPrompt() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { resendState, cooldownSeconds, isDisabled, setLoading, reset, handleRateLimitError } = useResendEmailVerificationRateLimit();

  useEffect(() => {
    if (!user || user.isEmailVerified) {
      setIsOpen(false);
      return;
    }

    const promptKey = `email-verification-prompt:${user.id}`;
    if (!sessionStorage.getItem(promptKey)) {
      setIsOpen(true);
    }
  }, [user]);

  useEffect(() => {
    const openForProtectedFeature = () => {
      if (user && !user.isEmailVerified) {
        setIsOpen(true);
      }
    };

    window.addEventListener(EMAIL_VERIFICATION_REQUIRED_EVENT, openForProtectedFeature);
    return () => window.removeEventListener(EMAIL_VERIFICATION_REQUIRED_EVENT, openForProtectedFeature);
  }, [user]);

  const close = () => {
    if (user) sessionStorage.setItem(`email-verification-prompt:${user.id}`, 'dismissed');
    setIsOpen(false);
  };

  const handleVerify = async () => {
    if (!user || isDisabled) return;

    setLoading();
    try {
      await authService.resendEmailVerification(user.email);
      sessionStorage.setItem(`email-verification-prompt:${user.id}`, 'dismissed');
      navigate('/verify-email', { state: { email: user.email, resendCooldownUntil: Date.now() + 60_000 } });
    } catch (error) {
      if (!handleRateLimitError(error)) {
        toast.error("We couldn't send another verification email. Please try again.");
        reset();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && !user?.isEmailVerified && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm" onClick={close} aria-label="Maybe later" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-verification-title"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="relative w-full max-w-md rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-1)] p-6 shadow-2xl shadow-black/40"
          >
            <button onClick={close} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-white/[0.06] hover:text-white" aria-label="Maybe later">
              <X size={17} aria-hidden="true" />
            </button>
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
              <MailCheck size={21} aria-hidden="true" />
            </div>
            <h2 id="email-verification-title" className="mt-4 text-lg font-semibold tracking-tight text-white">Your email isn&apos;t verified yet</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Verify your email to unlock Lumora features and start using your workspace.</p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={close} className="rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-white/[0.06] hover:text-white">Maybe later</button>
              <button type="button" onClick={handleVerify} disabled={isDisabled} className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60">
                {resendState === 'loading' ? 'Sending email...' : 'Verify email'}
              </button>
            </div>
            {resendState === 'cooldown' && <p className="mt-3 text-xs text-[var(--text-muted)]">Available again in {cooldownSeconds}s</p>}
            {resendState === 'hourly_limit' && <p className="mt-3 text-xs font-medium leading-relaxed" style={{ color: '#ff4d4f' }}>Too many Email verification attempts. Please try again in 1 hour.</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const { toggleSidebar, setSidebarOpen } = useUIStore();
  const actionTriggerRef = useRef<((action: WorkspaceAction) => void) | null>(null);

  const handleNewChat = useCallback(() => {
    navigate('/app');
  }, [navigate]);

  const handleActionReady = useCallback((trigger: (action: WorkspaceAction) => void) => {
    actionTriggerRef.current = trigger;
  }, []);

  const handleWorkspaceAction = useCallback((action: WorkspaceAction) => {
    actionTriggerRef.current?.(action);
  }, []);

  // ── Search modal state ──
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useKeyboardShortcut({ key: 'b', ctrl: true }, toggleSidebar);
  useKeyboardShortcut({ key: 'n', ctrl: true }, handleNewChat);
  useKeyboardShortcut({ key: 'k', ctrl: true }, openSearch);
  useKeyboardShortcut({ key: 'k', meta: true }, openSearch);

  useEffect(() => {
    const syncSidebarToViewport = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };

    syncSidebarToViewport();
    window.addEventListener('resize', syncSidebarToViewport);
    return () => window.removeEventListener('resize', syncSidebarToViewport);
  }, [setSidebarOpen]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
  }, []);


  const workspaceActionsNode = (
    <WorkspaceActions onAction={handleWorkspaceAction} />
  );

  return (
    <div className="app-shell">
      <Sidebar onNewChat={handleNewChat} />

      <div className="app-main">
        <Header onNewChat={handleNewChat} onSearchOpen={openSearch} workspaceActions={workspaceActionsNode} />
        <main className="app-scroll">
          {React.isValidElement(children)
            ? React.cloneElement(children as React.ReactElement<any>, { onActionReady: handleActionReady })
            : children}
        </main>
      </div>

      <SearchModal isOpen={searchOpen} onClose={closeSearch} />
      <EmailVerificationPrompt />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface-1)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            fontSize: '13px',
            backdropFilter: 'blur(16px)',
          },
        }}
      />
    </div>
  );
}
