import Papa from 'papaparse';

// Nutrient ID configuration
interface NutrientConfig {
  [key: string]: {
    id: string;
    name: string;
    unit: string;
  };
}

// Default nutrient mappings (can be overridden by environment/config)
const DEFAULT_NUTRIENT_MAPPING: NutrientConfig = {
  calories: {
    id: '208',
    name: 'Energy',
    unit: 'kcal'
  },
  protein: {
    id: '203',
    name: 'Protein',
    unit: 'g'
  },
  carbs: {
    id: '205',
    name: 'Carbohydrate, by difference',
    unit: 'g'
  },
  fat: {
    id: '204',
    name: 'Total lipid (fat)',
    unit: 'g'
  }
};

interface FoodItem {
  foodCode: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Cache for food items to avoid repeated CSV parsing
// Using Map for O(1) lookups by foodCode
let foodItemsCache: Map<string, FoodItem> | null = null;

// Helper function to load and parse CSV file
async function loadCSVFile<T>(path: string): Promise<T[]> {
  try {
    console.log(`Loading CSV file: ${path}`);
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
    }
    
    // Validate content-type header
    const contentType = response.headers.get('content-type')?.toLowerCase() || '';
    const isValidCSV = [
      'text/csv',
      'application/csv',
      'text/comma-separated-values',
      'application/vnd.ms-excel'
    ].some(type => contentType.includes(type));
    
    if (!isValidCSV) {
      throw new Error(`Unexpected content-type '${contentType}' when loading ${path}. Expected a CSV file.`);
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
  // Ensure database is initialized
  if (!isInitialized) {
    try {
      console.log('Food database not initialized, initializing...');
      await initFoodDatabase();
    } catch (error) {
      console.error('Failed to initialize food database:', error);
      // Return null instead of throwing to be more resilient in the UI
      // The error is already logged above
      return null;
    }
  }
  try {
    console.log(`Looking up food code: ${foodCode}`);
    
    // Load food items if not already loaded
    if (!foodItemsCache) {
      console.log('Loading food items...');
      await loadFoodItems();
    }
    
    if (!foodItemsCache || foodItemsCache.size === 0) {
      console.error('No food items loaded in cache');
      return null;
    }
    
    console.log(`Total food items in cache: ${foodItemsCache.size}`);
    
    // Find the food item by code (case-insensitive and trim any whitespace)
    const normalizedCode = foodCode.trim().toLowerCase();
    const item = foodItemsCache.get(normalizedCode);
    
    if (!item) {
      // Log first 5 food codes for debugging
      const firstFiveCodes = Array.from(foodItemsCache.keys()).slice(0, 5);
      console.log(`Food code ${foodCode} not found. First 5 food codes:`, firstFiveCodes);
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
    
    // Validate food data structure
    if (!foodNameData.length) {
      throw new Error('No food data found in the CSV file');
    }

    const firstFood = foodNameData[0];
    const availableKeys = Object.keys(firstFood);
    
    // Helper function to find and validate column name
    const findColumn = (possibleNames: string[], availableKeys: string[]): string => {
      const key = possibleNames.find(name => 
        availableKeys.some(k => k.toLowerCase() === name.toLowerCase())
      );
      
      if (!key) {
        console.warn(`Could not find any of these columns: ${possibleNames.join(', ')}`);
        console.log('Available columns:', availableKeys);
        return '';
      }
      
      return key;
    };

    // Find required columns with fallbacks for food data
    const foodIdKey = findColumn(['FoodID', 'FoodCode', 'food_id', 'foodid', 'foodId'], availableKeys);
    const foodDescKey = findColumn(['FoodDescription', 'Description', 'food_desc', 'fooddescription', 'foodName'], availableKeys);
    
    // Log the column detection results
    console.log('Detected columns:', { foodIdKey, foodDescKey });
    
    // Verify we have all required columns
    if (!foodIdKey || !foodDescKey) {
      throw new Error(`Missing required columns. Found: ${availableKeys.join(', ')}`);
    }
    
    console.log(`Using column names: '${foodIdKey}' for ID, '${foodDescKey}' for description`);
    
    // Load and parse the NUTRIENT AMOUNT.csv file
    interface NutrientEntry {
      [key: string]: string | number | undefined;
      FoodID: string;
      NutrientID: string;
      NutrientValue: string;
      StandardError?: string;
      NumberofObservations?: string;
      NutrientSourceID?: string;
      NutrientDateOfEntry?: string;
    }
    
    const nutrientData = await loadCSVFile<NutrientEntry>('/cnf-fcen-csv/NUTRIENT AMOUNT.csv');
    
    // Log the first entry to see the actual structure
    console.log('First nutrient entry:', nutrientData[0]);
    
    // Validate nutrient data structure
    if (!nutrientData.length) {
      throw new Error('No nutrient data found in the CSV file');
    }

    const firstNutrient = nutrientData[0];
    const availableNutrientKeys = Object.keys(firstNutrient);
    
    // Find required nutrient columns with fallbacks
    const nutrientIdKey = findColumn(['NutrientID', 'nutrient_id', 'nutrientid'], availableNutrientKeys);
    const nutrientValueKey = findColumn(['NutrientValue', 'Value', 'nutrient_value'], availableNutrientKeys);
    const nutrientFoodIdKey = findColumn(['FoodID', 'food_id', 'foodid', 'FoodCode'], availableNutrientKeys);
    
    console.log('Nutrient columns:', { nutrientIdKey, nutrientValueKey, nutrientFoodIdKey });
    
    // Verify required columns exist
    const requiredColumns = [nutrientIdKey, nutrientValueKey, nutrientFoodIdKey];
    const missingColumns = requiredColumns.filter(col => !availableNutrientKeys.includes(col));
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}. Available columns: ${availableNutrientKeys.join(', ')}`);
    }
    
    // Verify we have all required columns
    if (!nutrientIdKey || !nutrientValueKey) {
      throw new Error(`Missing required nutrient columns. Found: ${availableNutrientKeys.join(', ')}`);
    }
    
    console.log(`Using column names: '${nutrientIdKey}' for nutrient ID, '${nutrientValueKey}' for value`);
    
    // Scan and map all available nutrients
    const nutrientIdSet = new Set<string>();
    const nutrientNameMap = new Map<string, Set<string>>();
    
    // Log first few nutrient entries for debugging
    console.log('First few nutrient entries:', nutrientData.slice(0, 3));
    
    // First, detect the actual column name for nutrient name if not already determined
    let nutrientNameKey: string | undefined;
    const possibleNutrientNameKeys = ['NutrientName', 'Nutrient_Name', 'NUTRIENTNAME', 'nutrientname', 'nutrient_name'];
    
    // Try to find the correct nutrient name key from the first valid row
    if (nutrientData.length > 0) {
      const firstRow = nutrientData[0];
      nutrientNameKey = possibleNutrientNameKeys.find(key => key in firstRow);
    }
    
    if (!nutrientNameKey) {
      console.warn('Could not determine nutrient name column, falling back to default');
      nutrientNameKey = 'NutrientName';
    }
    
    console.log(`Using '${nutrientNameKey}' as the nutrient name column`);
    
    // Process each nutrient entry
    for (const nutrient of nutrientData) {
      try {
        // Safely get the ID using the known key
        const id = String(nutrient[nutrientIdKey as keyof NutrientEntry] ?? '').trim();
        if (!id) continue;
        
        // Safely get the name using the detected key with fallback
        const name = String(nutrient[nutrientNameKey as keyof NutrientEntry] ?? '').trim().toLowerCase();
        if (!name) continue;
        
        nutrientIdSet.add(id);
        
        if (!nutrientNameMap.has(name)) {
          nutrientNameMap.set(name, new Set());
        }
        nutrientNameMap.get(name)?.add(id);
      } catch (error) {
        console.error('Error processing nutrient entry:', error, nutrient);
      }
    }
    
    // Create a map of nutrient IDs to their info
    const availableNutrientIds = Array.from(nutrientIdSet);
    console.log(`Found ${availableNutrientIds.length} unique nutrient IDs`);
    
    // Helper function to find best matching nutrient ID
    const findBestNutrientId = (config: { id: string; name: string }): string => {
      // First try the configured ID
      if (nutrientIdSet.has(config.id)) {
        return config.id;
      }
      
      // Try to find by name
      const nameKey = config.name.toLowerCase();
      if (nutrientNameMap.has(nameKey)) {
        const ids = Array.from(nutrientNameMap.get(nameKey) || []);
        if (ids.length > 0) {
          console.warn(`Using alternative ID ${ids[0]} for ${config.name} (original: ${config.id})`);
          return ids[0];
        }
      }
      
      // Try partial name match
      for (const [name, ids] of nutrientNameMap.entries()) {
        if (name.includes(nameKey) || nameKey.includes(name)) {
          const idArray = Array.from(ids);
          console.warn(`Using partial match ${idArray[0]} for ${config.name} (original: ${config.id})`);
          return idArray[0];
        }
      }
      
      console.warn(`No match found for nutrient: ${config.name} (ID: ${config.id})`);
      return '';
    };
    
    // Build the final nutrient mapping
    const nutrientMapping: { [key: string]: string } = {};
    
    Object.entries(DEFAULT_NUTRIENT_MAPPING).forEach(([key, config]) => {
      const bestId = findBestNutrientId(config);
      if (bestId) {
        nutrientMapping[key] = bestId;
      } else {
        console.warn(`No valid ID found for ${config.name}, will use 0`);
        nutrientMapping[key] = ''; // Will be handled in getNutrientValue
      }
    });
    
    console.log('Using nutrient mapping:', nutrientMapping);
    
    // Create a map of food IDs to their nutrients for O(1) lookup
    const nutrientMap = new Map<string, NutrientEntry[]>();
  
    // First pass: Build the nutrient map
    for (const nutrient of nutrientData) {
      try {
        const foodId = String(nutrient[nutrientFoodIdKey as keyof NutrientEntry] || '').trim().toLowerCase();
        if (!foodId) continue;
        
        if (!nutrientMap.has(foodId)) {
          nutrientMap.set(foodId, []);
        }
        nutrientMap.get(foodId)!.push(nutrient);
      } catch (error) {
        console.error('Error processing nutrient entry:', error, nutrient);
      }
    }
  
    console.log(`Built nutrient map with ${nutrientMap.size} unique food IDs`);
    
    // Create a new Map for food items
    const foodItemsMap = new Map<string, FoodItem>();
    let validItems = 0;
    
    // Process and store food items in the Map
    console.log(`Processing ${foodNameData.length} food items...`);
    
    // Process all food items
    for (let i = 0; i < foodNameData.length; i++) {
      const food = foodNameData[i];
      const foodId = food[foodIdKey as keyof typeof food] as string;
      const foodDesc = food[foodDescKey as keyof typeof food] as string;
      
      // Skip entries with missing required fields
      if (!foodId) {
        console.warn('Skipping food entry missing food ID');
        continue;
      }
      
      if (!foodDesc) {
        console.warn(`Skipping food entry with ID ${foodId} missing description`);
        continue;
      }
      
      const normalizedCode = String(foodId).trim().toLowerCase();
      if (foodItemsMap.has(normalizedCode)) {
        console.warn(`Duplicate food code found: ${normalizedCode}`);
        continue;
      }
      
      // Debug log for the first few items
      if (validItems < 3) {
        console.log('Processing food item:', { foodId, foodDesc, normalizedCode });
      }
      
      // Get nutrients for this food item using the pre-built map
      const nutrients = nutrientMap.get(normalizedCode) || [];
      
      // Log details for first few items and every 1000th item
      if (i < 3 || i % 1000 === 0) {
        console.log(`Processing food item ${i + 1}/${foodNameData.length}: ID ${foodId}, Nutrients found:`, nutrients.length);
      }
      
      // Helper function to get nutrient value by type (calories, protein, etc.)
      const getNutrientValue = (type: keyof typeof DEFAULT_NUTRIENT_MAPPING): number => {
        try {
          const config = DEFAULT_NUTRIENT_MAPPING[type];
          if (!config) {
            console.warn(`No configuration found for nutrient type: ${type}`);
            return 0;
          }
          
          const targetNutrientId = config.id;
          if (!targetNutrientId) {
            console.warn(`No nutrient ID configured for ${type}`);
            return 0;
          }
          
          // Debug log for the first few lookups
          if (i < 3) {
            console.log(`Looking for ${type} (ID: ${targetNutrientId}) in food ${foodId}...`);
          }
          
          // Find the nutrient entry that matches our target ID
          const nutrient = nutrients.find((n: any) => {
            try {
              const currentId = String(n[nutrientIdKey as keyof NutrientEntry] || '').trim();
              return currentId === targetNutrientId;
            } catch (error) {
              console.error('Error processing nutrient entry:', error, n);
              return false;
            }
          });
          
          if (!nutrient) {
            if (i < 3) { // Only log for first few items to avoid console spam
              console.warn(`Nutrient ${type} (${config.name}, ID: ${targetNutrientId}) not found for food ${foodId}`);
              console.log('Available nutrient IDs:', nutrients.map((n: any) => ({
                id: n[nutrientIdKey as keyof NutrientEntry],
                name: n[nutrientNameKey as keyof NutrientEntry] || 'unknown'
              })));
            }
            return 0;
          }
          
          // Safely parse the nutrient value
          const rawValue = nutrient[nutrientValueKey as keyof NutrientEntry];
          const valueStr = String(rawValue ?? '0').trim();
          const value = parseFloat(valueStr);
          
          if (isNaN(value)) {
            console.warn(`Invalid numeric value for ${type}: '${valueStr}' (raw: '${rawValue}')`);
            return 0;
          }
          
          if (i < 3) { // Log first few successful lookups
            console.log(`Found ${type}: ${value} ${config.unit} for food ${foodId}`);
          }
          
          return value;
        } catch (error) {
          console.error(`Error getting ${type} for food ${foodId}:`, error);
          return 0;
        }
      };
      
      const foodItem: FoodItem = {
        foodCode: String(foodId).trim(),
        foodName: String(foodDesc).trim(),
        calories: getNutrientValue('calories'),
        protein: getNutrientValue('protein'),
        carbs: getNutrientValue('carbs'),
        fat: getNutrientValue('fat'),
      };
      
      // Only add if we have a valid food code and name
      if (foodItem.foodCode && foodItem.foodName) {
        foodItemsMap.set(normalizedCode, foodItem);
        validItems++;
      }
    }
    
    foodItemsCache = foodItemsMap;
    
    console.log(`Successfully loaded ${validItems} food items from database`);
    if (validItems > 0) {
      const firstItem = foodItemsCache.values().next().value;
      console.log('First food item:', JSON.stringify(firstItem, null, 2));
    }
  } catch (error) {
    console.error('Error loading food database:', error);
    throw new Error('Failed to load food database');
  }
};

// Initialization state
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;
let initializationAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;
const INIT_RETRY_BASE_DELAY_MS = 1000; // 1 second base delay for exponential backoff
let lastInitError: Error | null = null;
let lastInitAttemptTime = 0;

/**
 * Calculates the delay for the next retry attempt using exponential backoff
 * @param attempt The current attempt number (1-based)
 * @returns Delay in milliseconds
 */
const getBackoffDelay = (attempt: number): number => {
  return Math.min(
    INIT_RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1),
    30000 // Max 30 seconds
  );
};

export const initFoodDatabase = async (): Promise<void> => {
  const currentTime = Date.now();
  
  // If already initialized, return immediately
  if (isInitialized) {
    return;
  }

  // If we've exceeded max attempts and it's been less than 5 minutes since last attempt
  if (initializationAttempts >= MAX_INIT_ATTEMPTS) {
    const timeSinceLastAttempt = currentTime - lastInitAttemptTime;
    const retryAfterMs = getBackoffDelay(MAX_INIT_ATTEMPTS);
    
    if (timeSinceLastAttempt < retryAfterMs) {
      const timeUntilRetry = Math.ceil((retryAfterMs - timeSinceLastAttempt) / 1000);
      throw new Error(
        `Food database initialization failed after ${MAX_INIT_ATTEMPTS} attempts. ` +
        `Last error: ${lastInitError?.message || 'Unknown error'}. ` +
        `Retry in ${timeUntilRetry} seconds.`
      );
    }
    
    // If we're past the backoff period, reset attempts
    initializationAttempts = 0;
  }

  // If initialization is already in progress, return the existing promise
  if (initializationPromise) {
    return initializationPromise;
  }

  // Increment attempt counter and update last attempt time
  initializationAttempts++;
  lastInitAttemptTime = currentTime;
  
  // Create a new promise for initialization
  initializationPromise = (async () => {
    try {
      console.log(`Initializing food database (attempt ${initializationAttempts}/${MAX_INIT_ATTEMPTS})...`);
      
      // If this is a retry, wait for the backoff period
      if (initializationAttempts > 1) {
        const delay = getBackoffDelay(initializationAttempts - 1);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      await loadFoodItems();
      
      // Reset state on successful initialization
      isInitialized = true;
      lastInitError = null;
      initializationAttempts = 0;
      
      console.log('Food database initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      lastInitError = error instanceof Error ? error : new Error(String(error));
      
      console.error(`Food database initialization failed (attempt ${initializationAttempts}/${MAX_INIT_ATTEMPTS}):`, error);
      
      // Clear the promise so we can retry
      initializationPromise = null;
      
      if (initializationAttempts >= MAX_INIT_ATTEMPTS) {
        throw new Error(
          `Failed to initialize food database after ${MAX_INIT_ATTEMPTS} attempts. ` +
          `Last error: ${errorMessage}`
        );
      }
      
      // Re-throw to allow the caller to handle the retry logic
      throw error;
    } finally {
      // Clear the promise in finally to ensure it's always cleared, even on success
      if (!isInitialized) {
        initializationPromise = null;
      }
    }
  })();

  return initializationPromise;
};

/**
 * Checks if the food database is ready for queries.
 * @returns Promise that resolves to true if the database is ready
 */
export async function checkDatabaseReady(): Promise<boolean> {
  if (isInitialized) {
    return true;
  }
  
  try {
    await initFoodDatabase();
    return true;
  } catch (error) {
    console.error('Database initialization check failed:', error);
    return false;
  }
}

/**
 * @deprecated Use checkDatabaseReady() instead for proper async initialization checking. 
 * Will be removed in v2.0.0.
 */
export function isFoodDatabaseInitialized(): boolean {
  console.warn('isFoodDatabaseInitialized() is deprecated and will be removed in v2.0.0. Use checkDatabaseReady() instead.');
  return isInitialized;
}
