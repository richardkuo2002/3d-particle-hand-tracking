import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particleCount = 20000;
        this.particles = null;
        this.geometry = null;
        this.material = null;
        this.currentShape = 'heart';
        this.targetPositions = new Float32Array(this.particleCount * 3);
        this.colors = new Float32Array(this.particleCount * 3);
        this.baseColor = new THREE.Color(0xff0055);

        this.init();
    }

    init() {
        this.geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);

        // Initial random positions
        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

            this.colors[i * 3] = this.baseColor.r;
            this.colors[i * 3 + 1] = this.baseColor.g;
            this.colors[i * 3 + 2] = this.baseColor.b;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

        // Create a soft glow texture programmatically
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);

        const sprite = new THREE.CanvasTexture(canvas);

        this.material = new THREE.PointsMaterial({
            size: 0.2, // Slightly larger for better visibility
            vertexColors: true,
            map: sprite,
            alphaTest: 0.01, // Lower alpha test
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false // Better for transparent particles
        });

        this.particles = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.particles);

        this.setShape('heart');
    }

    setShape(shapeType) {
        this.currentShape = shapeType;
        let positions;

        switch (shapeType) {
            case 'heart':
                positions = this.generateHeart();
                break;
            case 'flower':
                positions = this.generateFlower();
                break;
            case 'saturn':
                positions = this.generateSaturn();
                break;
            case 'buddha':
                positions = this.generateBuddha();
                break;
            case 'fireworks':
                positions = this.generateFireworks();
                break;
            default:
                positions = this.generateHeart();
        }

        // Update target positions
        for (let i = 0; i < this.particleCount * 3; i++) {
            this.targetPositions[i] = positions[i];
        }
    }

    setColor(hexColor) {
        this.baseColor.set(hexColor);
        const colorAttribute = this.geometry.attributes.color;

        for (let i = 0; i < this.particleCount; i++) {
            // Add slight variation
            const variation = Math.random() * 0.2 - 0.1;
            colorAttribute.array[i * 3] = Math.max(0, Math.min(1, this.baseColor.r + variation));
            colorAttribute.array[i * 3 + 1] = Math.max(0, Math.min(1, this.baseColor.g + variation));
            colorAttribute.array[i * 3 + 2] = Math.max(0, Math.min(1, this.baseColor.b + variation));
        }
        colorAttribute.needsUpdate = true;
    }

    update(interactionValue = 0) {
        const positions = this.geometry.attributes.position.array;
        const speed = 0.1;

        // Interaction value (0 to 1) controls expansion/explosion
        // 0 = normal shape, 1 = fully expanded/exploded
        const expansionFactor = 1 + interactionValue * 2.0;

        for (let i = 0; i < this.particleCount; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            let tx = this.targetPositions[ix] * expansionFactor;
            let ty = this.targetPositions[iy] * expansionFactor;
            let tz = this.targetPositions[iz] * expansionFactor;

            // Add some noise/jitter based on interaction
            if (interactionValue > 0.1) {
                tx += (Math.random() - 0.5) * interactionValue;
                ty += (Math.random() - 0.5) * interactionValue;
                tz += (Math.random() - 0.5) * interactionValue;
            }

            // Lerp towards target
            positions[ix] += (tx - positions[ix]) * speed;
            positions[iy] += (ty - positions[iy]) * speed;
            positions[iz] += (tz - positions[iz]) * speed;
        }

        this.geometry.attributes.position.needsUpdate = true;

        // Rotate the whole system slowly
        this.particles.rotation.y += 0.002;
    }

    // Shape Generators

    generateHeart() {
        const positions = new Float32Array(this.particleCount * 3);
        for (let i = 0; i < this.particleCount; i++) {
            const t = Math.random() * Math.PI * 2;
            const u = Math.random() * Math.PI * 2; // Random distribution for volume

            // Heart curve equation
            // x = 16sin^3(t)
            // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
            // z = thickness

            // Re-distribute t to avoid bunching at poles if using sphere logic, but here simple random is okay for volume
            // Let's use a rejection sampling or just simple parametric with noise for volume

            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            const z = (Math.random() - 0.5) * 5; // Thickness

            // Scale down
            const scale = 0.2;
            positions[i * 3] = x * scale;
            positions[i * 3 + 1] = y * scale;
            positions[i * 3 + 2] = z * scale;
        }
        return positions;
    }

    generateFlower() {
        const positions = new Float32Array(this.particleCount * 3);
        for (let i = 0; i < this.particleCount; i++) {
            const u = Math.random() * Math.PI * 2;
            const v = Math.random() * Math.PI;

            // Rose curve / Flower shape
            const k = 5; // Number of petals
            const r = Math.cos(k * u);

            // Map to 3D sphere-like coords but modulated by r
            const x = r * Math.sin(v) * Math.cos(u) * 4;
            const y = r * Math.sin(v) * Math.sin(u) * 4;
            const z = r * Math.cos(v) * 2;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }
        return positions;
    }

    generateSaturn() {
        const positions = new Float32Array(this.particleCount * 3);
        const ringCount = Math.floor(this.particleCount * 0.7);
        const sphereCount = this.particleCount - ringCount;

        // Planet
        for (let i = 0; i < sphereCount; i++) {
            const u = Math.random() * Math.PI * 2;
            const v = Math.acos(2 * Math.random() - 1);
            const r = 2.5;

            positions[i * 3] = r * Math.sin(v) * Math.cos(u);
            positions[i * 3 + 1] = r * Math.sin(v) * Math.sin(u);
            positions[i * 3 + 2] = r * Math.cos(v);
        }

        // Rings
        for (let i = sphereCount; i < this.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const innerRadius = 3.5;
            const outerRadius = 6.0;
            const r = innerRadius + Math.random() * (outerRadius - innerRadius);

            positions[i * 3] = r * Math.cos(angle);
            positions[i * 3 + 1] = (Math.random() - 0.5) * 0.2; // Thinness
            positions[i * 3 + 2] = r * Math.sin(angle);
        }
        return positions;
    }

    generateBuddha() {
        // Simplified "Meditating Figure" using primitives
        // Head (Sphere), Body (Cone/Sphere), Legs (Cylinders/Ovals)
        const positions = new Float32Array(this.particleCount * 3);

        for (let i = 0; i < this.particleCount; i++) {
            const r = Math.random();
            let x, y, z;

            if (r < 0.2) {
                // Head
                const u = Math.random() * Math.PI * 2;
                const v = Math.acos(2 * Math.random() - 1);
                const rad = 1.2;
                x = rad * Math.sin(v) * Math.cos(u);
                y = rad * Math.sin(v) * Math.sin(u) + 2.5; // Offset up
                z = rad * Math.cos(v);
            } else if (r < 0.6) {
                // Body (Torso)
                const u = Math.random() * Math.PI * 2;
                const v = Math.acos(2 * Math.random() - 1);
                const rad = 2.0;
                // Squash sphere for body
                x = rad * Math.sin(v) * Math.cos(u) * 1.2;
                y = rad * Math.sin(v) * Math.sin(u) * 1.5 - 0.5;
                z = rad * Math.cos(v) * 1.0;
            } else {
                // Legs / Base (Lotus position approximation - flattened wide ellipsoid)
                const u = Math.random() * Math.PI * 2;
                const v = Math.acos(2 * Math.random() - 1);
                const rad = 3.0;
                x = rad * Math.sin(v) * Math.cos(u) * 1.5;
                y = rad * Math.sin(v) * Math.sin(u) * 0.5 - 2.5;
                z = rad * Math.cos(v) * 1.5;
            }

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }
        return positions;
    }

    generateFireworks() {
        const positions = new Float32Array(this.particleCount * 3);
        // Sphere distribution but with trails? 
        // For static shape, just a large sphere or starburst
        for (let i = 0; i < this.particleCount; i++) {
            const u = Math.random() * Math.PI * 2;
            const v = Math.acos(2 * Math.random() - 1);
            // Random radius for volume explosion
            const r = Math.random() * 8;

            positions[i * 3] = r * Math.sin(v) * Math.cos(u);
            positions[i * 3 + 1] = r * Math.sin(v) * Math.sin(u);
            positions[i * 3 + 2] = r * Math.cos(v);
        }
        return positions;
    }
}
