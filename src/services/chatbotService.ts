import { HfInference } from "@huggingface/inference";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface UserProfile {
  age?: number;
  height?: number; // cm
  weight?: number; // kg
  gender?: "male" | "female";
  bmi?: number;
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal?: "weight_loss" | "maintenance" | "muscle_gain";
  dietType?: "omnivore" | "vegetarian" | "vegan" | "keto" | "paleo";
  allergies?: string[];
  medicalConditions?: string[];
}

class ChatbotService {
  private hf: HfInference;

  private nutritionModel = "facebook/blenderbot-400M-distill"; // Better for specific domains

  constructor() {
    const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    if (!apiKey || apiKey === "your_huggingface_api_key_here") {
      console.warn(
        "Hugging Face API key not configured. Using enhanced fallback responses with conversation context."
      );
    }
    this.hf = new HfInference(apiKey);
  }

  private buildSystemPrompt(userProfile?: UserProfile): string {
    let prompt = `You are a friendly, knowledgeable nutrition coach who loves helping people with their health goals. You're conversational, encouraging, and relatable - like chatting with a knowledgeable friend who happens to be a nutrition expert. 

Be natural and engaging:
- Use casual, friendly language
- Ask follow-up questions to keep the conversation going
- Share practical tips and real-world advice
- Be encouraging and supportive
- Use examples and analogies when helpful
- Occasionally mention that you're an AI, but don't be overly formal about it

Keep responses helpful but conversational - like you're genuinely interested in helping them succeed.`;

    if (userProfile) {
      prompt += `\n\nWhat you know about this person:`;
      if (userProfile.age) prompt += `\n- ${userProfile.age} years old`;
      if (userProfile.height && userProfile.weight) {
        prompt += `\n- ${userProfile.height}cm tall, ${userProfile.weight}kg`;
        if (userProfile.bmi) prompt += ` (BMI ${userProfile.bmi})`;
      }
      if (userProfile.gender) prompt += `\n- ${userProfile.gender}`;
      if (userProfile.activityLevel)
        prompt += `\n- Activity level: ${userProfile.activityLevel}`;
      if (userProfile.goal)
        prompt += `\n- Goal: ${userProfile.goal.replace("_", " ")}`;
      if (userProfile.dietType)
        prompt += `\n- Diet preference: ${userProfile.dietType}`;
      if (userProfile.allergies?.length)
        prompt += `\n- Allergies: ${userProfile.allergies.join(", ")}`;
      if (userProfile.medicalConditions?.length)
        prompt += `\n- Health considerations: ${userProfile.medicalConditions.join(
          ", "
        )}`;
    }

    return prompt;
  }

