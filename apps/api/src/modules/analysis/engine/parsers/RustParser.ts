import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { DetectedDependency } from "../../domain/entities/AnalysisResult.js";

export class RustParser {
  async parse(dir: string): Promise<{ deps: DetectedDependency[]; edition: string | null }> {
    const deps: DetectedDependency[] = [];
    let edition: string | null = null;

    const cargoPath = await this.findFile(dir, "Cargo.toml");
    if (!cargoPath) return { deps, edition };

    const cargo = await this.safeRead(cargoPath);
    if (!cargo) return { deps, edition };

    const editionMatch = cargo.match(/edition\s*=\s*"([^"]+)"/);
    if (editionMatch) edition = editionMatch[1];

    let currentSection = "";
    for (const line of cargo.split("\n")) {
      const sectionMatch = line.match(/^\[([^\]]+)\]/);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
        continue;
      }
      if (currentSection === "dependencies" || currentSection.startsWith("dependencies.")) {
        const depMatch = line.match(/^([\w][\w-]*)\s*=\s*"([^"]+)"/);
        if (depMatch) {
          deps.push({ name: depMatch[1], version: depMatch[2], type: "production" });
        }
        const depObjMatch = line.match(/^([\w][\w-]*)\s*=\s*\{[^}]*version\s*=\s*"([^"]+)"/);
        if (depObjMatch) {
          deps.push({ name: depObjMatch[1], version: depObjMatch[2], type: "production" });
        }
      }
      if (currentSection === "dev-dependencies") {
        const depMatch = line.match(/^([\w][\w-]*)\s*=\s*"([^"]+)"/);
        if (depMatch) {
          deps.push({ name: depMatch[1], version: depMatch[2], type: "development" });
        }
      }
    }

    return { deps, edition };
  }

  private async findFile(dir: string, filename: string): Promise<string | null> {
    const { readdirSync, statSync } = await import("node:fs");

    const walk = (currentDir: string): string | null => {
      try {
        for (const entry of readdirSync(currentDir)) {
          const fullPath = join(currentDir, entry);
          try {
            const stat = statSync(fullPath);
            if (stat.isDirectory()) {
              const found = walk(fullPath);
              if (found) return found;
            } else if (entry === filename) {
              return fullPath;
            }
          } catch { /* skip */ }
        }
      } catch { /* skip */ }
      return null;
    };

    return walk(dir);
  }

  private async safeRead(path: string): Promise<string | null> {
    try { return await readFile(path, "utf-8"); } catch { return null; }
  }
}
