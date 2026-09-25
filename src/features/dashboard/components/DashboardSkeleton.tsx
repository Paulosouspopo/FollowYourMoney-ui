import { Skeleton } from '@/shared/ui/skeleton';

/** Même silhouette que la page : pas de saut de mise en page à l'arrivée des données. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 lg:grid lg:grid-cols-12 lg:gap-8 lg:space-y-0 pt-4">
      <div className="space-y-5 lg:col-span-8">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-14 w-64 rounded-xl" />
        <Skeleton className="h-5 w-48 rounded-full" />
        <Skeleton className="h-[240px] w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
        </div>
      </div>
      <div className="space-y-4 lg:col-span-4 lg:pt-4">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}
