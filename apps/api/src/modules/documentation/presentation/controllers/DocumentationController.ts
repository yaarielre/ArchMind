import type { Request, Response } from "express";

import { MongoProjectRepository } from "../../../projects/infrastructure/repositories/MongoProjectRepository.js";
import { ProjectKnowledgeBuilder } from "../../../knowledge/infrastructure/implementations/ProjectKnowledgeBuilder.js";
import { ProjectDocumentationGenerator } from "../../infrastructure/implementations/ProjectDocumentationGenerator.js";
import { AppError } from "../../../../shared/AppError.js";
import type { SectionType } from "../../domain/entities/DocumentationResult.js";

const repository = new MongoProjectRepository();
const knowledgeBuilder = new ProjectKnowledgeBuilder();
const docGenerator = new ProjectDocumentationGenerator();

export class DocumentationController {
  async generate(req: Request, res: Response): Promise<void> {
    const projectId = req.params.projectId as string;

    const project = await repository.findById(projectId);
    if (!project) {
      throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
    }

    if (!project.sourcePath) {
      throw new AppError("Project has no source files", 400, "NO_SOURCE");
    }

    const knowledge = await knowledgeBuilder.build(project.sourcePath, project.analysis ?? {});
    const sections = req.body?.sections as SectionType[] | undefined;
    const documentation = await docGenerator.generate(knowledge, sections);

    res.status(200).json({
      success: true,
      message: "Documentation generated successfully",
      data: documentation,
    });
  }

  async get(req: Request, res: Response): Promise<void> {
    const projectId = req.params.projectId as string;

    const project = await repository.findById(projectId);
    if (!project) {
      throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
    }

    if (!project.sourcePath) {
      throw new AppError("Project has no source files", 400, "NO_SOURCE");
    }

    const knowledge = await knowledgeBuilder.build(project.sourcePath, project.analysis ?? {});
    const documentation = await docGenerator.generate(knowledge);

    res.status(200).json({
      success: true,
      data: documentation,
    });
  }

  async getSections(_req: Request, res: Response): Promise<void> {
    const { SECTION_ORDER } = await import("../../domain/entities/DocumentationResult.js");

    res.status(200).json({
      success: true,
      data: SECTION_ORDER,
    });
  }
}
