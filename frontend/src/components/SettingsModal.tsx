import { AnimatePresence, motion } from 'framer-motion';
import { Settings, X, User, Mail, Shield, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { useState } from 'react';
import { DeleteAccountModal } from './DeleteAccountModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 420, damping: 30, delay: 0.05 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
};

export function SettingsModal({ isOpen, onClose }: Props) {
  const { user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0e1019]/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.1] bg-white/[0.06] text-[var(--text-secondary)]">
                    <Settings size={17} className="animate-[spin_8s_linear_infinite]" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-white">Settings</h2>
                    <p className="text-xs text-[var(--text-muted)]">Manage your account</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Profile section */}
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Profile
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">
                      <User size={16} className="shrink-0 text-[var(--text-muted)]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-[var(--text-muted)]">Name</p>
                        <p className="truncate text-sm font-medium text-white">{user?.name || 'Guest'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">
                      <Mail size={16} className="shrink-0 text-[var(--text-muted)]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-[var(--text-muted)]">Email</p>
                        <p className="truncate text-sm font-medium text-white">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400/80">
                    <Shield size={12} />
                    Danger Zone
                  </h3>
                  <div className="rounded-xl border border-red-500/15 bg-red-500/[0.04] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} className="shrink-0 text-red-400" />
                          <p className="text-sm font-medium text-white">Delete Account</p>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          setShowDeleteModal(true);
                        }}
                        className="group flex shrink-0 items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-all hover:border-red-500/30 hover:bg-red-500/20 hover:text-red-300 hover:shadow-lg hover:shadow-red-500/5 active:scale-[0.97]"
                      >
                        <Trash2 size={14} className="transition-transform group-hover:scale-110" />
                        <span>Delete Account</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/[0.07] px-6 py-3">
                <p className="text-center text-[11px] text-[var(--text-muted)]">
                  EchoMind AI · v1.0
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </>
  );
}
