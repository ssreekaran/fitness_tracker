import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import './ForgotPasswordPage.css';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error: unknown) {
      const err = error as { message?: string };
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <Link to="/login" className="back-button">
            <FaArrowLeft /> Back to Login
          </Link>
          
          <div className="forgot-password-header">
            <div className="icon-container">
              <FaEnvelope className="envelope-icon" />
            </div>
            <h2>Forgot Password?</h2>
            <p className="subtitle">No worries, we'll send you reset instructions</p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="forgot-password-form">
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
                    autoFocus
                    required
                  />
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button 
                type="submit" 
                className="reset-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="button-loader"></span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          ) : (
            <div className="success-state">
              <FaCheckCircle className="success-icon" />
              <h3>Email Sent!</h3>
              <p className="success-message">
                We've sent instructions to reset your password to <strong>{email}</strong>.
                Please check your inbox and follow the link provided. If you don't see the email,
                please check your spam or junk folder as it may have been filtered there.
              </p>
              <p className="check-spam">
                Didn't receive the email? Check your spam folder or <button type="button" onClick={handleSubmit}>resend</button>.
              </p>
            </div>
          )}

          <div className="contact-support">
            Still having trouble? <Link to="/contact">Contact support</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
