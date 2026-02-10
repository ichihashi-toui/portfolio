import React, { useState } from 'react'; // useState追加
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Contents from './pages/Contents';
import Profile from './pages/Profile';
import Gallery from './pages/Gallery';
import { Menu } from './components/Menu'; // Menu読み込み
import './App.css';

function App() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* ★全ページ共通のハンバーガーメニュー
        Contentsページで詳細を開いている時以外は表示する
        (詳細ページではbackボタンが出るため、左上のEXITと干渉しないように制御も可能だが、
         今回は要望通り「全ページ統一」で配置する)
      */}
      <div 
        style={{ position: 'fixed', top: '40px', right: '5vw', zIndex: 2000 }}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <div className={`hamburger-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </div>

      {/* ★メニュー画面 (オーバーレイ) */}
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/contents" element={<Contents />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;