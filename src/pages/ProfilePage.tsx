import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, deleteUser } from "firebase/auth";
import { auth } from "../firebase";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [deleting, setDeleting] = useState(false);
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

  const handleDeleteAccount = async () => {
    setError("");
    setSuccess("");
    setDeleting(true);
    try {
      if (user) {
        await deleteUser(user);
        setSuccess("Account deleted successfully.");
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        setError("Please log out and log in again to delete your account.");
      } else {
        setError(err.message || "Failed to delete account.");
      }
    } finally {
      setDeleting(false);
    }
  };

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
      <button
        onClick={handleDeleteAccount}
        disabled={deleting}
        style={{ marginTop: 24, padding: "8px 24px", borderRadius: 8, background: "#c0392b", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: deleting ? "not-allowed" : "pointer" }}
      >
        {deleting ? "Deleting..." : "Delete Account"}
      </button>
      {error && <div style={{ color: "#ff4d4f", marginTop: 12 }}>{error}</div>}
      {success && <div style={{ color: "#2ecc40", marginTop: 12 }}>{success}</div>}
      <button onClick={() => navigate(-1)} style={{ marginTop: 32, padding: "8px 24px", borderRadius: 8, background: "#333", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Back</button>
    </div>
  );
};

export default ProfilePage;
