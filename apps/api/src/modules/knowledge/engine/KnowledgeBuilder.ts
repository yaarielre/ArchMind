import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

import type { AnalysisResult } from "../../analysis/domain/entities/AnalysisResult.js";
import type {
  KnowledgeModel,
  DependencyInfo,
  ModuleInfo,
} from "../domain/entities/KnowledgeModel.js";
import {
  DependencyDetector,
  type DetectResult,
} from "../../analysis/engine/DependencyDetector.js";

const IGNORED = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".nuxt",
  "coverage",
  "__pycache__",
  ".venv",
  "venv",
  "vendor",
  ".gradle",
  "target",
  ".cache",
  ".turbo",
  "bin",
  "obj",
]);

const KEY_FILES = new Set([
  "package.json",
  "tsconfig.json",
  "vite.config.ts",
  "vite.config.js",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "tailwind.config.js",
  "tailwind.config.ts",
  "docker-compose.yml",
  "Dockerfile",
  "docker-compose.yaml",
  "drizzle.config.ts",
  "drizzle.config.js",
  "prisma/schema.prisma",
  "nest-cli.json",
  "angular.json",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "Cargo.toml",
  "go.mod",
  "Gemfile",
  "composer.json",
  "requirements.txt",
  "pyproject.toml",
  "setup.py",
  "setup.cfg",
  "appsettings.json",
  "appsettings.Development.json",
  "Program.cs",
  "Startup.cs",
  "Makefile",
  "CMakeLists.txt",
  ".eslintrc.js",
  ".eslintrc.json",
  ".prettierrc",
  "turbo.json",
  "pnpm-workspace.yaml",
  "lerna.json",
  "nx.json",
]);

const CONFIG_EXTENSIONS = new Set([
  ".config.ts",
  ".config.js",
  ".config.mjs",
  ".config.cjs",
  ".env",
  ".env.example",
  ".env.development",
]);

const PROJECT_META_FILES: Record<string, string> = {
  "package.json": "node",
  "pom.xml": "java",
  "build.gradle": "java",
  "build.gradle.kts": "java",
  "go.mod": "go",
  "Cargo.toml": "rust",
  "composer.json": "php",
  Gemfile: "ruby",
  "requirements.txt": "python",
  "pyproject.toml": "python",
  "setup.py": "python",
  "*.csproj": "csharp",
};

const LAYER_NAMES = [
  "domain",
  "application",
  "infrastructure",
  "presentation",
  "controllers",
  "models",
  "views",
  "services",
  "repositories",
  "middleware",
  "routes",
  "utils",
  "helpers",
  "dtos",
  "entities",
];

export class KnowledgeBuilder {
  private readonly depDetector = new DependencyDetector();