  private getFallbackResponse(
    userMessage: string,
    userProfile?: UserProfile,
    conversationHistory: ChatMessage[] = []
  ): string {
    const message = userMessage.toLowerCase();

    // Get recent conversation context
    const recentMessages = conversationHistory.slice(-4);

    const conversationContext = recentMessages
      .map((m) => m.content.toLowerCase())
      .join(" ");

    // Context-aware responses based on conversation flow

    // If user mentioned food preferences after meal plan request
    if (
      conversationContext.includes("meal plan") &&
      (message.includes("no seafood") ||
        message.includes("no sea food") ||
        message.includes("not too spicy") ||
        message.includes("not too sweet") ||
        message.includes("nothing too strong") ||
        message.includes("hate") ||
        message.includes("don't like"))
    ) {
      return `Perfect! I totally get that - mild flavors are so much easier to work with and you'll actually enjoy eating! 😊

Let me adjust that meal plan for you with gentle, familiar flavors:

🍳 **Breakfast**: Plain Greek yogurt with mild berries and a touch of granola
🥗 **Lunch**: Simple grilled chicken breast with rice and steamed vegetables (carrots, green beans)
🍽️ **Dinner**: Baked chicken thighs with mashed sweet potato and roasted zucchini

**Snack ideas**: 
• Apple slices with a bit of peanut butter
• Plain crackers with mild cheese
• Banana with a small handful of almonds

All of these are gentle on the palate but still nutritious! Would you like me to suggest some simple seasonings that aren't overwhelming? Things like a little garlic powder, herbs, or just salt and pepper can add flavor without being intense.`;
    }

    // If conversation is about food preferences/dislikes
    if (
      message.includes("hate") ||
      message.includes("don't like") ||
      message.includes("dislike") ||
      message.includes("avoid")
    ) {
      return `No worries at all! Everyone has foods they just can't do - that's totally normal! 😄

The key is working with what you DO enjoy. There are so many ways to get good nutrition without forcing yourself to eat things you hate.

What ARE some foods you actually like? Even if they seem "unhealthy" - we can often find ways to make them work or find similar alternatives that fit your goals better.

I'd rather build a plan around foods you'll actually eat than give you a "perfect" plan you'll never follow! 😊`;
    }

    // Greetings and casual conversation
    if (
      message.includes("hello") ||
      message.includes("hi") ||
      message.includes("hey")
    ) {
      const greetings = [
        "Hey there! Great to meet you! 😊 What's on your mind nutrition-wise today?",
        "Hi! I'm excited to help you with your nutrition goals. What would you like to chat about?",
        "Hello! Ready to dive into some nutrition talk? I'm here to help however I can!",
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Diet plan requests
    if (message.includes("diet plan") || message.includes("meal plan")) {
      const calories = this.estimateCalories(userProfile);
      let personalizedIntro = "";

      if (userProfile?.age && userProfile?.weight && userProfile?.height) {
        personalizedIntro = `Looking at your stats (${userProfile.age}y, ${userProfile.height}cm, ${userProfile.weight}kg), I'm thinking around ${calories} calories per day would be a good starting point. `;
      } else {
        personalizedIntro = `Without knowing your specific stats, I'd generally suggest around ${calories} calories as a starting point, but we can adjust this! `;
      }

      return `${personalizedIntro}Here's what I'd focus on:

🥗 **The Foundation:**
• Lean proteins - think chicken, eggs, or legumes if you're plant-based
• Complex carbs - quinoa, brown rice, oats (they'll keep you satisfied longer!)
• Healthy fats - avocado, nuts, olive oil (don't fear the fats!)
• Lots of colorful veggies and fruits

What kind of foods do you actually enjoy eating? Any foods you absolutely hate or want to avoid? I want to make sure we build something you'll actually stick with! 😄`;
    }

    // Weight loss
    if (message.includes("lose weight") || message.includes("weight loss")) {
      const calories = this.estimateCalories(userProfile);
      let personalizedAdvice = "";

      if (userProfile?.bmi) {
        if (userProfile.bmi > 25) {
          personalizedAdvice = `I can see from your BMI (${userProfile.bmi}) that losing some weight could definitely help you feel better! `;
        } else if (userProfile.bmi < 18.5) {
          personalizedAdvice = `Hold up! Your BMI of ${userProfile.bmi} suggests you might actually be underweight. I'd really recommend chatting with a healthcare provider before focusing on weight loss. `;
        } else {
          personalizedAdvice = `Your BMI of ${userProfile.bmi} is actually in a healthy range! But I get it - sometimes it's more about how you feel than the numbers. `;
        }
      }

      return `${personalizedAdvice}Here's my approach to healthy weight loss:

🎯 **The Smart Strategy:**
• Aim for around ${
        calories - 400
      } calories daily (moderate deficit - nothing crazy!)
• Prioritize protein to keep your muscle while losing fat
• Add some strength training if you can - it's a game changer!
• Stay hydrated (seriously, this helps more than people think)
• Get good sleep - your hormones will thank you

The sweet spot is 1-2 pounds per week. Slow and steady wins the race! 

What does your current eating routine look like? Are you a breakfast person or more of a "coffee until noon" type? 😅`;
    }

    // Muscle gain
    if (
      message.includes("muscle") ||
      message.includes("gain") ||
      message.includes("bulk")
    ) {
      const calories = this.estimateCalories(userProfile);
      let proteinAdvice = "";

      if (userProfile?.weight) {
        const minProtein = Math.round(userProfile.weight * 1.6);
        const maxProtein = Math.round(userProfile.weight * 2.2);
        proteinAdvice = `For your ${userProfile.weight}kg, I'd aim for ${minProtein}-${maxProtein}g of protein daily.`;
      } else {
        proteinAdvice =
          "Generally, 1.6-2.2g per kg of body weight is the sweet spot for protein.";
      }

      return `Muscle building - I love it! 💪 Here's the game plan:

🏋️ **The Muscle-Building Formula:**
• Eat around ${
        calories + 300
      } calories daily (slight surplus - we're feeding those muscles!)
• ${proteinAdvice}
• Time some protein around your workouts (within 2 hours is great)
• Don't skimp on carbs - they fuel your workouts!
• Healthy fats are still important for hormone production

Are you currently lifting weights? The nutrition is only half the equation - we need to give those muscles a reason to grow! 

What's your favorite protein source? I can help you work it into a plan that actually tastes good! 😋`;
    }

    // Protein questions
    if (message.includes("protein")) {
      const responses = [
        "Ah, protein! The building blocks of life! 🧱 What specifically about protein are you curious about? Sources, timing, amounts?",
        "Protein is such a game-changer for so many goals! Are you wondering about how much you need, or looking for good sources?",
        "Love a good protein question! Whether it's for muscle building, weight loss, or just general health - protein is key. What's your main concern?",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Carbs questions
    if (message.includes("carb") || message.includes("carbohydrate")) {
      return `Carbs get such a bad rap, but they're actually amazing fuel! 🍠 

The key is choosing the right ones:
• **Complex carbs** (oats, quinoa, sweet potatoes) = sustained energy
• **Simple carbs** (fruits, honey) = quick energy when you need it

Are you trying to figure out how many carbs to eat, or wondering about timing around workouts? I'm here for all your carb questions! 😄`;
    }

    // Calories questions
    if (message.includes("calorie") || message.includes("how many")) {
      const calories = this.estimateCalories(userProfile);
      return `Great question! Calories are like your body's budget - you want to spend them wisely! 💰

${
  userProfile?.age && userProfile?.weight && userProfile?.height
    ? `Based on your stats, I'd estimate around ${calories} calories per day as a starting point.`
    : `Without your specific details, I'd generally suggest around ${calories} calories, but this varies a lot person to person!`
}

But here's the thing - it's not just about the number! Quality matters too. 500 calories of vegetables and lean protein will make you feel very different than 500 calories of candy.

What's your main goal? Are you trying to lose, gain, or maintain weight?`;
    }

    // Vegetarian/vegan questions
    if (
      message.includes("vegetarian") ||
      message.includes("vegan") ||
      message.includes("plant")
    ) {
      return `Plant-based eating can be absolutely amazing! 🌱 I love helping people thrive on vegetarian or vegan diets.

Some of my favorite plant-based protein powerhouses:
• Lentils and beans (so versatile!)
• Tofu and tempeh (great for stir-fries)
• Quinoa (complete protein!)
• Nuts and seeds (perfect for snacking)

Are you already eating plant-based, or thinking about making the switch? I can help you make sure you're getting all the nutrients you need! 😊`;
    }

    // Snack questions
    if (message.includes("snack")) {
      return `Snacking can totally work with healthy eating! It's all about choosing snacks that actually satisfy you. 🥜

Some of my go-to recommendations:
• Apple slices with almond butter (sweet + protein!)
• Greek yogurt with berries
• Hummus with veggies
• A small handful of nuts
• Hard-boiled eggs

The key is combining protein or healthy fats with your carbs to keep you satisfied longer. What kind of flavors are you craving? Sweet, salty, crunchy?`;
    }

    // General/unclear questions
    const generalResponses = [
      "I'm here to help with all things nutrition! 🥗 What's on your mind? Whether it's meal planning, specific foods, or just general healthy eating tips - I'm all ears!",
      "Hey! I love chatting about nutrition and helping people reach their goals. What would you like to explore today? Meal ideas, nutrition basics, or something specific you're curious about?",
      "Great to chat with you! I'm here to make nutrition less confusing and more enjoyable. What questions do you have? I promise to keep it practical and actually doable! 😊",
    ];

    return generalResponses[
      Math.floor(Math.random() * generalResponses.length)
    ];
  }

  private estimateCalories(userProfile?: UserProfile): number {
    if (!userProfile?.weight || !userProfile?.height || !userProfile?.age) {
      return 2000; // Default
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

    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const multiplier =
      activityMultipliers[userProfile.activityLevel || "moderate"];
    let maintenance = bmr * multiplier;

    // Adjust for goal
    if (userProfile.goal === "weight_loss") {
      maintenance -= 400; // Moderate deficit
    } else if (userProfile.goal === "muscle_gain") {
      maintenance += 300; // Moderate surplus
    }

    return Math.round(Math.max(1200, maintenance));
  }

  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[] = [],
    userProfile?: UserProfile
  ): Promise<string> {
    try {
      // Build conversation context
      const systemPrompt = this.buildSystemPrompt(userProfile);

      // Format conversation for the model
      const conversationText = conversationHistory
        .slice(-6) // Keep last 6 messages for context
        .map(
          (msg) =>
            `${msg.role === "user" ? "Human" : "Assistant"}: ${msg.content}`
        )
        .join("\n");

      const fullPrompt = `${systemPrompt}\n\nConversation:\n${conversationText}\nHuman: ${message}\nAssistant:`;

      // Try Hugging Face API
      const response = await this.hf.textGeneration({
        model: this.nutritionModel,
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 250,
          temperature: 0.8, // More creative and varied responses
          do_sample: true,
          top_p: 0.95, // More diverse word choices
          repetition_penalty: 1.2, // Avoid repetitive responses
        },
      });

      let generatedText = response.generated_text;

      // Clean up the response
      if (generatedText.includes("Assistant:")) {
        generatedText = generatedText.split("Assistant:").pop() || "";
      }

      generatedText = generatedText.trim();

      // Fallback if response is too short, generic, or robotic
      if (
        generatedText.length < 15 ||
        generatedText.includes("I don't know") ||
        generatedText.includes("I cannot") ||
        generatedText.includes("I am not able") ||
        generatedText.includes("As an AI") ||
        (generatedText.toLowerCase().includes("consult a professional") &&
          generatedText.length < 100)
      ) {
        return this.getFallbackResponse(
          message,
          userProfile,
          conversationHistory
        );
      }

      return generatedText;
    } catch (error) {
      console.warn("Hugging Face API error, using fallback:", error);
      return this.getFallbackResponse(
        message,
        userProfile,
        conversationHistory
      );
    }
  }

  async generateMealPlan(
    userProfile: UserProfile,
    preferences: {
      mealsPerDay: number;
      cookingTime: "quick" | "normal" | "meal_prep";
      cuisinePreference?: string;
    }
  ): Promise<string> {
    const calories = this.estimateCalories(userProfile);
    const prompt = `Create a detailed ${
      preferences.mealsPerDay
    }-meal daily plan for ${calories} calories. 
    Diet type: ${userProfile.dietType || "omnivore"}
    Goal: ${userProfile.goal || "maintenance"}
    Cooking time: ${preferences.cookingTime}
    ${
      userProfile.allergies?.length
        ? `Avoid: ${userProfile.allergies.join(", ")}`
        : ""
    }
    
    Include specific foods, portions, and approximate calories per meal.`;

    try {
      const response = await this.hf.textGeneration({
        model: this.nutritionModel,
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.8,
        },
      });

      return (
        response.generated_text ||
        this.generateFallbackMealPlan(userProfile, preferences)
      );
    } catch (error) {
      console.warn("Error generating meal plan:", error);
      return this.generateFallbackMealPlan(userProfile, preferences);
    }
  }

  private generateFallbackMealPlan(
    userProfile: UserProfile,
    preferences: {
      mealsPerDay: number;
      cookingTime: string;
    }
  ): string {
    const calories = this.estimateCalories(userProfile);
    const caloriesPerMeal = Math.round(calories / preferences.mealsPerDay);

    const mealSuggestions = {
      omnivore: [
        `🍳 **Breakfast** (~${caloriesPerMeal} cal): Greek yogurt parfait with mixed berries, granola, and a drizzle of honey`,
        `🥗 **Lunch** (~${caloriesPerMeal} cal): Grilled chicken and avocado salad with mixed greens, cherry tomatoes, and olive oil dressing`,
        `🍽️ **Dinner** (~${caloriesPerMeal} cal): Baked salmon with roasted sweet potato and steamed broccoli`,
      ],
      vegetarian: [
        `🥣 **Breakfast** (~${caloriesPerMeal} cal): Overnight oats with banana, almond butter, and chia seeds`,
        `🍲 **Lunch** (~${caloriesPerMeal} cal): Hearty lentil soup with whole grain bread and a side salad`,
        `🥘 **Dinner** (~${caloriesPerMeal} cal): Colorful vegetable stir-fry with crispy tofu over brown rice`,
      ],
      vegan: [
        `🍓 **Breakfast** (~${caloriesPerMeal} cal): Smoothie bowl with plant protein, berries, banana, and granola`,
        `🌶️ **Lunch** (~${caloriesPerMeal} cal): Spiced chickpea and vegetable curry with naan or rice`,
        `🥙 **Dinner** (~${caloriesPerMeal} cal): Quinoa Buddha bowl with roasted veggies and creamy tahini dressing`,
      ],
    };

    const meals =
      mealSuggestions[userProfile.dietType as keyof typeof mealSuggestions] ||
      mealSuggestions.omnivore;

    const selectedMeals = meals.slice(0, preferences.mealsPerDay);

    return `Here's a delicious ${calories}-calorie meal plan for you! 😋

${selectedMeals.join("\n\n")}

**Pro tips:**
• Feel free to swap similar foods based on what you have available!
• Add snacks if you're still hungry - listen to your body
• Prep what you can ahead of time to make your life easier

How does this look? Any foods you'd want to swap out or questions about prep?`;
  }
}

export const chatbotService = new ChatbotService();
