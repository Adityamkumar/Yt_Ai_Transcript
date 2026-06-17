import Groq from "groq-sdk";
import type { IAIProvider } from "./aiProvider.service.js";

let groqClient: Groq | null = null;

const getGroqClient = (): Groq => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set.");
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
};

export class GroqProvider implements IAIProvider {
  readonly name = "Groq";

  private getModel(): string {
    return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  }

  async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    const client = getGroqClient();
    const model = this.getModel();
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const params: any = {
      model,
      messages,
    };

    if (model.toLowerCase().includes("r1") || model.toLowerCase().includes("reasoning") || model.toLowerCase().includes("think")) {
      params.thinking = { type: "none" };
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
    const client = getGroqClient();
    const model = this.getModel();
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const params: any = {
      model,
      messages,
      response_format: { type: "json_object" },
    };

    if (model.toLowerCase().includes("r1") || model.toLowerCase().includes("reasoning") || model.toLowerCase().includes("think")) {
      params.thinking = { type: "none" };
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
    const client = getGroqClient();
    const model = this.getModel();
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const params: any = {
      model,
      messages,
      stream: true,
    };

    if (model.toLowerCase().includes("r1") || model.toLowerCase().includes("reasoning") || model.toLowerCase().includes("think")) {
      params.thinking = { type: "none" };
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
