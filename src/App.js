import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./Home";
import WhatDoesntBelong from "./WhatDoesntBelong";
import NameTheCategory from "./NameTheCategory";
import Matching from "./Matching";
import CompareContrast from "./CompareContrast";
import GuessTheMissing from "./GuessTheMissing";
import SortIntoCategories from "./SortIntoCategories";
import Vocabulary from "./Vocabulary";
import Diamond from "./FindTheDiamond";
import SceneCard from "./SceneCard";
import Header from "./header";
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
        <Route path="/guess-the-missing" element={<GuessTheMissing />} />
        <Route path="/sort-into-categories" element={<SortIntoCategories />} />
        <Route path="/vocabulary" element={<Vocabulary />} />
        <Route path="/diamond" element={<Diamond />} />
        <Route path="/scene-card" element={<SceneCard />} />
      </Routes>
      <div className="corner-credit">©mtwersky</div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ConditionalHeader />
      <AnimatedRoutes /> {/* pages render beneath, so the header overlays *their* black backgrounds */}
    </Router>
  );
}

function ConditionalHeader() {
  const location = useLocation();
  
  // Don't show header on home page
  if (location.pathname === "/") {
    return null;
  }
  
  return <Header />;
}
