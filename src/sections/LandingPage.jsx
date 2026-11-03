import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Play, Check, Shield, TrendingUp, Star, FileText } from 'lucide-react';
import QRCode from 'qrcode';
import UploadSection from '../components/UploadSection';
import LiveFlowVisual from '../components/LiveFlowVisual';
import { getPaymentConfig, getPaymentStatus, submitPayment, downloadPaymentReceipt } from '../services/api';

const TRUST_BADGES = [
  'Apple Vision Inspired',
  'Predictive Risk Engine',
  'Real-Time Ingestion Ticker',
  'SOC-2 Compliant Vault'
];

const FEATURES = [
  { title: 'CSV Analytics', desc: 'Ingest and parse comma-separated text files instantly.' },
  { title: 'Excel Analytics', desc: 'Direct mapping of multi-sheet spreadsheet worksheets.' },
  { title: 'SQL Analytics', desc: 'Write direct neural-optimized queries to relational databases.' },
  { title: 'MongoDB Analytics', desc: 'Aggregate, map, and flatten BSON NoSQL documents.' },
  { title: 'API Analytics', desc: 'Direct REST/GraphQL endpoints sync and payload mapping.' },
  { title: 'AI Insights', desc: 'Auto-detect patterns and generate intelligent boardroom summaries.' },
  { title: 'Data Cleaning', desc: 'Isolation forest anomaly quarantine and datetime UTC normalisation.' },
  { title: 'Dashboard Builder', desc: 'Drag-and-drop workspace layout with custom visual panels.' },
  { title: 'Predictive Analytics', desc: 'Prophet regression models, demand forecasts, and risk scores.' },
  { title: 'Report Generation', desc: 'Compile multi-format courtroom summaries and executive stories.' },
  { title: 'Auto Visualization', desc: 'Intelligent rendering picks the ideal charts for your dimensions.' },
  { title: 'Real-Time Analytics', desc: 'Live WebSocket pipeline streaming at up to 50K events/sec.' },
  { title: 'Business Intelligence', desc: 'Fuse multiple sources into unified relational workspaces.' },
  { title: 'Data Storytelling', desc: 'Let AI write textual narrative stories detailing weekly trends.' },
  { title: 'AI Recommendations', desc: 'Autonomous actions for inventory, CAC reduction, or campaigns.' }
];

const WORKFLOW_STEPS = [
  { step: '01', title: 'Upload Data', desc: 'Drop local files or hook API/database credentials to ingest.' },
  { step: '02', title: 'Data Profiling & Clean', desc: 'Isolation forest isolates anomalies while DeepClean maps schema datatypes.' },
  { step: '03', title: 'Trend Analysis', desc: 'Real-time correlation sweeps, regression checks, and pattern indicators.' },
  { step: '04', title: 'Executive Insights', desc: 'Boardroom reports, predictive confidence dials, and AI narrative stories.' }
];

const TESTIMONIALS = [
  { name: 'Sarah Jenkins', role: 'Head of Analytics at CapitalCorp', text: 'DataLensAI transformed our trading data onboarding. What used to take our analysts two days now takes seconds. The predictive modeling is highly accurate.', logo: 'CLOUD' },
  { name: 'David Chen', role: 'VP of Data at Quantbox', text: 'The fusion of vision-style data feeds with autonomous AI summarization is unmatched. Our managers ask natural questions and get instant charts.', logo: 'BOX' },
  { name: 'Elena Rostova', role: 'Chief Architect at CyberPartners', text: 'This platform fits perfectly alongside Snowflake and Databricks. The absolute premium liquid glass UI feels like a true future operating system.', logo: 'SNOW' }
];

