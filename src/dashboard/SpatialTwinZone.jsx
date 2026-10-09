import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, Cpu, RotateCw } from 'lucide-react';

export default function SpatialTwinZone() {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [overclocked, setOverclocked] = useState(false);
  const [twinTemp, setTwinTemp] = useState(48);
  const [activeNode, setActiveNode] = useState(null);

  // Auto rotate clusters
  useEffect(() => {
    const timer = setInterval(() => {
      setRotationAngle(prev => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Sim twin temperature variance
  useEffect(() => {
    const tempInterval = setInterval(() => {
      setTwinTemp(prev => {
        const target = overclocked ? 78 : 48;
        const diff = target - prev;
        const step = diff > 0 ? 1 : -1;
        if (Math.abs(diff) < 2) return target;
        return prev + step * (Math.floor(Math.random() * 2) + 1);
      });
    }, 1000);
    return () => clearInterval(tempInterval);
  }, [overclocked]);

  const project3D = (x, y, z) => {
    const rad = (rotationAngle * Math.PI) / 180;
    const rotX = x * Math.cos(rad) - z * Math.sin(rad);
    const rotZ = x * Math.sin(rad) + z * Math.cos(rad);
    
    const perspective = 300;
    const scale = perspective / (perspective + rotZ);
    const projX = 200 + rotX * scale;
    const projY = 100 + y * scale;
    
    return { x: projX, y: projY, depth: rotZ };
  };

  const clusterPoints = [
    // Centroid 1: Blue cluster
    ...Array.from({ length: 15 }, (_, i) => ({ x: Math.sin(i)*25, y: Math.cos(i)*25, z: (i%3-1)*15, color: 'var(--neon-cyan)' })),
    // Centroid 2: Gold cluster
    ...Array.from({ length: 15 }, (_, i) => ({ x: 80 + Math.sin(i)*20, y: 30 + Math.cos(i)*20, z: -40 + (i%3-1)*10, color: 'var(--neon-gold)' })),
    // Centroid 3: Purple cluster
    ...Array.from({ length: 10 }, (_, i) => ({ x: -70 + Math.sin(i)*18, y: -40 + Math.cos(i)*18, z: 30 + (i%3-1)*12, color: 'var(--neon-violet)' })),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      
      {/* Header */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '12px 20px', 
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Network size={16} className="glow-cyan" />
          <span style={{ fontWeight: 'bold', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Spatial AI Coordinates & Digital Twins
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          DIMENSIONAL VECTOR MAPPINGS ACTIVE
        </div>
      </div>

      {/* Grid of Views */}
      <div className="grid-cols-2" style={{ gap: '16px' }}>
        
        {/* 1. 3D Clusters */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '340px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>01 // 3D CLUSTERS K-MEANS PROJECTION</span>
            <button 
              onClick={() => setRotationAngle(prev => (prev + 45) % 360)}
              style={{ background: 'transparent', border: 'none', color: 'var(--neon-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 'bold' }}
            >
              <RotateCw size={12} />
              <span>SPIN VIEW</span>
            </button>
          </div>

          <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(91,127,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
            <svg viewBox="0 0 400 220" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <line x1="200" y1="20" x2="200" y2="200" stroke="rgba(0,0,0,0.02)" />
              <line x1="50" y1="110" x2="350" y2="110" stroke="rgba(0,0,0,0.02)" />
              
              {clusterPoints
                .map(pt => ({ ...pt, projected: project3D(pt.x, pt.y, pt.z) }))
                .sort((a, b) => b.projected.depth - a.projected.depth)
                .map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.projected.x}
                    cy={pt.projected.y}
                    r={Math.max(1.5, 3.2 + pt.projected.depth * 0.01)}
                    fill={pt.color}
                    opacity={0.5 + (pt.projected.depth + 100) / 200 * 0.5}
                    style={{ filter: pt.color === 'var(--neon-cyan)' ? 'drop-shadow(0 0 2px var(--neon-cyan-glow))' : 'none' }}
                  />
                ))}
              
              {[-30, 60].map((cx, idx) => {
                const proj = project3D(cx === -30 ? -80 : 80, cx === -30 ? -40 : 40, cx === -30 ? 30 : -40);
                return (
                  <g key={idx}>
                    <rect x={proj.x - 4} y={proj.y - 4} width="8" height="8" fill="none" stroke="var(--text-primary)" strokeWidth="1.5" />
                    <text x={proj.x + 8} y={proj.y + 3} fill="var(--text-primary)" fontSize="7.5" fontWeight="bold" fontFamily="var(--font-mono)">
                      C{idx+1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* 2. Node Map */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '340px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '16px' }}>02 // ENTITY RELATIONSHIP NODE MAP</span>
          
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(91,127,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
            <svg viewBox="0 0 400 220" style={{ width: '100%', height: '100%' }}>
              {[
                { from: 'session', to: 'gateway' },
                { from: 'gateway', to: 'redis' },
                { from: 'gateway', to: 'postgres' },
                { from: 'postgres', to: 'ai' },
                { from: 'redis', to: 'ai' },
                { from: 'snowflake', to: 'ai' }
              ].map((link, i) => {
                const nodes = {
                  session: { x: 50, y: 110 },
                  gateway: { x: 130, y: 110 },
                  redis: { x: 220, y: 50 },
                  postgres: { x: 220, y: 170 },
                  ai: { x: 310, y: 110 },
                  snowflake: { x: 350, y: 50 }
                };
                const fromNode = nodes[link.from];
                const toNode = nodes[link.to];
                const isSelected = activeNode === link.from || activeNode === link.to;

                return (
                  <line
                    key={i}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isSelected ? 'var(--neon-cyan)' : 'rgba(91, 127, 255, 0.08)'}
                    strokeWidth={isSelected ? 2.5 : 1}
                    style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                  />
                );
              })}

              {[
                { id: 'session', x: 50, y: 110, name: 'SESS_ID' },
                { id: 'gateway', x: 130, y: 110, name: 'API_GW' },
                { id: 'redis', x: 220, y: 50, name: 'REDIS_CACHE' },
                { id: 'postgres', x: 220, y: 170, name: 'PG_SQL' },
                { id: 'ai', x: 310, y: 110, name: 'DATALENS_AI' },
                { id: 'snowflake', x: 350, y: 50, name: 'SNOW_WH' }
              ].map((node) => {
                const isHovered = activeNode === node.id;
                return (
                  <g 
                    key={node.id} 
                    transform={`translate(${node.x}, ${node.y})`}
                    onMouseEnter={() => setActiveNode(node.id)}
                    onMouseLeave={() => setActiveNode(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx="0"
                      cy="0"
                      r={isHovered ? 13 : 9}
                      fill="#ffffff"
                      stroke={isHovered ? 'var(--neon-violet)' : 'var(--neon-cyan)'}
                      strokeWidth="2.5"
                      style={{ transition: 'r 0.2s, stroke 0.2s' }}
                    />
                    <text
                      x="0"
                      y="24"
                      textAnchor="middle"
                      fill={isHovered ? 'var(--neon-cyan)' : 'var(--text-secondary)'}
                      fontSize="8.5"
                      fontWeight="bold"
                      fontFamily="var(--font-mono)"
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* 3. Digital Twin */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '340px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>03 // CLUSTER ENGINE DIGITAL TWIN</span>
            <button
              onClick={() => setOverclocked(prev => !prev)}
              className={overclocked ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '4px 12px', fontSize: '0.7rem', borderRadius: '6px' }}
            >
              {overclocked ? 'OVERCLOCK ACTIVE' : 'ENGAGE OVERCLOCK'}
            </button>
          </div>

          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(255,255,255,0.3)', padding: '16px', border: '1px solid rgba(91,127,255,0.06)', borderRadius: '12px' }}>
            
            <div style={{ position: 'relative', borderRight: '1px dashed rgba(91,127,255,0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Cpu size={56} style={{ color: overclocked ? 'var(--neon-gold)' : 'var(--neon-cyan)', transition: 'color 0.5s', filter: overclocked ? 'drop-shadow(0 0 8px var(--neon-gold-glow))' : 'none' }} />
                {overclocked && (
                  <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '76px', height: '76px', border: '1.5px solid var(--neon-gold)', borderRadius: '8px', animation: 'pulse-ring 1.5s infinite' }} />
                )}
              </div>
              <span style={{ position: 'absolute', bottom: '5px', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                CPU_DIE_MODEL_S4
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>DIE TEMP:</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: twinTemp > 65 ? 'var(--neon-red)' : 'var(--neon-cyan)', transition: 'color 0.5s' }}>
                  {twinTemp}°C
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>BUS SPEED:</span>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: overclocked ? 'var(--neon-gold)' : 'var(--text-primary)' }}>
                  {overclocked ? '5.42 GHz' : '3.60 GHz'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>FAN DUTY RATIO:</span>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--neon-cyan)' }}>
                  {overclocked ? '95% (MAX)' : '42% (AUTO)'}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 4. Spatial AI */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '340px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '16px' }}>04 // SPATIAL VECTOR COORDINATES</span>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.3)', padding: '16px', border: '1px solid rgba(91,127,255,0.06)', borderRadius: '12px' }}>
            <div style={{ flex: 1, border: '1px solid rgba(91,127,255,0.1)', position: 'relative', overflow: 'hidden', background: '#ffffff', borderRadius: '8px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(rgba(91,127,255,0.05) 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
              
              {Array.from({ length: 40 }).map((_, i) => (
                <div 
                  key={i} 
                  style={{ 
                    position: 'absolute', 
                    left: `${20 + (i * 7) % 70}%`, 
                    top: `${15 + (i * 11) % 75}%`, 
                    width: '4px', 
                    height: '4px', 
                    background: i % 3 === 0 ? 'var(--neon-gold)' : 'var(--neon-cyan)',
                    borderRadius: '50%',
                    opacity: 0.85
                  }} 
                />
              ))}

              <div 
                style={{ 
                  position: 'absolute', 
                  top: '45%', 
                  left: '55%', 
                  width: '12px', 
                  height: '12px', 
                  border: '1.5px solid var(--neon-violet)', 
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 6px var(--neon-violet-glow)'
                }}
              >
                <div style={{ width: '4px', height: '4px', background: 'var(--neon-violet)', borderRadius: '50%', margin: '2.5px auto' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              <span>PROJECTION: UMAP-2D</span>
              <span>VECTOR COSIGN DISTANCE: 0.084</span>
            </div>
          </div>
        </div>

        {/* 5. 3D Pie Chart */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gridColumn: 'span 2', minHeight: '300px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '16px' }}>05 // 3D RESOURCE ALLOCATION (ISOMETRIC PIE)</span>
          
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', background: 'rgba(255,255,255,0.3)', padding: '20px', border: '1px solid rgba(91,127,255,0.06)', borderRadius: '12px' }}>
            
            <svg viewBox="0 0 240 140" style={{ width: '220px', height: '120px', overflow: 'visible' }}>
              <path d="M 40 70 A 80 40 0 0 0 160 90 L 160 100 A 80 40 0 0 1 40 80 Z" fill="rgba(37, 99, 235, 0.85)" />
              <path d="M 160 90 A 80 40 0 0 0 200 70 L 200 80 A 80 40 0 0 1 160 100 Z" fill="rgba(217, 119, 6, 0.85)" stroke="none" />
              
              <path d="M 120 70 L 40 70 A 80 40 0 0 1 160 90 Z" fill="var(--neon-cyan)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
              <path d="M 120 70 L 160 90 A 80 40 0 0 1 200 70 Z" fill="var(--neon-gold)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
              <path d="M 120 65 L 200 65 A 80 40 0 0 1 40 65 Z" fill="rgba(123,97,255,0.5)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" style={{ transform: 'translate(4px, -6px)' }} />
            </svg>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'var(--neon-cyan)', borderRadius: '2px' }} />
                <span style={{ fontWeight: '500' }}>Relational Storage Core - 60%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'var(--neon-gold)', borderRadius: '2px' }} />
                <span style={{ fontWeight: '500' }}>NoSQL Aggregates - 25%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'rgba(123,97,255,0.5)', borderRadius: '2px' }} />
                <span style={{ fontWeight: '500' }}>Cloud Warehouses - 15%</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
