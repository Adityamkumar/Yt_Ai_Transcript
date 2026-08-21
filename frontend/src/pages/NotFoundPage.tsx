import { Ghost404Page } from '@/components/ui/ghost-404-page';
import { useAuth } from '@/store/AuthContext';

export default function NotFoundPage() {
  const { authStatus } = useAuth();
  const isAuthenticated = authStatus === 'authenticated';
  return <Ghost404Page destination={isAuthenticated ? '/app' : '/'} destinationLabel={isAuthenticated ? 'Go to dashboard' : 'Back to home'} />;
}
