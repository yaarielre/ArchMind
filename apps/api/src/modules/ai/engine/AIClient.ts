export interface AICompletionRequest {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AICompletionResponse {
  content: string;
  model: string;
  tokensUsed: number;
}

export interface IAIClient {
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
  getName(): string;
}
