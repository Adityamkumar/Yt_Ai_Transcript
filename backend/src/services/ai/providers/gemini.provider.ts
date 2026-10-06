import { ThinkingLevel } from "@google/genai";
import { getGeminiGenerationClient } from "../../../ai/gemini.client.js";
import type { AIRequestOptions, IAIProvider } from "./aiProvider.service.js";

const TIMEOUT_MS = 8000;
const LONG_SUMMARY_TIMEOUT_MS = 60000;
const withTimeout = <T>(
  promise: Promise<T>,
  providerName: string,
  timeoutMs = TIMEOUT_MS,
): Promise<T> => {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      const timeoutError = new Error(
        `[AI] Provider ${providerName} request timed out after ${timeoutMs}ms`,
      );

      (timeoutError as Error & { status: number }).status = 408;

      reject(timeoutError);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
};

export class GeminiProvider implements IAIProvider {
  readonly name = "Gemini";

  private getModel(): string {
    return process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
  }

  async generateResponse(
    prompt: string,
    systemPrompt?: string,
    options?: AIRequestOptions,
  ): Promise<string> {
    const ai = getGeminiGenerationClient();
    const model = this.getModel();

    const contents = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

    const timeoutMs =
      options?.purpose === "summary" || options?.purpose === "long-summary"
        ? LONG_SUMMARY_TIMEOUT_MS
        : TIMEOUT_MS;
    const response = await withTimeout(
      ai.models.generateContent({
        model,
        contents,
        ...(options?.purpose === "summary" ||
        options?.purpose === "long-summary"
          ? {
              config: {
                thinkingConfig: {
                  thinkingLevel: ThinkingLevel.MINIMAL,
                },
              },
            }
          : {}),
      }),
      this.name,
      timeoutMs,
    );

    return response.text?.trim() || "";
  }

  async generateStructuredResponse(
    prompt: string,
    schema: any,
    systemPrompt?: string,
    options?: AIRequestOptions,
  ): Promise<string> {
    const ai = getGeminiGenerationClient();
    const model = this.getModel();

    const contents = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

    const timeoutMs =
      options?.purpose === "long-summary"
        ? LONG_SUMMARY_TIMEOUT_MS
        : TIMEOUT_MS;

    const response = await withTimeout(
      ai.models.generateContent({
        model,
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          ...(options?.purpose === "summary" ||
          options?.purpose === "long-summary"
            ? {
                thinkingConfig: {
                  thinkingLevel: ThinkingLevel.MINIMAL,
                },
              }
            : {}),
        },
      }),
      this.name,
      timeoutMs,
    );

    return response.text?.trim() || "";
  }

  async *generateStream(
    prompt: string,
    systemPrompt?: string,
  ): AsyncGenerator<string, void, unknown> {
    const ai = getGeminiGenerationClient();
    const model = this.getModel();

    const contents = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

    const responseStream = await withTimeout(
      ai.models.generateContentStream({
        model,
        contents,
      }),
      this.name,
    );

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  }

  async countTokens(prompt: string): Promise<number> {
    const ai = getGeminiGenerationClient();
    const model = this.getModel();

    const response = await ai.models.countTokens({
      model,
      contents: prompt,
    });

    return response.totalTokens ?? 0;
  }
}
