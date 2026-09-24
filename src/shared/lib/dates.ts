// Dates « locales » pour les champs de formulaire et le back (LocalDate /
// LocalDateTime sans fuseau). Surtout pas toISOString() : il passe en UTC et
// décale le jour entre minuit et 1-2 h du matin en France.

const pad = (n: number) => String(n).padStart(2, '0');

/** Aujourd'hui, "YYYY-MM-DD" (input type="date", LocalDate). */
export const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Maintenant, "YYYY-MM-DDTHH:mm" (input type="datetime-local"). */
export const nowLocalDateTime = () => {
  const d = new Date();
  return `${todayLocal()}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
