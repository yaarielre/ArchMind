import type { KnowledgeModel } from "../../../knowledge/domain/entities/KnowledgeModel.js";
import type { DocumentationResult, SectionType } from "../entities/DocumentationResult.js";

export interface IDocumentationGenerator {
  generate(knowledge: KnowledgeModel, sections?: SectionType[]): Promise<DocumentationResult>;
}
