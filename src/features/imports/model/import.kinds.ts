import type { ImportKind } from './import.types';

/** Libellés courants de courtiers → type d'opération (l'utilisateur peut corriger). */
const KIND_HINTS: [RegExp, ImportKind][] = [
  [/achat|buy|purchase|souscription/i, 'BUY'],
  [/vente|sell|sale|cession|rachat/i, 'SELL'],
  [/dividende|dividend|coupon|distribution/i, 'DIVIDEND'],
  [/int[ée]r[êe]t|interest/i, 'INTEREST'],
  [/versement|d[ée]p[ôo]t|deposit|virement entrant|apport/i, 'DEPOSIT'],
  [/retrait|withdraw/i, 'WITHDRAWAL'],
  [/frais|fee|droits de garde|commission/i, 'FEE'],
];

export function guessKinds(values: string[]): Record<string, ImportKind> {
  const out: Record<string, ImportKind> = {};
  for (const raw of values) {
    const hit = KIND_HINTS.find(([re]) => re.test(raw));
    if (hit) out[raw] = hit[1];
  }
  return out;
}
