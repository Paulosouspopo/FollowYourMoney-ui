import { useState } from "react";
import { useForm } from "react-hook-form";
import { ChevronRight, LogOut, Monitor, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GUIDE_NAV_ITEM } from '@/app/layout/nav';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/Input';
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { toast } from "@/shared/ui/toast.store";
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { cn } from "@/shared/lib/cn";
import { THEMES, THEME_LABEL, useThemeStore, type Theme } from "@/shared/theme/theme.store";
import { useMe, useUpdateMe, useDeleteMe } from '@/features/settings/api/user.api';
import type { UserUpdateRequest } from '@/features/settings/model/user.types';
import { useLogout } from "@/features/auth/api/auth.api";
import { SecuritySection } from "@/features/settings/components/SecuritySection";
import { PushSettingsCard } from "@/features/notifications/components/PushSettingsCard";
import { usePrivacyStore } from "@/shared/privacy/privacy.store";
import { Switch } from "@/shared/ui/Switch";
import { DISPLAY_CURRENCIES, DISPLAY_CURRENCY_LABEL, useDisplayCurrencyStore } from "@/shared/currency/displayCurrency.store";

const THEME_ICON: Record<Theme, typeof Sun> = { system: Monitor, light: Sun, dark: Moon };

function ThemePicker() {
  const { theme, setTheme } = useThemeStore();
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Thème">
      {THEMES.map(t => {
        const Icon = THEME_ICON[t];
        return (
          <button key={t} type="button" role="radio" aria-checked={theme === t} onClick={() => setTheme(t)}
            className={cn('flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-medium transition-colors',
              theme === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}>
            <Icon size={18} />{THEME_LABEL[t]}
          </button>
        );
      })}
    </div>
  );
}

function CurrencyPicker() {
  const { currency, setCurrency } = useDisplayCurrencyStore();
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Devise d'affichage">
        {DISPLAY_CURRENCIES.map(c => (
          <button key={c} type="button" role="radio" aria-checked={currency === c} onClick={() => setCurrency(c)}
            className={cn('rounded-xl border py-2.5 text-xs font-medium transition-colors',
              currency === c ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}>
            {DISPLAY_CURRENCY_LABEL[c]}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Montants convertis au taux du jour, courbes au taux de chaque jour. Calculs, saisies et performances restent en euros.
      </p>
    </div>
  );
}

function PrivacySwitch() {
  const { hidden, setHidden } = usePrivacyStore();
  return (
    <Switch checked={hidden} onChange={setHidden} label="Mode confidentialité"
      description="Montants et quantités masqués (••••) ; pourcentages et cours visibles. Aussi via l'œil à côté du patrimoine." />
  );
}

export default function SettingsPage() {
  const me = useMe();
  const update = useUpdateMe();
  const del = useDeleteMe();
  const logout = useLogout();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { register, handleSubmit, setError, formState: { errors, isDirty } } = useForm<UserUpdateRequest>({
    values: me.data ? { username: me.data.username } : undefined,
  });

  const onSubmit = (v: UserUpdateRequest) => update.mutate(v, {
    onSuccess: () => toast.success('Profil enregistré'),
    onError: e => e.fieldErrors?.length
      ? e.fieldErrors.forEach(f => setError(f.field as keyof UserUpdateRequest, { message: f.message }))
      : toast.error(e.message),
  });

  return (
    <div className="space-y-6 pt-4 lg:max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Réglages</h1>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold tracking-tight">Apparence</h2>
        <Card className="p-4 space-y-4"><ThemePicker /><CurrencyPicker /><PrivacySwitch /></Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold tracking-tight">Notifications</h2>
        <PushSettingsCard />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold tracking-tight">Profil</h2>
        <QueryBoundary query={me}>
          {u => (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <Card className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground">Connecté en tant que <span className="text-foreground">{u.email}</span></p>
                <Input label="Nom d'utilisateur" {...register('username')} error={errors.username?.message} />
              </Card>
              <Button type="submit" className="w-full" disabled={!isDirty} loading={update.isPending}>Enregistrer</Button>
            </form>
          )}
        </QueryBoundary>
      </section>

      <SecuritySection />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold tracking-tight">Aide</h2>
        <Card className="p-0 gap-0">
          <Link to={GUIDE_NAV_ITEM.to} className="group flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary"><GUIDE_NAV_ITEM.icon size={18} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{GUIDE_NAV_ITEM.label}</p>
              <p className="truncate text-xs text-muted-foreground">{GUIDE_NAV_ITEM.description}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground/60 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold tracking-tight">Compte</h2>
        <Card className="p-4 space-y-3">
          <Button variant="outline" className="w-full" onClick={logout}><LogOut size={16} /> Se déconnecter</Button>
          <Button variant="destructive" className="w-full" onClick={() => setConfirmDelete(true)}>Supprimer mon compte</Button>
        </Card>
      </section>

      <p className="text-center text-[11px] text-muted-foreground">FollowYourMoney · v{__APP_VERSION__}</p>

      <ConfirmDialog open={confirmDelete} onOpenChange={setConfirmDelete}
        title="Supprimer ton compte ?" description="Tous tes portefeuilles, transactions et historiques seront définitivement supprimés."
        confirmLabel="Supprimer mon compte" loading={del.isPending}
        onConfirm={() => del.mutate(undefined, { onSuccess: logout, onError: e => toast.error(e.message) })} />
    </div>
  );
}
