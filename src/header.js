// src/header.js
import React from "react";
import "./header.css";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="site-header">
      <div className="header-inner">
        <nav className="header-nav">
          <a className="header-link" href="/">Home</a>
        </nav>

        
      </div>
    </header>
  );
}
