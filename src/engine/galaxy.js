import * as THREE from 'three';

export class GalaxyGenerator {
    constructor(scene) {
        this.scene = scene;

        // Container groups
        this.galaxyGroup = new THREE.Group();
        this.constellationGroup = new THREE.Group();
        this.vortexGroup = new THREE.Group();
        this.shieldGroup = new THREE.Group(); // Concentric Security Defense Walls
        this.shockwaveGroup = new THREE.Group(); // Expanding bioluminescent shockwaves

        this.scene.add(this.galaxyGroup);
        this.scene.add(this.constellationGroup);
        this.scene.add(this.vortexGroup);
        this.scene.add(this.shieldGroup);
        this.galaxyGroup.add(this.shockwaveGroup);

        this.activeView = 'galaxy';
        this.activeDatabase = 'oracle';
        this.time = 0;
        this.isThreatState = false;

        this.nodesList = {}; // maps database key to Vector3 positions
        this.nodeObjects = {}; // maps database key to THREE.Group skyscrapers

        this.buildSharedFloor();
        this.buildNeuralCitadel(); // Replaces core

        // skyward shooting data beam
        const beamGeo = new THREE.CylinderGeometry(0.8, 2.2, 260, 16, 1, true);
        this.beamMat = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.0,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
        this.dataBeam = new THREE.Mesh(beamGeo, this.beamMat);
        this.dataBeam.position.set(0, 130, 0); // centered vertically since height is 260
        this.galaxyGroup.add(this.dataBeam);

        this.buildDatabaseCityscape(); // Replaces galaxy
        this.buildSecurityDefenseWalls(); // Newly added
        this.buildConstellationMap();
        this.buildDataVortex();

        this.setViewMode('galaxy');
    }

    buildSharedFloor() {
        // Deep space premium grid floor (Light Slate base with Violet gridlines)
        this.gridFloor = new THREE.GridHelper(330, 40, 0x7c3aed, 0xcbd5e1);
        this.gridFloor.position.y = -0.5;
        this.scene.add(this.gridFloor);

        // Circular tactical sweep line
        const radarGeo = new THREE.RingGeometry(158, 160, 64);
        const radarMat = new THREE.MeshBasicMaterial({
            color: 0x7c3aed,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.22
        });
        this.radarRing = new THREE.Mesh(radarGeo, radarMat);
        this.radarRing.rotation.x = Math.PI / 2;
        this.radarRing.position.y = 0.1;
        this.scene.add(this.radarRing);
    }

    buildNeuralCitadel() {
        this.coreContainer = new THREE.Group();
        this.coreContainer.position.set(0, 25, 0);

        // Geodesic glass neural core
        const coreGeo = new THREE.IcosahedronGeometry(13, 2);
        this.coreMat = new THREE.MeshPhysicalMaterial({
            color: 0x8b5cf6, // Electric Violet core
            metalness: 0.9,
            roughness: 0.05,
            transmission: 0.8,
            thickness: 2.0,
            transparent: true,
            opacity: 0.75,
            emissive: 0x8b5cf6,
            emissiveIntensity: 0.4
        });
        this.coreMesh = new THREE.Mesh(coreGeo, this.coreMat);
        this.coreContainer.add(this.coreMesh);

        // Glowing wireframe
        const wireGeo = new THREE.EdgesGeometry(coreGeo);
        const wireMat = new THREE.LineBasicMaterial({
            color: 0x06b6d4, // Quantum Cyan wireframe
            transparent: true,
            opacity: 0.75
        });
        const wire = new THREE.LineSegments(wireGeo, wireMat);
        this.coreContainer.add(wire);

        // Orbit rings around neural citadel
        this.ring1 = this.createOrbitRing(18, 0.006, 0x8b5cf6);
        this.ring2 = this.createOrbitRing(22, 0.009, 0x06b6d4);
        this.coreContainer.add(this.ring1);
        this.coreContainer.add(this.ring2);

        this.galaxyGroup.add(this.coreContainer);
    }

