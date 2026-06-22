import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="18"
    height="18"
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

interface GoogleAuthButtonProps {
  label?: string;
}

export function GoogleAuthButton({ label = 'Continue with Google' }: GoogleAuthButtonProps) {
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);

    try {
      const google = (window as any).google;
      if (!google) {
        throw new Error("Google Sign-In has not loaded yet. Please try again in a moment.");
      }

      const client = google.accounts.oauth2.initCodeClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        ux_mode: 'popup',
        callback: async (response: any) => {
          if (response.error) {
            setIsLoading(false);
            console.error("Google OAuth Error:", response.error);
            return;
          }

          if (response.code) {
            try {
              await loginWithGoogle(response.code);
            } catch (err) {
              console.error("Verification failed:", err);
              setIsLoading(false);
              alert("Authentication failed. Please try again.");
            }
          } else {
            setIsLoading(false);
          }
        },
      });

      client.requestCode();
    } catch (error: any) {
      console.error("Google client init failed:", error);
      setIsLoading(false);
      alert(error.message || "Failed to launch Google login.");
    }
  };

  return (
    <motion.button
      type="button"
      id="google-auth-btn"
      onClick={handleClick}
      disabled={isLoading}
      whileHover={{ scale: isLoading ? 1 : 1.01 }}
      whileTap={{ scale: isLoading ? 1 : 0.99 }}
      transition={{ duration: 0.15 }}
      className="relative w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
      style={{
        background: 'var(--surface-3)',
        border: '1px solid var(--border-soft)',
        color: 'var(--text-primary)',
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.background = 'var(--surface-hover)';
          e.currentTarget.style.borderColor = 'var(--border-medium)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--surface-3)';
        e.currentTarget.style.borderColor = 'var(--border-soft)';
      }}
    >
      {isLoading ? (
        <>
          <Loader2 size={16} className="animate-spin text-[#94A3B8]" />
          <span className="text-[#94A3B8]">Connecting...</span>
        </>
      ) : (
        <>
          <GoogleIcon />
          <span>{label}</span>
        </>
      )}
    </motion.button>
  );
}

