import { useState } from 'react';
import { Copy, KeyRound, ShieldCheck } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/Input';
import { FormError } from '@/shared/ui/FormError';
import { toast } from '@/shared/ui/toast.store';
import {
  useDisableTwoFactor, useEnableTwoFactor, useRegenerateRecoveryCodes, useSetupTwoFactor, useTwoFactorStatus,
} from '../api/account.api';
import { QrCode } from './QrCode';

/** Codes de secours : affichés une seule fois, à copier ou télécharger. */
function RecoveryCodes({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  const text = codes.join('\n');
  const save = () => {
    const url = URL.createObjectURL(new Blob([`Codes de secours FollowYourMoney (usage unique)\n\n${text}\n`], { type: 'text/plain' }));
    Object.assign(document.createElement('a'), { href: url, download: 'codes-de-secours-followyourmoney.txt' }).click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-3">
      <p className="text-sm">
        <span className="font-semibold">Garde ces codes de secours en lieu sûr.</span> Chacun remplace une fois le code de
        l'application si tu perds ton téléphone. Ils ne seront plus affichés.
      </p>
      <ul className="grid grid-cols-2 gap-1.5 rounded-xl bg-muted p-3 font-mono text-sm" aria-label="Codes de secours">
        {codes.map(c => <li key={c}>{c}</li>)}
      </ul>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(text).then(() => toast.success('Codes copiés'))}>
          <Copy size={14} /> Copier
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={save}>Télécharger</Button>
        <Button type="button" size="sm" className="ml-auto" onClick={onDone}>C'est noté</Button>
      </div>
    </div>
  );
}

/**
 * Double authentification : activation (QR code ou clé à saisir, puis premier
 * code), codes de secours, régénération, désactivation (mot de passe + code).
 */
export function TwoFactorCard() {
  const status = useTwoFactorStatus().data;
  const setup = useSetupTwoFactor();
  const enable = useEnableTwoFactor();
  const regenerate = useRegenerateRecoveryCodes();
  const disable = useDisableTwoFactor();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [codes, setCodes] = useState<string[] | null>(null);
  const [mode, setMode] = useState<'idle' | 'disable' | 'regenerate'>('idle');

  if (!status) return null;
  if (codes) {
    return <Card className="p-4"><RecoveryCodes codes={codes} onDone={() => { setCodes(null); setCode(''); }} /></Card>;
  }

  if (!status.enabled) {
    return (
      <Card className="p-4 gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary"><KeyRound size={16} /></span>
          <div>
            <p className="text-sm font-semibold">Double authentification</p>
            <p className="text-xs text-muted-foreground">
              En plus du mot de passe, un code à 6 chiffres de ton application (Google Authenticator, Authy, 1Password…).
            </p>
          </div>
        </div>
        {!setup.data ? (
          <Button type="button" variant="outline" loading={setup.isPending}
            onClick={() => setup.mutate(undefined, { onError: e => toast.error(e.message) })}>
            Activer la double authentification
          </Button>
        ) : (
          <form className="space-y-3" onSubmit={e => {
            e.preventDefault();
            enable.mutate(code.replace(/\s/g, ''), { onSuccess: setCodes });
          }}>
            <p className="text-sm">1. Scanne ce QR code avec ton application :</p>
            <div className="flex flex-col items-center gap-2">
              <QrCode value={setup.data.otpauthUri} label="QR code à scanner avec l'application d'authentification" />
              <a href={setup.data.otpauthUri} className="text-xs text-primary sm:hidden">Ouvrir dans l'application</a>
            </div>
            <p className="text-xs text-muted-foreground">
              Ou saisis cette clé : <span className="select-all break-all font-mono text-foreground">{setup.data.secret.match(/.{1,4}/g)?.join(' ')}</span>
            </p>
            <Input label="2. Code affiché par l'application" inputMode="numeric" autoComplete="one-time-code" placeholder="123 456"
              value={code} onChange={e => setCode(e.target.value)} />
            {enable.isError && <FormError message={enable.error.message} />}
            <Button type="submit" className="w-full" disabled={code.replace(/\s/g, '').length !== 6} loading={enable.isPending}>
              Confirmer et activer
            </Button>
          </form>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-4 gap-3">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gain/15 text-gain"><ShieldCheck size={16} /></span>
        <div>
          <p className="text-sm font-semibold">Double authentification active</p>
          <p className="text-xs text-muted-foreground">
            {status.recoveryCodesLeft} code{status.recoveryCodesLeft > 1 ? 's' : ''} de secours restant{status.recoveryCodesLeft > 1 ? 's' : ''}.
          </p>
        </div>
      </div>
      {mode === 'idle' ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setMode('regenerate')}>Nouveaux codes de secours</Button>
          <Button type="button" variant="ghost" size="sm" className="text-loss" onClick={() => setMode('disable')}>Désactiver</Button>
        </div>
      ) : (
        <form className="space-y-3" onSubmit={e => {
          e.preventDefault();
          if (mode === 'disable') {
            disable.mutate({ password, code }, {
              onSuccess: () => { toast.success('Double authentification désactivée'); setMode('idle'); setCode(''); setPassword(''); },
            });
          } else {
            regenerate.mutate(code, { onSuccess: c => { setCodes(c); setMode('idle'); } });
          }
        }}>
          {mode === 'disable' && (
            <Input label="Mot de passe" type="password" autoComplete="current-password" value={password}
              onChange={e => setPassword(e.target.value)} />
          )}
          <Input label="Code de l'application (ou de secours)" autoComplete="one-time-code" value={code}
            onChange={e => setCode(e.target.value)} />
          {(mode === 'disable' ? disable : regenerate).isError && (
            <FormError message={(mode === 'disable' ? disable : regenerate).error?.message} />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setMode('idle')}>Annuler</Button>
            <Button type="submit" className="flex-1" variant={mode === 'disable' ? 'destructive' : 'default'}
              loading={disable.isPending || regenerate.isPending} disabled={!code}>
              {mode === 'disable' ? 'Désactiver' : 'Générer'}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
