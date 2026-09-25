import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatMoney } from '@/shared/lib/format';
import type { TransactionType } from '@/shared/model/enums';
import { useTransactionCheck, type TransactionCheckParams } from '../api/quality.api';

const DEBOUNCE_MS = 500;

interface Props {
  portfolioId: string; symbol: string | null; type: TransactionType;
  /** Valeur du champ datetime-local. */
  dateTime: string; price: string | number; currency: string;
  /** Remplace le prix saisi par le cours proposé. */
  onUsePrice: (price: number) => void;
}

/**
 * Pendant la saisie : prix très éloigné de la clôture du jour, actif
 * probablement non éligible au PEA. Informatif : l'envoi n'est pas bloqué.
 */
export function TransactionCheckHint({ portfolioId, symbol, type, dateTime, price, currency, onUsePrice }: Props) {
  const date = dateTime?.slice(0, 10);
  const numeric = Number(String(price).replace(',', '.'));
  const params: TransactionCheckParams | null = symbol && /^\d{4}-\d{2}-\d{2}$/.test(date ?? '')
    ? { portfolioId, symbol, type, date, price: numeric > 0 && type !== 'DIVIDEND' ? numeric : null, currency }
    : null;
  const debounced = useDebounced(params);
  const { data } = useTransactionCheck(debounced);
  if (!params || !data?.length) return null;

  return (
    <div className="space-y-2" role="status">
      {data.map(w => (
        <div key={w.code} className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
          <AlertTriangle size={14} className="mt-px shrink-0" />
          <div className="flex-1 space-y-1.5">
            <p>{w.code === 'PRICE_MISMATCH' ? `${w.message} Erreur de saisie ?` : w.message}</p>
            {w.code === 'PRICE_MISMATCH' && w.suggestedPrice != null && w.currency && (
              <button type="button" onClick={() => onUsePrice(w.suggestedPrice!)}
                className="rounded-full bg-warning/20 px-2.5 py-1 font-medium hover:bg-warning/30 transition-colors">
                Utiliser {formatMoney(w.suggestedPrice, w.currency)}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Valeur stabilisée après une pause de saisie (comparaison par contenu). */
function useDebounced<T>(value: T): T {
  const [debounced, setDebounced] = useState(value);
  const serialized = JSON.stringify(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(JSON.parse(serialized)), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [serialized]);
  return debounced;
}
