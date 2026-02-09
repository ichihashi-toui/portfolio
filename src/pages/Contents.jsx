import React, { useRef, useState, useMemo, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture, Environment, Text } from "@react-three/drei";
import { Link } from "react-router-dom";
import * as THREE from 'three';
import "../App.css";

// ==============================================
//  データ定義
// ==============================================
const projects = [
  { 
    id: "01", 
    slug: "fomo",
    cat: "Web Design", // "Web" は固有名詞扱いとしてそのまま
    date: "2026.01", 
    title: "FOMO啓発サイト", 
    themeColor: "#e63946", 
    // ★修正: 役割などは一般名詞なので小文字に統一 (スイススタイル)
    role: "design / coding / 3d modeling",
    // ツール名は固有名詞なのでそのまま
    tools: "Figma, VS Code, Blender, React",
    background: "現代人の多くが抱える『SNS疲れ』や『取り残される不安（FOMO）』という社会課題に着目。単なる警告ではなく、ユーザーが自発的にデジタルデトックスを行いたくなるような、心理的な誘導を目的としました。",
    target: "SNSの通知に常に追われている20代〜30代の社会人",
    persona: "都内在住、IT企業勤務。常にスマホが手放せず、休息の質が下がっている。",
    concept: "デジタルデトックスへの『優雅な』誘導",
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
    themeColor: "#1d3557",
    desc: "既存ブランドのリブランディングプロジェクト。",
  },
  { id: "03", cat: "Web Design", title: "メンズ美容", date: "2026.12", slug: "mens-cosme", themeColor: "#333333" },
  { id: "04", cat: "Web Design", title: "コーポレート", date: "2025.10", slug: "corporate", themeColor: "#2a9d8f" },
  { id: "05", cat: "Graphic", title: "展示会リーフレット", date: "2025.06", slug: "leaflet", themeColor: "#e9c46a" },
  { id: "06", cat: "Graphic", title: "タイポグラフィ", date: "2025.09", slug: "typography", themeColor: "#f4a261" },
  { id: "07", cat: "Graphic", title: "コラージュ", date: "2025.07", slug: "collage", themeColor: "#264653" },
  { id: "08", cat: "Graphic", title: "ポスター制作", date: "2025.11", slug: "poster", themeColor: "#457b9d" },
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
  // ★修正: uppercase (強制大文字) を削除。これで小文字が表示可能に。
  // textTransform: 'uppercase' 
};

const navButtonStyle = {
  background: 'none', border: 'none', fontSize: '1.5rem', fontWeight: 'bold',
  cursor: 'pointer', padding: '10px 20px', color: '#000', transition: 'opacity 0.3s',
};

// ==============================================
//  コンポーネント：カセットヘッダー
// ==============================================
const CassetteHeader = ({ project }) => {
  const screwStyle = {
    width: '12px', height: '12px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #555, #222)',
    boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.2)',
    position: 'absolute', top: '50%', transform: 'translateY(-50%)'
  };

  return (
    <div style={{
      width: '100%',
      height: '60px',
      background: '#1a1a1a',
      borderRadius: '8px 8px 0 0',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.1)'
    }}>
      <div style={{ ...screwStyle, left: '20px' }} />
      <div style={{
        width: '60%', height: '40px', background: '#fff', borderRadius: '4px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)'
      }}>
        <img src={`${import.meta.env.BASE_URL}labels/${project.slug}.png`} alt="" style={{ width: '100%', height: '300%', objectFit: 'cover', opacity: 0.9 }} />
        <div style={{ position: 'absolute', top:0, left:0, width:'100%', height:'100%', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)' }} />
      </div>
      <div style={{ ...screwStyle, right: '20px' }} />
    </div>
  );
};

