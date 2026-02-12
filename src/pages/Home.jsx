import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  useGLTF, 
  MeshDistortMaterial, 
  Environment, 
  ScrollControls, 
  Scroll,         
  useScroll,
  Text,
  useTexture, // ★必須: 画像読み込み用
} from "@react-three/drei";
import { motion } from "framer-motion"; 
import { useNavigate } from "react-router-dom";
import * as THREE from "three"; // ★必須: マッピング設定用
import "../App.css";

// Preload model
useGLTF.preload(import.meta.env.BASE_URL + "model.glb");

// --- ★修正: テクスチャ読み込み用コンポーネント ---
const EnvMap = () => {
  // .png を読み込む
  const texture = useTexture(import.meta.env.BASE_URL + "blender-env.png");
  
  // ★重要: 環境マップとして正しく反射させるための設定
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  return <Environment map={texture} background={false} />;
};

// --- 3D Model ---
function Model() {
  const { nodes } = useGLTF(import.meta.env.BASE_URL + "model.glb");
  const firstMesh = Object.values(nodes).find((node) => node.isMesh);
  
  const meshRef = useRef();
  const materialRef = useRef();
  const scroll = useScroll();

  const velocity = useRef({ x: 0, y: 0.5 }); 
  const isDragging = useRef(false);
  const prevPointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    
    const t = state.clock.getElapsedTime();
    const scrollOffset = scroll.offset; 

    const speed = 5.0;
    let noise = (Math.sin(t * speed) + Math.sin(t * speed * 1.3)) / 2;
    noise = Math.max(0, noise);
    const pulse = Math.pow(noise, 6);

    const isMobile = window.innerWidth <= 1024;
    const baseScale = isMobile ? 1.1 : 1.5; 
    const scrollScale = scrollOffset * 12.0; 
    const currentScale = baseScale + (pulse * 0.2) + scrollScale;
    meshRef.current.scale.set(currentScale, currentScale, currentScale);
    
    meshRef.current.position.y = scrollOffset * 1.5;
    
    const targetMetalness = 1.0 - (scrollOffset * 1.2); 
    materialRef.current.metalness = Math.max(0, Math.min(1, targetMetalness));
    const targetRoughness = 0.05 + (scrollOffset * 0.8);
    materialRef.current.roughness = Math.min(0.8, targetRoughness);
    materialRef.current.distort = 0.3 + (pulse * 0.5) + (scrollOffset * 1.0);

    if (!isDragging.current) {
      velocity.current.x *= 0.95;
      velocity.current.y *= 0.95;
      const minSpeed = 0.5; 
      if (Math.abs(velocity.current.x) < 0.01) velocity.current.x = 0;
      if (Math.abs(velocity.current.y) < minSpeed) {
        const direction = Math.sign(velocity.current.y) || 1; 
        velocity.current.y = minSpeed * direction;
      }
    }
    meshRef.current.rotation.x += velocity.current.x * delta;
    meshRef.current.rotation.y += velocity.current.y * delta;
  });

  const onPointerDown = (e) => { isDragging.current = true; prevPointer.current = { x: e.clientX, y: e.clientY }; e.target.setPointerCapture(e.pointerId); };
  const onPointerMove = (e) => { if (isDragging.current) { const deltaX = e.clientX - prevPointer.current.x; const deltaY = e.clientY - prevPointer.current.y; velocity.current.y = deltaX * 0.25; velocity.current.x = deltaY * 0.25; prevPointer.current = { x: e.clientX, y: e.clientY }; } };
  const onPointerUp = (e) => { isDragging.current = false; e.target.releasePointerCapture(e.pointerId); };

  if (!firstMesh) return null;

  return (
    <group>
      <mesh 
        ref={meshRef} geometry={firstMesh.geometry}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp} 
      >
        <MeshDistortMaterial
          ref={materialRef} color="#ffffff" metalness={1.0} roughness={0.05}
          envMapIntensity={1.5} distort={0.3} speed={2} transparent={true} opacity={1.0}
        />
      </mesh>
    </group>
  );
}

