import * as THREE from 'three';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Unified Background Starfield setup
    const container = document.getElementById('canvas-container');
    if (container) {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x050505);
        scene.fog = new THREE.FogExp2(0x050505, 0.0035);
        
        const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 0, 100);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Ambient lights
        scene.add(new THREE.AmbientLight(0x0f1115, 2.0));
        const point = new THREE.PointLight(0x8b5cf6, 3.0, 150);
        point.position.set(0, 0, 50);
        scene.add(point);

        // Twinkling stars
        const count = 300;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
        }
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({ color: 0x8b5cf6, size: 0.8, transparent: true, opacity: 0.5 });
        const stars = new THREE.Points(geom, mat);
        scene.add(stars);

        function render() {
            requestAnimationFrame(render);
            stars.rotation.y += 0.002;
            stars.rotation.x += 0.001;
            renderer.render(scene, camera);
        }
        render();

        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    // 2. Expanded tactical radar canvas
    const radarCanvas = document.getElementById('security-radar-canvas');
    const ctx = radarCanvas.getContext('2d');
    
    // Core parameters
    let angle = 0;
    let blips = [
        { x: 120, y: 150, ip: '192.168.1.12', intensity: 0.8, color: '#10b981' },
        { x: 260, y: 110, ip: '192.168.1.48', intensity: 0.6, color: '#10b981' },
        { x: 180, y: 280, ip: '192.168.1.92', intensity: 0.5, color: '#f59e0b' }
    ];

    let threatBlip = null;
    let isThreatActive = false;

    function drawRadar() {
        const cx = radarCanvas.width / 2;
        const cy = radarCanvas.height / 2;
        const maxRadius = radarCanvas.width / 2 - 10;

        ctx.clearRect(0, 0, radarCanvas.width, radarCanvas.height);

        // Draw grid concentric circles
        ctx.strokeStyle = isThreatActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(139, 92, 246, 0.1)';
        ctx.lineWidth = 1;
        for (let r = 40; r <= maxRadius; r += 40) {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw crosshair axes
        ctx.beginPath();
        ctx.moveTo(10, cy); ctx.lineTo(radarCanvas.width - 10, cy);
        ctx.moveTo(cx, 10); ctx.lineTo(cx, radarCanvas.height - 10);
        ctx.stroke();

        // Draw sweeping laser line (Electric Violet)
        ctx.strokeStyle = isThreatActive ? 'rgba(239, 68, 68, 0.4)' : 'rgba(139, 92, 246, 0.4)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        const sweepX = cx + Math.cos(angle) * maxRadius;
        const sweepY = cy + Math.sin(angle) * maxRadius;
        ctx.lineTo(sweepX, sweepY);
        ctx.stroke();

        // Conical shadow sweep
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, isThreatActive ? 'rgba(239, 68, 68, 0.05)' : 'rgba(139, 92, 246, 0.05)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, maxRadius, angle - 0.4, angle);
        ctx.lineTo(cx, cy);
        ctx.fill();

        // Draw Standard Blips
        blips.forEach(b => {
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Text labeling
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.font = '7px "Orbitron"';
            ctx.fillText(b.ip, b.x + 8, b.y + 3);
        });

        // Draw threat blip if active
        if (isThreatActive && threatBlip) {
            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(threatBlip.x, threatBlip.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0; // reset

            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 8px "Orbitron"';
            ctx.fillText("MALICIOUS PAYLOAD", threatBlip.x + 10, threatBlip.y + 3);
        }

        angle += 0.015;
        requestAnimationFrame(drawRadar);
    }

    drawRadar();

    // 3. System actions DOM hooks
    const btnExploit = document.getElementById('btn-threat-exploit');
    const btnDdos = document.getElementById('btn-threat-ddos');
    const btnHeal = document.getElementById('btn-autoshield-heal');
    const threatLvl = document.getElementById('threat-lvl-header');
    const anomalyIndex = document.getElementById('txt-anomaly-index');
    const threatScore = document.getElementById('threat-score');
    const securityFeed = document.getElementById('security-log-feed');
    const securityChat = document.getElementById('security-chat-container');

    btnExploit.addEventListener('click', () => {
        isThreatActive = true;
        threatBlip = { x: 200, y: 190 };

        threatLvl.textContent = "84.20% INCIDENT";
        threatLvl.className = "val red-text";
        anomalyIndex.textContent = "SQL INJECTION DETECTED";
        anomalyIndex.className = "val red-text";
        threatScore.textContent = "9.4 (CRITICAL)";
        threatScore.className = "val red-text";

        triggerLog(`[ALERT] Detected SQL injection payload routing to PostgreSQL PORT 5432! Intrusion blocked.`, "coral");

        const msg = document.createElement('div');
        msg.className = "chat-msg";
        msg.innerHTML = `
            <span class="sender red-text">✦ SECURITY OVERWATCH</span>
            <p class="content">Vulnerability threat detected on relational segment. Quarantine active on IP 192.168.1.104. Auto-shield engaged.</p>
        `;
        securityChat.appendChild(msg);
        securityChat.scrollTop = securityChat.scrollHeight;
    });

    btnDdos.addEventListener('click', () => {
        isThreatActive = true;
        threatBlip = { x: 140, y: 220 };

        threatLvl.textContent = "79.10% ALERT";
        threatLvl.className = "val red-text";
        anomalyIndex.textContent = "BRUTE FORCE IN FLIGHT";
        anomalyIndex.className = "val red-text";
        threatScore.textContent = "8.2 (HIGH PRESSURE)";
        threatScore.className = "val red-text";

        triggerLog(`[ALERT] Ingress flood: rapid connection attempt spike (4,200 req/s) on Oracle schema USERS!`, "coral");
    });

    btnHeal.addEventListener('click', () => {
        isThreatActive = false;
        threatBlip = null;

        threatLvl.textContent = "0.00% SECURE";
        threatLvl.className = "val green";
        anomalyIndex.textContent = "ZERO DETECTED";
        anomalyIndex.className = "val green";
        threatScore.textContent = "0.0 (SECURE)";
        threatScore.className = "val emerald-text";

        triggerLog(`[HEAL] Security cleanup complete. anomalous packets deleted. Restored baseline health.`, "emerald");

        const msg = document.createElement('div');
        msg.className = "chat-msg";
        msg.innerHTML = `
            <span class="sender emerald-text">✦ SECURITY OVERWATCH</span>
            <p class="content">Autonomous recovery success. Threats quelled. Active segments restored to secure baseline states.</p>
        `;
        securityChat.appendChild(msg);
        securityChat.scrollTop = securityChat.scrollHeight;
    });

    function triggerLog(text, colorClass = "violet") {
        const line = document.createElement('div');
        line.className = `c-line ${colorClass}`;
        const ts = new Date().toLocaleTimeString().split(' ')[0];
        line.textContent = `[${ts}] ${text}`;
        securityFeed.appendChild(line);
        securityFeed.scrollTop = securityFeed.scrollHeight;
    }

    triggerLog("Surveillance overwatch radar active. strictly mapping regional synchronisations.", "emerald");
});
