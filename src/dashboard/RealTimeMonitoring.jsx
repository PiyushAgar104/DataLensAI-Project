import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Cpu, Users, Shield, Activity } from 'lucide-react';

const LOG_TEMPLATES = [
  { text: 'Ingested 48 transactions in Snowflake Cluster', type: 'info' },
  { text: 'API POST /v1/analyze/anomaly -> 200 OK (14ms)', type: 'success' },
  { text: 'DeepClean schema alignment completed (0 nulls found)', type: 'success' },
  { text: 'Autopilot replica scale trigger: scaling database nodes', type: 'info' },
  { text: 'Anomaly isolation forest flag on transaction ID #9482', type: 'warning' },
  { text: 'Recalculating Prophet regression coefficients for Q1', type: 'info' },
  { text: 'AWS S3 sync finished: synced 1,248 files', type: 'success' },
  { text: 'Model drift tolerance alert: drift threshold at 0.02%', type: 'info' },
  { text: 'Connected PostgreSQL master database replication active', type: 'info' },
];

export default function RealTimeMonitoring() {
  const [logs, setLogs] = useState([]);
  const [cpuLoad, setCpuLoad] = useState(42);
  const [activeUsers, setActiveUsers] = useState(128);
  const [ingestionRate, setIngestionRate] = useState(12480);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    const initialLogs = Array.from({ length: 15 }, (_, i) => {
      const template = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
      return {
        id: `init-${i}`,
        timestamp: new Date(Date.now() - (15 - i) * 3000).toLocaleTimeString().split(' ')[0],
        text: template.text,
        type: template.type
      };
    });
    setLogs(initialLogs);
  }, []);

  useEffect(() => {
    const logInterval = setInterval(() => {
      const template = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
      const nextLog = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString().split(' ')[0],
        text: template.text,
        type: template.type
      };
      
      setLogs(prev => {
        const next = [...prev, nextLog];
        if (next.length > 20) next.shift(); 
        return next;
      });

      setCpuLoad(prev => {
        const diff = Math.floor(Math.random() * 5) - 2;
        return Math.max(10, Math.min(95, prev + diff));
      });
      setActiveUsers(prev => {
        const diff = Math.floor(Math.random() * 3) - 1;
        return Math.max(50, Math.min(500, prev + diff));
      });
      setIngestionRate(prev => {
        const diff = Math.floor(Math.random() * 200) - 100;
        return Math.max(8000, Math.min(25000, prev + diff));
      });
    }, 2000);

    return () => clearInterval(logInterval);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(91,127,255,0.12)', paddingBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
            OVERWATCH // INGESTION TELEMETRY
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Real-Time Ingestion Logs</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="status-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--neon-emerald)', display: 'inline-block', animation: 'pulse-ring 2s infinite' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--neon-emerald)', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>LIVE CONNECTION ACTIVE</span>
        </div>
      </div>

      {/* Telemetry row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(91, 127, 255, 0.08)', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', color: 'var(--neon-cyan)', marginBottom: '3px' }}>
            <Cpu size={12} />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>CPU Load</span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{cpuLoad}%</div>
        </div>

        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(91, 127, 255, 0.08)', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', color: 'var(--neon-gold)', marginBottom: '3px' }}>
            <Activity size={12} />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Throughput</span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{ingestionRate.toLocaleString()} <span style={{ fontSize: '0.65rem' }}>e/s</span></div>
        </div>

        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(91, 127, 255, 0.08)', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', color: 'var(--neon-cyan)', marginBottom: '3px' }}>
            <Users size={12} />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Sessions</span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{activeUsers}</div>
        </div>

        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(91, 127, 255, 0.08)', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', color: 'var(--neon-emerald)', marginBottom: '3px' }}>
            <Shield size={12} />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Integrity</span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'var(--neon-emerald)' }}>99.98%</div>
        </div>

      </div>

      {/* Terminal log panel */}
      <div 
        style={{ 
          flex: 1, 
          background: 'rgba(255, 255, 255, 0.5)', 
          border: '1px solid rgba(91, 127, 255, 0.12)',
          borderRadius: '8px',
          padding: '12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '160px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(91, 127, 255, 0.08)', paddingBottom: '8px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
          <Terminal size={12} />
          <span>Core Telemetry Ticker logs</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px' }}>
          {logs.map((log) => {
            let color = 'var(--text-secondary)';
            if (log.type === 'success') color = '#047857';
            else if (log.type === 'warning') color = '#dc2626';
            
            return (
              <div key={log.id} style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>[{log.timestamp}]</span>
                <span style={{ color, fontWeight: log.type === 'success' || log.type === 'warning' ? 'bold' : 'normal' }}>{log.text}</span>
              </div>
            );
          })}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
}