// --- Background Text ---
const BackgroundText = () => {
  const { width, height } = useThree((state) => state.viewport.getCurrentViewport(state.camera, [0, 0, -2]));
  const { size } = useThree(); 
  const isMobile = size.width <= 768;
  const topMarginVh = isMobile ? 0.17 : 0.05; 
  const responsiveSize = isMobile ? width * 0.29 : Math.max(width * 0.18, 2.5);
  const marginPercentage = 0.035;
  const scroll = useScroll();
  const textRef = useRef();

  useFrame(() => {
    if (textRef.current) {
      const startY = (height / 2) - (height * topMarginVh);
      textRef.current.position.y = startY + (scroll.offset * 5.0);
    }
  });

  const xPosition = -width / 2 + (width * marginPercentage);
  const initialYPosition = (height / 2) - (height * topMarginVh);

  return (
    <Text
      ref={textRef} position={[xPosition, initialYPosition, -2]} 
      fontSize={responsiveSize} color="black" fillOpacity={1} anchorX="left" anchorY="top"       
      font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
      fontWeight="900" letterSpacing={-0.05}
    >
      Portfolio
    </Text>
  );
};

// --- FirstView ---
const FirstView = ({ navigate }) => (
  <div className="section-first">
    <div className="layer-front">
      <div className="left-section">
        <h2 className="name">ichihashi<br/>toui</h2>
        <div className="bottom-info">
          <p className="year"><span className="year-accent">2023-</span></p>
          <div className="job-list"><p>Web Design</p><p>Graphic Design</p><p>Branding</p><p>Photography</p></div>
          <div className="tools-list"><p>Illustrator / Photoshop / After Effects / Lightroom /</p><p>Figma / Blender / HTML / CSS / JavaScript</p></div>
        </div>
      </div>
      <div className="right-section">
        <ul className="nav-list">
          <li className="nav-item"><span className="nav-number">01</span><div className="nav-text" onClick={() => navigate('/contents')} style={{ cursor: 'pointer', pointerEvents: 'auto', position: 'relative', zIndex: 1000, padding: '15px' }}>contents</div></li>
          <li className="nav-item"><span className="nav-number">02</span><div className="nav-text" onClick={() => navigate('/profile')} style={{ cursor: 'pointer', pointerEvents: 'auto', position: 'relative', zIndex: 1000, padding: '15px' }}>profile</div></li>
          <li className="nav-item"><span className="nav-number">03</span><div className="nav-text" onClick={() => navigate('/gallery')} style={{ cursor: 'pointer', pointerEvents: 'auto', position: 'relative', zIndex: 1000, padding: '15px' }}>gallery</div></li>
        </ul>
      </div>
    </div>
  </div>
);

