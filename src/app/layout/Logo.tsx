import { useId } from 'react';

/**
 * Marque : courbe montante sur fond indigo (même dessin que l'icône de l'app).
 * Identifiant de dégradé unique : un logo dans un bloc masqué ne doit pas
 * priver les autres de leur fond.
 */
export function Logo({ className }: { className?: string }) {
  const id = `fym-logo${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5868f0" />
          <stop offset="1" stopColor="#343cbe" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id})`} />
      <path d="M13 45 26 32l9 6.5L50 21M40 21h10v10" fill="none" stroke="#fff" strokeWidth="5.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
