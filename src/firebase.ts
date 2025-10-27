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

// Configure auth domain for mobile platforms to prevent localhost redirects
if (Capacitor.isNativePlatform()) {
  // Force production auth domain for mobile
  // This ensures redirects go to production domain, not localhost
  console.log("Mobile platform detected, using production auth domain");
}

// Export Firebase services for use throughout the application
export const auth = getAuth(app); // Authentication service
export const db = getFirestore(app); // Firestore database service

/**
 * Google Authentication Provider Configuration
 */
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account", // Force account selection even if user is already signed in
});

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
      // Mobile platforms: Use popup authentication to avoid redirect issues
      console.log("Starting mobile Google authentication with popup...");

      try {
        // Try popup authentication first (works in some mobile browsers)
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        const user = result.user;
        console.log("Mobile popup authentication successful:", user);
        return { user, token };
      } catch (popupError) {
        console.log("Popup failed, trying redirect...", popupError);

        // Fallback to redirect if popup fails
        // Check if we're returning from a redirect first
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult) {
          // User just completed authentication via redirect
          const credential =
            GoogleAuthProvider.credentialFromResult(redirectResult);
          const token = credential?.accessToken;
          const user = redirectResult.user;
          console.log("Mobile redirect authentication successful:", user);
          return { user, token };
        }

        // No redirect result, so initiate the redirect flow
        console.log("Initiating Google sign-in redirect...");
        await signInWithRedirect(auth, googleProvider);

        // The app will redirect to Google and then back
        return { user: null, token: null };
      }
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
 * Handle Authentication Redirect Result on App Startup
 * This should be called when the app starts to check for redirect results
 */
export const handleAuthRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log("Redirect result found on app startup:", result.user);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Error handling redirect result:", error);
    return null;
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
