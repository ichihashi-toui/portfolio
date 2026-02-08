import React from 'react';
import { Link } from 'react-router-dom';

export default function Gallery() {
  return (
    <div style={{ padding: "50px", color: "white", textAlign: "center" }}>
      <h1>Gallery Page</h1>
      <p>ここに作品ギャラリーが入ります。</p>
      <Link to="/" style={{ color: "#aaa" }}>← Homeに戻る</Link>
    </div>
  );
}