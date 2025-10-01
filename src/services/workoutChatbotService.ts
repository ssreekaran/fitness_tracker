import { HfInference } from "@huggingface/inference";

export interface WorkoutChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface WorkoutUserProfile {
  age?: number;
  height?: number; // cm
  weight?: number; // kg
  gender?: "male" | "female";
  bmi?: number;
  goal?:
    | "weight_loss"
    | "muscle_gain"
    | "endurance"
    | "flexibility"
    | "strength";
  daysPerWeek?: number;
  timePerSession?: number; // minutes
  injuries?: string[];
  preferences?: string[];
}

class WorkoutChatbotService {
  private hf: HfInference;
  private nutritionModel = "facebook/blenderbot-400M-distill";

  constructor() {
    const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    if (!apiKey || apiKey === "your_huggingface_api_key_here") {
      console.warn(
        "Hugging Face API key not configured. Using enhanced fallback responses with conversation context."
      );
    }
    this.hf = new HfInference(apiKey);
  }

  private buildSystemPrompt(userProfile?: WorkoutUserProfile): string {
    let prompt = `You are an enthusiastic, knowledgeable fitness coach who loves helping people achieve their fitness goals. You're motivational, encouraging, and practical - like chatting with a personal trainer who genuinely cares about your success.

Be energetic and supportive:
- Use encouraging, motivational language
- Ask follow-up questions about their fitness journey
- Share practical workout tips and form cues
- Be enthusiastic about their goals
- Use fitness terminology but keep it accessible
- Occasionally mention that you're an AI, but focus on being their workout buddy

Keep responses helpful and motivating - like you're genuinely excited to help them get stronger and fitter!`;

    if (userProfile) {
      prompt += `\n\nWhat you know about this person:`;
      if (userProfile.age) prompt += `\n- ${userProfile.age} years old`;
      if (userProfile.height && userProfile.weight) {
        prompt += `\n- ${userProfile.height}cm tall, ${userProfile.weight}kg`;
        if (userProfile.bmi) prompt += ` (BMI ${userProfile.bmi})`;
      }
      if (userProfile.gender) prompt += `\n- ${userProfile.gender}`;
      if (userProfile.goal)
        prompt += `\n- Goal: ${userProfile.goal.replace("_", " ")}`;
      if (userProfile.daysPerWeek)
        prompt += `\n- Available days: ${userProfile.daysPerWeek} per week`;
      if (userProfile.timePerSession)
        prompt += `\n- Time per session: ${userProfile.timePerSession} minutes`;
      if (userProfile.injuries?.length)
        prompt += `\n- Injuries/limitations: ${userProfile.injuries.join(
          ", "
        )}`;
      if (userProfile.preferences?.length)
        prompt += `\n- Preferences: ${userProfile.preferences.join(", ")}`;
    }

    return prompt;
  }

