/**
 * Enhanced Goals Service - Smart Fitness Goals Management
 *
 * This service handles all operations related to user fitness goals:
 * - Creating and managing smart goals with adaptive difficulty
 * - CRUD operations for custom user goals with milestones
 * - Goal tracking, progress monitoring, and achievement system
 * - Intelligent goal suggestions and auto-adjustments
 * - Fallback handling for offline/restricted database access
 *
 * The service supports smart goals that adapt to user performance,
 * milestone tracking, achievement unlocking, and personalized recommendations.
 */

import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { logger } from "../utils/logger";
import { notificationService } from "./notificationService";

/**
 * Goal difficulty levels for adaptive targeting
 */
export type GoalDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

/**
 * Goal priority levels for user focus
 */
export type GoalPriority = "low" | "medium" | "high" | "critical";

/**
 * Achievement types for gamification
 */
export type AchievementType =
  | "streak"
  | "milestone"
  | "consistency"
  | "improvement"
  | "special";

/**
 * Interface for goal milestones
 */
export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  isCompleted: boolean;
  completedAt?: Date;
  reward?: string; // Optional reward description
}

/**
 * Interface for reminder configuration
 */
export interface ReminderConfig {
  enabled: boolean;
  frequency: "daily" | "weekly" | "custom";
  time?: string; // HH:MM format
  days?: number[]; // 0-6, Sunday = 0
  message?: string;
}

/**
 * Interface for achievements
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: AchievementType;
  category: string;
  requirement: {
    type: "streak" | "total" | "consistency" | "improvement";
    value: number;
    period?: "day" | "week" | "month";
  };
  points: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
}

/**
 * Interface for goal performance analytics
 */
export interface GoalPerformance {
  goalId: string;
  completionRate: number; // Percentage of successful periods
  averageProgress: number; // Average progress per period
  bestStreak: number;
  currentStreak: number;
  totalCompletions: number;
  lastUpdated: Date;
  trend: "improving" | "declining" | "stable";
}

/**
 * Interface for workout data used in achievement checking
 */
export interface WorkoutData {
  totalWorkouts: number;
  currentStreak: number;
  completionRate: number;
}

/**
 * Interface for raw goal data from Firestore
 */
interface RawGoalData {
  id: string;
  name: string;
  description: string;
  type: string;
  target: number;
  originalTarget?: number;
  currentValue: number;
  isActive: boolean;
  category: string;
  unit: string;
  difficulty?: string;
  priority?: string;
  adaptiveTarget?: boolean;
  milestones?: Milestone[];
  reminderSettings?: ReminderConfig;
  performance?: GoalPerformance;
  tags?: string[];
  createdAt?: Date | Timestamp;
  lastAdjusted?: Date | Timestamp;
  motivationalMessage?: string;
}

/**
 * Interface for user's overall fitness goals configuration
 */
export interface UserGoals {
  id?: string; // Firestore document ID
  userId: string; // Firebase Auth user ID
  weeklyWorkoutTarget: number; // Target number of workouts per week
  weeklyGoalThreshold: number; // Minimum workouts to consider weekly goal met
  goalTrackingWeeks: number; // Number of weeks to track for achievement calculation
  customGoals: SmartGoal[]; // Array of user-defined smart goals
  achievements: Achievement[]; // User's unlocked achievements
  totalPoints: number; // Total achievement points earned
  level: number; // User's fitness level based on points
  createdAt?: Date | Timestamp; // When the goals were first created
  updatedAt?: Date | Timestamp; // Last modification timestamp
}

/**
 * Enhanced interface for smart fitness goals
 */
export interface SmartGoal {
  id: string; // Unique identifier for the goal
  name: string; // Display name for the goal
  description: string; // Detailed description of the goal
  type: "weekly" | "monthly" | "streak" | "yearly"; // Time period for goal tracking
  target: number; // Current target value to achieve
  originalTarget: number; // Original target before any adjustments
  currentValue: number; // Current progress towards target
  isActive: boolean; // Whether the goal is currently being tracked
  category:
    | "workout"
    | "calories"
    | "duration"
    | "weight"
    | "strength"
    | "custom"; // Category of fitness metric
  unit: string; // Unit of measurement (e.g., 'workouts', 'calories', 'minutes', 'days')
  difficulty: GoalDifficulty; // Current difficulty level
  priority: GoalPriority; // Goal priority for user focus
  adaptiveTarget: boolean; // Whether target should auto-adjust based on performance
  milestones: Milestone[]; // Goal milestones for progress tracking
  reminderSettings: ReminderConfig; // Reminder configuration
  performance: GoalPerformance; // Performance analytics
  tags: string[]; // Custom tags for organization
  createdAt: Date | Timestamp; // When the goal was created
  lastAdjusted?: Date; // When the target was last auto-adjusted
  motivationalMessage?: string; // Custom motivational message
}

