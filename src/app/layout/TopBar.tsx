import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

/** En-tête des pages de détail : retour, titre, actions. Collant, fond flouté. */
export function TopBar({ title, back, right }: { title: string; back?: boolean; right?: React.ReactNode }) {
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-30 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-10 lg:px-10 py-3 bg-background/80 backdrop-blur-xl flex items-center gap-2">
      {back && (
        <button onClick={() => nav(-1)} className="grid h-9 w-9 -ml-2 place-items-center rounded-full hover:bg-muted transition-colors"
          aria-label="Retour">
          <ChevronLeft size={22} />
        </button>
      )}
      <h1 className="flex-1 text-lg font-semibold tracking-tight truncate">{title}</h1>
      {right}
    </header>
  );
}
