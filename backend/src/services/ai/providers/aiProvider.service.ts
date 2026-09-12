import { providerRegistry } from "./providerRegistry.js";
import logger from "../../../lib/logger.js";

export interface IAIProvider {
  readonly name: string;
  generateResponse(prompt: string, systemPrompt?: string): Promise<string>;
  generateStructuredResponse(
    prompt: string,
    schema: any,
    systemPrompt?: string,
  ): Promise<string>;
  generateStream(
    prompt: string,
    systemPrompt?: string,
  ):
    | Promise<AsyncGenerator<string, void, unknown>>
    | AsyncGenerator<string, void, unknown>;
}

export const sanitizeModelOutput = (
  text: string | null | undefined,
): string => {
  if (!text) return "";
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, "")
    .trim();
};

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

type ProviderCircuit = {
  state: CircuitState;
  failureCount: number;
  openedAt: number | null;
  openUntil: number | null;
  halfOpenInFlight: boolean;
};

export async function* sanitizeStream(
  stream: AsyncGenerator<string, void, unknown>,
): AsyncGenerator<string, void, unknown> {
  let buffer = "";
  let insideTag: "think" | "thinking" | "reasoning" | null = null;

  const tags = [
    { start: "<think>", end: "</think>", name: "think" },
    { start: "<thinking>", end: "</thinking>", name: "thinking" },
    { start: "<reasoning>", end: "</reasoning>", name: "reasoning" },
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
        const currentTagObj = tags.find((t) => t.name === insideTag)!;
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
const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const getErrorStatus = (error: any): number | null => {
  if (typeof error?.status === "number") {
    return error.status;
  }

  if (typeof error?.statusCode === "number") {
    return error.statusCode;
  }

  return null;
};

const isTransientProviderError = (error: any): boolean => {
  const status = getErrorStatus(error);

  return (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
};

const getRetryAfterMs = (error: any): number | null => {
  const headers = error?.headers;

  if (headers) {
    let retryAfter: string | null = null;

    if (typeof headers.get === "function") {
      retryAfter = headers.get("retry-after");
    } else if (typeof headers["retry-after"] === "string") {
      retryAfter = headers["retry-after"];
    } else if (typeof headers["Retry-After"] === "string") {
      retryAfter = headers["Retry-After"];
    }

    if (retryAfter) {
      const seconds = Number(retryAfter);

      if (Number.isFinite(seconds) && seconds >= 0) {
        return seconds * 1000;
      }

      const retryDate = Date.parse(retryAfter);

      if (!Number.isNaN(retryDate)) {
        return Math.max(0, retryDate - Date.now());
      }
    }
  }

  return null;
};

export class AIProviderService {
  private providerCircuits: Map<string, ProviderCircuit> = new Map();

  private readonly PROVIDER_MAX_ATTEMPTS = 2;
  private readonly PROVIDER_BASE_DELAY_MS = 500;
  private readonly PROVIDER_MAX_JITTER_MS = 250;

  private readonly CIRCUIT_FAILURE_THRESHOLD = 2;
  private readonly CIRCUIT_BASE_OPEN_DURATION_MS = 30 * 1000;
  private readonly CIRCUIT_MAX_OPEN_DURATION_MS = 5 * 60 * 1000;

  private getCircuitKey(providerName: string, actionName: string): string {
    return `${providerName.toLowerCase()}:${actionName}`;
  }

  private getOrCreateCircuit(
    providerName: string,
    actionName: string,
  ): ProviderCircuit {
    const key = this.getCircuitKey(providerName, actionName);

    let circuit = this.providerCircuits.get(key);

    if (!circuit) {
      circuit = {
        state: "CLOSED",
        failureCount: 0,
        openedAt: null,
        openUntil: null,
        halfOpenInFlight: false,
      };

      this.providerCircuits.set(key, circuit);
    }

    return circuit;
  }

  private canAttemptProvider(
    providerName: string,
    actionName: string,
  ): boolean {
    const circuit = this.getOrCreateCircuit(providerName, actionName);

    if (circuit.state === "CLOSED") {
      return true;
    }

    const now = Date.now();

    if (circuit.state === "OPEN") {
      if (circuit.openUntil !== null && now < circuit.openUntil) {
        return false;
      }

      circuit.state = "HALF_OPEN";
      circuit.halfOpenInFlight = true;

      logger.info(
        {
          providerName,
          actionName,
        },
        "[AI] Circuit moved to HALF_OPEN. Allowing probe request.",
      );

      return true;
    }

    // HALF_OPEN
    if (circuit.halfOpenInFlight) {
      return false;
    }

    circuit.halfOpenInFlight = true;

    return true;
  }

  private recordProviderSuccess(
    providerName: string,
    actionName: string,
  ): void {
    const circuit = this.getOrCreateCircuit(providerName, actionName);

    const wasRecovering = circuit.state === "HALF_OPEN";

    circuit.state = "CLOSED";
    circuit.failureCount = 0;
    circuit.openedAt = null;
    circuit.openUntil = null;
    circuit.halfOpenInFlight = false;

    if (wasRecovering) {
      logger.info(
        {
          providerName,
          actionName,
        },
        "[AI] Circuit recovered. Provider is CLOSED.",
      );
    }
  }

  private recordNonTransientFailure(
    providerName: string,
    actionName: string,
  ): void {
    const circuit = this.getOrCreateCircuit(providerName, actionName);

    if (circuit.state === "HALF_OPEN") {
      circuit.state = "CLOSED";
      circuit.halfOpenInFlight = false;
      circuit.openedAt = null;
      circuit.openUntil = null;

      logger.info(
        {
          providerName,
          actionName,
        },
        "[AI] Non-transient response received during HALF_OPEN. Closing circuit.",
      );
    }
  }

  private recordTransientFailure(
    providerName: string,
    actionName: string,
    retryAfterMs?: number | null,
  ): void {
    const circuit = this.getOrCreateCircuit(providerName, actionName);

    if (retryAfterMs !== null && retryAfterMs !== undefined) {
      const openUntil = Date.now() + retryAfterMs;

      circuit.state = "OPEN";
      circuit.openedAt = Date.now();
      circuit.openUntil = openUntil;
      circuit.halfOpenInFlight = false;

      logger.warn(
        {
          providerName,
          actionName,
          retryAfterMs,
          openUntil: new Date(openUntil).toISOString(),
        },
        "[AI] Circuit OPEN due to provider Retry-After.",
      );

      return;
    }

    circuit.failureCount += 1;
    circuit.halfOpenInFlight = false;

    if (circuit.failureCount < this.CIRCUIT_FAILURE_THRESHOLD) {
      logger.warn(
        {
          providerName,
          actionName,
          failureCount: circuit.failureCount,
          threshold: this.CIRCUIT_FAILURE_THRESHOLD,
        },
        "[AI] Transient failure recorded. Circuit remains CLOSED.",
      );

      return;
    }

    const exponent = circuit.failureCount - this.CIRCUIT_FAILURE_THRESHOLD;

    const openDuration = Math.min(
      this.CIRCUIT_BASE_OPEN_DURATION_MS * Math.pow(2, exponent),
      this.CIRCUIT_MAX_OPEN_DURATION_MS,
    );

    const openedAt = Date.now();
    const openUntil = openedAt + openDuration;

    circuit.state = "OPEN";
    circuit.openedAt = openedAt;
    circuit.openUntil = openUntil;

    logger.warn(
      {
        providerName,
        actionName,
        failureCount: circuit.failureCount,
        openDurationMs: openDuration,
        openUntil: new Date(openUntil).toISOString(),
      },
      "[AI] Circuit OPEN after repeated transient failures.",
    );
  }

  private async executeWithFallback<T>(
    actionName: string,
    actionFn: (provider: IAIProvider) => Promise<T>,
  ): Promise<T> {
    const providers = providerRegistry.getOrderedProviders();

    let lastError: any = null;

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i]!;

      if (!this.canAttemptProvider(provider.name, actionName)) {
        logger.debug(
          {
            providerName: provider.name,
            actionName,
          },
          "[AI] Provider circuit is OPEN. Skipping provider.",
        );

        continue;
      }

      for (let attempt = 1; attempt <= this.PROVIDER_MAX_ATTEMPTS; attempt++) {
        const startTime = Date.now();

        try {
          const result = await actionFn(provider);
          this.recordProviderSuccess(provider.name, actionName);
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);

          logger.info(
            {
              providerName: provider.name,
              actionName,
              attempt,
              durationSeconds: Number(duration),
            },
            "[AI] Provider request succeeded",
          );

          return result;
        } catch (error: any) {
          lastError = error;

          const status = getErrorStatus(error);
          const transient = isTransientProviderError(error);
          const retryAfterMs = getRetryAfterMs(error);

          logger.warn(
            {
              error,
              providerName: provider.name,
              actionName,
              attempt,
              maxAttempts: this.PROVIDER_MAX_ATTEMPTS,
              status,
              transient,
              retryAfterMs,
            },
            "[AI] Provider failed during action",
          );

          if (!transient) {
            this.recordNonTransientFailure(provider.name, actionName);

            logger.warn(
              {
                providerName: provider.name,
                actionName,
                status,
              },
              "[AI] Non-transient provider error. Keeping provider healthy.",
            );

            break;
          }

          if (status === 429) {
            this.recordTransientFailure(
              provider.name,
              actionName,
              retryAfterMs,
            );

            logger.warn(
              {
                providerName: provider.name,
                actionName,
                retryAfterMs,
              },
              "[AI] Rate limited. Opening circuit until Retry-After.",
            );

            break;
          }

          if (attempt < this.PROVIDER_MAX_ATTEMPTS) {
            const exponentialDelay =
              this.PROVIDER_BASE_DELAY_MS * Math.pow(2, attempt - 1);

            const jitter = Math.floor(
              Math.random() * this.PROVIDER_MAX_JITTER_MS,
            );

            const delayMs = retryAfterMs ?? exponentialDelay + jitter;

            logger.warn(
              {
                providerName: provider.name,
                actionName,
                attempt,
                retryAfterMs: delayMs,
                status,
              },
              "[AI] Retrying transient provider error",
            );

            await sleep(delayMs);

            continue;
          }

          this.recordTransientFailure(provider.name, actionName, retryAfterMs);

          break;
        }
      }

      const nextProvider = providers[i + 1];

      if (nextProvider) {
        logger.info(
          {
            failedProvider: provider.name,
            nextProvider: nextProvider.name,
            actionName,
          },
          "[AI] Falling back to next provider",
        );
      }
    }

    logger.error(
      { lastError, actionName },
      "[AI] All providers failed during action",
    );

    throw new Error("Response generation temporarily unavailable.");
  }

  async generateResponse(
    prompt: string,
    systemPrompt?: string,
  ): Promise<string> {
    const raw = await this.executeWithFallback("generateResponse", (provider) =>
      provider.generateResponse(prompt, systemPrompt),
    );
    return sanitizeModelOutput(raw);
  }

  async generateStructuredResponse(
    prompt: string,
    schema: any,
    systemPrompt?: string,
    validateFn?: (rawText: string) => boolean,
  ): Promise<string> {
    const raw = await this.executeWithFallback(
      "generateStructuredResponse",
      async (provider) => {
        const response = await provider.generateStructuredResponse(
          prompt,
          schema,
          systemPrompt,
        );
        if (validateFn && !validateFn(response)) {
          throw new Error(
            `[AI] Provider ${provider.name} response failed structured format validation.`,
          );
        }
        return response;
      },
    );
    return sanitizeModelOutput(raw);
  }

  async *generateStream(
    prompt: string,
    systemPrompt?: string,
  ): AsyncGenerator<string, void, unknown> {
    const providers = providerRegistry.getOrderedProviders();

    let lastError: any = null;

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i]!;

      if (!this.canAttemptProvider(provider.name, "generateStream")) {
        continue;
      }

      for (let attempt = 1; attempt <= this.PROVIDER_MAX_ATTEMPTS; attempt++) {
        let yieldedAny = false;

        const startTime = Date.now();

        try {
          const stream = await provider.generateStream(prompt, systemPrompt);

          const sanitizedStream = sanitizeStream(stream);

          for await (const chunk of sanitizedStream) {
            if (!yieldedAny) {
              yieldedAny = true;

              const duration = ((Date.now() - startTime) / 1000).toFixed(1);

              logger.info(
                {
                  providerName: provider.name,
                  actionName: "generateStream",
                  attempt,
                  timeToFirstChunkSeconds: Number(duration),
                },
                "[AI] Streaming provider produced first chunk",
              );
            }

            yield chunk;
          }

          this.recordProviderSuccess(provider.name, "generateStream");

          logger.info(
            {
              providerName: provider.name,
              actionName: "generateStream",
              attempt,
              durationSeconds: Number(
                ((Date.now() - startTime) / 1000).toFixed(1),
              ),
            },
            "[AI] Streaming provider request completed",
          );

          return;
        } catch (error: any) {
          lastError = error;

          const status = getErrorStatus(error);
          const transient = isTransientProviderError(error);
          const retryAfterMs = getRetryAfterMs(error);

          logger.warn(
            {
              error,
              providerName: provider.name,
              actionName: "generateStream",
              attempt,
              maxAttempts: this.PROVIDER_MAX_ATTEMPTS,
              status,
              transient,
              retryAfterMs,
              yieldedAny,
            },
            "[AI] Provider failed during generateStream",
          );

          if (yieldedAny) {
            if (transient) {
              this.recordTransientFailure(
                provider.name,
                "generateStream",
                retryAfterMs,
              );
            }

            throw error;
          }

          if (!transient) {
            logger.warn(
              {
                providerName: provider.name,
                actionName: "generateStream",
                status,
              },
              "[AI] Non-transient provider error. Keeping provider healthy.",
            );

            break;
          }

          if (status === 429) {
            this.recordTransientFailure(
              provider.name,
              "generateStream",
              retryAfterMs,
            );

            break;
          }

          if (attempt < this.PROVIDER_MAX_ATTEMPTS) {
            const exponentialDelay =
              this.PROVIDER_BASE_DELAY_MS * Math.pow(2, attempt - 1);

            const jitter = Math.floor(
              Math.random() * this.PROVIDER_MAX_JITTER_MS,
            );

            const delayMs = retryAfterMs ?? exponentialDelay + jitter;

            logger.warn(
              {
                providerName: provider.name,
                actionName: "generateStream",
                attempt,
                status,
                retryAfterMs: delayMs,
              },
              "[AI] Retrying transient streaming error.",
            );

            await sleep(delayMs);

            continue;
          }

          this.recordTransientFailure(
            provider.name,
            "generateStream",
            retryAfterMs,
          );

          logger.warn(
            {
              providerName: provider.name,
              actionName: "generateStream",
              attempt,
              status,
            },
            "[AI] Streaming retries exhausted. Falling back.",
          );

          break;
        }
      }

      const nextProvider = providers[i + 1];

      if (nextProvider) {
        logger.info(
          {
            failedProvider: provider.name,
            nextProvider: nextProvider.name,
            actionName: "generateStream",
          },
          "[AI] Falling back to next streaming provider.",
        );
      }
    }

    logger.error(
      {
        lastError,
        actionName: "generateStream",
      },
      "[AI] All providers failed during generateStream",
    );

    throw new Error("Response generation temporarily unavailable.");
  }
}

export const aiProviderService = new AIProviderService();
