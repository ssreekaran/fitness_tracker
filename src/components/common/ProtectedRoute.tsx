/**
 * ProtectedRoute Component
 *
 * A higher-order component that protects routes requiring authentication.
 * Unauthenticated users are sent to the login page (not silently to
 * signup) with a message explaining that an account is needed, and are
 * returned to the page they tried to visit after signing in.
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../firebase";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode; // The protected content to render if authenticated
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const location = useLocation();

  React.useEffect(() => {
    // Set up real-time authentication state listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false); // Authentication state has been determined
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if user is not authenticated, explaining why.
  // LoginPage reads location.state.error and shows it, and returns the
  // user to location.state.from after a successful sign-in.
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: { pathname: location.pathname },
          error:
            "Please log in or create a free account to use the tracker — your workouts, meals and goals are saved to your account.",
        }}
      />
    );
  }

  // Render protected content for authenticated users
  return <>{children}</>;
};

export default ProtectedRoute;
