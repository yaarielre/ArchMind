export function SkeletonCard() {
  return (
    <div className="p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 animate-pulse">
      <div className="h-4 bg-white/20 rounded w-3/4 mb-3" />
      <div className="h-3 bg-white/10 rounded w-1/2 mb-4" />
      <div className="flex gap-2">
        <div className="h-5 bg-white/10 rounded-full w-16" />
        <div className="h-5 bg-white/10 rounded-full w-12" />
      </div>
    </div>
  );
}

export function SkeletonSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-10 h-10 border-4 border-white/20 border-t-blue-400 rounded-full animate-spin" />
      <p className="text-sm text-white/50">Procesando...</p>
    </div>
  );
}