/**
 * Legacy interface for backward compatibility
 */
export interface CustomGoal {
  id: string;
  name: string;
  description: string;
  type: "weekly" | "monthly" | "streak";
  target: number;
  currentValue: number;
  isActive: boolean;
  category: "workout" | "calories" | "duration" | "custom";
  unit: string;
  createdAt: Date | Timestamp;
}

/**
 * Default achievements for gamification
 */
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_workout",
    name: "Getting Started",
    description: "Complete your first workout",
    icon: "🏃‍♂️",
    type: "milestone",
    category: "workout",
    requirement: { type: "total", value: 1 },
    points: 10,
    isUnlocked: false,
    rarity: "common",
  },
  {
    id: "week_streak",
    name: "Consistent Performer",
    description: "Maintain a 7-day workout streak",
    icon: "🔥",
    type: "streak",
    category: "workout",
    requirement: { type: "streak", value: 7 },
    points: 50,
    isUnlocked: false,
    rarity: "rare",
  },
  {
    id: "month_goal",
    name: "Monthly Champion",
    description: "Complete your monthly workout goal",
    icon: "🏆",
    type: "milestone",
    category: "workout",
    requirement: { type: "consistency", value: 80, period: "month" },
    points: 100,
    isUnlocked: false,
    rarity: "epic",
  },
  {
    id: "calorie_crusher",
    name: "Calorie Crusher",
    description: "Burn 5000 calories in a week",
    icon: "🔥",
    type: "milestone",
    category: "calories",
    requirement: { type: "total", value: 5000, period: "week" },
    points: 75,
    isUnlocked: false,
    rarity: "rare",
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Complete 10 morning workouts (before 9 AM)",
    icon: "🌅",
    type: "special",
    category: "workout",
    requirement: { type: "total", value: 10 },
    points: 30,
    isUnlocked: false,
    rarity: "common",
  },
  {
    id: "iron_will",
    name: "Iron Will",
    description: "Maintain a 30-day workout streak",
    icon: "💪",
    type: "streak",
    category: "workout",
    requirement: { type: "streak", value: 30 },
    points: 200,
    isUnlocked: false,
    rarity: "legendary",
  },
];

/**
 * Default smart goals configuration for new users
 * These goals are automatically created when a user first accesses the goals system
 * Provides a comprehensive set of smart fitness tracking goals with adaptive features
 */
const DEFAULT_GOALS: Omit<
  UserGoals,
  "id" | "userId" | "createdAt" | "updatedAt"
