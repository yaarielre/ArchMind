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

export interface IProjectDoc {
  _id: string;
  name: string;
  sourcePath?: string;
  analysis?: AnalysisResult;
  createdAt: Date;
}

const projectSchema = new Schema<IProjectDoc>(
  {
    _id: { type: String },
    name: { type: String, required: true },
    sourcePath: { type: String },
    analysis: { type: analysisResultSchema },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

export const ProjectModel = model<IProjectDoc>("Project", projectSchema);
