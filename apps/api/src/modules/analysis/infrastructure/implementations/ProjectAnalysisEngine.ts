import type { AnalysisResult } from "../../domain/entities/AnalysisResult.js";
import type { IAnalysisEngine } from "../../domain/interfaces/IAnalysisEngine.js";
import { AnalysisEngine } from "../../engine/AnalysisEngine.js";

export class ProjectAnalysisEngine implements IAnalysisEngine {
  private readonly engine = new AnalysisEngine();

  async analyze(projectDir: string): Promise<AnalysisResult> {
    return await this.engine.analyze(projectDir);
  }
}
