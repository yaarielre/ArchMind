import type { PDFResult, PDFConfig } from "../entities/PDFResult.js";

export interface IPDFGenerator {
  generate(markdown: string, projectName: string, config?: PDFConfig): Promise<PDFResult>;
}
