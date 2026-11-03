import * as THREE from 'three';

export class ParticleController {
    constructor(scene, galaxy) {
        this.scene = scene;
        this.galaxy = galaxy;
        this.particles = [];
        this.maxParticles = 1200; // High-density bioluminescent flows

        // Assigned premium materials
        this.materials = {
            violet: new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.95 }),
            cyan: new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.9 }),
            emerald: new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.9 }),
            amber: new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.9 }),
            coral: new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 1.0 })
        };

        // Geometries matching color trails
        this.geometries = {
            violet: new THREE.SphereGeometry(0.65, 8, 8),     // Bio pulse capsules
            cyan: new THREE.SphereGeometry(0.7, 8, 8),        // Transaction bubbles
            emerald: new THREE.BoxGeometry(0.6, 0.6, 0.6),      // Data packets
            amber: new THREE.TorusGeometry(1.0, 0.12, 6, 12), // Orbiting connection rings
            coral: new THREE.OctahedronGeometry(1.2, 0)       // Threat warning diamonds
        };

        // Build background bioluminescent cellular rain
        this.buildCellularRain();
    }

    buildCellularRain() {
        const count = 180;
        this.snowPositions = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            this.snowPositions[i * 3] = (Math.random() - 0.5) * 220;
            this.snowPositions[i * 3 + 1] = Math.random() * 110;
            this.snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 220;
        }
        
        this.snowGeom = new THREE.BufferGeometry();
        this.snowGeom.setAttribute('position', new THREE.BufferAttribute(this.snowPositions, 3));
        
        // Soft glowing cell sprite
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.9)'); // Cyan core
        grad.addColorStop(0.4, 'rgba(139, 92, 246, 0.4)'); // Violet halo
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
        const texture = new THREE.CanvasTexture(canvas);
        
        this.snowMat = new THREE.PointsMaterial({
            size: 1.6,
            map: texture,
            transparent: true,
            opacity: 0.42,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.snowPoints = new THREE.Points(this.snowGeom, this.snowMat);
        this.scene.add(this.snowPoints);
    }

    spawnParticle(eventData) {
        if (this.particles.length >= this.maxParticles) {
            const old = this.particles.shift();
            this.scene.remove(old.mesh);
        }

        const nodesKeys = Object.keys(this.galaxy.nodesList);
        if (nodesKeys.length === 0) return;

        const targetId = nodesKeys[eventData.nodeIndex % nodesKeys.length];
        const nodePos = this.galaxy.getNodePosition(targetId).clone();
        
        let pMesh;
        const type = eventData.type;
        const view = this.galaxy.activeView;

        let pData = {
            type: type,
            age: 0,
            life: 2.2 + Math.random() * 1.5,
            speed: eventData.speed,
            view: view,
            noiseOffset: Math.random() * Math.PI * 2 // custom seed for wiggling
        };

        if (view === 'galaxy') {
            if (type === 'coral') {
                pMesh = new THREE.Mesh(this.geometries.coral, this.materials.coral);
                pMesh.position.set(nodePos.x, 80, nodePos.z);
                pData.velocity = new THREE.Vector3(0, -pData.speed * 8, 0);
            }
            else if (type === 'violet') {
                // AI sweeps route along Bezier veins
                pMesh = new THREE.Mesh(this.geometries.violet, this.materials.violet);
                pMesh.position.set(0, 25, 0);
                pData.curve = new THREE.QuadraticBezierCurve3(
                    new THREE.Vector3(0, 25, 0),
                    new THREE.Vector3(nodePos.x * 0.35, 35, nodePos.z * 0.35),
                    nodePos
                );
            }
            else if (type === 'cyan') {
                // Bubbles rising from skyscrapers
                pMesh = new THREE.Mesh(this.geometries.cyan, this.materials.cyan);
                pMesh.position.copy(nodePos);
                pMesh.position.y += Math.random() * 5;
                pData.velocity = new THREE.Vector3(
                    (Math.random() - 0.5) * 3,
                    pData.speed * 4,
                    (Math.random() - 0.5) * 3
                );
            }
            else if (type === 'emerald') {
                // Client queries flow to core along curve
                pMesh = new THREE.Mesh(this.geometries.emerald, this.materials.emerald);
                pMesh.position.copy(nodePos);
                pData.curve = new THREE.QuadraticBezierCurve3(
                    nodePos,
                    new THREE.Vector3(nodePos.x * 0.5, 10, nodePos.z * 0.5),
                    new THREE.Vector3(0, 25, 0)
                );
            }
            else {
                // Amber connection rings orbit node
                pMesh = new THREE.Mesh(this.geometries.amber, this.materials.amber);
                pMesh.position.copy(nodePos);
                pMesh.position.y += 4 + Math.random() * 6;
                pMesh.rotation.x = Math.PI / 2;

                pData.center = nodePos.clone();
                pData.center.y = pMesh.position.y;
                pData.orbitRadius = 4 + Math.random() * 6;
                pData.orbitAngle = Math.random() * Math.PI * 2;
                pData.orbitSpeed = pData.speed * 1.6;
            }
        }
        else if (view === 'constellation') {
            pMesh = new THREE.Mesh(this.geometries.cyan, this.materials[type]);
            pMesh.position.set(
                (Math.random() - 0.5) * 140,
                15 + (Math.random() - 0.5) * 35,
                (Math.random() - 0.5) * 140
            );
            pData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * pData.speed * 6,
                (Math.random() - 0.5) * pData.speed * 2,
                (Math.random() - 0.5) * pData.speed * 6
            );
        }
        else {
            // Spiral vortex funnels in
            pMesh = new THREE.Mesh(this.geometries.cyan, this.materials[type]);
            const startAngle = Math.random() * Math.PI * 2;
            const startRad = 90 + Math.random() * 30;
            pMesh.position.set(
                Math.cos(startAngle) * startRad,
                20 + (Math.random() - 0.5) * 10,
                Math.sin(startAngle) * startRad
            );

            pData.vAngle = startAngle;
            pData.vRadius = startRad;
            pData.vHeight = pMesh.position.y;
            pData.vSpeed = 0.4 + Math.random() * 0.8;
        }

        pMesh.castShadow = true;
        this.scene.add(pMesh);

        pData.mesh = pMesh;
        this.particles.push(pData);
    }

    update(deltaTime) {
        const activeParticles = [];

        // 1. Animate background bioluminescent marine snow
        if (this.snowPoints) {
            const posArr = this.snowGeom.attributes.position.array;
            const count = posArr.length / 3;
            for (let i = 0; i < count; i++) {
                // Slowly float upwards and drift side-to-side
                posArr[i * 3 + 1] += deltaTime * 2.6; // vertical speed
                posArr[i * 3] += Math.sin(this.galaxy.time * 0.4 + i) * 0.05; // sway
                
                // Wrap around
                if (posArr[i * 3 + 1] > 110) {
                    posArr[i * 3 + 1] = 0;
                    posArr[i * 3] = (Math.random() - 0.5) * 220;
                    posArr[i * 3 + 2] = (Math.random() - 0.5) * 220;
                }
            }
            this.snowGeom.attributes.position.needsUpdate = true;
        }

        // 2. Animate flowing bio-energy particles
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.age += deltaTime;

            if (p.age >= p.life) {
                this.scene.remove(p.mesh);
                continue;
            }

            const lifeRatio = 1 - (p.age / p.life);

            if (p.view === 'galaxy') {
                if (p.type === 'coral' || p.type === 'cyan') {
                    p.mesh.position.addScaledVector(p.velocity, deltaTime);
                    
                    // Add organic biological double-sine wiggle to transaction bubbles
                    if (p.type === 'cyan') {
                        const wiggleX = Math.sin(p.age * 5.0 + p.noiseOffset) * 0.12 + Math.cos(p.age * 2.0 + p.noiseOffset) * 0.05;
                        const wiggleZ = Math.cos(p.age * 4.0 + p.noiseOffset) * 0.12 + Math.sin(p.age * 1.5 + p.noiseOffset) * 0.05;
                        p.mesh.position.x += wiggleX;
                        p.mesh.position.z += wiggleZ;
                    }
                } 
                else if ((p.type === 'violet' || p.type === 'emerald') && p.curve) {
                    const t = p.age / p.life;
                    const basePos = p.curve.getPointAt(t);
                    p.mesh.position.copy(basePos);
                    
                    // Add double-sine organic waving wiggles along double-helix veins!
                    const waveIntensity = 1.2 * lifeRatio;
                    const waveX = Math.sin(p.age * 7.0 + p.noiseOffset) * waveIntensity * 0.09 + Math.cos(p.age * 3.0 + p.noiseOffset) * waveIntensity * 0.04;
                    const waveZ = Math.cos(p.age * 7.0 + p.noiseOffset) * waveIntensity * 0.09 + Math.sin(p.age * 2.5 + p.noiseOffset) * waveIntensity * 0.04;
                    p.mesh.position.x += waveX;
                    p.mesh.position.z += waveZ;
                    
                    p.mesh.rotation.y += deltaTime * 4;
                }
                else if (p.type === 'amber' && p.center) {
                    p.orbitAngle += p.orbitSpeed * deltaTime;
                    p.mesh.position.x = p.center.x + Math.cos(p.orbitAngle) * p.orbitRadius;
                    p.mesh.position.z = p.center.z + Math.sin(p.orbitAngle) * p.orbitRadius;
                    p.mesh.rotation.z += deltaTime * 2;
                }
            }
            else if (p.view === 'constellation') {
                // Constellation mode star particles drift like bio-plankton
                p.mesh.position.addScaledVector(p.velocity, deltaTime);
                p.mesh.position.y += Math.sin(p.age * 2.0 + p.noiseOffset) * 0.08;
            }
            else {
                p.vAngle += p.vSpeed * deltaTime * (55 / p.vRadius);
                p.vRadius -= deltaTime * 24;
                p.vHeight = 20 + Math.sin(p.vAngle * 2) * 5;

                p.mesh.position.set(
                    Math.cos(p.vAngle) * p.vRadius,
                    p.vHeight,
                    Math.sin(p.vAngle) * p.vRadius
                );

                if (p.vRadius <= 3) {
                    this.scene.remove(p.mesh);
                    continue;
                }
            }

            const scale = 0.25 + lifeRatio * 0.75;
            p.mesh.scale.set(scale, scale, scale);

            activeParticles.push(p);
        }

        this.particles = activeParticles;
    }

    clearAll() {
        this.particles.forEach((p) => {
            this.scene.remove(p.mesh);
        });
        this.particles = [];
    }

    getCount() {
        return this.particles.length;
    }
}
