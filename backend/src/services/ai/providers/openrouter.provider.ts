import OpenAI from "openai";
import type { IAIProvider } from "./aiProvider.service.js";

let openRouterClient: OpenAI | null = null;

const getOpenRouterClient = (): OpenAI => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set.");
  }
  if (!openRouterClient) {
    openRouterClient = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
      defaultHeaders: {
        "HTTP-Referer": "https://echomind.ai",
        "X-Title": "EchoMind AI",
      },
    });
  }
  return openRouterClient;
};

export class OpenRouterProvider implements IAIProvider {
  readonly name = "OpenRouter";

  private getModel(): string {
    return process.env.OPENROUTER_MODEL || "openrouter/auto";
  }

  async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    const client = getOpenRouterClient();
    const model = this.getModel();
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const params: any = {
      model,
      messages,
    };

    if (model.includes("auto") || model.includes("r1") || model.includes("deepseek") || model.includes("think") || model.includes("reasoning")) {
      params.reasoning_effort = "none";
    }

    const response = await client.chat.completions.create(
      params,
      {
        timeout: 8000,
      }
    );

    return response.choices[0]?.message?.content?.trim() || "";
  }

  async generateStructuredResponse(prompt: string, schema: any, systemPrompt?: string): Promise<string> {
    const client = getOpenRouterClient();
    const model = this.getModel();
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const params: any = {
      model,
      messages,
      response_format: { type: "json_object" },
    };

    if (model.includes("auto") || model.includes("r1") || model.includes("deepseek") || model.includes("think") || model.includes("reasoning")) {
      params.reasoning_effort = "none";
    }

    const response = await client.chat.completions.create(
      params,
      {
        timeout: 8000,
      }
    );

    return response.choices[0]?.message?.content?.trim() || "";
  }

  async *generateStream(prompt: string, systemPrompt?: string): AsyncGenerator<string, void, unknown> {
    const client = getOpenRouterClient();
    const model = this.getModel();
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const params: any = {
      model,
      messages,
      stream: true,
    };

    if (model.includes("auto") || model.includes("r1") || model.includes("deepseek") || model.includes("think") || model.includes("reasoning")) {
      params.reasoning_effort = "none";
    }

    const stream = await client.chat.completions.create(
      params,
      {
        timeout: 8000,
      }
    ) as any;

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        yield text;
      }
    }
  }
}
