import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { api } from './client';
import { useAuthStore } from '@/shared/auth/auth.store';

/**
 * Faux serveur branché à la place de l'adaptateur HTTP d'axios :
 * - /auth/refresh répond selon `refreshOk` et compte les appels ;
 * - toute autre URL exige « Bearer fresh » (sinon 401, jeton expiré).
 */
let refreshCalls = 0;
let refreshOk = true;

const respond = (config: InternalAxiosRequestConfig, status: number, data: unknown): Promise<AxiosResponse> => {
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return status < 400
    ? Promise.resolve(response)
    : Promise.reject(new AxiosError('HTTP ' + status, 'ERR_BAD_REQUEST', config, null, response));
};

const fakeServer = (config: InternalAxiosRequestConfig) => {
  if (config.url === '/auth/refresh') {
    refreshCalls++;
    return refreshOk
      ? respond(config, 200, { accessToken: 'fresh', expiresIn: 900 })
      : respond(config, 401, { status: 401, message: 'Session expirée, reconnecte-toi.' });
  }
  if (config.url === '/auth/login') {
    return respond(config, 401, { status: 401, message: 'Email ou mot de passe incorrect' });
  }
  return config.headers.Authorization === 'Bearer fresh'
    ? respond(config, 200, { url: config.url })
    : respond(config, 401, { status: 401, message: 'Authentification requise' });
};

describe('client API — renouvellement de session sur 401', () => {
  const originalAdapter = api.defaults.adapter;

  beforeEach(() => {
    refreshCalls = 0;
    refreshOk = true;
    api.defaults.adapter = fakeServer;
    useAuthStore.getState().setSession('expired');
  });
  afterEach(() => { api.defaults.adapter = originalAdapter; });

  it('renouvelle une seule fois pour plusieurs requêtes simultanées, puis les rejoue', async () => {
    const [a, b] = await Promise.all([api.get('/portfolios'), api.get('/dashboard')]);

    expect(a.data).toEqual({ url: '/portfolios' });
    expect(b.data).toEqual({ url: '/dashboard' });
    expect(refreshCalls).toBe(1);
    expect(useAuthStore.getState()).toMatchObject({ accessToken: 'fresh', status: 'authenticated' });
  });

  it('vide la session si le renouvellement échoue (après un second essai) et rejette une ApiError', async () => {
    refreshOk = false;

    await expect(api.get('/portfolios')).rejects.toMatchObject({ status: 401, message: 'Authentification requise' });
    expect(refreshCalls).toBe(2);
    expect(useAuthStore.getState()).toMatchObject({ accessToken: null, status: 'anonymous' });
  });

  it("ne tente pas de renouvellement sur les endpoints d'authentification", async () => {
    await expect(api.post('/auth/login', {}, { skipAuthRefresh: true }))
      .rejects.toMatchObject({ status: 401, message: 'Email ou mot de passe incorrect' });
    expect(refreshCalls).toBe(0);
  });

  it('normalise une panne réseau en ApiError lisible', async () => {
    api.defaults.adapter = (config) => Promise.reject(new AxiosError('timeout', 'ECONNABORTED', config));
    await expect(api.get('/portfolios')).rejects.toMatchObject({ status: 0, message: 'Le serveur ne répond pas' });
  });
});

describe('store de session', () => {
  it("ne persiste pas le jeton dans le localStorage (supprime l'ancienne clé)", () => {
    useAuthStore.getState().setSession('secret');
    expect(localStorage.getItem('fym-auth')).toBeNull();
    expect(JSON.stringify(localStorage)).not.toContain('secret');
  });
});

vi.setConfig({ testTimeout: 5000 });
