export interface DocumentationResult {
  markdown: string;
  sections: DocumentSection[];
  generatedAt: Date;
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export type SectionType =
  | "executive-summary"
  | "architecture"
  | "stack"
  | "dependencies"
  | "modules"
  | "statistics"
  | "recommendations";

export const SECTION_ORDER: SectionType[] = [
  "executive-summary",
  "architecture",
  "stack",
  "dependencies",
  "modules",
  "statistics",
  "recommendations",
];
