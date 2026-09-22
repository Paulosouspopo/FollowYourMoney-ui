const url = import.meta.env.VITE_API_URL;
if (!url) throw new Error('VITE_API_URL manquant');
export const env = { apiUrl: url as string };