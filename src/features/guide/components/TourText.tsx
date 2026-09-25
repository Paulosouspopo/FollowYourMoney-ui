import type { ReactNode } from 'react';

/** Petit exemple chiffré dans une bulle : le concret aide à comprendre. */
export const Example = ({ children }: { children: ReactNode }) => (
  <div className="rounded-xl bg-muted/70 px-3 py-2 text-xs leading-relaxed text-foreground">{children}</div>
);

/** Définition courte : terme en gras, explication à côté. */
export const Def = ({ term, children }: { term: string; children: ReactNode }) => (
  <p><span className="font-semibold text-foreground">{term}</span> — {children}</p>
);
