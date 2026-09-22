import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TopBar({ title, back, right }: { title: string; back?: boolean; right?: React.ReactNode }) {
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-30 -mx-4 px-4 py-3 bg-background/90 backdrop-blur flex items-center gap-2">
      {back && <button onClick={() => nav(-1)} className="p-1 -ml-1" aria-label="Retour"><ChevronLeft size={24} /></button>}
      <h1 className="flex-1 text-lg font-semibold truncate">{title}</h1>
      {right}
    </header>
  );
}