// --- ContentsView ---
const ContentsView = ({ navigate }) => {
  const projects = [
    { id: "01", cat: "Web design", title: "FOMO啓発サイト", stack: "Figma / HTML / CSS / JavaScript", date: "2026-01", slug: "fomo" },
    { id: "02", cat: "Web design", title: "ブランドサイト リデザイン", stack: "Figma / Blender / HTML / CSS / JavaScript", date: "2025-11", slug: "redesign" },
    { id: "03", cat: "Web design", title: "メンズ美容ブランド", stack: "Illustrator / Figma / Blender / HTML / CSS / JavaScript", date: "2026-12", slug: "mens-cosme" },
    { id: "04", cat: "Web design", title: "コーポレートサイト改修", stack: "Figma / Blender / After Effects / HTML / CSS", date: "2025.10", slug: "corporate" },
    { id: "05", cat: "graphic design", title: "A4展示会リーフレット", stack: "Illustrator / Photoshop / Blender", date: "2025-06", slug: "leaflet" },
    { id: "06", cat: "graphic design", title: "タイポグラフィアートワーク", stack: "Illustrator / Photoshop", date: "2025-09", slug: "typography" },
    { id: "07", cat: "graphic design", title: "自己表現コラージュ", stack: "Illustrator / Photoshop", date: "2025-07", slug: "collage" },
    { id: "08", cat: "graphic design", title: "危険物事故防止ポスター", stack: "Illustrator / Photoshop / Blender", date: "2025-11", slug: "poster" },
  ];

  return (
    <div className="section-contents">
      <h3 className="section-title">contents</h3>
      <div className="project-list-container" style={{ border: '2px solid #000', padding: '0', background: '#fff' }}>
        <ul className="project-list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {projects.map((item, index) => (
            <li 
              key={index} 
              className="project-item" 
              onClick={() => navigate('/contents', { state: { targetSlug: item.slug } })}
              style={{ 
                cursor: 'pointer', 
                padding: '1.5rem', 
                borderBottom: index !== projects.length - 1 ? '1px solid #ddd' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px'
              }}
            >
              <div className="item-header"><span className="item-cat" style={{fontSize: '0.8rem', fontWeight:'bold', textTransform:'uppercase'}}>{item.cat} {item.id}</span></div>
              <h4 className="item-title" style={{fontSize: '1.2rem', margin:'5px 0'}}>{item.title}</h4>
              <div className="item-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <div className="item-meta">
                  <p className="item-stack" style={{fontSize: '0.8rem', color: '#666'}}>{item.stack}</p>
                  <p className="item-date" style={{fontSize: '0.8rem', color: '#666'}}>{item.date}</p>
                </div>
                <div className="item-link" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>view more →</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// --- ProfileView ---
const ProfileView = ({ navigate }) => (
  <div className="section-profile" style={{ position: 'relative', zIndex: 5 }}>
    <h3 className="section-title">profile</h3>
    <div className="home-profile-wrapper" style={{ 
      width: '100%', 
      margin: '0 auto', 
      padding: '40px', 
      background: '#fff', 
      border: '2px solid #000', 
      boxSizing: 'border-box'
    }}>
      <style>{`
        .home-profile-content {
          display: flex;
          gap: 5%;
          align-items: center;
          justify-content: space-between;
        }
        .home-profile-img-box {
          width: 40%;
          aspect-ratio: 3/4;
          flex-shrink: 0;
          background-color: #eee;
          overflow: hidden;
          cursor: pointer;
        }
        .home-profile-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .home-profile-img-box:hover img {
          transform: scale(1.05);
        }
        .home-profile-text {
          flex: 1;
        }
        @media (max-width: 768px) {
          .home-profile-content {
            flex-direction: column;
            gap: 40px;
          }
          .home-profile-img-box {
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
          }
        }
      `}</style>
      
      <div className="home-profile-content">
        <motion.div 
          className="home-profile-img-box"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.3 }}
          onClick={() => navigate('/profile')}
        >
          <img src={import.meta.env.BASE_URL + "star.jpg"} alt="Ichihashi Toui" />
        </motion.div>

        <motion.div 
          className="home-profile-text"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <p className="job-title" style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px', letterSpacing: '0.1em' }}>GRAPHIC / WEB DESIGNER</p>
          <h2 className="profile-name-en" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: '900', lineHeight: 1, marginBottom: '10px' }}>ICHIHASHI TOUI</h2>
          <p className="profile-name-ja" style={{ fontSize: '1rem', color: '#666', marginBottom: '30px' }}>市橋 冬翔</p>
          
          <div className="profile-bio" style={{ marginBottom: '30px', lineHeight: 1.8, fontSize: '0.95rem' }}>
            <p>
              人の心に響くデザインを心がけています。平面でのデザインだけでなく、
              Blenderを使用した3DCGでのビジュアル表現にも積極的に取り組んでいます。
            </p>
          </div>
          
          <dl className="profile-detail" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px', marginBottom: '30px', fontSize: '0.9rem' }}>
            <dt style={{ fontWeight: 'bold' }}>BIRTH</dt><dd>2004.12.22</dd>
            <dt style={{ fontWeight: 'bold' }}>LOCATION</dt><dd>Aichi, Japan</dd>
          </dl>

          <div 
            onClick={() => navigate('/profile')} 
            style={{ display: 'inline-block', borderBottom: '1px solid #000', paddingBottom: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.05em' }}
          >
            VIEW MORE →
          </div>
        </motion.div>
      </div>
    </div>
  </div>
);

// --- GalleryView ---
const GalleryView = ({ navigate }) => (
  <div className="section-gallery">
    <h3 className="section-title">gallery</h3>
    {/* ★修正: クラス名を変更し、PCは3列、スマホは2列のグリッドに固定 */}
    <div className="home-gallery-grid" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)', // PCデフォルトは3列
      gap: '20px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <style>{`
        /* メディアクエリでスマホだけ2列にする */
        @media (max-width: 768px) {
          .home-gallery-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
        }
      `}</style>

      {/* 画像データ (6枚) */}
      {[
        { src: "gallery-12.jpg", id: 1 },
        { src: "gallery-10.jpg", id: 2 },
        { src: "gallery-23.jpg", id: 3 },
        { src: "gallery-14.jpg", id: 4 },
        { src: "gallery-17.jpg", id: 5 },
        { src: "gallery-06.jpg", id: 6 },
      ].map((item) => (
        <div 
          key={item.id} 
          onClick={() => navigate('/gallery')}
          style={{ 
            aspectRatio: '1/1', 
            border: '2px solid #000', 
            background: '#fff',
            overflow: 'hidden',
            cursor: 'pointer',
            display: 'block'
          }}
        >
          <img 
            src={import.meta.env.BASE_URL + item.src} 
            alt="Work" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
      ))}
    </div>
    <div className="gallery-link" style={{ textAlign: 'right', padding: '30px 5vw 0' }}>
      <span onClick={() => navigate('/gallery')} style={{ cursor: 'pointer', padding: '10px 0', display: 'inline-block', fontWeight: 'bold', fontSize: '1.2rem' }}>
        view all works <span>→</span>
      </span>
    </div>
  </div>
);

const Footer = () => (
  <footer className="footer-section">
    <p className="copyright">@2026 Ichihashi Toui / Nagoya,JP</p>
  </footer>
);

// --- ContentWrapper ---
const ContentWrapper = ({ setPages, children }) => {
  const ref = useRef();
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        const contentHeight = entry.contentRect.height;
        const viewportHeight = window.innerHeight;
        setPages(contentHeight / viewportHeight);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [setPages]);
  return <div ref={ref} style={{ width: "100vw" }}>{children}</div>;
};

// --- Main App ---
export default function Home() {
  const [pages, setPages] = useState(7); 
  const navigate = useNavigate();

  return (
    <div className="container">
      <Canvas 
        dpr={[1, 1.5]} 
        camera={{ position: [0, 0, 12], fov: 50 }}
        style={{ touchAction: 'pan-y' }} 
      >
        <Suspense fallback={null}>
          <ScrollControls pages={pages} damping={0.1}>
            <BackgroundText />
            <Model />
            
            <Scroll html style={{ width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}>
              <ContentWrapper setPages={setPages}>
                <FirstView navigate={navigate} />
                <ContentsView navigate={navigate} />
                <ProfileView navigate={navigate} />
                <GalleryView navigate={navigate} />
                <Footer />
              </ContentWrapper>
            </Scroll>
          </ScrollControls>
          
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
          
          {/* ★修正: .png対応版のEnvMapコンポーネントを使用 */}
          <EnvMap />
        </Suspense>
      </Canvas>
    </div>
  );
}