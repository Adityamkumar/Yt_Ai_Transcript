import { providerRegistry } from "./providerRegistry.js";
import logger from "../../../lib/logger.js";

export interface IAIProvider {
  readonly name: string;
  generateResponse(prompt: string, systemPrompt?: string): Promise<string>;
  generateStructuredResponse(prompt: string, schema: any, systemPrompt?: string): Promise<string>;
  generateStream(prompt: string, systemPrompt?: string): Promise<AsyncGenerator<string, void, unknown>> | AsyncGenerator<string, void, unknown>;
}


export const sanitizeModelOutput = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, "")
    .trim();
};


export async function* sanitizeStream(
  stream: AsyncGenerator<string, void, unknown>
): AsyncGenerator<string, void, unknown> {
  let buffer = "";
  let insideTag: "think" | "thinking" | "reasoning" | null = null;

  const tags = [
    { start: "<think>", end: "</think>", name: "think" },
    { start: "<thinking>", end: "</thinking>", name: "thinking" },
    { start: "<reasoning>", end: "</reasoning>", name: "reasoning" }
  ] as const;

  for await (const chunk of stream) {
    buffer += chunk;

    let changed = true;
    while (changed) {
      changed = false;

      if (!insideTag) {
        let foundStart = false;

        for (const tag of tags) {
          if (buffer.startsWith(tag.start)) {
            insideTag = tag.name;
            buffer = buffer.slice(tag.start.length);
            foundStart = true;
            changed = true;
            break;
          }
        }

        if (foundStart) continue;

        let isPrefix = false;
        for (const tag of tags) {
          if (tag.start.startsWith(buffer)) {
            isPrefix = true;
            break;
          }
        }

        if (isPrefix) {
          break;
        } else {
          const angleIndex = buffer.indexOf("<");
          if (angleIndex !== -1) {
            const toYield = buffer.slice(0, angleIndex);
            if (toYield) {
              yield toYield;
            }
            buffer = buffer.slice(angleIndex);
          } else {
            yield buffer;
            buffer = "";
          }
        }
      } else {
        const currentTagObj = tags.find(t => t.name === insideTag)!;
        const endTagIndex = buffer.indexOf(currentTagObj.end);

        if (endTagIndex !== -1) {
          buffer = buffer.slice(endTagIndex + currentTagObj.end.length);
          insideTag = null;
          changed = true;
        } else {
          let hasPartialEnd = false;
          for (let len = currentTagObj.end.length - 1; len > 0; len--) {
            const partial = currentTagObj.end.slice(0, len);
            if (buffer.endsWith(partial)) {
              hasPartialEnd = true;
              break;
            }
          }

          if (!hasPartialEnd) {
            buffer = "";
          }
          break;
        }
      }
    }
  }

  if (!insideTag && buffer) {
    yield buffer;
  }
}

export class AIProviderService {
  private unhealthyCooldowns: Map<string, number> = new Map();
  private readonly COOLDOWN_DURATION_MS = 5 * 60 * 1000;

  private isHealthy(providerName: string): boolean {
    const nameLower = providerName.toLowerCase();
    const cooldownUntil = this.unhealthyCooldowns.get(nameLower);
    
    if (!cooldownUntil) {
      return true;
    }
    
    if (Date.now() >= cooldownUntil) {

      this.unhealthyCooldowns.delete(nameLower);
      return true;
    }
    
    return false;
  }

  private markUnhealthy(providerName: string) {
    const nameLower = providerName.toLowerCase();
    const cooldownUntil = Date.now() + this.COOLDOWN_DURATION_MS;
    this.unhealthyCooldowns.set(nameLower, cooldownUntil);
    logger.warn({ providerName }, "[AI] Provider Health: Marked unhealthy. Skipping for 5 minutes.");
  }

  private async executeWithFallback<T>(
    actionName: string,
    actionFn: (provider: IAIProvider) => Promise<T>
  ): Promise<T> {
    const providers = providerRegistry.getOrderedProviders();
    let lastError: any = null;

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i]!;
      
      if (!this.isHealthy(provider.name)) {

        continue;
      }


      const startTime = Date.now();
      
      try {
        const result = await actionFn(provider);
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        return result;
      } catch (error: any) {
        lastError = error;
        logger.warn({ error, providerName: provider.name, actionName }, "[AI] Provider failed during action");
        this.markUnhealthy(provider.name);

        const nextProvider = providers[i + 1];
        if (nextProvider) {

        }
      }
    }

    logger.error({ lastError, actionName }, "[AI] All providers failed during action");
    throw new Error("Response generation temporarily unavailable.");
  }

  async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    const raw = await this.executeWithFallback("generateResponse", (provider) => 
      provider.generateResponse(prompt, systemPrompt)
    );
    return sanitizeModelOutput(raw);
  }

  async generateStructuredResponse(
    prompt: string,
    schema: any,
    systemPrompt?: string,
    validateFn?: (rawText: string) => boolean
  ): Promise<string> {
    const raw = await this.executeWithFallback("generateStructuredResponse", async (provider) => {
      const response = await provider.generateStructuredResponse(prompt, schema, systemPrompt);
      if (validateFn && !validateFn(response)) {
        throw new Error(`[AI] Provider ${provider.name} response failed structured format validation.`);
      }
      return response;
    });
    return sanitizeModelOutput(raw);
  }

  async *generateStream(prompt: string, systemPrompt?: string): AsyncGenerator<string, void, unknown> {
    const providers = providerRegistry.getOrderedProviders();
    let lastError: any = null;

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i]!;

      if (!this.isHealthy(provider.name)) {

        continue;
      }


      let yieldedAny = false;
      const startTime = Date.now();

      try {
        const stream = await provider.generateStream(prompt, systemPrompt);
        const sanitizedStream = sanitizeStream(stream);
        
        for await (const chunk of sanitizedStream) {
          if (!yieldedAny) {
            yieldedAny = true;
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);

          }
          yield chunk;
        }
        return;
      } catch (error: any) {
        lastError = error;
        logger.warn({ error, providerName: provider.name }, "[AI] Provider failed during generateStream");
        
        if (yieldedAny) {
          logger.error({ providerName: provider.name }, "[AI] Stream failed mid-generation on provider. Cannot fall back.");
          throw error;
        }

        this.markUnhealthy(provider.name);

        const nextProvider = providers[i + 1];
        if (nextProvider) {

        }
      }
    }

    logger.error({ lastError }, "[AI] All providers failed during generateStream");
    throw new Error("Response generation temporarily unavailable.");
  }
}

export const aiProviderService = new AIProviderService();
