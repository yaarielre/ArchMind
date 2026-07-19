export function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 bg-white/5 rounded-lg">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      <p className="text-xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  );
}
