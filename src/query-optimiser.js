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

    // 2. SVG Neural Execution Tree Generator
    const treeSvg = document.getElementById('tree-svg');
    const txtSql = document.getElementById('txt-sql-query');
    const btnParse = document.getElementById('btn-parse-query');
    const btnMock = document.getElementById('btn-mock-slow');
    const optimDiagnostics = document.getElementById('optim-diagnostics-container');
    const slowQueriesVal = document.getElementById('slow-queries-val');
    const queryLogFeed = document.getElementById('query-log-feed');
    const btnClearFeed = document.getElementById('btn-clear-feed');

    const treeData = {
        name: "LIMIT (0, 100)",
        color: "#8b5cf6", // Violet
        x: 300, y: 50,
        children: [
            {
                name: "HASH JOIN",
                color: "#8b5cf6",
                x: 300, y: 150,
                children: [
                    {
                        name: "KEY LOOKUP (users)",
                        color: "#06b6d4", // Cyan
                        x: 180, y: 260,
                        children: [
                            { name: "PK_USERS_INDEX", color: "#10b981", x: 100, y: 350 }
                        ]
                    },
                    {
                        name: "TABLE SCAN (orders)",
                        color: "#ef4444", // Red warning
                        x: 420, y: 260,
                        children: [
                            { name: "SEQUENTIAL SCAN", color: "#ef4444", x: 500, y: 350 }
                        ]
                    }
                ]
            }
        ]
    };

    function renderExecutionTree() {
        treeSvg.innerHTML = ''; // clear

        // Draw connections (curved Bezier highways)
        function drawLinks(node) {
            if (node.children) {
                node.children.forEach(child => {
                    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    const d = `M ${node.x} ${node.y} C ${node.x} ${(node.y + child.y)/2}, ${child.x} ${(node.y + child.y)/2}, ${child.x} ${child.y}`;
                    path.setAttribute("d", d);
                    path.setAttribute("fill", "none");
                    path.setAttribute("stroke", "rgba(139, 92, 246, 0.2)");
                    path.setAttribute("stroke-width", "3");
                    path.setAttribute("class", "tree-branch");
                    treeSvg.appendChild(path);

                    // Glowing packet pulses running along branches
                    const pulse = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    pulse.setAttribute("r", "4");
                    pulse.setAttribute("fill", "#06b6d4");
                    
                    const animateX = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                    animateX.setAttribute("attributeName", "cx");
                    animateX.setAttribute("values", `${node.x};${child.x}`);
                    animateX.setAttribute("dur", "2.5s");
                    animateX.setAttribute("repeatCount", "indefinite");

                    const animateY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                    animateY.setAttribute("attributeName", "cy");
                    animateY.setAttribute("values", `${node.y};${child.y}`);
                    animateY.setAttribute("dur", "2.5s");
                    animateY.setAttribute("repeatCount", "indefinite");

                    pulse.appendChild(animateX);
                    pulse.appendChild(animateY);
                    treeSvg.appendChild(pulse);

                    drawLinks(child);
                });
            }
        }
        drawLinks(treeData);

        // Draw Nodes
        function drawNodes(node) {
            const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
            group.setAttribute("transform", `translate(${node.x}, ${node.y})`);

            // Outer glow ring
            const glow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            glow.setAttribute("r", "12");
            glow.setAttribute("fill", "none");
            glow.setAttribute("stroke", node.color);
            glow.setAttribute("stroke-width", "2");
            glow.setAttribute("style", `filter: drop-shadow(0 0 6px ${node.color});`);
            group.add(glow);

            // Core center
            const center = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            center.setAttribute("r", "6");
            center.setAttribute("fill", "#ffffff");
            group.appendChild(center);

            // Node name
            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("y", "26");
            label.setAttribute("fill", "rgba(255,255,255,0.85)");
            label.setAttribute("font-family", "'Orbitron', monospace");
            label.setAttribute("font-size", "9");
            label.setAttribute("font-weight", "bold");
            label.setAttribute("text-anchor", "middle");
            label.textContent = node.name;
            group.appendChild(label);

            treeSvg.appendChild(group);

            if (node.children) {
                node.children.forEach(child => drawNodes(child));
            }
        }
        drawNodes(treeData);
    }

    renderExecutionTree();

    // Parse action trigger
    btnParse.addEventListener('click', () => {
        const sql = txtSql.value.trim() || txtSql.getAttribute('placeholder');
        
        triggerLog(`AI COMPILING SQL STATE -- ANALYZING JOIN PREDICATES...`);
        triggerLog(`[SUCCESS] Generated query plan with cost 1.84 ms. Optimized indexing schemas loaded.`);

        // Flash nodes
        gsap.from(".tree-branch", { strokeWidth: 8, stroke: "#00ff88", duration: 1.0 });

        const dGroup = document.createElement('div');
        dGroup.className = "chat-msg";
        dGroup.innerHTML = `
            <span class="sender violet-text">✦ SEMANTIC SUGGESTION</span>
            <p class="content">Calculated sequential scan table index on table ORDERS. Recommend rebuilding index concurrently: <code>CREATE INDEX CONCURRENTLY idx_orders_user ON orders(user_id)</code></p>
        `;
        optimDiagnostics.appendChild(dGroup);
        optimDiagnostics.scrollTop = optimDiagnostics.scrollHeight;
    });

    btnMock.addEventListener('click', () => {
        slowQueriesVal.textContent = "1 IN FLIGHT";
        slowQueriesVal.className = "val red-text";

        triggerLog(`[WARN] Detected heavy sequential scan execution block! Table scan cost exceeded limits (duration: 450ms)`);

        setTimeout(() => {
            slowQueriesVal.textContent = "0 ACTIVE";
            slowQueriesVal.className = "val green";
        }, 4000);
    });

    btnClearFeed.addEventListener('click', () => {
        queryLogFeed.innerHTML = '';
    });

    function triggerLog(text) {
        const line = document.createElement('div');
        line.className = "c-line violet";
        const ts = new Date().toLocaleTimeString().split(' ')[0];
        line.textContent = `[${ts}] ${text}`;
        queryLogFeed.appendChild(line);
        queryLogFeed.scrollTop = queryLogFeed.scrollHeight;
    }

    triggerLog("AI semantic SQL optimization compiler online. Mapped query paths. Ready.");
});
