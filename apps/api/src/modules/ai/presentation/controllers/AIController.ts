import type { Request, Response } from "express";

import { MongoProjectRepository } from "../../../projects/infrastructure/repositories/MongoProjectRepository.js";
import { ProjectKnowledgeBuilder } from "../../../knowledge/infrastructure/implementations/ProjectKnowledgeBuilder.js";
import { ProjectDocumentationGenerator } from "../../../documentation/infrastructure/implementations/ProjectDocumentationGenerator.js";
import { AIEnricher } from "../../infrastructure/implementations/AIEnricher.js";
import { AppError } from "../../../../shared/AppError.js";
import type { AIConfig, AIProvider, AIEnrichResult } from "../../domain/entities/AIResult.js";
import type { KnowledgeModel } from "../../../knowledge/domain/entities/KnowledgeModel.js";
import type { DocumentationResult } from "../../../documentation/domain/entities/DocumentationResult.js";
import { createHash } from "node:crypto";

const repository = new MongoProjectRepository();
const knowledgeBuilder = new ProjectKnowledgeBuilder();
const docGenerator = new ProjectDocumentationGenerator();
const enricher = new AIEnricher();

function configHash(config: AIConfig, sectionIds?: string[]): string {
  const payload = `${config.provider}:${config.model}:${config.baseUrl}:${(sectionIds ?? []).sort().join(",")}`;
  return createHash("md5").update(payload).digest("hex");
}

export class AIController {
  async enrich(req: Request, res: Response): Promise<void> {
    const projectId = req.params.projectId as string;

    const project = await repository.findById(projectId);
    if (!project) {
      throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
    }

    if (!project.sourcePath) {
      throw new AppError("Project has no source files", 400, "NO_SOURCE");
    }

    const config: AIConfig = {
      provider: (req.body?.provider as AIProvider) ?? "openai",
      model: req.body?.model,
      apiKey: req.body?.apiKey,
      baseUrl: req.body?.baseUrl,
      sections: req.body?.sections,
    };

    if (!config.apiKey && !process.env.OPENAI_API_KEY) {
      throw new AppError(
        "API key is required. Provide in body or set OPENAI_API_KEY.",
        400,
        "NO_API_KEY",
      );
    }

    const sectionIds = config.sections as string[] | undefined;
    const hash = configHash(config, sectionIds);

    if (project.aiResults && project.aiResults.length > 0) {
      const cached = project.aiResults.find(
        (r) => (r as Record<string, unknown>).configHash === hash
      ) as AIEnrichResult | undefined;
      if (cached) {
        res.status(200).json({
          success: true,
          message: "Documentation enriched with AI successfully (cached)",
          data: cached,
        });
        return;
      }
    }

    let knowledge: KnowledgeModel;
    if (project.knowledgeModel) {
      knowledge = project.knowledgeModel as unknown as KnowledgeModel;
    } else {
      knowledge = await knowledgeBuilder.build(project.sourcePath, project.analysis ?? {});
      project.knowledgeModel = knowledge as unknown as Record<string, unknown>;
    }

    let documentation: DocumentationResult;
    if (project.documentationResult && !sectionIds) {
      documentation = project.documentationResult as unknown as DocumentationResult;
    } else {
      documentation = await docGenerator.generate(knowledge, config.sections as never);
    }

    const result = await enricher.enrich(
      knowledge,
      documentation.sections,
      config,
    );

    const resultWithHash = { ...result, configHash: hash } as unknown as Record<string, unknown>;
    if (!project.aiResults) project.aiResults = [];
    project.aiResults.push(resultWithHash);
    await repository.update(project);

    res.status(200).json({
      success: true,
      message: "Documentation enriched with AI successfully",
      data: result,
    });
  }
}