> = {
  weeklyWorkoutTarget: 3, // Start with achievable 3 workouts per week
  weeklyGoalThreshold: 2, // Consider goal met with minimum 2 workouts
  goalTrackingWeeks: 4, // Track achievement over 4-week periods
  achievements: DEFAULT_ACHIEVEMENTS,
  totalPoints: 0,
  level: 1,
  customGoals: [
    {
      id: "weekly-workouts",
      name: "Weekly Workouts",
      description: "Build a consistent workout routine",
      type: "weekly",
      target: 3,
      originalTarget: 3,
      currentValue: 0,
      isActive: true,
      category: "workout",
      unit: "workouts",
      difficulty: "beginner",
      priority: "high",
      adaptiveTarget: true,
      milestones: [
        {
          id: "milestone-1",
          name: "First Week",
          description: "Complete your first week of workouts",
          targetValue: 3,
          isCompleted: false,
        },
        {
          id: "milestone-2",
          name: "Consistency Builder",
          description: "Complete 3 consecutive weeks",
          targetValue: 9,
          isCompleted: false,
        },
        {
          id: "milestone-3",
          name: "Habit Former",
          description: "Complete 4 weeks of consistent workouts",
          targetValue: 12,
          isCompleted: false,
          reward: "Unlock advanced workout plans",
        },
      ],
      reminderSettings: {
        enabled: true,
        frequency: "daily",
        time: "18:00",
        message: "Time for your workout! 💪",
      },
      performance: {
        goalId: "weekly-workouts",
        completionRate: 0,
        averageProgress: 0,
        bestStreak: 0,
        currentStreak: 0,
        totalCompletions: 0,
        lastUpdated: new Date(),
        trend: "stable",
      },
      tags: ["fitness", "routine", "beginner"],
      createdAt: new Date(),
      motivationalMessage:
        "Every workout counts! You're building a healthier you.",
    },
    {
      id: "weekly-calories",
      name: "Calorie Burn Goal",
      description: "Burn calories through consistent exercise",
      type: "weekly",
      target: 1500,
      originalTarget: 1500,
      currentValue: 0,
      isActive: true,
      category: "calories",
      unit: "calories",
      difficulty: "beginner",
      priority: "medium",
      adaptiveTarget: true,
      milestones: [
        {
          id: "calorie-milestone-1",
          name: "Calorie Starter",
          description: "Burn your first 1500 calories",
          targetValue: 1500,
          isCompleted: false,
        },
        {
          id: "calorie-milestone-2",
          name: "Calorie Crusher",
          description: "Burn 6000 calories in a month",
          targetValue: 6000,
          isCompleted: false,
        },
      ],
      reminderSettings: {
        enabled: false,
        frequency: "weekly",
      },
      performance: {
        goalId: "weekly-calories",
        completionRate: 0,
        averageProgress: 0,
        bestStreak: 0,
        currentStreak: 0,
        totalCompletions: 0,
        lastUpdated: new Date(),
        trend: "stable",
      },
      tags: ["calories", "fat-loss", "cardio"],
      createdAt: new Date(),
      motivationalMessage:
        "Every calorie burned is progress toward your goals!",
    },
    {
      id: "workout-streak",
      name: "Workout Streak",
      description: "Build momentum with consistent daily activity",
      type: "streak",
      target: 7,
      originalTarget: 7,
      currentValue: 0,
      isActive: true,
      category: "workout",
      unit: "days",
      difficulty: "intermediate",
      priority: "high",
      adaptiveTarget: false, // Streaks don't auto-adjust
      milestones: [
        {
          id: "streak-milestone-1",
          name: "Week Warrior",
          description: "Maintain a 7-day streak",
          targetValue: 7,
          isCompleted: false,
        },
        {
          id: "streak-milestone-2",
          name: "Streak Master",
          description: "Maintain a 14-day streak",
          targetValue: 14,
          isCompleted: false,
          reward: "Unlock streak multiplier bonus",
        },
      ],
      reminderSettings: {
        enabled: true,
        frequency: "daily",
        time: "19:00",
        message: "Keep your streak alive! 🔥",
      },
      performance: {
        goalId: "workout-streak",
        completionRate: 0,
        averageProgress: 0,
        bestStreak: 0,
        currentStreak: 0,
        totalCompletions: 0,
        lastUpdated: new Date(),
        trend: "stable",
      },
      tags: ["streak", "consistency", "motivation"],
      createdAt: new Date(),
      motivationalMessage: "Consistency is key! Keep the momentum going!",
    },
    {
      id: "weekly-duration",
      name: "Exercise Duration",
      description: "Spend quality time exercising each week",
      type: "weekly",
      target: 150, // WHO recommended 150 minutes per week
      originalTarget: 150,
      currentValue: 0,
      isActive: true,
      category: "duration",
      unit: "minutes",
      difficulty: "beginner",
      priority: "medium",
      adaptiveTarget: true,
      milestones: [
        {
          id: "duration-milestone-1",
          name: "Time Starter",
          description: "Exercise for 150 minutes in a week",
          targetValue: 150,
          isCompleted: false,
        },
        {
          id: "duration-milestone-2",
          name: "Time Champion",
          description: "Exercise for 300 minutes in a week",
          targetValue: 300,
          isCompleted: false,
        },
      ],
      reminderSettings: {
        enabled: false,
        frequency: "weekly",
      },
      performance: {
        goalId: "weekly-duration",
        completionRate: 0,
        averageProgress: 0,
        bestStreak: 0,
        currentStreak: 0,
        totalCompletions: 0,
        lastUpdated: new Date(),
        trend: "stable",
      },
      tags: ["duration", "endurance", "health"],
      createdAt: new Date(),
      motivationalMessage:
        "Time invested in fitness is time invested in yourself!",
    },
  ],
};

