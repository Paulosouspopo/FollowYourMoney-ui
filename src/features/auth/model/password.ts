import { z } from 'zod';

/** Miroir des règles du back (8 à 72 caractères : limite de bcrypt). */
export const passwordSchema = z.string()
  .min(8, '8 caractères minimum')
  .max(72, '72 caractères maximum');

/** Nouveau mot de passe + confirmation identique. */
export const newPasswordFields = {
  password: passwordSchema,
  confirm: z.string().min(1, 'Confirme le mot de passe'),
};
export const passwordsMatch = (v: { password: string; confirm: string }) => v.password === v.confirm;
export const PASSWORDS_DIFFER = { path: ['confirm'], message: 'Les mots de passe diffèrent' };
