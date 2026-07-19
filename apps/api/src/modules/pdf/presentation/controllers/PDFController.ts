import type { Request, Response } from "express";

import { MongoProjectRepository } from "../../../projects/infrastructure/repositories/MongoProjectRepository.js";
import { ProjectKnowledgeBuilder } from "../../../knowledge/infrastructure/implementations/ProjectKnowledgeBuilder.js";
import { ProjectDocumentationGenerator } from "../../../documentation/infrastructure/implementations/ProjectDocumentationGenerator.js";
import { PDFGenerator } from "../../engine/PDFGenerator.js";
import { AppError } from "../../../../shared/AppError.js";
import type { PDFConfig } from "../../domain/entities/PDFResult.js";
import type { KnowledgeModel } from "../../../knowledge/domain/entities/KnowledgeModel.js";
import type { DocumentationResult } from "../../../documentation/domain/entities/DocumentationResult.js";

const repository = new MongoProjectRepository();
const knowledgeBuilder = new ProjectKnowledgeBuilder();
const docGenerator = new ProjectDocumentationGenerator();
const pdfGenerator = new PDFGenerator();

export class PDFController {
  async generate(req: Request, res: Response): Promise<void> {
    const projectId = req.params.projectId as string;

    const project = await repository.findById(projectId);
    if (!project) {
      throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
    }

    if (!project.sourcePath) {
      throw new AppError("Project has no source files", 400, "NO_SOURCE");
    }

    const config: PDFConfig = {
      format: req.body?.format ?? "A4",
      landscape: req.body?.landscape ?? false,
    };

    let knowledge: KnowledgeModel;
    if (project.knowledgeModel) {
      knowledge = project.knowledgeModel as unknown as KnowledgeModel;
    } else {
      knowledge = await knowledgeBuilder.build(project.sourcePath, project.analysis ?? {});
      project.knowledgeModel = knowledge as unknown as Record<string, unknown>;
    }

    let documentation: DocumentationResult;
    if (project.documentationResult) {
      documentation = project.documentationResult as unknown as DocumentationResult;
    } else {
      documentation = await docGenerator.generate(knowledge);
      project.documentationResult = documentation as unknown as Record<string, unknown>;
    }

    const pdf = await pdfGenerator.generate(documentation.markdown, knowledge.project.name, config);

    res.setHeader("Content-Type", pdf.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${pdf.filename}"`);
    res.send(pdf.buffer);
  }

  async generateFromMarkdown(req: Request, res: Response): Promise<void> {
    const { markdown, projectName } = req.body;

    if (!markdown || !projectName) {
      throw new AppError("markdown and projectName are required", 400, "MISSING_FIELDS");
    }

    const config: PDFConfig = {
      format: req.body?.format ?? "A4",
      landscape: req.body?.landscape ?? false,
    };

    const pdf = await pdfGenerator.generate(markdown, projectName, config);

    res.setHeader("Content-Type", pdf.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${pdf.filename}"`);
    res.send(pdf.buffer);
  }
}