/**
 * Retrieve user's fitness goals from Firestore
 *
 * If no goals exist for the user, creates default goals automatically.
 * Includes fallback handling for database access issues (returns default goals).
 *
 * @returns Promise<UserGoals> - User's goals configuration with all custom goals
 * @throws Error if user is not authenticated
 */
export const getUserGoals = async (): Promise<UserGoals> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const goalsRef = doc(db, "userGoals", user.uid);
    const goalsDoc = await getDoc(goalsRef);

    if (goalsDoc.exists()) {
      const data = goalsDoc.data();
      return {
        id: goalsDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        achievements: data.achievements || DEFAULT_ACHIEVEMENTS,
        totalPoints: data.totalPoints || 0,
        level: data.level || 1,
        customGoals:
          data.customGoals?.map((goal: RawGoalData) => ({
            ...goal,
            createdAt:
              goal.createdAt instanceof Timestamp
                ? goal.createdAt.toDate()
                : goal.createdAt || new Date(),
            lastAdjusted:
              goal.lastAdjusted instanceof Timestamp
                ? goal.lastAdjusted.toDate()
                : goal.lastAdjusted,
            milestones: goal.milestones || [],
            reminderSettings: goal.reminderSettings || {
              enabled: false,
              frequency: "weekly",
            },
            performance: goal.performance || {
              goalId: goal.id,
              completionRate: 0,
              averageProgress: 0,
              bestStreak: 0,
              currentStreak: 0,
              totalCompletions: 0,
              lastUpdated: new Date(),
              trend: "stable",
            },
            tags: goal.tags || [],
            difficulty: goal.difficulty || "beginner",
            priority: goal.priority || "medium",
            adaptiveTarget:
              goal.adaptiveTarget !== undefined ? goal.adaptiveTarget : false,
            originalTarget: goal.originalTarget || goal.target,
          })) || [],
      } as UserGoals;
    } else {
      // Create default goals for new user
      const defaultGoals = {
        ...DEFAULT_GOALS,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      try {
        await setDoc(goalsRef, defaultGoals);
        logger.info("Created default goals for user", { userId: user.uid });
      } catch (writeError) {
        logger.warn(
          "Could not create default goals, using in-memory defaults",
          {
            error:
              writeError instanceof Error
                ? writeError.message
                : String(writeError),
          }
        );
        // Return default goals without saving to database
        return {
          id: "default",
          ...defaultGoals,
          createdAt: defaultGoals.createdAt.toDate(),
          updatedAt: defaultGoals.updatedAt.toDate(),
          customGoals: defaultGoals.customGoals.map((goal) => ({
            ...goal,
            createdAt:
              goal.createdAt instanceof Date ? goal.createdAt : new Date(),
          })),
        };
      }

      return {
        id: goalsRef.id,
        ...defaultGoals,
        createdAt: defaultGoals.createdAt.toDate(),
        updatedAt: defaultGoals.updatedAt.toDate(),
        customGoals: defaultGoals.customGoals.map((goal) => ({
          ...goal,
          createdAt:
            goal.createdAt instanceof Date ? goal.createdAt : new Date(),
        })),
      };
    }
  } catch (error) {
    logger.warn("Firestore access denied, using default goals", {
      error: error instanceof Error ? error.message : String(error),
    });

    // Return default goals when Firestore access is denied
    const defaultGoals = {
      ...DEFAULT_GOALS,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      id: "default",
      ...defaultGoals,
      customGoals: defaultGoals.customGoals.map((goal) => ({
        ...goal,
        createdAt: goal.createdAt instanceof Date ? goal.createdAt : new Date(),
      })),
    };
  }
};

