export interface Project {
  id: string;
  name: string;
  sourcePath?: string;
  analysis?: Analysis;
  createdAt: string;
}

export interface Analysis {
  languages: DetectedLanguage[];
  frameworks: DetectedFramework[];
  architecture: DetectedArchitecture;
  dependencies: DetectedDependency[];
  tree: ProjectTreeNode[];
  analyzedAt: string;
}

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
  extension?: string;
  children?: ProjectTreeNode[];
}

export interface KnowledgeModel {
  project: {
    name: string;
    description: string;
    version: string;
    entryPoint: string;
  };
  stack: {
    languages: string[];
    framework: string;
    runtime: string;
    database: string;
    orm: string;
    testing: string;
    bundler: string;
    packageManager: string;
  };
  architecture: {
    pattern: string;
    confidence: string;
    layers: string[];
    modules: string[];
  };
  dependencies: {
    production: Dependency[];
    development: Dependency[];
  };
  modules: ModuleInfo[];
  statistics: {
    totalFiles: number;
    totalFolders: number;
    linesByLanguage: Record<string, number>;
  };
}

export interface Dependency {
  name: string;
  version: string;
  purpose: string;
}

export interface ModuleInfo {
  name: string;
  path: string;
  files: number;
  layers?: string;
}

export type SectionType =
  | "executive-summary"
  | "architecture"
  | "stack"
  | "dependencies"
  | "modules"
  | "statistics"
  | "recommendations";

export interface DocumentSection {
  id: SectionType;
  title: string;
  content: string;
  order: number;
}

export interface DocumentationResult {
  markdown: string;
  sections: DocumentSection[];
  generatedAt: string;
}

export interface AIConfig {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  sections?: SectionType[];
}

export interface AIEnrichResult {
  sections: {
    sectionId: string;
    original: string;
    enriched: string;
    provider: string;
    model: string;
    tokensUsed: number;
  }[];
  fullMarkdown: string;
  totalTokens: number;
  provider: string;
  model: string;
  enrichedAt: string;
}
