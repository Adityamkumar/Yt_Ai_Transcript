import type { IAIProvider } from "./aiProvider.service.js";
import { GroqProvider } from "./groq.provider.js";
import { OpenRouterProvider } from "./openrouter.provider.js";
import { GeminiProvider } from "./gemini.provider.js";

export class ProviderRegistry {
  private providers: Map<string, IAIProvider> = new Map();
  private order: string[] = [];

  register(provider: IAIProvider) {
    const key = provider.name.toLowerCase();
    this.providers.set(key, provider);
    console.log(`[AI Registry] Registered provider: ${provider.name}`);
  }

  setOrder(order: string[]) {
    this.order = order.map(o => o.toLowerCase());
    console.log(`[AI Registry] Provider precedence set to: ${this.order.join(" → ")}`);
  }

  getOrderedProviders(): IAIProvider[] {
    return this.order
      .map(name => this.providers.get(name))
      .filter((p): p is IAIProvider => !!p);
  }
}

export const providerRegistry = new ProviderRegistry();

// Register the default providers
providerRegistry.register(new GroqProvider());
providerRegistry.register(new OpenRouterProvider());
providerRegistry.register(new GeminiProvider());

// Set default ordering (Groq -> OpenRouter -> Gemini)
providerRegistry.setOrder(["groq", "openrouter", "gemini"]);
