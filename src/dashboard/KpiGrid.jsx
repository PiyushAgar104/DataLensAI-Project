import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, TrendingUp, ClipboardList, Target, ShieldCheck, Database } from 'lucide-react';

const MoM_KPI_DATA = [
  { id: 'revenue', title: 'Current Month Revenue', value: 348200, compareVal: 293300, prefix: '$', suffix: '', trend: '+18.7%', isPositive: true, sparkline: [10, 15, 12, 18, 25, 22, 30], icon: DollarSign, color: 'var(--neon-cyan)' },
  { id: 'profit', title: 'Profit Growth %', value: 23.4, prefix: '', suffix: '%', trend: '+23.4%', isPositive: true, sparkline: [14, 15, 17, 18, 20, 22, 23.4], icon: TrendingUp, color: 'var(--neon-violet)' },
  { id: 'customers', title: 'Customer Growth %', value: 12.1, prefix: '', suffix: '%', trend: '+12.1%', isPositive: true, sparkline: [8, 9, 9.5, 10.2, 11.0, 11.5, 12.1], icon: Users, color: 'var(--neon-cyan)' },
  { id: 'orders', title: 'Orders Growth %', value: 28.9, prefix: '', suffix: '%', trend: '+28.9%', isPositive: true, sparkline: [15, 18, 20, 24, 25, 27, 28.9], icon: ClipboardList, color: 'var(--neon-violet)' },
  { id: 'activeUsers', title: 'Active Sessions', value: 4829, prefix: '', suffix: '', trend: '+8.7%', isPositive: true, sparkline: [30, 32, 28, 35, 41, 46, 48.2], icon: Database, color: 'var(--neon-cyan)' },
  { id: 'accuracy', title: 'Forecast Accuracy', value: 98.42, prefix: '', suffix: '%', trend: '+0.85%', isPositive: true, sparkline: [95, 96, 96.5, 97.2, 97.9, 98.1, 98.42], icon: ShieldCheck, color: 'var(--neon-gold)' },
];

export default function KpiGrid() {
  const [animatedValues, setAnimatedValues] = useState({});

  useEffect(() => {
    const duration = 1200; 
    const frameRate = 1000 / 60; 
    const totalFrames = Math.round(duration / frameRate);
    
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeProgress = progress * (2 - progress);

      const nextValues = {};
      MoM_KPI_DATA.forEach((kpi) => {
        nextValues[kpi.id] = kpi.value * easeProgress;
      });

      setAnimatedValues(nextValues);

      if (frame >= totalFrames) {
        clearInterval(interval);
        const finalValues = {};
        MoM_KPI_DATA.forEach((kpi) => {
          finalValues[kpi.id] = kpi.value;
        });
        setAnimatedValues(finalValues);
      }
    }, frameRate);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num, kpi) => {
    if (num === undefined) return '0';
    if (kpi.id === 'revenue') {
      return Math.floor(num).toLocaleString();
    }
    return num.toFixed(2);
  };

  return (
    <div className="grid-cols-3" style={{ gap: '16px', width: '100%', marginBottom: '20px' }}>
      {MoM_KPI_DATA.map((kpi, idx) => {
        const Icon = kpi.icon;
        const valueStr = formatNumber(animatedValues[kpi.id], kpi);
        
        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="glass-card"
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div 
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60px',
                height: '60px',
                background: `radial-gradient(circle, ${kpi.color}08 0%, transparent 70%)`,
                pointerEvents: 'none'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {kpi.title}
              </span>
              <div style={{ color: kpi.color }}>
                <Icon size={14} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: kpi.color, fontFamily: 'var(--font-mono)' }}>{kpi.prefix}</span>
              <span style={{ fontSize: '1.45rem', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {valueStr}
              </span>
              <span style={{ fontSize: '0.85rem', color: kpi.color, fontFamily: 'var(--font-mono)' }}>{kpi.suffix}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <span 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '2px', 
                  fontSize: '0.72rem', 
                  fontWeight: 'bold',
                  color: kpi.isPositive ? '#047857' : '#b91c1c',
                  background: kpi.isPositive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  padding: '2px 6px',
                  border: `1px solid ${kpi.isPositive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                  borderRadius: '4px'
                }}
              >
                {kpi.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {kpi.trend}
              </span>

              {kpi.id === 'revenue' && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Prev: $293,300
                </span>
              )}

              {/* Sparkline curve */}
              <svg width="60" height="20" style={{ overflow: 'visible' }}>
                <path
                  d={`M ${kpi.sparkline.map((val, i) => `${(i * 60) / 6}, ${18 - (val / Math.max(...kpi.sparkline)) * 14}`).join(' L ')}`}
                  fill="none"
                  stroke={kpi.color}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
