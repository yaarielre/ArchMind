import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { DetectedDependency } from "../../domain/entities/AnalysisResult.js";

export class GoParser {
  async parse(dir: string): Promise<{ deps: DetectedDependency[]; moduleName: string | null }> {
    const deps: DetectedDependency[] = [];
    let moduleName: string | null = null;

    const goModPath = await this.findFile(dir, "go.mod");
    if (!goModPath) return { deps, moduleName };

    const goMod = await this.safeRead(goModPath);
    if (!goMod) return { deps, moduleName };

    const moduleMatch = goMod.match(/^module\s+(.+)$/m);
    if (moduleMatch) moduleName = moduleMatch[1].trim();

    const requireBlockRegex = /require\s*(?:\([^)]+\)|([^\n]+))/g;
    let blockMatch;
    while ((blockMatch = requireBlockRegex.exec(goMod)) !== null) {
      const block = blockMatch[1] ?? blockMatch[0];
      const depRegex = /^[\s]+([\w./-]+)\s+(v[\d.]+\S*)/gm;
      let depMatch;
      while ((depMatch = depRegex.exec(block)) !== null) {
        deps.push({ name: depMatch[1], version: depMatch[2], type: "production" });
      }
    }

    return { deps, moduleName };
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
