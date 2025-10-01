/**
 * Analytics Service - Fitness Data Analytics and Insights
 *
 * This service provides comprehensive analytics for fitness data:
 * - Workout trends and patterns
 * - Goal achievement analytics
 * - Performance insights
 * - Calorie burn analysis
 * - Streak and consistency metrics
 * - Predictive analytics
 */

import { getUserWorkouts, WorkoutLog } from "./workoutService";
import { getUserGoals, SmartGoal } from "./goalsService";
import { logger } from "../utils/logger";

/**
 * Time period options for analytics
 */
export type AnalyticsPeriod = "7d" | "30d" | "90d" | "1y" | "all";

/**
 * Workout trend data point
 */
export interface WorkoutTrendPoint {
  date: string;
  workouts: number;
  calories: number;
  duration: number;
  averageIntensity?: number;
}

/**
 * Goal achievement analytics
 */
export interface GoalAnalytics {
  goalId: string;
  goalName: string;
  category: string;
  completionRate: number;
  averageProgress: number;
  bestStreak: number;
  currentStreak: number;
  trend: "improving" | "declining" | "stable";
  weeklyProgress: number[];
  monthlyProgress: number[];
}

/**
 * Calorie burn insights
 */
export interface CalorieBurnInsights {
  totalCalories: number;
  averagePerWorkout: number;
  averagePerDay: number;
  bestDay: { date: string; calories: number };
  topExercises: { exercise: string; calories: number; count: number }[];
  weeklyTrend: number[];
  monthlyTrend: number[];
}

/**
 * Workout frequency analysis
 */
export interface WorkoutFrequencyAnalysis {
  totalWorkouts: number;
  averagePerWeek: number;
  averagePerMonth: number;
  mostActiveDay: string;
  mostActiveHour: number;
  consistencyScore: number; // 0-100
  weeklyDistribution: { [key: string]: number };
  hourlyDistribution: { [key: number]: number };
}

/**
 * Performance insights
 */
export interface PerformanceInsights {
  improvementAreas: string[];
  strengths: string[];
  recommendations: string[];
  riskFactors: string[];
  motivationalMessage: string;
}

/**
 * Comprehensive analytics dashboard data
 */
export interface AnalyticsDashboard {
  period: AnalyticsPeriod;
  workoutTrends: WorkoutTrendPoint[];
  goalAnalytics: GoalAnalytics[];
  calorieBurnInsights: CalorieBurnInsights;
  frequencyAnalysis: WorkoutFrequencyAnalysis;
  performanceInsights: PerformanceInsights;
  streakAnalysis: {
    currentStreak: number;
    longestStreak: number;
    streakHistory: { start: string; end: string; length: number }[];
  };
  predictiveInsights: {
    weeklyGoalLikelihood: number;
    monthlyGoalLikelihood: number;
    suggestedWorkoutDays: string[];
    burnoutRisk: "low" | "medium" | "high";
  };
}

/**
 * Helper function to normalize dates for consistent grouping
 */
const normalizeDate = (
  date: Date | { toDate: () => Date } | string | number
): Date => {
  if (date instanceof Date) return date;
  if (typeof date === "object" && date !== null && "toDate" in date) {
    return date.toDate();
  }
  return new Date(date);
};

/**
 * Get date range for analytics period
 */
const getDateRange = (period: AnalyticsPeriod): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case "7d":
      start.setDate(end.getDate() - 7);
      break;
    case "30d":
      start.setDate(end.getDate() - 30);
      break;
    case "90d":
      start.setDate(end.getDate() - 90);
      break;
    case "1y":
      start.setFullYear(end.getFullYear() - 1);
      break;
    case "all":
      start.setFullYear(2020); // Reasonable start date
      break;
  }

  return { start, end };
};

/**
 * Generate workout trend data
 */