  async build(
    projectDir: string,
    analysis: AnalysisResult,
  ): Promise<KnowledgeModel> {
    const readme = await this.readReadme(projectDir);
    const { files, folders } = await this.countFiles(projectDir);
    const detectResult = await this.depDetector.detect(projectDir);
    const pkg = await this.readPackageJson(projectDir);
    const projectMeta = await this.buildProjectMeta(
      projectDir,
      detectResult,
      pkg,
    );
    const configFiles = this.findConfigFiles(analysis.tree);
    const keyFiles = this.findKeyFiles(analysis.tree);
    const entryPoint = this.detectEntryPoint(analysis.tree, pkg, detectResult);
    const srcDir = this.detectSrcDir(analysis.tree);
    const runtime = this.detectRuntime(analysis, detectResult);
    const freshDeps =
      detectResult.deps.length > 0 ? detectResult.deps : analysis.dependencies;
    const db = this.detectDatabase(freshDeps, detectResult);
    const orm = this.detectORM(freshDeps, detectResult);
    const testing = this.detectTesting(freshDeps);
    const bundler = this.detectBundler(freshDeps, configFiles, detectResult);
    const pkgManager = await this.detectPackageManager(projectDir);
    const modules = await this.detectModules(projectDir, analysis);
    const linesByLanguage = this.estimateLines(analysis);

    const prodDeps = this.dedupDeps(
      freshDeps
        .filter((d) => d.type === "production")
        .map((d) => this.mapDependency(d)),
    );
    const devDeps = this.dedupDeps(
      freshDeps
        .filter((d) => d.type === "development")
        .map((d) => this.mapDependency(d)),
    );

    return {
      project: {
        name: projectMeta.name,
        description:
          (projectMeta.description ||
            readme?.split("\n").slice(0, 3).join(" ").trim()) ??
          "",
        version: projectMeta.version,
        entryPoint,
      },
      stack: {
        languages: analysis.languages.map((l) => l.name),
        framework: this.resolveFramework(analysis, detectResult),
        runtime,
        database: db,
        orm,
        testing,
        bundler,
        packageManager: pkgManager,
      },
      architecture: {
        pattern: analysis.architecture.pattern,
        confidence: analysis.architecture.confidence,
        modules: modules.map((m) => m.name),
        layers: analysis.architecture.indicators,
      },
      statistics: {
        totalFiles: files,
        totalFolders: folders,
        linesByLanguage,
      },
      dependencies: {
        production: prodDeps,
        development: devDeps,
      },
      structure: {
        root: analysis.tree.map((n) => n.name),
        entry: entryPoint,
        srcDir,
        configFiles,
        keyFiles,
      },
      modules,
      builtAt: new Date(),
    };
  }

  private async buildProjectMeta(
    dir: string,
    detectResult: DetectResult,
    pkg: Record<string, unknown> | null,
  ): Promise<{ name: string; description: string; version: string }> {
    if (pkg) {
      return {
        name: String(pkg.name ?? "unknown"),
        description: String(pkg.description ?? ""),
        version: String(pkg.version ?? "0.0.0"),
      };
    }
    if (detectResult.meta.csTargetFramework) {
      const sdkName = detectResult.meta.csprojSdk?.includes("Web")
        ? "ASP.NET Core"
        : ".NET";
      const name = await this.findProjectName(dir, detectResult);
      return {
        name,
        description: `${sdkName} project (${detectResult.meta.csTargetFramework})`,
        version: "1.0.0",
      };
    }
    if (detectResult.meta.goModule) {
      return {
        name: detectResult.meta.goModule,
        description: "",
        version: "0.0.0",
      };
    }
    const name = await this.findProjectName(dir, detectResult);
    return { name, description: "", version: "0.0.0" };
  }

