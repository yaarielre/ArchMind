import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { DetectedDependency } from "../../domain/entities/AnalysisResult.js";

export class CsProjParser {
  async parse(dir: string): Promise<{ deps: DetectedDependency[]; framework: string | null; sdk: string | null }> {
    const files = await this.findCsProjFiles(dir);
    const deps: DetectedDependency[] = [];
    let framework: string | null = null;
    let sdk: string | null = null;

    for (const file of files) {
      const content = await this.safeRead(file);
      if (!content) continue;

      const parsed = this.parseCsProjContent(content);
      deps.push(...parsed.deps);
      if (parsed.sdk) {
        if (parsed.sdk.includes("Web")) sdk = parsed.sdk;
        else if (!sdk) sdk = parsed.sdk;
      }
      if (parsed.framework && !framework) framework = parsed.framework;
    }

    return { deps, framework, sdk };
  }

  private async safeRead(path: string): Promise<string | null> {
    try { return await readFile(path, "utf-8"); } catch { return null; }
  }

  private async findCsProjFiles(dir: string): Promise<string[]> {
    const { readdirSync, statSync } = await import("node:fs");
    const results: string[] = [];

    const walk = (currentDir: string) => {
      try {
        for (const entry of readdirSync(currentDir)) {
          const fullPath = join(currentDir, entry);
          try {
            const stat = statSync(fullPath);
            if (stat.isDirectory()) {
              walk(fullPath);
            } else if (entry.endsWith(".csproj")) {
              results.push(fullPath);
            }
          } catch { /* skip inaccessible entries */ }
        }
      } catch { /* skip inaccessible directories */ }
    };

    walk(dir);
    return results;
  }

  private parseCsProjContent(content: string): { deps: DetectedDependency[]; sdk: string | null; framework: string | null } {
    const deps: DetectedDependency[] = [];
    let sdk: string | null = null;
    let framework: string | null = null;

    const sdkMatch = content.match(/<Project\s+Sdk\s*=\s*"([^"]+)"/);
    if (sdkMatch) sdk = sdkMatch[1];

    const frameworkMatch = content.match(/<TargetFramework>([^<]+)<\/TargetFramework>/);
    if (frameworkMatch) framework = frameworkMatch[1];

    const packageRefRegex = /<PackageReference\s+Include\s*=\s*"([^"]+)"\s+Version\s*=\s*"([^"]+)"/g;
    let match;
    while ((match = packageRefRegex.exec(content)) !== null) {
      deps.push({ name: match[1], version: match[2], type: "production" });
    }

    const projectRefRegex = /<ProjectReference\s+Include\s*=\s*"([^"]+)"/g;
    while ((match = projectRefRegex.exec(content)) !== null) {
      const name = match[1].split(/[/\\]/).pop()?.replace(/\.csproj$/, "") ?? match[1];
      deps.push({ name, version: "*", type: "production" });
    }

    return { deps, sdk, framework };
  }
}
