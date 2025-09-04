// src/LoginPage.js
import React, { useEffect } from "react";
import { loginWithGoogle } from "./firebase";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Whenever user changes, if logged in, redirect to Home
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px", color: "white" }}>
      <h1>Welcome to Category Cards</h1>
      <button
        onClick={handleLogin}
        style={{
          padding: "12px 24px",
          fontFamily: "Poppins, sans-serif",
          borderRadius: "40px",
          borderColor: "#ff9999",
          borderWidth: "8px",
          borderStyle: "solid",
          fontSize: "1.2rem",
          cursor: "pointer",
        }}
      >
        Sign In
      </button>
    </div>
  );
}

export default LoginPage;
