import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

interface FoodItem {
  foodCode: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Nutrient {
  NutrientID: string;
  NutrientValue: string;
}

// Cache for food items
let foodItemsCache: Map<string, FoodItem> | null = null;

export const getFoodByCode = async (
  foodCode: string
): Promise<FoodItem | null> => {
  if (!isInitialized) {
    try {
      console.log("Food database not initialized, initializing...");
      await initFoodDatabase();
    } catch (error) {
      console.error("Failed to initialize food database:", error);
      return null;
    }
  }

  try {
    console.log(`Looking up food code: ${foodCode}`);

    if (!foodItemsCache) {
      console.log("Loading food items...");
      await loadFoodItems();
    }

    if (!foodItemsCache || foodItemsCache.size === 0) {
      console.error("No food items loaded in cache");
      return null;
    }

    const normalizedCode = foodCode.trim().toLowerCase();
    const item = foodItemsCache.get(normalizedCode);

    if (!item) {
      const firstFiveCodes = Array.from(foodItemsCache.keys()).slice(0, 5);
      console.log(
        `Food code ${foodCode} not found. First 5 food codes:`,
        firstFiveCodes
      );
    } else {
      console.log("Found food item:", item);
    }

    return item || null;
  } catch (error) {
    console.error("Error looking up food by code:", error);
    return null;
  }
};

const loadFoodItems = async (): Promise<void> => {
  try {
    console.log("Loading food items from Firestore...");

    // Load foods from the transferred collection
    const foodsCollection = collection(db, "foods");
    const snapshot = await getDocs(foodsCollection);

    if (snapshot.empty) {
      throw new Error("No food data found in Firestore");
    }

    console.log(`Found ${snapshot.size} food items in Firestore`);

    const foodItemsMap = new Map<string, FoodItem>();
    let validItems = 0;

    snapshot.docs.forEach((doc) => {
      try {
        const data = doc.data();

        // Extract nutritional values from the Nutrients array
        const nutrients = data.Nutrients || [];

        // Helper function to find nutrient value by ID
        const getNutrientValue = (nutrientId: string): number => {
          const nutrient = nutrients.find(
            (n: Nutrient) => n.NutrientID === nutrientId
          );
          return nutrient ? parseFloat(nutrient.NutrientValue || "0") : 0;
        };

        // Map nutrient IDs to their values
        // Common Canadian Nutrient File IDs:
        // 208 = Energy (kcal)
        // 203 = Protein
        // 205 = Carbohydrate
        // 204 = Total Fat

        // Convert FoodID to string (it's stored as a number in Firestore)
        const foodCode = String(data.FoodID || doc.id);

        const foodItem: FoodItem = {
          foodCode: foodCode,
          foodName: data.FoodDescription || "Unknown Food",
          calories: getNutrientValue("208"), // Energy in kcal
          protein: getNutrientValue("203"), // Protein
          carbs: getNutrientValue("205"), // Carbohydrate
          fat: getNutrientValue("204"), // Total Fat
        };

        if (foodItem.foodCode && foodItem.foodName) {
          const normalizedCode = foodItem.foodCode.trim().toLowerCase();
          foodItemsMap.set(normalizedCode, foodItem);
          validItems++;
        }
      } catch (error) {
        console.error("Error processing food item:", error, doc.data());
      }
    });

    foodItemsCache = foodItemsMap;

    console.log(`Successfully loaded ${validItems} food items from Firestore`);
    if (validItems > 0) {
      const firstItem = foodItemsCache.values().next().value;
      console.log("First food item:", JSON.stringify(firstItem, null, 2));
    }
  } catch (error) {
    console.error("Error loading food database from Firestore:", error);
    throw new Error("Failed to load food database from Firestore");
  }
};

// Initialization state
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

export const initFoodDatabase = async (): Promise<void> => {
  if (isInitialized) {
    return;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log("Initializing food database from Firestore...");
      await loadFoodItems();
      isInitialized = true;
      console.log("Food database initialized successfully");
    } catch (error) {
      console.error("Food database initialization failed:", error);
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
};

export async function checkDatabaseReady(): Promise<boolean> {
  if (isInitialized) {
    return true;
  }

  try {
    await initFoodDatabase();
    return true;
  } catch (error) {
    console.error("Database initialization check failed:", error);
    return false;
  }
}

/**
 * Search for foods by name
 */
export async function searchFoodsByName(
  searchTerm: string,
  maxResults: number = 20
): Promise<FoodItem[]> {
  try {
    if (!isInitialized) {
      await initFoodDatabase();
    }

    if (!foodItemsCache) {
      return [];
    }

    const searchLower = searchTerm.toLowerCase();
    const results: FoodItem[] = [];

    for (const [, item] of foodItemsCache.entries()) {
      if (item.foodName.toLowerCase().includes(searchLower)) {
        results.push(item);
        if (results.length >= maxResults) {
          break;
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Error searching foods by name:", error);
    return [];
  }
}

export function isFoodDatabaseInitialized(): boolean {
  console.warn(
    "isFoodDatabaseInitialized() is deprecated and will be removed in v2.0.0. Use checkDatabaseReady() instead."
  );
  return isInitialized;
}
