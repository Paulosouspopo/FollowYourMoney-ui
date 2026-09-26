import { createPortal } from "react-dom";
import { Plus } from "lucide-react";

/**
 * Action principale de la page : au-dessus de la barre du bas sur mobile, en bas à droite sur ordinateur.
 * Rendue dans <body> (portail) : toujours ancrée à l'écran, même pendant l'animation d'entrée de la page.
 */
export function Fab({ onClick, label }: { onClick: () => void; label: string }) {
  return createPortal(
    <button type="button" onClick={onClick} aria-label={label} title={label} data-tour="add"
      className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:right-10 lg:bottom-10 z-40 h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 grid place-items-center hover:brightness-110 active:scale-95 transition">
      <Plus size={26} />
    </button>,
    document.body,
  );
}
