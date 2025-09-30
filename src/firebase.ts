/**
 * Firebase Configuration and Authentication Setup
 *
 * This file configures Firebase services for the Fitness Tracker app:
 * - Firebase Authentication (with Google OAuth)
 * - Firestore Database
 * - Cross-platform authentication (web and mobile)
 *
 * The configuration handles both popup-based auth (web) and redirect-based auth (mobile)
 * for optimal user experience across platforms.
 */

// Import Firebase SDK functions
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  OAuthProvider,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Capacitor } from "@capacitor/core";

/**
 * Firebase project configuration
 * All configuration values are loaded from environment variables for security
 * These values are set in the .env file and should never be committed to version control
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app with configuration
const app = initializeApp(firebaseConfig);

// Export Firebase services for use throughout the application
export const auth = getAuth(app); // Authentication service
export const db = getFirestore(app); // Firestore database service

/**
 * Google Authentication Provider Configuration
 */
export const googleProvider = new GoogleAuthProvider();

/**
 * OAuth provider configuration for Google authentication
 * Configured with custom parameters for better user experience and refresh token access
 */
const provider = new OAuthProvider("google.com");
provider.addScope("profile"); // Request access to user's profile information
provider.addScope("email"); // Request access to user's email address
provider.setCustomParameters({
  prompt: "select_account", // Forces account selection dialog even if user has only one account
});

/**
 * Google Sign-In Function
 *
 * Handles Google authentication for both web and mobile platforms:
 * - Web: Uses popup-based authentication for better UX
 * - Mobile: Uses redirect-based authentication (required for mobile apps)
 *
 * @returns Promise containing user object and access token
 */
export const signInWithGoogle = async () => {
  try {
    // Platform-specific authentication strategy
    if (Capacitor.isNativePlatform()) {
      // Mobile platforms: Use redirect flow
      // The redirect result will be handled in the App component
      await signInWithRedirect(auth, provider);
      return { user: null, token: null };
    } else {
      // Web platform: Use popup flow for better user experience
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;
      return { user, token };
    }
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

/**
 * Handle Authentication Redirect Result
 *
 * Processes the result of redirect-based authentication (used on mobile platforms)
 * This function should be called when the app loads to check if the user
 * has returned from an OAuth provider redirect
 *
 * @returns Promise containing user object and access token, or null if no redirect result
 */
export const handleRedirectResult = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      const result = await getRedirectResult(auth);
      if (result) {
        // Extract user credentials from the redirect result
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        const user = result.user;
        return { user, token };
      }
    }
    return null;
  } catch (error) {
    console.error("Error handling redirect result:", error);
    throw error;
  }
};
