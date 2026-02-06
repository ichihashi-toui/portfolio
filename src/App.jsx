import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  useGLTF, 
  MeshDistortMaterial, 
  Environment, 
  ScrollControls, 
  Scroll,         
  useScroll,
  Text 
} from "@react-three/drei";
import { motion } from "framer-motion"; 
import "./App.css";

// --- 3Dモデルコンポーネント ---
function Model() {
  const { nodes } = useGLTF("model.glb");
  const firstMesh = Object.values(nodes).find((node) => node.isMesh);
  
  const meshRef = useRef();
  const materialRef = useRef();
  
  const scroll = useScroll();

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    const t = state.clock.getElapsedTime();
    const scrollOffset = scroll.offset; 

    // 1. 鼓動
    const speed = 5.0;
    let noise = (Math.sin(t * speed) + Math.sin(t * speed * 1.3)) / 2;
    noise = Math.max(0, noise);
    const pulseSharpness = 6;
    const pulse = Math.pow(noise, pulseSharpness);

    // 2. スクロール連動
    const baseScale = 1.5;
    const scrollScale = scrollOffset * 12.0; 
    const currentScale = baseScale + (pulse * 0.2) + scrollScale;
    meshRef.current.scale.set(currentScale, currentScale, currentScale);

    meshRef.current.position.y = scrollOffset * 1.5;
    meshRef.current.position.z = 0;

    // 3. 質感の変化（金属 -> 霧）
    const targetMetalness = 1.0 - (scrollOffset * 1.2); 
    materialRef.current.metalness = Math.max(0, Math.min(1, targetMetalness));

    const targetRoughness = 0.05 + (scrollOffset * 0.8);
    materialRef.current.roughness = Math.min(0.8, targetRoughness);

    const targetOpacity = 1.0 - (scrollOffset * 0.85);
    materialRef.current.opacity += (targetOpacity - materialRef.current.opacity) * 0.1;

    const baseDistort = 0.3;
    const maxDistortAdd = 0.5; 
    materialRef.current.distort = baseDistort + (pulse * maxDistortAdd) + (scrollOffset * 1.0);

    // 4. 回転
    const { x, y } = state.pointer;
    const autoRotateSpeed = 0.2;
    const beatImpact = pulse * 0.05;
    const baseRotationY = state.clock.getElapsedTime() * autoRotateSpeed;
    const mouseIntensity = 0.8;
    const scrollRotation = scrollOffset * 2.0; 

    const targetRotationX = -y * mouseIntensity + beatImpact + scrollRotation * 0.2;
    const targetRotationY = baseRotationY + (x * mouseIntensity) + beatImpact + scrollRotation;
    const smoothness = 0.1;
    
    meshRef.current.rotation.x += (targetRotationX - meshRef.current.rotation.x) * smoothness;
    meshRef.current.rotation.y += (targetRotationY - meshRef.current.rotation.y) * smoothness;
  });

  if (!firstMesh) return null;

  return (
    <group>
      <mesh ref={meshRef} geometry={firstMesh.geometry}>
        <MeshDistortMaterial
          ref={materialRef} 
          color="#ffffff"
          metalness={1.0}
          roughness={0.05}
          envMapIntensity={1.5} 
          distort={0.3} 
          speed={2}
          transparent={true} 
          opacity={1.0}
        />
      </mesh>
    </group>
  );
}

// --- 背景テキストコンポーネント ---
const BackgroundText = () => {
  const { width, height } = useThree((state) => 
    state.viewport.getCurrentViewport(state.camera, [0, 0, -2])
  );
  
  const scroll = useScroll();
  const textRef = useRef();

  useFrame(() => {
    if (textRef.current) {
      textRef.current.position.y = (height / 2 + height * 0.05) + (scroll.offset * height * 0.5);
    }
  });

  const xPosition = -width / 2 + (width * 0.03);
  const initialYPosition = height / 2 + (height * 0.05);

  return (
    <Text
      ref={textRef}
      position={[xPosition, initialYPosition, -2]} 
      fontSize={width * 0.2} 
      color="black"          
      fillOpacity={1}        
      anchorX="left"         
      anchorY="top"          
      fontWeight="900"       
    >
      Portfolio
    </Text>
  );
};

