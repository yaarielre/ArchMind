import { ProjectModel } from "../../../../database/index.js";
import { Project } from "../../domain/entities/Project.js";
import type { IProjectRepository } from "../../domain/repositories/IProjectRepository.js";

export class MongoProjectRepository implements IProjectRepository {
  async create(project: Project): Promise<Project> {
    const doc = await ProjectModel.create({
      _id: project.id,
      name: project.name,
      sourcePath: project.sourcePath,
      analysis: project.analysis,
      createdAt: project.createdAt,
    });
    return new Project(doc.name, doc._id.toString(), doc.createdAt, doc.sourcePath, doc.analysis);
  }

  async findAll(): Promise<Project[]> {
    const docs = await ProjectModel.find().sort({ createdAt: -1 });
    return docs.map((doc) =>
      new Project(doc.name, doc._id.toString(), doc.createdAt, doc.sourcePath, doc.analysis),
    );
  }

  async findById(id: string): Promise<Project | null> {
    const doc = await ProjectModel.findById(id);
    if (!doc) return null;
    return new Project(doc.name, doc._id.toString(), doc.createdAt, doc.sourcePath, doc.analysis);
  }

  async update(project: Project): Promise<Project> {
    const doc = await ProjectModel.findByIdAndUpdate(
      project.id,
      { sourcePath: project.sourcePath, analysis: project.analysis },
      { new: true },
    );
    if (!doc) throw new Error("Project not found");
    return new Project(doc.name, doc._id.toString(), doc.createdAt, doc.sourcePath, doc.analysis);
  }
}
