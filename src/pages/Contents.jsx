import React, { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture, Environment, Text } from "@react-three/drei";
import { Link } from "react-router-dom";
import * as THREE from 'three';
import "../App.css";

// ==============================================
//  データ定義（新しい構成に対応）
// ==============================================
const projects = [
  { 
    id: "01", 
    slug: "fomo",
    cat: "Web Design", 
    date: "2026.01", 
    title: "FOMO啓発サイト", 
    
    // ▼ A. 詳細ページ用の細かい情報
    role: "Design / Coding / 3D Modeling",
    tools: "Figma, VS Code, Blender, React",
    
    // ▼ C. 課題や制作意図 (Background)
    background: "現代人の多くが抱える『SNS疲れ』や『取り残される不安（FOMO）』という社会課題に着目。単なる警告ではなく、ユーザーが自発的にデジタルデトックスを行いたくなるような、心理的な誘導を目的としました。",
    
    // ▼ D. 前提 (Target / Persona)
    target: "SNSの通知に常に追われている20代〜30代の社会人",
    persona: "都内在住、IT企業勤務。常にスマホが手放せず、休息の質が下がっている。",
    
    // ▼ E. コンセプト (Concept)
    concept: "デジタルデトックスへの『優雅な』誘導",
    
    // ▼ F. 詳細（Design Points）
    points: [
      { title: "色彩の心理効果", desc: "不安を煽る彩度の高い赤から、スクロールするにつれて安らぎを感じる深い青へと遷移するグラデーションを採用し、心理的な沈静化を狙いました。" },
      { title: "3Dメタファー", desc: "情報の洪水を表現するノイズのかかったパーティクルと、クリアな思考を表す幾何学立体を対比させました。" }
    ]
  },
  { 
    id: "02", 
    slug: "redesign",
    cat: "Web Design", 
    date: "2025.11", 
    title: "ブランドサイト", 
    desc: "既存ブランドのリブランディングプロジェクト。",
    // データがない場合は空でもエラーにならないように作っています
  },
  { id: "03", cat: "Web Design", title: "メンズ美容", date: "2026.12", slug: "mens-cosme" },
  { id: "04", cat: "Web Design", title: "コーポレート", date: "2025.10", slug: "corporate" },
  { id: "05", cat: "Graphic", title: "展示会リーフレット", date: "2025.06", slug: "leaflet" },
  { id: "06", cat: "Graphic", title: "タイポグラフィ", date: "2025.09", slug: "typography" },
  { id: "07", cat: "Graphic", title: "コラージュ", date: "2025.07", slug: "collage" },
  { id: "08", cat: "Graphic", title: "ポスター制作", date: "2025.11", slug: "poster" },
];

// ==============================================
//  スタイル定義
// ==============================================
const sectionTitleStyle = {
  fontSize: '0.9rem',
  fontWeight: 'bold',
  letterSpacing: '0.1em',
  marginBottom: '20px',
  borderLeft: '4px solid #000',
  paddingLeft: '10px',
  textTransform: 'uppercase'
};

const navButtonStyle = {
  background: 'none', border: 'none', fontSize: '1.5rem', fontWeight: 'bold',
  cursor: 'pointer', padding: '10px 20px', color: '#000', transition: 'opacity 0.3s',
};

// ==============================================
//  3D機能：カメラ制御（詳細モードで寄る動き）
// ==============================================
const CameraRig = ({ isDetailMode }) => {
  useFrame((state, delta) => {
    // 詳細モードなら少しズームイン(z=9)、通常なら引き(z=10.5)
    // 詳細モードなら少し下を見る(y=-0.5)、通常なら正面(y=0)
    const targetZ = isDetailMode ? 9.0 : 10.5;
    const targetY = isDetailMode ? -0.5 : 0;

    // Math.expを使った滑らかな減衰
    const damp = (current, target, speed) => 
      THREE.MathUtils.lerp(current, target, 1 - Math.exp(-speed * delta));

    state.camera.position.z = damp(state.camera.position.z, targetZ, 2.0);
    state.camera.position.y = damp(state.camera.position.y, targetY, 2.0);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

// ==============================================
//  3Dパーツ群
// ==============================================
const DeckSlot = ({ visible }) => {
  if (!visible) return null;
  return (
    <group position={[0, -2.2, 8.5]}>
      <mesh position={[0, 1.4, 0]}><boxGeometry args={[4.2, 0.5, 3]} /><meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} /></mesh>
      <mesh position={[0, -1.4, 0]}><boxGeometry args={[4.2, 0.5, 3]} /><meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} /></mesh>
      <mesh position={[-2.35, 0, 0]}><boxGeometry args={[0.5, 3.3, 3]} /><meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} /></mesh>
      <mesh position={[2.35, 0, 0]}><boxGeometry args={[0.5, 3.3, 3]} /><meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} /></mesh>
    </group>
  );
};

