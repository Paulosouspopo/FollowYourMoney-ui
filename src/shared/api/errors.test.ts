import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './errors';

describe('getErrorMessage', () => {
  it("lit le message d'une ApiError normalisée par l'intercepteur", () => {
    expect(getErrorMessage({ timestamp: '', status: 400, message: 'Vente impossible' })).toBe('Vente impossible');
  });

  it('retombe sur le code HTTP si le message est vide', () => {
    expect(getErrorMessage({ timestamp: '', status: 503, message: '' })).toBe('Erreur 503');
  });

  it('gère une Error JS et un inconnu', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
    expect(getErrorMessage('???')).toBe('Erreur inconnue');
  });
});
