import { MONTH_NAMES, type Wrapped } from './wrapped.types';

const pct = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;

/** Lignes de la carte à partager : des pourcentages, jamais un montant. */
export function shareLines(w: Wrapped): { big: string; lines: string[] } {
  const lines: string[] = [];
  if (w.benchmarkPct != null) {
    const diff = w.twrPct - w.benchmarkPct;
    lines.push(diff >= 0 ? `${pct(diff)} de mieux que le ${w.benchmarkName}` : `${w.benchmarkName} : ${pct(w.benchmarkPct)}`);
  }
  if (w.bestMonth != null) {
    const v = w.months[w.bestMonth - 1];
    if (v != null) lines.push(`Meilleur mois : ${MONTH_NAMES[w.bestMonth - 1]} (${pct(v)})`);
  }
  if (w.bestLine?.returnPct != null) lines.push(`Ma star : ${w.bestLine.name} (${pct(w.bestLine.returnPct)})`);
  lines.push(w.personality.title);
  return { big: pct(w.twrPct), lines };
}

/**
 * Image PNG (1080 × 1350) du bilan, prête à partager : fond dégradé, titre,
 * performance en très grand, quelques faits marquants en pourcentages.
 */
export async function renderShareCard(w: Wrapped): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const g = ctx.createLinearGradient(0, 0, 1080, 1350);
  g.addColorStop(0, '#312e81');
  g.addColorStop(0.55, '#4f46e5');
  g.addColorStop(1, '#0f766e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1080, 1350);

  const { big, lines } = shareLines(w);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '600 44px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillText(`Mon année ${w.year}${w.complete ? '' : ' (à date)'}`, 90, 190);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 220px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillText(big, 80, 470);
  ctx.font = '500 40px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('de performance', 90, 545);

  ctx.font = '600 46px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillStyle = '#ffffff';
  lines.forEach((line, i) => ctx.fillText(line.length > 38 ? `${line.slice(0, 37)}…` : line, 90, 720 + i * 95));

  ctx.font = '600 36px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('FollowYourMoney', 90, 1260);
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}
