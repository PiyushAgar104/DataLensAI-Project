import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, FileText, BarChart3, LineChart, PieChart, MapPin, 
  TrendingUp, HelpCircle, Layers, Database, UserCheck, Settings,
  Cpu, RotateCw, Network, HelpCircle as HelpIcon, ChevronRight
} from 'lucide-react';
import KpiGrid from './KpiGrid';
import AiNarrator from './AiNarrator';
import PredictivePanel from './PredictivePanel';
import SpatialTwinZone from './SpatialTwinZone';
import VisualizationZone from './VisualizationZone';
import RealTimeMonitoring from './RealTimeMonitoring';
import DataChat from '../components/DataChat';

export const getDynamicCategories = (fileName = '') => {
  return [];
};

export const getDynamicQa = (fileName = '', topCatName = '', topCatVal = '') => {
  return [];
};

export default function PowerBiDashboard({ dataProfile, onReset }) {
  const cats = dataProfile?.categoriesDistribution || [];
  const topCat = cats[0] || { label: 'No categorical field', value: 'Unavailable' };
  const groupedInsights = dataProfile?.groupedInsights || [];
  const primaryGroups = groupedInsights
    .filter((item) => item.numericColumn === dataProfile?.primaryNumericColumn && item.column === dataProfile?.primaryCategoryColumn)
    .sort((a, b) => Number(b.total || 0) - Number(a.total || 0));
  const timeSeries = dataProfile?.time_series || [];
  const insights = dataProfile?.insights || [];

  const getPieChartData = () => {
    if (!cats || cats.length === 0) return [];
    if (cats.length <= 5) {
      return cats;
    }
    const top4 = cats.slice(0, 4);
    const remaining = cats.slice(4);
    const remainingPct = remaining.reduce((sum, item) => sum + (item.pct || 0), 0);
    if (remainingPct > 0) {
      return [
        ...top4,
        {
          label: 'Others',
          value: `${remainingPct}%`,
          pct: remainingPct,
          color: '#6B7280'
        }
      ];
    }
    return top4;
  };

  const pieData = getPieChartData();

  const [activePage, setActivePage] = useState(1);
  const [hoveredData, setHoveredData] = useState(null);
  const [marketingMultiplier, setMarketingMultiplier] = useState(1.0);
  const [aiOptimized, setAiOptimized] = useState(true);
  const [twinTemp, setTwinTemp] = useState(48);
  const [activeNode, setActiveNode] = useState(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [insightFilter, setInsightFilter] = useState('All');
  const [insightSearch, setInsightSearch] = useState('');

  // Auto rotate clusters
  useEffect(() => {
    const timer = setInterval(() => {
      setRotationAngle(prev => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const project3D = (x, y, z) => {
    const rad = (rotationAngle * Math.PI) / 180;
    const rotX = x * Math.cos(rad) - z * Math.sin(rad);
    const rotZ = x * Math.sin(rad) + z * Math.cos(rad);
    const perspective = 300;
    const scale = perspective / (perspective + rotZ);
    return { x: 200 + rotX * scale, y: 100 + y * scale, depth: rotZ };
  };

  const clusterPoints = [
    ...Array.from({ length: 12 }, (_, i) => ({ x: Math.sin(i)*25, y: Math.cos(i)*25, z: (i%3-1)*15, color: 'var(--neon-cyan)' })),
    ...Array.from({ length: 12 }, (_, i) => ({ x: 80 + Math.sin(i)*20, y: 30 + Math.cos(i)*20, z: -40 + (i%3-1)*10, color: 'var(--neon-gold)' })),
    ...Array.from({ length: 8 }, (_, i) => ({ x: -70 + Math.sin(i)*18, y: -40 + Math.cos(i)*18, z: 30 + (i%3-1)*12, color: 'var(--neon-violet)' })),
  ];

  const pages = [
    { id: 1, name: "Executive Overview", icon: Layers },
    { id: 2, name: "Sales Analytics", icon: BarChart3 },
    { id: 3, name: "Customer Analytics", icon: UserCheck },
    { id: 4, name: "Regional Analytics", icon: MapPin },
    { id: 5, name: "Forecasting & Predictions", icon: TrendingUp },
    { id: 6, name: "AI Insights & Recommendations", icon: Sparkles }
  ];

  const getKpiData = () => {
    const isTel = !dataProfile.hasSales;
    const realKpi = dataProfile?.kpiData;
    return [
      { id: 1, label: isTel ? "Numeric Total" : "Primary Numeric Total", value: realKpi?.totalRevenue || "Unavailable", change: null, sparkline: [], color: 'var(--neon-cyan)' },
      { id: 2, label: "Secondary Metric", value: realKpi?.totalProfit || "Unavailable", change: null, sparkline: [], color: 'var(--neon-violet)' },
      { id: 3, label: "Rows", value: realKpi?.totalOrders || "Unavailable", change: null, sparkline: [], color: 'var(--neon-gold)' },
      { id: 4, label: "Unique Customers", value: realKpi?.totalCustomers || "Unavailable", change: null, sparkline: [], color: 'var(--neon-cyan)' },
      { id: 5, label: "Growth Rate", value: realKpi?.growthRate || "Unavailable", change: null, sparkline: [], color: 'var(--neon-violet)' },
      { id: 6, label: "Numeric Mean", value: realKpi?.avgOrderValue || "Unavailable", change: null, sparkline: [], color: 'var(--neon-cyan)' },
      { id: 7, label: "Conversion Rate", value: realKpi?.conversionRate || "Unavailable", change: null, sparkline: [], color: 'var(--neon-gold)' },
      { id: 8, label: "Forecast Accuracy", value: realKpi?.forecastAccuracy || "Unavailable", change: null, sparkline: [], color: 'var(--neon-cyan)' }
    ];
  };

  const kpis = getKpiData();
  const insightCategories = ['All', ...new Set(insights.map((item) => item.category).filter(Boolean))];
  const visibleInsights = insights.filter((item) =>
    (insightFilter === 'All' || item.category === insightFilter) &&
    `${item.title} ${item.explanation} ${item.action}`.toLowerCase().includes(insightSearch.toLowerCase())
  );
  const exportInsights = () => {
    const blob = new Blob([JSON.stringify(visibleInsights, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `datalensai-insights-${dataProfile.dataset_id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      
      {/* Top AI Profiler Header */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '14px 20px', 
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(0, 217, 255, 0.12)', color: 'var(--neon-emerald)' }}>
            <Database size={18} className="glow-cyan" />
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ACTIVE DATASET SCHEMA</span>
            <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{dataProfile.name}</h2>
          </div>
        </div>

        {/* Column Profiler Tags */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {dataProfile.columns.map((col, idx) => (
            <div 
              key={idx}
              style={{ 
                padding: '4px 10px', 
                borderRadius: '6px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid rgba(255, 255, 255, 0.12)',
                fontSize: '0.72rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{col.name}</span>
              <span style={{ fontSize: '0.62rem', padding: '1px 4px', borderRadius: '3px', background: 'rgba(91, 127, 255, 0.15)', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>
                {col.type}
              </span>
            </div>
          ))}
        </div>

        <button 
          onClick={onReset}
          className="btn-secondary" 
          style={{ padding: '8px 14px', fontSize: '0.75rem', borderRadius: '8px' }}
        >
          Upload Another Dataset
        </button>
      </div>

      {/* Main Power BI Report Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '16px', minHeight: '600px' }}>
        
        {/* Left Page tabs (Power BI sidebar style) */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '16px 12px', 
            borderRadius: '16px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '6px',
            alignSelf: 'stretch'
          }}
        >
          <div style={{ padding: '0 8px 12px 8px', borderBottom: '1px solid rgba(17,24,39,0.08)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Report Pages</span>
          </div>

          {pages.map((p) => {
            const Icon = p.icon;
            const isActive = activePage === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePage(p.id)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.25s',
                  boxShadow: isActive ? '0 4px 12px rgba(123, 97, 255, 0.2)' : 'none'
                }}
              >
                <Icon size={14} style={{ color: isActive ? '#ffffff' : 'var(--neon-cyan)' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: isActive ? 'bold' : 'normal' }}>{p.name}</span>
              </button>
            );
          })}

          <div style={{ marginTop: 'auto', padding: '12px 8px 0 8px', borderTop: '1px solid rgba(17,24,39,0.08)', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            <div>ENGINE: POWER_BI_v3</div>
            <div>STATUS: AUTO_SYNC</div>
          </div>
        </div>

        {/* Right Dynamic Page Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              
              {/* PAGE 1: Executive Overview */}
              {activePage === 1 && (
                <>
                  {/* AUTO KPI SECTION */}
                  <div className="grid-cols-4" style={{ gap: '12px' }}>
                    {kpis.map((kpi) => (
                      <div 
                        key={kpi.id} 
                        className="glass-card" 
                        style={{ padding: '14px 16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '90px' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 'bold' }}>
                          <span>{kpi.label.toUpperCase()}</span>
                          <span style={{ color: kpi.color }}>●</span>
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '4px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                          {kpi.value}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem' }}>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>{kpi.change || 'Actual dataset value'}</span>
                          
                          {/* Mini sparkline */}
                          <svg width="45" height="15" style={{ overflow: 'visible' }}>
                            <path
                              d={kpi.sparkline.length ? `M ${kpi.sparkline.map((val, i) => `${(i * 45) / 6}, ${13 - (val / Math.max(...kpi.sparkline)) * 10}`).join(' L ')}` : ''}
                              fill="none"
                              stroke={kpi.color}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI REPORT GENERATOR */}
                  <div className="glass-card" style={{ padding: '16px 20px', borderRadius: '16px', background: 'rgba(91, 127, 255, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Sparkles size={14} className="glow-cyan" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--neon-gold)', fontFamily: 'var(--font-mono)' }}>AUTOGENERATED REPORT SUMMARY</span>
                    </div>
                    <p style={{ fontSize: '0.88rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                      <strong>Executive Summary:</strong> {dataProfile.rows.toLocaleString()} rows and {dataProfile.columns_count} columns were profiled. Missing cells: {dataProfile.missing_cells.toLocaleString()}; duplicate rows: {dataProfile.duplicate_rows.toLocaleString()}. Forecasts remain unavailable unless the uploaded data contains sufficient time-series observations.
                    </p>
                  </div>

                  {/* Main Overview Graphics */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '16px' }}>
                    <div className="glass-card" style={{ padding: '16px', height: '240px', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Primary Data Trend Line</span>
                      <div style={{ flex: 1, marginTop: '12px' }}>
                        <svg viewBox="0 0 200 65" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                          {timeSeries.length > 1 ? (
                            <polyline
                              points={timeSeries.map((point, index) => {
                                const max = Math.max(...timeSeries.map((item) => Number(item.value) || 0));
                                const min = Math.min(...timeSeries.map((item) => Number(item.value) || 0));
                                const x = 10 + (index / (timeSeries.length - 1)) * 180;
                                const y = 55 - (((Number(point.value) || 0) - min) / Math.max(max - min, 1)) * 50;
                                return `${x},${y}`;
                              }).join(' ')}
                              fill="none"
                              stroke="var(--neon-cyan)"
                              strokeWidth="2.5"
                            />
                          ) : (
                            <text x="10" y="35" fill="var(--text-secondary)" fontSize="7">Time-series data unavailable</text>
                          )}
                        </svg>
                      </div>
                    </div>
                    <AiNarrator dataProfile={dataProfile} />
                  </div>
                </>
              )}

              {/* PAGE 2: Sales Analytics */}
              {activePage === 2 && (
                <>
                  {!dataProfile.hasSales && (
                    <div className="glass-card" style={{ padding: '12px', background: 'rgba(255, 77, 77, 0.08)', border: '1px solid rgba(255, 77, 77, 0.2)', color: 'var(--neon-red)', fontSize: '0.78rem', borderRadius: '8px' }}>
                      <strong>AI Alert:</strong> Sales numerical columns not detected. Autogenerated system process metrics telemetry instead.
                    </div>
                  )}

                  <div className="grid-cols-2" style={{ gap: '16px' }}>
                    
                    {/* Category Revenue Bar Chart */}
                    <div className="glass-card" style={{ padding: '16px', height: '240px', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Category Revenue Bar Chart</span>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', marginTop: '12px' }}>
                        {cats.slice(0, 5).map((item, idx) => (
                          <div key={idx} style={{ fontSize: '0.78rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                              <span>{item?.label || 'Unknown'}</span>
                              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{item?.value || '0%'}</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: item?.value || '0%', background: item?.color || 'var(--neon-cyan)' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Product Performance (Waterfall Chart) */}
                    <div className="glass-card" style={{ padding: '16px', height: '240px', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Q3 Revenue Drop Bridge (Waterfall Chart)</span>
                      <div style={{ flex: 1, marginTop: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                          {primaryGroups.slice(0, 5).map((item, index) => (
                            <div key={`${item.column}-${item.label}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '0.75rem' }}>
                              <span><strong>{index === 0 ? 'Top: ' : ''}{item.label}</strong> ({item.column})</span>
                              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>{Number(item.total).toLocaleString()}</span>
                            </div>
                          ))}
                          {!primaryGroups.length && <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Grouped numeric analysis unavailable.</span>}
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="grid-cols-3" style={{ gap: '16px' }}>
                    {/* Top 10 Categories */}
                    <div className="glass-card" style={{ padding: '16px', height: '200px', display: 'flex', flexDirection: 'column', gridColumn: 'span 2' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Top 10 Category Distribution</span>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', gap: '16px', justifyContent: 'flex-start', padding: '0 10px', marginTop: '12px', overflowX: 'auto' }}>
                        {(() => {
                          const top10Cats = cats.slice(0, 10);
                          const maxPct = Math.max(...top10Cats.map(c => c.pct || 1), 1);
                          return top10Cats.map((item, idx) => {
                            const val = item.pct || 0;
                            const heightPercent = (val / maxPct) * 100;
                            const labelText = item?.label || '';
                            const label = labelText.length > 7 ? labelText.substring(0, 6) + '..' : labelText;
                            return (
                              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '36px', height: '100%', flexShrink: 0 }} title={item.label}>
                                <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                                  <div style={{ width: '100%', height: `${heightPercent}%`, background: `linear-gradient(to top, var(--primary), ${item.color || 'var(--neon-cyan)'})`, borderRadius: '4px', transition: 'height 0.4s' }} />
                                </div>
                                <span style={{ fontSize: '0.52rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>{label}</span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Revenue Distribution Pie Chart */}
                    <div className="glass-card" style={{ padding: '16px', height: '200px', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Revenue Distribution</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', flex: 1 }}>
                        <div style={{ height: '100px', width: '100px', position: 'relative', flexShrink: 0 }}>
                          <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                            {(() => {
                              let accumulatedPct = 0;
                              return pieData.map((item, idx) => {
                                const pct = item.pct || 0;
                                const offset = -accumulatedPct;
                                accumulatedPct += pct;
                                return (
                                  <circle
                                    key={idx}
                                    cx="18"
                                    cy="18"
                                    r="15.9"
                                    fill="none"
                                    stroke={item.color || 'var(--neon-cyan)'}
                                    strokeWidth="4"
                                    strokeDasharray={`${pct} 100`}
                                    strokeDashoffset={offset}
                                  />
                                );
                              });
                            })()}
                          </svg>
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.65rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>SHARE</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, justifyContent: 'center', overflow: 'hidden' }}>
                          {pieData.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color || 'var(--neon-cyan)', flexShrink: 0 }} />
                              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }} title={item.label}>
                                {item.label}
                              </span>
                              <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginLeft: 'auto', flexShrink: 0 }}>
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* PAGE 3: Customer Analytics */}
              {activePage === 3 && (
                <>
                  {!dataProfile.hasCustomers && (
                    <div className="glass-card" style={{ padding: '12px', background: 'rgba(255, 77, 77, 0.08)', border: '1px solid rgba(255, 77, 77, 0.2)', color: 'var(--neon-red)', fontSize: '0.78rem', borderRadius: '8px' }}>
                      <strong>AI Alert:</strong> Customer identifiers were not detected. Customer metrics are unavailable for this dataset.
                    </div>
                  )}

                  <div className="grid-cols-2" style={{ gap: '16px' }}>
                    
                    {/* Customer Segmentation */}
                    <div className="glass-card" style={{ padding: '16px', height: '240px', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Customer Segmentation Scatter Plot</span>
                      <div style={{ flex: 1, marginTop: '12px' }}>
                        <svg viewBox="0 0 200 70" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                          <circle cx="30" cy="45" r="3" fill="var(--neon-cyan)" />
                          <circle cx="45" cy="50" r="3.5" fill="var(--neon-cyan)" />
                          <circle cx="70" cy="40" r="2.5" fill="var(--neon-cyan)" />
                          
                          <circle cx="110" cy="25" r="4.5" fill="var(--neon-violet)" />
                          <circle cx="130" cy="20" r="3" fill="var(--neon-violet)" />
                          <circle cx="150" cy="15" r="4" fill="var(--neon-violet)" />

                          <circle cx="170" cy="55" r="3" fill="var(--neon-gold)" />
                          <circle cx="185" cy="50" r="3.5" fill="var(--neon-gold)" />
                        </svg>
                      </div>
                    </div>

                    {/* Retention Analysis (Cohort matrix) */}
                    <div className="glass-card" style={{ padding: '16px', height: '240px', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Cohort Retention Analysis</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '3px', height: '140px', marginTop: '12px' }}>
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
                                fontSize: '0.62rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontWeight: 'bold',
                                fontFamily: 'var(--font-mono)',
                                borderRadius: '4px'
                              }}
                            >
                              {opacity > 0 ? `${Math.round(opacity * 100)}%` : ''}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  <div className="grid-cols-3" style={{ gap: '16px' }}>
                    {/* Customer Growth Trend */}
                    <div className="glass-card" style={{ padding: '16px', height: '200px', display: 'flex', flexDirection: 'column', gridColumn: 'span 2' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Customer Growth Trend</span>
                      <div style={{ flex: 1, marginTop: '12px' }}>
                        <svg viewBox="0 0 200 60" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                          <path d="M 10 50 Q 50 45 100 20 T 190 10" fill="none" stroke="var(--neon-cyan)" strokeWidth="2" />
                          <circle cx="190" cy="10" r="3" fill="#ffffff" stroke="var(--neon-cyan)" strokeWidth="1.5" />
                        </svg>
                      </div>
                    </div>

                    {/* Conversion Funnel */}
                    <div className="glass-card" style={{ padding: '16px', height: '200px', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Conversion Funnel</span>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '12px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        Conversion metrics require event or funnel columns in the uploaded dataset.
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* PAGE 4: Regional Analytics */}
              {activePage === 4 && (
                <>
                  {!dataProfile.hasGeographic && (
                    <div className="glass-card" style={{ padding: '12px', background: 'rgba(255, 77, 77, 0.08)', border: '1px solid rgba(255, 77, 77, 0.2)', color: 'var(--neon-red)', fontSize: '0.78rem', borderRadius: '8px' }}>
                      <strong>AI Alert:</strong> Geographic fields were not detected. Regional metrics are unavailable for this dataset.
                    </div>
                  )}

                  <div className="grid-cols-2" style={{ gap: '16px' }}>
                    
                    {/* Interactive Map */}
                    <div className="glass-card" style={{ padding: '16px', height: '260px', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Geographic Heatmap (Regional Pins)</span>
                      <div style={{ flex: 1, border: '1px solid rgba(255,255,255,0.12)', position: 'relative', marginTop: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
                        {/* Map grid lines */}
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        <div style={{ position: 'absolute', top: '35%', left: '25%', width: '12px', height: '12px', border: '2px solid var(--neon-cyan)', borderRadius: '50%', animation: 'pulse-ring 2s infinite' }} />
                        <div style={{ position: 'absolute', top: '25%', left: '70%', width: '12px', height: '12px', border: '2px solid var(--neon-cyan)', borderRadius: '50%', animation: 'pulse-ring 2.5s infinite' }} />
                        <div style={{ position: 'absolute', top: '65%', left: '50%', width: '12px', height: '12px', border: '2px solid var(--neon-gold)', borderRadius: '50%', animation: 'pulse-ring 1.8s infinite' }} />
                      </div>
                    </div>

                    {/* Regional Performance Dashboard */}
                    <div className="glass-card" style={{ padding: '16px', height: '260px', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Regional Performance Metrics</span>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', marginTop: '12px' }}>
                        {(dataProfile.hasGeographic ? primaryGroups : []).slice(0, 5).map((reg, i) => (
                          <div key={i} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: reg.color }} />
                              <span style={{ fontWeight: 'bold' }}>{reg.label}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', fontFamily: 'var(--font-mono)' }}>
                              <span>{Number(reg.total).toLocaleString()}</span>
                              <span style={{ color: 'var(--neon-cyan)' }}>{reg.column}</span>
                            </div>
                          </div>
                        ))}
                        {!dataProfile.hasGeographic && <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Regional metrics unavailable for this dataset.</span>}
                      </div>
                    </div>

                  </div>

                  <div className="grid-cols-3" style={{ gap: '16px' }}>
                    {/* Radar Chart */}
                    <div className="glass-card" style={{ padding: '16px', height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', alignSelf: 'flex-start' }}>Regional Strength (Radar Chart)</span>
                      <div style={{ height: '110px', width: '110px', marginTop: '12px' }}>
                        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                          <polygon points="50,10 90,35 90,75 50,95 10,75 10,35" fill="none" stroke="rgba(255,255,255,0.1)" />
                          <polygon points="50,25 80,45 80,65 50,80 20,65 20,45" fill="none" stroke="rgba(255,255,255,0.1)" />
                          <polygon points="50,18 80,30 85,68 50,85 22,60 18,38" fill="rgba(91,127,255,0.08)" stroke="var(--neon-cyan)" strokeWidth="1.5" />
                        </svg>
                      </div>
                    </div>

                    {/* Treemap */}
                    <div className="glass-card" style={{ padding: '16px', height: '200px', display: 'flex', flexDirection: 'column', gridColumn: 'span 2' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Regional Capacity Treemap</span>
                      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '6px', height: '120px', marginTop: '12px' }}>
                        <div style={{ background: 'rgba(91,127,255,0.08)', border: '1px solid rgba(91,127,255,0.2)', padding: '10px', fontSize: '0.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyItems: 'flex-end', justifyContent: 'flex-end' }}>
                          <span style={{ fontWeight: 'bold' }}>North Region</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>42% Total Volume</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '6px' }}>
                          <div style={{ background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.2)', padding: '6px', fontSize: '0.7rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                            <span>Europe</span>
                          </div>
                          <div style={{ background: 'rgba(255,184,107,0.08)', border: '1px solid rgba(255,184,107,0.2)', padding: '6px', fontSize: '0.7rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                            <span>APAC</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* PAGE 5: Forecasting & Predictions */}
              {activePage === 5 && (
                <>
                  <div className="grid-cols-2" style={{ gap: '16px' }}>
                    
                    {/* Forecast Control Panel */}
                    <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Prophet AI Simulation Parameters</span>
                      
                      <div>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                          <span>CTR Growth Multiplier</span>
                          <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{marketingMultiplier.toFixed(1)}x</span>
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

                      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem' }}>AI Hyper-Parameter Optimization</span>
                        <button 
                          onClick={() => setAiOptimized(prev => !prev)}
                          className={aiOptimized ? 'btn-primary' : 'btn-secondary'}
                          style={{ padding: '6px 14px', fontSize: '0.72rem', borderRadius: '6px' }}
                        >
                          {aiOptimized ? 'ACTIVE (DeepClean)' : 'BYPASS LAYER'}
                        </button>
                      </div>
                    </div>

                    {/* Interactive Forecast Graph */}
                    <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Regression Forecast Curves</span>
                      <div style={{ flex: 1, marginTop: '12px' }}>
                        <svg viewBox="0 0 200 65" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                          {/* Historical */}
                          <path d="M 10 50 Q 50 45 100 40" fill="none" stroke="var(--neon-cyan)" strokeWidth="2" />
                          {/* Forecast */}
                          <path 
                            d={`M 100 40 Q 140 ${40 - 15 * marketingMultiplier} 190 ${35 - 20 * marketingMultiplier}`} 
                            fill="none" 
                            stroke="var(--neon-gold)" 
                            strokeWidth="2.5" 
                            strokeDasharray="3 2"
                            style={{ transition: 'd 0.2s' }}
                          />
                          {/* Confidence Band */}
                          <path 
                            d={`M 100 40 Q 140 ${40 - 25 * marketingMultiplier} 190 ${25 - 30 * marketingMultiplier} L 190 ${45 - 10 * marketingMultiplier} Q 140 ${40 - 5 * marketingMultiplier} 100 40 Z`} 
                            fill="rgba(91, 127, 255, 0.05)" 
                            style={{ transition: 'd 0.2s' }}
                          />
                        </svg>
                      </div>
                    </div>

                  </div>

                  <div className="grid-cols-4" style={{ gap: '12px' }}>
                    {[
                      { label: "Forecast", val: dataProfile.hasDates && timeSeries.length >= 3 ? "Available via API" : "Unavailable", desc: "Requires validated time-series data" },
                      { label: "Numeric series", val: dataProfile.primaryNumericColumn || "Unavailable", desc: "Selected from uploaded schema" },
                      { label: "Observations", val: timeSeries.length.toLocaleString(), desc: "Parsed date/value points" },
                      { label: "Dataset", val: dataProfile.dataset_id.slice(0, 8), desc: "Current dataset only" }
                    ].map((m, i) => (
                      <div key={i} className="glass-card" style={{ padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{m.label}</span>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', margin: '2px 0', fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>{m.val}</div>
                        <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>{m.desc}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* PAGE 6: AI Insights & Recommendations */}
              {activePage === 6 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                  
                  {/* AI Insight Engine Answers */}
                  <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', borderBottom: '1px solid rgba(17,24,39,0.08)', paddingBottom: '8px' }}>
                      AI Insight Engine Answers
                    </span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input className="glass-input" placeholder="Search insights" value={insightSearch} onChange={(event) => setInsightSearch(event.target.value)} style={{ flex: 1, minWidth: '150px', padding: '7px 10px' }} />
                      <select className="glass-input" value={insightFilter} onChange={(event) => setInsightFilter(event.target.value)} style={{ padding: '7px 10px' }}>
                        {insightCategories.map((category) => <option key={category}>{category}</option>)}
                      </select>
                      <button type="button" className="btn-secondary" onClick={exportInsights} style={{ padding: '7px 10px' }}>Export</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '380px' }}>
                      {visibleInsights.length ? visibleInsights.map((item, idx) => (
                        <details key={`${item.category}-${idx}`} style={{ fontSize: '0.8rem', borderLeft: `2px solid ${item.importance === 'High' || item.importance === 'Critical' ? 'var(--neon-red)' : 'var(--neon-cyan)'}`, paddingLeft: '8px' }}>
                          <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            {item.title} <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>({item.importance})</span>
                          </summary>
                          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.4', margin: '6px 0' }}>{item.explanation}</p>
                          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}><strong>Next step:</strong> {item.action}</p>
                          <pre style={{ fontSize: '0.65rem', whiteSpace: 'pre-wrap', color: 'var(--text-muted)' }}>{JSON.stringify(item.metric)}</pre>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', marginTop: '6px' }}>Evidence is calculated from the uploaded dataset.</p>
                        </details>
                      )) : (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          No dataset-supported business insights were found. Add relevant numeric, categorical, customer, region, or date fields to enable more analysis.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Neural Copilot chat */}
                  <div style={{ height: '460px' }}>
                    <DataChat datasetId={dataProfile.dataset_id} />
                  </div>

                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
