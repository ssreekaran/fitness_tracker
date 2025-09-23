import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { logger } from "../utils/logger";

export interface UserGoals {
  id?: string;
  userId: string;
  weeklyWorkoutTarget: number;
  weeklyGoalThreshold: number; // Minimum workouts to consider goal met
  goalTrackingWeeks: number; // Number of weeks to track for achievement
  customGoals: CustomGoal[];
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface CustomGoal {
  id: string;
  name: string;
  description: string;
  type: "weekly" | "monthly" | "streak";
  target: number;
  currentValue: number;
  isActive: boolean;
  category: "workout" | "calories" | "duration" | "custom";
  unit: string; // e.g., 'workouts', 'calories', 'minutes', 'days'
  createdAt: Date | Timestamp;
}

// Default goals configuration
const DEFAULT_GOALS: Omit<
  UserGoals,
  "id" | "userId" | "createdAt" | "updatedAt"
> = {
  weeklyWorkoutTarget: 5,
  weeklyGoalThreshold: 3,
  goalTrackingWeeks: 4,
  customGoals: [
    {
      id: "weekly-workouts",
      name: "Weekly Workouts",
      description: "Complete your target number of workouts each week",
      type: "weekly",
      target: 5,
      currentValue: 0,
      isActive: true,
      category: "workout",
      unit: "workouts",
      createdAt: new Date(),
    },
    {
      id: "weekly-calories",
      name: "Weekly Calories",
      description: "Burn your target calories each week",
      type: "weekly",
      target: 2000,
      currentValue: 0,
      isActive: true,
      category: "calories",
      unit: "calories",
      createdAt: new Date(),
    },
    {
      id: "workout-streak",
      name: "Workout Streak",
      description: "Maintain a consistent workout streak",
      type: "streak",
      target: 7,
      currentValue: 0,
      isActive: true,
      category: "workout",
      unit: "days",
      createdAt: new Date(),
    },
    {
      id: "weekly-duration",
      name: "Weekly Exercise Time",
      description: "Exercise for your target duration each week",
      type: "weekly",
      target: 300,
      currentValue: 0,
      isActive: true,
      category: "duration",
      unit: "minutes",
      createdAt: new Date(),
    },
  ],
};

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
        customGoals:
          data.customGoals?.map(
            (goal: CustomGoal & { createdAt?: Timestamp }) => ({
              ...goal,
              createdAt: goal.createdAt?.toDate() || new Date(),
            })
          ) || [],
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

export const addCustomGoal = async (
  goal: Omit<CustomGoal, "id" | "createdAt">
): Promise<UserGoals> => {
  try {
    const currentGoals = await getUserGoals();
    const newGoal: CustomGoal = {
      ...goal,
      id: `custom-${Date.now()}`,
      createdAt: new Date(),
    };

    const updatedGoals = {
      ...currentGoals,
      customGoals: [...currentGoals.customGoals, newGoal],
    };

    return await updateUserGoals(updatedGoals);
  } catch (error) {
    logger.error("Error adding custom goal", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Failed to add custom goal");
  }
};

export const updateCustomGoal = async (
  goalId: string,
  updates: Partial<CustomGoal>
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
    logger.error("Error updating custom goal", {
      goalId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Failed to update custom goal");
  }
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
