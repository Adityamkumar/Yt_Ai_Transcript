import React from 'react';
import { AlertCircle, RefreshCcw, LogOut } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { APP_NAME } from '@/constants';

interface AuthErrorScreenProps {
  onRetry: () => void;
}

export function AuthErrorScreen({ onRetry }: AuthErrorScreenProps) {
  const { logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.05)_0%,transparent_60%)]"></div>
      
      <div className="relative z-10 w-full max-w-md bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">
        <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Connection Error</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          We couldn't verify your session with {APP_NAME}. Please check your connection and try again.
        </p>
        
        <div className="w-full space-y-3">
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-black px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-neutral-200"
          >
            <RefreshCcw size={16} />
            Try Again
          </button>
          
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--border-soft)] bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
