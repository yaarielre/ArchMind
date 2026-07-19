import type { IAIClient, AICompletionRequest, AICompletionResponse } from "../../engine/AIClient.js";

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
      const error = await response.text();
      throw new Error(`AI API error: ${response.status} - ${error}`);
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
  }

  getName(): string {
    return "nvidia-openai";
  }
}
