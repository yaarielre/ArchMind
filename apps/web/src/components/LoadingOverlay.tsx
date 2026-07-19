export function LoadingOverlay({ message = "Procesando..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-white/10 border-t-blue-400 rounded-full animate-spin" />
          <div className="absolute inset-0 w-14 h-14 border-4 border-transparent border-b-purple-400/40 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-white">{message}</p>
          <p className="text-xs text-white/40 mt-1">Esto puede tomar un momento...</p>
        </div>
      </div>
    </div>
  );
}
