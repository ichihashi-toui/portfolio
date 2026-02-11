import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../App.css';

const Gallery = () => {
  const galleryData = [
    { id: 1, src: "/gallery-12.jpg", title: "Untitled Work 01", cat: "Graphic", year: "2025" },
    { id: 2, src: "/gallery-10.jpg", title: "Exhibition A", cat: "Poster", year: "2025" },
    { id: 3, src: "/gallery-23.jpg", title: "Blue Abstract", cat: "Art", year: "2024" },
    { id: 4, src: "/gallery-14.jpg", title: "Typography Study", cat: "Type", year: "2025" },
    { id: 5, src: "/gallery-17.jpg", title: "Package Design", cat: "Product", year: "2025" },
    { id: 6, src: "/gallery-06.jpg", title: "Magazine Layout", cat: "Editorial", year: "2024" },
    { id: 7, src: "/gallery-12.jpg", title: "Work 07", cat: "Graphic", year: "2023" },
    { id: 8, src: "/gallery-10.jpg", title: "Work 08", cat: "Graphic", year: "2023" },
    { id: 9, src: "/gallery-23.jpg", title: "Work 09", cat: "Art", year: "2023" },
    { id: 10, src: "/gallery-14.jpg", title: "Work 10", cat: "Type", year: "2023" },
    { id: 11, src: "/gallery-17.jpg", title: "Work 11", cat: "Product", year: "2022" },
    { id: 12, src: "/gallery-06.jpg", title: "Work 12", cat: "Editorial", year: "2022" },
    { id: 13, src: "/gallery-12.jpg", title: "Work 13", cat: "Graphic", year: "2022" },
    { id: 14, src: "/gallery-10.jpg", title: "Work 14", cat: "Graphic", year: "2022" },
    { id: 15, src: "/gallery-23.jpg", title: "Work 15", cat: "Art", year: "2021" },
    { id: 16, src: "/gallery-14.jpg", title: "Work 16", cat: "Type", year: "2021" },
    { id: 17, src: "/gallery-17.jpg", title: "Work 17", cat: "Product", year: "2021" },
    { id: 18, src: "/gallery-06.jpg", title: "Work 18", cat: "Editorial", year: "2021" },
    { id: 19, src: "/gallery-12.jpg", title: "Work 19", cat: "Graphic", year: "2020" },
    { id: 20, src: "/gallery-10.jpg", title: "Work 20", cat: "Graphic", year: "2020" },
  ];

  const [selectedId, setSelectedId] = useState(galleryData[0].id);
  const selectedItem = galleryData.find(item => item.id === selectedId);
  const currentIndex = galleryData.findIndex(item => item.id === selectedId);
  const lastWheelTime = useRef(0);

  const goNext = () => { if (currentIndex < galleryData.length - 1) setSelectedId(galleryData[currentIndex + 1].id); };
  const goPrev = () => { if (currentIndex > 0) setSelectedId(galleryData[currentIndex - 1].id); };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]); 

  const handleWheel = (e) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 600) return;
    if (Math.abs(e.deltaY) < 50) return;
    if (e.deltaY > 0) goNext(); else goPrev();
    lastWheelTime.current = now;
  };

  return (
    <motion.div
      className="gallery-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ width: '100vw', height: '100vh', background: '#fff', color: '#000', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      
      {/* ★修正: EXIT位置調整 (transformで微調整してハンバーガーと高さを合わせる) */}
      <Link to="/" style={{ 
        position: 'fixed', 
        top: '40px', 
        left: '4vw', 
        color: '#000', 
        fontWeight: 'bold', 
        fontSize: '1rem', 
        textDecoration: 'none', 
        zIndex: 1000, 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em', 
        padding: '0 20px', 
        height: '20px', 
        display: 'flex',
        alignItems: 'center',
        transform: 'translateY(-2px)' // ★微調整: 目視でハンバーガーと中心を合わせる
      }}>
        exit
      </Link>

      {/* 1. MAIN VIEWER */}
      <div 
        onWheel={handleWheel}
        style={{ flex: 1, position: 'relative', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px 20px', overflow: 'hidden' }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedItem.id}
            src={`${import.meta.env.BASE_URL}${selectedItem.src.replace(/^\//, '')}`}
            alt={selectedItem.title}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
          />
        </AnimatePresence>
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(255,255,255,0.9)', padding: '10px 15px', borderRadius: '4px', pointerEvents: 'none' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 'bold', margin: 0 }}>{selectedItem.cat} / {selectedItem.year}</p>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '900', margin: '5px 0 0', textTransform: 'uppercase' }}>{selectedItem.title}</h2>
        </div>
      </div>

      {/* 2. SELECTION LIST */}
      <div 
        className="gallery-list-container" 
        onWheel={(e) => e.stopPropagation()} 
        // ★修正: 横スクロールを確実にする設定 (touchAction: pan-x, flexWrap: nowrap, overflowX: scroll)
        style={{
          height: '160px',
          background: '#fff',
          borderTop: '2px solid #000',
          display: 'flex',
          flexWrap: 'nowrap', // 改行禁止
          overflowX: 'scroll', // 確実にスクロールバーを出す(表示は消す)
          overflowY: 'hidden',
          padding: '20px',
          gap: '20px',
          alignItems: 'center',
          scrollbarWidth: 'none', // Firefox用バー非表示
          msOverflowStyle: 'none', // IE用バー非表示
          WebkitOverflowScrolling: 'touch', // iOS慣性スクロール
          touchAction: 'pan-x', // 横スクロール許可
          pointerEvents: 'auto' 
        }}
      >
        {/* Chrome/Safari用バー非表示スタイル */}
        <style>{`
          .gallery-list-container::-webkit-scrollbar { display: none; }
        `}</style>

        {galleryData.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedId(item.id)}
            // ★修正: flex: 0 0 auto でアイテム幅を固定し、潰れないようにする
            style={{ 
              flex: '0 0 auto', 
              width: '120px',
              cursor: 'pointer', 
              opacity: selectedId === item.id ? 1 : 0.4, 
              transition: 'opacity 0.3s', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px', 
              padding: '5px' 
            }}
          >
            <div style={{ width: '100%', aspectRatio: '1/1', background: '#eee', overflow: 'hidden', border: selectedId === item.id ? '2px solid #000' : '1px solid #ddd', position: 'relative' }}>
              <img src={`${import.meta.env.BASE_URL}${item.src.replace(/^\//, '')}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <p style={{ fontSize: '0.75rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: selectedId === item.id ? 'bold' : 'normal' }}>{item.title}</p>
          </div>
        ))}
      </div>

      <style>{`
        @media (min-width: 769px) {
          .gallery-page { flex-direction: row !important; }
          .gallery-page > div:first-child { padding: 40px !important; }
          .gallery-list-container { 
            width: 350px !important; 
            height: 100vh !important; 
            border-top: none !important; 
            border-left: 2px solid #000; 
            flex-direction: column !important; 
            overflow-x: hidden !important; 
            overflow-y: auto !important; 
            align-items: stretch !important; 
            padding-top: 160px !important; 
            padding-bottom: 40px !important; 
          }
          .gallery-list-container > div { 
            width: auto !important;
            flex: 1 1 auto !important; 
            flex-direction: row !important; 
            align-items: center; 
            height: 80px; 
          }
          .gallery-list-container > div > div:first-child { width: 80px !important; height: 80px !important; flex-shrink: 0; }
        }
      `}</style>

    </motion.div>
  );
};

export default Gallery;