export const updateUserGoals = async (
  goals: Partial<Omit<UserGoals, "id" | "userId" | "createdAt">>
): Promise<UserGoals> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const goalsRef = doc(db, "userGoals", user.uid);
    const currentGoals = await getUserGoals();

    // If we're using default goals (no database access), just return the current goals
    if (currentGoals.id === "default") {
      logger.warn(
        "Cannot update goals - using default goals due to database access restrictions"
      );
      throw new Error("Cannot update goals - database access restricted");
    }

    const updatedGoals = {
      ...currentGoals,
      ...goals,
      userId: user.uid,
      updatedAt: Timestamp.now(),
      customGoals:
        goals.customGoals?.map((goal) => ({
          ...goal,
          createdAt:
            goal.createdAt instanceof Date
              ? Timestamp.fromDate(goal.createdAt)
              : goal.createdAt,
        })) ||
        currentGoals.customGoals.map((goal) => ({
          ...goal,
          createdAt:
            goal.createdAt instanceof Date
              ? Timestamp.fromDate(goal.createdAt)
              : goal.createdAt,
        })),
    };

    try {
      await setDoc(goalsRef, updatedGoals, { merge: true });
      logger.info("Updated user goals", { userId: user.uid });
      return await getUserGoals(); // Return fresh data
    } catch (writeError) {
      logger.error("Failed to write goals to database", {
        error:
          writeError instanceof Error ? writeError.message : String(writeError),
      });
      throw new Error("Failed to save goals - database access restricted");
    }
  } catch (error) {
    logger.error("Error updating user goals", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error; // Re-throw the original error
  }
};

/**
 * Smart goal management functions
 */

