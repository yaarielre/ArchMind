export interface KnowledgeModel {
  project: {
    name: string;
    description: string;
    version: string;
    entryPoint: string;
  };
  stack: {
    languages: string[];
    framework: string | null;
    runtime: string | null;
    database: string | null;
    orm: string | null;
    testing: string | null;
    bundler: string | null;
    packageManager: string | null;
  };
  architecture: {
    pattern: string;
    confidence: number;
    modules: string[];
    layers: string[];
  };
  statistics: {
    totalFiles: number;
    totalFolders: number;
    linesByLanguage: Record<string, number>;
  };
  dependencies: {
    production: DependencyInfo[];
    development: DependencyInfo[];
  };
  structure: {
    root: string[];
    entry: string;
    srcDir: string | null;
    configFiles: string[];
    keyFiles: string[];
  };
  modules: ModuleInfo[];
  builtAt: Date;
}

export interface DependencyInfo {
  name: string;
  version: string;
  purpose: string;
}

export interface ModuleInfo {
  name: string;
  path: string;
  files: number;
  layers: string[];
}
