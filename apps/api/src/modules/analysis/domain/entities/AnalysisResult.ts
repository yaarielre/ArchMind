export interface DetectedLanguage {
  name: string;
  files: number;
  percentage: number;
}

export interface DetectedFramework {
  name: string;
  confidence: number;
}

export interface DetectedArchitecture {
  pattern: string;
  confidence: number;
  indicators: string[];
}

export interface DetectedDependency {
  name: string;
  version: string;
  type: "production" | "development";
}

export interface ProjectTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: ProjectTreeNode[];
  extension?: string;
}

export interface AnalysisResult {
  languages: DetectedLanguage[];
  frameworks: DetectedFramework[];
  architecture: DetectedArchitecture;
  dependencies: DetectedDependency[];
  tree: ProjectTreeNode[];
  analyzedAt: Date;
}
