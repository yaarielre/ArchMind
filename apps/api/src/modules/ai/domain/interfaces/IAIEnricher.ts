import type { KnowledgeModel } from "../../../knowledge/domain/entities/KnowledgeModel.js";
import type { DocumentSection } from "../../../documentation/domain/entities/DocumentationResult.js";
import type { AIEnrichResult, AIConfig } from "../entities/AIResult.js";

export interface IAIEnricher {
  enrich(
    knowledge: KnowledgeModel,
    sections: DocumentSection[],
    config: AIConfig
  ): Promise<AIEnrichResult>;
}
