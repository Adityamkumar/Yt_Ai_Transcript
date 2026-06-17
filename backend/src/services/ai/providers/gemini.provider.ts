import { getGeminiClient } from "../../../ai/gemini.client.js";
import type { IAIProvider } from "./aiProvider.service.js";

const TIMEOUT_MS = 8000;

const withTimeout = <T>(promise: Promise<T>, providerName: string): Promise<T> => {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`[AI] Provider ${providerName} request timed out after ${TIMEOUT_MS}ms`));
    }, TIMEOUT_MS);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
};

export class GeminiProvider implements IAIProvider {
  readonly name = "Gemini";

  private getModel(): string {
    return process.env.GEMINI_MODEL || "gemini-2.5-flash";
  }

  async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    const ai = getGeminiClient();
    const model = this.getModel();
    const contents = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

    const response = await withTimeout(
      ai.models.generateContent({
        model,
        contents,
      }),
      this.name
    );

    return response.text?.trim() || "";
  }

  async generateStructuredResponse(prompt: string, schema: any, systemPrompt?: string): Promise<string> {
    const ai = getGeminiClient();
    const model = this.getModel();
    const contents = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

    const response = await withTimeout(
      ai.models.generateContent({
        model,
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      }),
      this.name
    );

    return response.text?.trim() || "";
  }

  async *generateStream(prompt: string, systemPrompt?: string): AsyncGenerator<string, void, unknown> {
    const ai = getGeminiClient();
    const model = this.getModel();
    const contents = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

    const responseStream = await withTimeout(
      ai.models.generateContentStream({
        model,
        contents,
      }),
      this.name
    );

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  }
}
