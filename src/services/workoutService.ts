import { collection, doc, setDoc, getDocs, query, orderBy, limit, Timestamp, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';

export interface WorkoutLog {
  id?: string;
  userId: string;
  exercise: string;
  duration: number;
  intensity?: 'low' | 'moderate' | 'high';  // Made optional
  caloriesBurned: number;
  date: Date | Timestamp;
  createdAt?: Date | Timestamp;
}

export const saveWorkout = async (workout: Omit<WorkoutLog, 'id' | 'userId' | 'createdAt'>): Promise<WorkoutLog> => {
  console.log('Starting saveWorkout with data:', workout);
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      const error = new Error('User not authenticated');
      console.error(error);
      throw error;
    }

    console.log('Current user ID:', user.uid);
    
    // Ensure date is properly formatted
    let dateToSave;
    try {
      if (workout.date instanceof Date) {
        dateToSave = Timestamp.fromDate(workout.date);
      } else if (workout.date instanceof Timestamp) {
        dateToSave = workout.date;
      } else {
        // Try to parse string date
        dateToSave = Timestamp.fromDate(new Date(workout.date as unknown as string));
      }
      console.log('Processed date:', dateToSave?.toDate?.());
    } catch (dateError) {
      console.error('Error processing date:', dateError);
      throw new Error(`Invalid date format: ${workout.date}`);
    }

    const workoutData = {
      ...workout,
      userId: user.uid,
      createdAt: Timestamp.now(),
      date: dateToSave
    };

    console.log('Processed workout data:', {
      ...workoutData,
      date: workoutData.date?.toDate?.()
    });

    try {
      const userWorkoutsRef = collection(db, 'users', user.uid, 'workouts');
      console.log('Collection reference created');
      
      const newWorkoutRef = doc(userWorkoutsRef);
      console.log('New document reference created with ID:', newWorkoutRef.id);
      
      console.log('Attempting to write document...');
      await setDoc(newWorkoutRef, workoutData);
      console.log('Document successfully written!');
      
      const savedWorkout = {
        id: newWorkoutRef.id,
        ...workoutData,
        date: workoutData.date instanceof Timestamp ? workoutData.date.toDate() : workoutData.date,
        createdAt: workoutData.createdAt instanceof Timestamp ? workoutData.createdAt.toDate() : workoutData.createdAt
      };
      
      console.log('Returning saved workout:', savedWorkout);
      return savedWorkout;
    } catch (error) {
      const dbError = error as Error & { code?: string };
      console.error('Database error:', dbError);
      console.error('Error details:', {
        name: dbError.name,
        message: dbError.message,
        code: dbError.code,
        stack: dbError.stack
      });
      throw new Error(`Database error: ${dbError.message}`);
    }
  } catch (error) {
    console.error('Error in saveWorkout:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    throw new Error(`Failed to save workout: ${errorMessage}`);
  }
};

export const getUserWorkouts = async (limitCount = 50): Promise<WorkoutLog[]> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const userWorkoutsRef = collection(db, 'users', user.uid, 'workouts');
    const q = query(
      userWorkoutsRef,
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    })) as WorkoutLog[];
  } catch (error) {
    console.error('Error fetching workouts:', error);
    throw new Error('Failed to load workouts');
  }
};

export const deleteWorkout = async (workoutId: string): Promise<void> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const workoutRef = doc(db, 'users', user.uid, 'workouts', workoutId);
    await deleteDoc(workoutRef);
  } catch (error) {
    console.error('Error deleting workout:', error);
    throw new Error('Failed to delete workout');
  }
};
