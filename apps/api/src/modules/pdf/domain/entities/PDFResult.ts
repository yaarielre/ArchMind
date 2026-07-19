export interface PDFResult {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  generatedAt: Date;
}

export interface PDFConfig {
  format?: "A4" | "Letter" | "Legal";
  margin?: { top: string; right: string; bottom: string; left: string };
  headerTemplate?: string;
  footerTemplate?: string;
  landscape?: boolean;
}
