/**
 * Intelligent Workout Planning Service
 *
 * Provides AI-powered workout planning capabilities including:
 * - Smart workout recommendations based on history and goals
 * - Adaptive program generation
 * - Recovery and progression tracking
 * - Performance-based plan adjustments
 * - Integration between planning and tracking
 */

import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { getUserWorkouts } from "./workoutService";
import { getUserGoals } from "./goalsService";

// Core interfaces for intelligent planning
export interface WorkoutTemplate {
  id: string;
  name: string;
  type: "strength" | "cardio" | "flexibility" | "hiit" | "recovery";
  duration: number; // minutes
  difficulty: "beginner" | "intermediate" | "advanced";
  targetMuscleGroups: string[];
  exercises: Exercise[];
  restPeriods: number[]; // seconds between exercises
  equipment: string[];
  caloriesBurnedEstimate: number;
  description: string;
}

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: number; // for time-based exercises
  weight?: number;
  restTime: number; // seconds
  instructions: string;
  muscleGroups: string[];
  difficulty: number; // 1-10 scale
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  duration: number; // weeks
  difficulty: "beginner" | "intermediate" | "advanced";
  goals: string[]; // goal IDs this plan targets
  schedule: WeeklySchedule[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  adaptiveSettings: AdaptiveSettings;
  progressTracking: ProgressTracking;
}

export interface WeeklySchedule {
  week: number;
  workouts: ScheduledWorkout[];
}

export interface ScheduledWorkout {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  templateId: string;
  plannedDate?: Date;
  completed: boolean;
  actualWorkoutId?: string; // links to WorkoutLog
  adaptations?: WorkoutAdaptation[];
}

export interface WorkoutAdaptation {
  type: "intensity" | "duration" | "exercise_swap" | "rest_adjustment";
  reason: string;
  originalValue: any;
  adaptedValue: any;
  appliedAt: Date;
}

export interface AdaptiveSettings {
  autoAdjustIntensity: boolean;
  autoAdjustVolume: boolean;
  considerRecovery: boolean;
  progressionRate: "conservative" | "moderate" | "aggressive";
  restDayPreference: number[]; // preferred rest days (0-6)
}

export interface ProgressTracking {
  weeklyMetrics: WeeklyMetrics[];
  overallProgress: number; // 0-100%
  strengthGains: Record<string, number>; // exercise -> improvement %
  enduranceGains: Record<string, number>;
  consistencyScore: number; // 0-100%
  recoveryScore: number; // 0-100%
}

export interface WeeklyMetrics {
  week: number;
  completedWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  averageIntensity: number;
  recoveryQuality: number;
  progressNotes: string;
}

export interface SmartRecommendation {
  type: "workout" | "rest" | "deload" | "progression";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  reasoning: string;
  actionItems: string[];
  estimatedBenefit: string;
  timeframe: string;
}

export interface WorkoutInsight {
  category: "performance" | "recovery" | "consistency" | "progression";
  insight: string;
  recommendation: string;
  confidence: number; // 0-100%
  dataPoints: string[];
}

