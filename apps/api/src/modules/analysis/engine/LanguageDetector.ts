import type { DetectedLanguage } from "../domain/entities/AnalysisResult.js";

const EXTENSION_MAP: Record<string, string> = {
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".mjs": "JavaScript",
  ".cjs": "JavaScript",
  ".py": "Python",
  ".pyw": "Python",
  ".java": "Java",
  ".kt": "Kotlin",
  ".kts": "Kotlin",
  ".go": "Go",
  ".rs": "Rust",
  ".c": "C",
  ".cpp": "C++",
  ".cxx": "C++",
  ".cc": "C++",
  ".h": "C/C++ Header",
  ".hpp": "C++ Header",
  ".cs": "C#",
  ".rb": "Ruby",
  ".php": "PHP",
  ".swift": "Swift",
  ".scala": "Scala",
  ".dart": "Dart",
  ".lua": "Lua",
  ".r": "R",
  ".R": "R",
  ".sql": "SQL",
  ".sh": "Shell",
  ".bash": "Shell",
  ".zsh": "Shell",
  ".html": "HTML",
  ".htm": "HTML",
  ".css": "CSS",
  ".scss": "SCSS",
  ".sass": "Sass",
  ".less": "Less",
  ".vue": "Vue",
  ".svelte": "Svelte",
  ".astro": "Astro",
  ".graphql": "GraphQL",
  ".gql": "GraphQL",
  ".yaml": "YAML",
  ".yml": "YAML",
  ".toml": "TOML",
  ".json": "JSON",
  ".xml": "XML",
  ".md": "Markdown",
  ".mdx": "MDX",
  ".dockerfile": "Docker",
  ".tf": "Terraform",
  ".hcl": "HCL",
  ".ex": "Elixir",
  ".exs": "Elixir",
  ".erl": "Erlang",
  ".hs": "Haskell",
  ".ml": "OCaml",
};

export class LanguageDetector {
  detect(filePaths: string[]): DetectedLanguage[] {
    const counts = new Map<string, number>();

    for (const file of filePaths) {
      const ext = this.getExtension(file);
      if (!ext) continue;

      const lang = EXTENSION_MAP[ext.toLowerCase()];
      if (lang) {
        counts.set(lang, (counts.get(lang) ?? 0) + 1);
      }
    }

    const total = [...counts.values()].reduce((a, b) => a + b, 0);
    if (total === 0) return [];

    return [...counts.entries()]
      .map(([name, files]) => ({
        name,
        files,
        percentage: Math.round((files / total) * 100),
      }))
      .sort((a, b) => b.files - a.files);
  }

  private getExtension(filePath: string): string {
    const basename = filePath.split(/[\\/]/).pop() ?? "";
    const dotIndex = basename.lastIndexOf(".");
    if (dotIndex === -1) return "";
    return basename.slice(dotIndex);
  }
}
