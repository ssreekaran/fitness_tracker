import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import "./MobileLoginPage.css";

const MobileLoginPage: React.FC = () => {
  const [status, setStatus] = useState<
    "loading" | "authenticating" | "success" | "error"
  >("loading");
  const [error, setError] = useState<string>("");

  // Don't auto-trigger sign-in, let user click the button

  const handleGoogleSignIn = async () => {
    try {
      setStatus("authenticating");
      setError("");

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (user) {
        setStatus("success");

        // Get the user's ID token to share with the mobile app
        const idToken = await user.getIdToken();

        // Store the token in localStorage for the mobile app to access
        localStorage.setItem("mobileAuthToken", idToken);
        localStorage.setItem(
          "mobileAuthUser",
          JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          })
        );

        // Wait a moment to show success message, then redirect back to app
        setTimeout(() => {
          // Create URL with authentication data
          const authData = encodeURIComponent(
            JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              idToken: idToken,
            })
          );

          // Try multiple redirect methods with auth data
          const appUrl = `com.olnbd.fitnesstracker://auth-success?data=${authData}`;

          // Method 1: Direct custom scheme with data
          window.location.href = appUrl;

          // Method 2: Android intent with data (fallback)
          setTimeout(() => {
            const androidIntent = `intent://auth-success?data=${authData}#Intent;scheme=com.olnbd.fitnesstracker;package=com.olnbd.fitnesstracker;end`;
            window.location.href = androidIntent;
          }, 1000);

          // Method 3: Show success message if redirects don't work
          setTimeout(() => {
            setStatus("success");
          }, 2000);
        }, 1500);
      }
    } catch (error: unknown) {
      console.error("Mobile Google sign in error:", error);
      setStatus("error");
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to sign in with Google";
      setError(errorMessage);
    }
  };

  const handleRetry = () => {
    setStatus("loading");
    setError("");
    handleGoogleSignIn();
  };

  const handleReturnToApp = () => {
    // Try multiple ways to return to the app
    const appUrl = "com.olnbd.fitnesstracker://auth-success";
    window.location.href = appUrl;

    // Fallback for Android
    setTimeout(() => {
      const androidIntent =
        "intent://auth-success#Intent;scheme=com.olnbd.fitnesstracker;package=com.olnbd.fitnesstracker;end";
      window.location.href = androidIntent;
    }, 1000);
  };

  return (
    <div className="mobile-login-container">
      <div className="mobile-login-content">
        <div className="app-logo">
          <img src="/fitness_tracker_logo6.png" alt="Fitness Tracker" />
          <h1>Fitness Tracker</h1>
        </div>

        {status === "loading" && (
          <div className="status-section">
            <h2>Mobile Sign-In</h2>
            <p>
              Complete your Google sign-in to continue to the Fitness Tracker
              app.
            </p>
            <button
              onClick={handleGoogleSignIn}
              className="google-signin-button"
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                width="20"
                height="20"
              />
              Sign in with Google
            </button>
            <p className="instruction-text">
              After signing in, you'll be automatically redirected back to the
              app.
            </p>
          </div>
        )}

        {status === "authenticating" && (
          <div className="status-section">
            <div className="spinner"></div>
            <h2>Signing You In...</h2>
            <p>Please complete the Google sign-in process.</p>
          </div>
        )}

        {status === "success" && (
          <div className="status-section success">
            <div className="success-icon">✓</div>
            <h2>Sign-In Successful!</h2>
            <p>You have been successfully signed in. Returning to the app...</p>
            <button onClick={handleReturnToApp} className="return-button">
              Return to App
            </button>
            <p className="instruction-text">
              If you're not automatically redirected, tap "Return to App" above
              or switch back to the Fitness Tracker app manually.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="status-section error">
            <div className="error-icon">✗</div>
            <h2>Sign-In Failed</h2>
            <p className="error-message">{error}</p>
            <button onClick={handleRetry} className="retry-button">
              Try Again
            </button>
            <p className="instruction-text">
              If the problem persists, please try signing in directly from the
              app.
            </p>
          </div>
        )}

        <div className="footer-text">
          <p>This page is designed for mobile app authentication.</p>
          <p>
            For regular web access, visit the{" "}
            <a href="/login">main login page</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileLoginPage;
