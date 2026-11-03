import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function PredictivePanel() {
  const [marketingMultiplier, setMarketingMultiplier] = useState(1.0);
  const [aiOptimized, setAiOptimized] = useState(true);

  const baseRevenue = 148200;
  const projectedRevenue = Math.round(baseRevenue * marketingMultiplier * (aiOptimized ? 1.15 : 0.95));
  const baseChurn = 4.2; 
  const projectedChurn = Math.max(0.8, (baseChurn / marketingMultiplier) * (aiOptimized ? 0.45 : 1.2)).toFixed(1);
  const inventoryStockLevel = Math.round(85 * marketingMultiplier * (aiOptimized ? 1.08 : 0.85));
  const riskScore = Math.max(5, Math.round(45 * (2.0 - marketingMultiplier) * (aiOptimized ? 0.45 : 1.1)));

  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: '12px', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(91,127,255,0.12)', paddingBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--neon-violet)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
            PREDICTIVE SUITE // PROPHET FORECASTS
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Neural Trend Predictions</h3>
        </div>
        <div style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(123, 97, 255, 0.1)', border: '1px solid rgba(123, 97, 255, 0.2)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--neon-violet)', fontWeight: 'bold' }}>
          <Sparkles size={12} className="glow-violet" />
          <span>PROPHET ACTIVE</span>
        </div>
      </div>

      {/* Control Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '12px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '8px', border: '1px solid rgba(91, 127, 255, 0.08)' }}>
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <span>Growth Multiplier (Marketing CTR)</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>{marketingMultiplier.toFixed(1)}x</span>
          </label>
          <input 
            type="range" 
            min="0.5" 
            max="2.0" 
            step="0.1"
            value={marketingMultiplier}
            onChange={(e) => setMarketingMultiplier(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--neon-cyan)', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>AI Hyper-Parameter Optimization</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setAiOptimized(true)}
              style={{
                flex: 1,
                padding: '6px',
                fontSize: '0.75rem',
                borderRadius: '6px',
                background: aiOptimized ? 'rgba(91, 127, 255, 0.12)' : 'rgba(255, 255, 255, 0.4)',
                border: aiOptimized ? '1px solid var(--neon-cyan)' : '1px solid rgba(255, 255, 255, 0.2)',
                color: aiOptimized ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              ACTIVE (DeepClean)
            </button>
            <button
              onClick={() => setAiOptimized(false)}
              style={{
                flex: 1,
                padding: '6px',
                fontSize: '0.75rem',
                borderRadius: '6px',
                background: !aiOptimized ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.4)',
                border: !aiOptimized ? '1px solid var(--neon-red)' : '1px solid rgba(255, 255, 255, 0.2)',
                color: !aiOptimized ? 'var(--neon-red)' : 'var(--text-secondary)',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              BYPASS LAYER
            </button>
          </div>
        </div>
      </div>

      {/* Main Forecast Graph */}
      <div style={{ position: 'relative', height: '140px' }}>
        <div style={{ position: 'absolute', top: 5, left: 10, fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TrendingUp size={12} className="glow-cyan" />
          <span>Next Month Sales Regression & Demand Target</span>
        </div>

        <svg viewBox="0 0 500 130" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <line x1="30" y1="110" x2="480" y2="110" stroke="rgba(91, 127, 255, 0.05)" />
          <line x1="250" y1="10" x2="250" y2="110" stroke="rgba(0, 0, 0, 0.05)" strokeDasharray="3 3" />
          
          {/* Confidence interval band */}
          <path 
            d={`M 250 70 Q 300 ${50 / marketingMultiplier} 380 ${40 / marketingMultiplier} T 480 ${30 / marketingMultiplier} L 480 ${70 / marketingMultiplier} T 380 ${90 / marketingMultiplier} Q 300 ${100 / marketingMultiplier} 250 70 Z`} 
            fill="rgba(91, 127, 255, 0.05)" 
            style={{ transition: 'd 0.3s ease' }}
          />

          {/* Historical line */}
          <path d="M 30 100 Q 100 85 180 80 T 250 70" fill="none" stroke="var(--neon-cyan)" strokeWidth="2.5" />

          {/* Forecast line */}
          <path 
            d={`M 250 70 Q 300 ${70 - 20 * marketingMultiplier} 380 ${60 - 30 * marketingMultiplier} T 480 ${50 - 40 * marketingMultiplier}`} 
            fill="none" 
            stroke="var(--neon-gold)" 
            strokeWidth="3.5" 
            strokeDasharray="4 2"
            style={{ 
              transition: 'd 0.3s ease',
              filter: 'drop-shadow(0 0 3px var(--neon-gold-glow))' 
            }}
          />
        </svg>
      </div>

      {/* Prediction Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        
        {/* Next Month Revenue */}
        <div className="glass-card" style={{ padding: '10px', background: 'rgba(255,255,255,0.4)', borderRadius: '6px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Next Month Rev</span>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', margin: '2px 0', fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>
            $172,400
          </div>
          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Confidence: 95%</span>
        </div>

        {/* Demand Forecast */}
        <div className="glass-card" style={{ padding: '10px', background: 'rgba(255,255,255,0.4)', borderRadius: '6px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Demand Index</span>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', margin: '2px 0', fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>
            {Math.round(2840 * marketingMultiplier)}
          </div>
          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Trend: +14.2%</span>
        </div>

        {/* Churn Prediction */}
        <div className="glass-card" style={{ padding: '10px', background: 'rgba(255,255,255,0.4)', borderRadius: '6px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Churn Risk</span>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', margin: '2px 0', fontFamily: 'var(--font-mono)', color: parseFloat(projectedChurn) > 4.0 ? 'var(--neon-red)' : 'var(--neon-emerald)' }}>
            {projectedChurn}%
          </div>
          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Status: {parseFloat(projectedChurn) > 4.0 ? 'CRITICAL' : 'SAFE'}</span>
        </div>

        {/* Inventory forecast */}
        <div className="glass-card" style={{ padding: '10px', background: 'rgba(255,255,255,0.4)', borderRadius: '6px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Inventory Lev</span>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', margin: '2px 0', fontFamily: 'var(--font-mono)', color: 'var(--neon-gold)' }}>
            {inventoryStockLevel}%
          </div>
          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Risk: {aiOptimized ? 'OPTIMAL' : 'LOW'}</span>
        </div>

        {/* Risk Scores */}
        <div className="glass-card" style={{ padding: '10px', background: 'rgba(255,255,255,0.4)', borderRadius: '6px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Risk Index</span>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', margin: '2px 0', fontFamily: 'var(--font-mono)', color: riskScore > 50 ? 'var(--neon-red)' : 'var(--neon-gold)' }}>
            {riskScore} / 100
          </div>
          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Category: {riskScore > 50 ? 'HIGH' : 'LOW'}</span>
        </div>

      </div>
    </div>
  );
}