    createOrbitRing(radius, speed, colorHex) {
        const geom = new THREE.RingGeometry(radius - 0.2, radius + 0.2, 64);
        const mat = new THREE.MeshBasicMaterial({
            color: colorHex,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.25
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.4;
        mesh.rotation.y = (Math.random() - 0.5) * 0.4;
        mesh.userData = { speed: speed, axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize() };
        return mesh;
    }

    getDistrictColor(type) {
        const mappings = {
            relational: 0x00ff88, // Mint Green
            nosql: 0xffcc00,      // Gold Yellow
            realtime: 0xff6600,   // Amber Orange
            vector: 0x8b5cf6,     // Electric Violet
            warehouse: 0xef4444   // Coral Red
        };
        return mappings[type] || 0x06b6d4;
    }

    buildDatabaseCityscape() {
        // District categories mapping
        const dbConfigs = [
            // Relational District (Mint Green - Shape: Skyscrapers with matrix windows)
            { type: 'relational', radius: 52, yMin: 5, nodes: [
                { id: 'oracle', name: 'Oracle' },
                { id: 'postgres', name: 'PostgreSQL' },
                { id: 'mysql', name: 'MySQL' },
                { id: 'sqlserver', name: 'SQL Server' }
            ]},
            // NoSQL & Graph District (Gold Yellow - Shape: Decentralized nodes & relationship vines)
            { type: 'nosql', radius: 74, yMin: 12, nodes: [
                { id: 'mongodb', name: 'MongoDB' },
                { id: 'cassandra', name: 'Cassandra' },
                { id: 'neo4j', name: 'Neo4j Graph' },
                { id: 'dynamodb', name: 'DynamoDB' }
            ]},
            // Real-Time & Caching District (Amber Orange - Shape: fast cylinders silos)
            { type: 'realtime', radius: 94, yMin: 18, nodes: [
                { id: 'redis', name: 'Redis Cache' },
                { id: 'firebase', name: 'Firebase' },
                { id: 'supabase', name: 'Supabase' }
            ]},
            // Vector AI & Search District (Silver/White - Shape: Multi-sided spires)
            { type: 'vector', radius: 114, yMin: 22, nodes: [
                { id: 'pinecone', name: 'Pinecone Vector' },
                { id: 'weaviate', name: 'Weaviate AI' },
                { id: 'elasticsearch', name: 'Elasticsearch' }
            ]},
            // Warehouse & Cloud District (Coral Red - Shape: heavy pentagonal towers)
            { type: 'warehouse', radius: 134, yMin: 7, nodes: [
                { id: 'snowflake', name: 'Snowflake' },
                { id: 'bigquery', name: 'BigQuery' },
                { id: 's3', name: 'AWS S3 Cloud' }
            ]}
        ];

        dbConfigs.forEach((cluster) => {
            const count = cluster.nodes.length;
            const sectorAngle = (Math.PI * 2) / dbConfigs.length;
            const startAngle = dbConfigs.indexOf(cluster) * sectorAngle;
            const districtColor = this.getDistrictColor(cluster.type);

            // Draw low-lying district cyber wall boundaries (glowing sector arcs on the ground)
            const arcGeo = new THREE.RingGeometry(cluster.radius - 8, cluster.radius + 8, 48, 1, startAngle, sectorAngle * 0.88);
            const arcMat = new THREE.MeshBasicMaterial({
                color: districtColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.12,
                wireframe: true
            });
            const arcMesh = new THREE.Mesh(arcGeo, arcMat);
            arcMesh.rotation.x = Math.PI / 2;
            arcMesh.position.y = 0.2;
            this.galaxyGroup.add(arcMesh);

            cluster.nodes.forEach((node, idx) => {
                const nodeGroup = new THREE.Group();
                const angle = startAngle + (idx / count) * (sectorAngle * 0.85);

                const x = Math.cos(angle) * cluster.radius;
                const z = Math.sin(angle) * cluster.radius;
                const y = cluster.yMin + idx * 5;

                nodeGroup.position.set(x, y, z);
                nodeGroup.name = node.id;

                // Draw vertical neural transportation/elevator columns to deep space grid floor!
                const stemGeo = new THREE.CylinderGeometry(0.12, 0.12, y + 0.5, 8);
                const stemMat = new THREE.MeshBasicMaterial({
                    color: this.getDatabaseThemeColor(node.id),
                    transparent: true,
                    opacity: 0.18
                });
                const stem = new THREE.Mesh(stemGeo, stemMat);
                stem.position.y = -y / 2; // Down to floor
                nodeGroup.add(stem);

                // Build specialized database skyscrapers with spires and beacons!
                this.buildSpecializedSkyscraperMesh(node.id, nodeGroup, idx);

                // Add holographic text label
                const spriteColor = this.getDatabaseThemeColor(node.id);
                const sprite = this.createHoloText(node.name, spriteColor);
                sprite.position.set(0, 20 + idx * 2, 0); // elevated label above spires
                nodeGroup.add(sprite);

                // Track positions
                this.nodesList[node.id] = new THREE.Vector3(x, y, z);
                this.nodeObjects[node.id] = nodeGroup;

                this.galaxyGroup.add(nodeGroup);
            });
        });

        // Curried double-helix bioluminescent veins (Highways) connecting skyscrapers back to center core
        Object.keys(this.nodesList).forEach((id) => {
            const pos = this.nodesList[id];
            const curve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(pos.x, pos.y, pos.z),
                new THREE.Vector3(pos.x * 0.35, 25, pos.z * 0.35),
                new THREE.Vector3(0, 25, 0)
            );

            // Double helix lines
            const lineMat1 = new THREE.LineBasicMaterial({
                color: this.getDatabaseThemeColor(id),
                transparent: true,
                opacity: 0.32
            });
            const lineMat2 = new THREE.LineBasicMaterial({
                color: 0x06b6d4, // accent cyan secondary vein
                transparent: true,
                opacity: 0.16
            });

            const points1 = [];
            const points2 = [];
            const divisions = 45;
            for (let i = 0; i <= divisions; i++) {
                const t = i / divisions;
                const basePt = curve.getPointAt(t);
                const tangent = curve.getTangentAt(t);
                
                let norm = new THREE.Vector3(0, 1, 0).cross(tangent).normalize();
                if (norm.lengthSq() < 0.01) {
                    norm = new THREE.Vector3(1, 0, 0).cross(tangent).normalize();
                }
                const binormal = tangent.clone().cross(norm).normalize();
                
                const angle = t * Math.PI * 8.0; // 4 full turns
                const radius = 1.3 * (1.0 - t * 0.6); // tapers towards center core
                
                const pt1 = basePt.clone()
                    .addScaledVector(norm, Math.cos(angle) * radius)
                    .addScaledVector(binormal, Math.sin(angle) * radius);
                
                const pt2 = basePt.clone()
                    .addScaledVector(norm, Math.cos(angle + Math.PI) * radius)
                    .addScaledVector(binormal, Math.sin(angle + Math.PI) * radius);
                
                points1.push(pt1);
                points2.push(pt2);
            }

            const geom1 = new THREE.BufferGeometry().setFromPoints(points1);
            const geom2 = new THREE.BufferGeometry().setFromPoints(points2);

            const helix1 = new THREE.Line(geom1, lineMat1);
            const helix2 = new THREE.Line(geom2, lineMat2);
            
            this.galaxyGroup.add(helix1);
            this.galaxyGroup.add(helix2);
        });
    }

    /**
     * Renders each database skyscraper in high detail
     */
    buildSpecializedSkyscraperMesh(dbId, group, idx) {
        const themeColor = this.getDatabaseThemeColor(dbId);
        
        // Base skyscraper dimensions
        const baseHeight = 14 + (idx % 4) * 4;
        const width = 4.8;
        
        // Create standard high-rise base mesh with glowing cyber windows
        const towerGeo = new THREE.BoxGeometry(width, baseHeight, width);
        const towerMat = new THREE.MeshPhysicalMaterial({
            color: themeColor,
            metalness: 0.9,
            roughness: 0.1,
            transmission: 0.6,
            transparent: true,
            opacity: 0.68,
            emissive: themeColor,
            emissiveIntensity: 0.08
        });
        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.y = baseHeight / 2;
        group.add(tower);

        // Neon side glowing strips (vertical laser lines representing write heads)
        const lineGeom = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-width/2 - 0.05, 0, -width/2 - 0.05),
            new THREE.Vector3(-width/2 - 0.05, baseHeight, -width/2 - 0.05),
            new THREE.Vector3(width/2 + 0.05, 0, width/2 + 0.05),
            new THREE.Vector3(width/2 + 0.05, baseHeight, width/2 + 0.05),
            new THREE.Vector3(-width/2 - 0.05, 0, width/2 + 0.05),
            new THREE.Vector3(-width/2 - 0.05, baseHeight, width/2 + 0.05),
            new THREE.Vector3(width/2 + 0.05, 0, -width/2 - 0.05),
            new THREE.Vector3(width/2 + 0.05, baseHeight, -width/2 - 0.05)
        ]);
        const lineMat = new THREE.LineBasicMaterial({
            color: themeColor,
            transparent: true,
            opacity: 0.8
        });
        const neonStrips = new THREE.LineSegments(lineGeom, lineMat);
        group.add(neonStrips);

        // Antenna Spire with Blinking Signal Beacon
        const antennaHeight = 5 + (idx % 3) * 3;
        const antennaGeom = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, baseHeight, 0),
            new THREE.Vector3(0, baseHeight + antennaHeight, 0)
        ]);
        const antennaMat = new THREE.LineBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.6 });
        const antenna = new THREE.Line(antennaGeom, antennaMat);
        group.add(antenna);

        // Blinking LED Points at the top of antenna
        const beaconGeom = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, baseHeight + antennaHeight, 0)
        ]);
        const beaconMat = new THREE.PointsMaterial({
            color: themeColor,
            size: 2.2,
            transparent: true,
            opacity: 1.0
        });
        const beacon = new THREE.Points(beaconGeom, beaconMat);
        beacon.name = "beacon";
        group.add(beacon);

        // Cluster Shard Sub-structures (floating satellite shards rotating slowly)
        const shardGroup = new THREE.Group();
        shardGroup.name = "satelliteShards";
        const shardGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
        const shardMat = new THREE.MeshPhysicalMaterial({
            color: themeColor,
            metalness: 0.95,
            roughness: 0.1,
            transparent: true,
            opacity: 0.75
        });

        // 2 satellite shards at opposite sides
        const shard1 = new THREE.Mesh(shardGeo, shardMat);
        shard1.position.set(-3.2, baseHeight / 2 + (idx % 3 - 1) * 2, -3.2);
        const shard2 = new THREE.Mesh(shardGeo, shardMat);
        shard2.position.set(3.2, baseHeight / 2 - (idx % 3 - 1) * 2, 3.2);

        shardGroup.add(shard1);
        shardGroup.add(shard2);
        group.add(shardGroup);

        // Holographic wireframe overlay
        const wireGeo = new THREE.EdgesGeometry(towerGeo);
        const wireMat = new THREE.LineBasicMaterial({ color: themeColor, transparent: true, opacity: 0.4 });
        const wire = new THREE.LineSegments(wireGeo, wireMat);
        wire.position.y = baseHeight / 2;
        group.add(wire);
        
        // Add specialized structures INSIDE or ON TOP of the tower base!
        if (dbId === 'oracle') {
            const rGroup = new THREE.Group();
            rGroup.name = "oracleRings";
            const rGeo = new THREE.TorusGeometry(width * 1.25, 0.16, 8, 24);
            const rMat = new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.8 });
            const ring1 = new THREE.Mesh(rGeo, rMat);
            ring1.rotation.x = Math.PI / 2;
            ring1.position.y = baseHeight * 0.7;
            const ring2 = new THREE.Mesh(rGeo, rMat);
            ring2.rotation.y = Math.PI / 2;
            ring2.position.y = baseHeight * 0.3;
            rGroup.add(ring1);
            rGroup.add(ring2);
            group.add(rGroup);
        }
        else if (dbId === 'mongodb') {
            const mGroup = new THREE.Group();
            mGroup.name = "mongoNodes";
            const nodeGeo = new THREE.IcosahedronGeometry(1.5, 1);
            const nodeMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true });
            
            const positions = [
                new THREE.Vector3(-2.2, baseHeight + 2, -2.2),
                new THREE.Vector3(2.2, baseHeight + 3, -1.2),
                new THREE.Vector3(-1.2, baseHeight + 4, 2.2),
                new THREE.Vector3(1.8, baseHeight + 1.5, 1.8)
            ];

            positions.forEach((pos) => {
                const mesh = new THREE.Mesh(nodeGeo, nodeMat);
                mesh.position.copy(pos);
                mGroup.add(mesh);
            });

            for (let i = 0; i < positions.length; i++) {
                const p1 = positions[i];
                const p2 = positions[(i + 1) % positions.length];
                const geom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
                const mat = new THREE.LineBasicMaterial({ color: 0x00ff88, opacity: 0.4 });
                mGroup.add(new THREE.Line(geom, mat));
            }
            group.add(mGroup);
        }
        else if (dbId === 'postgres') {
            const pgGroup = new THREE.Group();
            pgGroup.name = "postgresGrid";
            const grid = new THREE.GridHelper(8, 4, 0x06b6d4, 0x011f3f);
            grid.position.y = baseHeight + 0.5;
            pgGroup.add(grid);
            group.add(pgGroup);
        }
        else if (dbId === 'redis') {
            const lightGroup = new THREE.Group();
            lightGroup.name = "redisLightning";
            for (let i = 0; i < 3; i++) {
                const geom = new THREE.RingGeometry(width * 1.1 + i * 0.6, width * 1.15 + i * 0.6, 16);
                const mat = new THREE.MeshBasicMaterial({
                    color: 0xffa500,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.6 - i * 0.15
                });
                const ring = new THREE.Mesh(geom, mat);
                ring.rotation.x = Math.PI / 2;
                ring.position.y = baseHeight * 0.2 + i * (baseHeight * 0.3);
                lightGroup.add(ring);
            }
            group.add(lightGroup);
        }
        else if (dbId === 'firebase') {
            const stormGroup = new THREE.Group();
            stormGroup.name = "firebaseCloud";
            const cloudGeo = new THREE.DodecahedronGeometry(3.0, 1);
            const cloudMat = new THREE.MeshBasicMaterial({
                color: 0xff6600,
                wireframe: true,
                transparent: true,
                opacity: 0.6
            });
            const cloud = new THREE.Mesh(cloudGeo, cloudMat);
            cloud.position.y = baseHeight + 3;
            stormGroup.add(cloud);
            group.add(stormGroup);
        }
        else if (dbId === 'neo4j') {
            const gGroup = new THREE.Group();
            gGroup.name = "neo4jGraph";
            const rootGeo = new THREE.SphereGeometry(1.8, 10, 10);
            const rootMat = new THREE.MeshPhysicalMaterial({ color: 0x8b5cf6, roughness: 0.1 });
            const root = new THREE.Mesh(rootGeo, rootMat);
            root.position.y = baseHeight + 2.5;
            gGroup.add(root);
            
            const childGeo = new THREE.SphereGeometry(0.85, 8, 8);
            const childMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
            const childPositions = [
                new THREE.Vector3(-3.0, baseHeight + 4.5, -1.8),
                new THREE.Vector3(3.0, baseHeight + 1.8, 1.8),
                new THREE.Vector3(1.2, baseHeight + 5.2, -1.2)
            ];

            childPositions.forEach((pos) => {
                const mesh = new THREE.Mesh(childGeo, childMat);
                mesh.position.copy(pos);
                gGroup.add(mesh);

                const armGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, baseHeight + 2.5, 0), pos]);
                const armMat = new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.7 });
                gGroup.add(new THREE.Line(armGeo, armMat));
            });
            group.add(gGroup);
        }
        else if (dbId === 'snowflake') {
            const iceGroup = new THREE.Group();
            iceGroup.name = "snowflakeCrystals";
            const crystalGeo = new THREE.OctahedronGeometry(1.8, 0);
            const crystalMat = new THREE.MeshPhysicalMaterial({
                color: 0xe2e8f0,
                metalness: 0.95,
                roughness: 0.05,
                transmission: 0.9,
                transparent: true,
                opacity: 0.8
            });

            for (let i = 0; i < 3; i++) {
                const mesh = new THREE.Mesh(crystalGeo, crystalMat);
                mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
                mesh.position.set((Math.random() - 0.5) * 1.2, baseHeight + 1.8 + i * 1.2, (Math.random() - 0.5) * 1.2);
                iceGroup.add(mesh);
            }
            group.add(iceGroup);
        }
        else if (dbId === 'pinecone' || dbId === 'weaviate') {
            const vGroup = new THREE.Group();
            vGroup.name = "vectorCloud";

            const count = 30;
            const positions = new Float32Array(count * 3);
            for (let i = 0; i < count; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 8;
                positions[i * 3 + 1] = baseHeight + 2 + (Math.random() - 0.5) * 6;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
            }
            const geom = new THREE.BufferGeometry();
            geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const mat = new THREE.PointsMaterial({
                color: 0x8b5cf6,
                size: 0.8,
                transparent: true,
                opacity: 0.9
            });
            const points = new THREE.Points(geom, mat);
            vGroup.add(points);

            const wireGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-3, baseHeight + 2, -2), new THREE.Vector3(2.5, baseHeight + 1, 3),
                new THREE.Vector3(2.5, baseHeight + 1, 3), new THREE.Vector3(0.8, baseHeight + 4, -1.5),
                new THREE.Vector3(0.8, baseHeight + 4, -1.5), new THREE.Vector3(-3, baseHeight + 2, -2)
            ]);
            const wireMat = new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.35 });
            vGroup.add(new THREE.Line(wireGeo, wireMat));

            group.add(vGroup);
        }
    }

    buildSecurityDefenseWalls() {
        // Three concentric semi-transparent security defense walls protecting cityscape
        const shieldCount = 3;
        for (let s = 0; s < shieldCount; s++) {
            const rad = 46 + s * 45;
            
            // Render geodesic hemisphere shields
            const shieldGeo = new THREE.SphereGeometry(rad, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
            const shieldMat = new THREE.MeshPhysicalMaterial({
                color: 0x00ff88, // Standard Mint Green defense
                wireframe: true,
                transparent: true,
                opacity: 0.12 - s * 0.03,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            const shield = new THREE.Mesh(shieldGeo, shieldMat);
            shield.name = `defenseWall-${s}`;
            
            this.shieldGroup.add(shield);
        }
    }

    setThreatState(isThreat) {
        this.isThreatState = isThreat;

        // Transitions security defense walls to Infrared Red or Mint Green dynamically!
        this.shieldGroup.children.forEach((wall, idx) => {
            if (isThreat) {
                wall.material.color.setHex(0xef4444); // Incident alert
                wall.material.opacity = 0.28 - idx * 0.06; // Flash visibility
            } else {
                wall.material.color.setHex(0x00ff88); // Baseline stable
                wall.material.opacity = 0.12 - idx * 0.03; // Reset transparency
            }
        });
    }

    getDatabaseThemeColor(dbId) {
        const mappings = {
            oracle: 0xffcc00,
            postgres: 0x06b6d4,
            mysql: 0x06b6d4,
            sqlserver: 0xe2e8f0,
            mongodb: 0x00ff88,
            cassandra: 0xffcc00,
            neo4j: 0x8b5cf6,
            dynamodb: 0xff6600,
            redis: 0xff6600,
            firebase: 0xff6600,
            supabase: 0xff6600,
            pinecone: 0x8b5cf6,
            weaviate: 0x8b5cf6,
            elasticsearch: 0x06b6d4,
            snowflake: 0xe2e8f0,
            bigquery: 0xff3b30,
            s3: 0xff3b30
        };
        return mappings[dbId] || 0x8b5cf6;
    }

    buildConstellationMap() {
        const count = 1200;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const palette = [
            new THREE.Color(0x8b5cf6),
            new THREE.Color(0x06b6d4),
            new THREE.Color(0x10b981)
        ];

        for (let i = 0; i < count; i++) {
            const radius = 90 + Math.random() * 50;
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = 10 + radius * Math.sin(phi) * Math.sin(theta) * 0.6;
            positions[i * 3 + 2] = radius * Math.cos(phi);

            const color = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.3, 'rgba(139, 92, 246, 0.8)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
        const texture = new THREE.CanvasTexture(canvas);

        const mat = new THREE.PointsMaterial({
            size: 2.0,
            vertexColors: true,
            map: texture,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const points = new THREE.Points(geom, mat);
        this.constellationGroup.add(points);

        const sweepGeo = new THREE.RingGeometry(0.1, 85, 32);
        const sweepMat = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.05,
            wireframe: true
        });
        this.constellationSweep = new THREE.Mesh(sweepGeo, sweepMat);
        this.constellationSweep.rotation.x = Math.PI / 2;
        this.constellationSweep.position.y = 15;
        this.constellationGroup.add(this.constellationSweep);
    }

    buildDataVortex() {
        const ringCount = 10;
        for (let r = 0; r < ringCount; r++) {
            const rad = 25 + r * 11;
            const geom = new THREE.RingGeometry(rad - 0.2, rad + 0.2, 64);
            const mat = new THREE.MeshBasicMaterial({
                color: r % 2 === 0 ? 0x8b5cf6 : 0x06b6d4,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.16 - r * 0.015
            });
            const mesh = new THREE.Mesh(geom, mat);
            mesh.rotation.x = Math.PI / 2;
            mesh.position.y = 4 + r * 3;
            mesh.name = "vortexRing";
            mesh.userData = { speed: (r % 2 === 0 ? 1 : -1) * (0.04 + r * 0.015) };
            this.vortexGroup.add(mesh);
        }

        const chGeo = new THREE.CylinderGeometry(8, 8, 30, 16, 1, true);
        const chMat = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            wireframe: true,
            transparent: true,
            opacity: 0.12
        });
        this.vortexChamber = new THREE.Mesh(chGeo, chMat);
        this.vortexChamber.position.set(0, 15, 0);
        this.vortexGroup.add(this.vortexChamber);
    }

    createHoloText(text, colorHex) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(15, 17, 21, 0.8)';
        ctx.fillRect(10, 10, 236, 44);

        ctx.strokeStyle = `#${colorHex.toString(16).padStart(6, '0')}`;
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, 236, 44);

        ctx.fillStyle = ctx.strokeStyle;
        ctx.fillRect(8, 8, 14, 4);
        ctx.fillRect(8, 8, 4, 14);
        ctx.fillRect(234, 8, 14, 4);
        ctx.fillRect(244, 8, 4, 14);

        ctx.font = 'bold 15px "Orbitron", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text.toUpperCase(), 128, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(22, 5.5, 1);
        return sprite;
    }

    setViewMode(view) {
        this.activeView = view;
        if (view === 'galaxy') {
            this.galaxyGroup.visible = true;
            this.constellationGroup.visible = false;
            this.vortexGroup.visible = false;
            this.shieldGroup.visible = true;
            this.gridFloor.visible = true;
        } else if (view === 'constellation') {
            this.galaxyGroup.visible = false;
            this.constellationGroup.visible = true;
            this.vortexGroup.visible = false;
            this.shieldGroup.visible = false;
            this.gridFloor.visible = false;
        } else {
            this.galaxyGroup.visible = false;
            this.constellationGroup.visible = false;
            this.vortexGroup.visible = true;
            this.shieldGroup.visible = true;
            this.gridFloor.visible = true;
        }
    }

    setActiveDatabase(db) {
        this.activeDatabase = db;

        Object.keys(this.nodeObjects).forEach((key) => {
            const group = this.nodeObjects[key];
            const mesh = group.children[0];
            if (mesh && mesh.material) {
                mesh.material.emissiveIntensity = 0.08;
            }
        });

        const activeGroup = this.nodeObjects[db];
        if (activeGroup) {
            const activeMesh = activeGroup.children[0];
            if (activeMesh && activeMesh.material) {
                activeMesh.material.emissive = new THREE.Color(this.getDatabaseThemeColor(db));
                activeMesh.material.emissiveIntensity = 0.95;
            }

            // Position and pulse skyward data beam!
            const pos = this.getNodePosition(db);
            this.dataBeam.position.set(pos.x, 130, pos.z);
            this.beamMat.color.setHex(this.getDatabaseThemeColor(db));
            this.beamMat.opacity = 0.45;

            if (window.gsap) {
                this.dataBeam.scale.set(0.05, 1.0, 0.05);
                gsap.killTweensOf(this.dataBeam.scale);
                gsap.killTweensOf(this.beamMat);
                gsap.to(this.dataBeam.scale, {
                    x: 1.0,
                    z: 1.0,
                    duration: 1.0,
                    ease: "elastic.out(1, 0.4)"
                });
                gsap.to(this.beamMat, {
                    opacity: 0.15,
                    duration: 2.2,
                    ease: "power2.out"
                });
            }
        }
    }

    spawnShockwave(dbId) {
        const pos = this.getNodePosition(dbId);
        const themeColor = this.getDatabaseThemeColor(dbId);

        const waveGroup = new THREE.Group();
        waveGroup.position.copy(pos);
        waveGroup.position.y = 1.0; // slightly above floor
        waveGroup.rotation.x = Math.PI / 2; // Flat on floor

        // Create shockwave ring
        const ringGeo = new THREE.RingGeometry(0.1, 1.0, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: themeColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const ring = new THREE.Mesh(ringGeo, ringMat);
        waveGroup.add(ring);
        this.shockwaveGroup.add(waveGroup);

        if (window.gsap) {
            gsap.to(ring.scale, {
                x: 18.0,
                y: 18.0,
                duration: 1.4,
                ease: "power1.out"
            });
            gsap.to(ringMat, {
                opacity: 0.0,
                duration: 1.4,
                ease: "power1.out",
                onComplete: () => {
                    waveGroup.remove(ring);
                    this.shockwaveGroup.remove(waveGroup);
                    ringGeo.dispose();
                    ringMat.dispose();
                }
            });
        } else {
            setTimeout(() => {
                this.shockwaveGroup.remove(waveGroup);
                ringGeo.dispose();
                ringMat.dispose();
            }, 1400);
        }
    }

    getNodePosition(id) {
        return this.nodesList[id] || new THREE.Vector3(0, 25, 0);
    }

    update(deltaTime) {
        this.time += deltaTime;

        // Rotate neural core
        this.coreMesh.rotation.y += deltaTime * 0.15;
        this.coreMesh.rotation.x += deltaTime * 0.08;

        // Core rings
        this.ring1.rotation.z += deltaTime * 0.2;
        this.ring2.rotation.z -= deltaTime * 0.35;

        // Spin the focused skyward data beam
        if (this.dataBeam) {
            this.dataBeam.rotation.y += deltaTime * 0.4;
        }

        // Animate defensive wall slow rotations
        if (this.shieldGroup.visible) {
            this.shieldGroup.children.forEach((shield, idx) => {
                shield.rotation.y += (idx % 2 === 0 ? 1 : -1) * deltaTime * 0.03;
                if (this.isThreatState) {
                    // Flash opacity during incident alerts (violent crimson waves)
                    shield.material.opacity = (0.28 - idx * 0.06) * (1.0 + Math.sin(this.time * 14) * 0.45);
                } else {
                    // Soft ripple opacity in baseline green state
                    shield.material.opacity = (0.12 - idx * 0.03) * (1.0 + Math.sin(this.time * 1.8 + idx) * 0.18);
                }
            });
        }

        // Animate database specialized skyscraper models
        if (this.galaxyGroup.visible) {
            Object.keys(this.nodeObjects).forEach((key) => {
                const group = this.nodeObjects[key];
                
                // Spin main tower tower
                if (group.children[0]) {
                    group.children[0].rotation.y += deltaTime * 0.18;
                }

                // Blink antennas beacons
                const beacon = group.getObjectByName("beacon");
                if (beacon) {
                    beacon.material.opacity = 0.3 + Math.sin(this.time * 8.0 + (group.position.x % 7.2)) * 0.7;
                }

                // Rotate satellite shards
                const shards = group.getObjectByName("satelliteShards");
                if (shards) {
                    shards.rotation.y += deltaTime * 0.85;
                    shards.children.forEach((shard, sIdx) => {
                        shard.position.y = (shard.userData.originalY || shard.position.y);
                        if (!shard.userData.originalY) shard.userData.originalY = shard.position.y;
                        shard.position.y += Math.sin(this.time * 3.2 + sIdx) * 0.14;
                    });
                }
                
                // Oracle Torus rings rotation
                if (key === 'oracle') {
                    const rings = group.getObjectByName("oracleRings");
                    if (rings) {
                        rings.children[0].rotation.z += deltaTime * 0.8;
                        rings.children[1].rotation.x -= deltaTime * 0.5;
                    }
                }
                
                // MongoDB organic wiggles
                else if (key === 'mongodb') {
                    const nodes = group.getObjectByName("mongoNodes");
                    if (nodes) {
                        nodes.rotation.y += deltaTime * 0.4;
                        nodes.position.y = Math.sin(this.time * 2.0) * 0.8;
                    }
                }

                // Postgres grid vertical wave oscillations
                else if (key === 'postgres') {
                    const pg = group.getObjectByName("postgresGrid");
                    if (pg) {
                        pg.position.y = Math.sin(this.time * 3.0) * 0.5;
                    }
                }

                // Redis memory lightning spinners
                else if (key === 'redis') {
                    const light = group.getObjectByName("redisLightning");
                    if (light) {
                        light.rotation.y += deltaTime * 1.5;
                        light.children.forEach((r, i) => {
                            r.position.y = Math.sin(this.time * 5 + i) * 1.5;
                        });
                    }
                }

                // Firebase cloud charge shifts
                else if (key === 'firebase') {
                    const storm = group.getObjectByName("firebaseCloud");
                    if (storm) {
                        storm.rotation.z += deltaTime * 0.2;
                        storm.children.forEach((c, idx) => {
                            c.position.multiplyScalar(1.0 + Math.sin(this.time * 6 + idx) * 0.005);
                        });
                    }
                }

                // Neo4j relationships breathing grow/shrink expansions
                else if (key === 'neo4j') {
                    const g = group.getObjectByName("neo4jGraph");
                    if (g) {
                        const scale = 1.0 + Math.sin(this.time * 1.5) * 0.15;
                        g.scale.set(scale, scale, scale);
                    }
                }

                // Snowflake crystalline spin
                else if (key === 'snowflake') {
                    const ice = group.getObjectByName("snowflakeCrystals");
                    if (ice) {
                        ice.rotation.x += deltaTime * 0.3;
                        ice.rotation.z -= deltaTime * 0.25;
                    }
                }
            });
        }

        // Animate constellation sweep
        if (this.constellationGroup.visible) {
            this.constellationSweep.rotation.z += deltaTime * 0.25;
        }

        // Spin vortex
        if (this.vortexGroup.visible) {
            this.vortexChamber.rotation.y += deltaTime * 0.6;
            this.vortexGroup.children.forEach((child) => {
                if (child.name === "vortexRing") {
                    child.rotation.z += child.userData.speed * deltaTime;
                }
            });
        }
    }
}
