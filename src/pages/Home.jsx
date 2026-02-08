import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  useGLTF, 
  MeshDistortMaterial, 
  Environment, 
  ScrollControls, 
  Scroll,         
  useScroll,
  Text,
  PresentationControls
} from "@react-three/drei";
import { motion } from "framer-motion"; 
import "../App.css";

// --- 3Dモデルコンポーネント ---
function Model() {
  const { nodes } = useGLTF(import.meta.env.BASE_URL + "model.glb");
  const firstMesh = Object.values(nodes).find((node) => node.isMesh);
  
  const meshRef = useRef();
  const materialRef = useRef();
  const scroll = useScroll();

  // ★回転速度の管理（初期値: Y軸に少しだけ回しておく）
  // velocity: 現在の回転スピード
  const velocity = useRef({ x: 0, y: 0.5 }); 
  // isDragging: 触っている最中かどうか
  const isDragging = useRef(false);
  // prevPointer: 1フレーム前の指の位置
  const prevPointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    
    // --- 1. 質感・鼓動・スクロール（演出部分） ---
    const t = state.clock.getElapsedTime();
    const scrollOffset = scroll.offset; 

    // 鼓動
    const speed = 5.0;
    let noise = (Math.sin(t * speed) + Math.sin(t * speed * 1.3)) / 2;
    noise = Math.max(0, noise);
    const pulse = Math.pow(noise, 6);

    // サイズ（スマホ判定は省略し、レスポンシブな計算を入れるのもありですが、一旦シンプルに）
    const isMobile = window.innerWidth <= 1024;
    const baseScale = isMobile ? 1.1 : 1.5; 
    const scrollScale = scrollOffset * 12.0; 
    const currentScale = baseScale + (pulse * 0.2) + scrollScale;
    meshRef.current.scale.set(currentScale, currentScale, currentScale);
    
    // 位置・質感
    meshRef.current.position.y = scrollOffset * 1.5;
    
    const targetMetalness = 1.0 - (scrollOffset * 1.2); 
    materialRef.current.metalness = Math.max(0, Math.min(1, targetMetalness));
    const targetRoughness = 0.05 + (scrollOffset * 0.8);
    materialRef.current.roughness = Math.min(0.8, targetRoughness);
    materialRef.current.distort = 0.3 + (pulse * 0.5) + (scrollOffset * 1.0);


    // --- 2. 回転ロジック（ここが核心！） ---
    
    // 指でドラッグしていない時だけ、慣性と自動回転を適用
    if (!isDragging.current) {
      // 減速処理（摩擦）：毎フレーム 0.95倍 してスピードを落とす
      velocity.current.x *= 0.95;
      velocity.current.y *= 0.95;

      // ★最低速度の維持（止まらないようにする）
      const minSpeed = 0.5; // この数字で「アイドリング時の速さ」が決まります
      
      // X軸（縦回転）は自然に止める
      if (Math.abs(velocity.current.x) < 0.01) velocity.current.x = 0;

      // Y軸（横回転）は minSpeed 以下になったら、その速度をキープする
      if (Math.abs(velocity.current.y) < minSpeed) {
        // 現在の方向（プラスかマイナスか）を保ったまま、minSpeedにする
        const direction = Math.sign(velocity.current.y) || 1; // 0なら1(正回転)
        velocity.current.y = minSpeed * direction;
      }
    }

    // 計算した速度を、実際の回転に適用（deltaを掛けて滑らかに）
    meshRef.current.rotation.x += velocity.current.x * delta;
    meshRef.current.rotation.y += velocity.current.y * delta;
  });

  // --- 3. 操作イベントハンドラ ---
  
  const onPointerDown = (e) => {
    // 触った瞬間フラグを立てる
    isDragging.current = true;
    // 現在の指の位置を記憶
    prevPointer.current = { x: e.clientX, y: e.clientY };
    // ブラウザのスクロール等を防ぐ（タッチ操作を独占）
    e.target.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (isDragging.current) {
      // 移動量を計算
      const deltaX = e.clientX - prevPointer.current.x;
      const deltaY = e.clientY - prevPointer.current.y;

      // 移動量＝回転速度として適用（感度はここで調整）
      // Y軸回転はXの移動、X軸回転はYの移動に対応
      velocity.current.y = deltaX * 0.25; // 横に動かすとY軸が回る
      velocity.current.x = deltaY * 0.25; // 縦に動かすとX軸が回る

      // 次のフレームのために位置を更新
      prevPointer.current = { x: e.clientX, y: e.clientY };
    }
  };

  const onPointerUp = (e) => {
    isDragging.current = false;
    e.target.releasePointerCapture(e.pointerId);
    // 指を離した瞬間の速度(velocity)がそのまま useFrame に引き継がれ、
    // 慣性で回り続けます
  };

  if (!firstMesh) return null;

  return (
    <group>
      <mesh 
        ref={meshRef} 
        geometry={firstMesh.geometry}
        // イベントをメッシュに直接つける
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp} // 画面外に出た時も離した扱いに
      >
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
  // 1. 3D空間のサイズ（配置計算用）
  const { width, height } = useThree((state) => 
    state.viewport.getCurrentViewport(state.camera, [0, 0, -2])
  );
  
  // 2. ★修正: 画面の「ピクセルサイズ」を取得（判定用）
  const { size } = useThree(); 

  // ★修正: CSSのメディアクエリと同じ「768px」で判定する！
  // これでPC/スマホの切り替えタイミングがCSSと完全に一致します
  const isMobile = size.width <= 768;

  const topMarginVh = isMobile ? 0.17 : 0.05; 
  
  // スマホの時は文字を小さく (0.11倍)、PCなら (0.18倍)
  const responsiveSize = isMobile 
    ? width * 0.29
    : Math.max(width * 0.18, 2.5);

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
      ref={textRef}
      position={[xPosition, initialYPosition, -2]} 
      fontSize={responsiveSize} 
      color="black"
      fillOpacity={1}        
      anchorX="left"
      anchorY="top"       
      font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
      fontWeight="900"
      letterSpacing={-0.05}
    >
      Portfolio
    </Text>
  );
};

