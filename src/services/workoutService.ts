/**
 * Workout Service - Workout Logging and Activity Tracking
 *
 * This service manages all workout-related operations:
 * - Saving and retrieving workout logs
 * - Calculating activity summaries and progress metrics
 * - Computing workout streaks and goal achievements
 * - Integrating with the goals system for progress tracking
 *
 * The service handles date normalization across different input formats
 * and provides comprehensive activity analytics for user progress monitoring.
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { logger } from "../utils/logger";
import { getUserGoals, checkAchievements } from "./goalsService";

/**
 * Safe date conversion utility
 * Converts various date input formats to a valid Date object with validation
 *
 * @param dateInput - Date in various formats (Date, Timestamp, string, number)
 * @returns Valid Date object
 * @throws Error if the input cannot be converted to a valid date
 */
const convertToValidDate = (
  dateInput: Date | Timestamp | string | number
): Date => {
  let date: Date;

  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (dateInput instanceof Timestamp) {
    date = dateInput.toDate();
  } else if (typeof dateInput === "number") {
    // Treat as epoch timestamp (milliseconds)
    date = new Date(dateInput);
  } else if (typeof dateInput === "string") {
    // Parse string date (ISO format, etc.)
    date = new Date(dateInput);
  } else {
    throw new Error(`Invalid date type: ${typeof dateInput}`);
  }

  // Validate the resulting Date object
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${dateInput}`);
  }

  return date;
};

/**
 * Date normalization helper for consistent date conversion
 * Simpler conversion that assumes input is already valid (used for data from Firestore)
 *
 * @param dateInput - Date in various formats
 * @returns Normalized Date object
 */
const normalizeDate = (dateInput: Date | Timestamp | string | number): Date => {
  if (dateInput instanceof Date) {
    return dateInput;
  } else if (dateInput instanceof Timestamp) {
    return dateInput.toDate();
  } else {
    return new Date(dateInput);
  }
};

/**
 * Default activity summary constants (fallback values)
 * Used when user goals cannot be loaded from the database
 */
const DEFAULT_WEEKLY_WORKOUT_TARGET = 5; // Default target: 5 workouts per week
const DEFAULT_WEEKLY_GOAL_THRESHOLD = 3; // Default threshold: 3 workouts minimum
const DEFAULT_GOAL_TRACKING_WEEKS = 4; // Default tracking period: 4 weeks

/**
 * Interface for individual workout log entries
 */
export interface WorkoutLog {
  id?: string; // Firestore document ID
  userId: string; // Firebase Auth user ID
  exercise: string; // Name/type of exercise performed
  duration: number; // Duration in minutes
  intensity?: "low" | "moderate" | "high"; // Exercise intensity level (optional)
  caloriesBurned: number; // Estimated calories burned
  date: Date | Timestamp | string | number; // When the workout was performed
  createdAt?: Date | Timestamp; // When the log entry was created
}

/**
 * Save a new workout log entry to Firestore
 *
 * Handles date validation and conversion, creates a new document in the user's
 * workout subcollection, and returns the saved workout with generated ID.
 *
 * @param workout - Workout data (excluding id, userId, createdAt)
 * @returns Promise<WorkoutLog> - The saved workout with generated ID and timestamps
 * @throws Error if user is not authenticated or if there are database/validation errors
 */
export const saveWorkout = async (
  workout: Omit<WorkoutLog, "id" | "userId" | "createdAt">
): Promise<WorkoutLog> => {
  logger.debug("Starting saveWorkout");
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      const error = new Error("User not authenticated");
      logger.error("User not authenticated in saveWorkout");
      throw error;
    }

    logger.debug("Saving workout for user", { userId: user.uid });

    // Ensure date is properly formatted
    let dateToSave: Timestamp;
    try {
      if (workout.date instanceof Timestamp) {
        // Already a Timestamp, use directly
        dateToSave = workout.date;
      } else {
        // Convert to valid Date first, then to Timestamp
        const validDate = convertToValidDate(workout.date);
        dateToSave = Timestamp.fromDate(validDate);
      }
      logger.debug("Date processed successfully");
    } catch (dateError) {
      logger.error("Error processing date", {
        error:
          dateError instanceof Error ? dateError.message : String(dateError),
        inputDate: workout.date,
        inputType: typeof workout.date,
      });
      throw new Error(`Invalid date format: ${workout.date}`);
    }

    const workoutData = {
      ...workout,
      userId: user.uid,
      createdAt: Timestamp.now(),
      date: dateToSave,
    };

    logger.debug("Workout data prepared for saving");

    try {
      const userWorkoutsRef = collection(db, "users", user.uid, "workouts");
      const newWorkoutRef = doc(userWorkoutsRef);

      logger.debug("Saving workout to Firestore", {
        workoutId: newWorkoutRef.id,
      });
      await setDoc(newWorkoutRef, workoutData);
      logger.info("Workout saved successfully", {
        workoutId: newWorkoutRef.id,
      });

      const savedWorkout = {
        id: newWorkoutRef.id,
        ...workoutData,
        date:
          workoutData.date instanceof Timestamp
            ? workoutData.date.toDate()
            : workoutData.date,
        createdAt:
          workoutData.createdAt instanceof Timestamp
            ? workoutData.createdAt.toDate()
            : workoutData.createdAt,
      };

      // Update goal progress and check for achievements
      try {
        const allWorkouts = await getUserWorkouts(365);
        const workoutData = {
          totalWorkouts: allWorkouts.length,
          currentStreak: 0, // This would be calculated based on workout dates
          completionRate: 0, // This would be calculated based on goals
        };

        // Check for newly unlocked achievements
        await checkAchievements(workoutData);

        logger.info("Goal progress updated after workout save");
      } catch (goalError) {
        logger.warn("Failed to update goal progress", {
          error:
            goalError instanceof Error ? goalError.message : String(goalError),
        });
        // Don't fail the workout save if goal update fails
      }

      return savedWorkout;
    } catch (error) {
      const dbError = error as Error & { code?: string };
      logger.error("Database error in saveWorkout", {
        message: dbError.message,
        code: dbError.code,
      });
      throw new Error(`Database error: ${dbError.message}`);
    }
  } catch (error) {
    logger.error("Error in saveWorkout", {
      error: error instanceof Error ? error.message : String(error),
    });
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(`Failed to save workout: ${errorMessage}`);
  }
};

export const getUserWorkouts = async (
  limitCount = 50
): Promise<WorkoutLog[]> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const userWorkoutsRef = collection(db, "users", user.uid, "workouts");
    const q = query(
      userWorkoutsRef,
      orderBy("date", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as WorkoutLog[];
  } catch (error) {
    logger.error("Error fetching workouts", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Failed to load workouts");
  }
};

export const deleteWorkout = async (workoutId: string): Promise<void> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const workoutRef = doc(db, "users", user.uid, "workouts", workoutId);
    await deleteDoc(workoutRef);
    logger.info("Workout deleted successfully", { workoutId });
  } catch (error) {
    logger.error("Error deleting workout", {
      workoutId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Failed to delete workout");
  }
};

export interface ActivitySummary {
  workoutsThisWeek: {
    completed: number;
    target: number;
    percentage: number;
  };
  currentStreak: {
    days: number;
    bestStreak: number;
  };
  goalsAchieved: {
    completed: number;
    total: number;
    percentage: number;
  };
  customGoalsProgress?: {
    goalId: string;
    name: string;
    currentValue: number;
    target: number;
    percentage: number;
    isAchieved: boolean;
  }[];
}

export const getActivitySummary = async (): Promise<ActivitySummary> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get user goals for customizable targets
    let userGoals;
    try {
      userGoals = await getUserGoals();
    } catch (error) {
      logger.warn("Could not load user goals, using defaults", { error });
      userGoals = {
        weeklyWorkoutTarget: DEFAULT_WEEKLY_WORKOUT_TARGET,
        weeklyGoalThreshold: DEFAULT_WEEKLY_GOAL_THRESHOLD,
        goalTrackingWeeks: DEFAULT_GOAL_TRACKING_WEEKS,
        customGoals: [],
      };
    }

    // Get all workouts for calculations
    const allWorkouts = await getUserWorkouts(365); // Get up to a year of workouts

    // Calculate workouts this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const workoutsThisWeek = allWorkouts.filter((workout) => {
      const workoutDate = normalizeDate(workout.date);
      return workoutDate >= startOfWeek;
    });

    // Calculate current streak
    const sortedWorkouts = allWorkouts
      .map((w) => ({
        ...w,
        date: normalizeDate(w.date),
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    let currentStreak = 0;
    let bestStreak = 0;

    if (sortedWorkouts.length > 0) {
      // Group workouts by date to handle multiple workouts per day
      const workoutDates = new Set(
        sortedWorkouts.map((w) => w.date.toDateString())
      );

      const uniqueDates = Array.from(workoutDates)
        .map((dateStr) => new Date(dateStr))
        .sort((a, b) => b.getTime() - a.getTime());

      // Calculate current streak
      const startCheckDate = new Date();
      startCheckDate.setHours(0, 0, 0, 0);
      let checkDate = new Date(startCheckDate);

      for (const workoutDate of uniqueDates) {
        const daysDiff = Math.floor(
          (checkDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (
          daysDiff === currentStreak ||
          (currentStreak === 0 && daysDiff <= 1)
        ) {
          currentStreak++;
          checkDate = new Date(checkDate);
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Calculate best streak
      let currentTempStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const daysDiff = Math.floor(
          (uniqueDates[i - 1].getTime() - uniqueDates[i].getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 1) {
          currentTempStreak++;
        } else {
          bestStreak = Math.max(bestStreak, currentTempStreak);
          currentTempStreak = 1;
        }
      }
      bestStreak = Math.max(bestStreak, currentTempStreak);
    }

    // Calculate goals achieved using user's custom settings
    const trackingPeriodStart = new Date();
    trackingPeriodStart.setDate(
      now.getDate() - userGoals.goalTrackingWeeks * 7
    );

    const recentWorkouts = allWorkouts.filter((workout) => {
      const workoutDate = normalizeDate(workout.date);
      return workoutDate >= trackingPeriodStart;
    });

    // Group by week and count weeks with threshold+ workouts
    const weeklyWorkouts: { [key: string]: number } = {};
    recentWorkouts.forEach((workout) => {
      const workoutDate = normalizeDate(workout.date);
      const weekStart = new Date(workoutDate);
      weekStart.setDate(workoutDate.getDate() - workoutDate.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      weeklyWorkouts[weekKey] = (weeklyWorkouts[weekKey] || 0) + 1;
    });

    const weeksWithGoalMet = Object.values(weeklyWorkouts).filter(
      (count) => count >= userGoals.weeklyGoalThreshold
    ).length;
    const totalWeeks = userGoals.goalTrackingWeeks;

    // Calculate custom goals progress
    const customGoalsProgress =
      userGoals.customGoals
        ?.filter((goal) => goal.isActive)
        .map((goal) => {
          let currentValue = 0;

          switch (goal.type) {
            case "weekly": {
              if (goal.category === "workout") {
                currentValue = workoutsThisWeek.length;
              } else if (goal.category === "calories") {
                currentValue = workoutsThisWeek.reduce(
                  (sum, workout) => sum + workout.caloriesBurned,
                  0
                );
              } else if (goal.category === "duration") {
                currentValue = workoutsThisWeek.reduce(
                  (sum, workout) => sum + workout.duration,
                  0
                );
              }
              break;
            }
            case "streak": {
              if (goal.category === "workout") {
                currentValue = currentStreak;
              }
              break;
            }
            case "monthly": {
              // Calculate monthly progress
              const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
              const monthlyWorkouts = allWorkouts.filter((workout) => {
                const workoutDate = normalizeDate(workout.date);
                return workoutDate >= monthStart;
              });

              if (goal.category === "workout") {
                currentValue = monthlyWorkouts.length;
              } else if (goal.category === "calories") {
                currentValue = monthlyWorkouts.reduce(
                  (sum, workout) => sum + workout.caloriesBurned,
                  0
                );
              } else if (goal.category === "duration") {
                currentValue = monthlyWorkouts.reduce(
                  (sum, workout) => sum + workout.duration,
                  0
                );
              }
              break;
            }
          }

          const percentage = Math.min(
            100,
            Math.round((currentValue / goal.target) * 100)
          );

          return {
            goalId: goal.id,
            name: goal.name,
            currentValue,
            target: goal.target,
            percentage,
            isAchieved: currentValue >= goal.target,
          };
        }) || [];

    return {
      workoutsThisWeek: {
        completed: workoutsThisWeek.length,
        target: userGoals.weeklyWorkoutTarget,
        percentage: Math.min(
          100,
          Math.round(
            (workoutsThisWeek.length / userGoals.weeklyWorkoutTarget) * 100
          )
        ),
      },
      currentStreak: {
        days: currentStreak,
        bestStreak: bestStreak,
      },
      goalsAchieved: {
        completed: weeksWithGoalMet,
        total: totalWeeks,
        percentage: Math.round((weeksWithGoalMet / totalWeeks) * 100),
      },
      customGoalsProgress,
    };
  } catch (error) {
    logger.error("Error calculating activity summary", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Failed to calculate activity summary");
  }
};
