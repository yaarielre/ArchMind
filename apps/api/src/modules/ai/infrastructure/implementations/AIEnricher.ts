import type { KnowledgeModel } from "../../../knowledge/domain/entities/KnowledgeModel.js";
import type { DocumentSection } from "../../../documentation/domain/entities/DocumentationResult.js";
import type { IAIEnricher } from "../../domain/interfaces/IAIEnricher.js";
import type { AIEnrichResult, AIEnrichedSection, AIConfig } from "../../domain/entities/AIResult.js";
import type { IAIClient } from "../../engine/AIClient.js";
import { PromptBuilder } from "../../engine/PromptBuilder.js";
import { OpenAIClient } from "./OpenAIClient.js";

export class AIEnricher implements IAIEnricher {
  private readonly promptBuilder = new PromptBuilder();
  private readonly maxParallelRequests = 3;

  async enrich(
    knowledge: KnowledgeModel,
    sections: DocumentSection[],
    config: AIConfig
  ): Promise<AIEnrichResult> {
    const client = this.createClient(config);
    const systemPrompt = this.promptBuilder.buildSystemPrompt(knowledge);
    const enrichedSections = await this.mapWithConcurrency(sections, async (section) => {
      const response = await client.complete({
        systemPrompt,
        userPrompt: this.promptBuilder.buildSectionPrompt(section, knowledge),
        model: config.model,
        maxTokens: 1200,
        temperature: 0.5,
      });

      return {
        sectionId: section.id,
        original: section.content,
        enriched: response.content,
        provider: client.getName(),
        model: response.model,
        tokensUsed: response.tokensUsed,
      };
    });

    const totalTokens = enrichedSections.reduce((total, section) => total + section.tokensUsed, 0);
    const parts = enrichedSections.map((section) => section.enriched);

    return {
      sections: enrichedSections,
      fullMarkdown: parts.join("\n\n"),
      totalTokens,
      provider: client.getName(),
      model: enrichedSections[0]?.model ?? "unknown",
      enrichedAt: new Date(),
    };
  }

  private createClient(config: AIConfig): IAIClient {
    switch (config.provider) {
      case "openai":
        return new OpenAIClient(config.apiKey, config.baseUrl);
      default:
        return new OpenAIClient(config.apiKey, config.baseUrl);
    }
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
    await Promise.all(Array.from({ length: Math.min(this.maxParallelRequests, items.length) }, worker));
    return results;
  }
}
