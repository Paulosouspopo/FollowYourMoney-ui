import { Button } from "@/shared/ui/button";
import { FormError } from "@/shared/ui/FormError";
import { Input } from "@/shared/ui/Input";
import { z } from "zod";
import { useRegister } from "../api/auth.api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { AuthLayout } from "@/features/auth/layout/AuthLayout";
import { CheckEmail } from "@/features/auth/components/CheckEmail";
import { newPasswordFields, passwordsMatch, PASSWORDS_DIFFER } from "@/features/auth/model/password";

const schema = z.object({
  username: z.string().trim().min(1, "Nom d'utilisateur requis"),
  email: z.string().email('Email invalide'),
  ...newPasswordFields,
}).refine(passwordsMatch, PASSWORDS_DIFFER);
type Form = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register, handleSubmit, setError, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });
  const reg = useRegister();

  const onSubmit = ({ confirm: _c, ...v }: Form) =>
    reg.mutate({ ...v, preferredCurrency: 'EUR' }, {
      onError: e => e.fieldErrors?.forEach(f => setError(f.field as keyof Form, { message: f.message })),
    });

  if (reg.isSuccess) {
    return <AuthLayout title="Vérifie ta boîte mail"><CheckEmail email={reg.data.email} /></AuthLayout>;
  }

  return (
    <AuthLayout title="Créer un compte" subtitle="Suis ton patrimoine en un coup d'œil">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Nom d'utilisateur" autoComplete="username" {...register('username')} error={errors.username?.message} />
        <Input label="Email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />
        <Input label="Mot de passe" type="password" autoComplete="new-password" {...register('password')} error={errors.password?.message} />
        <Input label="Confirmation" type="password" autoComplete="new-password" {...register('confirm')} error={errors.confirm?.message} />
        {reg.isError && !reg.error.fieldErrors && (
          <FormError message={reg.error.status === 409 ? 'Cet email ou ce nom d\'utilisateur est déjà utilisé' : reg.error.message} />
        )}
        <Button type="submit" className="w-full" loading={reg.isPending}>Créer mon compte</Button>
      </form>
      <p className="text-center text-sm text-muted-foreground mt-6">Déjà inscrit ? <Link to="/login" className="text-primary">Se connecter</Link></p>
    </AuthLayout>
  );
}
