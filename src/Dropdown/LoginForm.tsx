import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "./LoginForm.css";

interface LoginFormProps {
  onSignUpClick?: () => void;
}

function LoginForm({ onSignUpClick }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess(false);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess(true);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  const handleSignUp = () => {
    if (onSignUpClick) onSignUpClick();
    navigate('/signup');
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <label htmlFor="email">Email:</label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label htmlFor="password">Password:</label>
      <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit">Log In</button>
      <button type="button" style={{marginTop: 8, width: '100%'}} onClick={handleSignUp}>Sign Up</button>
      {success && <div style={{ color: "green", marginTop: 8 }}>Logged in successfully!</div>}
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
    </form>
  );
}

export default LoginForm;