// Predefined workout templates for different goals and levels
const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: "strength_beginner_upper",
    name: "Beginner Upper Body Strength",
    type: "strength",
    duration: 45,
    difficulty: "beginner",
    targetMuscleGroups: ["chest", "back", "shoulders", "arms"],
    exercises: [
      {
        name: "Push-ups",
        sets: 3,
        reps: 8,
        restTime: 60,
        instructions: "Keep body straight, lower chest to floor",
        muscleGroups: ["chest", "triceps"],
        difficulty: 3,
      },
      {
        name: "Bodyweight Rows",
        sets: 3,
        reps: 8,
        restTime: 60,
        instructions: "Pull chest to bar, squeeze shoulder blades",
        muscleGroups: ["back", "biceps"],
        difficulty: 4,
      },
      {
        name: "Pike Push-ups",
        sets: 2,
        reps: 6,
        restTime: 90,
        instructions: "Hands and feet on ground, push up in pike position",
        muscleGroups: ["shoulders"],
        difficulty: 5,
      },
    ],
    restPeriods: [60, 60, 90],
    equipment: ["none"],
    caloriesBurnedEstimate: 200,
    description:
      "Perfect starting point for building upper body strength using bodyweight exercises",
  },
  {
    id: "cardio_hiit_intermediate",
    name: "HIIT Cardio Blast",
    type: "hiit",
    duration: 30,
    difficulty: "intermediate",
    targetMuscleGroups: ["full_body"],
    exercises: [
      {
        name: "Burpees",
        duration: 30,
        restTime: 30,
        instructions: "Full body movement: squat, plank, jump",
        muscleGroups: ["full_body"],
        difficulty: 7,
      },
      {
        name: "Mountain Climbers",
        duration: 30,
        restTime: 30,
        instructions: "Plank position, alternate bringing knees to chest",
        muscleGroups: ["core", "legs"],
        difficulty: 6,
      },
      {
        name: "Jump Squats",
        duration: 30,
        restTime: 30,
        instructions: "Squat down, explode up into jump",
        muscleGroups: ["legs", "glutes"],
        difficulty: 6,
      },
    ],
    restPeriods: [30, 30, 30],
    equipment: ["none"],
    caloriesBurnedEstimate: 300,
    description:
      "High-intensity interval training for maximum calorie burn and cardiovascular fitness",
  },
  {
    id: "flexibility_recovery",
    name: "Recovery & Flexibility",
    type: "flexibility",
    duration: 25,
    difficulty: "beginner",
    targetMuscleGroups: ["full_body"],
    exercises: [
      {
        name: "Cat-Cow Stretch",
        duration: 60,
        restTime: 15,
        instructions: "On hands and knees, arch and round spine",
        muscleGroups: ["spine", "core"],
        difficulty: 2,
      },
      {
        name: "Downward Dog",
        duration: 45,
        restTime: 15,
        instructions: "Inverted V position, stretch calves and hamstrings",
        muscleGroups: ["calves", "hamstrings", "shoulders"],
        difficulty: 3,
      },
      {
        name: "Pigeon Pose",
        duration: 60,
        restTime: 30,
        instructions: "Hip opener, hold each side for 30 seconds",
        muscleGroups: ["hips", "glutes"],
        difficulty: 4,
      },
    ],
    restPeriods: [15, 15, 30],
    equipment: ["yoga_mat"],
    caloriesBurnedEstimate: 80,
    description:
      "Gentle stretching and mobility work for recovery and flexibility",
  },
];

/**
 * Generate intelligent workout recommendations based on user data
 */
