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
 * - Mobile: Uses Browser plugin for OAuth flow
 *
 * @returns Promise containing user object and access token
 */
export const signInWithGoogle = async () => {
  try {
    // Debug: Log current domain
    console.log("Current domain:", window.location.origin);
    console.log("Current URL:", window.location.href);

    // Platform-specific authentication strategy
    if (Capacitor.isNativePlatform()) {
      // Mobile platforms: Open web app in browser for authentication
      // This is the most reliable approach for mobile OAuth
      const { Browser } = await import("@capacitor/browser");

      // Open your deployed web app where OAuth works perfectly
      const webAppUrl = "https://fitness-tracker-00001.web.app/login";

      await Browser.open({
        url: webAppUrl,
        windowName: "_system",
      });

      // Show a message to the user
      alert(
        "Please complete sign-in in the browser, then return to the app. You may need to refresh the app after signing in."
      );

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
 * For mobile platforms, this checks if the user is already authenticated
 * (e.g., after returning from browser authentication)
 *
 * @returns Promise containing user object and access token, or null if no redirect result
 */
export const handleRedirectResult = async () => {
  try {
    // For mobile, just check if user is already authenticated
    if (Capacitor.isNativePlatform()) {
      // Check current auth state
      const currentUser = auth.currentUser;
      if (currentUser) {
        return {
          user: currentUser,
          token: await currentUser.getIdToken(),
        };
      }
    } else {
      // For web, use the standard redirect result
      const result = await getRedirectResult(auth);
      if (result) {
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

/**
 * Check if user is authenticated (useful for mobile after browser auth)
 */
export const checkAuthStatus = () => {
  return auth.currentUser;
};
