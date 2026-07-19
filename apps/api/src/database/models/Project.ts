import { Schema, model } from "mongoose";

import type { AnalysisResult } from "../../modules/analysis/domain/entities/AnalysisResult.js";

const detectedLanguageSchema = new Schema(
  { name: String, files: Number, percentage: Number },
  { _id: false },
);

const detectedFrameworkSchema = new Schema(
  { name: String, confidence: Number },
  { _id: false },
);

const detectedArchitectureSchema = new Schema(
  { pattern: String, confidence: Number, indicators: [String] },
  { _id: false },
);

const detectedDependencySchema = new Schema(
  { name: String, version: String, type: { type: String } },
  { _id: false },
);

const projectTreeNodeSchema = new Schema(
  {
    name: String,
    path: String,
    type: { type: String },
    extension: { type: String },
    children: { type: [Schema.Types.Mixed] },
  },
  { _id: false },
);

const analysisResultSchema = new Schema<AnalysisResult>(
  {
    languages: [detectedLanguageSchema],
    frameworks: [detectedFrameworkSchema],
    architecture: detectedArchitectureSchema,
    dependencies: [detectedDependencySchema],
    tree: [projectTreeNodeSchema],
    analyzedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const knowledgeModelSchema = new Schema(
  {
    project: { type: Schema.Types.Mixed },
    stack: { type: Schema.Types.Mixed },
    architecture: { type: Schema.Types.Mixed },
    statistics: { type: Schema.Types.Mixed },
    dependencies: { type: Schema.Types.Mixed },
    structure: { type: Schema.Types.Mixed },
    modules: { type: [Schema.Types.Mixed] },
    builtAt: { type: Date },
  },
  { _id: false },
);

const documentationResultSchema = new Schema(
  {
    markdown: { type: String },
    sections: { type: [Schema.Types.Mixed] },
    generatedAt: { type: Date },
  },
  { _id: false },
);

const aiEnrichedSectionSchema = new Schema(
  {
    sectionId: String,
    original: String,
    enriched: String,
    provider: String,
    model: String,
    tokensUsed: Number,
  },
  { _id: false },
);

const aiResultSchema = new Schema(
  {
    sections: { type: [aiEnrichedSectionSchema] },
    fullMarkdown: { type: String },
    totalTokens: { type: Number },
    provider: { type: String },
    model: { type: String },
    enrichedAt: { type: Date },
    configHash: { type: String },
  },
  { _id: false },
);

const pdfMetadataSchema = new Schema(
  {
    filename: { type: String },
    filePath: { type: String },
    format: { type: String },
    generatedAt: { type: Date },
  },
  { _id: false },
);

export interface IProjectDoc {
  _id: string;
  name: string;
  sourcePath?: string;
  analysis?: AnalysisResult;
  knowledgeModel?: Record<string, unknown>;
  documentationResult?: Record<string, unknown>;
  aiResults?: Record<string, unknown>[];
  pdfMetadata?: Record<string, unknown>;
  createdAt: Date;
}

const projectSchema = new Schema<IProjectDoc>(
  {
    _id: { type: String },
    name: { type: String, required: true },
    sourcePath: { type: String },
    analysis: { type: analysisResultSchema },
    knowledgeModel: { type: knowledgeModelSchema },
    documentationResult: { type: documentationResultSchema },
    aiResults: { type: [Schema.Types.Mixed] },
    pdfMetadata: { type: pdfMetadataSchema },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

export const ProjectModel = model<IProjectDoc>("Project", projectSchema);