export const generateSmartRecommendations = async (
  _userId: string
): Promise<SmartRecommendation[]> => {
  try {
    const [workouts, goals] = await Promise.all([
      getUserWorkouts(),
      getUserGoals(),
    ]);

    const recommendations: SmartRecommendation[] = [];
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Normalize date function
    const normalizeDate = (date: any): Date => {
      if (date instanceof Date) return date;
      if (date?.toDate) return date.toDate();
      return new Date(date);
    };

    // Analyze recent activity
    const recentWorkouts = workouts.filter(
      (w) => normalizeDate(w.date) >= lastWeek
    );
    const workoutFrequency = recentWorkouts.length;

    // Recommendation 1: Frequency-based
    if (workoutFrequency < 3) {
      recommendations.push({
        type: "workout",
        priority: "high",
        title: "Increase Workout Frequency",
        description:
          "You've only worked out " + workoutFrequency + " times this week",
        reasoning:
          "Consistency is key for fitness progress. Aim for at least 3-4 workouts per week.",
        actionItems: [
          "Schedule 2-3 more workouts this week",
          "Try shorter 20-30 minute sessions if time is limited",
          "Consider bodyweight exercises that require no equipment",
        ],
        estimatedBenefit:
          "Improved consistency and faster progress toward goals",
        timeframe: "This week",
      });
    }

    // Recommendation 2: Recovery-based
    if (workoutFrequency > 6) {
      recommendations.push({
        type: "rest",
        priority: "medium",
        title: "Schedule Recovery Time",
        description:
          "You've been very active with " +
          workoutFrequency +
          " workouts this week",
        reasoning:
          "Recovery is essential for muscle growth and preventing burnout.",
        actionItems: [
          "Take 1-2 complete rest days",
          "Try gentle stretching or yoga",
          "Focus on sleep and nutrition",
        ],
        estimatedBenefit:
          "Better recovery, reduced injury risk, improved performance",
        timeframe: "Next 2-3 days",
      });
    }

    // Recommendation 3: Goal-based
    const activeGoals = Array.isArray(goals)
      ? goals.filter((g: any) => g.isActive)
      : [];
    if (activeGoals.length > 0) {
      const strengthGoals = activeGoals.filter(
        (g: any) =>
          g.category === "strength" || g.name.toLowerCase().includes("strength")
      );

      if (
        strengthGoals.length > 0 &&
        recentWorkouts.filter(
          (w) =>
            w.exercise.toLowerCase().includes("weight") ||
            w.exercise.toLowerCase().includes("strength")
        ).length < 2
      ) {
        recommendations.push({
          type: "workout",
          priority: "medium",
          title: "Add Strength Training",
          description:
            "Your goals include strength building, but recent workouts lack resistance training",
          reasoning:
            "Strength goals require progressive resistance training 2-3 times per week.",
          actionItems: [
            "Schedule 2 strength training sessions this week",
            "Focus on compound movements (squats, push-ups, rows)",
            "Gradually increase difficulty or resistance",
          ],
          estimatedBenefit: "Direct progress toward strength goals",
          timeframe: "This week",
        });
      }
    }

    // Recommendation 4: Variety-based
    const exerciseTypes = new Set(recentWorkouts.map((w) => w.exercise));
    if (exerciseTypes.size < 3 && recentWorkouts.length > 2) {
      recommendations.push({
        type: "workout",
        priority: "low",
        title: "Add Exercise Variety",
        description: "You've been doing similar exercises recently",
        reasoning:
          "Exercise variety prevents plateaus and works different muscle groups.",
        actionItems: [
          "Try a new type of cardio (swimming, cycling, dancing)",
          "Add flexibility or yoga sessions",
          "Experiment with different strength exercises",
        ],
        estimatedBenefit:
          "Improved overall fitness, reduced boredom, better muscle balance",
        timeframe: "Next week",
      });
    }

    return recommendations;
  } catch (error) {
    console.error("Error generating smart recommendations:", error);
    return [];
  }
};

/**
 * Create a personalized workout plan based on user goals and fitness level
 */
