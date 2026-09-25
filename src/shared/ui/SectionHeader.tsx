import type { ReactNode } from 'react';

/** Titre de section homogène : libellé à gauche, action (lien, bouton, sélecteur) à droite. */
export function SectionHeader({ title, action, children }: { title: ReactNode; action?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {children}
      {action}
    </div>
  );
}
