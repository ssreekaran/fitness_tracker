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

export interface WorkoutLog {
  id?: string;
  userId: string;
  exercise: string;
  duration: number;
  intensity?: "low" | "moderate" | "high"; // Made optional
  caloriesBurned: number;
  date: Date | Timestamp;
  createdAt?: Date | Timestamp;
}

export const saveWorkout = async (
  workout: Omit<WorkoutLog, "id" | "userId" | "createdAt">
): Promise<WorkoutLog> => {
  console.log("Starting saveWorkout with data:", workout);
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      const error = new Error("User not authenticated");
      console.error(error);
      throw error;
    }

    console.log("Current user ID:", user.uid);

    // Ensure date is properly formatted
    let dateToSave;
    try {
      if (workout.date instanceof Date) {
        dateToSave = Timestamp.fromDate(workout.date);
      } else if (workout.date instanceof Timestamp) {
        dateToSave = workout.date;
      } else {
        // Try to parse string date
        dateToSave = Timestamp.fromDate(
          new Date(workout.date as unknown as string)
        );
      }
      console.log("Processed date:", dateToSave?.toDate?.());
    } catch (dateError) {
      console.error("Error processing date:", dateError);
      throw new Error(`Invalid date format: ${workout.date}`);
    }

    const workoutData = {
      ...workout,
      userId: user.uid,
      createdAt: Timestamp.now(),
      date: dateToSave,
    };

    console.log("Processed workout data:", {
      ...workoutData,
      date: workoutData.date?.toDate?.(),
    });

    try {
      const userWorkoutsRef = collection(db, "users", user.uid, "workouts");
      console.log("Collection reference created");

      const newWorkoutRef = doc(userWorkoutsRef);
      console.log("New document reference created with ID:", newWorkoutRef.id);

      console.log("Attempting to write document...");
      await setDoc(newWorkoutRef, workoutData);
      console.log("Document successfully written!");

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

      console.log("Returning saved workout:", savedWorkout);
      return savedWorkout;
    } catch (error) {
      const dbError = error as Error & { code?: string };
      console.error("Database error:", dbError);
      console.error("Error details:", {
        name: dbError.name,
        message: dbError.message,
        code: dbError.code,
        stack: dbError.stack,
      });
      throw new Error(`Database error: ${dbError.message}`);
    }
  } catch (error) {
    console.error("Error in saveWorkout:", error);
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
    console.error("Error fetching workouts:", error);
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
  } catch (error) {
    console.error("Error deleting workout:", error);
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
      const workoutDate =
        workout.date instanceof Date
          ? workout.date
          : workout.date instanceof Timestamp
          ? workout.date.toDate()
          : new Date(workout.date);
      return workoutDate >= startOfWeek;
    });

    // Calculate current streak
    const sortedWorkouts = allWorkouts
      .map((w) => ({
        ...w,
        date:
          w.date instanceof Date
            ? w.date
            : w.date instanceof Timestamp
            ? w.date.toDate()
            : new Date(w.date),
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
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);

      for (const workoutDate of uniqueDates) {
        const daysDiff = Math.floor(
          (checkDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (
          daysDiff === currentStreak ||
          (currentStreak === 0 && daysDiff <= 1)
        ) {
          currentStreak++;
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
    // Goal: 3 workouts per week, calculated over the last 4 weeks
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(now.getDate() - 28);

    const recentWorkouts = allWorkouts.filter((workout) => {
      const workoutDate =
        workout.date instanceof Date
          ? workout.date
          : workout.date instanceof Timestamp
          ? workout.date.toDate()
          : new Date(workout.date);
      return workoutDate >= fourWeeksAgo;
    });

    // Group by week and count weeks with 3+ workouts
    const weeklyWorkouts: { [key: string]: number } = {};
    recentWorkouts.forEach((workout) => {
      const workoutDate =
        workout.date instanceof Date
          ? workout.date
          : workout.date instanceof Timestamp
          ? workout.date.toDate()
          : new Date(workout.date);
      const weekStart = new Date(workoutDate);
      weekStart.setDate(workoutDate.getDate() - workoutDate.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      weeklyWorkouts[weekKey] = (weeklyWorkouts[weekKey] || 0) + 1;
    });

    const weeksWithGoalMet = Object.values(weeklyWorkouts).filter(
      (count) => count >= 3
    ).length;
    const totalWeeks = 4;

    return {
      workoutsThisWeek: {
        completed: workoutsThisWeek.length,
        target: 5, // Target 5 workouts per week
        percentage: Math.min(
          100,
          Math.round((workoutsThisWeek.length / 5) * 100)
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
    console.error("Error calculating activity summary:", error);
    throw new Error("Failed to calculate activity summary");
  }
};
