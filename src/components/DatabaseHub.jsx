import React, { useState } from 'react';
import { Database, FileSpreadsheet, Server, Cloud, Zap, Globe, HardDrive } from 'lucide-react';

const NODES = [
  { id: 'csv', name: 'CSV File', icon: FileSpreadsheet, x: 80, y: 60, color: 'var(--neon-cyan)' },
  { id: 'excel', name: 'Excel Sheet', icon: FileSpreadsheet, x: 80, y: 140, color: 'var(--neon-gold)' },
  { id: 'mongodb', name: 'MongoDB', icon: Database, x: 80, y: 220, color: 'var(--neon-violet)' },
  { id: 'mysql', name: 'MySQL Server', icon: Server, x: 80, y: 300, color: 'var(--neon-cyan)' },
  { id: 'postgres', name: 'PostgreSQL', icon: Database, x: 420, y: 60, color: 'var(--neon-cyan)' },
  { id: 'api', name: 'Web API', icon: Globe, x: 420, y: 140, color: 'var(--neon-violet)' },
  { id: 's3', name: 'AWS S3', icon: Cloud, x: 420, y: 220, color: 'var(--neon-gold)' },
  { id: 'azure', name: 'Azure Blob', icon: HardDrive, x: 420, y: 300, color: 'var(--neon-cyan)' },
];

const CENTRAL_X = 250;
const CENTRAL_Y = 180;

export default function DatabaseHub() {
  const [activeNode, setActiveNode] = useState(null);

  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: '12px', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
          INTEGRATION HUB // DISTRIBUTED CHANNELS
        </span>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Data Stream Connections</h3>
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: '340px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg 
          viewBox="0 0 500 360" 
          style={{ 
            width: '100%', 
            height: '100%', 
            maxHeight: '380px',
            overflow: 'visible'
          }}
        >
          <defs>
            <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Lines */}
          {NODES.map((node) => {
            const isActive = activeNode === node.id;
            return (
              <g key={`link-${node.id}`}>
                <path
                  d={`M ${node.x} ${node.y} Q ${(node.x + CENTRAL_X) / 2} ${(node.y + CENTRAL_Y) / 2 + (node.y > CENTRAL_Y ? -15 : 15)} ${CENTRAL_X} ${CENTRAL_Y}`}
                  fill="none"
                  stroke={isActive ? node.color : 'rgba(91, 127, 255, 0.06)'}
                  strokeWidth={isActive ? 2 : 1}
                  style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                />
                <path
                  d={`M ${node.x} ${node.y} Q ${(node.x + CENTRAL_X) / 2} ${(node.y + CENTRAL_Y) / 2 + (node.y > CENTRAL_Y ? -15 : 15)} ${CENTRAL_X} ${CENTRAL_Y}`}
                  fill="none"
                  stroke={node.color}
                  strokeWidth="1.5"
                  strokeDasharray="6 45"
                  style={{
                    animation: `dash-stream ${node.id === 'csv' || node.id === 'postgres' ? '2s' : '3.5s'} linear infinite`,
                    filter: 'url(#glow-cyan)'
                  }}
                />
              </g>
            );
          })}

          {/* Central AI Engine Node */}
          <g 
            transform={`translate(${CENTRAL_X - 30}, ${CENTRAL_Y - 30})`}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx="30"
              cy="30"
              r="34"
              fill="none"
              stroke="var(--neon-cyan)"
              strokeWidth="1.2"
              opacity="0.35"
              style={{
                transformOrigin: '30px 30px',
                animation: 'pulse-ring 2.5s cubic-bezier(0.215, 0.610, 0.355, 1) infinite'
              }}
            />
            <rect
              width="60"
              height="60"
              rx="8"
              fill="#ffffff"
              stroke="var(--neon-cyan)"
              strokeWidth="2"
              style={{ filter: 'url(#glow-cyan)', boxShadow: '0 4px 15px rgba(91,127,255,0.15)' }}
            />
            <g transform="translate(18, 18)" style={{ color: 'var(--neon-cyan)' }}>
              <Zap size={24} fill="var(--neon-cyan)" />
            </g>
          </g>

          {/* External nodes */}
          {NODES.map((node) => {
            const IconComponent = node.icon;
            const isActive = activeNode === node.id;
            return (
              <g 
                key={node.id} 
                transform={`translate(${node.x - 18}, ${node.y - 18})`}
                onMouseEnter={() => setActiveNode(node.id)}
                onMouseLeave={() => setActiveNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx="18"
                  cy="18"
                  r="18"
                  fill="#ffffff"
                  stroke={isActive ? node.color : 'rgba(91, 127, 255, 0.15)'}
                  strokeWidth="1.5"
                  style={{ 
                    transition: 'all 0.2s',
                    filter: isActive ? 'url(#glow-cyan)' : 'none',
                    boxShadow: '0 2px 6px rgba(148,163,184,0.05)'
                  }}
                />
                <g transform="translate(10, 10)" style={{ color: isActive ? node.color : 'var(--text-secondary)', transition: 'color 0.2s' }}>
                  <IconComponent size={16} />
                </g>
                
                <text
                  x="18"
                  y={node.y > CENTRAL_Y ? 44 : -8}
                  textAnchor="middle"
                  fill={isActive ? 'var(--neon-cyan)' : 'var(--text-secondary)'}
                  fontSize="9.5"
                  fontWeight="bold"
                  fontFamily="var(--font-mono)"
                  style={{ transition: 'fill 0.2s' }}
                >
                  {node.name.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '10px' }}>
        Hover over channels to highlight link state. Central core represents the <strong style={{ color: 'var(--neon-cyan)' }}>DataLensAI Engine</strong>.
      </div>
    </div>
  );
}
