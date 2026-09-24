import { useState } from "react";
import { useForm } from "react-hook-form";
import { LogOut, Monitor, Moon, Sun } from 'lucide-react';
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
    <div className="space-y-6 pt-2">
      <h1 className="text-lg font-semibold">Réglages</h1>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Apparence</h2>
        <Card className="p-4"><ThemePicker /></Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Notifications</h2>
        <PushSettingsCard />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Profil</h2>
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
        <h2 className="text-sm font-medium">Compte</h2>
        <Card className="p-4 space-y-3">
          <Button variant="outline" className="w-full" onClick={logout}><LogOut size={16} /> Se déconnecter</Button>
          <Button variant="destructive" className="w-full" onClick={() => setConfirmDelete(true)}>Supprimer mon compte</Button>
        </Card>
      </section>

      <p className="text-center text-[11px] text-muted-foreground">FollowYourMoney · v{__APP_VERSION__} · montants en EUR</p>

      <ConfirmDialog open={confirmDelete} onOpenChange={setConfirmDelete}
        title="Supprimer ton compte ?" description="Tous tes portefeuilles, transactions et historiques seront définitivement supprimés."
        confirmLabel="Supprimer mon compte" loading={del.isPending}
        onConfirm={() => del.mutate(undefined, { onSuccess: logout, onError: e => toast.error(e.message) })} />
    </div>
  );
}
