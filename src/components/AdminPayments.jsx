import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, LogOut, RefreshCw, X } from 'lucide-react';
import { adminLogin, adminLogout, getAdminPayments, getAdminSession, getPaymentScreenshot, reviewAdminPayment } from '../services/api';

const statuses = ['ALL', 'PENDING', 'PAID', 'REJECTED'];

export default function AdminPayments({ onBack }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState('ALL');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState('');

  const loadPayments = async () => {
    setLoading(true);
    setError('');
    try {
      setPayments(await getAdminPayments(status === 'ALL' ? '' : status));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdminSession().then((result) => {
      setAuthenticated(result.authenticated);
      if (result.authenticated) loadPayments();
    }).catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    if (authenticated) loadPayments();
  }, [status, authenticated]);

  const login = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await adminLogin(password);
      setPassword('');
      setAuthenticated(true);
    } catch (loginError) {
      setError(loginError.message);
    }
  };

  const review = async (reference, decision) => {
    if (!window.confirm(`Confirm ${decision} for ${reference}?`)) return;
    try {
      await reviewAdminPayment(reference, decision);
      await loadPayments();
    } catch (reviewError) {
      setError(reviewError.message);
    }
  };

  const showScreenshot = async (reference) => {
    try {
      const blob = await getPaymentScreenshot(reference);
      setScreenshotUrl(URL.createObjectURL(blob));
    } catch (screenshotError) {
      setError(screenshotError.message);
    }
  };

  if (!authenticated) {
    return (
      <main className="glass-card" style={{ maxWidth: '460px', margin: '40px auto', padding: '28px' }}>
        <button type="button" className="btn-secondary" onClick={onBack} style={{ marginBottom: '18px' }}><ArrowLeft size={14} /> Back</button>
        <h2>Admin payment review</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '8px 0 18px' }}>Sign in to review payment submissions. Credentials remain server-side.</p>
        <form onSubmit={login} style={{ display: 'grid', gap: '10px' }}>
          <input className="glass-input" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Admin password" />
          {error && <p style={{ color: 'var(--neon-red)', fontSize: '0.8rem' }}>{error}</p>}
          <button className="btn-primary" type="submit">Sign in</button>
        </form>
      </main>
    );
  }

  return (
    <main className="glass-card" style={{ maxWidth: '1180px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <button type="button" className="btn-secondary" onClick={onBack}><ArrowLeft size={14} /> Back</button>
          <h2 style={{ marginTop: '14px' }}>Payment review</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn-secondary" onClick={loadPayments}><RefreshCw size={14} /> Refresh</button>
          <button type="button" className="btn-secondary" onClick={async () => { await adminLogout(); setAuthenticated(false); }}><LogOut size={14} /> Sign out</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', margin: '18px 0', flexWrap: 'wrap' }}>
        {statuses.map((item) => <button key={item} type="button" className={status === item ? 'btn-primary' : 'btn-secondary'} onClick={() => setStatus(item)}>{item}</button>)}
      </div>
      {error && <p style={{ color: 'var(--neon-red)', marginBottom: '12px' }}>{error}</p>}
      {loading ? <p>Loading payment records…</p> : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {payments.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No payment records found.</p>}
          {payments.map((payment) => (
            <article key={payment.reference} className="glass-card" style={{ padding: '14px', display: 'grid', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                <strong>{payment.reference}</strong>
                <span style={{ color: payment.status === 'PAID' ? 'var(--neon-emerald)' : payment.status === 'REJECTED' ? 'var(--neon-red)' : 'var(--neon-gold)' }}>{payment.status}</span>
              </div>
              <span>{payment.customer_name} · {payment.customer_email}</span>
              <span>{payment.plan_name} · {payment.amount} · {payment.billing_duration}</span>
              <span style={{ color: 'var(--text-secondary)' }}>UPI reference: {payment.transaction_reference}</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                {payment.has_screenshot && <button type="button" className="btn-secondary" onClick={() => showScreenshot(payment.reference)}>View screenshot</button>}
                {payment.status === 'PENDING' && <>
                  <button type="button" className="btn-primary" onClick={() => review(payment.reference, 'approve')}><Check size={14} /> Approve</button>
                  <button type="button" className="btn-secondary" onClick={() => review(payment.reference, 'reject')}><X size={14} /> Reject</button>
                </>}
              </div>
            </article>
          ))}
        </div>
      )}
      {screenshotUrl && <div role="dialog" aria-modal="true" onClick={() => { URL.revokeObjectURL(screenshotUrl); setScreenshotUrl(''); }} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,.7)', display: 'grid', placeItems: 'center', padding: '20px' }}><img src={screenshotUrl} alt="Payment screenshot" style={{ maxWidth: '90vw', maxHeight: '90vh', background: '#fff', padding: '8px' }} /></div>}
    </main>
  );
}
