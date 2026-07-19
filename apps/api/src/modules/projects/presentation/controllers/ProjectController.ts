import type { Request, Response } from "express";

import { CreateProjectUseCase } from "../../application/use-cases/CreateProjectUseCase.js";
import { GetAllProjectsUseCase } from "../../application/use-cases/GetAllProjectsUseCase.js";
import { UploadProjectUseCase } from "../../application/use-cases/UploadProjectUseCase.js";
import { MongoProjectRepository } from "../../infrastructure/repositories/MongoProjectRepository.js";
import { AppError } from "../../../../shared/AppError.js";

const repository = new MongoProjectRepository();

export class ProjectController {
  async getById(req: Request, res: Response): Promise<void> {
    const projectId = req.params.projectId as string;

    const project = await repository.findById(projectId);
    if (!project) {
      throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  }

  async create(req: Request, res: Response): Promise<void> {
    const { name } = req.body;

    const useCase = new CreateProjectUseCase(repository);
    const project = await useCase.execute(name);

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    const useCase = new GetAllProjectsUseCase(repository);
    const projects = await useCase.execute();

    res.status(200).json({
      success: true,
      data: projects,
    });
  }

  async upload(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      throw new AppError("No file uploaded", 400, "NO_FILE");
    }

    const zipName = req.file.originalname.replace(/\.zip$/i, "");

    const useCase = new UploadProjectUseCase(repository);
    const project = await useCase.execute(zipName, req.file.buffer);

    res.status(201).json({
      success: true,
      message: "Project uploaded successfully",
      data: project,
    });
  }
}
