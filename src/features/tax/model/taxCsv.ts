import type { TaxReport } from './tax.types';

/** Nombre au format français d'un tableur (virgule décimale, pas de séparateur de milliers). */
const n = (v: number) => v.toFixed(2).replace('.', ',');
const cell = (v: string) => (/[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/**
 * Cessions de l'année en CSV (séparateur « ; », pour Excel / LibreOffice en
 * français) : titres puis crypto-actifs. Utile pour un comptable ou le 2074.
 */
export function salesCsv(report: TaxReport): string {
  const rows: string[][] = [['Régime', 'Date', 'Actif', 'Quantité', 'Prix de cession (€)', "Coût d'acquisition (€)",
    'Valeur du portefeuille crypto (€)', 'Plus-value (€)']];
  report.securities.sales.forEach(s => rows.push(['Titres', s.date, `${s.symbol} ${s.name}`.trim(),
    String(s.quantity).replace('.', ','), n(s.proceedsEur), n(s.costEur), '', n(s.gainEur)]));
  report.crypto.sales.forEach(s => rows.push(['Crypto (150 VH bis)', s.date, s.symbol, '', n(s.proceedsEur),
    n(s.acquisitionShareEur), n(s.portfolioValueEur), n(s.gainEur)]));
  return rows.map(r => r.map(cell).join(';')).join('\r\n');
}

/** Téléchargement côté navigateur (BOM UTF-8 : Excel lit les accents). */
export function downloadCsv(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob(['﻿', content], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
