import { ChevronRight } from "lucide-react";
import { SkeletonSpinner } from "../Skeleton";
import type { Analysis } from "../../types";

export function AnalysisTab({
  analysis,
  loading,
}: {
  analysis: Analysis | undefined;
  loading: boolean;
}) {
  const architectureEvidence = (confidence: number) => {
    if (confidence >= 0.85) return "Evidencia muy solida";
    if (confidence >= 0.7) return "Evidencia solida";
    if (confidence >= 0.55) return "Evidencia moderada";
    return "Evidencia inicial";
  };
  if (loading) return <SkeletonSpinner />;
  if (!analysis) {
    return (
      <div className="text-center py-16 text-white/50">
        <div className="w-12 h-12 mx-auto mb-3 opacity-60">
          <ChevronRight />
        </div>
        <p className="text-sm">No hay datos de analisis</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-3">
          Lenguajes
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {analysis.languages.map((lang) => (
            <div
              key={lang.name}
              className="p-4 bg-slate-900/85 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl shadow-black/40 hover:border-white/20 transition-colors"
            >
              <p className="text-xs text-white/50 mb-1">{lang.name}</p>
              <p className="text-2xl font-bold text-white">{lang.files}</p>
              <p className="text-xs text-white/50">
                archivos &middot; {lang.percentage.toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {analysis.frameworks.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-3">
            Frameworks
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.frameworks.map((fw) => (
              <div
                key={fw.name}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900/85 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl shadow-black/40"
              >
                <span className="text-sm font-medium text-white">
                  {fw.name}
                </span>
                <span className="text-xs text-white/60 bg-white/10 px-1.5 py-0.5 rounded">
                  {(fw.confidence * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-3">
          Arquitectura
        </h3>
        <div className="bg-slate-900/85 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 shadow-2xl shadow-black/40">
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <p className="text-xs text-white/50 mb-1">Patron</p>
              <p className="text-sm font-semibold text-white">
                {analysis.architecture.pattern}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/50 mb-1">Nivel de evidencia</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${analysis.architecture.confidence * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-white/80">
                  {(analysis.architecture.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-[11px] text-white/50 mt-1.5">
                {architectureEvidence(analysis.architecture.confidence)}: basada en {analysis.architecture.indicators.length} indicadores estructurales.
              </p>
            </div>
          </div>
          {analysis.architecture.indicators.length > 0 && (
            <div>
              <p className="text-xs text-white/50 mb-2">Indicadores</p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.architecture.indicators.map((ind) => (
                  <span
                    key={ind}
                    className="px-2.5 py-1 bg-white/5 text-white/70 text-xs rounded-lg border border-white/10"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {analysis.dependencies.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-3">
            Dependencias ({analysis.dependencies.length})
          </h3>
          <div className="bg-slate-900/85 backdrop-blur-2xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/40">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-white/60 uppercase">
                    Paquete
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-white/60 uppercase">
                    Version
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-white/60 uppercase">
                    Tipo
                  </th>
                </tr>
              </thead>
              <tbody>
                {analysis.dependencies.slice(0, 20).map((dep) => (
                  <tr
                    key={dep.name}
                    className="border-b border-white/10 last:border-0"
                  >
                    <td className="px-4 py-2 font-medium text-white">
                      {dep.name}
                    </td>
                    <td className="px-4 py-2 text-white/50 font-mono text-xs">
                      {dep.version}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full font-medium ${dep.type === "production" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}
                      >
                        {dep.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {analysis.dependencies.length > 20 && (
              <p className="text-xs text-white/40 text-center py-2 border-t border-white/10">
                + {analysis.dependencies.length - 20} mas
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
