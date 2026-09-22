import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ApiError } from '@/shared/api/types';

declare module '@tanstack/react-query' { interface Register { defaultError: ApiError } }

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: (n, e) => e.status >= 500 && n < 2, refetchOnWindowFocus: true },
  },
});
export const Providers = ({ children }: { children: React.ReactNode }) =>
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;