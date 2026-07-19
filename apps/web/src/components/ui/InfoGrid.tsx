export function InfoGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map(({ label, value }) => (
        <div key={label}>
          <p className="text-xs text-white/50 mb-0.5">{label}</p>
          <p className="text-sm font-medium text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}
