// src/header.js
import React from "react";
import "./header.css";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="site-header">
      <div className="header-inner">
        <nav className="header-nav">
          <a className="header-link" href="/">Home</a>
        </nav>

        {user && (
          <img
            src={user.photoURL}
            alt="Profile"
            onClick={() => navigate("/account")}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              cursor: "pointer",
              objectFit: "cover",
            }}
          />
        )}
      </div>
    </header>
  );
}
