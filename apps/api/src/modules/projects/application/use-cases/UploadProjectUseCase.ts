import AdmZip from "adm-zip";
import { mkdir } from "node:fs/promises";
import { join, normalize, resolve, sep } from "node:path";

import { Project } from "../../domain/entities/Project.js";
import type { IProjectRepository } from "../../domain/repositories/IProjectRepository.js";
import { ProjectAnalysisEngine } from "../../../analysis/infrastructure/implementations/ProjectAnalysisEngine.js";

const engine = new ProjectAnalysisEngine();

export class UploadProjectUseCase {
  constructor(private readonly repository: IProjectRepository) {}

  async execute(name: string, zipBuffer: Buffer): Promise<Project> {
    const project = new Project(name);
    const projectDir = join("uploads", "projects", project.id);
    const zip = new AdmZip(zipBuffer);
    this.validateArchive(zip, projectDir);
    await mkdir(projectDir, { recursive: true });
    zip.extractAllTo(projectDir, true);

    project.sourcePath = projectDir;
    project.analysis = await engine.analyze(projectDir);

    return await this.repository.create(project);
  }

  private validateArchive(zip: AdmZip, destination: string): void {
    const entries = zip.getEntries();
    const maxEntries = 10_000;
    const maxUncompressedBytes = 250 * 1024 * 1024;
    const totalSize = entries.reduce((total, entry) => total + entry.header.size, 0);

    if (entries.length > maxEntries || totalSize > maxUncompressedBytes) {
      throw new Error("ZIP exceeds the allowed extracted size or file count");
    }

    const root = resolve(destination) + sep;
    for (const entry of entries) {
      const target = resolve(destination, normalize(entry.entryName));
      if (!target.startsWith(root) || entry.entryName.includes("\0")) {
        throw new Error("ZIP contains an unsafe file path");
      }
    }
  }
}
