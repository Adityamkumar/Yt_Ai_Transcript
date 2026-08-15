import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';

export function useAuthRedirect() {
  const { user, authStatus, refreshUser } = useAuth();
  const navigate = useNavigate();
  const hasAttempted = useRef(false);

  // Handle OAuth callback return
  useEffect(() => {
    const isOAuthReturn = sessionStorage.getItem('oauth_pending') === 'true';

    if (!isOAuthReturn) return;
    if (authStatus === 'checking' || user || hasAttempted.current) return;

    hasAttempted.current = true;
    sessionStorage.removeItem('oauth_pending');

    refreshUser().then(() => {
      if (localStorage.getItem('isAuthenticated') === 'true') {
        navigate('/app', { replace: true });
      }
    });
  }, [authStatus, user, refreshUser, navigate]);

  // Handle auto-redirect if already authenticated
  useEffect(() => {
    if (authStatus === 'authenticated' && user && localStorage.getItem('isAuthenticated') === 'true') {
      const isOAuthReturn = sessionStorage.getItem('oauth_pending') === 'true';
      if (!isOAuthReturn) {
        navigate('/app', { replace: true });
      }
    }
  }, [authStatus, user, navigate]);
}
