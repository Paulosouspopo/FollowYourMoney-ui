import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const THEMES = ['system', 'light', 'dark'] as const;
export type Theme = typeof THEMES[number];
export const THEME_LABEL: Record<Theme, string> = { system: 'Système', light: 'Clair', dark: 'Sombre' };

/** Même clé que le script anti-flash de index.html : les deux doivent rester alignés. */
export const THEME_STORAGE_KEY = 'fym-theme';

interface ThemeState { theme: Theme; setTheme: (t: Theme) => void; }

export const useThemeStore = create<ThemeState>()(persist(
  (set) => ({ theme: 'system', setTheme: (theme) => set({ theme }) }),
  { name: THEME_STORAGE_KEY },
));

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

/** Applique la classe `.dark` sur <html> et suit le thème système si choisi. */
export function useApplyTheme() {
  const theme = useThemeStore(s => s.theme);
  useEffect(() => {
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && darkQuery().matches);
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    };
    apply();
    if (theme !== 'system') return;
    const mq = darkQuery();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
}
