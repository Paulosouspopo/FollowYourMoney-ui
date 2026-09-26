import { useEffect, useEffectEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, Globe, Moon, Plus, Sun, Wallet } from 'lucide-react';
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut,
} from '@/shared/ui/command';
import { useDashboard } from '@/features/dashboard/api/dashboard.api';
import { useAssetSearch, ASSET_SEARCH_MIN_LENGTH } from '@/features/assets/api/assetSearch.api';
import { marketPath } from '@/features/markets/model/market.types';
import { usePrivacyStore } from '@/shared/privacy/privacy.store';
import { useThemeStore } from '@/shared/theme/theme.store';
import { PORTFOLIO_TYPE_LABEL } from '@/shared/model/enums';
import { displaySymbol } from '@/shared/model/portfolioRules';
import { GUIDE_NAV_ITEM, NAV_ITEMS, SECONDARY_NAV_ITEMS, TRASH_NAV_ITEM } from '../layout/nav';
import { useSearchStore } from './search.store';
import { commandFilter } from './commandFilter';

const PAGES = [...NAV_ITEMS, ...SECONDARY_NAV_ITEMS, GUIDE_NAV_ITEM, TRASH_NAV_ITEM];

/**
 * Recherche globale (Ctrl+K, ⌘K ou « / ») : pages, portefeuilles, lignes,
 * actions rapides et actifs Yahoo (fiche de marché).
 */
export function CommandPalette() {
  const { open, setOpen } = useSearchStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const portfolios = useDashboard('30d').data?.portfolios ?? [];
  const market = useAssetSearch(debounced, open && debounced.length >= ASSET_SEARCH_MIN_LENGTH).data ?? [];
  const { hidden, toggle: togglePrivacy } = usePrivacyStore();
  const { theme, setTheme } = useThemeStore();

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName));
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setOpen(!open);
    } else if (e.key === '/' && !typing && !open) {
      e.preventDefault();
      setOpen(true);
    }
  });
  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKey(e);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const go = (to: string) => { setOpen(false); setQuery(''); navigate(to); };
  const run = (action: () => void) => { setOpen(false); setQuery(''); action(); };
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  // Résultats Yahoo : gardés tels quels pour un code (ISIN, ticker avec chiffres) que leur nom ne contient pas
  const marketTail = /\d/.test(debounced) ? debounced : '';
  const positions = portfolios.flatMap(p => p.positions.filter(pos => pos.quantity > 0).map(pos => ({ ...pos, portfolio: p })));

  return (
    <CommandDialog open={open} onOpenChange={o => { setOpen(o); if (!o) setQuery(''); }}
      title="Rechercher" description="Pages, portefeuilles, lignes, actions et marchés">
      <Command filter={commandFilter}>
        <CommandInput placeholder="Rechercher une page, une ligne, un actif…" value={query} onValueChange={setQuery} />
        <CommandList className="max-h-[60vh]">
          <CommandEmpty>Aucun résultat.</CommandEmpty>
          <CommandGroup heading="Pages">
            {PAGES.map(p => (
              <CommandItem key={p.to} value={`page ${p.label} ${'description' in p ? p.description : ''}`} onSelect={() => go(p.to)}>
                <p.icon /> {p.label}
              </CommandItem>
            ))}
          </CommandGroup>
          {portfolios.length > 0 && (
            <CommandGroup heading="Portefeuilles">
              {portfolios.map(p => (
                <CommandItem key={p.portfolioId} value={`portefeuille ${p.name} ${PORTFOLIO_TYPE_LABEL[p.type]}`}
                  onSelect={() => go(`/portfolios/${p.portfolioId}`)}>
                  <Wallet /> {p.name}
                  <CommandShortcut>{PORTFOLIO_TYPE_LABEL[p.type]}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {positions.length > 0 && (
            <CommandGroup heading="Mes lignes">
              {positions.map(pos => (
                <CommandItem key={`${pos.portfolio.portfolioId}-${pos.assetId}`}
                  value={`ligne ${pos.name} ${displaySymbol(pos.symbol)} ${pos.portfolio.name}`}
                  onSelect={() => go(`/portfolios/${pos.portfolio.portfolioId}/positions/${encodeURIComponent(pos.symbol)}`)}>
                  <span className="min-w-0 flex-1 truncate">{pos.name}</span>
                  <CommandShortcut>{pos.portfolio.name}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandGroup heading="Actions">
            <CommandItem value="action nouveau portefeuille créer compte" onSelect={() => go('/portfolios?nouveau=1')}>
              <Plus /> Nouveau portefeuille
            </CommandItem>
            <CommandItem value="action masquer afficher montants confidentialité discret" onSelect={() => run(togglePrivacy)}>
              {hidden ? <Eye /> : <EyeOff />} {hidden ? 'Afficher les montants' : 'Masquer les montants'}
            </CommandItem>
            <CommandItem value="action thème sombre clair apparence" onSelect={() => run(() => setTheme(dark ? 'light' : 'dark'))}>
              {dark ? <Sun /> : <Moon />} {dark ? 'Passer en thème clair' : 'Passer en thème sombre'}
            </CommandItem>
            <CommandItem value="action aide guide tutoriel visite lexique" onSelect={() => go('/guide')}>
              <BookOpen /> Ouvrir le guide d'utilisation
            </CommandItem>
          </CommandGroup>
          {market.length > 0 && (
            <CommandGroup heading="Marchés">
              {market.slice(0, 6).map(m => (
                <CommandItem key={m.symbol} value={`marché ${m.symbol} ${m.name} ${marketTail}`} onSelect={() => go(marketPath(m.symbol))}>
                  <Globe /> <span className="min-w-0 flex-1 truncate">{m.name}</span>
                  <CommandShortcut>{m.symbol}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
