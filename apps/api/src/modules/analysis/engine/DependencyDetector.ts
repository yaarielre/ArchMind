import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { readdirSync, statSync } from "node:fs";

import type { DetectedDependency } from "../domain/entities/AnalysisResult.js";
import { CsProjParser } from "./parsers/CsProjParser.js";
import { JavaParser } from "./parsers/JavaParser.js";
import { GoParser } from "./parsers/GoParser.js";
import { RustParser } from "./parsers/RustParser.js";

export interface DetectResult {
  deps: DetectedDependency[];
  meta: Record<string, string | null>;
}

export class DependencyDetector {
  private readonly csproj = new CsProjParser();
  private readonly java = new JavaParser();
  private readonly go = new GoParser();
  private readonly rust = new RustParser();

  async detect(projectDir: string): Promise<DetectResult> {
    const deps: DetectedDependency[] = [];
    const meta: Record<string, string | null> = {};

    deps.push(...(await this.parsePackageJson(projectDir)));
    deps.push(...(await this.parseRequirementsTxt(projectDir)));
    deps.push(...(await this.parseGemfile(projectDir)));
    deps.push(...(await this.parsePyProjectToml(projectDir)));
    deps.push(...(await this.parseComposerJson(projectDir)));

    const csprojResult = await this.csproj.parse(projectDir);
    deps.push(...csprojResult.deps);
    if (csprojResult.sdk) meta.csprojSdk = csprojResult.sdk;
    if (csprojResult.framework) meta.csTargetFramework = csprojResult.framework;

    const javaResult = await this.java.parse(projectDir);
    deps.push(...javaResult.deps);
    if (javaResult.framework) meta.javaFramework = javaResult.framework;

    const goResult = await this.go.parse(projectDir);
    deps.push(...goResult.deps);
    if (goResult.moduleName) meta.goModule = goResult.moduleName;

    const rustResult = await this.rust.parse(projectDir);
    deps.push(...rustResult.deps);
    if (rustResult.edition) meta.rustEdition = rustResult.edition;

    return { deps, meta };
  }

  private findFiles(dir: string, filename: string): string[] {
    const results: string[] = [];
    const walk = (currentDir: string) => {
      try {
        for (const entry of readdirSync(currentDir)) {
          const fullPath = join(currentDir, entry);
          try {
            const s = statSync(fullPath);
            if (s.isDirectory()) walk(fullPath);
            else if (entry === filename) results.push(fullPath);
          } catch { /* skip */ }
        }
      } catch { /* skip */ }
    };
    walk(dir);
    return results;
  }

  private async safeRead(path: string): Promise<string | null> {
    try { return await readFile(path, "utf-8"); } catch { return null; }
  }

  private async parsePackageJson(dir: string): Promise<DetectedDependency[]> {
    const files = this.findFiles(dir, "package.json");
    const allDeps: DetectedDependency[] = [];
    for (const file of files) {
      const content = await this.safeRead(file);
      if (!content) continue;
      try {
        const pkg = JSON.parse(content);
        for (const [name, version] of Object.entries(pkg.dependencies ?? {})) {
          allDeps.push({ name, version: String(version), type: "production" });
        }
        for (const [name, version] of Object.entries(pkg.devDependencies ?? {})) {
          allDeps.push({ name, version: String(version), type: "development" });
        }
        for (const [name, version] of Object.entries(pkg.peerDependencies ?? {})) {
          allDeps.push({ name, version: String(version), type: "production" });
        }
      } catch { /* skip invalid json */ }
    }
    return allDeps;
  }

  private async parseRequirementsTxt(dir: string): Promise<DetectedDependency[]> {
    const files = this.findFiles(dir, "requirements.txt");
    const allDeps: DetectedDependency[] = [];
    for (const file of files) {
      const content = await this.safeRead(file);
      if (!content) continue;
      for (const l of content.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"))) {
        const [name, ...rest] = l.split(/[=><!~]/);
        allDeps.push({ name: name.trim(), version: rest.length > 0 ? l.slice(name.length) : "*", type: "production" });
      }
    }
    return allDeps;
  }

  private async parseGemfile(dir: string): Promise<DetectedDependency[]> {
    const files = this.findFiles(dir, "Gemfile");
    const allDeps: DetectedDependency[] = [];
    for (const file of files) {
      const content = await this.safeRead(file);
      if (!content) continue;
      for (const l of content.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("gem "))) {
        const m = l.match(/gem\s+["']([^"']+)["'](?:,\s*["']([^"']+)["'])?/);
        if (m) allDeps.push({ name: m[1], version: m[2] ?? "*", type: "production" });
      }
    }
    return allDeps;
  }

  private async parsePyProjectToml(dir: string): Promise<DetectedDependency[]> {
    const files = this.findFiles(dir, "pyproject.toml");
    const allDeps: DetectedDependency[] = [];
    for (const file of files) {
      const content = await this.safeRead(file);
      if (!content) continue;
      const depRegex = /"([\w][\w.-]*)"/g;
      let inDeps = false;
      for (const line of content.split("\n")) {
        if (line.includes("dependencies")) inDeps = true;
        if (inDeps && line.trim() === "]") inDeps = false;
        if (inDeps) {
          let m;
          while ((m = depRegex.exec(line)) !== null) {
            const [name, ...rest] = m[1].split(/[=><!~]/);
            allDeps.push({ name, version: rest.length > 0 ? m[1].slice(name.length) : "*", type: "production" });
          }
        }
      }
    }
    return allDeps;
  }

  private async parseComposerJson(dir: string): Promise<DetectedDependency[]> {
    const files = this.findFiles(dir, "composer.json");
    const allDeps: DetectedDependency[] = [];
    for (const file of files) {
      const content = await this.safeRead(file);
      if (!content) continue;
      try {
        const composer = JSON.parse(content);
        for (const [name, version] of Object.entries(composer.require ?? {})) {
          allDeps.push({ name, version: String(version), type: "production" });
        }
        for (const [name, version] of Object.entries(composer["require-dev"] ?? {})) {
          allDeps.push({ name, version: String(version), type: "development" });
        }
      } catch { /* skip */ }
    }
    return allDeps;
  }
}
