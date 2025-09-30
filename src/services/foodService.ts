/**
 * Food Service - Food Entry and Calorie Tracking
 *
 * This service manages all food-related data operations:
 * - Adding, retrieving, updating, and deleting food entries
 * - Calorie and macronutrient tracking
 * - Daily food intake management
 * - Integration with calorie tracking features
 *
 * The service supports detailed nutritional tracking including
 * calories, protein, carbohydrates, and fat content for each food entry.
 */

import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Interface for individual food entry records
 */
export interface FoodEntry {
  id?: string; // Firestore document ID
  userId: string; // Firebase Auth user ID
  name: string; // Name of the food item
  calories: number; // Calories per serving
  protein: number; // Protein content in grams
  carbs: number; // Carbohydrate content in grams
  fat: number; // Fat content in grams
  date: string; // Date consumed (YYYY-MM-DD format)
  time?: string; // Time consumed (HH:MM format)
  timestamp?: Date; // Firestore timestamp for sorting/filtering
}

/**
 * Add a new food entry to the user's food log
 *
 * @param entry - Food entry data (excluding id and timestamp)
 * @returns Promise<FoodEntry> - The created food entry with generated ID
 * @throws Error if the operation fails
 */
export const addFoodEntry = async (
  entry: Omit<FoodEntry, "id" | "timestamp">
): Promise<FoodEntry> => {
  try {
    const docRef = await addDoc(collection(db, "foodEntries"), {
      ...entry,
      timestamp: Timestamp.now(), // Add server timestamp for sorting
    });
    return { id: docRef.id, ...entry };
  } catch (error) {
    console.error("Error adding food entry:", error);
    throw new Error("Failed to add food entry");
  }
};

// Get all food entries for a user
export const getFoodEntries = async (userId: string): Promise<FoodEntry[]> => {
  try {
    const q = query(
      collection(db, "foodEntries"),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore Timestamp to Date if it exists
          timestamp: doc.data().timestamp?.toDate(),
        } as FoodEntry)
    );
  } catch (error) {
    console.error("Error getting food entries:", error);
    throw new Error("Failed to get food entries");
  }
};

// Get food entries for a specific date
export const getFoodEntriesByDate = async (
  userId: string,
  date: string
): Promise<FoodEntry[]> => {
  try {
    const q = query(
      collection(db, "foodEntries"),
      where("userId", "==", userId),
      where("date", "==", date)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        } as FoodEntry)
    );
  } catch (error) {
    console.error("Error getting food entries by date:", error);
    throw new Error("Failed to get food entries by date");
  }
};

// Update a food entry
export const updateFoodEntry = async (
  id: string,
  updates: Partial<Omit<FoodEntry, "id" | "userId" | "timestamp">>
): Promise<void> => {
  try {
    const foodRef = doc(db, "foodEntries", id);
    await updateDoc(foodRef, {
      ...updates,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating food entry:", error);
    throw new Error("Failed to update food entry");
  }
};

// Delete a food entry
export const deleteFoodEntry = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "foodEntries", id));
  } catch (error) {
    console.error("Error deleting food entry:", error);
    throw new Error("Failed to delete food entry");
  }
};

// Get food entries within a date range
export const getFoodEntriesByDateRange = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<FoodEntry[]> => {
  try {
    // Note: This requires a composite index in Firestore
    const q = query(
      collection(db, "foodEntries"),
      where("userId", "==", userId),
      where("date", ">=", startDate),
      where("date", "<=", endDate)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        } as FoodEntry)
    );
  } catch (error) {
    console.error("Error getting food entries by date range:", error);
    throw new Error("Failed to get food entries by date range");
  }
};
