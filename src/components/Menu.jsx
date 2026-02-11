import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; 

export const Menu = ({ isOpen, onClose }) => {
  return (
    <div className={`menu-overlay ${isOpen ? 'open' : ''}`}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative' 
      }}>
        <ul className="menu-list">
          <li className="menu-item">
            <Link to="/" className="menu-link" onClick={onClose}>HOME</Link>
          </li>
          <li className="menu-item">
            <Link to="/contents" className="menu-link" onClick={onClose}>CONTENTS</Link>
          </li>
          <li className="menu-item">
            <Link to="/profile" className="menu-link" onClick={onClose}>PROFILE</Link>
          </li>
          <li className="menu-item">
            <Link to="/gallery" className="menu-link" onClick={onClose}>GALLERY</Link>
          </li>
        </ul>

        {/* ★追加: コピーライト */}
        <div style={{ 
          position: 'absolute', 
          bottom: '40px', 
          width: '100%', 
          textAlign: 'center', 
          color: '#666', 
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: '0.8rem',
          letterSpacing: '0.05em',
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.5s ease 0.4s' // メニューが開いた後にふわっと出る
        }}>
          @2026 Ichihashi Toui / Nagoya,JP
        </div>
      </div>
    </div>
  );
};