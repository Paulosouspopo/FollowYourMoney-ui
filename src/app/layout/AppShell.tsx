import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { PageSkeleton } from "./PageSkeleton";

export function AppShell() {
  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      <main className="flex-1 mx-auto max-w-lg w-full px-4 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}