import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ApiError } from '@/shared/api/types';
import type { ImportPreview, ImportRow } from '../model/import.types';
import ImportPage from './ImportPage';

type Callbacks<T> = { onSuccess?: (v: T) => void; onError?: (e: ApiError) => void };
const inspectMutate = vi.fn();
const previewMutate = vi.fn();
const commitMutate = vi.fn();
let previewResult: ImportPreview;

vi.mock('../api/import.api', () => ({
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  useInspectImport: () => ({ mutate: inspectMutate, isPending: false, error: null }),
  usePreviewImport: () => ({ mutate: previewMutate, isPending: false, isError: false, error: null }),
  useCommitImport: () => ({ mutate: commitMutate, isPending: false }),
}));
vi.mock('@/features/portfolios/api/portfolio.api', () => ({
  usePortfolio: () => ({ data: { name: 'PEA Fortuneo' } }),
}));
vi.mock('@/features/assets/api/assetSearch.api', () => ({
  ASSET_SEARCH_MIN_LENGTH: 2,
  useAssetSearch: () => ({ data: [], isFetching: false }),
}));

const row = (over: Partial<ImportRow>): ImportRow => ({
  id: 0, lines: [2], dateTime: '2026-03-01T00:00:00', kind: 'BUY',
  assetReference: 'NAME:FAKE ETF', assetLabel: 'FAKE ETF - C EUR ACC',
  quantity: 2, unitPrice: 99, fees: 0, currency: 'EUR', amount: null, notes: null, externalRef: 'F:1',
  status: 'READY', message: null, priceEstimated: false, valuationReference: null, valuationQuantity: null,
  ...over,
});

const basePreview = (): ImportPreview => ({
  format: 'FORTUNEO', formatLabel: 'Fortuneo', cashTrackingEnabled: false,
  rows: [
    row({ id: 0 }),
    row({ id: 1, kind: 'SELL', quantity: 1, unitPrice: 110, externalRef: 'F:2' }),
    row({ id: 2, kind: 'DEPOSIT', assetReference: null, assetLabel: null, quantity: null, unitPrice: null, amount: 500, externalRef: 'F:3' }),
    row({ id: 3, status: 'DUPLICATE', message: 'Déjà importée', externalRef: 'F:4' }),
    row({ id: 4, kind: null, status: 'IGNORED', message: 'Opération sur titre', externalRef: null }),
  ],
  assets: [{
    reference: 'NAME:FAKE ETF', label: 'FAKE ETF - C EUR ACC', isin: null,
    suggestion: { symbol: 'ESE.PA', name: 'Fake ETF', exchange: 'Paris', assetType: 'ETF' }, confidence: 'TO_CONFIRM',
  }],
});

async function uploadAndPreview() {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/portfolios/p1/import']}>
      <Routes>
        <Route path="/portfolios/:portfolioId/import" element={<ImportPage />} />
        <Route path="/portfolios/:portfolioId" element={<p>Page portefeuille</p>} />
      </Routes>
    </MemoryRouter>,
  );
  await user.upload(screen.getByLabelText('Fichier à importer'), new File(['x'], 'releve.csv', { type: 'text/csv' }));
  return user;
}

describe('ImportPage', () => {
  beforeEach(() => {
    previewResult = basePreview();
    inspectMutate.mockReset().mockImplementation((_file: File, cb: Callbacks<unknown>) =>
      cb.onSuccess?.({ detectedFormat: 'FORTUNEO', headers: [], sampleRows: [], rowCount: 5, columnValues: {}, encoding: 'UTF-8', delimiter: ';' }));
    previewMutate.mockReset().mockImplementation((_args: unknown, cb: Callbacks<ImportPreview>) => cb.onSuccess?.(previewResult));
    commitMutate.mockReset();
  });

  it('format reconnu : aperçu direct, lignes prêtes cochées, doublon décoché, ignorée non cochable', async () => {
    await uploadAndPreview();
    expect(previewMutate.mock.calls[0][0].options).toEqual({ portfolioId: 'p1', format: 'FORTUNEO', mapping: null });

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.filter(c => (c as HTMLInputElement).checked)).toHaveLength(3); // 2 opérations + le versement
    expect(screen.getByText('Relevé Fortuneo')).toBeInTheDocument();
  });

  it("bloque l'import tant qu'un actif « à vérifier » n'est pas validé, puis envoie le symbole choisi", async () => {
    const user = await uploadAndPreview();
    const importButton = screen.getByRole('button', { name: /^Importer 3 lignes/ });
    expect(importButton).toBeDisabled();
    expect(screen.getByText('Valide 1 actif avant d\'importer.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Valider ESE.PA' }));
    expect(importButton).toBeEnabled();
    await user.click(importButton);

    const request = commitMutate.mock.calls[0][0];
    expect(request.assets).toEqual({ 'NAME:FAKE ETF': 'ESE.PA' });
    expect(request.enableCashTracking).toBe(true);
    expect(request.rows.map((r: ImportRow) => r.id)).toEqual([0, 1, 2]);
  });

  it('sans activer le suivi des liquidités, les versements sont retirés de la sélection', async () => {
    const user = await uploadAndPreview();
    await user.click(screen.getByRole('switch', { name: 'Importer les versements et retraits' }));
    expect(screen.getByRole('button', { name: /^Importer 2 lignes$/ })).toBeInTheDocument();
  });

  it('affiche sur la bonne ligne une erreur renvoyée par la validation', async () => {
    commitMutate.mockImplementation((_b: unknown, cb: Callbacks<unknown>) => cb.onError?.({
      timestamp: '', status: 400, code: 'IMPORT_ROW_ERROR', message: 'Ligne 3 du fichier : Vente impossible',
      fieldErrors: [{ field: 'row:1', message: 'Ligne 3 du fichier : Vente impossible' }],
    }));
    const user = await uploadAndPreview();
    await user.click(screen.getByRole('button', { name: 'Valider ESE.PA' }));
    await user.click(screen.getByRole('button', { name: /^Importer/ }));

    expect(screen.getAllByText('Ligne 3 du fichier : Vente impossible').length).toBeGreaterThan(0);
  });

  it('format inconnu : passe par l\'association des colonnes', async () => {
    inspectMutate.mockImplementation((_file: File, cb: Callbacks<unknown>) => cb.onSuccess?.({
      detectedFormat: null, encoding: 'UTF-8', delimiter: ';', rowCount: 2,
      headers: ['Date', 'Sens', 'Titre', 'Quantité', 'Montant'],
      sampleRows: [['15/01/2026', 'Achat', 'FR0000133308', '10', '100']],
      columnValues: { Sens: ['Achat', 'Versement'] },
    }));
    await uploadAndPreview();
    expect(screen.getByText('Quelle colonne contient quoi ?')).toBeInTheDocument();
    expect(screen.getByText('Que signifie chaque type ?')).toBeInTheDocument();
    // « Achat » et « Versement » reconnus d'office : l'aperçu est possible sans rien associer
    expect(screen.getByRole('button', { name: "Voir l'aperçu" })).toBeEnabled();
    expect(previewMutate).not.toHaveBeenCalled();
  });
});
