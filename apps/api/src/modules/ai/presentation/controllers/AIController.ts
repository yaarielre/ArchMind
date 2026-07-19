import type { Request, Response } from "express";

import { MongoProjectRepository } from "../../../projects/infrastructure/repositories/MongoProjectRepository.js";
import { ProjectKnowledgeBuilder } from "../../../knowledge/infrastructure/implementations/ProjectKnowledgeBuilder.js";
import { ProjectDocumentationGenerator } from "../../../documentation/infrastructure/implementations/ProjectDocumentationGenerator.js";
import { AIEnricher } from "../../infrastructure/implementations/AIEnricher.js";
import { AppError } from "../../../../shared/AppError.js";
import type { AIConfig, AIProvider } from "../../domain/entities/AIResult.js";

const repository = new MongoProjectRepository();
const knowledgeBuilder = new ProjectKnowledgeBuilder();
const docGenerator = new ProjectDocumentationGenerator();
const enricher = new AIEnricher();

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

    const knowledge = await knowledgeBuilder.build(
      project.sourcePath,
      project.analysis ?? {},
    );
    const documentation = await docGenerator.generate(
      knowledge,
      config.sections as never,
    );
    const result = await enricher.enrich(
      knowledge,
      documentation.sections,
      config,
    );

    res.status(200).json({
      success: true,
      message: "Documentation enriched with AI successfully",
      data: result,
    });
  }
}
