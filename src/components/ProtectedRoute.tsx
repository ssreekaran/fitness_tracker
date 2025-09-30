/**
 * ProtectedRoute Component
 *
 * A higher-order component that protects routes requiring authentication.
 * Automatically redirects unauthenticated users to the signup page.
 *
 * Features:
 * - Real-time authentication state monitoring
 * - Loading state management during auth check
 * - Automatic redirection for unauthenticated users
 * - Seamless rendering for authenticated users
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase";

interface ProtectedRouteProps {
  children: React.ReactNode; // The protected content to render if authenticated
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

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
    return <div>Loading...</div>;
  }

  // Redirect to signup if user is not authenticated
  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  // Render protected content for authenticated users
  return <>{children}</>;
};

export default ProtectedRoute;