const CassetteModel = ({ slug, isActive, isSelected, isOtherSelected }) => {
  const { scene } = useGLTF(import.meta.env.BASE_URL + "cassette.glb");
  const clone = useMemo(() => scene.clone(), [scene]);
  const texture = useTexture(`${import.meta.env.BASE_URL}labels/${slug}.png`);
  
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  const scaleY = 1.1; 
  texture.repeat.set(1, scaleY);
  texture.offset.set(0, (1 - scaleY) / 2);

  useFrame((state, delta) => {
    clone.traverse((child) => {
      if (child.isMesh) {
        if (!child.userData.isCloned) {
          child.material = child.material.clone();
          child.userData.isCloned = true;
          child.userData.originalColor = child.material.color.clone();
        }
        child.material.transparent = true;

        let targetOpacity = 1.0;
        let targetColorScale = 1.0;

        if (isSelected) {
          targetOpacity = 1.0;
          targetColorScale = 1.0;
        } else if (isOtherSelected) {
          targetOpacity = 0.0;
        } else if (!isActive) {
          targetOpacity = 0.2;
          targetColorScale = 0.3;
        }

        const targetColor = child.userData.originalColor.clone().multiplyScalar(targetColorScale);
        
        const damp = 1 - Math.exp(-4.0 * delta);
        child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOpacity, damp);
        child.material.color.lerp(targetColor, damp);
        
        if (child.material.name === 'CassetteLabel') {
          child.material.map = texture;
        }
      }
    });
  });

  return <primitive object={clone} />;
};

// ==============================================
//  カセット単体（アニメーション制御）
// ==============================================
const Cassette = ({ project, isActive, selectedSlug, onSelect }) => {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  const isSelected = selectedSlug === project.slug;
  const isOtherSelected = selectedSlug !== null && !isSelected;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const damp = (current, target, speed) => 
      THREE.MathUtils.lerp(current, target, 1 - Math.exp(-speed * delta));

    if (isSelected) {
      // 詳細モード：手前・下に移動して寝かせる
      const targetPos = new THREE.Vector3(0, -2.2, 8.5);
      const targetRot = new THREE.Euler(-Math.PI / 2, 0, 0);

      groupRef.current.position.x = damp(groupRef.current.position.x, targetPos.x, 3.0);
      groupRef.current.position.y = damp(groupRef.current.position.y, targetPos.y, 3.0);
      groupRef.current.position.z = damp(groupRef.current.position.z, targetPos.z, 3.0);

      groupRef.current.rotation.x = damp(groupRef.current.rotation.x, targetRot.x, 4.0);
      groupRef.current.rotation.y = damp(groupRef.current.rotation.y, targetRot.y, 4.0);
      groupRef.current.rotation.z = damp(groupRef.current.rotation.z, targetRot.z, 4.0);

    } else {
      // 通常モード：元の位置へ
      groupRef.current.position.x = damp(groupRef.current.position.x, 0, 3.0);
      groupRef.current.position.y = damp(groupRef.current.position.y, 0, 3.0);
      groupRef.current.position.z = damp(groupRef.current.position.z, 0, 3.0);

      // 浮遊アニメーション
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.02;
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0.3 + Math.sin(t * 0.8) * 0.03, 0.1);

      if (isActive && !isOtherSelected) {
        const { x, y } = state.pointer;
        groupRef.current.rotation.x = damp(groupRef.current.rotation.x, -y * 0.5, 4.0);
        groupRef.current.rotation.y = damp(groupRef.current.rotation.y, x * 0.5, 4.0);
      } else {
        groupRef.current.rotation.x = damp(groupRef.current.rotation.x, 0, 4.0);
        groupRef.current.rotation.y = damp(groupRef.current.rotation.y, 0, 4.0);
      }
    }
  });

  return (
    <group 
      ref={groupRef}
      onClick={(e) => {
        if (isActive && !selectedSlug) {
          e.stopPropagation();
          onSelect(project.slug);
        }
      }}
      onPointerOver={() => isActive && !selectedSlug && setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <CassetteModel 
        slug={project.slug} 
        isActive={isActive} 
        isSelected={isSelected}
        isOtherSelected={isOtherSelected}
      />
      {!selectedSlug && isActive && (
        <group position={[0, -0.75, 0]}>
          <Text position={[0, 0, 0]} fontSize={0.1} color="#333" anchorX="center" anchorY="top">{project.cat} / {project.date}</Text>
          <Text position={[0, -0.2, 0]} fontSize={0.16} color="#000" anchorX="center" anchorY="top" fontWeight="bold">{project.title}</Text>
          <Text position={[0, -0.45, 0]} fontSize={0.08} color="#333" anchorX="center" anchorY="top">CLICK or SCROLL DOWN</Text>
        </group>
      )}
    </group>
  );
};

