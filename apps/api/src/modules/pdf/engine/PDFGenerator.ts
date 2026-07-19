import type { IPDFGenerator } from "../domain/interfaces/IPDFGenerator.js";
import type { PDFResult, PDFConfig } from "../domain/entities/PDFResult.js";
import { MarkdownToHTML } from "./MarkdownToHTML.js";
import { buildHTMLDocument } from "./HTMLTemplate.js";
import { BrowserPool } from "./BrowserPool.js";

export class PDFGenerator implements IPDFGenerator {
  private readonly mdToHtml = new MarkdownToHTML();
  private readonly pool = BrowserPool.getInstance();

  async generate(markdown: string, projectName: string, config?: PDFConfig): Promise<PDFResult> {
    const metadata = this.extractMetadata(markdown);
    const bodyHTML = this.mdToHtml.convert(markdown);
    const fullHTML = buildHTMLDocument(projectName, bodyHTML, metadata);

    const browser = await this.pool.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setContent(fullHTML, { waitUntil: "load" });

      const pdfBuffer = await page.pdf({
        format: config?.format ?? "A4",
        margin: config?.margin ?? {
          top: "20mm",
          right: "15mm",
          bottom: "25mm",
          left: "15mm",
        },
        landscape: config?.landscape ?? false,
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: config?.headerTemplate ?? '<div style="font-size:7pt;width:100%;padding:0 50px;color:#94a3b8;text-align:right;font-family:Inter,system-ui,sans-serif;">ArchMind &middot; Documentacion Tecnica</div>',
        footerTemplate: config?.footerTemplate ?? '<div style="font-size:7pt;width:100%;padding:0 50px;color:#94a3b8;display:flex;justify-content:space-between;font-family:Inter,system-ui,sans-serif;"><span>Generado por ArchMind</span><span>Pagina <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>',
      });

      return {
        buffer: Buffer.from(pdfBuffer),
        filename: `${projectName.replace(/[^a-zA-Z0-9]/g, "_")}_documentation.pdf`,
        mimeType: "application/pdf",
        generatedAt: new Date(),
      };
    } finally {
      await page.close();
    }
  }

  private extractMetadata(markdown: string): { date?: string; fileCount?: number; folderCount?: number } {
    const date = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });

    const fileMatch = markdown.match(/\*\*Archivos Totales\*\*\s*\|?\s*(\d+)/i);
    const folderMatch = markdown.match(/\*\*Carpetas Totales\*\*\s*\|?\s*(\d+)/i);

    return {
      date,
      fileCount: fileMatch ? parseInt(fileMatch[1], 10) : undefined,
      folderCount: folderMatch ? parseInt(folderMatch[1], 10) : undefined,
    };
  }
}