export const createPersonalizedPlan = async (
  userId: string,
  planName: string,
  duration: number,
  targetGoals: string[],
  fitnessLevel: "beginner" | "intermediate" | "advanced",
  workoutsPerWeek: number,
  preferredTypes: string[]
): Promise<WorkoutPlan> => {
  try {
    const planId = `plan_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    // Generate weekly schedules
    const schedule: WeeklySchedule[] = [];

    for (let week = 1; week <= duration; week++) {
      const weeklyWorkouts: ScheduledWorkout[] = [];

      // Distribute workouts across the week
      const workoutDays = distributeWorkoutDays(workoutsPerWeek);

      for (let i = 0; i < workoutsPerWeek; i++) {
        const dayOfWeek = workoutDays[i];
        const template = selectOptimalTemplate(
          preferredTypes,
          fitnessLevel,
          i,
          workoutsPerWeek,
          week
        );

        weeklyWorkouts.push({
          dayOfWeek,
          templateId: template.id,
          completed: false,
          adaptations: [],
        });
      }

      schedule.push({
        week,
        workouts: weeklyWorkouts,
      });
    }

    const plan: WorkoutPlan = {
      id: planId,
      userId,
      name: planName,
      description: `Personalized ${duration}-week plan targeting your fitness goals`,
      duration,
      difficulty: fitnessLevel,
      goals: targetGoals,
      schedule,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      adaptiveSettings: {
        autoAdjustIntensity: true,
        autoAdjustVolume: true,
        considerRecovery: true,
        progressionRate: "moderate",
        restDayPreference: [0, 6], // Sunday and Saturday
      },
      progressTracking: {
        weeklyMetrics: [],
        overallProgress: 0,
        strengthGains: {},
        enduranceGains: {},
        consistencyScore: 0,
        recoveryScore: 100,
      },
    };

    // Save to Firestore
    await setDoc(doc(db, "users", userId, "workoutPlans", planId), {
      ...plan,
      createdAt: Timestamp.fromDate(plan.createdAt),
      updatedAt: Timestamp.fromDate(plan.updatedAt),
    });

    return plan;
  } catch (error) {
    console.error("Error creating personalized plan:", error);
    throw error;
  }
};

/**
 * Analyze workout performance and generate insights
 */
export const generateWorkoutInsights = async (
  _userId: string
): Promise<WorkoutInsight[]> => {
  try {
    const workouts = await getUserWorkouts();
    const insights: WorkoutInsight[] = [];

    if (workouts.length < 5) {
      return [
        {
          category: "consistency",
          insight: "Not enough data for detailed analysis",
          recommendation:
            "Complete at least 5 workouts to unlock personalized insights",
          confidence: 100,
          dataPoints: [`${workouts.length} workouts logged`],
        },
      ];
    }

    // Normalize date function
    const normalizeDate = (date: any): Date => {
      if (date instanceof Date) return date;
      if (date?.toDate) return date.toDate();
      return new Date(date);
    };

    // Analyze consistency
    const last30Days = workouts.filter((w) => {
      const workoutDate = normalizeDate(w.date);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return workoutDate >= thirtyDaysAgo;
    });

    const consistencyScore = Math.min(100, (last30Days.length / 12) * 100); // 12 workouts in 30 days = 100%

    if (consistencyScore >= 80) {
      insights.push({
        category: "consistency",
        insight: "Excellent workout consistency!",
        recommendation:
          "Keep up the great work. Consider gradually increasing intensity.",
        confidence: 95,
        dataPoints: [
          `${last30Days.length} workouts in last 30 days`,
          `${consistencyScore.toFixed(0)}% consistency score`,
        ],
      });
    } else if (consistencyScore < 50) {
      insights.push({
        category: "consistency",
        insight: "Workout consistency could be improved",
        recommendation:
          "Try scheduling workouts at the same time each day and start with shorter sessions.",
        confidence: 90,
        dataPoints: [
          `${last30Days.length} workouts in last 30 days`,
          `${consistencyScore.toFixed(0)}% consistency score`,
        ],
      });
    }

    // Analyze performance trends
    const recentWorkouts = workouts.slice(-10);
    const avgDuration =
      recentWorkouts.reduce((sum, w) => sum + w.duration, 0) /
      recentWorkouts.length;
    const avgCalories =
      recentWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0) /
      recentWorkouts.length;

    if (avgDuration > 45) {
      insights.push({
        category: "performance",
        insight: "Your workout duration is above average",
        recommendation:
          "Great endurance! Consider adding high-intensity intervals to maximize efficiency.",
        confidence: 85,
        dataPoints: [
          `Average duration: ${avgDuration.toFixed(0)} minutes`,
          `Average calories: ${avgCalories.toFixed(0)}`,
        ],
      });
    }

    // Analyze exercise variety
    const exerciseTypes = new Set(recentWorkouts.map((w) => w.exercise));
    if (exerciseTypes.size < 3) {
      insights.push({
        category: "progression",
        insight: "Limited exercise variety detected",
        recommendation:
          "Add different types of exercises to prevent plateaus and work all muscle groups.",
        confidence: 80,
        dataPoints: [
          `${exerciseTypes.size} different exercise types in recent workouts`,
        ],
      });
    }

    return insights;
  } catch (error) {
    console.error("Error generating workout insights:", error);
    return [];
  }
};

/**
 * Get workout templates filtered by criteria
 */
export const getWorkoutTemplates = (
  type?: string,
  difficulty?: string,
  duration?: number
): WorkoutTemplate[] => {
  return WORKOUT_TEMPLATES.filter((template) => {
    if (type && template.type !== type) return false;
    if (difficulty && template.difficulty !== difficulty) return false;
    if (duration && Math.abs(template.duration - duration) > 15) return false;
    return true;
  });
};

/**
 * Suggest next workout based on recent activity and goals
 */
export const suggestNextWorkout = async (
  _userId: string
): Promise<WorkoutTemplate | null> => {
  try {
    const workouts = await getUserWorkouts();
    const recentWorkouts = workouts.slice(-5);

    // Analyze recent workout types
    const recentTypes = recentWorkouts.map((w) => {
      if (
        w.exercise.toLowerCase().includes("run") ||
        w.exercise.toLowerCase().includes("cardio")
      ) {
        return "cardio";
      } else if (
        w.exercise.toLowerCase().includes("weight") ||
        w.exercise.toLowerCase().includes("strength")
      ) {
        return "strength";
      } else if (
        w.exercise.toLowerCase().includes("yoga") ||
        w.exercise.toLowerCase().includes("stretch")
      ) {
        return "flexibility";
      }
      return "strength"; // default
    });

    // Determine what type to suggest next
    const cardioCount = recentTypes.filter((t) => t === "cardio").length;
    const strengthCount = recentTypes.filter((t) => t === "strength").length;
    const flexibilityCount = recentTypes.filter(
      (t) => t === "flexibility"
    ).length;

    let suggestedType: string;
    if (strengthCount === 0 && recentWorkouts.length > 0) {
      suggestedType = "strength";
    } else if (cardioCount === 0 && recentWorkouts.length > 0) {
      suggestedType = "cardio";
    } else if (flexibilityCount === 0 && recentWorkouts.length > 2) {
      suggestedType = "flexibility";
    } else {
      // Rotate based on what's been done least
      if (cardioCount <= strengthCount && cardioCount <= flexibilityCount) {
        suggestedType = "cardio";
      } else if (strengthCount <= flexibilityCount) {
        suggestedType = "strength";
      } else {
        suggestedType = "flexibility";
      }
    }

    // Get templates of suggested type
    const templates = getWorkoutTemplates(suggestedType);
    if (templates.length === 0) return null;

    // Return a random template of the suggested type
    return templates[Math.floor(Math.random() * templates.length)];
  } catch (error) {
    console.error("Error suggesting next workout:", error);
    return null;
  }
};

// Helper functions
const distributeWorkoutDays = (workoutsPerWeek: number): number[] => {
  const days: number[] = [];

  if (workoutsPerWeek <= 3) {
    // Monday, Wednesday, Friday
    days.push(1, 3, 5);
  } else if (workoutsPerWeek === 4) {
    // Monday, Tuesday, Thursday, Friday
    days.push(1, 2, 4, 5);
  } else if (workoutsPerWeek === 5) {
    // Monday through Friday
    days.push(1, 2, 3, 4, 5);
  } else {
    // 6+ workouts: Monday through Saturday
    days.push(1, 2, 3, 4, 5, 6);
  }

  return days.slice(0, workoutsPerWeek);
};

const selectOptimalTemplate = (
  preferredTypes: string[],
  fitnessLevel: "beginner" | "intermediate" | "advanced",
  workoutIndex: number,
  _totalWorkouts: number,
  week: number
): WorkoutTemplate => {
  // Filter templates by fitness level and preferred types
  let availableTemplates = WORKOUT_TEMPLATES.filter(
    (t) =>
      t.difficulty === fitnessLevel &&
      (preferredTypes.length === 0 || preferredTypes.includes(t.type))
  );

  if (availableTemplates.length === 0) {
    // Fallback to any template of the right difficulty
    availableTemplates = WORKOUT_TEMPLATES.filter(
      (t) => t.difficulty === fitnessLevel
    );
  }

  if (availableTemplates.length === 0) {
    // Final fallback
    availableTemplates = WORKOUT_TEMPLATES;
  }

  // Simple rotation logic
  const index = (workoutIndex + week) % availableTemplates.length;
  return availableTemplates[index];
};

export default {
  generateSmartRecommendations,
  createPersonalizedPlan,
  generateWorkoutInsights,
  getWorkoutTemplates,
  suggestNextWorkout,
};
