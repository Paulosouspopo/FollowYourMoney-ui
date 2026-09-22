import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,          // les prix sont rafraîchis côté back par cron, inutile de spammer
      retry: (count, err: any) => err?.status >= 500 && count < 2,
      refetchOnWindowFocus: true,
    },
  },
});