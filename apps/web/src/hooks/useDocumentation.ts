import { useState, useCallback } from "react";
import { generateDocumentation } from "../api/client";
import type { DocumentationResult, SectionType } from "../types";

export function useDocumentation(projectId: string | undefined) {
  const [docs, setDocs] = useState<DocumentationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (sections: SectionType[]) => {
      if (!projectId) return null;
      setLoading(true);
      setError(null);
      try {
        const res = await generateDocumentation(projectId, sections);
        setDocs(res.data);
        return res.data;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al generar documentacion");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  return { docs, loading, error, generate, setDocs };
}
