import type { KnowledgeModel } from "../entities/KnowledgeModel.js";

export interface IKnowledgeBuilder {
  build(projectDir: string, analysisResult: unknown): Promise<KnowledgeModel>;
}
