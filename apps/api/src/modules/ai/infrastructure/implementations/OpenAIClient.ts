import type { IAIClient, AICompletionRequest, AICompletionResponse } from "../../engine/AIClient.js";

const RETRYABLE_STATUS = new Set([429, 503, 504]);
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;

function isRetryable(status: number): boolean {
  return RETRYABLE_STATUS.has(status);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class OpenAIClient implements IAIClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey ?? process.env.OPENAI_API_KEY ?? "";
    this.baseUrl = baseUrl ?? process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
    if (!this.apiKey) {
      throw new Error("API key is required. Set OPENAI_API_KEY environment variable.");
    }
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const model = request.model ?? "openai/gpt-oss-20b";

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: request.systemPrompt },
              { role: "user", content: request.userPrompt },
            ],
            max_tokens: request.maxTokens ?? 4096,
            temperature: request.temperature ?? 0.7,
            stream: false,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          if (isRetryable(response.status) && attempt < MAX_RETRIES - 1) {
            const delay = BASE_DELAY_MS * Math.pow(2, attempt);
            await sleep(delay);
            lastError = new Error(`AI API error: ${response.status} - ${errorText}`);
            continue;
          }
          throw new Error(`AI API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json() as {
          choices: { message: { content: string; reasoning_content?: string } }[];
          usage: { total_tokens: number };
          model: string;
        };

        return {
          content: data.choices[0]?.message?.content ?? "",
          model: data.model,
          tokensUsed: data.usage?.total_tokens ?? 0,
        };
      } catch (error) {
        if (error instanceof Error && error.message.startsWith("AI API error:")) {
          throw error;
        }
        if (attempt < MAX_RETRIES - 1) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          await sleep(delay);
          lastError = error instanceof Error ? error : new Error(String(error));
          continue;
        }
        throw lastError ?? error;
      }
    }

    throw lastError ?? new Error("AI API failed after max retries");
  }

  getName(): string {
    return "nvidia-openai";
  }
}
