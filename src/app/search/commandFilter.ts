/** Sans accents ni majuscules : « thème » trouve « theme ». */
const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/**
 * Chaque mot cherché doit commencer un mot de l'élément (« nvidia » ne trouve
 * plus « Revenus » par lettres éparses, comme le faisait la recherche floue).
 */
export function commandFilter(value: string, search: string) {
  const words = normalize(value).split(/[^\p{L}\p{N}^.=-]+/u);
  return normalize(search).split(/\s+/).filter(Boolean)
    .every(q => words.some(w => w.startsWith(q))) ? 1 : 0;
}
