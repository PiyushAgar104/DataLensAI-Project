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

    // 2. Database Directory profiles data
    const databaseList = [
        // Relational
        { id: 'oracle', name: 'Oracle DB', cat: 'relational', type: 'Golden Core (Stability)', latency: '1.2ms', sync: '100% SYNCED', threads: '1,248' },
        { id: 'postgres', name: 'PostgreSQL', cat: 'relational', type: 'Blue Neural Grid', latency: '0.8ms', sync: '99.98% SYNCED', threads: '840' },
        { id: 'mysql', name: 'MySQL', cat: 'relational', type: 'Structured Node', latency: '1.4ms', sync: '99.9% SYNCED', threads: '512' },
        { id: 'sqlserver', name: 'SQL Server', cat: 'relational', type: 'Enterprise Cluster', latency: '1.6ms', sync: '99.95% SYNCED', threads: '450' },
        { id: 'mariadb', name: 'MariaDB', cat: 'relational', type: 'Relational Node', latency: '1.5ms', sync: '99.9% SYNCED', threads: '320' },
        { id: 'sqlite', name: 'SQLite', cat: 'relational', type: 'Embedded Core', latency: '0.2ms', sync: 'LOCAL ONLY', threads: '1' },
        { id: 'db2', name: 'IBM Db2', cat: 'relational', type: 'Mainframe Engine', latency: '2.4ms', sync: '99.8% SYNCED', threads: '280' },

        // NoSQL & Graph
        { id: 'mongodb', name: 'MongoDB', cat: 'nosql', type: 'Green Decentral Galaxy', latency: '0.6ms', sync: '99.99% SYNCED', threads: '920' },
        { id: 'cassandra', name: 'Cassandra', cat: 'nosql', type: 'Wide-Column Cluster', latency: '1.8ms', sync: '100% SYNCED', threads: '1,450' },
        { id: 'neo4j', name: 'Neo4j Graph', cat: 'nosql', type: 'Relationship Web', latency: '2.1ms', sync: '99.85% SYNCED', threads: '240' },
        { id: 'dynamodb', name: 'DynamoDB', cat: 'nosql', type: 'AWS Key-Value', latency: '4.2ms', sync: '100% Cloud', threads: '8,400' },
        { id: 'couchbase', name: 'Couchbase', cat: 'nosql', type: 'Memcached Document', latency: '0.9ms', sync: '99.9% SYNCED', threads: '310' },
        { id: 'hbase', name: 'HBase', cat: 'nosql', type: 'Hadoop Columnar', latency: '3.8ms', sync: '99.7% SYNCED', threads: '600' },

        // Real-Time & Caches
        { id: 'redis', name: 'Redis Cache', cat: 'realtime', type: 'Ultra-fast In-Memory', latency: '0.1ms', sync: '99.99% CACHED', threads: '2,400' },
        { id: 'firebase', name: 'Firebase', cat: 'realtime', type: 'Sync Storm Cloud', latency: '5.2ms', sync: '100% Realtime', threads: '12,480' },
        { id: 'supabase', name: 'Supabase', cat: 'realtime', type: 'Postgres API Realtime', latency: '1.1ms', sync: '99.98% SYNCED', threads: '840' },
        { id: 'memcached', name: 'Memcached', cat: 'realtime', type: 'Distributed Key Cache', latency: '0.15ms', sync: 'CACHE ONLY', threads: '1,800' },

        // Vector AI & Search
        { id: 'pinecone', name: 'Pinecone Vector', cat: 'vector', type: 'AI Semantic Cloud', latency: '1.8ms', sync: '100% Vector', threads: '12,400 vectors' },
        { id: 'weaviate', name: 'Weaviate AI', cat: 'vector', type: 'Semantic Vector Db', latency: '2.0ms', sync: '99.98% SYNCED', threads: '8,500 vectors' },
        { id: 'elasticsearch', name: 'Elasticsearch', cat: 'vector', type: 'Vector Search Engine', latency: '2.5ms', sync: '99.9% SYNCED', threads: '3,200 shards' },
        { id: 'chromadb', name: 'ChromaDB', cat: 'vector', type: 'Embedded Vector Store', latency: '0.4ms', sync: 'LOCAL AI', threads: '450 vectors' },
        { id: 'qdrant', name: 'Qdrant', cat: 'vector', type: 'High-Scale Vector', latency: '1.6ms', sync: '100% Vector', threads: '1,800 vectors' },

        // Warehouse & Cloud
        { id: 'snowflake', name: 'Snowflake', cat: 'warehouse', type: 'Crystalline Warehouse', latency: '12.4ms', sync: '99.95% SYNCED', threads: '12 Compute WH' },
        { id: 'bigquery', name: 'BigQuery', cat: 'warehouse', type: 'Google Serverless', latency: '15.0ms', sync: '100% Cloud', threads: '450 dryRun slots' },
        { id: 's3', name: 'AWS S3 Stage', cat: 'warehouse', type: 'Datalake Objects Store', latency: '8.4ms', sync: '100% S3 stages', threads: '1,245,800 objs' }
    ];

    const grid = document.getElementById('db-directory-grid');
    const filterChips = document.querySelectorAll('.dir-filter-chip');
    const searchBox = document.getElementById('dir-search-box');

    let activeFilter = 'all';

    function renderGrid() {
        grid.innerHTML = ''; // clear

        const query = searchBox.value.toLowerCase().trim();

        databaseList.forEach(db => {
            // Apply category filters & search queries
            if (activeFilter !== 'all' && db.cat !== activeFilter) return;
            if (query !== '' && !db.name.toLowerCase().includes(query) && !db.type.toLowerCase().includes(query)) return;

            const card = document.createElement('div');
            card.className = `db-card`;
            
            // Get category-specific indicator color
            const catColor = db.cat === 'relational' ? 'violet-text' :
                             db.cat === 'nosql' ? 'emerald-text' :
                             db.cat === 'realtime' ? 'amber-text' :
                             db.cat === 'vector' ? 'cyan-text' : 'red-text';

            card.innerHTML = `
                <div class="card-hdr">
                    <span class="card-title ${catColor}">${db.name}</span>
                    <span class="status-dot pulsing-violet"></span>
                </div>
                <div class="card-body">
                    <div class="card-stat">
                        <span class="lbl">Holo Entity</span>
                        <span class="val">${db.type}</span>
                    </div>
                    <div class="card-stat">
                        <span class="lbl">Query Latency</span>
                        <span class="val emerald-text">${db.latency}</span>
                    </div>
                    <div class="card-stat">
                        <span class="lbl">Sync Status</span>
                        <span class="val cyan-text">${db.sync}</span>
                    </div>
                    <div class="card-stat">
                        <span class="lbl">Active Threads</span>
                        <span class="val gold-text">${db.threads}</span>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Trigger neat hover animations using GSAP
        if (window.gsap) {
            gsap.from(".db-card", {
                opacity: 0,
                y: 15,
                duration: 0.4,
                stagger: 0.02,
                ease: "power2.out"
            });
        }
    }

    // Bind filter chips
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            activeFilter = chip.getAttribute('data-filter');
            renderGrid();
        });
    });

    searchBox.addEventListener('keyup', () => {
        renderGrid();
    });

    renderGrid();
});
