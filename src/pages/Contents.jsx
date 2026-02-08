import React from 'react';
import { Link } from 'react-router-dom';

export default function Contents() {
  return (
    <div className="sub-page-container">
      <h1>Contents Page</h1>
      <p>ここに作品詳細などのコンテンツが入ります。</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
}