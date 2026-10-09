import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, TrendingUp, CheckSquare } from 'lucide-react';

export const getDynamicCategories = (fileName = '') => {
  const name = fileName.toLowerCase();
  if (name.includes('fruit')) {
    return [
      { label: 'Organic Bananas', value: '45%', pct: 45, color: 'var(--neon-cyan)' },
      { label: 'Fuji Apples', value: '32%', pct: 32, color: 'var(--neon-violet)' },
      { label: 'Citrus Oranges', value: '23%', pct: 23, color: 'var(--neon-gold)' }
    ];
  } else if (name.includes('telemetry') || name.includes('server') || name.includes('log')) {
    return [
      { label: 'API Gateway Nodes', value: '48%', pct: 48, color: 'var(--neon-cyan)' },
      { label: 'Database Replicas', value: '30%', pct: 30, color: 'var(--neon-violet)' },
      { label: 'Cache Clusters', value: '22%', pct: 22, color: 'var(--neon-gold)' }
    ];
  } else if (name.includes('feedback') || name.includes('survey') || name.includes('customer')) {
    return [
      { label: 'User Interface (UI/UX)', value: '50%', pct: 50, color: 'var(--neon-cyan)' },
      { label: 'Response Latency', value: '32%', pct: 32, color: 'var(--neon-violet)' },
      { label: 'Billing Mappings', value: '18%', pct: 18, color: 'var(--neon-gold)' }
    ];
  } else {
    return [
      { label: 'Electronics', value: '42%', pct: 42, color: 'var(--neon-cyan)' },
      { label: 'Software Licenses', value: '34%', pct: 34, color: 'var(--neon-violet)' },
      { label: 'Hardware Accessories', value: '24%', pct: 24, color: 'var(--neon-gold)' }
    ];
  }
};

export const getDynamicRecommendations = (fileName = '', topCatName = '', topCatVal = '') => {
  const name = fileName.toLowerCase();
  if (name.includes('fruit')) {
    return [
      { text: `Increase inventory for fast-growing products (${topCatName} ${topCatVal} demand spike)`, category: 'Supply Chain', impact: 'High Impact', color: 'var(--neon-cyan)' },
      { text: 'Reduce marketing spend in low-performing regions (APAC down -24.8% supply lag)', category: 'Marketing', impact: 'Medium Impact', color: 'var(--neon-gold)' },
      { text: 'Target high-value retail stores with tailored loyalty campaigns', category: 'Customer Retention', impact: 'High Impact', color: 'var(--neon-cyan)' },
      { text: 'Improve transport conditions for premium fruit segments', category: 'Spoilage Mitigation', impact: 'High Impact', color: 'var(--neon-cyan)' },
      { text: 'Focus pricing models on high-margin organic fruits', category: 'Revenue Optimization', impact: 'Medium Impact', color: 'var(--neon-gold)' }
    ];
  } else if (name.includes('telemetry') || name.includes('server') || name.includes('log')) {
    return [
      { text: `Provision replicas for active services (${topCatName} ${topCatVal} throughput spike)`, category: 'Operations', impact: 'High Impact', color: 'var(--neon-cyan)' },
      { text: 'Reduce pool sizing in low-load sharding clusters (APAC nodes down)', category: 'Cost Save', impact: 'Medium Impact', color: 'var(--neon-gold)' },
      { text: 'Target outlier latency spikes with connection pooling', category: 'Database Control', impact: 'High Impact', color: 'var(--neon-cyan)' },
      { text: 'Improve cache hit ratio for read-heavy sharded segments', category: 'Performance', impact: 'High Impact', color: 'var(--neon-cyan)' },
      { text: 'Focus system capacity configs on high-bandwidth endpoints', category: 'Infrastructure', impact: 'Medium Impact', color: 'var(--neon-gold)' }
    ];
  } else if (name.includes('feedback') || name.includes('survey') || name.includes('customer')) {
    return [
      { text: `Assign engineering resources to active issues (${topCatName} ${topCatVal} ticket spike)`, category: 'Support', impact: 'High Impact', color: 'var(--neon-cyan)' },
      { text: 'Optimize checkout flows in low-scoring billing segments', category: 'UI/UX Optimize', impact: 'Medium Impact', color: 'var(--neon-gold)' },
      { text: 'Target critical CSAT drops with direct callback workflows', category: 'Resolution', impact: 'High Impact', color: 'var(--neon-cyan)' },
      { text: 'Improve response timelines for enterprise client categories', category: 'SLA Mitigation', impact: 'High Impact', color: 'var(--neon-cyan)' },
      { text: 'Focus NPS surveys on post-checkout conversion stages', category: 'Feedback Engine', impact: 'Medium Impact', color: 'var(--neon-gold)' }
    ];
  } else {
    return [
      { text: `Increase inventory for fast-growing products (${topCatName} ${topCatVal} demand spike)`, category: 'Supply Chain', impact: 'High Impact', color: 'var(--neon-cyan)' },
      { text: 'Reduce marketing spend in low-performing regions (APAC down -24.8% supply lag)', category: 'Marketing', impact: 'Medium Impact', color: 'var(--neon-gold)' },
      { text: 'Target high-value customers with tailored loyalty campaigns', category: 'Customer Retention', impact: 'High Impact', color: 'var(--neon-cyan)' },
      { text: 'Improve retention campaigns for premium segment customers', category: 'Churn Mitigation', impact: 'High Impact', color: 'var(--neon-cyan)' },
      { text: 'Focus product pricing models on high-margin SaaS licenses', category: 'Revenue Optimization', impact: 'Medium Impact', color: 'var(--neon-gold)' }
    ];
  }
};

