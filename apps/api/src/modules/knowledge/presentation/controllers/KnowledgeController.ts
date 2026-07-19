import type { Request, Response } from "express";

import { MongoProjectRepository } from "../../../projects/infrastructure/repositories/MongoProjectRepository.js";
import { ProjectKnowledgeBuilder } from "../../infrastructure/implementations/ProjectKnowledgeBuilder.js";
import { AppError } from "../../../../shared/AppError.js";
import type { KnowledgeModel } from "../../domain/entities/KnowledgeModel.js";

const repository = new MongoProjectRepository();
const builder = new ProjectKnowledgeBuilder();

export class KnowledgeController {
  async getByProject(req: Request, res: Response): Promise<void> {
    const projectId = req.params.projectId as string;

    const project = await repository.findById(projectId);
    if (!project) {
      throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
    }

    if (!project.sourcePath || !project.analysis) {
      throw new AppError("Project has no analysis data", 400, "NO_ANALYSIS");
    }

    if (project.knowledgeModel) {
      res.status(200).json({
        success: true,
        data: project.knowledgeModel,
      });
      return;
    }

    const knowledge = await builder.build(project.sourcePath, project.analysis);
    project.knowledgeModel = knowledge as unknown as Record<string, unknown>;
    await repository.update(project);

    res.status(200).json({
      success: true,
      data: knowledge,
    });
  }

  async buildForProject(req: Request, res: Response): Promise<void> {
    const projectId = req.params.projectId as string;

    const project = await repository.findById(projectId);
    if (!project) {
      throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
    }

    if (!project.sourcePath) {
      throw new AppError("Project has no source files", 400, "NO_SOURCE");
    }

    const knowledge = await builder.build(project.sourcePath, project.analysis ?? {}) as KnowledgeModel;
    project.knowledgeModel = knowledge as unknown as Record<string, unknown>;
    await repository.update(project);

    res.status(200).json({
      success: true,
      message: "Knowledge model built successfully",
      data: knowledge,
    });
  }
}
