// AI Provider Configuration
// This allows easy switching between different LLM providers

export interface AIProvider {
  name: string;
  sendMessage: (message: string, context: any) => Promise<string>;
  isAvailable: () => boolean;
}

// OpenAI Provider (requires API key)
export class OpenAIProvider implements AIProvider {
  name = "OpenAI";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey !== "your_openai_api_key_here";
  }

  async sendMessage(message: string, context: any): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("OpenAI API key not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: context.systemPrompt,
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return (
      data.choices[0]?.message?.content ||
      "Sorry, I couldn't generate a response."
    );
  }
}

// Anthropic Claude Provider (requires API key)
export class AnthropicProvider implements AIProvider {
  name = "Anthropic Claude";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey !== "your_anthropic_api_key_here";
  }

  async sendMessage(message: string, context: any): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("Anthropic API key not configured");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `${context.systemPrompt}\n\nUser: ${message}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || "Sorry, I couldn't generate a response.";
  }
}

// Ollama Local Provider (for running local models)
export class OllamaProvider implements AIProvider {
  name = "Ollama (Local)";
  private baseUrl: string;
  private model: string;

  constructor(baseUrl = "http://localhost:11434", model = "llama2") {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async sendMessage(message: string, context: any): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        prompt: `${context.systemPrompt}\n\nUser: ${message}\nAssistant:`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || "Sorry, I couldn't generate a response.";
  }
}

// Provider factory
export function createAIProvider(): AIProvider {
  // Check environment variables for API keys
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const useOllama = import.meta.env.VITE_USE_OLLAMA === "true";

  // Priority order: OpenAI > Anthropic > Ollama > Fallback
  if (openaiKey && openaiKey !== "your_openai_api_key_here") {
    console.log("Using OpenAI provider");
    return new OpenAIProvider(openaiKey);
  }

  if (anthropicKey && anthropicKey !== "your_anthropic_api_key_here") {
    console.log("Using Anthropic provider");
    return new AnthropicProvider(anthropicKey);
  }

  if (useOllama) {
    console.log("Using Ollama local provider");
    return new OllamaProvider();
  }

  // Fallback to null (will use enhanced fallback responses)
  console.log("No AI provider configured, using enhanced fallback responses");
  return {
    name: "Enhanced Fallback",
    sendMessage: async () => {
      throw new Error("No AI provider available");
    },
    isAvailable: () => false,
  };
}
