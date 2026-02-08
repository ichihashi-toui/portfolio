import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
// ↓ 先頭を大文字にするのがルールです！
import Home from './pages/Home';
import Contents from './pages/Contents';
import Profile from './pages/Profile';
import Gallery from './pages/Gallery';
import './App.css';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contents" element={<Contents />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </HashRouter>
  );
}