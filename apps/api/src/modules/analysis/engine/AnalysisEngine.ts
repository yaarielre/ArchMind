import type { AnalysisResult } from "../domain/entities/AnalysisResult.js";
import { LanguageDetector } from "./LanguageDetector.js";
import { FrameworkDetector } from "./FrameworkDetector.js";
import { ArchitectureDetector } from "./ArchitectureDetector.js";
import { DependencyDetector } from "./DependencyDetector.js";
import { FolderAnalyzer } from "./FolderAnalyzer.js";

export class AnalysisEngine {
  private readonly languageDetector = new LanguageDetector();
  private readonly frameworkDetector = new FrameworkDetector();
  private readonly architectureDetector = new ArchitectureDetector();
  private readonly dependencyDetector = new DependencyDetector();
  private readonly folderAnalyzer = new FolderAnalyzer();

  async analyze(projectDir: string): Promise<AnalysisResult> {
    const allPaths = await this.folderAnalyzer.getFilePaths(projectDir);
    const tree = await this.folderAnalyzer.buildTree(projectDir);

    const languages = this.languageDetector.detect(allPaths);

    const detectResult = await this.dependencyDetector.detect(projectDir);
    const depNames = detectResult.deps.map((d) => d.name);

    const frameworks = this.frameworkDetector.detect(allPaths, depNames);
    const architecture = this.architectureDetector.detect(allPaths);

    return {
      languages,
      frameworks,
      architecture,
      dependencies: detectResult.deps,
      tree,
      analyzedAt: new Date(),
    };
  }
}
