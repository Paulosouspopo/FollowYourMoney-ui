import { useState } from 'react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { FormSelect } from '@/shared/ui/form-select';
import { CURRENCIES } from '@/shared/model/currencies';
import { IMPORT_KINDS, IMPORT_KIND_LABEL } from '../model/import.presentation';
import type { GenericMapping, ImportInspection, ImportKind } from '../model/import.types';
import { guessKinds } from '../model/import.kinds';

const NONE = '__none__';
const IGNORE = '__ignore__';

type ColumnField = Exclude<keyof GenericMapping, 'typeValues' | 'defaultCurrency'>;
const FIELDS: { key: ColumnField; label: string; required?: boolean; hint?: string }[] = [
  { key: 'dateColumn', label: 'Date', required: true },
  { key: 'typeColumn', label: 'Type d\'opération', required: true },
  { key: 'assetColumn', label: 'Actif', hint: 'ISIN, symbole ou nom' },
  { key: 'quantityColumn', label: 'Quantité' },
  { key: 'priceColumn', label: 'Prix unitaire', hint: 'À défaut : montant ÷ quantité' },
  { key: 'amountColumn', label: 'Montant', hint: 'Obligatoire pour versements et dividendes' },
  { key: 'feesColumn', label: 'Frais' },
  { key: 'currencyColumn', label: 'Devise' },
];

/** Devine une colonne d'après son en-tête (simple aide, toujours modifiable). */
const GUESS: Record<ColumnField, RegExp> = {
  dateColumn: /date|time/i, typeColumn: /type|op[ée]ration|sens/i, assetColumn: /isin|symbol|libell|titre|actif|name|nom/i,
  quantityColumn: /qt|quantit|shares|nombre/i, priceColumn: /prix|price|cours/i, amountColumn: /montant|amount|total/i,
  feesColumn: /frais|fee|courtage|commission/i, currencyColumn: /devise|currency/i,
};

function initialMapping(inspection: ImportInspection): GenericMapping {
  const used = new Set<string>();
  const guess = (key: ColumnField) => {
    const header = inspection.headers.find(h => !used.has(h) && GUESS[key].test(h)) ?? null;
    if (header) used.add(header);
    return header;
  };
  return {
    dateColumn: guess('dateColumn'), typeColumn: guess('typeColumn'), assetColumn: guess('assetColumn'),
    quantityColumn: guess('quantityColumn'), priceColumn: guess('priceColumn'), amountColumn: guess('amountColumn'),
    feesColumn: guess('feesColumn'), currencyColumn: guess('currencyColumn'),
    typeValues: {}, defaultCurrency: 'EUR',
  };
}

function withGuessedKinds(mapping: GenericMapping, inspection: ImportInspection): GenericMapping {
  const values = mapping.typeColumn ? inspection.columnValues[mapping.typeColumn] ?? [] : [];
  return { ...mapping, typeValues: guessKinds(values) };
}

interface Props { inspection: ImportInspection; onSubmit: (mapping: GenericMapping) => void; loading?: boolean; }

/** Relevé non reconnu : l'utilisateur indique quelle colonne contient quoi. */
export function ColumnMappingForm({ inspection, onSubmit, loading }: Props) {
  const [mapping, setMapping] = useState<GenericMapping>(() => withGuessedKinds(initialMapping(inspection), inspection));
  const columnOptions = [{ value: NONE, label: '—' }, ...inspection.headers.map(h => ({ value: h, label: h }))];
  const typeValues = mapping.typeColumn ? inspection.columnValues[mapping.typeColumn] ?? [] : [];
  const ready = !!mapping.dateColumn && !!mapping.typeColumn && Object.keys(mapping.typeValues).length > 0;

  const setColumn = (key: ColumnField, value: string) =>
    setMapping(m => {
      const next = { ...m, [key]: value === NONE ? null : value };
      return key === 'typeColumn' ? withGuessedKinds(next, inspection) : next;
    });
  const setTypeValue = (raw: string, kind: string) => setMapping(m => {
    const typeValues = { ...m.typeValues };
    if (kind === IGNORE) delete typeValues[raw]; else typeValues[raw] = kind as ImportKind;
    return { ...m, typeValues };
  });

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-2">
        <p className="text-sm font-medium">Aperçu du fichier ({inspection.rowCount} lignes)</p>
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="text-xs whitespace-nowrap">
            <thead><tr>{inspection.headers.map(h => <th key={h} className="text-left font-medium pr-4 pb-1">{h}</th>)}</tr></thead>
            <tbody>
              {inspection.sampleRows.map((row, i) => (
                <tr key={i} className="text-muted-foreground">{inspection.headers.map((_, j) => <td key={j} className="pr-4">{row[j]}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium">Quelle colonne contient quoi ?</p>
        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map(f => (
            <FormSelect key={f.key} label={f.label + (f.required ? ' *' : '')} hint={f.hint}
              value={mapping[f.key] ?? NONE} onChange={v => setColumn(f.key, v)} options={columnOptions} />
          ))}
          {!mapping.currencyColumn && (
            <FormSelect label="Devise par défaut" value={mapping.defaultCurrency}
              onChange={v => setMapping(m => ({ ...m, defaultCurrency: v }))}
              options={CURRENCIES.map(c => ({ value: c, label: c }))} />
          )}
        </div>
      </Card>

      {mapping.typeColumn && (
        <Card className="p-4 space-y-3">
          <p className="text-sm font-medium">Que signifie chaque type ?</p>
          {typeValues.length === 0 ? (
            <p className="text-xs text-muted-foreground">Cette colonne a trop de valeurs différentes : choisis une autre colonne pour le type.</p>
          ) : typeValues.map(raw => (
            <div key={raw} className="grid grid-cols-2 gap-3 items-center">
              <span className="text-sm truncate" title={raw}>{raw}</span>
              <FormSelect value={mapping.typeValues[raw] ?? IGNORE} onChange={v => setTypeValue(raw, v)}
                options={[{ value: IGNORE, label: 'Ignorer' }, ...IMPORT_KINDS.map(k => ({ value: k, label: IMPORT_KIND_LABEL[k] }))]} />
            </div>
          ))}
        </Card>
      )}

      <Button className="w-full" disabled={!ready} loading={loading} onClick={() => onSubmit(mapping)}>
        Voir l'aperçu
      </Button>
    </div>
  );
}
