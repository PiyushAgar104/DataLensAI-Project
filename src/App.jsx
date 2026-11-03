import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Cpu } from 'lucide-react';
import NeuralBackground from './components/NeuralBackground';
import MouseGlow from './components/MouseGlow';
import LandingPage from './sections/LandingPage';
import PowerBiDashboard from './dashboard/PowerBiDashboard';
import AdminPayments from './components/AdminPayments';

function normalizeProfile(profile) {
  const numericColumns = profile.columns.filter((column) => column.type === 'numeric');
  const categoricalColumns = profile.columns.filter((column) => column.type === 'categorical');
  const dateColumns = profile.columns.filter((column) => column.type === 'datetime');
  const categoryColumn = categoricalColumns.find((column) => /category|product|item|department/i.test(column.name)) || categoricalColumns[0];
  const categoriesDistribution = categoryColumn
    ? (profile.categorical_summaries[categoryColumn.name] || []).map((item, index) => ({
        column: categoryColumn.name,
        label: String(item.label),
        value: `${item.percentage}%`,
        pct: item.percentage,
        color: ['var(--neon-cyan)', 'var(--neon-violet)', 'var(--neon-gold)'][index % 3],
      }))
    : [];
  const totals = profile.numeric_summaries;
  const firstNumeric = numericColumns[0]?.name;
  const total = firstNumeric ? totals[firstNumeric]?.mean : null;
  const groupedInsights = Object.entries(profile.grouped_summaries || {}).flatMap(([column, metrics]) =>
    Object.entries(metrics).flatMap(([numericColumn, values]) => values.map((value) => ({
      column,
      numericColumn,
      ...value,
    })))
  );
  return {
    ...profile,
    hasDates: dateColumns.length > 0,
    hasCategories: categoricalColumns.length > 0,
    hasGeographic: profile.columns.some((column) => /region|country|city|state|zip/i.test(column.name)),
    hasCustomers: profile.columns.some((column) => /customer|user|client/i.test(column.name)),
    hasSales: numericColumns.length > 0,
    categoriesDistribution,
    groupedSummaries: profile.grouped_summaries,
    groupedInsights,
    insights: profile.insights || [],
    businessMetrics: profile.business_metrics || {},
    primaryCategoryColumn: categoryColumn?.name,
    primaryNumericColumn: firstNumeric,
    kpiData: {
      totalRevenue: firstNumeric && totals[firstNumeric]?.sum != null ? Number(totals[firstNumeric].sum).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'Unavailable',
      totalProfit: 'Unavailable',
      totalOrders: profile.rows.toLocaleString(),
      totalCustomers: profile.columns.find((column) => /customer|user|client/i.test(column.name))?.unique?.toLocaleString() || 'Unavailable',
      growthRate: 'Unavailable',
      avgOrderValue: total != null ? Number(total).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'Unavailable',
      conversionRate: 'Unavailable',
      forecastAccuracy: 'Unavailable',
    },
  };
}

export default function App() {
  const [view, setView] = useState('landing'); 
  const [dataProfile, setDataProfile] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('datalensai-theme') || 'current');
  const changeTheme = (nextTheme) => {
    setTheme(nextTheme);
    localStorage.setItem('datalensai-theme', nextTheme);
  };

  return (
    <div data-theme={theme} style={{ position: 'relative', minHeight: '100vh', width: '100%', backgroundColor: 'transparent' }}>
      
      {/* Background Systems */}
      <div className="animated-grid-bg" />
      <NeuralBackground />
      <MouseGlow />

      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage 
              onAdminReview={() => setView('admin')}
              onEnterDemo={() => {
                document.querySelector('section:nth-of-type(2)')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onUploadStart={() => {
                setDataProfile(null);
              }}
              onUploadComplete={(profile) => {
                if (profile?.dataset_id) {
                  setDataProfile(normalizeProfile(profile));
                  setView('dashboard');
                }
              }}
              onStartIngest={() => {
                const uploadEl = document.querySelector('section:nth-of-type(2)');
                if (uploadEl) {
                  uploadEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
          </motion.div>
        ) : view === 'admin' ? (
          <AdminPayments onBack={() => setView('landing')} />
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ padding: '20px', maxWidth: '1240px', margin: '0 auto', width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {/* Header */}
            <header 
              className="glass-card" 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '14px 20px', 
                borderRadius: '12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glow)',
                boxShadow: '0 8px 32px 0 rgba(15, 23, 42, 0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(91, 127, 255, 0.15)', color: 'var(--neon-cyan)' }}>
                  <Cpu size={18} className="glow-cyan" />
                </div>
                <div>
                  <h1 style={{ fontSize: '1rem', fontWeight: 'bold', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>DATALENSAI SMART AI HUB</h1>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Automated Power BI Dashboard Generator v3.0</span>
                </div>
              </div>

              <button 
                onClick={() => setView('landing')} 
                className="btn-secondary" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '8px 16px', 
                  fontSize: '0.78rem',
                  borderRadius: '6px'
                }}
              >
                <LogOut size={12} />
                <span>Exit Terminal</span>
              </button>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Theme
                <select className="glass-input" value={theme} onChange={(event) => changeTheme(event.target.value)} style={{ padding: '6px 8px', fontSize: '0.72rem' }}>
                  <option value="current">Current Theme</option>
                  <option value="classic-light">Classic Light</option>
                  <option value="dark-professional">Dark Professional</option>
                  <option value="minimal-white">Minimal White</option>
                  <option value="modern-blue">Modern Blue</option>
                </select>
                <button type="button" className="btn-secondary" onClick={() => changeTheme('current')} style={{ padding: '6px 8px', fontSize: '0.68rem' }}>Reset</button>
              </label>
            </header>

            {/* Content Sheets */}
            <div style={{ flex: 1, minHeight: '60vh' }}>
              {dataProfile ? (
                <PowerBiDashboard key={dataProfile.dataset_id} dataProfile={dataProfile} onReset={() => {
                  setDataProfile(null);
                  setView('landing');
                }} />
              ) : (
                <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                  Upload a dataset to initialize the analytics terminal.
                </div>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