export const generateWorkoutTrends = async (
  period: AnalyticsPeriod
): Promise<WorkoutTrendPoint[]> => {
  try {
    const workouts = await getUserWorkouts(1000); // Get more workouts for better analysis
    const { start, end } = getDateRange(period);

    // Filter workouts by date range
    const filteredWorkouts = workouts.filter((workout) => {
      const workoutDate = normalizeDate(workout.date);
      return workoutDate >= start && workoutDate <= end;
    });

    // Group workouts by date
    const groupedByDate: { [key: string]: WorkoutLog[] } = {};
    filteredWorkouts.forEach((workout) => {
      const dateKey = normalizeDate(workout.date).toISOString().split("T")[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(workout);
    });

    // Generate trend points
    const trendPoints: WorkoutTrendPoint[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateKey = currentDate.toISOString().split("T")[0];
      const dayWorkouts = groupedByDate[dateKey] || [];

      trendPoints.push({
        date: dateKey,
        workouts: dayWorkouts.length,
        calories: dayWorkouts.reduce(
          (sum, w) => sum + (w.caloriesBurned || 0),
          0
        ),
        duration: dayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return trendPoints;
  } catch (error) {
    logger.error("Error generating workout trends", { error });
    return [];
  }
};

/**
 * Analyze goal performance
 */
export const analyzeGoalPerformance = async (): Promise<GoalAnalytics[]> => {
  try {
    const goals = await getUserGoals();
    const workouts = await getUserWorkouts(365); // Last year of workouts

    return goals.customGoals.map((goal) => {
      const performance = goal.performance || {
        completionRate: 0,
        averageProgress: 0,
        bestStreak: 0,
        currentStreak: 0,
        trend: "stable" as const,
      };

      // Calculate weekly and monthly progress
      const weeklyProgress = calculateWeeklyProgress(goal, workouts);
      const monthlyProgress = calculateMonthlyProgress(goal, workouts);

      return {
        goalId: goal.id,
        goalName: goal.name,
        category: goal.category,
        completionRate: performance.completionRate,
        averageProgress: performance.averageProgress,
        bestStreak: performance.bestStreak,
        currentStreak: performance.currentStreak,
        trend: performance.trend,
        weeklyProgress,
        monthlyProgress,
      };
    });
  } catch (error) {
    logger.error("Error analyzing goal performance", { error });
    return [];
  }
};

/**
 * Calculate weekly progress for a goal
 */
const calculateWeeklyProgress = (
  goal: SmartGoal,
  workouts: WorkoutLog[]
): number[] => {
  const weeks = 12; // Last 12 weeks
  const progress: number[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - i * 7 - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekWorkouts = workouts.filter((workout) => {
      const workoutDate = normalizeDate(workout.date);
      return workoutDate >= weekStart && workoutDate <= weekEnd;
    });

    let weekProgress = 0;
    if (goal.category === "workout") {
      weekProgress = (weekWorkouts.length / goal.target) * 100;
    } else if (goal.category === "calories") {
      const weekCalories = weekWorkouts.reduce(
        (sum, w) => sum + (w.caloriesBurned || 0),
        0
      );
      weekProgress = (weekCalories / goal.target) * 100;
    } else if (goal.category === "duration") {
      const weekDuration = weekWorkouts.reduce(
        (sum, w) => sum + (w.duration || 0),
        0
      );
      weekProgress = (weekDuration / goal.target) * 100;
    }

    progress.push(Math.min(100, weekProgress));
  }

  return progress;
};

/**
 * Calculate monthly progress for a goal
 */
const calculateMonthlyProgress = (
  goal: SmartGoal,
  workouts: WorkoutLog[]
): number[] => {
  const months = 6; // Last 6 months
  const progress: number[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - i, 1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthStart.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const monthWorkouts = workouts.filter((workout) => {
      const workoutDate = normalizeDate(workout.date);
      return workoutDate >= monthStart && workoutDate <= monthEnd;
    });

    let monthProgress = 0;
    const monthlyTarget =
      goal.type === "monthly" ? goal.target : goal.target * 4; // Approximate monthly target

    if (goal.category === "workout") {
      monthProgress = (monthWorkouts.length / monthlyTarget) * 100;
    } else if (goal.category === "calories") {
      const monthCalories = monthWorkouts.reduce(
        (sum, w) => sum + (w.caloriesBurned || 0),
        0
      );
      monthProgress = (monthCalories / monthlyTarget) * 100;
    } else if (goal.category === "duration") {
      const monthDuration = monthWorkouts.reduce(
        (sum, w) => sum + (w.duration || 0),
        0
      );
      monthProgress = (monthDuration / monthlyTarget) * 100;
    }

    progress.push(Math.min(100, monthProgress));
  }

  return progress;
};

/**
 * Generate calorie burn insights
 */
export const generateCalorieBurnInsights = async (
  period: AnalyticsPeriod
): Promise<CalorieBurnInsights> => {
  try {
    const workouts = await getUserWorkouts(1000);
    const { start, end } = getDateRange(period);

    const filteredWorkouts = workouts.filter((workout) => {
      const workoutDate = normalizeDate(workout.date);
      return workoutDate >= start && workoutDate <= end;
    });

    const totalCalories = filteredWorkouts.reduce(
      (sum, w) => sum + (w.caloriesBurned || 0),
      0
    );
    const averagePerWorkout =
      filteredWorkouts.length > 0 ? totalCalories / filteredWorkouts.length : 0;

    const daysDiff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const averagePerDay = daysDiff > 0 ? totalCalories / daysDiff : 0;

    // Find best day
    const dailyCalories: { [key: string]: number } = {};
    filteredWorkouts.forEach((workout) => {
      const dateKey = normalizeDate(workout.date).toISOString().split("T")[0];
      dailyCalories[dateKey] =
        (dailyCalories[dateKey] || 0) + (workout.caloriesBurned || 0);
    });

    const bestDay = Object.entries(dailyCalories).reduce(
      (best, [date, calories]) =>
        calories > best.calories ? { date, calories } : best,
      { date: "", calories: 0 }
    );

    // Top exercises by calories
    const exerciseCalories: {
      [key: string]: { calories: number; count: number };
    } = {};
    filteredWorkouts.forEach((workout) => {
      if (!exerciseCalories[workout.exercise]) {
        exerciseCalories[workout.exercise] = { calories: 0, count: 0 };
      }
      exerciseCalories[workout.exercise].calories +=
        workout.caloriesBurned || 0;
      exerciseCalories[workout.exercise].count += 1;
    });

    const topExercises = Object.entries(exerciseCalories)
      .map(([exercise, data]) => ({ exercise, ...data }))
      .sort((a, b) => b.calories - a.calories)
      .slice(0, 5);

    // Weekly and monthly trends
    const weeklyTrend = calculateCalorieTrend(filteredWorkouts, "weekly");
    const monthlyTrend = calculateCalorieTrend(filteredWorkouts, "monthly");

    return {
      totalCalories: Math.round(totalCalories),
      averagePerWorkout: Math.round(averagePerWorkout),
      averagePerDay: Math.round(averagePerDay),
      bestDay,
      topExercises,
      weeklyTrend,
      monthlyTrend,
    };
  } catch (error) {
    logger.error("Error generating calorie burn insights", { error });
    return {
      totalCalories: 0,
      averagePerWorkout: 0,
      averagePerDay: 0,
      bestDay: { date: "", calories: 0 },
      topExercises: [],
      weeklyTrend: [],
      monthlyTrend: [],
    };
  }
};

/**
 * Calculate calorie trends (weekly or monthly)
 */
const calculateCalorieTrend = (
  workouts: WorkoutLog[],
  type: "weekly" | "monthly"
): number[] => {
  const periods = type === "weekly" ? 12 : 6;
  const trend: number[] = [];

  for (let i = periods - 1; i >= 0; i--) {
    const periodStart = new Date();
    if (type === "weekly") {
      periodStart.setDate(periodStart.getDate() - i * 7 - periodStart.getDay());
    } else {
      periodStart.setMonth(periodStart.getMonth() - i, 1);
    }
    periodStart.setHours(0, 0, 0, 0);

    const periodEnd = new Date(periodStart);
    if (type === "weekly") {
      periodEnd.setDate(periodStart.getDate() + 6);
    } else {
      periodEnd.setMonth(periodStart.getMonth() + 1, 0);
    }
    periodEnd.setHours(23, 59, 59, 999);

    const periodWorkouts = workouts.filter((workout) => {
      const workoutDate = normalizeDate(workout.date);
      return workoutDate >= periodStart && workoutDate <= periodEnd;
    });

    const periodCalories = periodWorkouts.reduce(
      (sum, w) => sum + (w.caloriesBurned || 0),
      0
    );
    trend.push(Math.round(periodCalories));
  }

  return trend;
};

/**
 * Analyze workout frequency patterns
 */
export const analyzeWorkoutFrequency = async (
  period: AnalyticsPeriod
): Promise<WorkoutFrequencyAnalysis> => {
  try {
    const workouts = await getUserWorkouts(1000);
    const { start, end } = getDateRange(period);

    const filteredWorkouts = workouts.filter((workout) => {
      const workoutDate = normalizeDate(workout.date);
      return workoutDate >= start && workoutDate <= end;
    });

    const totalWorkouts = filteredWorkouts.length;
    const daysDiff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const weeksDiff = daysDiff / 7;
    const monthsDiff = daysDiff / 30;

    const averagePerWeek = weeksDiff > 0 ? totalWorkouts / weeksDiff : 0;
    const averagePerMonth = monthsDiff > 0 ? totalWorkouts / monthsDiff : 0;

    // Day of week analysis
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const weeklyDistribution: { [key: string]: number } = {};
    dayNames.forEach((day) => (weeklyDistribution[day] = 0));

    // Hour of day analysis
    const hourlyDistribution: { [key: number]: number } = {};
    for (let i = 0; i < 24; i++) {
      hourlyDistribution[i] = 0;
    }

    filteredWorkouts.forEach((workout) => {
      const workoutDate = normalizeDate(workout.date);
      const dayName = dayNames[workoutDate.getDay()];
      const hour = workoutDate.getHours();

      weeklyDistribution[dayName]++;
      hourlyDistribution[hour]++;
    });

    const mostActiveDay = Object.entries(weeklyDistribution).reduce(
      (max, [day, count]) => (count > max.count ? { day, count } : max),
      { day: "", count: 0 }
    ).day;

    const mostActiveHour = Object.entries(hourlyDistribution).reduce(
      (max, [hour, count]) =>
        count > max.count ? { hour: parseInt(hour), count } : max,
      { hour: 0, count: 0 }
    ).hour;

    // Calculate consistency score (0-100)
    const expectedWorkoutsPerWeek = 3; // Baseline expectation
    const actualWorkoutsPerWeek = averagePerWeek;
    const consistencyScore = Math.min(
      100,
      (actualWorkoutsPerWeek / expectedWorkoutsPerWeek) * 100
    );

    return {
      totalWorkouts,
      averagePerWeek: Math.round(averagePerWeek * 10) / 10,
      averagePerMonth: Math.round(averagePerMonth * 10) / 10,
      mostActiveDay,
      mostActiveHour,
      consistencyScore: Math.round(consistencyScore),
      weeklyDistribution,
      hourlyDistribution,
    };
  } catch (error) {
    logger.error("Error analyzing workout frequency", { error });
    return {
      totalWorkouts: 0,
      averagePerWeek: 0,
      averagePerMonth: 0,
      mostActiveDay: "Monday",
      mostActiveHour: 18,
      consistencyScore: 0,
      weeklyDistribution: {},
      hourlyDistribution: {},
    };
  }
};

/**
 * Generate performance insights and recommendations
 */
export const generatePerformanceInsights =
  async (): Promise<PerformanceInsights> => {
    try {
      const workouts = await getUserWorkouts(90); // Last 90 days
      const goals = await getUserGoals();
      const frequencyAnalysis = await analyzeWorkoutFrequency("90d");
      const calorieBurnInsights = await generateCalorieBurnInsights("90d");

      const improvementAreas: string[] = [];
      const strengths: string[] = [];
      const recommendations: string[] = [];
      const riskFactors: string[] = [];

      // Analyze consistency
      if (frequencyAnalysis.consistencyScore < 50) {
        improvementAreas.push("Workout Consistency");
        recommendations.push(
          "Try to maintain at least 3 workouts per week for better results"
        );
      } else if (frequencyAnalysis.consistencyScore > 80) {
        strengths.push("Excellent Workout Consistency");
      }

      // Analyze calorie burn
      if (calorieBurnInsights.averagePerWorkout < 200) {
        improvementAreas.push("Workout Intensity");
        recommendations.push(
          "Consider increasing workout intensity or duration to burn more calories"
        );
      } else if (calorieBurnInsights.averagePerWorkout > 400) {
        strengths.push("High-Intensity Workouts");
      }

      // Analyze goal achievement
      const activeGoals = goals.customGoals.filter((g) => g.isActive);
      const achievingGoals = activeGoals.filter(
        (g) => g.currentValue / g.target >= 0.8
      );

      if (achievingGoals.length / activeGoals.length > 0.7) {
        strengths.push("Strong Goal Achievement");
      } else if (achievingGoals.length / activeGoals.length < 0.3) {
        improvementAreas.push("Goal Achievement");
        recommendations.push(
          "Consider adjusting your goals to be more achievable or increase your effort"
        );
      }

      // Check for overtraining risk
      if (frequencyAnalysis.averagePerWeek > 6) {
        riskFactors.push("Potential Overtraining");
        recommendations.push(
          "Make sure to include rest days in your routine to prevent burnout"
        );
      }

      // Check for workout variety
      const uniqueExercises = new Set(workouts.map((w) => w.exercise)).size;
      if (uniqueExercises < 3) {
        improvementAreas.push("Exercise Variety");
        recommendations.push(
          "Try incorporating different types of exercises to work various muscle groups"
        );
      } else if (uniqueExercises > 8) {
        strengths.push("Great Exercise Variety");
      }

      // Generate motivational message
      let motivationalMessage = "Keep up the great work! ";
      if (strengths.length > improvementAreas.length) {
        motivationalMessage +=
          "You're showing excellent progress across multiple areas. Stay consistent and you'll reach your goals!";
      } else if (improvementAreas.length > 0) {
        motivationalMessage += `Focus on improving your ${improvementAreas[0].toLowerCase()} and you'll see great results!`;
      } else {
        motivationalMessage +=
          "You're doing well! Keep pushing yourself and stay committed to your fitness journey.";
      }

      return {
        improvementAreas,
        strengths,
        recommendations,
        riskFactors,
        motivationalMessage,
      };
    } catch (error) {
      logger.error("Error generating performance insights", { error });
      return {
        improvementAreas: [],
        strengths: [],
        recommendations: [],
        riskFactors: [],
        motivationalMessage: "Keep working towards your fitness goals!",
      };
    }
  };

/**
 * Get comprehensive analytics dashboard
 */
export const getAnalyticsDashboard = async (
  period: AnalyticsPeriod = "30d"
): Promise<AnalyticsDashboard> => {
  try {
    const [
      workoutTrends,
      goalAnalytics,
      calorieBurnInsights,
      frequencyAnalysis,
      performanceInsights,
    ] = await Promise.all([
      generateWorkoutTrends(period),
      analyzeGoalPerformance(),
      generateCalorieBurnInsights(period),
      analyzeWorkoutFrequency(period),
      generatePerformanceInsights(),
    ]);

    // Calculate streak analysis
    const workouts = await getUserWorkouts(365);
    const streakAnalysis = calculateStreakAnalysis(workouts);

    // Generate predictive insights
    const predictiveInsights = generatePredictiveInsights(
      workouts,
      goalAnalytics,
      frequencyAnalysis
    );

    return {
      period,
      workoutTrends,
      goalAnalytics,
      calorieBurnInsights,
      frequencyAnalysis,
      performanceInsights,
      streakAnalysis,
      predictiveInsights,
    };
  } catch (error) {
    logger.error("Error getting analytics dashboard", { error });
    throw new Error("Failed to load analytics dashboard");
  }
};

/**
 * Calculate streak analysis
 */
const calculateStreakAnalysis = (workouts: WorkoutLog[]) => {
  const sortedWorkouts = workouts
    .map((w) => normalizeDate(w.date))
    .sort((a, b) => b.getTime() - a.getTime());

  const workoutDates = new Set(sortedWorkouts.map((d) => d.toDateString()));
  const uniqueDates = Array.from(workoutDates)
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  const streakHistory: { start: string; end: string; length: number }[] = [];

  // Calculate current streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(today);

  for (const workoutDate of uniqueDates) {
    const daysDiff = Math.floor(
      (checkDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === currentStreak || (currentStreak === 0 && daysDiff <= 1)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak and history
  let tempStreak = 1;
  let streakStart = uniqueDates[0];

  for (let i = 1; i < uniqueDates.length; i++) {
    const daysDiff = Math.floor(
      (uniqueDates[i - 1].getTime() - uniqueDates[i].getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      tempStreak++;
    } else {
      if (tempStreak > 1) {
        streakHistory.push({
          start: uniqueDates[i].toISOString().split("T")[0],
          end: streakStart.toISOString().split("T")[0],
          length: tempStreak,
        });
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
      streakStart = uniqueDates[i];
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    streakHistory: streakHistory.slice(0, 10), // Last 10 streaks
  };
};

/**
 * Generate predictive insights
 */
const generatePredictiveInsights = (
  _workouts: WorkoutLog[],
  goalAnalytics: GoalAnalytics[],
  frequencyAnalysis: WorkoutFrequencyAnalysis
) => {
  // Calculate weekly goal likelihood based on current progress
  const weeklyGoals = goalAnalytics.filter((g) => g.category === "workout");
  const weeklyGoalLikelihood =
    weeklyGoals.length > 0
      ? weeklyGoals.reduce((sum, g) => sum + g.completionRate, 0) /
        weeklyGoals.length
      : 50;

  // Calculate monthly goal likelihood
  const monthlyGoalLikelihood = Math.min(100, weeklyGoalLikelihood * 1.2);

  // Suggest workout days based on historical patterns
  const suggestedWorkoutDays = Object.entries(
    frequencyAnalysis.weeklyDistribution
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([day]) => day);

  // Calculate burnout risk
  let burnoutRisk: "low" | "medium" | "high" = "low";
  if (frequencyAnalysis.averagePerWeek > 6) {
    burnoutRisk = "high";
  } else if (
    frequencyAnalysis.averagePerWeek > 4 &&
    frequencyAnalysis.consistencyScore < 60
  ) {
    burnoutRisk = "medium";
  }

  return {
    weeklyGoalLikelihood: Math.round(weeklyGoalLikelihood),
    monthlyGoalLikelihood: Math.round(monthlyGoalLikelihood),
    suggestedWorkoutDays,
    burnoutRisk,
  };
};
