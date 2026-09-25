export interface TwoFactorStatus { enabled: boolean; recoveryCodesLeft: number; }

/** `otpauthUri` pour le QR code, `secret` pour une saisie manuelle dans l'application. */
export interface TwoFactorSetup { secret: string; otpauthUri: string; }

/** Session en cours sur un appareil. */
export interface SessionInfo {
  id: string; userAgent: string | null; ip: string | null;
  startedAt: string; lastUsedAt: string;
  /** L'appareil d'où la liste est demandée. */
  current: boolean;
}
