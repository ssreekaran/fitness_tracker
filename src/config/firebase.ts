// Firebase configuration
export const firebaseConfig = {
  projectId: 'fitness-tracker-00001',
  apiUrl: process.env.NODE_ENV === 'production'
    ? 'https://us-central1-fitness-tracker-00001.cloudfunctions.net/api'  // Production URL
    : 'http://localhost:5001/fitness-tracker-00001/us-central1/api'       // Local development URL
};
