import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot } from 'lucide-react';
import { askDataset } from '../services/api';

const SUGGESTIONS = [
  "Why did sales drop?",
  "Show last month performance",
  "Compare regions",
  "Predict next quarter revenue",
  "Which category should I focus on?",
  "Find unusual transactions",
  "Generate business report"
];

export default function DataChat({ datasetId }) {
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

  useEffect(() => {
    setMessages([{
      id: `welcome-${datasetId}`,
      sender: 'bot',
      text: 'Dataset indexed. Ask about totals, averages, missing values, duplicates, or available fields.',
      chartType: null,
    }]);
    setInputValue('');
    setIsTyping(false);
  }, [datasetId]);

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
    const history = messages.filter((message) => message.id !== 'welcome' && message.sender).slice(-20).map(({ sender, text, evidence }) => ({ sender, text, evidence }));
    askDataset(datasetId, text, history)
      .then((response) => setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'bot', text: response.answer, evidence: response.evidence, chartType: null }]))
      .catch((error) => setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'bot', text: `Analysis unavailable: ${error.message}`, chartType: null }]))
      .finally(() => setIsTyping(false));
  };

  const renderMiniChart = (type) => {
    if (!type) return null;

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
              {msg.evidence?.length > 0 && (
                <div style={{ marginTop: '6px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  Evidence: {msg.evidence.slice(0, 4).map((item) => `${item.metric}=${typeof item.value === 'object' ? JSON.stringify(item.value) : item.value}`).join(' · ')}
                </div>
              )}
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
