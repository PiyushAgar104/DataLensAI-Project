import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Cpu } from 'lucide-react';
import NeuralBackground from './components/NeuralBackground';
import MouseGlow from './components/MouseGlow';
import LandingPage from './sections/LandingPage';
import PowerBiDashboard from './dashboard/PowerBiDashboard';

export default function App() {
  const [view, setView] = useState('landing'); 
  const [dataProfile, setDataProfile] = useState({
    name: "enterprise_sales_analytics.csv",
    rows: 15480,
    qualityScore: 94,
    healthScore: 92,
    hasDates: true,
    hasCategories: true,
    hasGeographic: true,
    hasCustomers: true,
    hasSales: true,
    columns: [
      { name: "Order_Date", type: "Date", sample: "2026-06-01" },
      { name: "Product_Category", type: "Category", sample: "Electronics" },
      { name: "Region", type: "Geographic", sample: "North America" },
      { name: "Customer_ID", type: "Customer ID", sample: "CUST-9482" },
      { name: "Sales_Revenue", type: "Numerical (Currency)", sample: "$3,482" },
      { name: "Profit_Margin", type: "Numerical (Percentage)", sample: "23.4%" },
    ]
  });

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', backgroundColor: 'transparent' }}>
      
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
              onEnterDemo={() => {
                // Set default demo dataset
                setDataProfile({
                  name: "demo_sales_telemetry.csv",
                  rows: 24800,
                  qualityScore: 98,
                  healthScore: 96,
                  hasDates: true,
                  hasCategories: true,
                  hasGeographic: true,
                  hasCustomers: true,
                  hasSales: true,
                  columns: [
                    { name: "Order_Date", type: "Date", sample: "2026-06-01" },
                    { name: "Product_Category", type: "Category", sample: "Electronics" },
                    { name: "Region", type: "Geographic", sample: "North America" },
                    { name: "Customer_ID", type: "Customer ID", sample: "CUST-9482" },
                    { name: "Sales_Revenue", type: "Numerical (Currency)", sample: "$3,482" },
                    { name: "Profit_Margin", type: "Numerical (Percentage)", sample: "23.4%" },
                  ]
                });
                setView('dashboard');
              }} 
              onUploadComplete={(profile) => {
                if (profile) setDataProfile(profile);
                setView('dashboard');
              }}
              onStartIngest={() => {
                const uploadEl = document.querySelector('section:nth-of-type(2)');
                if (uploadEl) {
                  uploadEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
          </motion.div>
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
            </header>

            {/* Content Sheets */}
            <div style={{ flex: 1, minHeight: '60vh' }}>
              <PowerBiDashboard dataProfile={dataProfile} onReset={() => setView('landing')} />
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
