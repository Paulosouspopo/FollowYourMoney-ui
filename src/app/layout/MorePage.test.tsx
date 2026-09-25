import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MorePage from './MorePage';
import { MOBILE_NAV_ITEMS, isNavActive } from './nav';

const plus = MOBILE_NAV_ITEMS.find(i => i.to === '/more')!;

describe('onglet « Plus » (mobile)', () => {
  it("regroupe les pages d'analyse et les réglages", () => {
    render(<MemoryRouter><MorePage /></MemoryRouter>);
    for (const [label, href] of [['Revenus', '/income'], ['Objectifs', '/goals'], ['Fiscalité', '/tax'], ['Réglages', '/settings']]) {
      expect(screen.getByText(label).closest('a')).toHaveAttribute('href', href);
    }
  });

  it('la barre du bas garde 5 onglets et « Plus » reste actif sur ses pages', () => {
    expect(MOBILE_NAV_ITEMS.map(i => i.label)).toEqual(['Accueil', 'Portefeuilles', 'Marchés', 'Alertes', 'Plus']);
    expect(isNavActive('/tax', plus.matches)).toBe(true);
    expect(isNavActive('/settings', plus.matches)).toBe(true);
    expect(isNavActive('/portfolios/p1', plus.matches)).toBe(false);
    expect(isNavActive('/portfolios/p1', ['/portfolios'])).toBe(true);
    expect(isNavActive('/markets', ['/'])).toBe(false);
  });
});
