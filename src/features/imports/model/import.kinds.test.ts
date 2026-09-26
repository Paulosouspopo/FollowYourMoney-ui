import { describe, expect, it } from 'vitest';
import { guessKinds } from './import.kinds';

describe('guessKinds', () => {
  it('reconnaît les libellés courants, laisse les autres à « Ignorer »', () => {
    expect(guessKinds(['Achat', 'Vente', 'Dividende', 'Versement', 'Retrait', 'Intérêts', 'Frais', 'Opération sur titre']))
      .toEqual({ Achat: 'BUY', Vente: 'SELL', Dividende: 'DIVIDEND', Versement: 'DEPOSIT', Retrait: 'WITHDRAWAL',
        Intérêts: 'INTEREST', Frais: 'FEE' });
    expect(guessKinds(['BUY', 'SELL'])).toEqual({ BUY: 'BUY', SELL: 'SELL' });
  });
});