  private guessNameFromDir(dir: string): string {
    const parts = dir.replace(/\\/g, "/").split("/").filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      const candidate = parts[i];
      if (
        candidate === "uploads" ||
        candidate === "projects" ||
        /^[\da-f-]{36}$/.test(candidate)
      )
        continue;
      return candidate.replace(/-master$|-main$/, "").replace(/[-_]/g, " ");
    }
    return "unknown";
  }

  private async findProjectName(
    dir: string,
    detectResult: DetectResult,
  ): Promise<string> {
    if (detectResult.meta.goModule) return detectResult.meta.goModule;
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (
          entry.isDirectory() &&
          !IGNORED.has(entry.name) &&
          !/^\./.test(entry.name)
        ) {
          const subEntries = await readdir(join(dir, entry.name), {
            withFileTypes: true,
          }).catch(() => []);
          const hasCsproj = subEntries.some((s) => s.name.endsWith(".csproj"));
          if (hasCsproj)
            return entry.name
              .replace(/-master$|-main$/, "")
              .replace(/[-_]/g, " ");
          for (const sub of subEntries) {
            if (sub.isDirectory()) {
              const deepEntries = await readdir(
                join(dir, entry.name, sub.name),
                { withFileTypes: true },
              ).catch(() => []);
              if (deepEntries.some((d) => d.name.endsWith(".csproj")))
                return entry.name
                  .replace(/-master$|-main$/, "")
                  .replace(/[-_]/g, " ");
            }
          }
        }
      }
    } catch {
      /* ignore */
    }
    return this.guessNameFromDir(dir);
  }

  private async readReadme(dir: string): Promise<string | null> {
    for (const name of [
      "README.md",
      "readme.md",
      "Readme.md",
      "README.rst",
      "README.txt",
    ]) {
      try {
        return await readFile(join(dir, name), "utf-8");
      } catch {
        /* continue */
      }
    }
    return null;
  }

  private async readPackageJson(
    dir: string,
  ): Promise<Record<string, unknown> | null> {
    const candidates = ["package.json"];
    for (const name of candidates) {
      const path = await this.findFirstFile(dir, name);
      if (path) {
        try {
          return JSON.parse(await readFile(path, "utf-8"));
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  private async findFirstFile(
    dir: string,
    filename: string,
  ): Promise<string | null> {
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (IGNORED.has(entry.name)) continue;
        const fullPath = join(dir, entry.name);
        if (entry.isFile() && entry.name === filename) return fullPath;
        if (entry.isDirectory()) {
          const found = await this.findFirstFile(fullPath, filename);
          if (found) return found;
        }
      }
    } catch {
      /* permission denied */
    }
    return null;
  }

  private async countFiles(
    dir: string,
  ): Promise<{ files: number; folders: number }> {
    let files = 0,
      folders = 0;
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (IGNORED.has(entry.name)) continue;
        if (entry.isDirectory()) {
          folders++;
          const sub = await this.countFiles(join(dir, entry.name));
          files += sub.files;
          folders += sub.folders;
        } else {
          files++;
        }
      }
    } catch {
      /* permission denied */
    }
    return { files, folders };
  }

  private async detectModules(
    dir: string,
    analysis: AnalysisResult,
  ): Promise<ModuleInfo[]> {
    const modules: ModuleInfo[] = [];

    const srcModulesDir = join(dir, "src", "modules");
    await this.scanModuleDir(srcModulesDir, "src/modules", modules);

    const appDir = join(dir, "app");
    await this.scanModuleDir(appDir, "app", modules);

    const cmdDir = join(dir, "cmd");
    try {
      const entries = await readdir(cmdDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const modulePath = join(cmdDir, entry.name);
        const { files: f } = await this.countFiles(modulePath);
        modules.push({
          name: entry.name,
          path: `cmd/${entry.name}`,
          files: f,
          layers: [],
        });
      }
    } catch {
      /* no cmd dir */
    }

    if (modules.length === 0) {
      const dirsToScan: { basePath: string; absPath: string }[] = [];
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (
          IGNORED.has(entry.name) ||
          !entry.isDirectory() ||
          entry.name === ".github"
        )
          continue;
        dirsToScan.push({
          basePath: entry.name,
          absPath: join(dir, entry.name),
        });
      }

      for (const { basePath, absPath } of dirsToScan) {
        const childEntries = await readdir(absPath, {
          withFileTypes: true,
        }).catch(() => []);
        const subDirs = childEntries.filter((e) => e.isDirectory());

        if (subDirs.length >= 2) {
          const filtered = subDirs.filter(
            (s) => !IGNORED.has(s.name) && !/^\./.test(s.name),
          );
          const layers = filtered
            .filter((s) => LAYER_NAMES.includes(s.name.toLowerCase()))
            .map((s) => s.name);
          if (layers.length >= 2) {
            const { files: f } = await this.countFiles(absPath);
            modules.push({ name: basePath, path: basePath, files: f, layers });
          } else if (filtered.length >= 2) {
            for (const sub of filtered) {
              const subAbs = join(absPath, sub.name);
              const { files: f } = await this.countFiles(subAbs);
              modules.push({
                name: sub.name,
                path: `${basePath}/${sub.name}`,
                files: f,
                layers: [],
              });
            }
          }
        } else if (subDirs.length === 1) {
          const nested = subDirs[0];
          const nestedEntries = await readdir(join(absPath, nested.name), {
            withFileTypes: true,
          }).catch(() => []);
          const nestedDirs = nestedEntries.filter((e) => e.isDirectory());
          if (nestedDirs.length >= 3) {
            for (const nd of nestedDirs) {
              if (nd.name === ".github" || IGNORED.has(nd.name)) continue;
              const ndAbs = join(absPath, nested.name, nd.name);
              const { files: f } = await this.countFiles(ndAbs);
              modules.push({
                name: nd.name,
                path: `${basePath}/${nested.name}/${nd.name}`,
                files: f,
                layers: [],
              });
            }
          }
        }
      }
    }

    return modules;
  }

  private async scanModuleDir(
    dir: string,
    basePath: string,
    modules: ModuleInfo[],
  ): Promise<void> {
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const modulePath = join(dir, entry.name);
        const { files: moduleFiles } = await this.countFiles(modulePath);
        const layers = await this.detectLayers(modulePath);
        modules.push({
          name: entry.name,
          path: `${basePath}/${entry.name}`,
          files: moduleFiles,
          layers,
        });
      }
    } catch {
      /* dir not found */
    }
  }

  private async detectLayers(dir: string): Promise<string[]> {
    const layers: string[] = [];
    const expected = [
      "domain",
      "application",
      "infrastructure",
      "presentation",
      "controllers",
      "models",
      "services",
      "repositories",
    ];
    for (const layer of expected) {
      try {
        await stat(join(dir, layer));
        layers.push(layer);
      } catch {
        /* not found */
      }
    }
    return layers;
  }

  private findConfigFiles(tree: AnalysisResult["tree"]): string[] {
    const configs: string[] = [];
    const walk = (nodes: AnalysisResult["tree"]) => {
      for (const node of nodes) {
        if (node.type === "file") {
          if (
            CONFIG_EXTENSIONS.has(node.extension ?? "") ||
            KEY_FILES.has(node.name)
          ) {
            configs.push(node.path);
          }
        }
        if (node.children) walk(node.children);
      }
    };
    walk(tree);
    return configs;
  }

  private findKeyFiles(tree: AnalysisResult["tree"]): string[] {
    const found: string[] = [];
    const walk = (nodes: AnalysisResult["tree"]) => {
      for (const node of nodes) {
        if (node.type === "file" && KEY_FILES.has(node.name)) {
          found.push(node.path);
        }
        if (node.children) walk(node.children);
      }
    };
    walk(tree);
    return found;
  }

  private detectEntryPoint(
    tree: AnalysisResult["tree"],
    pkg: Record<string, unknown> | null,
    detectResult: DetectResult,
  ): string {
    if (pkg?.main) return String(pkg.main);

    const candidates = [
      "src/main.ts",
      "src/main.tsx",
      "src/index.ts",
      "src/index.tsx",
      "src/app.ts",
      "src/app.tsx",
      "main.ts",
      "index.ts",
      "app.ts",
      "Program.cs",
      "Startup.cs",
      "src/main.rs",
      "src/lib.rs",
      "app.py",
      "main.py",
      "wsgi.py",
      "asgi.py",
      "manage.py",
      "app/main.py",
      "cmd/main.go",
      "main.go",
      "public/index.php",
      "src/index.php",
      "bin/rails",
      "config.ru",
      "src/main.go",
      "Application.java",
      "Main.java",
      "App.java",
      "src/main/java",
      "src/main/resources",
    ];

    for (const c of candidates) {
      if (this.pathExists(tree, c)) return c;
    }
    return "index";
  }

  private pathExists(tree: AnalysisResult["tree"], target: string): boolean {
    for (const node of tree) {
      if (node.path === target || node.name === target) return true;
      if (node.children && this.pathExists(node.children, target)) return true;
    }
    return false;
  }

  private detectSrcDir(tree: AnalysisResult["tree"]): string | null {
    for (const node of tree) {
      if (
        node.type === "directory" &&
        ["src", "app", "lib", "pkg", "internal", "cmd"].includes(node.name)
      ) {
        return node.name;
      }
    }
    return null;
  }

  private detectRuntime(
    analysis: AnalysisResult,
    detectResult: DetectResult,
  ): string | null {
    const lang = analysis.languages[0]?.name;
    const framework = analysis.frameworks[0]?.name;

    if (detectResult.meta.csTargetFramework) {
      const sdk = detectResult.meta.csprojSdk ?? "";
      if (sdk.includes("Web")) return ".NET (ASP.NET Core)";
      if (sdk.includes(" MAUI")) return ".NET MAUI";
      return ".NET";
    }
    if (detectResult.meta.javaFramework)
      return `JVM (${detectResult.meta.javaFramework})`;
    if (detectResult.meta.goModule) return "Go";
    if (detectResult.meta.rustEdition) return "Rust";

    if (framework === "Next.js") return "Node.js (Next.js)";
    if (framework === "Nuxt") return "Node.js (Nuxt)";
    if (framework === "NestJS") return "Node.js (NestJS)";
    if (framework === "Express" || framework === "Fastify") return "Node.js";
    if (framework === "Angular") return "Node.js (Angular)";
    if (
      framework === "Django" ||
      framework === "Flask" ||
      framework === "FastAPI"
    )
      return "Python";
    if (framework === "Rails") return "Ruby";
    if (framework === "Laravel") return "PHP";
    if (framework === "React" || framework === "Vue" || framework === "Svelte")
      return "Browser";
    if (lang === "JavaScript" || lang === "TypeScript") return "Node.js";
    if (lang === "Python") return "Python";
    if (lang === "Java") return "JVM";
    if (lang === "C#") return ".NET";
    if (lang === "Go") return "Go";
    if (lang === "Rust") return "Rust";
    if (lang === "Ruby") return "Ruby";
    if (lang === "PHP") return "PHP";
    return null;
  }

  private detectDatabase(
    deps: AnalysisResult["dependencies"],
    detectResult: DetectResult,
  ): string | null {
    const names = new Set(deps.map((d) => d.name));
    if (names.has("mongoose")) return "MongoDB";
    if (names.has("pg") || names.has("postgres")) return "PostgreSQL";
    if (names.has("mysql2") || names.has("mysql")) return "MySQL";
    if (
      names.has("better-sqlite3") ||
      names.has("sqlite3") ||
      names.has("sqlite")
    )
      return "SQLite";
    if (names.has("redis")) return "Redis";
    if (detectResult.meta.csTargetFramework) {
      if (names.has("Microsoft.EntityFrameworkCore.SqlServer"))
        return "SQL Server";
      if (
        names.has("Npgsql") ||
        names.has("Microsoft.EntityFrameworkCore.Npgsql")
      )
        return "PostgreSQL";
      if (names.has("Pomelo.EntityFrameworkCore.MySql")) return "MySQL";
      if (names.has("Microsoft.EntityFrameworkCore.Sqlite")) return "SQLite";
    }
    if (detectResult.meta.javaFramework) {
      if (names.has("postgresql")) return "PostgreSQL";
      if (
        names.has("mysql-connector-java") ||
        names.has("com.mysql:mysql-connector-j")
      )
        return "MySQL";
      if (names.has("com.h2database:h2")) return "H2";
    }
    if (names.has("gorm.io/driver/postgres")) return "PostgreSQL";
    if (names.has("gorm.io/driver/mysql")) return "MySQL";
    if (names.has("gorm.io/driver/sqlite")) return "SQLite";
    if (names.has("diesel")) return "PostgreSQL/MySQL/SQLite";
    if (names.has("sqlx")) return "PostgreSQL/MySQL/SQLite";
    return null;
  }

  private detectORM(
    deps: AnalysisResult["dependencies"],
    detectResult: DetectResult,
  ): string | null {
    const names = new Set(deps.map((d) => d.name));
    if (names.has("mongoose")) return "Mongoose";
    if (names.has("prisma") || names.has("@prisma/client")) return "Prisma";
    if (names.has("drizzle-orm")) return "Drizzle";
    if (names.has("typeorm")) return "TypeORM";
    if (names.has("sequelize")) return "Sequelize";
    if (names.has("knex")) return "Knex.js";
    if (detectResult.meta.csTargetFramework) {
      if (names.has("Microsoft.EntityFrameworkCore"))
        return "Entity Framework Core";
      if (names.has("Dapper")) return "Dapper";
    }
    if (names.has("gorm.io/gorm")) return "GORM";
    if (names.has("diesel")) return "Diesel";
    if (names.has("sqlalchemy") || names.has("SQLAlchemy")) return "SQLAlchemy";
    if (names.has("peewee")) return "Peewee";
    if (names.has("tortoise-orm")) return "Tortoise ORM";
    if (names.has("activerecord")) return "ActiveRecord";
    if (names.has("sequel")) return "Sequel";
    if (names.has("doctrine/orm")) return "Doctrine";
    if (names.has("eloquent")) return "Eloquent";
    return null;
  }

  private detectTesting(deps: AnalysisResult["dependencies"]): string | null {
    const names = new Set(deps.map((d) => d.name));
    if (names.has("jest") || names.has("@jest/globals")) return "Jest";
    if (names.has("vitest")) return "Vitest";
    if (names.has("mocha")) return "Mocha";
    if (names.has("chai")) return "Chai";
    if (names.has("pytest")) return "Pytest";
    if (names.has("unittest")) return "unittest";
    if (names.has("rspec") || names.has("minitest")) return "RSpec";
    if (names.has("xunit") || names.has("Xunit")) return "xUnit";
    if (names.has("nunit") || names.has("NUnit")) return "NUnit";
    if (names.has("mstest") || names.has("MSTest")) return "MSTest";
    if (
      names.has("testing") &&
      deps.some((d) => d.name.startsWith("github.com/stretchr/testify"))
    )
      return "testify";
    return null;
  }

  private detectBundler(
    deps: AnalysisResult["dependencies"],
    configFiles: string[],
    detectResult: DetectResult,
  ): string | null {
    const names = new Set(deps.map((d) => d.name));
    if (detectResult.meta.csTargetFramework) return "MSBuild";
    if (detectResult.meta.javaFramework) {
      if (
        configFiles.some(
          (f) => f.endsWith("build.gradle") || f.endsWith("build.gradle.kts"),
        )
      )
        return "Gradle";
      if (configFiles.some((f) => f === "pom.xml")) return "Maven";
    }
    if (detectResult.meta.rustEdition) return "Cargo";
    if (names.has("vite") || configFiles.some((f) => f.includes("vite.config")))
      return "Vite";
    if (
      names.has("webpack") ||
      configFiles.some((f) => f.includes("webpack.config"))
    )
      return "Webpack";
    if (
      names.has("rollup") ||
      configFiles.some((f) => f.includes("rollup.config"))
    )
      return "Rollup";
    if (names.has("esbuild")) return "esbuild";
    if (names.has("turbo")) return "Turborepo";
    return null;
  }

  private async detectPackageManager(dir: string): Promise<string | null> {
    const lockFiles: [string, string][] = [
      ["package-lock.json", "npm"],
      ["yarn.lock", "yarn"],
      ["pnpm-lock.yaml", "pnpm"],
      ["bun.lockb", "bun"],
      ["Cargo.lock", "cargo"],
      ["go.sum", "go modules"],
      ["poetry.lock", "poetry"],
      ["Pipfile.lock", "pipenv"],
      ["pnpm-lock.yml", "pnpm"],
      ["composer.lock", "composer"],
      ["Gemfile.lock", "bundler"],
      [".mvn/wrapper/maven-wrapper.properties", "maven"],
      ["gradle/wrapper/gradle-wrapper.properties", "gradle"],
      ["packages.lock.json", "nuget"],
      [".config/dotnet-tools.json", "dotnet tools"],
    ];
    for (const [filename, name] of lockFiles) {
      const found = await this.findFirstFile(dir, filename);
      if (found) return name;
    }
    return null;
  }

  private estimateLines(analysis: AnalysisResult): Record<string, number> {
    const result: Record<string, number> = {};
    for (const lang of analysis.languages) {
      result[lang.name] = lang.files * 50;
    }
    return result;
  }

  private mapDependency(dep: {
    name: string;
    version: string;
  }): DependencyInfo {
    return {
      name: dep.name,
      version: dep.version,
      purpose: this.guessPurpose(dep.name),
    };
  }

  private guessPurpose(name: string): string {
    const P: Record<string, string> = {
      react: "UI library",
      "react-dom": "React DOM renderer",
      "react-router-dom": "Client-side routing",
      vue: "UI framework",
      angular: "UI framework",
      svelte: "UI compiler",
      express: "HTTP server",
      fastify: "HTTP server",
      "@nestjs/core": "Server framework",
      mongoose: "MongoDB ODM",
      prisma: "Database ORM",
      "drizzle-orm": "Database ORM",
      typeorm: "Database ORM",
      sequelize: "Database ORM",
      knex: "Query builder",
      axios: "HTTP client",
      "node-fetch": "HTTP client",
      pino: "Logging",
      "pino-pretty": "Log formatting",
      dotenv: "Environment variables",
      zod: "Schema validation",
      joi: "Schema validation",
      yup: "Schema validation",
      jsonwebtoken: "Authentication (JWT)",
      bcrypt: "Password hashing",
      cors: "CORS middleware",
      helmet: "Security headers",
      multer: "File upload",
      next: "React meta-framework",
      nuxt: "Vue meta-framework",
      vite: "Build tool",
      webpack: "Module bundler",
      typescript: "Type system",
      eslint: "Code linting",
      prettier: "Code formatting",
      jest: "Testing framework",
      vitest: "Testing framework",
      mocha: "Testing framework",
      tailwindcss: "CSS framework",
      "styled-components": "CSS-in-JS",
      "framer-motion": "Animation",
      "react-hook-form": "Form management",
      zustand: "Client state management",
      redux: "Client state management",
      "Microsoft.AspNetCore.Authentication.JwtBearer": "JWT Authentication",
      "Microsoft.EntityFrameworkCore": "Entity Framework Core ORM",
      "Microsoft.EntityFrameworkCore.SqlServer": "SQL Server provider",
      "Microsoft.EntityFrameworkCore.Design": "EF Core migrations tooling",
      "Microsoft.EntityFrameworkCore.Tools": "EF Core CLI tools",
      "Microsoft.AspNetCore.Identity.EntityFrameworkCore":
        "ASP.NET Identity with EF Core",
      "Microsoft.Extensions.Identity.Core": "ASP.NET Identity core",
      "Microsoft.AspNetCore.OpenApi": "OpenAPI/Swagger integration",
      "Swashbuckle.AspNetCore": "Swagger/OpenAPI",
      "System.IdentityModel.Tokens.Jwt": "JWT token handling",
      "BCrypt.Net-Next": "Password hashing",
      Serilog: "Structured logging",
      MediatR: "Mediator pattern (CQRS)",
      FluentValidation: "Validation",
      AutoMapper: "Object mapping",
      "Spring Boot": "Java server framework",
      Hibernate: "Java ORM",
      gorm: "Go ORM",
      gin: "Go HTTP framework",
      echo: "Go HTTP framework",
      actix: "Rust HTTP framework",
      axum: "Rust HTTP framework",
      laravel: "PHP framework",
      symfony: "PHP framework",
      rails: "Ruby framework",
      sinatra: "Ruby HTTP framework",
    };
    return P[name] ?? "dependency";
  }

  private resolveFramework(
    analysis: AnalysisResult,
    detectResult: DetectResult,
  ): string | null {
    if (analysis.frameworks[0]?.name) return analysis.frameworks[0].name;
    if (detectResult.meta.csTargetFramework) {
      return detectResult.meta.csprojSdk?.includes("Web")
        ? "ASP.NET Core"
        : ".NET";
    }
    if (detectResult.meta.javaFramework) return detectResult.meta.javaFramework;
    return null;
  }

  private dedupDeps(deps: DependencyInfo[]): DependencyInfo[] {
    const seen = new Map<string, DependencyInfo>();
    for (const dep of deps) {
      if (!seen.has(dep.name)) seen.set(dep.name, dep);
    }
    return [...seen.values()];
  }
}
