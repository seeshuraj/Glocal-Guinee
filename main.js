import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scene } from './src/Scene.js';
import { Assets } from './src/Assets.js';
import { Physics } from './src/Physics.js';
import { Particles } from './src/Particles.js';

gsap.registerPlugin(ScrollTrigger);

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

        // Remove loading screen FIRST
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    loadingScreen.remove();
                }, 500);
            }, 1000);
        }

        // Then initialize everything else
        try {
            this.assets.createLandscape();
        } catch (e) {
            console.log('3D assets disabled');
        }

        this.setupInteractions();
        this.setupFAQ();
        this.setupScrollEffects();

        // Robust GSAP Setup
        const initAnimations = () => {
            const heroTitle = document.getElementById('hero-title');
            if (heroTitle) {
                try {
                    this.setupGSAPAnimations();
                    console.log('GSAP Animations Initialized');
                } catch (e) {
                    console.error('GSAP Init Failed:', e);
                }
            } else {
                // Retry if DOM not ready
                requestAnimationFrame(initAnimations);
            }
        };
        initAnimations();

        this.animate();
    }

    setupGSAPAnimations() {
        // Text reveal animation for hero title
        const heroTitle = document.getElementById('hero-title');
        if (heroTitle) {
            const text = heroTitle.textContent;
            heroTitle.innerHTML = text.split('').map(char =>
                `<span class="char" style="display:inline-block;">${char === ' ' ? '&nbsp;' : char}</span>`
            ).join('');

            gsap.from(heroTitle.querySelectorAll('.char'), {
                y: 100,
                opacity: 0,
                duration: 0.8,
                ease: 'power4.out',
                stagger: 0.03,
                delay: 0.3
            });
        }

        // Hero subtitle fade in
        gsap.from('.hero-subtitle', {
            opacity: 0,
            y: 30,
            duration: 1,
            delay: 1.2,
            ease: 'power2.out'
        });

        // Hero description fade in
        gsap.from('.hero-description', {
            opacity: 0,
            y: 30,
            duration: 1,
            delay: 1.5,
            ease: 'power2.out'
        });

        // CTA button entrance
        gsap.from('.cta-primary', {
            opacity: 0,
            scale: 0.8,
            duration: 0.8,
            delay: 1.8,
            ease: 'back.out(1.7)'
        });

        // Section titles animation with ScrollTrigger
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles.forEach((title, index) => {
            gsap.fromTo(title,
                {
                    opacity: 0,
                    y: 50
                },
                {
                    scrollTrigger: {
                        trigger: title,
                        start: 'top 80%',
                        end: 'top 50%',
                        toggleActions: 'play none none reverse',
                        markers: false
                    },
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out'
                }
            );
        });

        // Product cards  with ScrollTrigger
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach((card, index) => {
            gsap.fromTo(card,
                {
                    opacity: 0,
                    y: 80,
                    rotateY: -20
                },
                {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%',
                        end: 'top 60%',
                        toggleActions: 'play none none reverse',
                        markers: false
                    },
                    opacity: 1,
                    y: 0,
                    rotateY: 0,
                    duration: 1,
                    delay: index * 0.2,
                    ease: 'power3.out'
                }
            );
        });

        // Process steps animation
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            gsap.fromTo(step,
                {
                    opacity: 0,
                    y: 60
                },
                {
                    scrollTrigger: {
                        trigger: step,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    },
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    delay: index * 0.08,
                    ease: 'power2.out'
                }
            );
        });

        // Stats counter animation - Sped up
        gsap.utils.toArray('.stat-number').forEach(stat => {
            const endValue = parseInt(stat.getAttribute('data-target'));
            gsap.to(stat, {
                scrollTrigger: {
                    trigger: stat,
                    start: 'top 85%', // Trigger slightly earlier
                    toggleActions: 'play none none reverse'
                },
                innerHTML: endValue,
                duration: 1.5, // Faster duration (was likely 2 or 3s)
                snap: { innerText: 1 },
                ease: 'power2.out',
                onUpdate: function () {
                    stat.innerHTML = Math.ceil(this.targets()[0].innerHTML) + '+';
                }
            });
        });

        // About section content
        const aboutText = document.querySelector('.about-text');
        if (aboutText) {
            gsap.fromTo(aboutText,
                {
                    opacity: 0,
                    x: -50
                },
                {
                    scrollTrigger: {
                        trigger: aboutText,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    },
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    ease: 'power2.out'
                }
            );
        }

        // Contact form animation
        const contactForm = document.querySelector('.contact-form-card');
        if (contactForm) {
            gsap.fromTo(contactForm,
                {
                    opacity: 0,
                    x: 50
                },
                {
                    scrollTrigger: {
                        trigger: contactForm,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    },
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    ease: 'power2.out'
                }
            );
        }

        // --- CANVAS GROWTH ANIMATION (User Requested) ---
        const initCanvasAnimation = () => {
            const canvas = document.getElementById('growthCanvas');
            const container = document.getElementById('cashew-canvas-container');

            if (canvas && container) {
                const ctx = canvas.getContext('2d');

                // Set canvas size
                const resizeCanvas = () => {
                    canvas.width = container.clientWidth;
                    canvas.height = container.clientHeight;
                };
                resizeCanvas();
                window.addEventListener('resize', resizeCanvas);

                let growthProgress = 0;

                class Plant {
                    constructor() {
                        this.x = canvas.width / 2;
                        this.y = canvas.height - 25;
                        this.height = 0;
                        this.maxHeight = canvas.height - 100;
                    }

                    update(progress) {
                        this.x = canvas.width / 2;
                        this.y = canvas.height - 25;
                        this.maxHeight = canvas.height - 120;

                        this.height = progress * this.maxHeight;
                        this.branches = [];
                        this.flowers = [];

                        // Branches
                        if (progress > 0.3) {
                            for (let i = 0; i < 5; i++) {
                                const branchY = this.y - (this.height * (0.3 + i * 0.12));
                                const angle = (i % 2 === 0 ? -1 : 1) * (Math.PI / 4);
                                const branchLength = (progress - 0.3) * 50;

                                this.branches.push({
                                    startX: this.x,
                                    startY: branchY,
                                    endX: this.x + Math.cos(angle) * branchLength,
                                    endY: branchY + Math.sin(angle) * branchLength,
                                    thickness: 3 * progress
                                });
                            }
                        }

                        // Flowers
                        if (progress > 0.65) {
                            const flowerCount = Math.floor((progress - 0.65) * 15);
                            for (let i = 0; i < flowerCount; i++) {
                                const flowerY = this.y - (this.height * (0.6 + Math.random() * 0.3));
                                const offsetX = Math.sin(i) * 40;

                                this.flowers.push({
                                    x: this.x + offsetX,
                                    y: flowerY,
                                    size: 6 * progress,
                                    color: `hsl(${350 + i * 5}, 80%, 60%)`
                                });
                            }
                        }
                    }

                    draw() {
                        // Stem
                        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y - this.height);
                        gradient.addColorStop(0, '#8B7355');
                        gradient.addColorStop(0.5, '#2d5016');
                        gradient.addColorStop(1, '#81c784');

                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = Math.max(2, 6 * (1 - growthProgress * 0.5));
                        ctx.beginPath();
                        ctx.moveTo(this.x, this.y);
                        ctx.lineTo(this.x, this.y - this.height);
                        ctx.stroke();

                        // Branches
                        this.branches.forEach(branch => {
                            ctx.strokeStyle = '#2d5016';
                            ctx.lineWidth = branch.thickness;
                            ctx.beginPath();
                            ctx.moveTo(branch.startX, branch.startY);
                            ctx.lineTo(branch.endX, branch.endY);
                            ctx.stroke();
                        });

                        // Flowers
                        this.flowers.forEach(flower => {
                            ctx.fillStyle = flower.color;
                            ctx.beginPath();
                            ctx.arc(flower.x, flower.y, flower.size, 0, Math.PI * 2);
                            ctx.fill();
                        });
                    }
                }

                const plant = new Plant();

                function animateCanvas() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Sky
                    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                    bgGradient.addColorStop(0, '#87ceeb');
                    bgGradient.addColorStop(1, '#e0f6ff');
                    ctx.fillStyle = bgGradient;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Sun
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(60, 60, 25, 0, Math.PI * 2);
                    ctx.fill();

                    // Soil
                    ctx.fillStyle = '#8B7355';
                    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

                    plant.update(growthProgress);
                    plant.draw();

                    requestAnimationFrame(animateCanvas);
                }
                animateCanvas();

                // ScrollTrigger
                const titleEl = document.getElementById('stage-title');
                const descEl = document.getElementById('stage-desc');

                ScrollTrigger.create({
                    trigger: '#cashew-canvas-container',
                    start: 'top 75%',
                    end: 'bottom 25%',
                    scrub: 1,
                    onUpdate: (self) => {
                        growthProgress = self.progress;
                        if (titleEl && descEl) {
                            if (growthProgress < 0.2) {
                                titleEl.innerText = "Stage 1: Planting 🌱";
                                descEl.innerText = "Seeds sown in nutrient-rich soil.";
                            } else if (growthProgress < 0.5) {
                                titleEl.innerText = "Stage 2: Growth 🌿";
                                descEl.innerText = "Developing roots and foliage.";
                            } else if (growthProgress < 0.8) {
                                titleEl.innerText = "Stage 3: Flowering 🌸";
                                descEl.innerText = "Pollination and blooming.";
                            } else {
                                titleEl.innerText = "Stage 4: Harvest 🥜";
                                descEl.innerText = "Premium Cashews ready.";
                            }
                        }
                    }
                });
            }
        };
        initCanvasAnimation();


        // --- PARTNER & GLOBE INTERACTION ---
        const initGlobeInteraction = () => {
            const infoBoxes = document.querySelectorAll('.info-box');
            const markers = document.querySelectorAll('.marker');

            // Reset function
            const resetMarkers = () => {
                markers.forEach(m => m.classList.remove('active'));
            };

            infoBoxes.forEach(box => {
                box.addEventListener('click', () => {
                    resetMarkers();

                    // 1. Get Country Name
                    const countryName = box.querySelector('h3').innerText.replace(/[^a-zA-Z\s]/g, '').trim();
                    console.log('Clicked country:', countryName);

                    // 2. Find matching marker
                    let targetMarker = null;
                    markers.forEach(marker => {
                        const title = marker.getAttribute('title');
                        // Simple robust check: does marker title contain country name?
                        if (title && title.includes(countryName)) {
                            targetMarker = marker;
                        }
                        // Special case for Guinea (HQ)
                        if (countryName.includes('Guinea') && title.includes('Guinea')) {
                            targetMarker = marker;
                        }
                    });

                    // 3. Highlight Logic
                    if (targetMarker) {
                        targetMarker.classList.add('active');
                        // Scroll to globe
                        const globeSection = document.getElementById('partners');
                        if (globeSection) {
                            globeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                });
            });
        };
        initGlobeInteraction();
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
