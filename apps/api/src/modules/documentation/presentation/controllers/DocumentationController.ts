import type { Request, Response } from "express";

import { MongoProjectRepository } from "../../../projects/infrastructure/repositories/MongoProjectRepository.js";
import { ProjectKnowledgeBuilder } from "../../../knowledge/infrastructure/implementations/ProjectKnowledgeBuilder.js";
import { ProjectDocumentationGenerator } from "../../infrastructure/implementations/ProjectDocumentationGenerator.js";
import { AppError } from "../../../../shared/AppError.js";
import type { SectionType } from "../../domain/entities/DocumentationResult.js";
import type { KnowledgeModel } from "../../../knowledge/domain/entities/KnowledgeModel.js";

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

    const sections = req.body?.sections as SectionType[] | undefined;

    if (project.documentationResult && !sections) {
      res.status(200).json({
        success: true,
        message: "Documentation generated successfully",
        data: project.documentationResult,
      });
      return;
    }

    let knowledge: KnowledgeModel;
    if (project.knowledgeModel) {
      knowledge = project.knowledgeModel as unknown as KnowledgeModel;
    } else {
      knowledge = await knowledgeBuilder.build(project.sourcePath, project.analysis ?? {});
      project.knowledgeModel = knowledge as unknown as Record<string, unknown>;
    }

    const documentation = await docGenerator.generate(knowledge, sections);

    if (!sections) {
      project.documentationResult = documentation as unknown as Record<string, unknown>;
    }
    await repository.update(project);

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

    if (project.documentationResult) {
      res.status(200).json({
        success: true,
        data: project.documentationResult,
      });
      return;
    }

    let knowledge: KnowledgeModel;
    if (project.knowledgeModel) {
      knowledge = project.knowledgeModel as unknown as KnowledgeModel;
    } else {
      knowledge = await knowledgeBuilder.build(project.sourcePath, project.analysis ?? {});
      project.knowledgeModel = knowledge as unknown as Record<string, unknown>;
    }

    const documentation = await docGenerator.generate(knowledge);
    project.documentationResult = documentation as unknown as Record<string, unknown>;
    await repository.update(project);

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
