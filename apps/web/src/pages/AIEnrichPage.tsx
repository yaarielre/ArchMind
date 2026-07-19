import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sparkles, ArrowLeft, Download } from "lucide-react";
import { useProject, useAIEnrich, usePDFDownload } from "../hooks";
import { loadAIConfig } from "../config/ai";
import { useToast } from "../components/Toast";
import { ALL_SECTION_IDS } from "../config/sections";
import { SectionSelector } from "../components/SectionSelector";
import { MarkdownPreview } from "../components/MarkdownPreview";
import { LoadingOverlay } from "../components/LoadingOverlay";
import type { AIConfig, SectionType } from "../types";

export function AIEnrichPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { project, loading: loadingProject, fetchProject } = useProject();
  const {
    result: aiResult,
    loading: loadingAI,
    enrich: enrichAI,
  } = useAIEnrich(id);
  const { download: downloadPDF, loading: loadingPDF } = usePDFDownload();

  const [aiConfig] = useState<AIConfig>(() => loadAIConfig());
  const [sections, setSections] = useState<SectionType[]>(ALL_SECTION_IDS);

  useEffect(() => {
    if (id) fetchProject(id);
  }, [id, fetchProject]);

  const handleEnrich = async () => {
    if (!aiConfig.apiKey) {
      toast("error", "Configura tu API Key en Configuracion de IA (sidebar)");
      return;
    }
    if (sections.length === 0) {
      toast("error", "Selecciona al menos una seccion para enriquecer");
      return;
    }
    const data = await enrichAI(aiConfig, sections);
    if (data)
      toast(
        "success",
        `${data.sections.length} secciones enriquecidas (${data.totalTokens} tokens)`,
      );
  };

  const handleDownloadPDF = async (markdown: string, name: string) => {
    const ok = await downloadPDF(markdown, name);
    if (ok) toast("success", "PDF descargado correctamente");
  };

  return (
    <div className="max-w-5xl">
      {loadingAI && <LoadingOverlay message="Generando con IA" />}
      {loadingPDF && <LoadingOverlay message="Generando PDF..." />}

      <div className="mb-6">
        <button
          onClick={() => navigate(`/project/${id}`)}
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al proyecto
        </button>
        {loadingProject ? (
          <div className="animate-pulse space-y-2">
            <div className="h-7 bg-white/20 rounded w-1/3" />
            <div className="h-4 bg-white/10 rounded w-1/4" />
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-1">
              Generar con IA
            </h1>
            <p className="text-sm text-white/60">
              {project?.name ?? "Proyecto"} &middot; Usa inteligencia artificial
              para mejorar la documentacion
            </p>
          </>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 p-5 space-y-6">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-xs text-white/40 mb-2">
              Configuracion de IA actual:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-white/50">Provider:</span>{" "}
                <span className="text-white">{aiConfig.provider}</span>
              </div>
              <div>
                <span className="text-white/50">Modelo:</span>{" "}
                <span className="text-white">{aiConfig.model}</span>
              </div>
            </div>
            <p className="text-[10px] text-white/30 mt-2">
              Cambia estos valores en <strong>Configuracion de IA</strong> en el
              sidebar
            </p>
          </div>
          <SectionSelector
            selected={sections}
            onChange={setSections}
            disabled={loadingAI}
          />
          <button
            onClick={handleEnrich}
            disabled={loadingAI || !aiConfig.apiKey || sections.length === 0}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loadingAI ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generar con IA
          </button>
        </div>

        {aiResult && !loadingAI && (
          <>
            <p className="text-sm text-white/50">
              {aiResult.totalTokens} tokens usados con{" "}
              <span className="font-medium text-white/80">
                {aiResult.model}
              </span>
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">
                  Documentacion Generada con IA
                </h3>
                <button
                  onClick={() =>
                    handleDownloadPDF(
                      aiResult.fullMarkdown,
                      project?.name ?? "project",
                    )
                  }
                  disabled={loadingPDF}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {loadingPDF ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-3 h-3" />
                  )}
                  PDF
                </button>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                <MarkdownPreview content={aiResult.fullMarkdown} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
