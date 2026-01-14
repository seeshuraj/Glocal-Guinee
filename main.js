import * as THREE from 'three';
import { gsap } from 'gsap';
import { Scene } from './src/Scene.js';
import { Assets } from './src/Assets.js';
import { Physics } from './src/Physics.js';
import { Particles } from './src/Particles.js';

class ProductViewer {
    constructor(containerId, assets) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.assets = assets;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 100);
        this.camera.position.z = 10;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);

        this.setupLights();
        this.currentMesh = null;
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };

        this.initInteractions();
    }

    setupLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambient);
        const point = new THREE.PointLight(0x8a4fff, 2, 50);
        point.position.set(5, 5, 5);
        this.scene.add(point);
    }

    setProduct(type) {
        if (this.currentMesh) this.scene.remove(this.currentMesh);

        switch (type) {
            case 'sesame':
                this.currentMesh = this.assets.createSesame();
                this.currentMesh.scale.set(4, 4, 4);
                break;
            case 'cashew':
                this.currentMesh = this.assets.createCashew();
                this.currentMesh.scale.set(3, 3, 3);
                break;
            case 'cocoa':
                this.currentMesh = this.assets.createCocoa();
                this.currentMesh.scale.set(2, 2, 2);
                break;
        }

        if (this.currentMesh) {
            this.scene.add(this.currentMesh);
            gsap.from(this.currentMesh.scale, { x: 0, y: 0, z: 0, duration: 0.5, ease: "back.out" });
        }
    }

    initInteractions() {
        this.container.addEventListener('mousedown', () => this.isDragging = true);
        window.addEventListener('mouseup', () => this.isDragging = false);
        this.container.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.currentMesh) {
                const deltaMove = {
                    x: e.offsetX - this.previousMousePosition.x,
                    y: e.offsetY - this.previousMousePosition.y
                };
                this.currentMesh.rotation.y += deltaMove.x * 0.01;
                this.currentMesh.rotation.x += deltaMove.y * 0.01;
            }
            this.previousMousePosition = { x: e.offsetX, y: e.offsetY };
        });
    }

    render() {
        if (this.currentMesh && !this.isDragging) {
            this.currentMesh.rotation.y += 0.005;
        }
        this.renderer.render(this.scene, this.camera);
    }
}

class App {
    constructor() {
        this.scene = new Scene();
        this.assets = new Assets(this.scene.scene);
        this.physics = new Physics();
        this.particles = new Particles(this.scene.scene);

        this.cashews = [];
        this.mouse = new THREE.Vector2();
        this.productViewer = null;

        this.init();
    }

    init() {
        // Initialize AOS
        if (window.AOS) {
            window.AOS.init({
                duration: 800,
                offset: 50,
                once: false
            });
        }

        this.assets.createLandscape();
        this.setupInteractions();
        this.setupFAQ();
        this.setupScrollEffects();

        // Initialize Product Viewer
        this.productViewer = new ProductViewer('product-360-viewer', this.assets);
        this.productViewer.setProduct('cashew');

        this.animate();

        // Remove loading screen
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => loadingScreen.remove(), 1000);
            }
        }, 1500);
    }

    setupInteractions() {
        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const nav = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });

        // CTA interactions
        const mainCta = document.getElementById('main-cta');
        if (mainCta) {
            mainCta.addEventListener('click', () => {
                document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Product selection
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('click', () => {
                const product = card.getAttribute('data-product');
                this.productViewer.setProduct(product);

                // Scroll to viewer
                document.getElementById('product-360-viewer').scrollIntoView({ behavior: 'smooth' });
            });
        });

        // Counter animation
        this.setupCounters();
    }

    setupCounters() {
        const counters = document.querySelectorAll('.counter');
        const options = { threshold: 1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-target'));
                    gsap.to(entry.target, {
                        innerText: target,
                        duration: 2,
                        snap: { innerText: 1 },
                        ease: "power2.out"
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        counters.forEach(counter => observer.observe(counter));
    }

    setupFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            item.addEventListener('click', () => {
                const answer = item.querySelector('.faq-answer');
                const isOpen = item.classList.contains('active');

                // Close others
                faqItems.forEach(i => {
                    i.classList.remove('active');
                    i.querySelector('.faq-answer').style.maxHeight = null;
                });

                if (!isOpen) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + "px";
                }
            });
        });
    }

    setupScrollEffects() {
        // Parallax for hero content
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                heroContent.style.opacity = 1 - (scrolled / 500);
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Simple rotation for some basic 3D elements if they were in view
        if (this.productViewer) this.productViewer.render();

        this.scene.render();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
