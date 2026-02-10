import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // CSSを読み込み

export const Menu = ({ isOpen, onClose }) => {
  return (
    <div className={`menu-overlay ${isOpen ? 'open' : ''}`}>
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
    </div>
  );
};