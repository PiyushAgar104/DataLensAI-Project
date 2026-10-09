import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot } from 'lucide-react';

const SUGGESTIONS = [
  "Why did sales drop?",
  "Show last month performance",
  "Compare regions",
  "Predict next quarter revenue",
  "Which category should I focus on?",
  "Find unusual transactions",
  "Generate business report"
];

export default function DataChat() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "DataLensAI Terminal operational. Indexed connected data. You can query region performance, sales drops, transaction outliers, or generate boardroom reports. What query should I run?",
      chartType: null
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const feedEndRef = useRef(null);

  const scrollToBottom = () => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text }]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '',
        chartType: null
      };

      const query = text.toLowerCase();
      if (query.includes('drop') || query.includes('why did sales')) {
        botResponse.text = "Analysis complete: Q3 sales declined by 8.4% due to severe APAC region supply chain backlogs (down 24.8%). Other segments remained stable.";
        botResponse.chartType = 'waterfall-drop';
      } else if (query.includes('last month') || query.includes('performance')) {
        botResponse.text = "Last month overview: Revenue generated was $348,200, showing +18.7% MoM growth. Active customer count increased by 12.1%. Forecast confidence is high.";
        botResponse.chartType = 'mom-grid';
      } else if (query.includes('regions') || query.includes('compare')) {
        botResponse.text = "Regional comparisons: North America remains the highest-performing region in total volume. APAC shows fast growth but is bottlenecked by current supply chain lag.";
        botResponse.chartType = 'regions-compare';
      } else if (query.includes('predict') || query.includes('revenue') || query.includes('next quarter')) {
        botResponse.text = "Prophet prediction: Next quarter sales are modeled at $172,400 with a 95% confidence interval. High-growth categories (SaaS + Electronics) are driving this trend.";
        botResponse.chartType = 'revenue-predict';
      } else if (query.includes('category') || query.includes('focus')) {
        botResponse.text = "Targeting recommendation: Focus capital on the Electronics and Software Licences categories. Electronics is the highest-performing category representing 42% contribution.";
        botResponse.chartType = 'category-focus';
      } else if (query.includes('unusual') || query.includes('transactions') || query.includes('outlier')) {
        botResponse.text = "Quarantine scans completed: Detected 3 transaction anomalies in historical logs. Recommending audit checks on high-value items matching atypical IP routing.";
        botResponse.chartType = 'outlier-scatter';
      } else if (query.includes('report') || query.includes('generate')) {
        botResponse.text = "Report generated successfully: Boardroom report details that overall revenue increased by 18.7% compared to last month. North region generated the largest growth. Customer acquisition rate remains high (+12%).";
        botResponse.chartType = 'boardroom-report';
      } else {
        botResponse.text = "Query indexed. Mapped coordinates show consistent growth across all core infrastructure pipelines. Recommend checking out the Visual Ticker Matrix tab.";
        botResponse.chartType = 'generic';
      }

      setIsTyping(false);
      setMessages(prev => [...prev, botResponse]);
    }, 1200);
  };

  const renderMiniChart = (type) => {
    if (!type) return null;

    if (type === 'waterfall-drop') {
      return (
        <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255, 255, 255, 0.4)', border: '1px solid rgba(91,127,255,0.08)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 'bold' }}>Q3 Revenue Drop Bridge</div>
          <svg viewBox="0 0 200 60" style={{ width: '100%', height: '40px' }}>
            <rect x="10" y="15" width="20" height="40" fill="var(--neon-cyan)" rx="2" />
            <rect x="45" y="15" width="20" height="15" fill="var(--neon-red)" rx="2" />
            <rect x="80" y="30" width="20" height="20" fill="var(--neon-red)" rx="2" />
            <rect x="115" y="50" width="20" height="5" fill="var(--neon-emerald)" rx="2" />
            <rect x="150" y="50" width="20" height="10" fill="var(--neon-gold)" rx="2" />
          </svg>
        </div>
      );
    }

    if (type === 'mom-grid') {
      return (
        <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255, 255, 255, 0.4)', border: '1px solid rgba(91,127,255,0.08)', borderRadius: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Revenue</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#047857', fontFamily: 'var(--font-mono)' }}>$348.2K (+18.7%)</div>
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Acquisition</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#047857', fontFamily: 'var(--font-mono)' }}>12.1%</div>
          </div>
        </div>
      );
    }

    if (type === 'regions-compare') {
      return (
        <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255, 255, 255, 0.4)', border: '1px solid rgba(91,127,255,0.08)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[{ n: 'NA', v: '85%' }, { n: 'EU', v: '60%' }, { n: 'APAC', v: '24%' }].map(r => (
              <div key={r.n} style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '30px', fontWeight: 'bold' }}>{r.n}</span>
                <div style={{ flex: 1, height: '6px', background: 'rgba(91,127,255,0.05)', borderRadius: '3px' }}>
                  <div style={{ height: '100%', width: r.v, background: 'var(--neon-cyan)', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (type === 'revenue-predict') {
      return (
        <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255, 255, 255, 0.4)', border: '1px solid rgba(91,127,255,0.08)', borderRadius: '8px' }}>
          <svg viewBox="0 0 200 50" style={{ width: '100%', height: '35px', overflow: 'visible' }}>
            <path d="M 10 40 L 90 30 L 190 15" fill="none" stroke="var(--neon-cyan)" strokeWidth="2" />
            <path d="M 90 30 L 190 5 L 190 25 Z" fill="rgba(255,184,107,0.1)" />
            <path d="M 90 30 L 190 15" fill="none" stroke="var(--neon-gold)" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>
        </div>
      );
    }

    if (type === 'category-focus') {
      return (
        <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255, 255, 255, 0.4)', border: '1px solid rgba(91,127,255,0.08)', borderRadius: '8px' }}>
          {[{ n: 'Electronics', v: '42%' }, { n: 'Software', v: '34%' }].map(c => (
            <div key={c.n} style={{ fontSize: '0.7rem', marginBottom: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontWeight: 'bold' }}>{c.n}</span>
                <span style={{ color: 'var(--neon-gold)', fontWeight: 'bold' }}>{c.v}</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(91,127,255,0.05)', borderRadius: '2px' }}>
                <div style={{ height: '100%', width: c.v, background: 'var(--neon-cyan)', borderRadius: '2px' }} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (type === 'outlier-scatter') {
      return (
        <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255, 255, 255, 0.4)', border: '1px solid rgba(91,127,255,0.08)', borderRadius: '8px' }}>
          <svg viewBox="0 0 200 60" style={{ width: '100%', height: '40px' }}>
            <circle cx="30" cy="40" r="2.5" fill="var(--neon-cyan)" />
            <circle cx="70" cy="38" r="2.5" fill="var(--neon-cyan)" />
            <circle cx="110" cy="45" r="2.5" fill="var(--neon-cyan)" />
            <circle cx="150" cy="15" r="4" fill="var(--neon-red)" />
            <circle cx="170" cy="12" r="4" fill="var(--neon-red)" />
          </svg>
        </div>
      );
    }

    if (type === 'boardroom-report') {
      return (
        <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(91,127,255,0.04)', border: '1px solid rgba(91,127,255,0.2)', borderRadius: '6px', fontSize: '0.72rem', color: '#1d4ed8', fontWeight: 'bold' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>BOARDROOM STATUS REPORT</div>
          <span style={{ color: 'var(--text-secondary)' }}>Revenue: +18.7% QoQ | CAC: -4.8% | Retention: 98.42%</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(91, 127, 255, 0.12)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ color: 'var(--neon-cyan)' }}>
          <Sparkles size={16} className="glow-cyan" />
        </div>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>Natural Language Copilot</h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Terminal Agent v2.4</span>
        </div>
      </div>

      {/* Chat Feed */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '260px', maxHeight: '380px' }}>
        {messages.map((msg) => (
          <div 
            key={msg.id}
            style={{ 
              display: 'flex', 
              gap: '10px', 
              alignItems: 'flex-start',
              maxWidth: '85%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
            }}
          >
            <div 
              style={{ 
                width: '28px', 
                height: '28px', 
                borderRadius: '6px', 
                background: msg.sender === 'user' ? 'rgba(91, 127, 255, 0.15)' : 'rgba(123, 97, 255, 0.15)',
                color: msg.sender === 'user' ? 'var(--neon-cyan)' : 'var(--neon-violet)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{msg.sender === 'user' ? 'U' : 'AI'}</span>
            </div>

            <div 
              style={{
                background: msg.sender === 'user' ? 'rgba(91, 127, 255, 0.05)' : 'rgba(255, 255, 255, 0.4)',
                border: msg.sender === 'user' ? '1px solid rgba(91, 127, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.82rem',
                lineHeight: '1.4',
                color: 'var(--text-primary)'
              }}
            >
              <div>{msg.text}</div>
              {renderMiniChart(msg.chartType)}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', alignSelf: 'flex-start' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(123, 97, 255, 0.15)', color: 'var(--neon-violet)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>AI</span>
            </div>
            <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '8px', display: 'flex', gap: '3px', alignItems: 'center' }}>
              <div style={{ width: '5px', height: '5px', background: 'var(--neon-cyan)', borderRadius: '50%', animation: 'bounce 1.2s infinite 0.1s' }} />
              <div style={{ width: '5px', height: '5px', background: 'var(--neon-cyan)', borderRadius: '50%', animation: 'bounce 1.2s infinite 0.2s' }} />
              <div style={{ width: '5px', height: '5px', background: 'var(--neon-cyan)', borderRadius: '50%', animation: 'bounce 1.2s infinite 0.3s' }} />
            </div>
          </div>
        )}
        <div ref={feedEndRef} />
      </div>

      {/* Suggestions */}
      <div style={{ display: 'flex', gap: '6px', padding: '8px 16px', overflowX: 'auto', borderTop: '1px solid rgba(91, 127, 255, 0.08)', whiteSpace: 'nowrap' }}>
        {SUGGESTIONS.map((sug) => (
          <button 
            key={sug}
            onClick={() => handleSend(sug)}
            style={{ 
              padding: '4px 10px', 
              borderRadius: '20px', 
              background: 'rgba(255,255,255,0.4)', 
              border: '1px solid rgba(255,255,255,0.8)',
              color: 'var(--text-secondary)',
              fontSize: '0.72rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--neon-cyan)'; e.currentTarget.style.color = 'var(--neon-cyan)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        style={{ padding: '12px 16px', borderTop: '1px solid rgba(91, 127, 255, 0.12)', background: 'rgba(255, 255, 255, 0.5)', display: 'flex', gap: '8px', alignItems: 'center' }}
      >
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask DataLensAI Copilot e.g. 'Why did sales drop?'..." 
          className="glass-input"
          style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem' }}
        />
        <button 
          type="submit" 
          className="btn-primary" 
          style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '6px' }}
        >
          <Send size={12} />
          <span style={{ fontSize: '0.8rem' }}>Query</span>
        </button>
      </form>
    </div>
  );
}
