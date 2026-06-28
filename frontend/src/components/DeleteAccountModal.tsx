import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  X,
  Info,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/store/AuthContext";
import toast from "react-hot-toast";

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

const shakeVariants = {
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.5 },
  },
};

export function DeleteAccountModal({ isOpen, onClose }: Props) {
  const { user, deleteAccount } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [shouldShake, setShouldShake] = useState(false);

  const requiresPassword = user?.hasPassword;

  const handleClose = () => {
    if (isDeleting) return;
    setPassword("");
    setError("");
    setShowPassword(false);
    setShouldShake(false);
    onClose();
  };

  const handleDelete = async () => {
    if (requiresPassword && !password.trim()) {
      setError("Please enter your password");
      triggerShake();
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await deleteAccount(!requiresPassword ? undefined : password);
      toast.success("Account deleted successfully");
    } catch (err: any) {
      const message = err?.message || "Failed to delete account";
      setError(message);
      triggerShake();
    } finally {
      setIsDeleting(false);
    }
  };

  const triggerShake = () => {
    setShouldShake(true);
    setTimeout(() => setShouldShake(false), 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isDeleting) {
      handleDelete();
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
          {}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={handleClose}
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border-medium)] bg-[#0e1019]/98 shadow-2xl backdrop-blur-xl"
          >
            <div className="h-1 w-full bg-gradient-to-r from-[var(--accent)] via-[#6B9EF7] to-[#7C5CFF]" />

            <div className="px-6 pt-5 pb-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-subtle)]">
                    <AlertTriangle size={20} className="text-[var(--accent)]" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-white">
                      Delete Account
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      This cannot be undone
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {}
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                All your conversations, bookmarks, and notes will be permanently
                deleted.
                {requiresPassword && " Enter your password to confirm."}
              </p>

              {!requiresPassword ? (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <Info size={18} className="mt-0.5 text-blue-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-300">
                        Connected with Google
                      </p>
                      <p className="mt-1 text-xs text-blue-400/80">
                        This account is managed via Google authentication. No
                        password exists for this account.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.div
                  animate={shouldShake ? "shake" : undefined}
                  variants={shakeVariants}
                >
                  <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError("");
                      }}
                      onKeyDown={handleKeyDown}
                      disabled={isDeleting}
                      placeholder="Enter your password"
                      autoFocus
                      className={`w-full rounded-xl border bg-white/[0.04] py-3 pl-10 pr-11 text-sm text-white placeholder-[var(--text-muted)] transition-colors focus:outline-none disabled:opacity-50 ${
                        error
                          ? "border-red-500/40 focus:border-red-500/60"
                          : "border-white/[0.1] focus:border-white/[0.2]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isDeleting}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors hover:text-white disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </motion.div>
              )}

              {}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    className="mt-2 text-xs font-medium text-red-400"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {}
            <div className="flex items-center gap-3 border-t border-white/[0.07] px-6 py-4">
              <button
                onClick={handleClose}
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-white/[0.1] bg-white/[0.04] py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-white/[0.08] hover:text-white disabled:opacity-50 active:scale-[0.97]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || (requiresPassword && !password.trim())}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white hover:bg-neutral-200 py-2.5 text-sm font-semibold text-neutral-900 transition-all disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.97]"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-neutral-900" />
                    <span>Deleting…</span>
                  </>
                ) : (
                  <span>Delete My Account</span>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

