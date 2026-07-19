import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import type { KnowledgeModel } from "../../knowledge/domain/entities/KnowledgeModel.js";
import type { DocumentSection, SectionType, DocumentationResult } from "../domain/entities/DocumentationResult.js";
import { SECTION_ORDER } from "../domain/entities/DocumentationResult.js";
import { TemplateEngine } from "./TemplateEngine.js";
import { SectionGenerator } from "./SectionGenerator.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, "..", "templates");

const SECTION_TITLES: Record<SectionType, string> = {
  "executive-summary": "Resumen Ejecutivo",
  "architecture": "Arquitectura",
  "stack": "Stack Tecnologico",
  "dependencies": "Dependencias",
  "modules": "Modulos",
  "statistics": "Estadisticas",
  "recommendations": "Recomendaciones",
};

const SECTION_FILES: Record<SectionType, string> = {
  "executive-summary": "executive-summary.md",
  "architecture": "architecture.md",
  "stack": "stack.md",
  "dependencies": "dependencies.md",
  "modules": "modules.md",
  "statistics": "statistics.md",
  "recommendations": "recommendations.md",
};

const templateCache = new Map<string, string>();

export class DocumentationBuilder {
  private readonly engine = new TemplateEngine();
  private readonly sectionGen = new SectionGenerator();

  async generate(knowledge: KnowledgeModel, sections?: SectionType[]): Promise<DocumentationResult> {
    const sectionTypes = sections ?? SECTION_ORDER;
    const data = this.sectionGen.generateData(knowledge);
    const documentSections: DocumentSection[] = [];

    for (let i = 0; i < sectionTypes.length; i++) {
      const sectionType = sectionTypes[i];
      const content = await this.renderSection(sectionType, data);
      if (content) {
        documentSections.push({
          id: sectionType,
          title: SECTION_TITLES[sectionType],
          content,
          order: i,
        });
      }
    }

    const markdown = this.assembleMarkdown(knowledge.project.name, documentSections);

    return {
      markdown,
      sections: documentSections,
      generatedAt: new Date(),
    };
  }

  private async renderSection(sectionType: SectionType, data: object): Promise<string | null> {
    const templateFile = SECTION_FILES[sectionType];
    if (!templateFile) return null;

    const templatePath = join(TEMPLATES_DIR, templateFile);
    const template = await this.loadTemplate(templatePath);
    if (!template) return null;

    return this.engine.render(template, data);
  }

  private async loadTemplate(path: string): Promise<string | null> {
    const cached = templateCache.get(path);
    if (cached) return cached;

    try {
      const content = await readFile(path, "utf-8");
      templateCache.set(path, content);
      return content;
    } catch {
      return null;
    }
  }

  private assembleMarkdown(projectName: string, sections: DocumentSection[]): string {
    const parts = [`# ${projectName}\n`];

    for (const section of sections) {
      parts.push(section.content);
      parts.push("");
    }

    return parts.join("\n");
  }
}
