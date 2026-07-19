import type { KnowledgeModel } from "../../../knowledge/domain/entities/KnowledgeModel.js";
import type { DocumentSection } from "../../../documentation/domain/entities/DocumentationResult.js";
import type { IAIEnricher } from "../../domain/interfaces/IAIEnricher.js";
import type { AIEnrichResult, AIEnrichedSection, AIConfig } from "../../domain/entities/AIResult.js";
import type { IAIClient } from "../../engine/AIClient.js";
import { PromptBuilder } from "../../engine/PromptBuilder.js";
import { OpenAIClient } from "./OpenAIClient.js";

const BATCH_THRESHOLD = 4;
const MAX_PARALLEL = 2;

export class AIEnricher implements IAIEnricher {
  private readonly promptBuilder = new PromptBuilder();

  async enrich(
    knowledge: KnowledgeModel,
    sections: DocumentSection[],
    config: AIConfig
  ): Promise<AIEnrichResult> {
    const client = this.createClient(config);
    const systemPrompt = this.promptBuilder.buildSystemPrompt();

    if (sections.length >= BATCH_THRESHOLD) {
      return this.enrichBatched(client, knowledge, sections, config, systemPrompt);
    }

    return this.enrichIndividual(client, knowledge, sections, config, systemPrompt);
  }

  private async enrichBatched(
    client: IAIClient,
    knowledge: KnowledgeModel,
    sections: DocumentSection[],
    config: AIConfig,
    systemPrompt: string,
  ): Promise<AIEnrichResult> {
    const mid = Math.ceil(sections.length / 2);
    const batch1 = sections.slice(0, mid);
    const batch2 = sections.slice(mid);

    const [result1, result2] = await Promise.all([
      this.processBatch(client, knowledge, batch1, config, systemPrompt),
      this.processBatch(client, knowledge, batch2, config, systemPrompt),
    ]);

    const allSections = [...result1, ...result2];
    const totalTokens = allSections.reduce((t, s) => t + s.tokensUsed, 0);

    return {
      sections: allSections,
      fullMarkdown: allSections.map((s) => s.enriched).join("\n\n"),
      totalTokens,
      provider: client.getName(),
      model: allSections[0]?.model ?? "unknown",
      enrichedAt: new Date(),
    };
  }

  private async processBatch(
    client: IAIClient,
    knowledge: KnowledgeModel,
    sections: DocumentSection[],
    config: AIConfig,
    systemPrompt: string,
  ): Promise<AIEnrichedSection[]> {
    const batchPrompt = this.promptBuilder.buildBatchAnalysis(
      sections.map((s) => s.id),
      knowledge,
    );
    const response = await client.complete({
      systemPrompt,
      userPrompt: batchPrompt,
      model: config.model,
      maxTokens: 2000,
      temperature: 0.5,
    });

    const analysisTexts = this.parseBatchResponse(response.content, sections);

    return sections.map((section, i) => {
      const analysis = analysisTexts[i] ?? "";
      const combined = this.combineContent(section.content, analysis);
      return {
        sectionId: section.id,
        original: section.content,
        enriched: combined,
        provider: client.getName(),
        model: response.model,
        tokensUsed: Math.round(response.tokensUsed / sections.length),
      };
    });
  }

  private parseBatchResponse(response: string, sections: DocumentSection[]): string[] {
    const results: string[] = [];
    const parts = response.split(/^## /m).filter(Boolean);

    for (const section of sections) {
      const titleLower = section.title.toLowerCase();
      const found = parts.find((p) =>
        p.toLowerCase().startsWith(titleLower) ||
        p.toLowerCase().includes(titleLower)
      );
      results.push(found ? found.replace(/^.*?\n/, "").trim() : "");
    }

    return results;
  }

  private async enrichIndividual(
    client: IAIClient,
    knowledge: KnowledgeModel,
    sections: DocumentSection[],
    config: AIConfig,
    systemPrompt: string,
  ): Promise<AIEnrichResult> {
    const enrichedSections = await this.mapWithConcurrency(sections, async (section) => {
      const response = await client.complete({
        systemPrompt,
        userPrompt: this.promptBuilder.buildSectionAnalysis(section.id, knowledge),
        model: config.model,
        maxTokens: 1200,
        temperature: 0.5,
      });

      const combined = this.combineContent(section.content, response.content);

      return {
        sectionId: section.id,
        original: section.content,
        enriched: combined,
        provider: client.getName(),
        model: response.model,
        tokensUsed: response.tokensUsed,
      };
    });

    const totalTokens = enrichedSections.reduce((total, section) => total + section.tokensUsed, 0);

    return {
      sections: enrichedSections,
      fullMarkdown: enrichedSections.map((s) => s.enriched).join("\n\n"),
      totalTokens,
      provider: client.getName(),
      model: enrichedSections[0]?.model ?? "unknown",
      enrichedAt: new Date(),
    };
  }

  private combineContent(templateContent: string, aiAnalysis: string): string {
    const cleanAnalysis = aiAnalysis
      .replace(/^#+\s+.*?\n/gm, "")
      .trim();

    if (!cleanAnalysis) return templateContent;
    return `${templateContent}\n\n${cleanAnalysis}`;
  }

  private createClient(config: AIConfig): IAIClient {
    return new OpenAIClient(config.apiKey, config.baseUrl);
  }

  private async mapWithConcurrency<T, R>(items: T[], task: (item: T) => Promise<R>): Promise<R[]> {
    const results = new Array<R>(items.length);
    let nextIndex = 0;
    const worker = async (): Promise<void> => {
      while (nextIndex < items.length) {
        const index = nextIndex++;
        results[index] = await task(items[index]);
      }
    };
    await Promise.all(Array.from({ length: Math.min(MAX_PARALLEL, items.length) }, worker));
    return results;
  }
}
