import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp, 
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';

export interface FitnessData {
  userId: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  sex: 'male' | 'female';
  bmi?: number;
  lastUpdated: Timestamp | Date;
}

export const saveFitnessData = async (
  data: Omit<FitnessData, 'userId' | 'lastUpdated' | 'bmi'> & { weight: number },
  heightUnit: 'cm' | 'in' = 'cm',
  weightUnit: 'kg' | 'lbs' = 'kg'
): Promise<FitnessData> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Convert height to cm if needed
    const heightInCm = heightUnit === 'in' ? data.height * 2.54 : data.height;
    
    // Convert weight to kg if needed
    const weightInKg = weightUnit === 'lbs' ? data.weight / 2.20462 : data.weight;

    // Calculate BMI
    const heightInMeters = heightInCm / 100;
    const bmi = weightInKg / (heightInMeters * heightInMeters);

    const fitnessData: Omit<FitnessData, 'lastUpdated'> & { lastUpdated: ReturnType<typeof serverTimestamp> } = {
      userId: user.uid,
      age: data.age,
      height: parseFloat(heightInCm.toFixed(1)),
      weight: parseFloat(weightInKg.toFixed(1)),
      sex: data.sex,
      bmi: parseFloat(bmi.toFixed(1)),
      lastUpdated: serverTimestamp()
    };

    // Create a reference to the user's document in the 'users' collection
    const userDocRef = doc(db, 'users', user.uid);
    
    // Create a reference to the fitness data subcollection
    const fitnessDataRef = doc(collection(userDocRef, 'fitnessData'), 'current');
    
    // Save the data with server timestamp
    try {
      await setDoc(fitnessDataRef, fitnessData, { merge: true });
      console.log('Fitness data successfully written to Firestore');
    } catch (error) {
      const writeError = error as { code?: string; message: string };
      console.error('Firestore write error:', {
        code: writeError.code || 'unknown',
        message: writeError.message,
        details: error
      });
      
      if (writeError.code === 'permission-denied') {
        throw new Error('You do not have permission to save fitness data. Please make sure you are logged in and have the correct permissions.');
      }
      
      throw error; // Re-throw to be caught by the outer catch
    }
    
    // Return the data with the server timestamp replaced with current date for local use
    return {
      ...fitnessData,
      lastUpdated: new Date()
    } as FitnessData;
  } catch (error) {
    console.error('Error saving fitness data:', error);
    
    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        throw new Error('Permission denied. Please make sure you are logged in and have the necessary permissions.');
      } else if (error.message.includes('network-request-failed')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      // Log the full error for debugging
      console.error('Full error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    
    throw new Error(`Failed to save fitness data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getFitnessData = async (): Promise<FitnessData | null> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('No authenticated user found');
      return null;
    }

    console.log(`Fetching fitness data for user: ${user.uid}`);
    const userDocRef = doc(db, 'users', user.uid);
    const fitnessDataRef = doc(collection(userDocRef, 'fitnessData'), 'current');
    
    console.log('Firestore path:', `users/${user.uid}/fitnessData/current`);
    
    const docSnap = await getDoc(fitnessDataRef);
    
    if (!docSnap.exists()) {
      console.log('No fitness data found for user');
      return null;
    }
    
    const data = docSnap.data();
    console.log('Retrieved fitness data:', data);
    
    if (!data) {
      console.error('Document exists but has no data');
      return null;
    }
    
    // Safely extract data with type checking
    const fitnessData: Omit<FitnessData, 'lastUpdated'> & { lastUpdated?: Timestamp | Date } = {
      userId: data.userId || user.uid,
      age: typeof data.age === 'number' ? data.age : 0,
      height: typeof data.height === 'number' ? data.height : 0,
      weight: typeof data.weight === 'number' ? data.weight : 0,
      sex: data.sex === 'male' || data.sex === 'female' ? data.sex : 'male',
      bmi: typeof data.bmi === 'number' ? data.bmi : undefined,
    };
    
    // Handle the timestamp
    let lastUpdated: Date | Timestamp | null = data.lastUpdated || null;
    if (lastUpdated && 'toDate' in lastUpdated && typeof lastUpdated.toDate === 'function') {
      lastUpdated = lastUpdated.toDate();
    } else if (!lastUpdated) {
      lastUpdated = new Date();
    }
    
    return {
      ...fitnessData,
      lastUpdated: lastUpdated as Date | Timestamp
    } as FitnessData;
    
  } catch (error) {
    console.error('Error in getFitnessData:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        throw new Error('Permission denied. Please make sure you are logged in and have the necessary permissions.');
      } else if (error.message.includes('network-request-failed')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
    }
    
    throw new Error(`Failed to load fitness data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const updateFitnessData = async (updates: Partial<Omit<FitnessData, 'userId' | 'lastUpdated' | 'bmi'>>) => {
  try {
    console.log('Starting updateFitnessData with updates:', updates);
    
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      const error = new Error('User not authenticated');
      console.error('Authentication error:', error);
      throw error;
    }

    console.log(`Updating fitness data for user: ${user.uid}`);
    const userDocRef = doc(db, 'users', user.uid);
    const fitnessDataRef = doc(collection(userDocRef, 'fitnessData'), 'current');
    
    console.log('Firestore document path:', `users/${user.uid}/fitnessData/current`);
    
    // Get current data to check if we need to recalculate BMI
    const currentData = await getFitnessData();
    let updateData: any = { ...updates, lastUpdated: serverTimestamp() };
    
    // Recalculate BMI if height or weight is being updated
    if ((updates.height !== undefined || updates.weight !== undefined) && currentData) {
      const height = updates.height !== undefined ? updates.height : currentData.height;
      const weight = updates.weight !== undefined ? updates.weight : currentData.weight;
      
      if (height > 0 && weight > 0) {
        const bmi = calculateBMI(weight, height, 'kg', 'cm');
        updateData.bmi = bmi;
      } else {
        updateData.bmi = 0; // Set to 0 if height or weight is invalid
      }
    }
    
    console.log('Attempting to update document with:', updateData);
    
    try {
      await updateDoc(fitnessDataRef, updateData);
      console.log('Successfully updated fitness data');
    } catch (firestoreError: any) {
      console.error('Firestore update error:', {
        code: firestoreError.code,
        message: firestoreError.message,
        stack: firestoreError.stack,
        updateData: updateData
      });
      
      // Check if document exists
      const docSnap = await getDoc(fitnessDataRef);
      if (!docSnap.exists()) {
        console.log('Document does not exist, trying to create it...');
        try {
          // If document doesn't exist, try to create it with the full fitness data
          // Calculate BMI for new document if both height and weight are provided
          let bmi = 0;
          if (updates.height && updates.height > 0 && updates.weight && updates.weight > 0) {
            bmi = calculateBMI(updates.weight, updates.height, 'kg', 'cm');
          }
          
          await setDoc(fitnessDataRef, {
            ...updates,
            userId: user.uid,
            bmi: bmi,
            lastUpdated: serverTimestamp()
          });
          console.log('Successfully created new fitness data document');
          return; // Successfully created document
        } catch (createError: any) {
          console.error('Error creating fitness data document:', {
            code: createError.code,
            message: createError.message,
            stack: createError.stack
          });
          throw new Error(`Failed to create fitness data: ${createError.message}`);
        }
      }
      
      // If we get here, there was an error and it wasn't because the document didn't exist
      throw new Error(`Firestore error: ${firestoreError.message}`);
    }
  } catch (error: any) {
    console.error('Error in updateFitnessData:', {
      error: error,
      errorString: String(error),
      errorStack: error?.stack,
      errorCode: error?.code,
      updates: updates
    });
    
    // Provide more specific error messages for common cases
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to update fitness data. Please make sure you are logged in and have the correct permissions.');
    } else if (error.code === 'not-found') {
      throw new Error('Could not find your fitness data. Please try updating your profile again.');
    } else if (error.message.includes('network-request-failed')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
    throw new Error(`Failed to update fitness data: ${error.message || 'Unknown error'}`);
  }
};

export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export const calculateBMI = (weight: number, height: number, weightUnit: 'kg' | 'lbs' = 'kg', heightUnit: 'cm' | 'in' = 'cm'): number => {
  // Convert height to meters
  const heightInMeters = heightUnit === 'cm' ? height / 100 : height * 0.0254;
  
  // Convert weight to kg if needed
  const weightInKg = weightUnit === 'lbs' ? weight / 2.20462 : weight;

  // Calculate and return BMI
  return parseFloat((weightInKg / (heightInMeters * heightInMeters)).toFixed(1));
};
