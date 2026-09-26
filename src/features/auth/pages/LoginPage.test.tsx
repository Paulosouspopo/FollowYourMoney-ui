import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { ApiError } from '@/shared/api/types';
import LoginPage from './LoginPage';

type MutateOpts = { onSuccess?: () => void; onError?: (e: ApiError) => void };
const state: { error: ApiError | null; challenge: string | null } = { error: null, challenge: null };
const verifyMutate = vi.fn();
const loginMutate = vi.fn();
const resendMutate = vi.fn<(email: string, opts?: MutateOpts) => void>();

vi.mock('@/features/auth/api/auth.api', () => ({
  useLogin: () => ({ mutate: loginMutate, isPending: false, isError: state.error !== null, error: state.error,
    data: state.challenge ? { accessToken: null, expiresIn: 0, twoFactorToken: state.challenge } : undefined, reset: vi.fn() }),
  useVerifyTwoFactor: () => ({ mutate: verifyMutate, isPending: false, isError: false, error: null }),
  useResendVerification: () => ({ mutate: resendMutate, isPending: false }),
  useDemo: () => ({ mutate: vi.fn(), isPending: false, isError: false, error: null }),
}));

const renderPage = () => {
  render(<MemoryRouter><LoginPage /></MemoryRouter>);
  return userEvent.setup();
};

describe('LoginPage', () => {
  beforeEach(() => {
    state.error = null;
    state.challenge = null;
    loginMutate.mockReset();
    resendMutate.mockReset();
  });

  it('envoie email et mot de passe', async () => {
    const user = renderPage();
    await user.type(screen.getByLabelText('Email'), 'paul@fym.io');
    await user.type(screen.getByLabelText('Mot de passe'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(loginMutate).toHaveBeenCalledWith({ email: 'paul@fym.io', password: 'secret' });
  });

  it('affiche un message générique sur 401 (sans dire si le compte existe)', () => {
    state.error = { timestamp: '', status: 401, message: 'Bad credentials' };
    renderPage();
    expect(screen.getByRole('alert')).toHaveTextContent('Email ou mot de passe incorrect');
  });

  it("propose de renvoyer l'email de confirmation si l'adresse n'est pas vérifiée", async () => {
    state.error = { timestamp: '', status: 403, code: 'EMAIL_NOT_VERIFIED', message: 'Confirme ton adresse email' };
    const user = renderPage();
    await user.type(screen.getByLabelText('Email'), 'paul@fym.io');
    await user.click(screen.getByRole('button', { name: "Renvoyer l'email de confirmation" }));

    expect(screen.getByRole('alert')).toHaveTextContent('Confirme ton adresse email');
    expect(resendMutate.mock.calls[0][0]).toBe('paul@fym.io');
  });

  it('double authentification : étape du code après le mot de passe, code de secours possible', async () => {
    state.challenge = 'defi-123';
    const user = renderPage();
    expect(screen.getByText(/code à 6 chiffres/)).toBeInTheDocument();
    await user.type(screen.getByLabelText('Code'), '123456');
    await user.click(screen.getByRole('button', { name: 'Valider' }));
    expect(verifyMutate).toHaveBeenCalledWith({ token: 'defi-123', code: '123456' });

    await user.click(screen.getByRole('button', { name: /Code de secours/ }));
    expect(screen.getByLabelText('Code de secours')).toBeInTheDocument();
  });
});
