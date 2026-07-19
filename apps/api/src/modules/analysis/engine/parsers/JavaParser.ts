import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { DetectedDependency } from "../../domain/entities/AnalysisResult.js";

export class JavaParser {
  async parse(dir: string): Promise<{ deps: DetectedDependency[]; framework: string | null }> {
    const deps: DetectedDependency[] = [];
    let framework: string | null = null;

    const configFiles = await this.findConfigFiles(dir);

    for (const file of configFiles) {
      const content = await this.safeRead(file);
      if (!content) continue;

      if (file.endsWith("pom.xml")) {
        const parsed = this.parsePomXml(content);
        deps.push(...parsed.deps);
        if (!framework && parsed.framework) framework = parsed.framework;
      } else if (file.endsWith("build.gradle")) {
        if (!framework) framework = this.detectFromGradle(content);
      }
    }

    return { deps, framework };
  }

  private async findConfigFiles(dir: string): Promise<string[]> {
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
            } else if (entry === "pom.xml" || entry === "build.gradle") {
              results.push(fullPath);
            }
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

  private parsePomXml(content: string): { deps: DetectedDependency[]; framework: string | null } {
    const deps: DetectedDependency[] = [];
    let framework: string | null = null;

    const depRegex = /<dependency>\s*<groupId>([^<]+)<\/groupId>\s*<artifactId>([^<]+)<\/artifactId>\s*(?:<version>([^<]+)<\/version>)?/g;
    let match;
    while ((match = depRegex.exec(content)) !== null) {
      deps.push({
        name: match[2],
        version: match[3] ?? "managed",
        type: "production",
      });
    }

    if (content.includes("spring-boot")) framework = "Spring Boot";
    else if (content.includes("quarkus")) framework = "Quarkus";
    else if (content.includes("micronaut")) framework = "Micronaut";
    else if (content.includes("jakarta")) framework = "Jakarta EE";

    return { deps, framework };
  }

  private detectFromGradle(content: string): string | null {
    if (content.includes("org.springframework.boot")) return "Spring Boot";
    if (content.includes("io.quarkus")) return "Quarkus";
    if (content.includes("io.micronaut")) return "Micronaut";
    return null;
  }
}