// --- 各セクション ---
const FirstView = () => (
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
          <li className="nav-item">
            <span className="nav-number">01</span>
            {/* リンクに変更 */}
            <Link to="/contents" className="nav-text">contents</Link>
          </li>
          <li className="nav-item">
            <span className="nav-number">02</span>
            <Link to="/profile" className="nav-text">profile</Link>
          </li>
          <li className="nav-item">
            <span className="nav-number">03</span>
            <Link to="/gallery" className="nav-text">gallery</Link>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

const ContentsView = () => {
  const projects = [
    { id: "01", cat: "Web design", title: "FOMO啓発サイト", stack: "Figma / HTML / CSS / JavaScript", date: "2026-01" },
    { id: "02", cat: "Web design", title: "ブランドサイト リデザイン", stack: "Figma / Blender / HTML / CSS / JavaScript", date: "2025-11" },
    { id: "03", cat: "Web design", title: "メンズ美容ブランド", stack: "Illustrator / Figma / Blender / HTML / CSS / JavaScript", date: "2026-12" },
    { id: "04", cat: "Web design", title: "コーポレートサイト改修", stack: "Figma / Blender / After Effects / HTML / CSS", date: "2025.10" },
    { id: "01", cat: "graphic design", title: "A4展示会リーフレット", stack: "Illustrator / Photoshop / Blender", date: "2025-06" },
    { id: "02", cat: "graphic design", title: "タイポグラフィアートワーク", stack: "Illustrator / Photoshop", date: "2025-09" },
    { id: "03", cat: "graphic design", title: "自己表現コラージュ", stack: "Illustrator / Photoshop", date: "2025-07" },
    { id: "04", cat: "graphic design", title: "危険物事故防止ポスター", stack: "Illustrator / Photoshop / Blender", date: "2025-11" },
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
                <div className="item-link"><span>view more</span></div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const ProfileView = () => (
  <div className="section-profile">
    <h3 className="section-title">profile</h3>
    <div className="profile-container">
      <motion.div 
        className="profile-image-wrapper"
        initial={{ opacity: 0, scale: 0.5, x: -100, rotate: -20, y: "-55%" }}
        whileInView={{ opacity: 1, scale: 1, x: 0, rotate: 0, y: "-55%" }}
        transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.2 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <img src={import.meta.env.BASE_URL + "star.png"} alt="Ichihashi Toui" className="profile-img" />
      </motion.div>

      <div className="profile-info">
        <p className="job-title">ichihashi toui</p>
        <h2 className="profile-name-ja">市橋 冬翔</h2>
        <p className="profile-name-en">ichihashi.toui@gmail.com</p>
        
        <div className="profile-detail">
          <dl>
            <dt>birth</dt><dd>2004.12.22</dd>
            <dt>location</dt><dd>Aichi, Japan</dd>
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
            Illustrator / Photoshop / Indesign / After Effects / Lightroom /  Figma / Blender / VS Code
          </p>
        </div>
      </div>
    </div>
  </div>
);

const GalleryView = () => (
  <div className="section-gallery">
    <h3 className="section-title">gallery</h3>
    <div className="gallery-container">
      <div className="gallery-item item-main"><div className="img-box"><img src={import.meta.env.BASE_URL + "gallery-12.jpg"} alt="Work" /></div></div>
      <div className="gallery-item item-sub1"><div className="img-box"><img src={import.meta.env.BASE_URL + "gallery-10.jpg"} alt="Work" /></div></div>
      <div className="gallery-item item-sub2"><div className="img-box"><img src={import.meta.env.BASE_URL + "gallery-23.jpg"} alt="Work" /></div></div>
      <div className="gallery-item item-sub3"><div className="img-box"><img src={import.meta.env.BASE_URL + "gallery-14.jpg"} alt="Work" /></div></div>
      <div className="gallery-item item-sub4"><div className="img-box"><img src={import.meta.env.BASE_URL + "gallery-17.jpg"} alt="Work" /></div></div>
      <div className="gallery-item item-sub5"><div className="img-box"><img src={import.meta.env.BASE_URL + "gallery-06.jpg"} alt="Work" /></div></div>
      <div className="gallery-link"><a href="#">view all works <span>→</span></a></div>
    </div>
  </div>
);

const Footer = () => (
  <footer className="footer-section">
    <p className="copyright">@2026 Ichihashi Toui / Nagoya,JP</p>
  </footer>
);

// --- 自動高さ計算ラッパー ---
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

  return (
    <div className="container">
      <div className="hamburger-menu">
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      <Canvas 
        dpr={[1, 1.5]} 
        camera={{ position: [0, 0, 12], fov: 50 }}
        /* ★重要：touchAction: 'pan-y' に設定！ */
        /* これにより「縦スワイプはスクロール」「横スワイプはCanvas操作」にブラウザが振り分けてくれます */
        style={{ touchAction: 'pan-y' }} 
      >
        <ScrollControls pages={pages} damping={0.1}>
          <BackgroundText />
          <Model />
          
          {/* pointerEvents: 'none' でHTMLレイヤーを貫通させ、下のモデルに触れるようにする */}
          <Scroll html style={{ width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}>
            <ContentWrapper setPages={setPages}>
              <FirstView />
              <ContentsView />
              <ProfileView />
              <GalleryView />
              <Footer />
            </ContentWrapper>
          </Scroll>
        </ScrollControls>
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <Environment files={import.meta.env.BASE_URL + "blender-env.jpeg"} background={false} />
      </Canvas>
    </div>
  );
}