// --- First View (Top) ---
const FirstView = () => {
  return (
    <div className="section-first">
      <div className="layer-front">
        <div className="left-section">
          <h2 className="name">ichihashi<br/>toui</h2>
          <div className="bottom-info">
            <p className="year"><span className="year-accent">2023-</span></p>
            <div className="job-list">
              <p>Web Design</p>
              <p>Graphic Design</p>
              <p>Branding</p>
              <p>Photography</p>
            </div>
            <div className="tools-list">
              <p>Illustrator / Photoshop / After Effects / Lightroom /</p>
              <p>Figma / Blender / HTML / CSS / JavaScript</p>
            </div>
          </div>
        </div>
        <div className="right-section">
          <ul className="nav-list">
            <li className="nav-item"><span className="nav-number">01</span><span className="nav-text">contents</span></li>
            <li className="nav-item"><span className="nav-number">02</span><span className="nav-text">profile</span></li>
            <li className="nav-item"><span className="nav-number">03</span><span className="nav-text">gallery</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// --- Contents View (List) ---
const ContentsView = () => {
  const projects = [
    { 
      id: "01",
      cat: "Web design", 
      title: "FOMO啓発サイト", 
      stack: "Figma / HTML / CSS / JavaScript",
      date: "2026-01"
    },
    { 
      id: "02",
      cat: "Web design", 
      title: "ブランドサイト リデザイン", 
      stack: "Figma / Blender / HTML / CSS / JavaScript",
      date: "2025-11"
    },
    { 
      id: "03",
      cat: "Web design", 
      title: "メンズ美容ブランド", 
      stack: "Illustrator / Figma / Blender / HTML / CSS / JavaScript",
      date: "2026-12"
    },
    { 
      id: "04",
      cat: "Web design", 
      title: "コーポレートサイト改修", 
      stack: "Figma / Blender / After Effects / HTML / CSS",
      date: "2025.10"
    },
    { 
      id: "01",
      cat: "graphic design", 
      title: "A4展示会リーフレット", 
      stack: "Illustrator / Photoshop / Blender",
      date: "2025-06"
    },
    { 
      id: "02",
      cat: "graphic design", 
      title: "タイポグラフィアートワーク", 
      stack: "Illustrator / Photoshop",
      date: "2025-09"
    },
    { 
      id: "03",
      cat: "graphic design", 
      title: "自己表現コラージュ", 
      stack: "Illustrator / Photoshop",
      date: "2025-07"
    },
    { 
      id: "04",
      cat: "graphic design", 
      title: "危険物事故防止ポスター", 
      stack: "Illustrator / Photoshop / Blender",
      date: "2025-11"
    },
  ];

  return (
    <div className="section-contents">
      <h3 className="section-title">contents</h3>
      
      <div className="project-list-container">
        <ul className="project-list">
          {projects.map((item, index) => (
            <li key={index} className="project-item">
              <div className="item-header">
                <span className="item-cat">{item.cat} {item.id}</span>
              </div>
              <h4 className="item-title">{item.title}</h4>
              <div className="item-footer">
                <div className="item-meta">
                  <p className="item-stack">{item.stack}</p>
                  <p className="item-date">{item.date}</p>
                </div>
                <div className="item-link">
                  <span>view more</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// --- Profile View (Animated) ---
const ProfileView = () => {
  return (
    <div className="section-profile">
      <h3 className="section-title">profile</h3>
      
      <div className="profile-container">
        {/* アニメーション付きの画像 */}
        <motion.div 
          className="profile-image-wrapper"
          initial={{ opacity: 0, scale: 0.5, x: -100, rotate: -20, y: "-55%" }}
          whileInView={{ opacity: 1, scale: 1, x: 0, rotate: 0, y: "-55%" }}
          transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* publicフォルダに star.png がある前提 */}
          <img src="star.png" alt="Ichihashi Toui" className="profile-img" />
        </motion.div>

        <div className="profile-info">
          <p className="job-title">ichihashi toui</p>
          <h2 className="profile-name-ja">市橋 冬翔</h2>
          <p className="profile-name-en">ichihashi.toui@gmail.comi</p>
          
          <div className="profile-detail">
            <dl>
              <dt>birth</dt>
              <dd>2004.12.22</dd>
              <dt>location</dt>
              <dd>Aichi, Japan</dd>
            </dl>
          </div>

          <div className="profile-bio">
            <p>
              人の心に響くデザインを心がけています。平面でのデザインだけでなく、
              Blenderを使用した3DCGでのビジュアル表現にも積極的に取り組んでいます。
            </p>
          </div>

          <div className="profile-skills">
            <p className="skill-label">Software</p>
            <p className="skill-list">
              Illustrator / Photoshop / After Effects /<br />
              Figma / Blender / VS Code
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Gallery Section (6枚バージョン・キャプションなし) ---
const GalleryView = () => {
  return (
    <div className="section-gallery">
      <h3 className="section-title">gallery</h3>
      
      <div className="gallery-container">
        
        {/* 01. メイン（左上・縦長） */}
        <div className="gallery-item item-main">
          <div className="img-box">
            <img src="gallery-12.jpg" alt="Work 01" />
          </div>
        </div>

        {/* 02. サブ1（右上・横長） */}
        <div className="gallery-item item-sub1">
          <div className="img-box">
            <img src="gallery-10.jpg" alt="Work 02" />
          </div>
        </div>

        {/* 03. サブ2（右下へ移動・正方形） */}
        <div className="gallery-item item-sub2">
          <div className="img-box">
            <img src="gallery-23.jpg" alt="Work 03" />
          </div>
        </div>

        {/* 04. サブ3（左下・少し小さめ縦長） */}
        <div className="gallery-item item-sub3">
          <div className="img-box">
            <img src="gallery-14.jpg" alt="Work 04" />
          </div>
        </div>

        {/* 05. サブ4（中央・横長・重ねるアクセント用） */}
        <div className="gallery-item item-sub4">
          <div className="img-box">
            <img src="gallery-17.jpg" alt="Work 05" />
          </div>
        </div>

        {/* 06. サブ5（右側中間・小さめ正方形・隙間埋め） */}
        <div className="gallery-item item-sub5">
          <div className="img-box">
            <img src="gallery-06.jpg" alt="Work 06" />
          </div>
        </div>

        {/* View All ボタン */}
        <div className="gallery-link">
          <a href="#">view all works <span>→</span></a>
        </div>

      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="footer-section">
      <p className="copyright">@2026 Ichihashi Toui / Nagoya,JP</p>
    </footer>
  );
};

// --- Main App Component ---
export default function App() {
  return (
    <div className="container">
      <div className="hamburger-menu">
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 12], fov: 50 }}>
        {/* pagesは11のままでOKです */}
        <ScrollControls pages={6.7} damping={0.1}>
          
          <BackgroundText />
          <Model />
          
          <Scroll html style={{ width: '100%', height: '100%', zIndex: 10 }}>
            <FirstView />
            <ContentsView />
            <ProfileView />
            <GalleryView />
            
            {/* ★★★ これが抜けていました！ここに追加！ ★★★ */}
            <Footer />
            
          </Scroll>
          
        </ScrollControls>
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <Environment files="blender-env.jpeg" background={false} />
      </Canvas>
    </div>
  );
}