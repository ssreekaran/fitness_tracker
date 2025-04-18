import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/", { replace: true });
      } else {
        setUser(firebaseUser);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="profile-page" style={{
      maxWidth: 400,
      minHeight: 260,
      margin: "80px auto 0 auto",
      padding: 32,
      boxShadow: "0 2px 12px #0003",
      borderRadius: 12,
      background: "#232323",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center"
    }}>
      <h2 style={{marginBottom: 24}}>Profile</h2>
      <div style={{ margin: "16px 0" }}>
        <strong>Name:</strong> {user.displayName || "(not set)"}
      </div>
      <div style={{ margin: "16px 0" }}>
        <strong>Email:</strong> {user.email}
      </div>
      <button onClick={() => navigate(-1)} style={{ marginTop: 32, padding: "8px 24px", borderRadius: 8, background: "#333", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Back</button>
    </div>
  );
};

export default ProfilePage;
