import { ProjectModel } from "../../../../database/index.js";
import { Project } from "../../domain/entities/Project.js";
import type { IProjectRepository } from "../../domain/repositories/IProjectRepository.js";
import { appCache } from "../../../../shared/cache/MemoryCache.js";

const CACHE_PREFIX = "project:";

function projectFromDoc(doc: InstanceType<typeof ProjectModel>): Project {
  return new Project(
    doc.name,
    doc._id.toString(),
    doc.createdAt,
    doc.sourcePath,
    doc.analysis,
    doc.knowledgeModel,
    doc.documentationResult,
    doc.aiResults as unknown as Record<string, unknown>[],
    doc.pdfMetadata,
  );
}

export class MongoProjectRepository implements IProjectRepository {
  async create(project: Project): Promise<Project> {
    const doc = await ProjectModel.create({
      _id: project.id,
      name: project.name,
      sourcePath: project.sourcePath,
      analysis: project.analysis,
      createdAt: project.createdAt,
    });
    const result = projectFromDoc(doc);
    appCache.set(CACHE_PREFIX + result.id, result, 600);
    return result;
  }

  async findAll(): Promise<Project[]> {
    const docs = await ProjectModel.find().sort({ createdAt: -1 });
    return docs.map(projectFromDoc);
  }

  async findById(id: string): Promise<Project | null> {
    const cached = appCache.get<Project>(CACHE_PREFIX + id);
    if (cached) return cached;

    const doc = await ProjectModel.findById(id);
    if (!doc) return null;
    const project = projectFromDoc(doc);
    appCache.set(CACHE_PREFIX + id, project, 600);
    return project;
  }

  async update(project: Project): Promise<Project> {
    const updateData: Record<string, unknown> = {
      sourcePath: project.sourcePath,
      analysis: project.analysis,
    };
    if (project.knowledgeModel !== undefined) updateData.knowledgeModel = project.knowledgeModel;
    if (project.documentationResult !== undefined) updateData.documentationResult = project.documentationResult;
    if (project.aiResults !== undefined) updateData.aiResults = project.aiResults;
    if (project.pdfMetadata !== undefined) updateData.pdfMetadata = project.pdfMetadata;

    const doc = await ProjectModel.findByIdAndUpdate(project.id, updateData, { returnDocument: "after" });
    if (!doc) throw new Error("Project not found");
    const updated = projectFromDoc(doc);
    appCache.set(CACHE_PREFIX + project.id, updated, 600);
    return updated;
  }
}
