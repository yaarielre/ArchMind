import { Brain } from "lucide-react";
import { InfoCard } from "../ui/InfoCard";
import { InfoGrid } from "../ui/InfoGrid";
import { StatBox } from "../ui/StatBox";
import type { KnowledgeModel } from "../../types";

export function KnowledgeTab({
  knowledge,
  loading,
  onBuild,
}: {
  knowledge: KnowledgeModel | null;
  loading: boolean;
  onBuild: () => void;
}) {
  if (!knowledge) {
    return (
      <div className="text-center py-12">
        <Brain className="w-12 h-12 text-white/50 mx-auto mb-4" />
        <p className="text-white/70 mb-4">
          El Knowledge Model aun no ha sido generado
        </p>
        <button
          onClick={onBuild}
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 mx-auto"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Brain className="w-4 h-4" />
          )}
          Construir Knowledge Model
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InfoCard title="Proyecto">
        <InfoGrid
          items={[
            { label: "Nombre", value: knowledge.project.name },
            { label: "Version", value: knowledge.project.version },
            { label: "Entry Point", value: knowledge.project.entryPoint },
            {
              label: "Descripcion",
              value: knowledge.project.description || "N/A",
            },
          ]}
        />
      </InfoCard>

      <InfoCard title="Stack Tecnologico">
        <InfoGrid
          items={[
            { label: "Lenguajes", value: knowledge.stack.languages.join(", ") },
            { label: "Framework", value: knowledge.stack.framework || "N/A" },
            { label: "Runtime", value: knowledge.stack.runtime || "N/A" },
            {
              label: "Base de Datos",
              value: knowledge.stack.database || "N/A",
            },
            { label: "ORM", value: knowledge.stack.orm || "N/A" },
            { label: "Testing", value: knowledge.stack.testing || "N/A" },
            { label: "Bundler", value: knowledge.stack.bundler || "N/A" },
            {
              label: "Package Manager",
              value: knowledge.stack.packageManager || "N/A",
            },
          ]}
        />
      </InfoCard>

      <InfoCard title="Modulos">
        <div className="space-y-2">
          {knowledge.modules.map((m) => (
            <div
              key={m.name}
              className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
            >
              <div>
                <p className="text-sm font-medium text-white">{m.name}</p>
                <p className="text-xs text-white/50 font-mono">{m.path}</p>
              </div>
              <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                {m.files} archivos
              </span>
            </div>
          ))}
        </div>
      </InfoCard>

      <InfoCard title="Estadisticas">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox label="Archivos" value={knowledge.statistics.totalFiles} />
          <StatBox label="Carpetas" value={knowledge.statistics.totalFolders} />
          {Object.entries(knowledge.statistics.linesByLanguage)
            .slice(0, 4)
            .map(([lang, lines]) => (
              <StatBox key={lang} label={lang} value={lines} />
            ))}
        </div>
      </InfoCard>
    </div>
  );
}
