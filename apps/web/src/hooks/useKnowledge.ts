import { useState, useCallback } from "react";
import { buildKnowledge } from "../api/client";
import type { KnowledgeModel } from "../types";

export function useKnowledge(projectId: string | undefined) {
  const [knowledge, setKnowledge] = useState<KnowledgeModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const build = useCallback(async () => {
    if (!projectId) return null;
    setLoading(true);
    setError(null);
    try {
      const res = await buildKnowledge(projectId);
      setKnowledge(res.data);
      return res.data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al construir Knowledge Model");
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  return { knowledge, loading, error, build, setKnowledge };
}
