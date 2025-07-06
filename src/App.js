import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./Home";
import WhatDoesntBelong from "./WhatDoesntBelong";
import NameTheCategory from "./NameTheCategory";
import Matching from "./Matching";
import CompareContrast from "./CompareContrast";
import Ordering from "./Ordering";
import GuessTheMissing from "./GuessTheMissing";
import "./App.css";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div className="fade-page" key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/what-doesnt-belong" element={<WhatDoesntBelong />} />
        <Route path="/name-the-category" element={<NameTheCategory />} />
        <Route path="/matching" element={<Matching />} />
        <Route path="/compare-contrast" element={<CompareContrast />} />
        <Route path="/ordering" element={<Ordering />} />
        <Route path="/guess-the-missing" element={<GuessTheMissing />} />
      </Routes>
      <div className="corner-credit">©mtwersky</div>
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