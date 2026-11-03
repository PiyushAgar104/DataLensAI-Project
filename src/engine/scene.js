import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`WebGL canvas container #${containerId} not found.`);
        }

        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        // 1. Create WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Advanced Filmic Tone Mapping for premium visual glow
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;

        this.container.appendChild(this.renderer.domElement);

        // 2. Create Scene
        this.scene = new THREE.Scene();
        // Gleaming premium alabaster silver background with exp2 fog
        this.scene.background = new THREE.Color(0xf5f7fa);
        this.scene.fog = new THREE.FogExp2(0xf5f7fa, 0.0032);

        // 3. Create Camera
        this.camera = new THREE.PerspectiveCamera(55, this.width / this.height, 0.1, 1000);
        this.camera.position.set(0, 90, 165);

        // 4. Create OrbitControls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.04;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera clipping below grid
        this.controls.minDistance = 25;
        this.controls.maxDistance = 380;

        // 5. Setup Lighting Rig
        this.setupLights();

        // 6. Immersive Starfield Background System (Parallax effect)
        this.buildParallaxBackground();

        // Auto spin default state
        this.autoRotate = true;

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    setupLights() {
        // High-tech bright cleanroom ambient light
        const ambientLight = new THREE.AmbientLight(0xf5f7fa, 2.4);
        this.scene.add(ambientLight);

        // Neon Electric Violet spotlight (AI Energy Core highlight)
        this.spotLight1 = new THREE.DirectionalLight(0x7c3aed, 2.5);
        this.spotLight1.position.set(60, 120, 30);
        this.spotLight1.castShadow = true;
        this.spotLight1.shadow.mapSize.width = 1024;
        this.spotLight1.shadow.mapSize.height = 1024;
        this.scene.add(this.spotLight1);

        // Neon Quantum Cyan key light
        this.spotLight2 = new THREE.DirectionalLight(0x0891b2, 1.8);
        this.spotLight2.position.set(-60, 90, -30);
        this.scene.add(this.spotLight2);

        // Pulsing Pointlight in the central coordinate well
        this.coreLight = new THREE.PointLight(0x7c3aed, 4.5, 130);
        this.coreLight.position.set(0, 20, 0);
        this.scene.add(this.coreLight);
    }

    buildParallaxBackground() {
        // Starfield background consisting of 600 stars rotating slowly
        const count = 600;
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Distribute on an outer shell of radius 300 to 400
            const radius = 280 + Math.random() * 120;
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            sizes[i] = 1.0 + Math.random() * 2.5;
        }

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Create round glowing star texture
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.4, 'rgba(139, 92, 246, 0.6)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
        const texture = new THREE.CanvasTexture(canvas);

        const mat = new THREE.PointsMaterial({
            size: 2.0,
            map: texture,
            transparent: true,
            opacity: 0.6,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.starfield = new THREE.Points(geom, mat);
        this.scene.add(this.starfield);
    }

    setAutoRotate(active) {
        this.autoRotate = active;
    }

    resetCamera() {
        this.camera.position.set(0, 90, 165);
        this.controls.target.set(0, 10, 0);
        this.controls.update();
    }

    onWindowResize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
    }

    update(deltaTime) {
        if (this.autoRotate) {
            // Orbit camera around central Neural Core targets
            const theta = deltaTime * 0.035;
            const x = this.camera.position.x;
            const z = this.camera.position.z;
            this.camera.position.x = x * Math.cos(theta) - z * Math.sin(theta);
            this.camera.position.z = x * Math.sin(theta) + z * Math.cos(theta);
        }

        // Slowly rotate starfield in reverse direction for deep space parallax!
        if (this.starfield) {
            this.starfield.rotation.y -= deltaTime * 0.008;
            this.starfield.rotation.x += deltaTime * 0.003;
        }

        // Pulsate pointlight core glow
        const time = Date.now() * 0.001;
        this.coreLight.intensity = 3.0 + Math.sin(time * 4) * 1.2;

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
