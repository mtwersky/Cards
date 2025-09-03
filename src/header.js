import React from "react";
import "./header.css";

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="header-link" href="/">Home</a>
        <span className="header-link login-link">Log In</span>
      </div>
    </header>
  );
}
