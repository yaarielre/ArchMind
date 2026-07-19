import type { AnalysisResult } from "../entities/AnalysisResult.js";

export interface IAnalysisEngine {
  analyze(projectDir: string): Promise<AnalysisResult>;
}
