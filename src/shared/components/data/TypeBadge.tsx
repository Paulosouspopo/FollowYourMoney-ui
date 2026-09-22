export function TypeBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase"
      style={{ background: color + '26', color }}
    >
      {label}
    </span>
  );
}