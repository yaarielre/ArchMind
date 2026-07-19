import type { KnowledgeModel } from "../../domain/entities/KnowledgeModel.js";
import type { IKnowledgeBuilder } from "../../domain/interfaces/IKnowledgeBuilder.js";
import { KnowledgeBuilder } from "../../engine/KnowledgeBuilder.js";

export class ProjectKnowledgeBuilder implements IKnowledgeBuilder {
  private readonly builder = new KnowledgeBuilder();

  async build(projectDir: string, analysisResult: unknown): Promise<KnowledgeModel> {
    return await this.builder.build(projectDir, analysisResult as never);
  }
}
