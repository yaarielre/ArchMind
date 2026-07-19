import type {
  Project,
  KnowledgeModel,
  DocumentationResult,
  AIConfig,
  AIEnrichResult,
  SectionType,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// Projects
export function getProjects() {
  return request<{ success: boolean; data: Project[] }>(
    "/projects/gettingAllData"
  );
}

export function getProject(projectId: string) {
  return request<{ success: boolean; data: Project }>(
    `/projects/${projectId}`
  );
}

export function uploadProject(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return request<{ success: boolean; data: Project }>(
    "/projects/upload/project/zip",
    { method: "POST", body: formData }
  );
}

// Knowledge
export function buildKnowledge(projectId: string) {
  return request<{ success: boolean; data: KnowledgeModel }>(
    `/knowledge/${projectId}/build`,
    { method: "POST" }
  );
}

// Documentation
export function generateDocumentation(
  projectId: string,
  sections?: SectionType[]
) {
  return request<{ success: boolean; data: DocumentationResult }>(
    `/documentation/${projectId}/generate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections }),
    }
  );
}

// AI
export function enrichWithAI(projectId: string, config: AIConfig) {
  return request<{ success: boolean; data: AIEnrichResult }>(
    `/ai/${projectId}/enrich`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    }
  );
}

// PDF
export async function generatePDFFromMarkdown(
  markdown: string,
  projectName: string
): Promise<Blob> {
  const res = await fetch(`${API_URL}/pdf/from-markdown/raw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown, projectName, format: "A4" }),
  });
  if (!res.ok) throw new Error("Failed to generate PDF");
  return res.blob();
}
