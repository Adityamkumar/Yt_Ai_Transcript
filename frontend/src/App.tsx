import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { StoreProvider } from '@/store/useAppStore';
import { AppLayout } from '@/layouts/AppLayout';
import HomePage from '@/pages/HomePage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <AppLayout>
          <HomePage />
        </AppLayout>
      </StoreProvider>
    </QueryClientProvider>
  );
}

