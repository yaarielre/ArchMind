import { useState, useCallback } from "react";
import { enrichWithAI } from "../api/client";
import type { AIConfig, AIEnrichResult, SectionType } from "../types";

export function useAIEnrich(projectId: string | undefined) {
  const [result, setResult] = useState<AIEnrichResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enrich = useCallback(
    async (config: AIConfig, sections: SectionType[]) => {
      if (!projectId) return null;
      setLoading(true);
      setError(null);
      try {
        const res = await enrichWithAI(projectId, { ...config, sections });
        setResult(res.data);
        return res.data;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al enriquecer con IA");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  return { result, loading, error, enrich, setResult };
}
