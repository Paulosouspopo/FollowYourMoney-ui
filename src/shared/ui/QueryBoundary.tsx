import type { UseQueryResult } from '@tanstack/react-query';
import { Skeleton } from '@/shared/ui/skeleton';
import { ErrorState } from './ErrorState';

interface Props<T> { query: UseQueryResult<T>; skeleton?: React.ReactNode; children: (data: T) => React.ReactNode; }

export function QueryBoundary<T>({ query, skeleton, children }: Props<T>) {
  if (query.isPending) return <>{skeleton ?? <Skeleton className="h-24 w-full" />}</>;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  return <>{children(query.data)}</>;
}