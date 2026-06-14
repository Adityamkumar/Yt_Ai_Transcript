import { AnimatePresence, motion } from "framer-motion";
import {
  Settings,
  X,
  User,
  Mail,
  Shield,
  Trash2,
  AlertTriangle,
  Check,
} from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { useState } from "react";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { UserAvatar } from "@/components/auth/UserAvatar";

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
    transition: {
      type: "spring" as const,
      stiffness: 420,
      damping: 30,
      delay: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
};

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="14"
    height="14"
    aria-hidden="true"
  >
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <path
      fill="#FF3D00"
      d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
    />
  </svg>
);

function ProviderBadge({
  provider,
  hasPassword,
}: {
  provider?: "local" | "google";
  hasPassword?: boolean;
}) {
  const isGoogle = provider === "google";
  const isHybrid = isGoogle && hasPassword;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
      style={{
        background: isGoogle
          ? "linear-gradient(135deg, rgba(66,133,244,0.08) 0%, rgba(52,168,83,0.06) 50%, rgba(251,188,4,0.06) 100%)"
          : "rgba(124,92,255,0.06)",
        border: isGoogle
          ? "1px solid rgba(66,133,244,0.2)"
          : "1px solid rgba(124,92,255,0.18)",
      }}
    >
      <div className="flex items-center gap-2.5">
        {}
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: isGoogle
              ? "rgba(255,255,255,0.07)"
              : "rgba(124,92,255,0.12)",
            border: isGoogle
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(124,92,255,0.2)",
          }}
        >
          {isGoogle ? (
            <GoogleIcon />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(124,92,255,0.9)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </span>

        {}
        <div>
          <p
            className="text-xs font-medium"
            style={{ color: isGoogle ? "#c8d8f8" : "#b8aaff" }}
          >
            {isHybrid
              ? "Linked Google Account"
              : isGoogle
                ? "Signed in with Google"
                : "Signed in with Email & Password"}
          </p>
          <p className="text-[10px]" style={{ color: "rgba(148,163,184,0.6)" }}>
            {isHybrid
              ? "Password & Google Authentication"
              : isGoogle
                ? "Managed via Google Account"
                : "Local account"}
          </p>
        </div>
      </div>

      {}
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{
          background: isGoogle
            ? "rgba(52,168,83,0.15)"
            : "rgba(124,92,255,0.15)",
          border: isGoogle
            ? "1px solid rgba(52,168,83,0.3)"
            : "1px solid rgba(124,92,255,0.3)",
        }}
      >
        <Check
          size={10}
          style={{ color: isGoogle ? "#4CAF50" : "#9b7fff" }}
          strokeWidth={2.5}
        />
      </span>
    </motion.div>
  );
}

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
            {}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />

            {}
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-1)] shadow-2xl shadow-black/40 backdrop-blur-xl"
            >
              {}
              <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] text-[var(--text-secondary)]">
                    <Settings
                      size={17}
                      className="animate-[spin_8s_linear_infinite]"
                    />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-white">
                      Settings
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      Manage your account
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {}
              <div className="p-6 space-y-6">
                {}
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Profile
                  </h3>
                  <div className="space-y-2">
                    {}
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] px-4 py-3">
                      <UserAvatar
                        name={user?.name || "Guest"}
                        avatar={user?.avatar}
                        size={40}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {user?.name || "Guest"}
                        </p>
                        <p className="truncate text-xs text-[var(--text-muted)]">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    {}
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] px-4 py-3">
                      <User
                        size={16}
                        className="shrink-0 text-[var(--text-muted)]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-[var(--text-muted)]">Name</p>
                        <p className="truncate text-sm font-medium text-white">
                          {user?.name || "Guest"}
                        </p>
                      </div>
                    </div>

                    {}
                    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">
                      <Mail
                        size={16}
                        className="shrink-0 text-[var(--text-muted)]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-[var(--text-muted)]">
                          Email
                        </p>
                        <p className="truncate text-sm font-medium text-white">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Account Provider
                  </h3>
                  <ProviderBadge
                    provider={user?.provider}
                    hasPassword={user?.hasPassword}
                  />
                </div>

                {}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400/80">
                    <Shield size={12} />
                    Danger Zone
                  </h3>
                  <div className="rounded-xl border border-red-500/15 bg-red-500/[0.04] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            size={14}
                            className="shrink-0 text-red-400"
                          />
                          <p className="text-sm font-medium text-white">
                            Delete Account
                          </p>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                          Permanently delete your account and all associated
                          data. This action cannot be undone.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          setShowDeleteModal(true);
                        }}
                        className="group flex shrink-0 items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-all hover:border-red-500/30 hover:bg-red-500/20 hover:text-red-300 hover:shadow-lg hover:shadow-red-500/5 active:scale-[0.97]"
                      >
                        <Trash2
                          size={14}
                          className="transition-transform group-hover:scale-110"
                        />
                        <span>Delete Account</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="border-t border-[var(--border-soft)] px-6 py-3">
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

