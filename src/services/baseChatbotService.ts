/**
 * Base Chatbot Service - Shared functionality for all chatbots
 *
 * This service provides common chatbot functionality that can be extended
 * by specific chatbot implementations (nutrition, fitness, etc.)
 */

import { HfInference } from "@huggingface/inference";

export interface BaseChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface BaseUserProfile {
  age?: number;
  height?: number;
  weight?: number;
  gender?: "male" | "female";
  bmi?: number;
}

export abstract class BaseChatbotService<
  TMessage extends BaseChatMessage,
  TProfile extends BaseUserProfile
> {
  protected hf: HfInference;
  protected model = "facebook/blenderbot-400M-distill";

  constructor() {
    const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    if (!apiKey || apiKey === "your_huggingface_api_key_here") {
      console.warn(
        "Hugging Face API key not configured. Using enhanced fallback responses."
      );
    }
    this.hf = new HfInference(apiKey);
  }

  protected estimateCalories(userProfile?: TProfile): number {
    if (!userProfile?.weight || !userProfile?.height || !userProfile?.age) {
      return 2000;
    }

    // Mifflin-St Jeor Equation
    let bmr: number;
    if (userProfile.gender === "male") {
      bmr =
        10 * userProfile.weight +
        6.25 * userProfile.height -
        5 * userProfile.age +
        5;
    } else {
      bmr =
        10 * userProfile.weight +
        6.25 * userProfile.height -
        5 * userProfile.age -
        161;
    }

    return Math.round(Math.max(1200, bmr * 1.55)); // Moderate activity level
  }

  protected abstract buildSystemPrompt(userProfile?: TProfile): string;
  protected abstract getFallbackResponse(
    userMessage: string,
    userProfile?: TProfile,
    conversationHistory?: TMessage[]
  ): string;

  async sendMessage(
    message: string,
    conversationHistory: TMessage[] = [],
    userProfile?: TProfile
  ): Promise<string> {
    // Try fallback first for better reliability
    const fallbackResponse = this.getFallbackResponse(
      message,
      userProfile,
      conversationHistory
    );

    // Check if we have a specific response
    const isSpecificResponse = !this.isGenericResponse(fallbackResponse);

    if (isSpecificResponse) {
      return fallbackResponse;
    }

    // Try API with fallback
    try {
      const systemPrompt = this.buildSystemPrompt(userProfile);
      const conversationText = conversationHistory
        .slice(-6)
        .map(
          (msg) =>
            `${msg.role === "user" ? "Human" : "Assistant"}: ${msg.content}`
        )
        .join("\n");

      const fullPrompt = `${systemPrompt}\n\nConversation:\n${conversationText}\nHuman: ${message}\nAssistant:`;

      const response = await this.hf.textGeneration({
        model: this.model,
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 250,
          temperature: 0.8,
          do_sample: true,
          top_p: 0.95,
          repetition_penalty: 1.2,
        },
      });

      let generatedText = response.generated_text;
      if (generatedText.includes("Assistant:")) {
        generatedText = generatedText.split("Assistant:").pop() || "";
      }
      generatedText = generatedText.trim();

      if (this.isValidResponse(generatedText)) {
        return generatedText;
      }

      return fallbackResponse;
    } catch (error) {
      console.warn("API error, using fallback:", error);
      return fallbackResponse;
    }
  }

  private isGenericResponse(response: string): boolean {
    const genericPhrases = [
      "what's on your mind",
      "what are you looking to achieve",
      "what would you like to work on",
      "what nutrition question can i help",
    ];
    return genericPhrases.some((phrase) =>
      response.toLowerCase().includes(phrase)
    );
  }

  private isValidResponse(response: string): boolean {
    if (response.length < 15) return false;

    const invalidPhrases = [
      "i don't know",
      "i cannot",
      "i am not able",
      "as an ai",
      "i'm sorry",
      "i apologize",
      "consult a professional",
      "i'm not sure",
    ];

    return !invalidPhrases.some((phrase) =>
      response.toLowerCase().includes(phrase)
    );
  }
}
