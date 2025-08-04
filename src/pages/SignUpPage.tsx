import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaEnvelope, FaLock, FaCheckCircle } from 'react-icons/fa';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import './SignUpPage.css';

const MIN_PASSWORD_LENGTH = 6;

const SignUpPage: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!displayName.trim()) {
      setError('Name is required.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    try {
      setIsLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      
      // Set display name
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
      }
      
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000); // Give user time to read success message
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      let errorMessage = 'Failed to create account';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please try logging in.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Please choose a stronger password.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <Link to="/login" className="back-button">
            <FaArrowLeft /> Back to Login
          </Link>
          
          <div className="signup-header">
            <div className="icon-container">
              <FaUser className="user-icon" />
            </div>
            <h2>Create Your Account</h2>
            <p className="subtitle">Join our community today</p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-group">
                <label htmlFor="displayName">Full Name</label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Enter your full name"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                    minLength={MIN_PASSWORD_LENGTH}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    minLength={MIN_PASSWORD_LENGTH}
                    required
                  />
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button 
                type="submit" 
                className="signup-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="button-loader"></span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          ) : (
            <div className="success-state">
              <FaCheckCircle className="success-icon" />
              <h3>Account Created!</h3>
              <p className="success-message">
                Welcome to our community, <strong>{displayName}</strong>! 
                Your account has been created successfully.
              </p>
              <p className="redirect-message">
                Redirecting you to the home page...
              </p>
            </div>
          )}

          <div className="login-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
