// components/AssetSearchCombobox.tsx
'use client';

import { useState, useMemo } from 'react';
import { useAssetSearch } from '@/features/transactions/api/transaction.api';
import type{ AssetSearchResult } from '@/features/assets/model/asset.types';
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

  // Debounce simple : ne lance la requête que si la query a au moins 1 car
  // (geré par useAssetSearch)
  const { data: results = [], isLoading } = useAssetSearch(query, open);

  // Groupe les résultats par type pour un affichage plus lisible
  const grouped = useMemo(() => {
    const groups: Record<string, AssetSearchResult[]> = {};
    results.forEach(r => {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    });
    return groups;
  }, [results]);

  const typeLabels: Record<string, string> = {
    CRYPTO: '🪙 Cryptomonnaies',
    EQUITY: '📈 Actions',
    ETF: '🎯 ETF',
    FUND: '💼 Fonds',
    FOREX: '💱 Devises',
    UNKNOWN: '❓ Autres',
  };

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

      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
            disabled={disabled}
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && query.trim().length === 0 && (
              <CommandEmpty>Tape au moins 1 caractère...</CommandEmpty>
            )}

            {!isLoading && query.trim().length > 0 && results.length === 0 && (
              <CommandEmpty>Aucun résultat pour "{query}"</CommandEmpty>
            )}

            {!isLoading &&
              Object.entries(grouped).map(([type, items]) => (
                <CommandGroup
                  key={type}
                  heading={typeLabels[type] || type}
                >
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