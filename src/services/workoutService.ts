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

// Safe date conversion utility
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
    // Parse string date
    date = new Date(dateInput);
  } else {
    throw new Error(`Invalid date type: ${typeof dateInput}`);
  }

  // Validate the resulting Date
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${dateInput}`);
  }

  return date;
};

// Date normalization helper for consistent date conversion
const normalizeDate = (dateInput: Date | Timestamp | string | number): Date => {
  if (dateInput instanceof Date) {
    return dateInput;
  } else if (dateInput instanceof Timestamp) {
    return dateInput.toDate();
  } else {
    return new Date(dateInput);
  }
};

// Activity summary constants
const WEEKLY_WORKOUT_TARGET = 5; // Target workouts per week
const WEEKLY_GOAL_THRESHOLD = 3; // Minimum workouts per week to consider goal met
const GOAL_TRACKING_WEEKS = 4; // Number of weeks to track for goal achievement

export interface WorkoutLog {
  id?: string;
  userId: string;
  exercise: string;
  duration: number;
  intensity?: "low" | "moderate" | "high"; // Made optional
  caloriesBurned: number;
  date: Date | Timestamp | string | number;
  createdAt?: Date | Timestamp;
}

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
}

export const getActivitySummary = async (): Promise<ActivitySummary> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
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

    // Calculate goals achieved (based on workout frequency)
    // Goal: 3+ workouts per week, calculated over the last 4 weeks
    const trackingPeriodStart = new Date();
    trackingPeriodStart.setDate(now.getDate() - GOAL_TRACKING_WEEKS * 7);

    const recentWorkouts = allWorkouts.filter((workout) => {
      const workoutDate = normalizeDate(workout.date);
      return workoutDate >= trackingPeriodStart;
    });

    // Group by week and count weeks with 3+ workouts
    const weeklyWorkouts: { [key: string]: number } = {};
    recentWorkouts.forEach((workout) => {
      const workoutDate = normalizeDate(workout.date);
      const weekStart = new Date(workoutDate);
      weekStart.setDate(workoutDate.getDate() - workoutDate.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      weeklyWorkouts[weekKey] = (weeklyWorkouts[weekKey] || 0) + 1;
    });

    const weeksWithGoalMet = Object.values(weeklyWorkouts).filter(
      (count) => count >= WEEKLY_GOAL_THRESHOLD
    ).length;
    const totalWeeks = GOAL_TRACKING_WEEKS;

    return {
      workoutsThisWeek: {
        completed: workoutsThisWeek.length,
        target: WEEKLY_WORKOUT_TARGET,
        percentage: Math.min(
          100,
          Math.round((workoutsThisWeek.length / WEEKLY_WORKOUT_TARGET) * 100)
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
    };
  } catch (error) {
    logger.error("Error calculating activity summary", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Failed to calculate activity summary");
  }
};
