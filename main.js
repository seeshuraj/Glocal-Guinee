import * as THREE from 'three';
import { gsap } from 'gsap';
import { Scene } from './src/Scene.js';
import { Assets } from './src/Assets.js';
import { Physics } from './src/Physics.js';
import { Particles } from './src/Particles.js';

class App {
    constructor() {
        this.scene = new Scene();
        this.assets = new Assets(this.scene.scene);
        this.physics = new Physics();
        this.particles = new Particles(this.scene.scene);

        this.cashews = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.init();
    }

    init() {
        this.assets.createLandscape();
        this.setupInteractions();
        this.spawnLoop();
        this.animate();

        // Remove loading screen after a short delay
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => loadingScreen.remove(), 1000);
            }
        }, 2000);
    }

    setupInteractions() {
        window.addEventListener('mousedown', (e) => this.onClick(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('wheel', (e) => this.onScroll(e));

        // Custom CTA interaction
        const mainCta = document.getElementById('main-cta');
        if (mainCta) {
            mainCta.addEventListener('mouseenter', () => {
                gsap.to(mainCta, { scale: 1.05, duration: 0.3 });
            });
            mainCta.addEventListener('mouseleave', () => {
                gsap.to(mainCta, { scale: 1, duration: 0.3 });
            });
        }

        // Contact Overlay
        const floatingCta = document.getElementById('floating-cta');
        const contactOverlay = document.getElementById('contact-overlay');
        const closeOverlay = document.querySelector('.close-overlay');

        if (floatingCta && contactOverlay) {
            floatingCta.addEventListener('click', () => {
                contactOverlay.style.display = 'flex';
                gsap.from('.overlay-content', { scale: 0.8, opacity: 0, duration: 0.5, ease: "back.out(1.7)" });
            });
        }

        if (closeOverlay && contactOverlay) {
            closeOverlay.addEventListener('click', () => {
                gsap.to('.overlay-content', {
                    scale: 0.8, opacity: 0, duration: 0.3, onComplete: () => {
                        contactOverlay.style.display = 'none';
                    }
                });
            });
        }
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        if (event.buttons === 1) { // Left-click dragging
            this.influenceCashews();
        }
    }

    influenceCashews() {
        const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
        vector.unproject(this.scene.camera);
        const dir = vector.sub(this.scene.camera.position).normalize();
        const distance = -this.scene.camera.position.z / dir.z;
        const mouseWorldPos = this.scene.camera.position.clone().add(dir.multiplyScalar(distance));

        this.cashews.forEach(c => {
            const dist = c.pos.distanceTo(mouseWorldPos);
            if (dist < 15) {
                // Apply a repulsion/attraction force
                const force = c.pos.clone().sub(mouseWorldPos).normalize().multiplyScalar(0.5 / (dist + 1));
                c.pos.add(force);
            }
        });
    }

    onClick(event) {
        // Calculate mouse position in normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Spawn a cashew at mouse position
        const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
        vector.unproject(this.scene.camera);
        const dir = vector.sub(this.scene.camera.position).normalize();
        const distance = -this.scene.camera.position.z / dir.z;
        const pos = this.scene.camera.position.clone().add(dir.multiplyScalar(distance));

        this.spawnCashew(pos);
    }

    onScroll(event) {
        // Adjust gravity based on scroll
        const delta = event.deltaY * 0.001;
        const currentGravity = this.physics.gravity;
        const newGravity = Math.max(-20, Math.min(5, currentGravity + delta));
        this.physics.setGravity(newGravity);

        // Update UI stat
        const gravLabel = document.querySelector('.stat-item:nth-child(2) .stat-value');
        if (gravLabel) {
            gravLabel.textContent = Math.abs(newGravity).toFixed(1);
        }
    }

    spawnCashew(position = null) {
        const cashew = this.assets.createCashew();
        if (position) {
            cashew.position.copy(position);
        } else {
            // Random spawn from "trees" or ground level
            cashew.position.set(
                (Math.random() - 0.5) * 50,
                0,
                (Math.random() - 0.5) * 50
            );
        }

        cashew.scale.set(0, 0, 0);
        this.scene.scene.add(cashew);

        gsap.to(cashew.scale, {
            x: 0.5, y: 0.5, z: 0.5,
            duration: 0.5,
            ease: "back.out(1.7)"
        });

        const initialVelocity = {
            x: (Math.random() - 0.5) * 0.1,
            y: 0.2 + Math.random() * 0.2, // Start with some initial upward boost
            z: (Math.random() - 0.5) * 0.1
        };

        const physObj = this.physics.addObject(cashew, initialVelocity);
        this.cashews.push(physObj);
    }

    spawnLoop() {
        setInterval(() => {
            if (this.cashews.length < 50) {
                this.spawnCashew();
            }
        }, 3000);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.physics.update();
        this.particles.update();

        // Occasional particles from cashews
        if (Math.random() > 0.8) {
            this.cashews.forEach(c => {
                if (Math.random() > 0.95) {
                    this.particles.createTrail(c.mesh.position);
                }
            });
        }

        // Cleanup cashews that are too high
        for (let i = this.cashews.length - 1; i >= 0; i--) {
            if (this.cashews[i].pos.y > 60) {
                this.scene.scene.remove(this.cashews[i].mesh);
                this.cashews.splice(i, 1);
            }
        }

        this.scene.render();
    }
}

new App();
