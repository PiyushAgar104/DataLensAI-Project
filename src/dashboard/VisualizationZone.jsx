import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Database, LineChart, FileText, Activity, Layers, ArrowDownRight, ArrowUpRight, HelpCircle } from 'lucide-react';

export default function VisualizationZone() {
  const [activeSheet, setActiveSheet] = useState('sales'); 
  const [hoveredData, setHoveredData] = useState(null);

  const handleHover = (data, event) => {
    if (!data) {
      setHoveredData(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredData({
      label: data.label,
      value: data.value,
      x: event.clientX - 100,
      y: event.clientY - 120
    });
  };

  // Sheet 1: Sales & Performance (6 widgets)
  const renderSalesSheet = () => (
    <div className="grid-cols-3" style={{ gap: '16px' }}>
      {/* 1. Revenue Trend Line */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 01 // REVENUE TREND LINE</span>
        <div style={{ flex: 1, height: '110px', marginTop: '12px' }}>
          <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <path d="M 10 70 L 190 70" stroke="rgba(91,127,255,0.06)" />
            <path d="M 10 70 Q 50 60 90 30 T 170 35 T 190 10" fill="none" stroke="var(--neon-cyan)" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 3px var(--neon-cyan-glow))' }} />
            <circle cx="190" cy="10" r="3.5" fill="#ffffff" stroke="var(--neon-cyan)" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* 2. Profit Trend Chart */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 02 // PROFIT TREND WAVE</span>
        <div style={{ flex: 1, height: '110px', marginTop: '12px' }}>
          <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <path d="M 10 70 L 190 70" stroke="rgba(123,97,255,0.06)" />
            <path d="M 10 65 Q 60 40 110 50 T 190 20" fill="none" stroke="var(--neon-violet)" strokeWidth="2.5" />
            <path d="M 10 65 Q 60 40 110 50 T 190 20 L 190 70 L 10 70 Z" fill="rgba(123,97,255,0.04)" />
          </svg>
        </div>
      </div>

      {/* 3. Customer Growth Curves */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 03 // CUSTOMER ACQUISITION</span>
        <div style={{ flex: 1, height: '110px', marginTop: '12px' }}>
          <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <path d="M 10 70 L 190 70" stroke="rgba(91,127,255,0.06)" />
            <path d="M 10 68 Q 60 55 110 40 T 190 15" fill="none" stroke="var(--neon-cyan)" strokeWidth="2.5" />
          </svg>
        </div>
      </div>

      {/* 4. Category Performance Bars */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 04 // CATEGORY SHARE</span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
          {[
            { n: 'Electronics', v: '42%', c: 'var(--neon-gold)' },
            { n: 'Software Lic.', v: '34%', c: 'var(--neon-cyan)' },
            { n: 'Hardware', v: '24%', c: 'var(--neon-violet)' }
          ].map(cat => (
            <div key={cat.n} style={{ fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontWeight: '500' }}>{cat.n}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{cat.v}</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'rgba(91,127,255,0.05)', borderRadius: '2.5px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: cat.v, background: cat.c }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Waterfall Variance */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 05 // WATERFALL VARIANCE</span>
        <div style={{ flex: 1, height: '110px', marginTop: '12px' }}>
          <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100%' }}>
            <rect x="15" y="20" width="20" height="50" fill="var(--neon-cyan)" rx="2" />
            <rect x="55" y="10" width="20" height="10" fill="var(--neon-gold)" rx="2" />
            <rect x="95" y="10" width="20" height="20" fill="var(--neon-red)" rx="2" />
            <rect x="135" y="30" width="20" height="15" fill="var(--neon-emerald)" rx="2" />
            <rect x="165" y="30" width="20" height="40" fill="var(--neon-cyan)" rx="2" />
          </svg>
        </div>
      </div>

      {/* 6. Funnel Analytics */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 06 // CONVERSION FUNNEL</span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center', marginTop: '12px' }}>
          {['98%', '74%', '42%', '18%'].map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', width: '20px' }}>L{i+1}</span>
              <div style={{ flex: 1, height: '14px', background: 'rgba(91,127,255,0.04)', border: '1px solid rgba(91,127,255,0.1)', borderRadius: '3px' }}>
                <div style={{ height: '100%', width: w, background: 'var(--neon-cyan)', opacity: 0.8, borderRadius: '2px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Sheet 2: Spatial & Structure (7-12)
  const renderSpatialSheet = () => (
    <div className="grid-cols-3" style={{ gap: '16px' }}>
      {/* 7. Treemap */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 07 // CAPACITY TREEMAP</span>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4px', height: '110px', marginTop: '12px' }}>
          <div style={{ background: 'rgba(91,127,255,0.08)', border: '1px solid rgba(91,127,255,0.2)', padding: '6px', fontSize: '0.65rem', borderRadius: '4px' }}>Postgres</div>
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '4px' }}>
            <div style={{ background: 'rgba(255,184,107,0.08)', border: '1px solid rgba(255,184,107,0.2)', padding: '6px', fontSize: '0.65rem', borderRadius: '4px' }}>MongoDB</div>
            <div style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(0,0,0,0.05)', padding: '6px', fontSize: '0.65rem', borderRadius: '4px' }}>S3</div>
          </div>
        </div>
      </div>

      {/* 8. Radar Threat Vector */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', alignSelf: 'flex-start' }}>WIDGET 08 // RADAR VECTORS</span>
        <div style={{ height: '110px', width: '110px', marginTop: '12px' }}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <polygon points="50,10 90,35 90,75 50,95 10,75 10,35" fill="none" stroke="rgba(91,127,255,0.1)" />
            <polygon points="50,25 80,45 80,65 50,80 20,65 20,45" fill="none" stroke="rgba(91,127,255,0.1)" />
            <polygon points="50,15 85,38 75,70 50,78 30,60 15,40" fill="rgba(91,127,255,0.08)" stroke="var(--neon-cyan)" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* 9. Geographic Heatmap */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 09 // GEOGRAPHIC HEATMAP</span>
        <div style={{ flex: 1, height: '110px', border: '1px solid rgba(91,127,255,0.08)', position: 'relative', marginTop: '12px', background: 'rgba(255,255,255,0.3)', borderRadius: '8px' }}>
          <div style={{ position: 'absolute', top: '30%', left: '20%', width: '6px', height: '6px', background: 'var(--neon-cyan)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '25%', left: '60%', width: '6px', height: '6px', background: 'var(--neon-cyan)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '60%', left: '80%', width: '6px', height: '6px', background: 'var(--neon-gold)', borderRadius: '50%' }} />
        </div>
      </div>

      {/* 10. Sankey Diagram */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 10 // SANKEY FLOW LINKS</span>
        <div style={{ flex: 1, height: '110px', marginTop: '12px' }}>
          <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <rect x="10" y="10" width="8" height="20" fill="var(--neon-cyan)" rx="1" />
            <rect x="10" y="50" width="8" height="20" fill="var(--neon-gold)" rx="1" />
            <rect x="180" y="25" width="8" height="30" fill="var(--neon-cyan)" rx="1" />
            <path d="M 18 20 C 80 20 110 30 180 30" fill="none" stroke="rgba(91,127,255,0.15)" strokeWidth="6" />
            <path d="M 18 60 C 80 60 110 45 180 45" fill="none" stroke="rgba(255,184,107,0.15)" strokeWidth="4" />
          </svg>
        </div>
      </div>

      {/* 11. Correlation Matrix Heatmap */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 11 // CORRELATION HEATMAP</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px', height: '110px', marginTop: '12px' }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div 
              key={i} 
              style={{ 
                background: i % 5 === 0 ? 'var(--neon-gold)' : 'var(--neon-cyan)', 
                opacity: i % 5 === 0 ? 0.7 : (i % 3 === 0 ? 0.3 : 0.1),
                borderRadius: '2px'
              }} 
            />
          ))}
        </div>
      </div>

      {/* 12. Forecast Chart */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 12 // REGRESSION FORECAST</span>
        <div style={{ flex: 1, height: '110px', marginTop: '12px' }}>
          <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <path d="M 10 60 L 100 50 L 190 30" fill="none" stroke="var(--neon-cyan)" strokeWidth="2.5" />
            <path d="M 100 50 L 190 20 L 190 45 Z" fill="rgba(255,184,107,0.08)" />
            <path d="M 100 50 L 190 32" fill="none" stroke="var(--neon-gold)" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>
        </div>
      </div>
    </div>
  );

  // Sheet 3: Retention & Cohorts (13-18)
  const renderCohortSheet = () => (
    <div className="grid-cols-3" style={{ gap: '16px' }}>
      {/* 13. Customer Cohort Analysis */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 13 // COHORT RETENTION</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2px', height: '110px', marginTop: '12px' }}>
          {Array.from({ length: 25 }).map((_, i) => {
            const row = Math.floor(i / 5);
            const col = i % 5;
            const opacity = col >= row ? (1.0 - col * 0.18) : 0;
            return (
              <div 
                key={i} 
                style={{ 
                  background: 'var(--neon-cyan)', 
                  opacity: opacity,
                  fontSize: '0.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-mono)',
                  borderRadius: '2px'
                }}
              >
                {opacity > 0 ? `${Math.round(opacity * 100)}` : ''}
              </div>
            );
          })}
        </div>
      </div>

      {/* 14. Retention Curves */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 14 // COHORT CURVES</span>
        <div style={{ flex: 1, height: '110px', marginTop: '12px' }}>
          <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <path d="M 10 20 Q 80 50 190 60" fill="none" stroke="var(--neon-cyan)" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 3px var(--neon-cyan-glow))' }} />
            <path d="M 10 20 Q 80 65 190 75" fill="none" stroke="var(--neon-gold)" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* 15. Seasonal Trend Charts */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 15 // SEASONAL DENSITY</span>
        <div style={{ flex: 1, height: '110px', marginTop: '12px' }}>
          <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100%' }}>
            <path d="M 10 40 Q 40 10 70 40 T 130 40 T 190 40" fill="none" stroke="var(--neon-cyan)" strokeWidth="2" />
            <path d="M 10 50 Q 40 30 70 50 T 130 50 T 190 50" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* 16. Time-Series Dashboards */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 16 // TIME SERIES GRID</span>
        <div style={{ flex: 1, height: '110px', marginTop: '12px' }}>
          <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100%' }}>
            <line x1="30" y1="10" x2="30" y2="70" stroke="rgba(0,0,0,0.05)" />
            <path d="M 30 50 L 60 42 L 90 58 L 120 38 L 150 48 L 180 20" fill="none" stroke="var(--neon-cyan)" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* 17. Real-Time Monitoring Widgets */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 17 // TELEMETRY RING</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '110px', marginTop: '12px' }}>
          <svg viewBox="0 0 40 40" style={{ width: '80px', height: '80px' }}>
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(91,127,255,0.05)" strokeWidth="4" />
            <circle cx="20" cy="20" r="16" fill="none" stroke="var(--neon-cyan)" strokeWidth="4" strokeDasharray="68 100" strokeLinecap="round" />
            <text x="20" y="23.5" textAnchor="middle" fill="var(--text-primary)" fontSize="8.5" fontWeight="bold" fontFamily="var(--font-mono)">68%</text>
          </svg>
        </div>
      </div>

      {/* 18. AI Recommendation Cards */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 18 // NARRATOR DECISIONS</span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
          <div style={{ fontSize: '0.72rem', borderLeft: '3px solid var(--neon-gold)', paddingLeft: '8px' }}>
            <div style={{ fontWeight: 'bold', color: '#b45309' }}>INVENTORY WARNING</div>
            <span style={{ color: 'var(--text-secondary)' }}>Stock level APAC low. Increase safety thresholds.</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Sheet 4: Data Profiling & Quality (19-24)
  const renderQualitySheet = () => (
    <div className="grid-cols-3" style={{ gap: '16px' }}>
      {/* 19. Data Profiling Stats */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 19 // DATA PROFILE METRICS</span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', marginTop: '12px', fontFamily: 'var(--font-mono)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>TOTAL CELLS:</span> <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>4.8M</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>COL COLUMNS:</span> <span>18 Mapped</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>SPARSE RATIO:</span> <span style={{ color: 'var(--neon-gold)', fontWeight: 'bold' }}>0.14%</span></div>
        </div>
      </div>

      {/* 20. Auto-Cleaning Logs Console */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 20 // CLEANING CONSOLE</span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: '12px' }}>
          <div>[14:02:18] Imputed 28 empty rows.</div>
          <div>[14:02:19] Re-indexed timezone datetime.</div>
          <div style={{ color: '#047857', fontWeight: 'bold' }}>[14:02:20] Safe output compiled.</div>
        </div>
      </div>

      {/* 21. Database Health Indicators */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 21 // CLUSTER INTEGRITY</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '110px', marginTop: '12px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--neon-emerald)', animation: 'pulse-ring 2s infinite' }} />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>SQL Cluster</div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Replica synchronization: 100.0%</span>
          </div>
        </div>
      </div>

      {/* 22. Schema Data Quality Metric */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 22 // SCHEMA RATING</span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '12px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>98.4%</div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>HEALTH INDEX RATING</span>
        </div>
      </div>

      {/* 23. Anomaly Checker */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 23 // ANOMALY DETECTOR</span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '12px' }}>
          <div style={{ fontSize: '0.78rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
            <span style={{ width: '6px', height: '6px', background: '#dc2626', borderRadius: '50%' }} />
            <span>3 anomalies quarantined</span>
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Isolation forest confidence: 99.8%</span>
        </div>
      </div>

      {/* 24. Database Sync Ticker */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 24 // CONNECTION SYNC</span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.72rem', marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>AWS S3:</span> <span style={{ color: 'var(--neon-emerald)', fontWeight: 'bold' }}>Connected</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Azure Blob:</span> <span style={{ color: 'var(--neon-emerald)', fontWeight: 'bold' }}>Connected</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Postgres:</span> <span style={{ color: 'var(--neon-emerald)', fontWeight: 'bold' }}>Active</span></div>
        </div>
      </div>
    </div>
  );

  // Sheet 5: Trading Telemetry & Feeds (25-30)
  const renderTelemetrySheet = () => (
    <div className="grid-cols-3" style={{ gap: '16px' }}>
      {/* 25. Core Server Load Ticker */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 25 // SERVER CPU LOAD</span>
        <div style={{ flex: 1, height: '110px', marginTop: '12px' }}>
          <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100%' }}>
            {[40, 50, 48, 62, 70, 68, 55].map((val, idx) => (
              <rect key={idx} x={30 + idx * 22} y={80 - val} width="14" height={val} fill="var(--neon-cyan)" opacity="0.85" rx="1.5" />
            ))}
          </svg>
        </div>
      </div>

      {/* 26. API Rate Graph */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 26 // API CALL RATIO</span>
        <div style={{ flex: 1, height: '110px', marginTop: '12px' }}>
          <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100%' }}>
            <path d="M 10 50 Q 50 30 100 55 T 190 20" fill="none" stroke="var(--neon-gold)" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* 27. Ingested Counts Ticker */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 27 // INGESTION TICKER</span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '12px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>948,210</div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>TOTAL INGESTED RECORDS</span>
        </div>
      </div>

      {/* 28. Network Latency Monitor */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 28 // NETWORK LATENCY</span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '12px' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>14ms</div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>API GATEWAY SYNCHRONIZER</span>
        </div>
      </div>

      {/* 29. Memory Allocation Card */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 29 // MEMORY FOOTPRINT</span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
            <span>RAM Usage</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>6.8 GB / 16 GB</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(91,127,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '42.5%', background: 'var(--neon-cyan)', borderRadius: '3px' }} />
          </div>
        </div>
      </div>

      {/* 30. Autopilot Diagnostic Console */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WIDGET 30 // AUTOPILOT AGENT</span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px', fontSize: '0.72rem', marginTop: '12px' }}>
          <div>STATUS: <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>LISTENING</span></div>
          <div>QUEUE TARGET: <span>None</span></div>
          <div style={{ color: 'var(--text-muted)' }}>Drift models locked.</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ width: '100%', margin: '20px 0' }}>
      
      {/* Tab select HUD toolbar */}
      <div 
        className="glass-card"
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '10px 16px', 
          borderRadius: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} className="glow-cyan" />
          <span style={{ fontWeight: 'bold', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visual Ticker Matrix (30 Widgets)</span>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: 'rgba(91,127,255,0.03)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(91,127,255,0.05)' }}>
          {[
            { id: 'sales', label: 'Sales & Performance (1-6)' },
            { id: 'spatial', label: 'Spatial & Structure (7-12)' },
            { id: 'cohort', label: 'Retention & Cohorts (13-18)' },
            { id: 'quality', label: 'Profiling & Quality (19-24)' },
            { id: 'telemetry', label: 'Trading Telemetry (25-30)' }
          ].map(sheet => (
            <button
              key={sheet.id}
              onClick={() => setActiveSheet(sheet.id)}
              style={{
                padding: '6px 12px',
                fontSize: '0.72rem',
                borderRadius: '6px',
                border: 'none',
                background: activeSheet === sheet.id ? 'var(--neon-cyan)' : 'transparent',
                color: activeSheet === sheet.id ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {sheet.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredData && (
        <div
          style={{
            position: 'fixed',
            left: hoveredData.x,
            top: hoveredData.y,
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid var(--neon-cyan)',
            padding: '8px 12px',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '0.75rem',
            zIndex: 1000,
            pointerEvents: 'none',
            boxShadow: '0 8px 32px rgba(148, 163, 184, 0.1)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div style={{ fontWeight: 'bold', color: 'var(--neon-cyan)', marginBottom: '2px' }}>{hoveredData.label}</div>
          <div style={{ fontFamily: 'var(--font-mono)' }}>{hoveredData.value}</div>
        </div>
      )}

      {/* Tab sheets */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSheet}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {activeSheet === 'sales' && renderSalesSheet()}
          {activeSheet === 'spatial' && renderSpatialSheet()}
          {activeSheet === 'cohort' && renderCohortSheet()}
          {activeSheet === 'quality' && renderQualitySheet()}
          {activeSheet === 'telemetry' && renderTelemetrySheet()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
