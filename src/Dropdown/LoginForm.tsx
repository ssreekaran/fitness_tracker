import React, { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "./LoginForm.css";

interface LoginFormProps {
  onSignUpClick?: () => void;
}

function LoginForm({ onSignUpClick }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // If email is empty, redirect to the login page with the current email
    if (!email.trim()) {
      navigate('/login', { 
        state: { 
          from: location, 
          email: email,
          error: 'Please enter your email address' 
        } 
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // Clear form on success
      setEmail("");
      setPassword("");
      // The ProtectedRoute will handle the redirect after successful login
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later or reset your password.';
      }
      
      // Redirect to the login page with the email and error message
      navigate('/login', { 
        state: { 
          from: location, 
          email: email,
          error: errorMessage 
        } 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    if (onSignUpClick) onSignUpClick();
    navigate('/signup');
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label htmlFor="password">Password</label>
          <button 
            type="button" 
            onClick={() => navigate('/forgot-password', { state: { email } })}
            style={{ 
              background: 'none',
              border: 'none',
              color: 'var(--link-color, #646cff)',
              cursor: 'pointer',
              padding: '2px 0',
              fontSize: '11px',
              fontWeight: 500,
              textDecoration: 'none',
              margin: 0
            }}
          >
            Forgot password?
          </button>
        </div>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <div className="spinner"></div>
            Signing in...
          </>
        ) : 'Sign In'}
      </button>
      
      <div className="divider">or</div>
      
      <button 
        type="button" 
        onClick={handleSignUp}
        className="secondary-button"
      >
        Create New Account
      </button>
      
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          .login-form .form-group {
            margin-bottom: 10px;
          }
          
          .login-form .spinner {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 6px;
          }
        `}
      </style>
    </form>
  );
}

export default LoginForm;