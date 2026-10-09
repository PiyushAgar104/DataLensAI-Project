import * as THREE from 'three';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Starfield background
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

        scene.add(new THREE.AmbientLight(0x0f1115, 2.0));
        const point = new THREE.PointLight(0x8b5cf6, 3.0, 150);
        point.position.set(0, 0, 50);
        scene.add(point);

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

    // 2. Wave Forecast Plotter
    const waveCanvas = document.getElementById('capacity-drift-canvas');
    const ctx = waveCanvas.getContext('2d');
    
    let time = 0;
    let multiplier = 1.0;

    const sliderSpike = document.getElementById('sim-spike-slider');
    const valSpike = document.getElementById('val-sim-spike');
    const btnScaleSpike = document.getElementById('btn-scale-spike');
    const k8sCount = document.getElementById('k8s-count');
    const predLogFeed = document.getElementById('predictive-log-feed');
    const predChat = document.getElementById('predictive-chat-container');

    sliderSpike.addEventListener('input', () => {
        multiplier = parseFloat(sliderSpike.value);
        valSpike.textContent = `${multiplier.toFixed(1)}x`;
    });

    btnScaleSpike.addEventListener('click', () => {
        multiplier = 4.0;
        sliderSpike.value = 4;
        valSpike.textContent = "4.0x";

        triggerLog("[COMPUTE SCALING] Simulating massive Peak load event (4.0x throughput)!...", "violet");
        triggerLog("[COMPUTE SCALING] Autopilot active: Scaled Kubernetes shard pods from 12 to 36 instances successfully.", "emerald");
        k8sCount.textContent = "36 ACTIVE SHARDS (SCALED)";
        k8sCount.className = "val gold-text";

        const msg = document.createElement('div');
        msg.className = "chat-msg";
        msg.innerHTML = `
            <span class="sender violet-text">✦ PREDICTIVE COPILOT</span>
            <p class="content">Autoscaler triggered scaling rule. Simulated workload capacity sustained. CPU peaks buffered seamlessly. Shards active.</p>
        `;
        predChat.appendChild(msg);
        predChat.scrollTop = predChat.scrollHeight;

        setTimeout(() => {
            multiplier = 1.0;
            sliderSpike.value = 1;
            valSpike.textContent = "1.0x";
            k8sCount.textContent = "12 ACTIVE SHARDS";
            k8sCount.className = "val emerald-text";
        }, 5000);
    });

    function drawWaves() {
        ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
        const w = waveCanvas.width;
        const h = waveCanvas.height;

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        // Draw Physical Capacity Red Threshold line at 80%
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(0, h * 0.2);
        ctx.lineTo(w, h * 0.2);
        ctx.stroke();
        ctx.setLineDash([]); // reset

        ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.font = '8px "Orbitron"';
        ctx.fillText("CRITICAL CAPACITY THRESHOLD (80%)", 15, h * 0.2 - 6);

        // Draw Active Real-Time CPU load wave (Emerald green / Cyan)
        ctx.strokeStyle = '#06b6d4'; // Cyan
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < w * 0.6; x++) {
            // Sine equation fluctuated by multiplier
            const y = h * 0.6 + Math.sin(x * 0.03 + time) * 20 * multiplier + Math.cos(x * 0.08 - time * 0.5) * 8 * multiplier;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw 24h ARIMA Predictive curves (Electric violet dotted)
        ctx.strokeStyle = '#8b5cf6'; // Violet
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        
        let startX = w * 0.6;
        for (let x = startX; x < w; x++) {
            // Predicted peak rises slightly
            const y = h * 0.6 + Math.sin(x * 0.02 + time * 0.5) * 35 * multiplier + Math.cos(x * 0.05) * 12;
            if (x === startX) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]); // reset

        // Label prediction join
        ctx.fillStyle = '#8b5cf6';
        ctx.beginPath();
        ctx.arc(startX, h * 0.6 + Math.sin(startX * 0.03 + time) * 20 * multiplier + Math.cos(startX * 0.08 - time * 0.5) * 8 * multiplier, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 8px "Orbitron"';
        ctx.fillText("ARIMA MODEL FORECAST JOIN POINT", startX - 40, h * 0.65 + 30);

        time += 0.04;
        requestAnimationFrame(drawWaves);
    }

    drawWaves();

    function triggerLog(text, colorClass = "violet") {
        const line = document.createElement('div');
        line.className = `c-line ${colorClass}`;
        const ts = new Date().toLocaleTimeString().split(' ')[0];
        line.textContent = `[${ts}] ${text}`;
        predLogFeed.appendChild(line);
        predLogFeed.scrollTop = predLogFeed.scrollHeight;
    }

    triggerLog("Machine learning forecaster active. Model ARIMA_PLUS mapped.", "emerald");
});
