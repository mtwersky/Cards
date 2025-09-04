// src/AccountPage.js
import React from "react";
import { useAuth } from "./AuthContext";
import { logout } from "./firebase";
import { useNavigate } from "react-router-dom";
import "./AccountPage.css";

function AccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return <p style={{ color: "white" }}>Not logged in</p>;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px", color: "white" }}>
      <h1>Account Settings</h1>
      <img
        src={user.photoURL}
        alt="Profile"
        style={{ width: "100px", height: "100px", borderRadius: "50%" }}
      />
      <p><strong>Name:</strong> {user.displayName}</p>
      <p><strong>Email:</strong> {user.email}</p>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          borderRadius: "30px",
          border: "none",
          backgroundColor: "#ff4444",
          color: "white",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        Log Out
      </button>
    </div>
  );
}

export default AccountPage;
