import { Suspense, useEffect } from "react";
import { preloadAppPages } from "../pages";
import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { PageSkeleton } from "./PageSkeleton";
import { TourOverlay } from "@/shared/tour/TourOverlay";
import { CommandPalette } from "../search/CommandPalette";
import { DemoBanner } from "./DemoBanner";

/**
 * Mobile : une colonne + dock en bas. Grand écran : barre latérale, contenu
 * large (les pages de formulaire limitent elles-mêmes leur largeur).
 */
export function AppShell() {
  const { pathname } = useLocation();
  // Connecté : les autres pages se chargent en arrière-plan, la navigation devient instantanée
  useEffect(preloadAppPages, []);
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-lg md:max-w-3xl lg:max-w-6xl px-4 md:px-6 lg:px-10 lg:pt-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-16">
          <DemoBanner />
          <Suspense fallback={<PageSkeleton />}>
            {/* Clé = page : courte apparition à chaque navigation */}
            <div key={pathname} className="animate-rise">
              <Outlet />
            </div>
          </Suspense>
        </main>
      </div>
      <BottomNav />
      <TourOverlay />
      <CommandPalette />
    </div>
  );
}
