import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface TourStep {
  /**
   * Valeur(s) de l'attribut `data-tour` visée(s) : la première visible est
   * éclairée (ex. barre du bas sur mobile, barre latérale sur ordinateur).
   * Absente : bulle au centre. Visée introuvable au lancement : étape sautée.
   */
  target?: string | string[];
  icon?: LucideIcon;
  title: string;
  body: ReactNode;
  /** L'élément éclairé reste utilisable pendant l'étape (« À toi ! »). */
  interactive?: boolean;
}

export interface Tour {
  /** Clé enregistrée côté serveur ([a-z0-9-]). */
  key: string;
  title: string;
  /** Une phrase pour la page Guide. */
  summary: string;
  icon: LucideIcon;
  steps: TourStep[];
}

/** État des visites du compte (`GET /api/tutorials`). */
export interface TutorialState {
  autoEnabled: boolean;
  completed: string[];
}