const PRICING_PLANS = [
  { name: 'Free Ticker', price: '$0', desc: 'Basic data parsing and insights.', features: ['1 connected database', '10,000 rows limit', 'Basic Core charts', 'Standard chat support'] },
  { name: 'Pro Terminal', price: '$49', desc: 'Advanced analytics for professionals.', features: ['5 connected databases', '500,000 rows limit', 'All 30 advanced charts', 'AI Predictive forecaster', 'NLI Chat Assistant'] },
  { name: 'Business Vault', price: '$199', desc: 'Team collaboration and pipelines.', features: ['Unlimited connected databases', '10M rows limit', 'Real-time ingestion pipelines', 'Auto-healing data cleaning', 'Custom report generator'] },
  { name: 'Enterprise Core', price: 'Custom', desc: 'Decentralized cloud environments.', features: ['Unlimited data throughput', 'Dedicated cluster warehouse', 'SOC-2 Compliance vault', '24/7 dedicated engineering support'] }
];

export default function LandingPage({ onEnterDemo, onStartIngest, onUploadComplete, onUploadStart, onAdminReview }) {
  const [paymentPlan, setPaymentPlan] = useState(null);
  const [paymentState, setPaymentState] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [merchantUpiId, setMerchantUpiId] = useState('');
  const [paymentQr, setPaymentQr] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  useEffect(() => {
    if (!paymentPlan) return;
    setPaymentState(null);
    setPaymentError('');
    setPaymentReference('');
    setReceiptNumber('');
    setPaymentQr('');
    getPaymentConfig()
      .then(({ merchant_upi_id: upiId }) => {
        if (!upiId || paymentPlan.price === 'Custom') {
        setPaymentQr('/upi-qr.jpg');
        setPaymentError('Merchant UPI configuration is required for an amount-prefilled QR.');
        return;
      }
        const amount = paymentPlan.price.replace(/[^0-9.]/g, '');
        const intent = new URLSearchParams({
          pa: upiId,
          pn: 'DataLensAI',
          am: amount,
          cu: 'INR',
          tn: `${paymentPlan.name} subscription`
        });
        setMerchantUpiId(upiId);
        QRCode.toDataURL(`upi://pay?${intent.toString()}`, { width: 480, margin: 1 })
          .then(setPaymentQr)
          .catch(() => setPaymentError('Unable to generate the payment QR code.'));
      })
      .catch((error) => setPaymentError(error.message));
  }, [paymentPlan]);

  useEffect(() => {
    if (!paymentReference || paymentState !== 'submitted') return undefined;
    let active = true;
    const checkStatus = async () => {
      try {
        const result = await getPaymentStatus(paymentReference);
        if (!active) return;
        if (result.status === 'PAID') {
          setReceiptNumber(result.receipt_number);
          setPaymentState('verified');
        } else if (result.status === 'REJECTED') {
          setPaymentState('rejected');
          setPaymentError('Payment verification failed. No receipt or acknowledgement was generated.');
        }
      } catch (error) {
        if (active) setPaymentError(error.message);
      }
    };
    checkStatus();
    const timer = window.setInterval(checkStatus, 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [paymentReference, paymentState]);

  const handlePaymentSubmit = async () => {
    setPaymentError('');
    setPaymentState('submitting');
    const formData = new FormData();
    formData.append('plan_name', paymentPlan.name);
    formData.append('amount', paymentPlan.price);
    formData.append('billing_duration', 'Monthly');
    try {
      const result = await submitPayment(formData);
      setPaymentReference(result.reference);
      setPaymentState('submitted');
    } catch (error) {
      setPaymentError(error.message);
      setPaymentState(null);
    }
  };
  const handleReceiptDownload = async () => {
    const blob = await downloadPaymentReceipt(paymentReference);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${receiptNumber}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div style={{ width: '100%' }}>
      
      {/* Header */}
      <header 
        className="glass-card" 
        style={{ 
          position: 'fixed', 
          top: '20px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: '90%', 
          maxWidth: '1200px', 
          padding: '14px 28px', 
          zIndex: 100, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderRadius: '16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glow)',
          boxShadow: '0 8px 32px 0 rgba(15, 23, 42, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', background: 'var(--neon-cyan)', boxShadow: '0 0 8px var(--neon-cyan-glow)', borderRadius: '50%' }} />
          <h1 style={{ fontSize: '1.05rem', fontWeight: 'bold', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>DATALENSAI</h1>
        </div>

        <nav style={{ display: 'flex', gap: '24px', fontSize: '0.82rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="nav-menu">
          <a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}>Workflow</a>
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}>Capabilities</a>
          <a href="#pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}>Terminals</a>
        </nav>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button type="button" className="btn-secondary" onClick={onAdminReview} style={{ padding: '9px 12px', fontSize: '0.72rem' }}>Admin Review</button>
          <button onClick={onEnterDemo} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.8rem', borderRadius: '8px' }}>Access Terminal</button>
        </div>
      </header>

      {/* Hero */}
      <section 
        style={{ 
          minHeight: '100vh', 
          paddingTop: '150px', 
          paddingBottom: '60px',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="landing-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: '40px', textAlign: 'left', minHeight: '80vh' }}>
          
          {/* Left info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <div style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '6px 12px', borderRadius: '20px', background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
              <Sparkles size={12} style={{ marginRight: '6px' }} />
              <span>TITANIUM GLASS DATA INTELLIGENCE</span>
            </div>

            <h2 style={{ fontSize: '3rem', fontWeight: '900', lineHeight: '1.15', background: 'linear-gradient(135deg, #111827 30%, #1e40af 70%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Transform Raw Data Into Intelligent Insights
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '480px' }}>
              Upload CSV, Excel, JSON, SQL databases, MongoDB collections, APIs, and cloud datasets. Let AI automatically clean, analyze, visualize, summarize, and predict trends from your data within seconds.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={onStartIngest} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', borderRadius: '8px' }}>
                <span>Ingest Dataset</span>
                <ArrowRight size={14} />
              </button>
              <button onClick={onEnterDemo} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', borderRadius: '8px' }}>
                <Play size={12} fill="var(--primary)" stroke="none" />
                <span>Launch Demo Terminal</span>
              </button>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
              {TRUST_BADGES.map((badge, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <Check size={12} className="glow-cyan" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right visual floating mock */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            style={{ position: 'relative', height: '380px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              className="glass-card"
              style={{
                width: '95%',
                height: '320px',
                borderRadius: '16px',
                padding: '20px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glow)',
                boxShadow: '0 15px 35px rgba(15, 23, 42, 0.1), 0 0 20px rgba(91, 127, 255, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(17,24,39,0.08)', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon-red)' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon-gold)' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon-cyan)' }} />
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>DATALENSAI_MONITOR_SYS</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div className="glass-card" style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '8px', fontSize: '0.65rem', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>MOM REVENUE</span>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', marginTop: '2px', color: 'var(--neon-cyan)' }}>$348.2K</div>
                    </div>
                    <div className="glass-card" style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '8px', fontSize: '0.65rem', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>FORECAST ACC.</span>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', marginTop: '2px', color: 'var(--neon-cyan)' }}>98.42%</div>
                    </div>
                  </div>
                  <div className="glass-card" style={{ flex: 1, padding: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '8px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Predictive Revenue Wave</span>
                    <svg viewBox="0 0 200 60" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <path d="M 0 45 Q 40 35 80 15 T 160 25 T 200 5" fill="none" stroke="var(--neon-cyan)" strokeWidth="2.5" />
                      <path d="M 0 45 Q 40 35 80 15 T 160 25 T 200 5 L 200 60 L 0 60 Z" fill="rgba(91, 127, 255, 0.05)" />
                    </svg>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="glass-card" style={{ flex: 1, padding: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                    <svg viewBox="0 0 40 40" style={{ width: '40px', height: '40px' }}>
                      <circle cx="20" cy="20" r="14" fill="none" stroke="rgba(17,24,39,0.05)" strokeWidth="4" />
                      <circle cx="20" cy="20" r="14" fill="none" stroke="var(--neon-gold)" strokeWidth="4" strokeDasharray="50 100" />
                    </svg>
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', marginTop: '4px' }}>DB load</span>
                  </div>
                  <div className="glass-card" style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '8px', fontSize: '0.55rem', display: 'flex', flexDirection: 'column', gap: '2px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                    <div><span style={{ color: 'var(--neon-cyan)' }}>●</span> AutoClean active</div>
                    <div><span style={{ color: 'var(--neon-cyan)' }}>●</span> S3 pipelines sync</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Smaller secondary floating cards */}
            <motion.div
              animate={{ y: [3, -3, 3] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="glass-card"
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '-10px',
                width: '200px',
                padding: '12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--neon-gold)',
                boxShadow: '0 8px 24px rgba(255, 184, 107, 0.2)',
                borderRadius: '12px',
                zIndex: 10
              }}
            >
              <div style={{ fontSize: '0.65rem', color: 'var(--neon-gold)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>AI NARRATIVE REPORT</div>
              <p style={{ fontSize: '0.72rem', marginTop: '4px', lineHeight: '1.3' }}>Revenue forecast increased 18.7% QoQ due to system optimization.</p>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* Upload */}
      <section style={{ padding: '60px 0', background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid var(--border-glow)', borderBottom: '1px solid var(--border-glow)' }}>
        <div className="landing-container">
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--neon-gold)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
              Data Ingestion Channel
            </span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Ingest Your Dataset</h3>
          </div>
          <UploadSection onUploadComplete={onUploadComplete} onUploadStart={onUploadStart} />
        </div>
      </section>

      {/* Workflow */}
      <section id="how-it-works" style={{ padding: '80px 0' }}>
        <div className="landing-container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
              Core Pipeline Workflow
            </span>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>How DataLensAI Operates</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {WORKFLOW_STEPS.map((step, idx) => (
              <motion.div
                key={idx}
                className="glass-card"
                style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--neon-cyan)', opacity: 0.35 }}>
                  {step.step}
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--neon-gold)' }}>{step.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.4' }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {paymentPlan && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setPaymentPlan(null)}
        >
          <div className="glass-card" style={{ maxWidth: '420px', width: '100%', padding: '24px', textAlign: 'center' }} onClick={(event) => event.stopPropagation()}>
            <h3 style={{ marginBottom: '8px' }}>Pay for {paymentPlan.name}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Amount: <strong>{paymentPlan.price}</strong> per month</p>
            {paymentQr ? (
              <img src={paymentQr} alt={`UPI payment QR code for ${paymentPlan.name}`} style={{ width: '240px', height: '240px', objectFit: 'cover', borderRadius: '12px', background: '#fff', padding: '8px' }} />
            ) : (
              <div style={{ width: '240px', height: '240px', margin: '0 auto', display: 'grid', placeItems: 'center', borderRadius: '12px', background: '#fff', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '20px' }}>
                {paymentError || 'Loading payment QR…'}
              </div>
            )}
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '12px' }}>
              Scan with Google Pay, PhonePe, Paytm, or another UPI app. The selected plan amount is prefilled.
              Payment remains <strong>pending</strong> until it is verified by the merchant.
            </p>
            {merchantUpiId && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Merchant UPI: {merchantUpiId}</p>}
            {paymentState === 'verified' ? (
              <div style={{ marginTop: '16px', textAlign: 'left' }}>
                <p style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>Payment verified successfully. Your acknowledgement is ready.</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '8px 0' }}>Receipt number: {receiptNumber}</p>
                <button type="button" className="btn-primary" onClick={handleReceiptDownload}>Download acknowledgement</button>
              </div>
            ) : paymentState === 'rejected' ? (
              <div style={{ marginTop: '16px', textAlign: 'left' }}>
                <p style={{ color: 'var(--neon-red)', fontWeight: 'bold' }}>{paymentError}</p>
              </div>
            ) : paymentState === 'submitted' ? (
              <div style={{ marginTop: '16px', textAlign: 'left' }}>
                <p style={{ color: 'var(--neon-gold)', fontWeight: 'bold' }}>Payment submitted. Verification is pending.</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '8px 0' }}>Submission reference: {paymentReference}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '8px', textAlign: 'left', marginTop: '12px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>After completing payment in your UPI app, return here and submit this payment acknowledgement.</p>
                {paymentError && <p style={{ color: 'var(--neon-red)', fontSize: '0.78rem' }}>{paymentError}</p>}
                <button type="button" className="btn-primary" disabled={paymentState === 'submitting'} onClick={handlePaymentSubmit}>{paymentState === 'submitting' ? 'Submitting…' : 'I Have Completed Payment'}</button>
              </div>
            )}
            <button type="button" className="btn-secondary" onClick={() => setPaymentPlan(null)} style={{ marginTop: '10px' }}>Close</button>
          </div>
        </div>
      )}

      {/* Live Pipeline Flow */}
      <section style={{ padding: '60px 0' }}>
        <div className="landing-container">
          <LiveFlowVisual />
        </div>
      </section>

      {/* Capabilities list */}
      <section id="features" style={{ padding: '80px 0', background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid var(--border-glow)' }}>
        <div className="landing-container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--neon-gold)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
              Terminal Capabilities
            </span>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>DataLensAI Engine Features</h3>
          </div>

          <div className="grid-cols-3" style={{ gap: '16px' }}>
            {FEATURES.map((feat, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{ padding: '20px', borderRadius: '12px', borderLeft: '3px solid var(--neon-cyan)' }}
              >
                <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', color: 'var(--text-primary)' }}>{feat.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4' }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 0' }}>
        <div className="landing-container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
              Financial Audits
            </span>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Approved by Quants & Data Architects</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {TESTIMONIALS.map((t, idx) => (
              <div 
                key={idx} 
                className="glass-card" 
                style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div style={{ display: 'flex', gap: '2px', color: 'var(--neon-gold)' }}>
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill="var(--neon-gold)" stroke="none" />)}
                </div>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.82rem', lineHeight: '1.4', fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-glow)', paddingTop: '10px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Terminals */}
      <section id="pricing" style={{ padding: '80px 0', background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid var(--border-glow)' }}>
        <div className="landing-container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--neon-gold)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
              Terminal Licencing
            </span>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Simple Enterprise Subscriptions</h3>
          </div>

          <div className="grid-cols-4" style={{ gap: '16px', width: '100%' }}>
            {PRICING_PLANS.map((plan, idx) => (
              <div 
                key={idx} 
                className="glass-card" 
                style={{ 
                  padding: '28px 20px', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '14px',
                  background: plan.name.includes('Business') ? 'rgba(91, 127, 255, 0.08)' : 'var(--bg-card)',
                  borderColor: plan.name.includes('Business') ? 'var(--neon-cyan)' : 'var(--border-glow)'
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', color: plan.name.includes('Business') ? 'var(--neon-cyan)' : 'var(--text-secondary)' }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{plan.price}</span>
                  {plan.price !== 'Custom' && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>/mo</span>}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{plan.desc}</p>
                
                <button 
                  onClick={() => plan.price === '$0' ? onEnterDemo() : setPaymentPlan(plan)}
                  className={plan.name.includes('Business') ? 'btn-primary' : 'btn-secondary'}
                  style={{ width: '100%', padding: '10px', fontSize: '0.8rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Get License
                </button>

                <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', listStyle: 'none' }}>
                  {plan.features.map((feat, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={10} className="glow-cyan" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 0 30px 0', borderTop: '1px solid var(--border-glow)', background: 'transparent' }}>
        <div className="landing-container" style={{ display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr)', gap: '30px', width: '100%', textAlign: 'left', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '12px', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>DATALENSAI</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4', maxWidth: '240px' }}>
              Vision-inspired neural intelligence terminal mapping decentralized cloud data structures into boardroom insights and predictive models.
            </p>
          </div>
          {['Product', 'Terminals', 'Documentation', 'Resources'].map((colTitle, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-primary)' }}>{colTitle}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
                <a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Features</a>
                <a href="#pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Pricing</a>
                <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>API Terminals</a>
              </div>
            </div>
          ))}
        </div>

        <div className="landing-container" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-glow)', paddingTop: '16px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>© 2026 DataLensAI Inc. All rights reserved.</span>
          <span>SOC-2 Type II Vault // HIPAA Compliant // FIPS 140-2</span>
        </div>
      </footer>

    </div>
  );
}
