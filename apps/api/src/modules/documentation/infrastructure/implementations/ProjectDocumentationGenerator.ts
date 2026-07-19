import type { KnowledgeModel } from "../../../knowledge/domain/entities/KnowledgeModel.js";
import type { IDocumentationGenerator } from "../../domain/interfaces/IDocumentationGenerator.js";
import type { DocumentationResult, SectionType } from "../../domain/entities/DocumentationResult.js";
import { DocumentationBuilder } from "../../engine/DocumentationBuilder.js";

export class ProjectDocumentationGenerator implements IDocumentationGenerator {
  private readonly builder = new DocumentationBuilder();

  async generate(knowledge: KnowledgeModel, sections?: SectionType[]): Promise<DocumentationResult> {
    return await this.builder.generate(knowledge, sections);
  }
}
