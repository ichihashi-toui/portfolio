import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../App.css';

const Gallery = () => {
  const galleryData = [
    { id: 1, src: "gallery/kotomi-6.jpg",},
    { id: 2, src: "/gallery-10.jpg",},
    { id: 3, src: "/gallery-23.jpg",},
    { id: 4, src: "/gallery-14.jpg",},
    { id: 5, src: "/gallery-17.jpg",},
    { id: 6, src: "gallery/kotomi-2.jpg",},
    { id: 7, src: "/gallery-12.jpg",},
    { id: 8, src: "gallery/kotomi-3.jpg",},
    { id: 9, src: "gallery/gallery-19.jpg",},
    { id: 10, src: "gallery/gallery-05.jpg",},
    { id: 11, src: "gallery/kotomi-4.jpg",},
    { id: 12, src: "gallery/kotomi-1.jpg",},
    { id: 13, src: "gallery/gallery-08.jpg",},
    { id: 14, src: "gallery/gallery-02.jpg",},
    { id: 15, src: "gallery/gallery-11.jpg",},
    { id: 16, src: "gallery/gallery-20.jpg",},
    { id: 17, src: "gallery/gallery-21.jpg",},
    { id: 18, src: "gallery/gallery-01.jpg",},
    { id: 19, src: "gallery/gallery-22.jpg",},
    { id: 20, src: "gallery/gallery-16.jpg",},
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
      
      {/* EXITボタン */}
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
        transform: 'translateY(-2px)'
      }}>
        exit
      </Link>

      {/* 1. MAIN VIEWER */}
      <div 
        onWheel={handleWheel}
        // ★修正: パディングを少し減らして（80px -> 60px）、画像をより大きく表示できるように調整
        style={{ flex: 1, position: 'relative', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', overflow: 'hidden' }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedItem.id}
            src={`${import.meta.env.BASE_URL}${selectedItem.src.replace(/^\//, '')}`}
            alt=""
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            // ★修正: maxではなくwidth/heightを100%にして、親要素(paddingの内側)いっぱいまで広げる
            // objectFit: 'contain' なので、長辺がパディング端にピタッと合います
            style={{ width: '100%', height: '100%', objectFit: 'contain', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
          />
        </AnimatePresence>
      </div>

      {/* 2. SELECTION LIST */}
      <div 
        className="gallery-list-container" 
        onWheel={(e) => e.stopPropagation()} 
        style={{
          height: '140px', // スマホ用の高さを少し調整
          background: '#fff',
          borderTop: '2px solid #000',
          display: 'flex',
          flexWrap: 'nowrap', 
          overflowX: 'scroll',
          overflowY: 'hidden',
          padding: '20px',
          gap: '15px',
          alignItems: 'center',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
          pointerEvents: 'auto' 
        }}
      >
        <style>{`
          .gallery-list-container::-webkit-scrollbar { display: none; }
        `}</style>

        {galleryData.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedId(item.id)}
            style={{ 
              flex: '0 0 auto', 
              width: '100px', // スマホ用のサムネイル幅
              cursor: 'pointer', 
              opacity: selectedId === item.id ? 1 : 0.4, 
              transition: 'opacity 0.3s', 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '0' // 余分なパディング削除
            }}
          >
            <div style={{ width: '100%', aspectRatio: '1/1', background: '#eee', overflow: 'hidden', border: selectedId === item.id ? '2px solid #000' : '1px solid #ddd', position: 'relative' }}>
              <img src={`${import.meta.env.BASE_URL}${item.src.replace(/^\//, '')}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (min-width: 769px) {
          .gallery-page { flex-direction: row !important; }
          .gallery-page > div:first-child { padding: 40px !important; } /* Main Viewer */
          
          .gallery-list-container { 
            width: 250px !important; /* ★修正: 文字がなくなったのでリスト幅を狭く */
            height: 100vh !important; 
            border-top: none !important; 
            border-left: 2px solid #000; 
            flex-direction: column !important; 
            overflow-x: hidden !important; 
            overflow-y: auto !important; 
            align-items: center !important; /* 中央揃え */
            padding-top: 160px !important; 
            padding-bottom: 40px !important;
            gap: 20px !important; /* サムネイル間の隙間 */
          }
          
          .gallery-list-container > div { 
            width: 100% !important; /* コンテナ幅に合わせる */
            height: auto !important; /* ★修正: 高さを固定せず画像の高さなりにする */
            flex: 0 0 auto !important;
            flex-direction: column !important; 
            align-items: center; 
            padding: 0 20px !important; /* 左右に少し余白 */
          }
          
          /* サムネイル画像サイズ */
          .gallery-list-container > div > div:first-child { 
            width: 100% !important; /* 幅いっぱい */
            aspect-ratio: 1/1; /* 正方形 */
            height: auto !important; 
          }
        }
      `}</style>

    </motion.div>
  );
};

export default Gallery;