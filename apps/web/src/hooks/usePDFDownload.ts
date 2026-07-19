import { useState, useCallback } from "react";
import { generatePDFFromMarkdown } from "../api/client";

export function usePDFDownload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(
    async (markdown: string, projectName: string) => {
      setLoading(true);
      setError(null);
      try {
        const blob = await generatePDFFromMarkdown(markdown, projectName);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${projectName}_documentation.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al generar PDF");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { download, loading, error };
}
