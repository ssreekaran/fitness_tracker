import Papa from 'papaparse';

interface FoodItem {
  foodCode: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Cache for food items to avoid repeated CSV parsing
let foodItemsCache: FoodItem[] | null = null;

// Helper function to load and parse CSV file
async function loadCSVFile<T>(path: string): Promise<T[]> {
  try {
    console.log(`Loading CSV file: ${path}`);
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const result = Papa.parse<T>(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    
    if (result.errors.length > 0) {
      console.warn(`Errors parsing ${path}:`, result.errors);
    }
    
    console.log(`Successfully parsed ${result.data.length} rows from ${path}`);
    return result.data;
  } catch (error) {
    console.error(`Error loading ${path}:`, error);
    throw error;
  }
}

export const getFoodByCode = async (foodCode: string): Promise<FoodItem | null> => {
  try {
    console.log(`Looking up food code: ${foodCode}`);
    
    // Load food items if not already loaded
    if (!foodItemsCache) {
      console.log('Loading food items...');
      await loadFoodItems();
    }
    
    if (!foodItemsCache || foodItemsCache.length === 0) {
      console.error('No food items loaded in cache');
      return null;
    }
    
    console.log(`Total food items in cache: ${foodItemsCache.length}`);
    
    // Find the food item by code (case-insensitive and trim any whitespace)
    const normalizedCode = foodCode.trim().toLowerCase();
    const item = foodItemsCache.find(item => 
      item.foodCode.trim().toLowerCase() === normalizedCode
    );
    
    if (!item) {
      console.log(`Food code ${foodCode} not found. First 5 food codes:`, 
        foodItemsCache.slice(0, 5).map(f => f.foodCode));
    } else {
      console.log('Found food item:', item);
    }
    
    return item || null;
  } catch (error) {
    console.error('Error looking up food by code:', error);
    return null;
  }
};

const loadFoodItems = async (): Promise<void> => {
  try {
    console.log('Starting to load food items...');
    
    // Load and parse the FOOD NAME.csv file
    interface FoodNameEntry {
      [key: string]: string | number;
      FOOD_ID: string;
      FOOD_DESC: string;
    }
    
    const foodNameData = await loadCSVFile<FoodNameEntry>('/cnf-fcen-csv/FOOD NAME.csv');
    
    // Log the first entry to see the actual structure
    console.log('First food name entry:', foodNameData[0]);
    
    // Try to determine the correct column names
    const firstFood = foodNameData[0] || {};
    const foodIdKey = Object.keys(firstFood).find(key => 
      key.toLowerCase().includes('food_id') || 
      key.toLowerCase().includes('foodid')
    ) || 'FOOD_ID';
    
    const foodDescKey = Object.keys(firstFood).find(key => 
      key.toLowerCase().includes('food_desc') || 
      key.toLowerCase().includes('fooddescription') ||
      key.toLowerCase().includes('food name')
    ) || 'FOOD_DESC';
    
    console.log(`Using column names: ${foodIdKey} for ID, ${foodDescKey} for description`);
    
    // Load and parse the NUTRIENT AMOUNT.csv file
    interface NutrientEntry {
      [key: string]: string | number;
      FOOD_ID: string;
      NUTRIENT_ID: string;
      NUTRIENT_VALUE: string;
    }
    
    const nutrientData = await loadCSVFile<NutrientEntry>('/cnf-fcen-csv/NUTRIENT AMOUNT.csv');
    
    // Log the first entry to see the actual structure
    console.log('First nutrient entry:', nutrientData[0]);
    
    // Try to determine the correct column names for nutrients
    const firstNutrient = nutrientData[0] || {};
    const nutrientIdKey = Object.keys(firstNutrient).find(key => 
      key.toLowerCase().includes('nutrient_id') || 
      key.toLowerCase().includes('nutrientid')
    ) || 'NUTRIENT_ID';
    
    const nutrientValueKey = Object.keys(firstNutrient).find(key => 
      key.toLowerCase().includes('nutrient_value') || 
      key.toLowerCase().includes('value') ||
      key.toLowerCase().includes('amount')
    ) || 'NUTRIENT_VALUE';
    
    console.log(`Using column names: ${nutrientIdKey} for nutrient ID, ${nutrientValueKey} for value`);
    
    // Log all unique nutrient IDs for reference
    const nutrientIds = [...new Set(nutrientData.map((n: NutrientEntry) => n[nutrientIdKey] as string))];
    console.log('Available nutrient IDs:', nutrientIds.slice(0, 20).sort((a, b) => Number(a) - Number(b)));
    
    // Map food codes to their nutritional information
    foodItemsCache = foodNameData
      .filter((food: FoodNameEntry) => {
        const foodId = food[foodIdKey] as string;
        const foodDesc = food[foodDescKey] as string;
        const hasId = foodId !== undefined && foodId !== '';
        const hasDesc = foodDesc !== undefined && foodDesc !== '';
        
        if (!hasId || !hasDesc) {
          console.warn('Skipping food entry missing required fields:', { foodId, foodDesc });
          return false;
        }
        return true;
      })
      .map((food: FoodNameEntry) => {
        const foodId = food[foodIdKey] as string;
        const nutrients = nutrientData.filter((n: NutrientEntry) => 
          String(n[foodIdKey as keyof NutrientEntry]) === String(foodId)
        );
        
        // Helper function to get nutrient value by ID
        const getNutrientValue = (nutrientId: string): number => {
          const nutrient = nutrients.find((n: NutrientEntry) => 
            String(n[nutrientIdKey as keyof NutrientEntry]) === String(nutrientId)
          );
          
          if (!nutrient) {
            console.warn(`Nutrient ID ${nutrientId} not found for food ${foodId}`);
            return 0;
          }
          
          const value = parseFloat(nutrient[nutrientValueKey as keyof NutrientEntry] as string);
          return isNaN(value) ? 0 : value;
        };
        
        // Common nutrient IDs (Energy, Protein, Carbs, Fat)
        // These might need adjustment based on your specific database
        const foodItem = {
          foodCode: String(food[foodIdKey]).trim(),
          foodName: String(food[foodDescKey]).trim(),
          calories: getNutrientValue('208'), // Energy (kcal)
          protein: getNutrientValue('203'),  // Protein (g)
          carbs: getNutrientValue('205'),    // Carbohydrate (g)
          fat: getNutrientValue('204'),      // Total Fat (g)
        };
        
        return foodItem;
      })
      .filter((item: FoodItem) => item.foodCode && item.foodName); // Filter out any invalid entries
    
    console.log(`Successfully loaded ${foodItemsCache.length} food items from database`);
    if (foodItemsCache.length > 0) {
      console.log('First food item:', JSON.stringify(foodItemsCache[0], null, 2));
    }
  } catch (error) {
    console.error('Error loading food database:', error);
    throw new Error('Failed to load food database');
  }
};

// Preload food items when the module is imported
loadFoodItems().catch(console.error);
