import { QueryClient } from '@tanstack/react-query';
import type { ApiError } from './types';

declare module '@tanstack/react-query' { interface Register { defaultError: ApiError } }

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,          // les prix sont rafraîchis côté back par cron, inutile de spammer
      retry: (count, err) => err.status >= 500 && count < 2,
      refetchOnWindowFocus: true,
    },
  },
});
