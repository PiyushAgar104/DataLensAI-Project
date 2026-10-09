import React from 'react';
import { motion } from 'framer-motion';
import { Database, Filter, Brain, Cpu, BarChart3, LineChart, FileSpreadsheet, Eye, TrendingUp } from 'lucide-react';

const PIPELINE_STEPS = [
  { id: 'sources', label: 'Data Sources', icon: Database, color: 'var(--neon-emerald)' },
  { id: 'clean', label: 'Data Cleaning', icon: Filter, color: 'var(--neon-gold)' },
  { id: 'process', label: 'AI Processing', icon: Brain, color: 'var(--neon-emerald)' },
  { id: 'ml', label: 'Machine Learning', icon: Cpu, color: 'var(--neon-gold)' },
  { id: 'analytics', label: 'Analytics Engine', icon: BarChart3, color: 'var(--neon-emerald)' },
  { id: 'visual', label: 'Visual Engine', icon: Eye, color: 'var(--neon-gold)' },
  { id: 'insight', label: 'Insight Generator', icon: LineChart, color: 'var(--neon-emerald)' },
  { id: 'dash', label: 'Dashboard', icon: FileSpreadsheet, color: 'var(--neon-gold)' },
  { id: 'decision', label: 'Business Decisions', icon: TrendingUp, color: 'var(--neon-emerald)' },
];

export default function LiveFlowVisual() {
  return (
    <div 
      className="glass-card" 
      style={{ 
        width: '100%', 
        padding: '24px', 
        borderRadius: '16px', 
        overflowX: 'auto',
        position: 'relative',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glow)'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--neon-gold)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
          TOPOLOGY MAP // DATALENSAI INGESTION
        </span>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff' }}>Ingestion Pipeline Ingress Flow</h3>
      </div>

      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          minWidth: '940px', 
          padding: '16px 8px', 
          position: 'relative' 
        }}
      >
        {PIPELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.id}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  width: '90px',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: `1px solid ${step.color}44`,
                    boxShadow: `0 0 10px ${step.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = step.color;
                    e.currentTarget.style.boxShadow = `0 0 15px ${step.color}45`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${step.color}44`;
                    e.currentTarget.style.boxShadow = `0 0 10px ${step.color}15`;
                  }}
                >
                  <Icon size={20} style={{ color: step.color }} />
                </motion.div>
                
                <span 
                  style={{ 
                    fontSize: '0.72rem', 
                    color: 'var(--text-secondary)', 
                    textAlign: 'center',
                    fontWeight: 'bold',
                    lineHeight: '1.2',
                    fontFamily: 'var(--font-sans)'
                  }}
                >
                  {step.label.toUpperCase()}
                </span>
              </motion.div>

              {idx < PIPELINE_STEPS.length - 1 && (
                <div 
                  style={{ 
                    flex: 1, 
                    height: '1.5px', 
                    background: 'rgba(255, 255, 255, 0.15)', 
                    position: 'relative',
                    top: '-14px',
                    margin: '0 -8px',
                    zIndex: 1,
                    overflow: 'hidden'
                  }}
                >
                  <motion.div
                    animate={{
                      left: ['-100%', '100%']
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.0,
                      ease: 'linear'
                    }}
                    style={{
                      position: 'absolute',
                      width: '40px',
                      height: '100%',
                      background: `linear-gradient(90deg, transparent, ${step.color}, transparent)`,
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          borderTop: '1px solid var(--border-glow)', 
          marginTop: '20px', 
          paddingTop: '12px',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)'
        }}
      >
        <div>OVERWATCH STATUS: <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>STABLE</span></div>
        <div>GATEWAY RESPONSE: <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>14ms</span></div>
        <div>DRIFT METRIC: <span style={{ color: 'var(--neon-gold)', fontWeight: 'bold' }}>0.01%</span></div>
      </div>
    </div>
  );
}
