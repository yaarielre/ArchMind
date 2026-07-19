import { FileText, Download } from "lucide-react";
import { SectionSelector } from "../SectionSelector";
import { MarkdownPreview } from "../MarkdownPreview";
import type { DocumentationResult, SectionType } from "../../types";

export function DocsTab({
  sections,
  onSectionsChange,
  docs,
  loading,
  loadingPDF,
  onGenerate,
  onDownloadPDF,
  projectName,
}: {
  sections: SectionType[];
  onSectionsChange: (s: SectionType[]) => void;
  docs: DocumentationResult | null;
  loading: boolean;
  loadingPDF: boolean;
  onGenerate: () => void;
  onDownloadPDF: (md: string, name: string) => void;
  projectName: string;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 p-5">
        <SectionSelector
          selected={sections}
          onChange={onSectionsChange}
          disabled={loading}
        />
        <div className="mt-4 flex gap-3">
          <button
            onClick={onGenerate}
            disabled={loading || sections.length === 0}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Generar Documentacion
          </button>
          {docs && (
            <button
              onClick={() => onDownloadPDF(docs.markdown, projectName)}
              disabled={loadingPDF}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loadingPDF ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Descargar PDF
            </button>
          )}
        </div>
      </div>

      {docs && !loading && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Documentacion Generada</h3>
            <span className="text-xs text-white/50">
              {docs.sections.length} secciones &middot;{" "}
              {new Date(docs.generatedAt).toLocaleString("es-ES")}
            </span>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            <MarkdownPreview content={docs.markdown} />
          </div>
        </div>
      )}
    </div>
  );
}
