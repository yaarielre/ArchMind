import { Project } from "../entities/Project.js";

export interface IProjectRepository {
  create(project: Project): Promise<Project>;
  findAll(): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  update(project: Project): Promise<Project>;
}
