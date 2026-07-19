import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  useProject,
  useKnowledge,
  useDocumentation,
  usePDFDownload,
} from "../hooks";
import { useToast } from "../components/Toast";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { ALL_SECTION_IDS } from "../config/sections";
import {
  AnalysisTab,
  KnowledgeTab,
  DocsTab,
  ProjectTabs,
} from "../components/project";
import type { SectionType } from "../types";

export type Tab = "analysis" | "knowledge" | "docs";

const TAB_LABELS: Record<Tab, string> = {
  analysis: "Analisis",
  knowledge: "Knowledge Model",
  docs: "Documentacion",
};

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { project, loading: loadingProject, fetchProject } = useProject();
  const {
    knowledge,
    loading: loadingKnowledge,
    build: buildKnowledge,
  } = useKnowledge(id);
  const {
    docs,
    loading: loadingDocs,
    generate: generateDocs,
  } = useDocumentation(id);
  const { download: downloadPDF, loading: loadingPDF } = usePDFDownload();

  const [tab, setTab] = useState<Tab>("analysis");
  const [docSections, setDocSections] =
    useState<SectionType[]>(ALL_SECTION_IDS);

  useEffect(() => {
    if (id) fetchProject(id);
  }, [id, fetchProject]);

  const stepsCompleted: Record<Tab, boolean> = {
    analysis: !!project?.analysis,
    knowledge: !!knowledge,
    docs: !!docs,
  };

  const handleTabClick = (tabId: Tab) => {
    const order: Tab[] = ["analysis", "knowledge", "docs"];
    const idx = order.indexOf(tabId);
    for (let i = 0; i < idx; i++) {
      if (!stepsCompleted[order[i]]) {
        toast(
          "error",
          `Debes completar "${TAB_LABELS[order[i]]}" antes de avanzar al siguiente paso`,
        );
        return;
      }
    }
    setTab(tabId);
  };

  const handleBuildKnowledge = async () => {
    const data = await buildKnowledge();
    if (data) toast("success", "Knowledge Model construido correctamente");
  };

  const handleGenerateDocs = async () => {
    if (docSections.length === 0) {
      toast("error", "Selecciona al menos una seccion");
      return;
    }
    const data = await generateDocs(docSections);
    if (data) toast("success", `${data.sections.length} secciones generadas`);
  };

  const handleDownloadPDF = async (markdown: string, name: string) => {
    const ok = await downloadPDF(markdown, name);
    if (ok) toast("success", "PDF descargado correctamente");
  };

  return (
    <div className="max-w-5xl">
      {loadingDocs && <LoadingOverlay message="Generando documentacion..." />}
      {loadingPDF && <LoadingOverlay message="Generando PDF..." />}

      <div className="mb-6">
        {loadingProject ? (
          <div className="animate-pulse space-y-2">
            <div className="h-7 bg-white/20 rounded w-1/3" />
            <div className="h-4 bg-white/10 rounded w-1/4" />
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-1">
              {project?.name ?? "Proyecto"}
            </h1>
            <p className="text-sm text-white/60">ID: {id}</p>
          </>
        )}
      </div>

      <ProjectTabs
        active={tab}
        stepsCompleted={stepsCompleted}
        onTabClick={handleTabClick}
      />

      {tab === "analysis" && (
        <AnalysisTab analysis={project?.analysis} loading={loadingProject} />
      )}
      {tab === "knowledge" && (
        <KnowledgeTab
          knowledge={knowledge}
          loading={loadingKnowledge}
          onBuild={handleBuildKnowledge}
        />
      )}
      {tab === "docs" && (
        <DocsTab
          sections={docSections}
          onSectionsChange={setDocSections}
          docs={docs}
          loading={loadingDocs}
          loadingPDF={loadingPDF}
          onGenerate={handleGenerateDocs}
          onDownloadPDF={handleDownloadPDF}
          projectName={project?.name ?? "project"}
        />
      )}
    </div>
  );
}
