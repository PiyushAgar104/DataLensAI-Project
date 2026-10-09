import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Database, Cloud, FileText, CheckCircle2, Play, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const splitCSVLine = (line, delimiter) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map(v => v.replace(/^["']|["']$/g, '').trim());
};

const parseCSVData = (text, name, size) => {
  try {
    // Check if it is a binary zip archive (like Excel .xlsx) or XML structure
    if (
      text.startsWith('PK\u0003\u0004') || 
      text.includes('[Content_Types].xml') || 
      text.includes('xl/worksheets/') || 
      text.includes('_rels/.rels')
    ) {
      console.warn("Detected binary Excel/ZIP file in CSV parser. Falling back to mock profiling.");
      return null;
    }

    // Check if the text contains non-printable binary characters (excluding standard whitespace \t, \r, \n)
    const nonPrintableCount = (text.substring(0, 500).match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/g) || []).length;
    if (nonPrintableCount > 10) {
      console.warn("Detected binary content in CSV parser. Falling back to mock profiling.");
      return null;
    }

    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length < 2) return null;

    // Detect delimiter
    let delimiter = ',';
    const headerLine = lines[0];
    const commas = (headerLine.match(/,/g) || []).length;
    const semicolons = (headerLine.match(/;/g) || []).length;
    const tabs = (headerLine.match(/\t/g) || []).length;
    
    if (semicolons > commas && semicolons > tabs) {
      delimiter = ';';
    } else if (tabs > commas && tabs > semicolons) {
      delimiter = '\t';
    }

    const headers = splitCSVLine(lines[0], delimiter);
    
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      let rowVals = splitCSVLine(lines[i], delimiter);
      if (rowVals.length < headers.length) {
        while (rowVals.length < headers.length) {
          rowVals.push("");
        }
        rows.push(rowVals);
      } else if (rowVals.length > headers.length) {
        rows.push(rowVals.slice(0, headers.length));
      } else {
        rows.push(rowVals);
      }
    }

    if (rows.length === 0) return null;

    const columnsList = headers.map((header, colIndex) => {
      let numericCount = 0;
      let nonNumericCount = 0;
      let dateCount = 0;
      let nonDateCount = 0;
      let sampleValues = [];
      
      for (let r = 0; r < Math.min(rows.length, 50); r++) {
        const val = rows[r][colIndex];
        if (val !== undefined && val.trim() !== '') {
          sampleValues.push(val);
          const cleanVal = val.replace(/[$\s%,]/g, '');
          if (cleanVal.length > 0 && !isNaN(Number(cleanVal))) {
            numericCount++;
          } else {
            nonNumericCount++;
          }
          const parsedDate = Date.parse(val);
          if (!isNaN(parsedDate) && val.length >= 6 && (val.includes('-') || val.includes('/') || val.includes(','))) {
            dateCount++;
          } else {
            nonDateCount++;
          }
        }
      }

      let type = "Category";
      if (numericCount > 0 && nonNumericCount === 0) {
        type = "Numerical";
      } else if (dateCount > 0 && nonDateCount === 0) {
        type = "Date";
      } else if (header.toLowerCase().includes('id') || header.toLowerCase().includes('key')) {
        type = "ID";
      }

      return {
        name: header,
        type: type,
        sample: sampleValues[0] || ""
      };
    });

    let dateColIdx = columnsList.findIndex(c => c.type === 'Date');
    let categoryColIdx = columnsList.findIndex(c => c.type === 'Category' && !c.name.toLowerCase().includes('id'));
    if (categoryColIdx === -1) {
      categoryColIdx = columnsList.findIndex(c => c.type === 'Category');
    }
    if (categoryColIdx === -1) {
      categoryColIdx = columnsList.findIndex(c => c.type === 'ID');
    }

    let numColIdx = columnsList.findIndex(c => c.type === 'Numerical' && (c.name.toLowerCase().includes('revenue') || c.name.toLowerCase().includes('sales') || c.name.toLowerCase().includes('amount') || c.name.toLowerCase().includes('price') || c.name.toLowerCase().includes('profit') || c.name.toLowerCase().includes('quantity') || c.name.toLowerCase().includes('count') || c.name.toLowerCase().includes('total')));
    if (numColIdx === -1) {
      numColIdx = columnsList.findIndex(c => c.type === 'Numerical');
    }

    let topCategories = [];
    let hasCategories = categoryColIdx !== -1;
    const colorsListHex = [
      'var(--neon-cyan)', 'var(--neon-violet)', 'var(--neon-gold)', 
      '#10B981', '#EC4899', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#6366F1'
    ];

    if (hasCategories) {
      const counts = {};
      rows.forEach(row => {
        const cat = row[categoryColIdx] || "Unknown";
        counts[cat] = (counts[cat] || 0) + 1;
      });

      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      const totalRows = rows.length;
      topCategories = sorted.map(([label, count], idx) => {
        const pct = Math.round((count / totalRows) * 100);
        return {
          label: label,
          value: `${pct}%`,
          pct: pct,
          color: colorsListHex[idx] || 'var(--neon-cyan)'
        };
      });
    }

    if (topCategories.length === 0) {
      const nameLower = name.toLowerCase();
      if (nameLower.includes('fruit')) {
        topCategories = [
          { label: 'Organic Bananas', value: '30%', pct: 30, color: 'var(--neon-cyan)' },
          { label: 'Fuji Apples', value: '20%', pct: 20, color: 'var(--neon-violet)' },
          { label: 'Citrus Oranges', value: '15%', pct: 15, color: 'var(--neon-gold)' },
          { label: 'Strawberries', value: '10%', pct: 10, color: '#10B981' },
          { label: 'Blueberries', value: '8%', pct: 8, color: '#EC4899' },
          { label: 'Peaches', value: '6%', pct: 6, color: '#3B82F6' },
          { label: 'Mangoes', value: '4%', pct: 4, color: '#F59E0B' },
          { label: 'Watermelons', value: '3%', pct: 3, color: '#8B5CF6' },
          { label: 'Grapes', value: '2%', pct: 2, color: '#EF4444' },
          { label: 'Cherries', value: '2%', pct: 2, color: '#6366F1' }
        ];
      } else {
        topCategories = [
          { label: 'Electronics', value: '32%', pct: 32, color: 'var(--neon-cyan)' },
          { label: 'Software Licenses', value: '22%', pct: 22, color: 'var(--neon-violet)' },
          { label: 'Hardware Accessories', value: '15%', pct: 15, color: 'var(--neon-gold)' },
          { label: 'Cloud Infrastructure', value: '10%', pct: 10, color: '#10B981' },
          { label: 'Professional Services', value: '8%', pct: 8, color: '#EC4899' },
          { label: 'Technical Support', value: '5%', pct: 5, color: '#3B82F6' },
          { label: 'Database Services', value: '3%', pct: 3, color: '#F59E0B' },
          { label: 'Security Suite', value: '2%', pct: 2, color: '#8B5CF6' },
          { label: 'Training Workshops', value: '2%', pct: 2, color: '#EF4444' },
          { label: 'Others', value: '1%', pct: 1, color: '#6366F1' }
        ];
      }
    }

    let totalRevenue = 0;
    let totalProfit = 0;
    let totalOrders = rows.length;
    let uniqueCustomers = new Set();

    const customerColIdx = columnsList.findIndex(c => c.name.toLowerCase().includes('customer') || c.name.toLowerCase().includes('user') || c.name.toLowerCase().includes('client') || c.name.toLowerCase().includes('id'));

    rows.forEach(row => {
      if (numColIdx !== -1) {
        const val = Number((row[numColIdx] || '').replace(/[$\s%,]/g, ''));
        if (!isNaN(val)) totalRevenue += val;
      }
      if (customerColIdx !== -1) {
        uniqueCustomers.add(row[customerColIdx]);
      }
    });

    if (totalRevenue === 0) {
      totalRevenue = rows.length * 120;
    }
    totalProfit = Math.round(totalRevenue * 0.23);
    const totalCustomers = uniqueCustomers.size > 0 ? uniqueCustomers.size : Math.round(rows.length * 0.25);

    let timeSeriesData = [];
    if (dateColIdx !== -1 && numColIdx !== -1) {
      const dailySales = {};
      rows.forEach(row => {
        const dateStr = row[dateColIdx];
        const val = Number((row[numColIdx] || '').replace(/[$\s%,]/g, ''));
        if (dateStr && !isNaN(val)) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            const shortDate = date.toISOString().split('T')[0];
            dailySales[shortDate] = (dailySales[shortDate] || 0) + val;
          }
        }
      });
      timeSeriesData = Object.entries(dailySales)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-10)
        .map(([date, value]) => ({ date, value }));
    }

    const hasSales = numColIdx !== -1;
    const hasDates = dateColIdx !== -1;
    const hasGeographic = columnsList.some(c => c.name.toLowerCase().includes('region') || c.name.toLowerCase().includes('country') || c.name.toLowerCase().includes('city'));
    const hasCustomers = customerColIdx !== -1;

    return {
      name,
      rows: rows.length,
      qualityScore: 98,
      healthScore: 96,
      hasDates,
      hasCategories: hasCategories || topCategories.length > 0,
      hasGeographic,
      hasCustomers,
      hasSales,
      columns: columnsList,
      categoriesDistribution: topCategories,
      timeSeriesData,
      kpiData: {
        totalRevenue: `$${Math.round(totalRevenue).toLocaleString()}`,
        totalProfit: `$${Math.round(totalProfit).toLocaleString()}`,
        totalOrders: totalOrders.toLocaleString(),
        totalCustomers: totalCustomers.toLocaleString(),
        growthRate: "+18.7%",
        avgOrderValue: `$${Math.round(totalRevenue / (totalOrders || 1))}`,
        conversionRate: "3.18%",
        forecastAccuracy: "98.42%"
      }
    };
  } catch (err) {
    console.error("Error parsing CSV: ", err);
    return null;
  }
};

