import React from "react";
import "./header.css";
import { useAuth } from "./AuthContext";
import { logout } from "./firebase";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="site-header">
      <div className="header-inner">
        <nav className="header-nav">
          <a className="header-link" href="/">Home</a>
        </nav>
        {user ? (
          <span className="header-link" onClick={logout}>Log Out</span>
        ) : (
          <a className="header-link" href="/login">Log In</a>
        )}
      </div>
    </header>
  );
}
