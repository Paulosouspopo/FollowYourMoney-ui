import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/api/queryClient';
import { useApplyTheme } from '@/shared/theme/theme.store';
import { Toaster } from '@/shared/ui/Toaster';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  useApplyTheme();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
};
