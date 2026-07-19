export interface AIEnrichedSection {
  sectionId: string;
  original: string;
  enriched: string;
  provider: string;
  model: string;
  tokensUsed: number;
}

export interface AIEnrichResult {
  sections: AIEnrichedSection[];
  fullMarkdown: string;
  totalTokens: number;
  provider: string;
  model: string;
  enrichedAt: Date;
}

export type AIProvider = "openai" | "claude" | "gemini";

export interface AIConfig {
  provider: AIProvider;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  sections?: string[];
}
