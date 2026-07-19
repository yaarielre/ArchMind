import { Project } from "../../domain/entities/Project.js";
import type { IProjectRepository } from "../../domain/repositories/IProjectRepository.js";

export class CreateProjectUseCase {
  constructor(private readonly repository: IProjectRepository) {}

  async execute(name: string): Promise<Project> {
    const project = new Project(name);

    return await this.repository.create(project);
  }
}
