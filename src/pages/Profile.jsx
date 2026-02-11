import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../App.css'; 

const Profile = () => {
  const profileData = {
    nameEn: "ICHIHASHI TOUI",
    nameJa: "市橋 冬翔",
    role: "Graphic / Web Designer",
    birth: "2004.12.22",
    location: "Aichi, Japan",
    email: "ichihashi.toui@gmail.com",
    
    bio: `表面的なビジュアル表現だけでなく、その背後にある歴史的背景や論理的な裏付けを重視してデザインに取り組んでいます。

Webデザインにおける実装力（React, Three.js）と、グラフィックデザインにおける構成力（スイス・スタイル）を掛け合わせ、感性と論理のバランスが取れたクリエイティブを目指しています。

チーム制作においては、全体を俯瞰し、多角的な視点から分析を行う「参謀役」として、プロジェクトの品質向上に貢献することを好みます。`,
    
    skills: [
      { category: "Design", items: ["Illustrator", "Photoshop", "Indesign", "Lightroom", "Figma"] },
      { category: "3D / Motion", items: ["Blender", "After Effects"] },
      { category: "Development", items: ["HTML / CSS", "JavaScript", "React", "Three.js (R3F)", "VS Code"] },
    ],
    
    history: [
      { year: "2023.04", title: "デザイン専門学校 入学", desc: "グラフィックデザインの基礎、色彩理論、構成論、Webデザインを専攻。" },
      { year: "2025.11", title: "株式会社IT Advisor インターンシップ", desc: "1ヶ月間、Webサイトリニューアルプロジェクトに参加。リーダーとして進行管理および実装を担当。" },
      { year: "2026.03", title: "卒業予定", desc: "" },
    ]
  };

  const containerStyle = {
    width: '100%',
    minHeight: '100vh',
    background: '#fff',
    color: '#000',
    padding: '120px 5vw 100px', 
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
    fontSize: '1.1rem',
    lineHeight: 2.0, 
    fontWeight: '400',
  };

  return (
    <motion.div 
      style={containerStyle}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ★修正: EXIT位置調整 */}
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
        transform: 'translateY(-2px)' // ★微調整
      }}>
        exit
      </Link>

      <div style={{ marginBottom: '140px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap-reverse', gap: '40px' }}>
        <div>
          <p style={{ fontWeight: 'bold', marginBottom: '20px', fontSize: '1.2rem' }}>{profileData.role}</p>
          <h1 style={{ 
            fontSize: 'clamp(3.5rem, 9vw, 8rem)', 
            lineHeight: 0.9, 
            fontWeight: '900', 
            letterSpacing: '-0.04em',
            marginLeft: '-0.05em', 
            textTransform: 'uppercase'
          }}>
            {profileData.nameEn.split(' ').map((word, i) => (
              <span key={i} style={{ display: 'block' }}>{word}</span>
            ))}
          </h1>
          <p style={{ marginTop: '20px', fontSize: '1.2rem', fontWeight: '500' }}>{profileData.nameJa}</p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "backOut" }}
          style={{ width: 'clamp(150px, 30vw, 300px)', flexShrink: 0 }}
        >
          <img src={import.meta.env.BASE_URL + "star.png"} alt="Profile Icon" style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))' }} />
        </motion.div>
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
              <h4 style={{ fontSize: '1.2rem', marginBottom: '10px', fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: '5px', display:'inline-block' }}>
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
            <div key={index} style={{ marginBottom: '40px', display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
              <div style={{ fontWeight: 'bold', minWidth: '80px', paddingTop: '5px' }}>{item.year}</div>
              <div>
                <h4 style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '1.1rem' }}>{item.title}</h4>
                <p style={{ fontSize: '1rem', color: '#666' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: '100px' }} />

    </motion.div>
  );
};

export default Profile;