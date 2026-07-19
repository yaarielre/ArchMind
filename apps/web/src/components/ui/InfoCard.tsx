import type { ReactNode } from "react";

export function InfoCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 p-5">
      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}
