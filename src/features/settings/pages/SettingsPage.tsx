import { useForm } from "react-hook-form";
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/Input';
import { LogOut } from 'lucide-react';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { useMe, useUpdateMe, useDeleteMe } from '@/features/settings/api/user.api';   
import type { UserUpdateRequest } from '@/features/settings/model/user.types';
import { useLogout } from "@/features/auth/api/auth.api";

export default function SettingsPage() {
  const me = useMe();
  const update = useUpdateMe();
  const del = useDeleteMe();
  const logout = useLogout();

  const { register, handleSubmit, setError, formState: { errors, isDirty } } = useForm<UserUpdateRequest>({
    values: me.data ? { username: me.data.username, preferredCurrency: me.data.preferredCurrency } : undefined,
  });

  const onDelete = () => {
    if (confirm('Supprimer définitivement ton compte et toutes tes données ?')) del.mutate(undefined, { onSuccess: logout });
  };

  return (
    <div className="space-y-6 pt-2">
      <h1 className="text-lg font-semibold">Réglages</h1>
      <QueryBoundary query={me}>
        {u => (
          <form onSubmit={handleSubmit(v => update.mutate(v, { onError: e => e.fieldErrors?.forEach(f => setError(f.field as keyof UserUpdateRequest, { message: f.message })) }))}
                className="space-y-4">
            <Card className="p-4 space-y-3">
              <p className="text-xs text-muted-foreground">Connecté en tant que <span className="text-foreground">{u.email}</span></p>
              <Input label="Nom d'utilisateur" {...register('username')} error={errors.username?.message} />
              <Input label="Devise d'affichage préférée" maxLength={3} {...register('preferredCurrency')} error={errors.preferredCurrency?.message}
                     hint="Les montants sont calculés en EUR ; la conversion d'affichage arrivera dans une prochaine version." />
            </Card>
            <Button type="submit" className="w-full" disabled={!isDirty} loading={update.isPending}>Enregistrer</Button>
          </form>
        )}
      </QueryBoundary>

      <Card className="p-4 space-y-3">
        <Button variant="outline" className="w-full" onClick={logout}><LogOut size={16} /> Se déconnecter</Button>
        <Button variant="destructive" className="w-full" onClick={onDelete} loading={del.isPending}>Supprimer mon compte</Button>
      </Card>
      <p className="text-center text-[11px] text-muted-foreground">FollowYourMoney · v{__APP_VERSION__}</p>
    </div>
  );
}