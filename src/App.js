// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./Home";
import GuessTheMissing from "./GuessTheMissing";
import WhatDoesntBelong from "./WhatDoesntBelong";
import CompareContrast from "./CompareContrast";
import Vocabulary from "./Vocabulary";
import SortIntoCategories from "./SortIntoCategories";
import SceneCard from "./SceneCard";
import Matching from "./Matching";
import NameTheCategory from "./NameTheCategory";
import FindTheDiamond from "./FindTheDiamond";
import AccountPage from "./AccountPage";
import LoginPage from "./LoginPage";
import Header from "./header";

import { AuthProvider, useAuth } from "./AuthContext";

import "./App.css";

// A wrapper for private routes
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/account" element={<AccountPage />} />
          {/* Private routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/guess-the-missing"
            element={
              <PrivateRoute>
                <GuessTheMissing />
              </PrivateRoute>
            }
          />
          <Route
            path="/what-doesnt-belong"
            element={
              <PrivateRoute>
                <WhatDoesntBelong />
              </PrivateRoute>
            }
          />
          <Route
            path="/matching"
            element={
              <PrivateRoute>
                <Matching />
              </PrivateRoute>
            }
          />
          <Route
            path="/name-the-category"
            element={
              <PrivateRoute>
                <NameTheCategory />
              </PrivateRoute>
            }
          />
          <Route
            path="/compare-contrast"
            element={
              <PrivateRoute>
                <CompareContrast />
              </PrivateRoute>
            }
          />
          <Route
            path="/vocabulary"
            element={
              <PrivateRoute>
                <Vocabulary />
              </PrivateRoute>
            }
          />
          <Route
            path="/sort-into-categories"
            element={
              <PrivateRoute>
                <SortIntoCategories />
              </PrivateRoute>
            }
          />
          <Route
            path="/scene-card"
            element={
              <PrivateRoute>
                <SceneCard />
              </PrivateRoute>
            }
          />

          <Route
            path="/find-the-diamond"
            element={
              <PrivateRoute>
                <FindTheDiamond />
              </PrivateRoute>
            }
          />
          {/* Catch-all: redirect to / if logged in, else /login */}
          <Route
            path="*"
            element={
              <PrivateRoute>
                <Navigate to="/" />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