// ==============================================
//  カルーセル全体
// ==============================================
const Carousel = ({ targetIndex, selectedSlug, onSelect }) => {
  const groupRef = useRef();
  const radius = 7.0; 
  const angleStep = (Math.PI * 2) / projects.length;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const targetRotationY = -targetIndex * angleStep;
    const damp = 1 - Math.exp(-3.0 * delta);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, damp);
  });

  return (
    <group ref={groupRef}>
      {projects.map((project, i) => {
        const theta = i * angleStep;
        return (
          <group key={i} position={[Math.sin(theta) * radius, 0, Math.cos(theta) * radius]} rotation={[0, theta, 0]}>
            <Cassette 
              project={project} 
              isActive={i === ((targetIndex % projects.length) + projects.length) % projects.length} 
              selectedSlug={selectedSlug}
              onSelect={onSelect}
            />
          </group>
        );
      })}
    </group>
  );
};

// ==============================================
//  メインコンポーネント
// ==============================================
export default function Contents() {
  const [targetIndex, setTargetIndex] = useState(0);
  const [selectedSlug, setSelectedSlug] = useState(null);

  const len = projects.length;
  const currentIndex = ((targetIndex % len) + len) % len;
  const selectedProject = projects.find(p => p.slug === selectedSlug);

  // 上下スクロール監視
  const handleWheel = (e) => {
    if (selectedSlug) {
      // 詳細モード時：トップにいて上にスクロールしたら閉じる
      if (window.scrollY === 0 && e.deltaY < -30) {
        setSelectedSlug(null);
      }
    } else {
      // 一覧モード時：下にスクロールしたら開く
      if (e.deltaY > 30) {
        setSelectedSlug(projects[currentIndex].slug);
      }
    }
  };

  return (
    <div 
      style={{ position: 'relative', width: '100vw', background: '#e0e0e0' }}
      onWheel={handleWheel}
    >
      {/* 1. 3Dレイヤー (Sticky) */}
      <div style={{ position: 'sticky', top: 0, width: '100vw', height: '100vh', zIndex: 1 }}>
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10.5], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={1.5} />
            <spotLight position={[0, 10, 15]} angle={0.3} penumbra={1} intensity={2} castShadow />
            <Environment files={import.meta.env.BASE_URL + "blender-env.jpeg"} background={false} />
            
            <CameraRig isDetailMode={!!selectedSlug} />
            
            <Carousel 
              targetIndex={targetIndex} 
              selectedSlug={selectedSlug} 
              onSelect={setSelectedSlug} 
            />
            <DeckSlot visible={!!selectedSlug} />
          </Suspense>
        </Canvas>

        {/* ナビゲーションUI（詳細時は非表示） */}
        {!selectedSlug && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '50%', left: '5vw', pointerEvents: 'auto' }}>
              <button onClick={() => setTargetIndex(prev => prev - 1)} style={navButtonStyle}>← PREV</button>
            </div>
            <div style={{ position: 'absolute', top: '50%', right: '5vw', pointerEvents: 'auto' }}>
              <button onClick={() => setTargetIndex(prev => prev + 1)} style={navButtonStyle}>NEXT →</button>
            </div>
            <Link to="/" style={{ position: 'absolute', top: 40, right: '5vw', pointerEvents: 'auto', color: '#000', fontWeight: 'bold' }}>Exit</Link>
          </div>
        )}
      </div>

      {/* 2. 詳細コンテンツ (HTML) */}
      {selectedSlug && selectedProject && (
        <div style={{ 
          position: 'relative', 
          zIndex: 10, 
          background: 'white', 
          minHeight: '100vh',
          marginTop: '-10vh',
          padding: '80px 5vw',
          borderRadius: '40px 40px 0 0',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.1)',
          animation: 'fadeIn 0.8s ease forwards',
          color: '#333',
          fontFamily: '"Helvetica Neue", Arial, sans-serif'
        }}>
          {/* 閉じるボタン */}
          <button 
            onClick={() => {
              setSelectedSlug(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ position: 'absolute', top: 40, right: 40, background: 'white', border: '2px solid #000', borderRadius: '50%', width: 50, height: 50, fontSize: '1.5rem', cursor: 'pointer', zIndex: 20 }}
          >
            ×
          </button>

          {/* =============================================
              A & B. 概要 + 作品イメージ（ヒーローセクション）
             ============================================= */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '60px', marginBottom: '100px', borderBottom: '1px solid #ddd', paddingBottom: '60px' }}>
            
            {/* 左側：テキスト情報 */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '20px' }}>{selectedProject.cat} / {selectedProject.date}</p>
              <h2 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 1.1, marginBottom: "40px", letterSpacing: '-0.02em' }}>
                {selectedProject.title}
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '15px', fontSize: '0.9rem', marginBottom: '40px' }}>
                <div style={{ fontWeight: 'bold', borderTop: '2px solid #000', paddingTop: '10px' }}>ROLE</div>
                <div style={{ borderTop: '1px solid #ddd', paddingTop: '10px' }}>{selectedProject.role || '-'}</div>
                
                <div style={{ fontWeight: 'bold', borderTop: '2px solid #000', paddingTop: '10px' }}>TOOLS</div>
                <div style={{ borderTop: '1px solid #ddd', paddingTop: '10px' }}>{selectedProject.tools || '-'}</div>
              </div>
            </div>

            {/* 右側：作品イメージ (Placeholder) */}
            <div style={{ flex: 1.5, minWidth: '300px' }}>
               <div style={{ width: '100%', aspectRatio: '16/9', background: '#f0f0f0', borderRadius: '8px', overflow: 'hidden' }}>
                 <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#aaa', fontSize:'1.2rem'}}>
                    Main Visual
                 </div>
               </div>
            </div>
          </div>

          {/* =============================================
              C. 課題や制作意図 (BACKGROUND)
             ============================================= */}
          {selectedProject.background && (
            <div style={{ marginBottom: '100px', maxWidth: '800px' }}>
              <h3 style={sectionTitleStyle}>BACKGROUND & INTENT</h3>
              <p style={{ fontSize: '1.1rem', lineHeight: 2.0, whiteSpace: 'pre-wrap' }}>
                {selectedProject.background}
              </p>
            </div>
          )}

          {/* =============================================
              D. 前提 (TARGET & PERSONA)
             ============================================= */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginBottom: '100px' }}>
            <div>
              <h3 style={sectionTitleStyle}>TARGET</h3>
              <p style={{ lineHeight: 1.8 }}>{selectedProject.target || "準備中"}</p>
            </div>
            <div>
              <h3 style={sectionTitleStyle}>PERSONA</h3>
              <p style={{ lineHeight: 1.8 }}>{selectedProject.persona || "準備中"}</p>
            </div>
          </div>

          {/* =============================================
              E. コンセプト (CONCEPT)
             ============================================= */}
          <div style={{ marginBottom: '120px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', letterSpacing: '0.2em', marginBottom: '30px', color: '#666' }}>CONCEPT</h3>
            <p style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 'bold', lineHeight: 1.4 }}>
              “ {selectedProject.concept || "Concept Text"} ”
            </p>
          </div>

          {/* =============================================
              F. 詳細・デザインのポイント (DESIGN POINTS)
             ============================================= */}
          <div style={{ marginBottom: '100px' }}>
            <h3 style={sectionTitleStyle}>DESIGN POINTS</h3>
            
            {selectedProject.points ? selectedProject.points.map((point, index) => (
              <div key={index} style={{ display: 'flex', flexWrap: 'wrap', gap: '60px', marginBottom: '80px', alignItems: 'center', flexDirection: index % 2 === 0 ? 'row' : 'row-reverse' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <div style={{ width: '100%', aspectRatio: '4/3', background: '#f5f5f5', borderRadius: '4px' }}>
                    {/* Image Placeholder */}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <h4 style={{ fontSize: '1.4rem', marginBottom: '20px', fontWeight: 'bold' }}>{String(index + 1).padStart(2, '0')}. {point.title}</h4>
                  <p style={{ lineHeight: 1.8, fontSize: '1rem' }}>{point.desc}</p>
                </div>
              </div>
            )) : <p>ポイント情報は準備中です。</p>}
          </div>

          <div style={{ height: '100px' }} />
        </div>
      )}
    </div>
  );
}