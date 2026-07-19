import type { Request, Response } from "express";

import { MongoProjectRepository } from "../../../projects/infrastructure/repositories/MongoProjectRepository.js";
import { ProjectAnalysisEngine } from "../../infrastructure/implementations/ProjectAnalysisEngine.js";
import { AppError } from "../../../../shared/AppError.js";

const repository = new MongoProjectRepository();
const engine = new ProjectAnalysisEngine();

export class AnalysisController {
  async getByProject(req: Request, res: Response): Promise<void> {
    const projectId = req.params.projectId as string;

    const project = await repository.findById(projectId);
    if (!project) {
      throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
    }

    res.status(200).json({
      success: true,
      data: project.analysis ?? null,
    });
  }

  async reanalyze(req: Request, res: Response): Promise<void> {
    const projectId = req.params.projectId as string;

    const project = await repository.findById(projectId);
    if (!project) {
      throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
    }

    if (!project.sourcePath) {
      throw new AppError("Project has no source files", 400, "NO_SOURCE");
    }

    project.analysis = await engine.analyze(project.sourcePath);

    await repository.update(project);

    res.status(200).json({
      success: true,
      message: "Project reanalyzed successfully",
      data: project.analysis,
    });
  }
}
