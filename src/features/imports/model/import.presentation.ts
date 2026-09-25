import type { Confidence, ImportFormat, ImportKind, RowStatus } from './import.types';

export const IMPORT_KIND_LABEL: Record<ImportKind, string> = {
  BUY: 'Achat', SELL: 'Vente', DIVIDEND: 'Dividende',
  DEPOSIT: 'Versement', WITHDRAWAL: 'Retrait', INTEREST: 'Intérêts', FEE: 'Frais',
};
export const IMPORT_KINDS = Object.keys(IMPORT_KIND_LABEL) as ImportKind[];

export const ROW_STATUS_LABEL: Record<RowStatus, string> = {
  READY: 'À importer', DUPLICATE: 'Doublons', IGNORED: 'Ignorées', ERROR: 'Erreurs',
};

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  REMEMBERED: 'Mémorisé', CERTAIN: 'Trouvé', TO_CONFIRM: 'À vérifier', NOT_FOUND: 'Introuvable',
};

/** Formats proposés dans le sélecteur (le format est normalement détecté tout seul). */
export const FORMAT_OPTIONS: { value: ImportFormat; label: string }[] = [
  { value: 'FORTUNEO', label: 'Fortuneo' },
  { value: 'TRADE_REPUBLIC', label: 'Trade Republic' },
  { value: 'BINANCE', label: 'Binance' },
  { value: 'GENERIC', label: 'Autre (associer les colonnes)' },
];
