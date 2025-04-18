import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

interface UserDropdownContentProps {
  displayName: string | null;
  onLogout?: () => void;
}

const UserDropdownContent: React.FC<UserDropdownContentProps> = ({ displayName, onLogout }) => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await signOut(auth);
    if (onLogout) onLogout();
  };

  const handleProfile = () => {
    navigate("/profile");
    if (onLogout) onLogout();
  };

  return (
    <div style={{ minWidth: 180, padding: 12 }}>
      <div style={{ marginBottom: 12 }}>
        <strong>{displayName || "User"}</strong>
      </div>
      <button type="button" onClick={handleProfile} style={{ width: "100%", marginBottom: 8 }}>
        View Profile
      </button>
      <button type="button" onClick={handleLogout} style={{ width: "100%" }}>
        Log Out
      </button>
    </div>
  );
};

export default UserDropdownContent;
