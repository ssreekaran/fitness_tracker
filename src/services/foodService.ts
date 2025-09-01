import { collection, addDoc, getDocs, doc, deleteDoc, query, where, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface FoodEntry {
  id?: string;
  userId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  time?: string;  // New field for the time food was eaten
  timestamp?: Date;
}

// Add a new food entry
export const addFoodEntry = async (entry: Omit<FoodEntry, 'id' | 'timestamp'>): Promise<FoodEntry> => {
  try {
    const docRef = await addDoc(collection(db, 'foodEntries'), {
      ...entry,
      timestamp: Timestamp.now()
    });
    return { id: docRef.id, ...entry };
  } catch (error) {
    console.error('Error adding food entry:', error);
    throw new Error('Failed to add food entry');
  }
};

// Get all food entries for a user
export const getFoodEntries = async (userId: string): Promise<FoodEntry[]> => {
  try {
    const q = query(
      collection(db, 'foodEntries'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to Date if it exists
      timestamp: doc.data().timestamp?.toDate()
    } as FoodEntry));
  } catch (error) {
    console.error('Error getting food entries:', error);
    throw new Error('Failed to get food entries');
  }
};

// Get food entries for a specific date
export const getFoodEntriesByDate = async (userId: string, date: string): Promise<FoodEntry[]> => {
  try {
    const q = query(
      collection(db, 'foodEntries'),
      where('userId', '==', userId),
      where('date', '==', date)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    } as FoodEntry));
  } catch (error) {
    console.error('Error getting food entries by date:', error);
    throw new Error('Failed to get food entries by date');
  }
};

// Update a food entry
export const updateFoodEntry = async (id: string, updates: Partial<Omit<FoodEntry, 'id' | 'userId' | 'timestamp'>>): Promise<void> => {
  try {
    const foodRef = doc(db, 'foodEntries', id);
    await updateDoc(foodRef, {
      ...updates,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating food entry:', error);
    throw new Error('Failed to update food entry');
  }
};

// Delete a food entry
export const deleteFoodEntry = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'foodEntries', id));
  } catch (error) {
    console.error('Error deleting food entry:', error);
    throw new Error('Failed to delete food entry');
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
      collection(db, 'foodEntries'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    } as FoodEntry));
  } catch (error) {
    console.error('Error getting food entries by date range:', error);
    throw new Error('Failed to get food entries by date range');
  }
};
