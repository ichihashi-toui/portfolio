// src/App.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Home from "./pages/Home";
import Contents from "./pages/Contents";
import Profile from "./pages/Profile";
import Gallery from "./pages/Gallery";
import "./App.css";

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ★修正: シンプルに「/」だけでOK！(自動で /portfolio/ になります) */}
        <Route path="/" element={<Home />} />
        
        {/* ★修正: ここも「/contents」だけでOK！(自動で /portfolio/contents になります) */}
        <Route path="/contents" element={<Contents />} />
        
        <Route path="/profile" element={<Profile />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;