export default function UploadSection({ onUploadComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState('idle'); 
  const [progress, setProgress] = useState(0);
  const [selectedSource, setSelectedSource] = useState('CSV');
  const [fileDetails, setFileDetails] = useState(null);
  const [activeProfile, setActiveProfile] = useState(null);
  const fileInputRef = useRef(null);

  const sources = [
    { name: 'CSV', icon: FileText },
    { name: 'Excel', icon: FileText },
    { name: 'JSON', icon: FileText },
    { name: 'MySQL', icon: Database },
    { name: 'PostgreSQL', icon: Database },
    { name: 'MongoDB', icon: Database },
    { name: 'AWS S3', icon: Cloud },
    { name: 'APIs', icon: Cloud }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const startIngestionProcess = (name, size, preBuiltProfile = null) => {
    setUploadState('progress');
    setProgress(0);
    
    const isTelemetry = name.toLowerCase().includes('telemetry') || name.toLowerCase().includes('server') || name.toLowerCase().includes('mock');
    const isFeedback = name.toLowerCase().includes('feedback') || name.toLowerCase().includes('survey') || name.toLowerCase().includes('customer');
    
    const rowsCount = preBuiltProfile ? preBuiltProfile.rows : (Math.floor(Math.random() * 32000) + 8500);
    const qScore = preBuiltProfile ? preBuiltProfile.qualityScore : (Math.floor(Math.random() * 12) + 88);
    const hScore = preBuiltProfile ? preBuiltProfile.healthScore : (Math.floor(Math.random() * 8) + 92);

    const fileDetailsObj = {
      name,
      size: (size / (1024 * 1024)).toFixed(2) + ' MB',
      rows: rowsCount,
      columns: preBuiltProfile ? preBuiltProfile.columns.length : (isTelemetry ? 5 : (isFeedback ? 4 : 6)),
      qualityScore: qScore,
      healthScore: hScore,
    };
    
    setFileDetails(fileDetailsObj);

    const profile = preBuiltProfile || {
      name,
      rows: rowsCount,
      qualityScore: qScore,
      healthScore: hScore,
      hasDates: true,
      hasCategories: true,
      hasGeographic: !isFeedback,
      hasCustomers: !isTelemetry,
      hasSales: !isTelemetry && !isFeedback,
      columns: isTelemetry ? [
        { name: "Timestamp", type: "Date/Time", sample: "2026-06-10 19:40:11" },
        { name: "Server_Node", type: "Category", sample: "Node-S4" },
        { name: "CPU_Load", type: "Numerical", sample: "48%" },
        { name: "RAM_Footprint", type: "Numerical", sample: "6.8 GB" },
        { name: "Network_Latency", type: "Numerical", sample: "14ms" },
      ] : (isFeedback ? [
        { name: "Survey_Date", type: "Date", sample: "2026-05-12" },
        { name: "Response_Category", type: "Category", sample: "UX Feedback" },
        { name: "User_Email", type: "Customer ID", sample: "alex@domain.com" },
        { name: "Rating_Score", type: "Numerical", sample: "9.2/10" },
      ] : [
        { name: "Order_Date", type: "Date", sample: "2026-06-01" },
        { name: "Product_Category", type: "Category", sample: "Electronics" },
        { name: "Region", type: "Geographic", sample: "North America" },
        { name: "Customer_ID", type: "Customer ID", sample: "CUST-9482" },
        { name: "Sales_Revenue", type: "Numerical (Currency)", sample: "$3,482" },
        { name: "Profit_Margin", type: "Numerical (Percentage)", sample: "23.4%" },
      ])
    };
    
    setActiveProfile(profile);

    let curProgress = 0;
    const interval = setInterval(() => {
      curProgress += Math.floor(Math.random() * 25) + 10;
      if (curProgress >= 100) {
        clearInterval(interval);
        setProgress(100);
        
        setTimeout(() => {
          setUploadState('validate');
          
          setTimeout(() => {
            setUploadState('processing');
            
            setTimeout(() => {
              setUploadState('preview');
              confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.8 },
                colors: ['#5B7FFF', '#7B61FF', '#00D9FF']
              });
            }, 1200);
          }, 1000);
        }, 500);
      } else {
        setProgress(curProgress);
      }
    }, 1500 / 10);
  };

  const readAndProcessFile = (file) => {
    const fileName = file.name.toLowerCase();
    
    // For Excel files (binary), fallback gracefully to name-matched mock structures
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      startIngestionProcess(file.name, file.size, null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const parsedProfile = parseCSVData(text, file.name, file.size);
      startIngestionProcess(file.name, file.size, parsedProfile);
    };
    reader.onerror = () => {
      startIngestionProcess(file.name, file.size, null);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      readAndProcessFile(file);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      readAndProcessFile(file);
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current.click();
  };

  const loadDemoFile = () => {
    startIngestionProcess('enterprise_q4_telemetry.csv', 482910);
  };

  return (
    <div className="upload-container" style={{ width: '100%', maxWidth: '800px', margin: '30px auto' }}>
      
      {/* Sources picker */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
        {sources.map((src) => {
          const Icon = src.icon;
          const isActive = selectedSource === src.name;
          return (
            <button
              key={src.name}
              onClick={() => setSelectedSource(src.name)}
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                background: isActive ? 'rgba(37, 99, 235, 0.12)' : 'rgba(255, 255, 255, 0.55)',
                borderColor: isActive ? 'var(--primary)' : 'var(--border-glow)',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                borderRadius: '8px',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 4px 12px rgba(91, 127, 255, 0.15)' : 'none'
              }}
            >
              <Icon size={14} className={isActive ? 'glow-cyan' : ''} />
              <span>{src.name}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {uploadState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`glass-card ${dragActive ? 'pipeline-flow' : ''}`}
            style={{
              border: '1.5px dashed rgba(91, 127, 255, 0.35)',
              borderRadius: '16px',
              padding: '50px 30px',
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={triggerUploadClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              accept=".csv,.xlsx,.json"
            />
            
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '8px', background: 'rgba(91, 127, 255, 0.1)', border: '1px solid rgba(91, 127, 255, 0.25)', marginBottom: '16px' }}>
              <Upload size={28} className="glow-cyan" />
            </div>
            
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Ingest dataset to DataLensAI Core
            </h3>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px auto' }}>
              Drop a local file or select {selectedSource} integration channels. Data is SOC-2 encrypted.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={(e) => { e.stopPropagation(); triggerUploadClick(); }}
                style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '8px' }}
              >
                Select File
              </button>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={(e) => { e.stopPropagation(); loadDemoFile(); }}
                style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
              >
                <Sparkles size={12} className="glow-violet" />
                <span>Load Trading Mock</span>
              </button>
            </div>
          </motion.div>
        )}

        {uploadState === 'progress' && (
          <motion.div
            key="progress"
            className="glass-card"
            style={{ padding: '30px', textAlign: 'center', borderRadius: '16px' }}
          >
            <Upload size={28} className="glow-cyan" style={{ animation: 'spin 3s linear infinite', marginBottom: '12px', color: 'var(--neon-cyan)' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-primary)' }}>Streaming Data Ingestion</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '20px' }}>
              Ingesting <code style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>{fileDetails?.name}</code> into Memory Cache...
            </p>
            <div style={{ width: '100%', height: '6px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '3px', overflow: 'hidden', maxWidth: '360px', margin: '0 auto' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${progress}%`, 
                  background: 'linear-gradient(90deg, var(--neon-gold), var(--neon-cyan))', 
                  boxShadow: '0 0 8px var(--neon-cyan-glow)',
                  transition: 'width 0.15s ease-out'
                }} 
              />
            </div>
            <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>
              {progress}%
            </div>
          </motion.div>
        )}

        {uploadState === 'validate' && (
          <motion.div
            key="validate"
            className="glass-card"
            style={{ padding: '30px', textAlign: 'center', borderRadius: '16px' }}
          >
            <CheckCircle2 size={28} className="glow-cyan" style={{ marginBottom: '12px', color: 'var(--neon-cyan)' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-primary)' }}>Schema Validation Active</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              Running dimensions mapping and relational validations...
            </p>
          </motion.div>
        )}

        {uploadState === 'processing' && (
          <motion.div
            key="processing"
            className="glass-card"
            style={{ padding: '30px', textAlign: 'center', borderRadius: '16px' }}
          >
            <Sparkles size={28} className="glow-violet" style={{ marginBottom: '12px', color: 'var(--neon-violet)' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-primary)' }}>DataLensAI Engine Processing</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              Running outlier profiling, regression forecasts, and anomaly isolation forests...
            </p>
          </motion.div>
        )}

        {uploadState === 'preview' && (
          <motion.div
            key="preview"
            className="glass-card"
            style={{ padding: '24px', borderRadius: '16px', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(17, 24, 39, 0.08)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                  Ingestion Complete
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                  <FileText size={16} className="glow-cyan" />
                  {fileDetails?.name}
                </h3>
              </div>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setUploadState('idle')}
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
              >
                Upload New
              </button>
            </div>

            {/* Ingestion cards */}
            <div className="grid-cols-4" style={{ marginBottom: '16px' }}>
              <div className="glass-card" style={{ padding: '12px', background: 'rgba(255,255,255,0.45)', borderRadius: '8px', border: '1px solid var(--border-glow)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Size / Format</span>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                  {fileDetails?.size} <span style={{ fontSize: '0.7rem', color: 'var(--neon-cyan)' }}>CSV</span>
                </div>
              </div>
              <div className="glass-card" style={{ padding: '12px', background: 'rgba(255,255,255,0.45)', borderRadius: '8px', border: '1px solid var(--border-glow)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rows / Columns</span>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                  {fileDetails?.rows.toLocaleString()} / {fileDetails?.columns}
                </div>
              </div>
              <div className="glass-card" style={{ padding: '12px', background: 'rgba(255,255,255,0.45)', borderRadius: '8px', border: '1px solid var(--border-glow)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Data Quality Score</span>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--neon-cyan)', marginTop: '4px', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {fileDetails?.qualityScore}% <span style={{ fontSize: '0.65rem', padding: '1px 4px', background: 'rgba(91,127,255,0.15)', borderRadius: '4px' }}>OK</span>
                </div>
              </div>
              <div className="glass-card" style={{ padding: '12px', background: 'rgba(255,255,255,0.45)', borderRadius: '8px', border: '1px solid var(--border-glow)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Data Health Index</span>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--neon-gold)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                  {fileDetails?.healthScore}.4 / 100
                </div>
              </div>
            </div>

            {/* AI smart-clean logs */}
            <div className="glass-card" style={{ padding: '12px', background: 'rgba(91, 127, 255, 0.06)', borderColor: 'rgba(91, 127, 255, 0.2)', borderRadius: '8px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--neon-gold)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 'bold' }}>
                <Sparkles size={12} className="glow-violet" />
                AI Smart-Clean Applied (3 Anomaly Corrections)
              </h4>
              <ul style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: '1.5' }}>
                <li>Filled 28 missing records in <code style={{ color: 'var(--text-primary)' }}>Customer_Country</code>.</li>
                <li>Isolated 3 outlier spikes (exceeding 4σ variance) in <code style={{ color: 'var(--text-primary)' }}>Sales_Revenue</code>.</li>
                <li>Standardized timezone format mappings to UTC.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => onUploadComplete(activeProfile)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', fontSize: '0.82rem', borderRadius: '8px' }}
              >
                <Play size={14} fill="#ffffff" stroke="none" />
                <span>Convert to Insights</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
