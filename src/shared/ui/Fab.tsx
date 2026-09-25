import { Plus } from "lucide-react";

/** Action principale de la page : au-dessus du dock sur mobile, en bas à droite sur ordinateur. */
export function Fab({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label}
      className="fixed right-4 bottom-[calc(6rem+env(safe-area-inset-bottom))] lg:right-10 lg:bottom-10 z-40 h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 grid place-items-center hover:brightness-110 active:scale-95 transition">
      <Plus size={26} />
    </button>
  );
}