  private getFallbackResponse(
    userMessage: string,
    userProfile?: WorkoutUserProfile,
    conversationHistory: WorkoutChatMessage[] = []
  ): string {
    const message = userMessage.toLowerCase();

    // Get recent conversation context
    const recentMessages = conversationHistory.slice(-4);
    const conversationContext = recentMessages
      .map((m) => m.content.toLowerCase())
      .join(" ");

    // Context-aware responses based on conversation flow

    // If user mentioned limitations after workout plan request
    if (
      conversationContext.includes("workout plan") &&
      (message.includes("bad knee") ||
        message.includes("back pain") ||
        message.includes("injury") ||
        message.includes("can't do") ||
        message.includes("hurt") ||
        message.includes("problem with"))
    ) {
      return `No worries at all! Working around injuries is totally doable - we just need to be smart about it! 💪

Let me adjust that plan with some safer alternatives:

🏃‍♂️ **Low-Impact Cardio Options:**
• Walking or incline walking
• Swimming or water aerobics
• Stationary bike or recumbent bike
• Elliptical machine

💪 **Joint-Friendly Strength:**
• Seated exercises when possible
• Resistance bands (easier on joints)
• Wall push-ups instead of floor push-ups
• Supported squats using a chair

The key is listening to your body and never pushing through pain. Have you worked with a physical therapist before, or would you like me to suggest some specific modifications for your situation?`;
    }

    // If conversation is about exercise preferences/dislikes
    if (
      message.includes("hate") ||
      message.includes("don't like") ||
      message.includes("boring") ||
      message.includes("avoid")
    ) {
      return `I totally get it! Not everyone loves every type of exercise, and that's completely fine! 😄

The best workout is the one you'll actually DO consistently. There are so many ways to get fit - we just need to find what clicks for you!

What kinds of activities DO you enjoy? Even if it's just walking, dancing, playing with kids, or yard work - we can build on that! 

I'd rather create a plan around movements you like than force you into exercises you'll dread. What sounds fun to you? 🎯`;
    }

    // Greetings and casual conversation
    if (
      message.includes("hello") ||
      message.includes("hi") ||
      message.includes("hey")
    ) {
      const greetings = [
        "Hey there! Ready to crush some fitness goals? 💪 What's your main focus right now?",
        "Hi! I'm pumped to help you build an awesome workout routine! What are you looking to achieve?",
        "Hello! Let's get you moving and feeling amazing! What's your fitness goal?",
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Workout plan requests
    if (
      message.includes("workout plan") ||
      message.includes("exercise plan") ||
      message.includes("routine")
    ) {
      let personalizedIntro = "";

      if (userProfile?.age && userProfile?.weight && userProfile?.height) {
        personalizedIntro = `Looking at your stats (${userProfile.age}y, ${userProfile.height}cm, ${userProfile.weight}kg), `;
      } else {
        personalizedIntro = `Without knowing your specific details, `;
      }

      return `${personalizedIntro}I'm excited to build you something awesome! 🔥

Here's what I need to know to create the perfect plan for you:

🎯 **Your Goal**: Weight loss? Muscle building? Getting stronger? Improving endurance?

🏋️ **Equipment**: Do you have gym access, some home equipment, or working with just bodyweight?

⏰ **Time**: How many days per week can you commit? How long per session?

🏃‍♂️ **Experience**: Are you just starting out, getting back into it, or already pretty active?

Any injuries or movements you need to avoid? I want to make sure we keep you safe and progressing! 

What's your main goal right now?`;
    }

    // Weight loss workouts
    if (
      message.includes("lose weight") ||
      message.includes("weight loss") ||
      message.includes("fat loss")
    ) {
      return `Weight loss workouts - let's do this! 🔥 The key is combining strength training with cardio for maximum results.

💪 **The Fat-Burning Formula:**
• **Strength training** 2-3x/week (builds muscle = burns more calories 24/7!)
• **Cardio** 3-4x/week (mix of steady-state and intervals)
• **HIIT** 1-2x/week (amazing for fat burning!)

**Sample week:**
• Monday: Full-body strength
• Tuesday: 30-min cardio
• Wednesday: Upper body + core
• Thursday: HIIT workout
• Friday: Lower body strength
• Saturday: Long walk or bike ride

The magic happens when you're consistent! Are you looking for gym workouts, home workouts, or a mix? And how many days can you realistically commit to? 🎯`;
    }

    // Muscle building
    if (
      message.includes("muscle") ||
      message.includes("build") ||
      message.includes("gain") ||
      message.includes("bulk")
    ) {
      return `Muscle building - I LOVE IT! 💪 Time to get you strong and jacked!

🏋️ **The Muscle-Building Blueprint:**
• **Progressive overload** is KING (gradually increase weight/reps)
• **Compound movements** first (squats, deadlifts, bench, rows)
• **3-4 strength sessions** per week minimum
• **Rest days** are when you actually grow!

**The Big 4 Foundation:**
1. **Squat** (legs + core powerhouse)
2. **Deadlift** (full-body strength beast)
3. **Bench/Push-up** (chest, shoulders, triceps)
4. **Row/Pull-up** (back, biceps, posture)

Do you have access to weights, or are we working with bodyweight/resistance bands? And what's your experience level with lifting?

Let's build you into a machine! 🚀`;
    }

    // Beginner questions
    if (
      message.includes("beginner") ||
      message.includes("start") ||
      message.includes("new")
    ) {
      return `Starting your fitness journey - this is SO exciting! 🌟 Everyone starts somewhere, and you're taking the most important step!

🚀 **Beginner Success Formula:**
• **Start slow** and build consistency first
• **Focus on form** over heavy weights
• **2-3 workouts per week** is perfect to start
• **Listen to your body** - some soreness is normal, pain is not!

**Week 1-2 Goals:**
• Learn basic movement patterns
• Build the habit of showing up
• Have FUN with it!

**My favorite beginner routine:**
• 20-30 minutes, 3x per week
• Mix of bodyweight exercises and light weights
• Full-body workouts to start

What kind of activities sound interesting to you? Gym, home workouts, walking, swimming? Let's find what you'll actually enjoy! 😊`;
    }

    // Equipment questions
    if (
      message.includes("equipment") ||
      message.includes("gym") ||
      message.includes("home")
    ) {
      return `Great question! You can get an amazing workout with ANY setup - it's all about being creative! 💡

🏠 **No Equipment? No Problem!**
• Bodyweight exercises are incredibly effective
• Push-ups, squats, lunges, planks, burpees
• Use stairs for cardio, water jugs for weights!

🏋️ **Home Basics (dumbbells, resistance bands):**
• Huge variety of exercises possible
• Perfect for building strength and muscle
• Super convenient - no commute time!

🏟️ **Full Gym Access:**
• Unlimited exercise options
• Progressive overload with barbells
• Cardio machines for variety

What's your current setup? I can create something amazing regardless of what you have available! The best gym is the one you'll actually use consistently! 🎯`;
    }

    // Time/schedule questions
    if (
      message.includes("time") ||
      message.includes("busy") ||
      message.includes("schedule")
    ) {
      return `I hear you - life gets crazy busy! But here's the thing: even 15-20 minutes can make a HUGE difference! ⏰

🕐 **Short on Time? Try This:**
• **15-20 min HIIT** - maximum results, minimum time
• **Compound exercises** - work multiple muscles at once
• **Supersets** - no rest between exercises = faster workouts

**Sample 20-min Full-Body Blast:**
• 5 min warm-up
• 12 min circuit (3 rounds of 4 exercises)
• 3 min cool-down

**The 10-Minute Rule:**
Even on your busiest days, can you do 10 minutes? Maybe just some push-ups, squats, and planks? Consistency beats perfection every time!

How much time can you realistically commit most days? Let's work with your real schedule, not some fantasy version! 😄`;
    }

    // Cardio questions
    if (
      message.includes("cardio") ||
      message.includes("running") ||
      message.includes("endurance")
    ) {
      return `Cardio - the heart-healthy, mood-boosting, calorie-torching goodness! ❤️ There are so many fun ways to get your heart pumping!

🏃‍♂️ **Cardio Options Galore:**
• **LISS** (Low Intensity Steady State) - walking, easy bike rides
• **HIIT** (High Intensity Intervals) - sprint intervals, bike sprints
• **Fun cardio** - dancing, hiking, sports, swimming!

**My Cardio Philosophy:**
• Mix it up to prevent boredom
• Start where you are, progress gradually
• Find something you actually enjoy!

**Beginner-Friendly Progression:**
Week 1-2: 15-20 min easy pace
Week 3-4: 20-25 min, add some hills
Week 5+: Mix in intervals for variety

What sounds most appealing to you? Are you a "zone out with music" person or more of a "high-energy intervals" type? Let's find your cardio sweet spot! 🎵`;
    }

    // Strength training questions
    if (
      message.includes("strength") ||
      message.includes("weights") ||
      message.includes("lifting")
    ) {
      return `Strength training - the fountain of youth! 💪 This is where the magic happens for building muscle, burning fat, and feeling like a total badass!

🏋️ **Why Strength Training Rocks:**
• Burns calories for HOURS after your workout
• Builds lean muscle (which looks amazing!)
• Makes everyday activities easier
• Boosts confidence like nothing else!

**The Strength Pyramid:**
1. **Master bodyweight** first (push-ups, squats, planks)
2. **Add resistance** (bands, dumbbells, barbells)
3. **Progressive overload** (gradually increase difficulty)

**Beginner Strength Starter:**
• 2-3x per week, full-body workouts
• Focus on compound movements
• Start light, perfect your form
• Add weight/reps when it gets easy

Are you completely new to lifting, or have you done some before? And what equipment do you have access to? Let's get you strong! 🚀`;
    }

    // General/unclear questions
    const generalResponses = [
      "I'm here to help you crush your fitness goals! 💪 What's on your mind? Whether it's workout plans, exercise form, or just getting motivated - I'm your guy!",
      "Hey! I love helping people discover how amazing they can feel through fitness! What would you like to work on today? Strength, cardio, flexibility, or something specific?",
      "Ready to get moving and feeling awesome? 🔥 I'm here to make fitness fun and achievable for you. What questions do you have? Let's build something you'll love! 😊",
    ];

    return generalResponses[
      Math.floor(Math.random() * generalResponses.length)
    ];
  }

  async sendMessage(
    message: string,
    conversationHistory: WorkoutChatMessage[] = [],
    userProfile?: WorkoutUserProfile
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

  async generateWorkoutPlan(
    userProfile: WorkoutUserProfile,
    preferences: {
      daysPerWeek: number;
      timePerSession: number;
      focusAreas?: string[];
    }
  ): Promise<string> {
    const prompt = `Create a detailed ${
      preferences.daysPerWeek
    }-day weekly workout plan.
    Goal: ${userProfile.goal || "general fitness"}
    Time per session: ${preferences.timePerSession} minutes
    ${
      userProfile.injuries?.length
        ? `Avoid: ${userProfile.injuries.join(", ")}`
        : ""
    }
    
    Include specific exercises, sets, reps, and rest periods.`;

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
        this.generateFallbackWorkoutPlan(userProfile, preferences)
      );
    } catch (error) {
      console.warn("Error generating workout plan:", error);
      return this.generateFallbackWorkoutPlan(userProfile, preferences);
    }
  }

  private generateFallbackWorkoutPlan(
    userProfile: WorkoutUserProfile,
    preferences: {
      daysPerWeek: number;
      timePerSession: number;
    }
  ): string {
    const goal = userProfile.goal || "weight_loss";
    const days = preferences.daysPerWeek;

    const workoutPlans = {
      weight_loss: [
        `💪 **Day 1: Full-Body Strength** (${preferences.timePerSession} min)
• Bodyweight squats: 3 sets x 10-12 reps
• Push-ups (modified if needed): 3 sets x 5-10 reps
• Plank: 3 sets x 20-30 seconds
• Walking lunges: 2 sets x 10 each leg`,

        `🏃‍♂️ **Day 2: Cardio & Core** (${preferences.timePerSession} min)
• 5-min warm-up walk
• 15-min steady cardio (walk/bike/dance)
• Core circuit: 10 minutes
• 5-min cool-down stretch`,

        `🔥 **Day 3: HIIT Circuit** (${preferences.timePerSession} min)
• 5-min warm-up
• 4 rounds: 30s work, 30s rest
  - Jumping jacks, squats, push-ups, mountain climbers
• 5-min cool-down`,
      ],
      muscle_gain: [
        `💪 **Day 1: Upper Body** (${preferences.timePerSession} min)
• Push-ups: 3 sets x 8-12 reps
• Pike push-ups: 3 sets x 5-8 reps
• Tricep dips: 3 sets x 8-10 reps
• Plank: 3 sets x 30 seconds`,

        `🦵 **Day 2: Lower Body** (${preferences.timePerSession} min)
• Squats: 4 sets x 12-15 reps
• Lunges: 3 sets x 10 each leg
• Single-leg glute bridges: 3 sets x 8 each
• Wall sit: 3 sets x 30 seconds`,

        `🔥 **Day 3: Full Body** (${preferences.timePerSession} min)
• Burpees: 3 sets x 5-8 reps
• Jump squats: 3 sets x 8-10 reps
• Push-up to T: 3 sets x 6 each side
• Dead bug: 3 sets x 8 each side`,
      ],
    };

    const selectedPlan =
      workoutPlans[goal as keyof typeof workoutPlans] ||
      workoutPlans.weight_loss;

    const workoutDays = selectedPlan.slice(0, days);

    return `Here's your personalized ${days}-day workout plan! 🔥

${workoutDays.join("\n\n")}

**💡 Pro Tips:**
• Rest 1-2 days between strength sessions
• Listen to your body - some muscle soreness is normal
• Progress by adding reps or time each week
• Stay hydrated and get good sleep for recovery!

**Form > Speed > Weight** - always prioritize proper form!

How does this look? Any exercises you'd like me to modify or explain? 💪`;
  }
}

export const workoutChatbotService = new WorkoutChatbotService();
