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
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const userDocRef = doc(db, 'users', user.uid);
    const fitnessDataRef = doc(collection(userDocRef, 'fitnessData'), 'current');
    
    await updateDoc(fitnessDataRef, {
      ...updates,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating fitness data:', error);
    throw new Error('Failed to update fitness data. Please try again.');
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