// ==============================================
//  3D機能
// ==============================================
const CameraRig = ({ isDetailMode }) => {
  useFrame((state, delta) => {
    const targetZ = isDetailMode ? 9.0 : 10.5;
    const targetY = isDetailMode ? -0.5 : 0;
    const damp = (current, target, speed) => 
      THREE.MathUtils.lerp(current, target, 1 - Math.exp(-speed * delta));

    state.camera.position.z = damp(state.camera.position.z, targetZ, 2.0);
    state.camera.position.y = damp(state.camera.position.y, targetY, 2.0);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

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

const Cassette = ({ project, isActive, selectedSlug, onSelect }) => {
  const groupRef = useRef();
  const isSelected = selectedSlug === project.slug;
  const isOtherSelected = selectedSlug !== null && !isSelected;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const damp = (current, target, speed) => 
      THREE.MathUtils.lerp(current, target, 1 - Math.exp(-speed * delta));

    if (isSelected) {
      const targetPos = new THREE.Vector3(0, -2.2, 8.5);
      const targetRot = new THREE.Euler(-Math.PI / 2, 0, 0);
      groupRef.current.position.x = damp(groupRef.current.position.x, targetPos.x, 3.0);
      groupRef.current.position.y = damp(groupRef.current.position.y, targetPos.y, 3.0);
      groupRef.current.position.z = damp(groupRef.current.position.z, targetPos.z, 3.0);
      groupRef.current.rotation.x = damp(groupRef.current.rotation.x, targetRot.x, 4.0);
      groupRef.current.rotation.y = damp(groupRef.current.rotation.y, targetRot.y, 4.0);
      groupRef.current.rotation.z = damp(groupRef.current.rotation.z, targetRot.z, 4.0);
    } else {
      groupRef.current.position.x = damp(groupRef.current.position.x, 0, 3.0);
      groupRef.current.position.y = damp(groupRef.current.position.y, 0, 3.0);
      groupRef.current.position.z = damp(groupRef.current.position.z, 0, 3.0);
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
    >
      <CassetteModel slug={project.slug} isActive={isActive} isSelected={isSelected} isOtherSelected={isOtherSelected} />
      {!selectedSlug && isActive && (
        <group position={[0, -0.75, 0]}>
          <Text position={[0, 0, 0]} fontSize={0.1} color="#333" anchorX="center" anchorY="top">{project.cat} / {project.date}</Text>
          <Text position={[0, -0.2, 0]} fontSize={0.16} color="#000" anchorX="center" anchorY="top" fontWeight="bold">{project.title}</Text>
          {/* ★修正: 小文字化 */}
          <Text position={[0, -0.45, 0]} fontSize={0.08} color="#333" anchorX="center" anchorY="top">click or scroll down</Text>
        </group>
      )}
    </group>
  );
};

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
            <Cassette project={project} isActive={i === ((targetIndex % projects.length) + projects.length) % projects.length} selectedSlug={selectedSlug} onSelect={onSelect} />
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
  
  const upScrollBuffer = useRef(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (selectedSlug) {
      window.scrollTo(0, 0);
      upScrollBuffer.current = 0;
      document.body.style.overflow = "hidden";
      setIsLocked(true);
      const timer = setTimeout(() => {
        document.body.style.overflow = "";
        setIsLocked(false);
      }, 800);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    }
  }, [selectedSlug]);

  const handleWheel = (e) => {
    if (selectedSlug) {
      if (isLocked) return;
      if (window.scrollY <= 10) {
        if (e.deltaY < 0) {
           upScrollBuffer.current += e.deltaY;
        } else {
           upScrollBuffer.current = 0;
        }
        if (upScrollBuffer.current < -300) {
          setSelectedSlug(null);
          upScrollBuffer.current = 0;
        }
      } else {
        upScrollBuffer.current = 0;
      }
    } else {
      if (e.deltaY > 30) {
        setSelectedSlug(projects[currentIndex].slug);
      }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', background: '#e0e0e0' }} onWheel={handleWheel}>
      <div style={{ position: 'sticky', top: 0, width: '100vw', height: '100vh', zIndex: 1 }}>
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10.5], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={1.5} />
            <spotLight position={[0, 10, 15]} angle={0.3} penumbra={1} intensity={2} castShadow />
            <Environment files={import.meta.env.BASE_URL + "blender-env.jpeg"} background={false} />
            <CameraRig isDetailMode={!!selectedSlug} />
            <Carousel targetIndex={targetIndex} selectedSlug={selectedSlug} onSelect={setSelectedSlug} />
            <DeckSlot visible={!!selectedSlug} />
          </Suspense>
        </Canvas>

        {!selectedSlug && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '50%', left: '5vw', pointerEvents: 'auto' }}>
              <button onClick={() => setTargetIndex(prev => prev - 1)} style={navButtonStyle}>← PREV</button>
            </div>
            <div style={{ position: 'absolute', top: '50%', right: '5vw', pointerEvents: 'auto' }}>
              <button onClick={() => setTargetIndex(prev => prev + 1)} style={navButtonStyle}>NEXT →</button>
            </div>
            <Link to="/" style={{ position: 'absolute', top: 40, right: '5vw', pointerEvents: 'auto', color: '#000', fontWeight: 'bold' }}>exit</Link>
          </div>
        )}
      </div>

      {selectedSlug && selectedProject && (
        <div style={{ 
          position: 'relative', 
          zIndex: 10, 
          marginTop: '-100vh',
          animation: 'fadeIn 0.8s ease forwards',
          fontFamily: '"Helvetica Neue", Arial, sans-serif'
        }}>
          <CassetteHeader project={selectedProject} />
          
          <div style={{
            background: 'white',
            minHeight: '100vh',
            borderRadius: '0 0 0 0', 
            padding: '60px 5vw',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            color: '#333',
          }}>
            <button 
              onClick={() => {
                setSelectedSlug(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ position: 'absolute', top: 15, right: 15, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 30, height: 30, fontSize: '1.2rem', color: '#fff', cursor: 'pointer', zIndex: 20, display:'flex', alignItems:'center', justifyContent:'center' }}
            >
              ×
            </button>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '60px', marginBottom: '100px', borderBottom: '1px solid #ddd', paddingBottom: '60px' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '20px' }}>{selectedProject.cat} / {selectedProject.date}</p>
                <h2 style={{ fontSize: "clamp(2rem, 4vw, 4rem)", lineHeight: 1.1, marginBottom: "40px", letterSpacing: '-0.02em' }}>{selectedProject.title}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '15px', fontSize: '0.9rem', marginBottom: '40px' }}>
                  {/* ★修正: 見出しを小文字化 */}
                  <div style={{ fontWeight: 'bold', borderTop: '1px solid #000', paddingTop: '10px' }}>role</div>
                  <div style={{ borderTop: '1px solid #000', paddingTop: '10px' }}>{selectedProject.role || '-'}</div>
                  <div style={{ fontWeight: 'bold', borderTop: '1px solid #000', paddingTop: '10px' }}>tools</div>
                  <div style={{ borderTop: '1px solid #000', paddingTop: '10px' }}>{selectedProject.tools || '-'}</div>
                </div>
              </div>
              <div style={{ flex: 1.5, minWidth: '300px' }}>
                <div style={{ width: '100%', aspectRatio: '16/9', background: '#f0f0f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#aaa', fontSize:'1.2rem'}}>Main Visual</div>
                </div>
              </div>
            </div>

            {selectedProject.background && (
              <div style={{ marginBottom: '100px', maxWidth: '800px' }}>
                {/* ★修正: 見出しを小文字化 */}
                <h3 style={sectionTitleStyle}>background & intent</h3>
                <p style={{ fontSize: '1rem', lineHeight: 2.0, whiteSpace: 'pre-wrap' }}>{selectedProject.background}</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginBottom: '100px' }}>
              {/* ★修正: 見出しを小文字化 */}
              <div><h3 style={sectionTitleStyle}>target</h3><p style={{ lineHeight: 1.8 }}>{selectedProject.target || "準備中"}</p></div>
              <div><h3 style={sectionTitleStyle}>persona</h3><p style={{ lineHeight: 1.8 }}>{selectedProject.persona || "準備中"}</p></div>
            </div>

            <div style={{ marginBottom: '120px', textAlign: 'center' }}>
              {/* ★修正: 見出しを小文字化 */}
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', letterSpacing: '0.1em', marginBottom: '30px', }}>concept</h3>
              <p style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 'bold', lineHeight: 1.4 }}>“ {selectedProject.concept || "Concept Text"} ”</p>
            </div>

            <div style={{ marginBottom: '100px' }}>
              {/* ★修正: 見出しを小文字化 */}
              <h3 style={sectionTitleStyle}>design points</h3>
              {selectedProject.points ? selectedProject.points.map((point, index) => (
                <div key={index} style={{ display: 'flex', flexWrap: 'wrap', gap: '60px', marginBottom: '80px', alignItems: 'center', flexDirection: index % 2 === 0 ? 'row' : 'row-reverse' }}>
                  <div style={{ flex: 1, minWidth: '300px' }}><div style={{ width: '100%', aspectRatio: '4/3', background: '#f5f5f5', borderRadius: '4px' }}></div></div>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <h4 style={{ fontSize: '1.4rem', marginBottom: '20px', fontWeight: 'bold' }}>{String(index + 1).padStart(2, '0')}. {point.title}</h4>
                    <p style={{ lineHeight: 1.8, fontSize: '1rem' }}>{point.desc}</p>
                  </div>
                </div>
              )) : <p>ポイント情報は準備中です。</p>}
            </div>

            <div style={{ height: '100px' }} />
          </div>
        </div>
      )}
    </div>
  );
}