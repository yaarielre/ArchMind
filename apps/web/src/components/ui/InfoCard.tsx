import type { ReactNode } from "react";

export function InfoCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-slate-900/85 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 shadow-2xl shadow-black/40">
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}
