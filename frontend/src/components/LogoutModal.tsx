import { AnimatePresence, motion } from "framer-motion";
import { Loader2, LogOut, X } from "lucide-react";
import { useState } from "react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 380,
      damping: 28,
      delay: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 16,
    transition: { duration: 0.18 },
  },
};

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleClose = () => {
    if (isLoggingOut) return;
    onClose();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onConfirm();
    } catch (error) {
      setIsLoggingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop Blur */}
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border-medium)] bg-[#0e1019]/98 shadow-2xl backdrop-blur-xl"
          >
            {/* Top gradient line */}
            <div className="h-1 w-full bg-gradient-to-r from-[var(--accent)] via-[#6B9EF7] to-[#7C5CFF]" />

            {/* Header */}
            <div className="px-6 pt-5 pb-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-subtle)]">
                    <LogOut size={18} className="text-[var(--accent)]" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-white">
                      Sign Out
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      Confirm logout from account
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoggingOut}
                  className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                Are you sure you want to sign out of your Lumora account? You will need to log back in to access your workspace conversations and bookmarks.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 border-t border-white/[0.07] px-6 py-4">
              <button
                onClick={handleClose}
                disabled={isLoggingOut}
                className="flex-1 rounded-xl border border-white/[0.1] bg-white/[0.04] py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-white/[0.08] hover:text-white disabled:opacity-50 active:scale-[0.97]"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white hover:bg-neutral-200 py-2.5 text-sm font-semibold text-neutral-900 transition-all disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.97]"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-neutral-900" />
                    <span>Signing out…</span>
                  </>
                ) : (
                  <span>Sign Out</span>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
