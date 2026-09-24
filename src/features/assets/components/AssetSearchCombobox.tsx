import { useEffect, useMemo, useState } from 'react';
import { ASSET_SEARCH_MIN_LENGTH, useAssetSearch } from '@/features/transactions/api/transaction.api';
import type { AssetSearchResult } from '@/features/assets/model/asset.types';
import { ASSET_TYPE_LABEL, type AssetType } from '@/shared/model/enums';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover';
import { Button } from '@/shared/ui/button';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const DEBOUNCE_MS = 300;

interface Props {
  value?: AssetSearchResult | null;
  onChange: (asset: AssetSearchResult) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function AssetSearchCombobox({
  value,
  onChange,
  disabled = false,
  placeholder = 'Rechercher un actif...',
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query]);

  const { data: results = [], isFetching } = useAssetSearch(debounced, open);
  const tooShort = query.trim().length < ASSET_SEARCH_MIN_LENGTH;
  // Pendant la frappe, la requête debouncée n'est pas encore partie : on considère que ça charge
  const loading = !tooShort && (isFetching || debounced !== query.trim());

  // Groupe les résultats par type pour un affichage plus lisible
  const grouped = useMemo(() => {
    const groups = new Map<AssetType, AssetSearchResult[]>();
    results.forEach(r => groups.set(r.assetType, [...(groups.get(r.assetType) ?? []), r]));
    return [...groups.entries()];
  }, [results]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value ? (
            <span>
              <strong>{value.symbol}</strong>
              <span className="ml-2 text-muted-foreground text-sm">{value.name}</span>
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
            disabled={disabled}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}

            {tooShort && (
              <CommandEmpty>Tape au moins {ASSET_SEARCH_MIN_LENGTH} caractères...</CommandEmpty>
            )}

            {!tooShort && !loading && results.length === 0 && (
              <CommandEmpty>Aucun résultat pour "{query}"</CommandEmpty>
            )}

            {!tooShort && !loading &&
              grouped.map(([type, items]) => (
                <CommandGroup key={type} heading={ASSET_TYPE_LABEL[type] ?? type}>
                  {items.map(item => (
                    <CommandItem
                      key={`${item.symbol}-${item.exchange}`}
                      value={item.symbol}
                      onSelect={() => {
                        onChange(item);
                        setOpen(false);
                        setQuery('');
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value?.symbol === item.symbol
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{item.symbol}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.name}
                          {item.exchange && (
                            <span className="ml-2">· {item.exchange}</span>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
