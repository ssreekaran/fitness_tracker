import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaLock, FaExclamationCircle } from 'react-icons/fa';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import './LoginPage.css';

interface LocationState {
  from?: {
    pathname: string;
  };
  email?: string;
  error?: string;
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to the previous page or home
      const from = locationState?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later or reset your password.';
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
            {error}
          </div>
        )}

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
              <Link to="/forgot-password" state={{ email }} className="forgot-password">
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

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
