import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./Home";
import WhatDoesntBelong from "./WhatDoesn'tBelong";
import NameTheCategory from "./NameTheCategory";
import "./App.css";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div className="fade-page" key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/what-doesnt-belong" element={<WhatDoesntBelong />} />
        <Route path="/name-the-category" element={<NameTheCategory />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
