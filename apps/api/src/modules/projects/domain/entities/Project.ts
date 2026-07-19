import { randomUUID } from "node:crypto";

import type { AnalysisResult } from "../../../analysis/domain/entities/AnalysisResult.js";

export class Project {
  public readonly id: string;
  public readonly createdAt: Date;
  public sourcePath?: string;
  public analysis?: AnalysisResult;
  public knowledgeModel?: Record<string, unknown>;
  public documentationResult?: Record<string, unknown>;
  public aiResults?: Record<string, unknown>[];
  public pdfMetadata?: Record<string, unknown>;

  constructor(
    public readonly name: string,
    id?: string,
    createdAt?: Date,
    sourcePath?: string,
    analysis?: AnalysisResult,
    knowledgeModel?: Record<string, unknown>,
    documentationResult?: Record<string, unknown>,
    aiResults?: Record<string, unknown>[],
    pdfMetadata?: Record<string, unknown>,
  ) {
    this.id = id ?? randomUUID();
    this.createdAt = createdAt ?? new Date();
    this.sourcePath = sourcePath;
    this.analysis = analysis;
    this.knowledgeModel = knowledgeModel;
    this.documentationResult = documentationResult;
    this.aiResults = aiResults;
    this.pdfMetadata = pdfMetadata;
  }
}
