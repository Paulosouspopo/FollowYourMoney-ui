import { Skeleton } from '@/shared/ui/skeleton';

export function PageSkeleton() {
  return (
    <div className="space-y-4 py-2">
      <Skeleton className="h-8 w-1/2 rounded-lg" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}