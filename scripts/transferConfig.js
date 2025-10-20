/**
 * Configuration for transferring data from fitness-tracker-00001 to fitness-tracker-clean
 */

export const sourceProjectConfig = {
  // Source project: fitness-tracker-00001
  apiKey: "AIzaSyBqJNWnKvRvkFtXxGzv8Q2J1N9L8M7P6R4",
  authDomain: "fitness-tracker-00001.firebaseapp.com",
  projectId: "fitness-tracker-00001",
  storageBucket: "fitness-tracker-00001.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
};

// All collections to transfer (including food database and any other data)
export const collectionsToTransfer = [
  // Food database collections
  "food_names",
  "nutrient_amounts",
  "nutrient_names",
  "food_groups",
  "conversion_factors",
  "food_sources",
  "measure_names",
  "nutrient_sources",
  "refuse_amounts",
  "refuse_names",
  "yield_amounts",
  "yield_names",

  // User data collections (if any exist)
  "users",
  "userGoals",
  "workouts",
  "workoutPlans",
  "foodEntries",
  "fitnessData",

  // Any other collections that might exist
  "foods",
  "exercises",
  "meals",
  "progress",
  "settings",
];
