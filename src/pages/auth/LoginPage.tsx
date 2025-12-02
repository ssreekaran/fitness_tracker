import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEnvelope,
  FaLock,
  FaExclamationCircle,
  FaGoogle,
  FaSpinner,
} from "react-icons/fa";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { Capacitor } from "@capacitor/core";
import "./LoginPage.css";

interface LocationState {
  from?: {
    pathname: string;
  };
  email?: string;
  error?: string;
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Add a reset mechanism for stuck loading state
  useEffect(() => {
    if (isLoading) {
      // Auto-reset loading state after 10 seconds to prevent permanent stuck state
      const timeout = setTimeout(() => {
        console.log("Auto-resetting loading state after timeout");
        setIsLoading(false);
        setError("Authentication timed out. Please try again.");
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LocationState;

  // Pre-fill email if passed in location state
  useEffect(() => {
    if (locationState?.email) {
      setEmail(locationState.email);
    }
    if (locationState?.error) {
      setError(locationState.error);
    }
  }, [locationState]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");

      if (Capacitor.isNativePlatform()) {
        // For mobile, use Firebase's built-in redirect authentication
        console.log("Starting mobile Google sign-in with redirect...");
        await signInWithRedirect(auth, googleProvider);
        // The page will redirect to Google, then back to this page
        // getRedirectResult will handle the result when we return
      } else {
        // For web, use popup flow
        const { signInWithPopup } = await import("firebase/auth");
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user) {
          const from = locationState?.from?.pathname || "/";
          navigate(from, { replace: true });
        }
      }
    } catch (error: unknown) {
      console.error("Google sign in error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to sign in with Google. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Handle redirect result and auth state changes
  useEffect(() => {
    const handleAuthFlow = async () => {
      try {
        // Check for redirect result (mobile authentication)
        console.log("Checking for redirect result...");
        const result = await getRedirectResult(auth);

        if (result) {
          // User just completed authentication via redirect
          console.log("Redirect authentication successful:", result.user.email);
          setError("");
          setIsLoading(false);
          const from = locationState?.from?.pathname || "/";
          navigate(from, { replace: true });
          return;
        }

        // No redirect result, check current auth state
        const currentUser = auth.currentUser;
        if (currentUser) {
          console.log("User already authenticated:", currentUser.email);
          setError("");
          setIsLoading(false);
          const from = locationState?.from?.pathname || "/";
          navigate(from, { replace: true });
          return;
        }

        // No user authenticated, reset loading state
        setIsLoading(false);
      } catch (error) {
        console.error("Error handling auth flow:", error);
        setIsLoading(false);
        setError("Authentication failed. Please try again.");
      }
    };

    // Handle auth flow on component mount
    handleAuthFlow();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Auth state changed - user authenticated:", user.email);
        setError("");
        setIsLoading(false);
        const from = locationState?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate, locationState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        // Sign out the user if email is not verified
        await auth.signOut();
        // Offer to resend verification email
        setError(
          "Please verify your email before logging in. Check your inbox or click here to resend the verification email."
        );
        // Add click handler to the error message
        return;
      }

      // Email is verified, proceed with login
      const from = locationState?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      let errorMessage = "Failed to sign in. Please try again.";

      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage =
          "Too many failed attempts. Please try again later or reset your password.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Link to="/" className="back-button">
          <FaArrowLeft /> Back to Home
        </Link>

        <div className="login-header">
          <div className="icon-container">
            <FaLock className="lock-icon" />
          </div>
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to continue to your account</p>
        </div>

        {error && (
          <div className="error-message">
            <FaExclamationCircle className="error-icon" />
            {error.includes("resend") ? (
              <span>
                {error.split("click here")[0]}
                <button
                  className="resend-link"
                  onClick={async () => {
                    try {
                      const user = auth.currentUser;
                      if (user) {
                        await sendEmailVerification(user);
                        setError(
                          "Verification email sent! Please check your inbox."
                        );
                      }
                    } catch {
                      setError(
                        "Failed to resend verification email. Please try again."
                      );
                    }
                  }}
                >
                  click here
                </button>
                {error.split("click here")[1]}
              </span>
            ) : (
              error
            )}
          </div>
        )}

        <div className="social-login">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="google-signin-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner className="spinner-icon" />
                Signing in...
              </>
            ) : (
              <>
                <FaGoogle className="google-icon" />
                Continue with Google
              </>
            )}
          </button>

          {isLoading && (
            <button
              type="button"
              onClick={() => {
                setIsLoading(false);
                setError("");
                console.log("Manual reset of loading state");
              }}
              className="reset-button"
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid #666",
                color: "#666",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel / Reset
            </button>
          )}

          <div className="divider">
            <span>or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="password-label-container">
              <label htmlFor="password">Password</label>
              <Link
                to="/forgot-password"
                state={{ email }}
                className="forgot-password"
              >
                Forgot password?
              </Link>
            </div>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="signup-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
