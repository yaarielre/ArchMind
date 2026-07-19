import { readdir } from "node:fs/promises";
import { join } from "node:path";

import type { ProjectTreeNode } from "../domain/entities/AnalysisResult.js";

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
  ".DS_Store",
  "Thumbs.db",
]);

export class FolderAnalyzer {
  async buildTree(dir: string, relativePath = ""): Promise<ProjectTreeNode[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const nodes: ProjectTreeNode[] = [];

    for (const entry of entries) {
      if (IGNORED.has(entry.name)) continue;

      const fullPath = join(dir, entry.name);
      const entryRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        const children = await this.buildTree(fullPath, entryRelative);
        if (children.length > 0) {
          nodes.push({ name: entry.name, path: entryRelative, type: "directory", children });
        }
      } else {
        const ext = entry.name.includes(".")
          ? entry.name.slice(entry.name.lastIndexOf("."))
          : undefined;
        nodes.push({ name: entry.name, path: entryRelative, type: "file", extension: ext });
      }
    }

    return nodes.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "directory" ? -1 : 1;
    });
  }

  async getFilePaths(dir: string, relativePath = ""): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const paths: string[] = [];

    for (const entry of entries) {
      if (IGNORED.has(entry.name)) continue;

      const fullPath = join(dir, entry.name);
      const entryRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        paths.push(...(await this.getFilePaths(fullPath, entryRelative)));
      } else {
        paths.push(entryRelative);
      }
    }

    return paths;
  }
}
