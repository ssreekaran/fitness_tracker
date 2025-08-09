import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaEnvelope, FaLock, FaCheckCircle } from 'react-icons/fa';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
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
  const [verificationSent, setVerificationSent] = useState(false);
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Set display name
      await updateProfile(user, { displayName });
      
      // Send verification email
      await sendEmailVerification(user);
      
      setVerificationSent(true);
      setSuccess(true);
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
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
            <div className="success-message">
              <FaCheckCircle className="success-icon" />
              <h3>{verificationSent ? 'Verify Your Email' : 'Account Created Successfully!'}</h3>
              {verificationSent ? (
                <>
                  <p>We've sent a verification email to <strong>{email}</strong>.</p>
                  <p>Please check your inbox and click the verification link to activate your account.</p>
                  <p>Didn't receive the email? <button 
                    type="button" 
                    className="resend-button"
                    onClick={async () => {
                      if (auth.currentUser) {
                        try {
                          await sendEmailVerification(auth.currentUser);
                          setError('');
                        } catch (err) {
                          setError('Failed to resend verification email. Please try again.');
                        }
                      }
                    }}
                  >
                    Resend Verification Email
                  </button></p>
                </>
              ) : (
                <p>You will be redirected to the login page shortly...</p>
              )}
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
