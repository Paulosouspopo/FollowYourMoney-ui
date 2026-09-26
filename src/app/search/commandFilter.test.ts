import { describe, expect, it } from 'vitest';
import { commandFilter } from './commandFilter';

describe('commandFilter', () => {
  it('un mot cherché doit commencer un mot de l’élément', () => {
    expect(commandFilter('page Revenus Dividendes et intérêts : reçus, attendus, calendrier', 'nvidia')).toBe(0);
    expect(commandFilter('ligne NVIDIA Corporation NVDA CTO', 'nvidia')).toBe(1);
  });

  it('sans accents ni majuscules', () => {
    expect(commandFilter('action thème sombre clair apparence', 'THEME')).toBe(1);
    expect(commandFilter('page Fiscalité Cases à déclarer', 'fisca')).toBe(1);
  });

  it('plusieurs mots : tous doivent correspondre', () => {
    expect(commandFilter('portefeuille PEA Boursorama PEA', 'pea bours')).toBe(1);
    expect(commandFilter('portefeuille PEA Boursorama PEA', 'pea fortuneo')).toBe(0);
  });
});