export default function AiNarrator({ dataProfile }) {
  const [activeNarrative, setActiveNarrative] = useState('summary'); 
  const cats = dataProfile?.categoriesDistribution || getDynamicCategories(dataProfile?.name);
  const topCat = cats[0] || { label: 'Category A', value: '50%' };
  const recommendations = getDynamicRecommendations(dataProfile?.name, topCat.label, topCat.value);

  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(91,127,255,0.12)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} className="glow-cyan" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>AI Executive Narrator</h3>
        </div>

        {/* Tab switchers */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(91,127,255,0.03)', padding: '3px', borderRadius: '6px', border: '1px solid rgba(91,127,255,0.05)' }}>
          {[
            { id: 'summary', label: 'Executive Summary' },
            { id: 'story', label: 'Story Mode' },
            { id: 'recommend', label: 'Smart Actions' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveNarrative(tab.id)}
              style={{
                padding: '6px 12px',
                fontSize: '0.72rem',
                border: 'none',
                background: activeNarrative === tab.id ? 'var(--neon-cyan)' : 'transparent',
                color: activeNarrative === tab.id ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Narrative Feed */}
      <div style={{ flex: 1, minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {activeNarrative === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <FileText size={18} style={{ color: 'var(--neon-cyan)', marginTop: '3px' }} />
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                  <strong>Boardroom Telemetry Overview:</strong> Revenue increased by <span style={{ color: '#047857', fontWeight: 'bold' }}>18.7% MoM</span>. {topCat.label} remains the highest-performing category with <span style={{ color: '#b45309', fontWeight: 'bold' }}>{topCat.value} total contribution</span>. North region generated the largest revenue growth. Customer acquisition increased by <span style={{ color: '#047857', fontWeight: 'bold' }}>12.1%</span>. Forecast models indicate continued growth over the next 60 days.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '28px' }}>
                <div>DATA PROFILE STATUS: <span style={{ color: '#047857', fontWeight: 'bold' }}>VALIDATED</span></div>
                <div>AUDITED BY: <span style={{ color: '#b45309', fontWeight: 'bold' }}>DATALENSAI ENGINE v2.4</span></div>
              </div>
            </motion.div>
          )}

          {activeNarrative === 'story' && (
            <motion.div
              key="story"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <TrendingUp size={18} style={{ color: 'var(--neon-violet)', marginTop: '3px' }} />
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                  <strong>AI Business Story:</strong> Sales started increasing rapidly in week two, driven by Product Alpha demand. {topCat.label} products drove most of the growth. The South region experienced a temporary decline before recovering. Revenue is projected to cross the next target threshold within 30 days.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '28px' }}>
                <div>SEGMENT DRIFT: <span style={{ color: '#047857', fontWeight: 'bold' }}>0.01% (LOW)</span></div>
                <div>TREND CYCLE: <span style={{ color: '#b45309', fontWeight: 'bold' }}>GROWTH STAGE</span></div>
              </div>
            </motion.div>
          )}

          {activeNarrative === 'recommend' && (
            <motion.div
              key="recommend"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              {recommendations.slice(0, 3).map((rec, idx) => (
                <div 
                  key={idx} 
                  className="glass-card"
                  style={{ 
                    padding: '10px 14px', 
                    background: 'rgba(255,255,255,0.4)', 
                    borderLeft: `3px solid ${rec.color}`,
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.6)',
                    borderRight: '1px solid rgba(255,255,255,0.6)',
                    borderBottom: '1px solid rgba(255,255,255,0.6)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <CheckSquare size={14} style={{ color: rec.color }} />
                    <span style={{ color: 'var(--text-primary)' }}>{rec.text}</span>
                  </div>
                  <span 
                    style={{ 
                      fontSize: '0.7rem', 
                      fontFamily: 'var(--font-mono)', 
                      color: rec.color === 'var(--neon-cyan)' ? '#1d4ed8' : '#b45309',
                      background: `${rec.color}12`,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}
                  >
                    {rec.impact}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
