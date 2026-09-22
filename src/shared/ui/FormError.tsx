export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="text-xs text-loss mt-1">{message}</p>;
}