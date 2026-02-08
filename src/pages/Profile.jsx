import React from 'react';
import { Link } from 'react-router-dom';

export default function Profile() {
  return (
    <div style={{ padding: "50px", color: "white", textAlign: "center" }}>
      <h1>Profile Page</h1>
      <p>ここにプロフィールの詳細が入ります。</p>
      <Link to="/" style={{ color: "#aaa" }}>← Homeに戻る</Link>
    </div>
  );
}