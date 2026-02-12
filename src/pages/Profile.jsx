import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../App.css'; 

const Profile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const profileData = {
    nameEn: "ICHIHASHI TOUI",
    nameJa: "市橋 冬翔",
    role: "Graphic / Web Designer",
    birth: "2004.12.22",
    location: "Aichi, Japan",
    email: "ichihashi.toui@gmail.com",
    
    bio: `初めまして。市橋冬翔と申します。目標に向かって着実に歩みを進めることを大切にしています。
学生生活では、Webデザインやグラフィックデザインといった平面でのデザインだけでなく、Blenderを使用した3DCGでのビジュアル表現にも積極的に取り組んでいます。
プライベートでは、バンドでベースを弾くことや音楽鑑賞、スポーツ観戦を楽しんでいます。特に毛皮のマリーズやDAVID BOWIEなど、ジャンルに縛られず表現するアーティストの姿勢が、クリエイティブな発想の刺激になっています。`,
    
    skills: [
      { category: "Design", items: ["Illustrator", "Photoshop", "Indesign", "Lightroom", "Figma"] },
      { category: "3D / Motion", items: ["Blender", "After Effects"] },
      { category: "Development", items: ["HTML / CSS", "JavaScript", "React", "Three.js (R3F)", "VS Code"] },
    ],
    
    history: [
      { year: "2023.03", title: "愛知県立丹羽高校卒業",  },
      { year: "2023.04", title: "HAL名古屋グラフィック専攻入学",  },
      { year: "2025.10", title: "株式会社ITアドバイザーインターンシップ", desc: "1ヶ月間、Webサイトリニューアルプロジェクトに参加。リーダーとして進行管理およびを担当。" },
      { year: "2026.現在", title: "在学中", desc: "" },
    ]
  };

  const containerStyle = {
    width: '100%',
    minHeight: '100vh',
    background: '#fff',
    color: '#000',
    padding: '100px 5vw 60px', 
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    boxSizing: 'border-box',
  };

  const sectionStyle = {
    marginBottom: '80px',
    borderTop: '2px solid #000',
    paddingTop: '30px',
    display: 'flex',
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    gap: '30px',
  };

  const labelStyle = {
    fontSize: '1rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    width: '200px',
    flexShrink: 0, 
  };

  const contentStyle = {
    flex: 1,
    minWidth: '300px', 
    fontSize: '1rem',
    lineHeight: 2.0, 
    fontWeight: '400',
  };

  return (
    <>
      {/* ★修正: Contents.jsxと完全に同じ設定値に戻しました (top:40px, left:5vw) */}
      <Link to="/" style={{ 
        position: 'fixed', 
        top: '40px', 
        left: '4vw', 
        color: '#000', 
        fontWeight: 'bold', 
        fontSize: '1rem', 
        textDecoration: 'none', 
        zIndex: 2000, 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em',
        padding: '0px 20px' // 当たり判定用
      }}>
        exit
      </Link>

      <motion.div 
        style={containerStyle}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* 1. HERO AREA */}
        <div style={{ 
          marginBottom: '80px', 
          display: 'flex', 
          // ★修正: PCは横並び(画像左)、スマホは縦並び(画像上)
          flexDirection: isMobile ? 'column' : 'row', 
          alignItems: isMobile ? 'flex-start' : 'flex-end', // スマホは左揃え
          gap: '40px',
          textAlign: 'left' // 文字は常に左揃え
        }}>
          
          {/* ★修正: 画像を先に配置 (PCでは左、スマホでは上に来る) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "backOut" }}
            style={{ 
              // ★修正: スマホの時は幅いっぱい(100%)、PCの時は適度なサイズ
              width: isMobile ? '100%' : 'clamp(200px, 30vw, 400px)', 
              flexShrink: 0,
              marginBottom: isMobile ? '20px' : '0'
            }}
          >
            <img src={import.meta.env.BASE_URL + "ichihashi-1.png"} alt="Profile Icon" style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))' }} />
          </motion.div>

          {/* テキスト部分 */}
          <div style={{ width: isMobile ? '100%' : 'auto' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '20px', fontSize: '1.2rem' }}>{profileData.role}</p>
            <h1 style={{ 
              fontSize: 'clamp(3.5rem, 9vw, 8rem)', 
              lineHeight: 0.9, 
              fontWeight: '900', 
              letterSpacing: '-0.04em',
              marginLeft: isMobile ? 0 : '-0.05em',
              textTransform: 'uppercase'
            }}>
              {profileData.nameEn.split(' ').map((word, i) => (
                <span key={i} style={{ display: 'block' }}>{word}</span>
              ))}
            </h1>
            <p style={{ marginTop: '20px', fontSize: '1.2rem', fontWeight: '500' }}>{profileData.nameJa}</p>
          </div>

        </div>

        {/* 2. BASIC INFO */}
        <section style={sectionStyle}>
          <div style={labelStyle}>Information</div>
          <div style={contentStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '15px' }}>
              <strong>Birth</strong> <span>{profileData.birth}</span>
              <strong>Location</strong> <span>{profileData.location}</span>
              <strong>Contact</strong> <span>{profileData.email}</span>
            </div>
          </div>
        </section>

        {/* 3. BIOGRAPHY */}
        <section style={sectionStyle}>
          <div style={labelStyle}>Biography</div>
          <div style={contentStyle}>
            <p style={{ whiteSpace: 'pre-wrap' }}>{profileData.bio}</p>
          </div>
        </section>

        {/* 4. SKILLS */}
        <section style={sectionStyle}>
          <div style={labelStyle}>Skills & Tools</div>
          <div style={contentStyle}>
            {profileData.skills.map((skill, index) => (
              <div key={index} style={{ marginBottom: '40px' }}>
                <h4 style={{ fontSize: '1rem',  fontWeight: 'bold', display:'inline-block' }}>
                  {skill.category}
                </h4>
                <p>{skill.items.join(" / ")}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. HISTORY */}
        <section style={sectionStyle}>
          <div style={labelStyle}>History</div>
          <div style={contentStyle}>
            {profileData.history.map((item, index) => (
              <div key={index} style={{ marginBottom: '40px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 'bold', minWidth: '80px', }}>{item.year}</div>
                <div>
                  <h4 style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '1rem' }}>{item.title}</h4>
                  <p style={{ fontSize: '1rem', color: '#666' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </motion.div>
    </>
  );
};

export default Profile;