export const addSmartGoal = async (
  goal: Omit<SmartGoal, "id" | "createdAt" | "performance">
): Promise<UserGoals> => {
  try {
    const currentGoals = await getUserGoals();
    const newGoal: SmartGoal = {
      ...goal,
      id: `smart-${Date.now()}`,
      createdAt: new Date(),
      performance: {
        goalId: `smart-${Date.now()}`,
        completionRate: 0,
        averageProgress: 0,
        bestStreak: 0,
        currentStreak: 0,
        totalCompletions: 0,
        lastUpdated: new Date(),
        trend: "stable",
      },
    };

    const updatedGoals = {
      ...currentGoals,
      customGoals: [...currentGoals.customGoals, newGoal],
    };

    return await updateUserGoals(updatedGoals);
  } catch (error) {
    logger.error("Error adding smart goal", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Failed to add smart goal");
  }
};

export const updateSmartGoal = async (
  goalId: string,
  updates: Partial<SmartGoal>
): Promise<UserGoals> => {
  try {
    const currentGoals = await getUserGoals();
    const updatedCustomGoals = currentGoals.customGoals.map((goal) =>
      goal.id === goalId ? { ...goal, ...updates } : goal
    );

    return await updateUserGoals({
      customGoals: updatedCustomGoals,
    });
  } catch (error) {
    logger.error("Error updating smart goal", {
      goalId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Failed to update smart goal");
  }
};

/**
 * Adaptive goal adjustment based on performance
 */
export const adjustGoalDifficulty = async (
  goalId: string
): Promise<UserGoals> => {
  try {
    const currentGoals = await getUserGoals();
    const goal = currentGoals.customGoals.find((g) => g.id === goalId);

    if (!goal || !goal.adaptiveTarget) {
      throw new Error("Goal not found or not adaptive");
    }

    const performance = goal.performance;
    let newTarget = goal.target;
    let newDifficulty = goal.difficulty;

    // Adjust based on completion rate over last 4 weeks
    if (performance.completionRate >= 90) {
      // Consistently exceeding goals - increase difficulty
      newTarget = Math.round(goal.target * 1.15); // 15% increase
      if (goal.difficulty === "beginner") newDifficulty = "intermediate";
      else if (goal.difficulty === "intermediate") newDifficulty = "advanced";
      else if (goal.difficulty === "advanced") newDifficulty = "expert";
    } else if (performance.completionRate <= 40) {
      // Struggling with current goals - decrease difficulty
      newTarget = Math.round(goal.target * 0.85); // 15% decrease
      if (goal.difficulty === "expert") newDifficulty = "advanced";
      else if (goal.difficulty === "advanced") newDifficulty = "intermediate";
      else if (goal.difficulty === "intermediate") newDifficulty = "beginner";
    }

    // Don't go below original target
    newTarget = Math.max(newTarget, goal.originalTarget);

    const updates: Partial<SmartGoal> = {
      target: newTarget,
      difficulty: newDifficulty,
      lastAdjusted: new Date(),
    };

    return await updateSmartGoal(goalId, updates);
  } catch (error) {
    logger.error("Error adjusting goal difficulty", {
      goalId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Failed to adjust goal difficulty");
  }
};

/**
 * Update goal performance metrics
 */
export const updateGoalPerformance = async (
  goalId: string,
  currentValue: number,
  isCompleted: boolean
): Promise<UserGoals> => {
  try {
    const currentGoals = await getUserGoals();
    const goal = currentGoals.customGoals.find((g) => g.id === goalId);

    if (!goal) {
      throw new Error("Goal not found");
    }

    const performance = { ...goal.performance };

    // Update current streak
    if (isCompleted) {
      performance.currentStreak += 1;
      performance.bestStreak = Math.max(
        performance.bestStreak,
        performance.currentStreak
      );
      performance.totalCompletions += 1;
    } else {
      performance.currentStreak = 0;
    }

    // Calculate completion rate (simplified - would need more historical data)
    const progressPercentage = (currentValue / goal.target) * 100;
    performance.averageProgress =
      (performance.averageProgress + progressPercentage) / 2;

    // Update trend based on recent performance
    if (progressPercentage > performance.averageProgress) {
      performance.trend = "improving";
    } else if (progressPercentage < performance.averageProgress * 0.8) {
      performance.trend = "declining";
    } else {
      performance.trend = "stable";
    }

    performance.lastUpdated = new Date();

    const updates: Partial<SmartGoal> = {
      currentValue,
      performance,
    };

    return await updateSmartGoal(goalId, updates);
  } catch (error) {
    logger.error("Error updating goal performance", {
      goalId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Failed to update goal performance");
  }
};

/**
 * Complete a milestone
 */
export const completeMilestone = async (
  goalId: string,
  milestoneId: string
): Promise<UserGoals> => {
  try {
    const currentGoals = await getUserGoals();
    const goal = currentGoals.customGoals.find((g) => g.id === goalId);

    if (!goal) {
      throw new Error("Goal not found");
    }

    const milestone = goal.milestones.find((m) => m.id === milestoneId);
    if (!milestone || milestone.isCompleted) {
      return currentGoals; // Already completed or doesn't exist
    }

    const updatedMilestones = goal.milestones.map((milestone) =>
      milestone.id === milestoneId
        ? { ...milestone, isCompleted: true, completedAt: new Date() }
        : milestone
    );

    const updates: Partial<SmartGoal> = {
      milestones: updatedMilestones,
    };

    // Show milestone achievement notification
    notificationService.showMilestoneAchievement(
      milestone.name,
      milestone.reward
    );

    return await updateSmartGoal(goalId, updates);
  } catch (error) {
    logger.error("Error completing milestone", {
      goalId,
      milestoneId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Failed to complete milestone");
  }
};

/**
 * Unlock achievement
 */
export const unlockAchievement = async (
  achievementId: string
): Promise<UserGoals> => {
  try {
    const currentGoals = await getUserGoals();
    const achievement = currentGoals.achievements.find(
      (a) => a.id === achievementId
    );

    if (!achievement || achievement.isUnlocked) {
      return currentGoals; // Already unlocked or doesn't exist
    }

    const updatedAchievements = currentGoals.achievements.map((a) =>
      a.id === achievementId
        ? { ...a, isUnlocked: true, unlockedAt: new Date() }
        : a
    );

    const newTotalPoints = currentGoals.totalPoints + achievement.points;
    const newLevel = Math.floor(newTotalPoints / 100) + 1; // 100 points per level
    const leveledUp = newLevel > currentGoals.level;

    const updates = {
      achievements: updatedAchievements,
      totalPoints: newTotalPoints,
      level: newLevel,
    };

    // Show achievement unlock notification (respect global toggle)
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('notificationsEnabled') : null;
      const enabled = saved !== null ? JSON.parse(saved) : true;
      if (enabled) {
        notificationService.showAchievementUnlock(
          achievement.name,
          achievement.points,
          achievement.icon
        );
      }
    } catch {
      // Fallback to showing if parsing fails
      notificationService.showAchievementUnlock(
        achievement.name,
        achievement.points,
        achievement.icon
      );
    }

    // Show level up notification if applicable
    if (leveledUp) {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('notificationsEnabled') : null;
        const enabled = saved !== null ? JSON.parse(saved) : true;
        if (enabled) {
          notificationService.showLevelUp(newLevel, newTotalPoints);
        }
      } catch {
        notificationService.showLevelUp(newLevel, newTotalPoints);
      }
    }

    return await updateUserGoals(updates);
  } catch (error) {
    logger.error("Error unlocking achievement", {
      achievementId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Failed to unlock achievement");
  }
};

/**
 * Check for achievement unlocks based on current progress
 */
export const checkAchievements = async (
  workoutData: WorkoutData
): Promise<Achievement[]> => {
  try {
    const currentGoals = await getUserGoals();
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of currentGoals.achievements) {
      if (achievement.isUnlocked) continue;

      let shouldUnlock = false;

      switch (achievement.requirement.type) {
        case "total":
          if (
            achievement.category === "workout" &&
            workoutData.totalWorkouts >= achievement.requirement.value
          ) {
            shouldUnlock = true;
          }
          break;
        case "streak":
          if (
            achievement.category === "workout" &&
            workoutData.currentStreak >= achievement.requirement.value
          ) {
            shouldUnlock = true;
          }
          break;
        case "consistency":
          if (workoutData.completionRate >= achievement.requirement.value) {
            shouldUnlock = true;
          }
          break;
      }

      if (shouldUnlock) {
        await unlockAchievement(achievement.id);
        newlyUnlocked.push(achievement);
        // We rely on notificationService via unlockAchievement to render in-app UI.
      }
    }

    return newlyUnlocked;
  } catch (error) {
    logger.error("Error checking achievements", {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
};

/**
 * Get goal suggestions based on user performance and preferences
 */
export const getGoalSuggestions = async (): Promise<Partial<SmartGoal>[]> => {
  try {
    const currentGoals = await getUserGoals();
    const suggestions: Partial<SmartGoal>[] = [];

    // Analyze current goals to suggest new ones
    const hasWeightGoal = currentGoals.customGoals.some(
      (g) => g.category === "weight"
    );
    const hasStrengthGoal = currentGoals.customGoals.some(
      (g) => g.category === "strength"
    );
    const activeGoalsCount = currentGoals.customGoals.filter(
      (g) => g.isActive
    ).length;

    if (!hasWeightGoal && activeGoalsCount < 6) {
      suggestions.push({
        name: "Weight Management",
        description: "Track your weight progress over time",
        type: "monthly",
        target: 1, // 1 kg per month
        category: "weight",
        unit: "kg",
        difficulty: "beginner",
        priority: "medium",
        adaptiveTarget: true,
        tags: ["weight", "health", "progress"],
      });
    }

    if (!hasStrengthGoal && activeGoalsCount < 6) {
      suggestions.push({
        name: "Strength Building",
        description: "Increase your strength training frequency",
        type: "weekly",
        target: 2, // 2 strength sessions per week
        category: "strength",
        unit: "sessions",
        difficulty: "beginner",
        priority: "medium",
        adaptiveTarget: true,
        tags: ["strength", "muscle", "power"],
      });
    }

    // Suggest advanced goals for experienced users
    if (currentGoals.level >= 3) {
      suggestions.push({
        name: "Fitness Challenge",
        description: "Complete a monthly fitness challenge",
        type: "monthly",
        target: 1,
        category: "custom",
        unit: "challenge",
        difficulty: "advanced",
        priority: "low",
        adaptiveTarget: false,
        tags: ["challenge", "advanced", "fun"],
      });
    }

    return suggestions;
  } catch (error) {
    logger.error("Error getting goal suggestions", {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
};

/**
 * Legacy functions for backward compatibility
 */
export const addCustomGoal = async (
  goal: Omit<CustomGoal, "id" | "createdAt">
): Promise<UserGoals> => {
  // Convert legacy goal to smart goal
  const smartGoal: Omit<SmartGoal, "id" | "createdAt" | "performance"> = {
    ...goal,
    originalTarget: goal.target,
    difficulty: "beginner",
    priority: "medium",
    adaptiveTarget: false,
    milestones: [],
    reminderSettings: { enabled: false, frequency: "weekly" },
    tags: [],
  };

  return await addSmartGoal(smartGoal);
};

export const updateCustomGoal = async (
  goalId: string,
  updates: Partial<CustomGoal>
): Promise<UserGoals> => {
  return await updateSmartGoal(goalId, updates);
};

export const deleteCustomGoal = async (goalId: string): Promise<UserGoals> => {
  try {
    const currentGoals = await getUserGoals();
    const updatedCustomGoals = currentGoals.customGoals.filter(
      (goal) => goal.id !== goalId
    );

    return await updateUserGoals({
      customGoals: updatedCustomGoals,
    });
  } catch (error) {
    logger.error("Error deleting custom goal", {
      goalId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Failed to delete custom goal");
  }
};
