import { randomUUID } from "node:crypto";

import type { AnalysisResult } from "../../../analysis/domain/entities/AnalysisResult.js";

export class Project {
  public readonly id: string;
  public readonly createdAt: Date;
  public sourcePath?: string;
  public analysis?: AnalysisResult;

  constructor(
    public readonly name: string,
    id?: string,
    createdAt?: Date,
    sourcePath?: string,
    analysis?: AnalysisResult,
  ) {
    this.id = id ?? randomUUID();
    this.createdAt = createdAt ?? new Date();
    this.sourcePath = sourcePath;
    this.analysis = analysis;
  }
}
