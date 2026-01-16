import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scene } from './src/Scene.js';
import { Assets } from './src/Assets.js';
import { Physics } from './src/Physics.js';
import { Particles } from './src/Particles.js';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
ScrollTrigger.normalizeScroll(true); // Fix key mobile scroll jitter issues

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
        // 1. Initial UI & Animation Setup
        this.setupBackgroundParticles();
        this.setupEntranceAnimations();
        this.setupScrollTrigger();
        this.setupScrollEffects();

        // 2. Component & Interaction Setup
        this.setupInteractions();
        this.setupFAQ();
        this.setupContactForm();

        // Fail-safe visibility for contact form card
        gsap.set('.contact-form-card', { opacity: 1, x: 0, clearProps: 'all', delay: 2 });

        ScrollTrigger.refresh();

        // 3. Loading Sequence & Stats Trigger
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    loadingScreen.remove();
                    this.startPostLoadingAnimations();
                    ScrollTrigger.refresh();
                }, 500);
            }, 1000);
        } else {
            this.startPostLoadingAnimations();
        }

        // 4. Heavy Assets Initialization
        try {
            this.assets.createLandscape();
        } catch (e) {
            console.warn('3D Background deferred or disabled');
        }

        this.animate();
    }

    setupBackgroundParticles() {
        const container = document.getElementById('particles-container');
        if (!container) return;

        const symbols = ['🌾', '🥜', '🍫', '🍃', '✨'];
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.innerText = symbols[Math.floor(Math.random() * symbols.length)];

            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const size = 15 + Math.random() * 20;
            const duration = 10 + Math.random() * 20;
            const delay = Math.random() * -20;

            particle.style.left = `${x}%`;
            particle.style.top = `${y}%`;
            particle.style.fontSize = `${size}px`;

            container.appendChild(particle);

            gsap.to(particle, {
                y: 'random(-100, 100)',
                x: 'random(-50, 50)',
                rotation: 'random(-360, 360)',
                duration: duration,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: delay
            });
        }
    }

    startPostLoadingAnimations() {
        // Trigger Stats Counter only after loader is gone
        gsap.utils.toArray('.counter').forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            if (isNaN(target)) return;

            gsap.to(stat, {
                scrollTrigger: {
                    trigger: stat,
                    start: 'top 95%',
                    toggleActions: 'play none none none'
                },
                innerText: target,
                duration: 2.5,
                snap: { innerText: 1 },
                ease: 'power3.out',
                onUpdate: function () {
                    stat.innerText = Math.floor(stat.innerText) + '+';
                }
            });
        });

        // Entrance animation for hero content
        gsap.from('.hero-content > *', {
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out'
        });
    }

    setupEntranceAnimations() {
        // Mouse parallax for hero
        const heroWrapper = document.querySelector('.hero-parallax-wrapper');
        if (heroWrapper) {
            window.addEventListener('mousemove', (e) => {
                const { clientX, clientY } = e;
                const xPos = (clientX / window.innerWidth - 0.5) * 30;
                const yPos = (clientY / window.innerHeight - 0.5) * 30;

                gsap.to(heroWrapper, {
                    x: xPos,
                    y: yPos,
                    duration: 1,
                    ease: 'power2.out'
                });
            });
        }

        // Section reveal animations
        const revealSections = document.querySelectorAll('.section');
        revealSections.forEach(section => {
            section.classList.add('section-reveal');
            ScrollTrigger.create({
                trigger: section,
                start: 'top 80%',
                onEnter: () => section.classList.add('active')
            });
        });

        const heroTitle = document.getElementById('hero-title');
        if (heroTitle) {
            const text = heroTitle.textContent;
            heroTitle.innerHTML = text.split('').map(char =>
                `<span class="char" style="display:inline-block;">${char === ' ' ? '&nbsp;' : char}</span>`
            ).join('');

            gsap.from(heroTitle.querySelectorAll('.char'), {
                y: 100,
                opacity: 0,
                duration: 1.2,
                ease: "expo.out",
                stagger: 0.05,
                delay: 0.5
            });
        }

        const heroTl = gsap.timeline({ delay: 1.2 });
        heroTl.from('.hero-subtitle', { opacity: 0, y: 30, duration: 1, ease: 'power3.out' })
            .from('.hero-description', { opacity: 0, y: 30, duration: 1, ease: 'power3.out' }, '-=0.6')
            .from('.cta-primary', { opacity: 0, scale: 0.8, duration: 1, ease: 'back.out(1.7)' }, '-=0.6')
            .from('.stat-item', { opacity: 0, x: 50, duration: 1, stagger: 0.2, ease: 'power3.out' }, '-=1');
    }

    setupScrollTrigger() {
        // Hero Content Parallax
        gsap.to(".hero-content", {
            scrollTrigger: {
                trigger: ".hero-ui",
                start: "top top",
                end: "bottom top",
                scrub: 1
            },
            y: 150,
            opacity: 0,
            scale: 0.95,
            ease: "none"
        });

        // Section Headers
        gsap.utils.toArray('.section-header').forEach(header => {
            const tagline = header.querySelector('.section-tagline');
            const title = header.querySelector('.section-title');
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: header,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });
            if (tagline) tl.from(tagline, { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" });
            if (title) tl.from(title, { opacity: 0, y: 30, duration: 0.8, ease: "power3.out" }, "-=0.4");
        });

        // Staggered Reveals
        const configs = [
            { selector: '.milestones li', trigger: '.about-grid', x: -50 },
            { selector: '.step', trigger: '.process-steps', y: 60, stagger: 0.2 },
            { selector: '.product-card', trigger: '.product-grid', scale: 0.8, stagger: 0.25 },
            { selector: '.info-box', trigger: '.info-grid', y: 40, stagger: 0.2 },
            { selector: '.info-item', trigger: '.contact-wrap', x: -30, stagger: 0.2 },
            { selector: '.contact-form-card', trigger: '.contact-wrap', x: 40 }
        ];

        configs.forEach(config => {
            const els = document.querySelectorAll(config.selector);
            if (els.length > 0) {
                gsap.from(els, {
                    scrollTrigger: {
                        trigger: config.trigger,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    },
                    opacity: 0,
                    x: config.x || 0,
                    y: config.y || 0,
                    scale: config.scale || 1,
                    duration: 1,
                    stagger: config.stagger || 0,
                    ease: "power2.out"
                });
            }
        });

        // Stats Counters
        gsap.utils.toArray('.counter').forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            if (isNaN(target)) return;

            gsap.to(stat, {
                scrollTrigger: {
                    trigger: stat,
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                },
                innerText: target,
                duration: 2,
                snap: { innerText: 1 },
                ease: 'power2.out',
                onUpdate: function () {
                    stat.innerText = Math.floor(stat.innerText) + '+';
                }
            });
        });

        // Fail-safe: Reveal hidden elements after 5 seconds if JS/ScrollTrigger hangs
        setTimeout(() => {
            gsap.to('.step, .counter', {
                opacity: 1,
                y: 0,
                stagger: 0.1,
                duration: 1,
                overwrite: 'auto',
                ease: "power2.out"
            });
        }, 5000);

    }

    setupScrollEffects() {
        gsap.to(".stat-item", {
            y: "random(-10, 10)",
            duration: "random(2, 4)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: { each: 0.5, from: "random" }
        });

        const magneticEls = document.querySelectorAll('.cta-primary, .social-icon, .hamburger');
        magneticEls.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                gsap.to(el, { x: x * 0.4, y: y * 0.4, duration: 0.3, ease: "power2.out" });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
            });
        });
    }

    setupInteractions() {
        window.addEventListener('scroll', () => {
            const nav = document.querySelector('.navbar');
            if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
        });

        const hamburger = document.querySelector('.hamburger');
        const mobileMenu = document.querySelector('.mobile-menu-overlay');
        if (hamburger && mobileMenu) {
            hamburger.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                hamburger.classList.toggle('toggle');
            });
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                    hamburger.classList.remove('toggle');
                });
            });
        }

        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', () => {
                const product = card.getAttribute('data-product');
                if (this.productViewer) {
                    this.productViewer.setProduct(product);
                    document.getElementById('product-360-viewer')?.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        this.initGlobeInteraction();
        this.initVideoScroll();
    }

    initGlobeInteraction() {
        const infoBoxes = document.querySelectorAll('.info-box');
        const markers = document.querySelectorAll('.marker');
        infoBoxes.forEach(box => {
            box.addEventListener('click', () => {
                markers.forEach(m => m.classList.remove('active'));
                const country = box.querySelector('h3').innerText.replace(/[^a-zA-Z\s]/g, '').trim();
                let target = null;
                markers.forEach(m => {
                    const title = m.getAttribute('title');
                    if (title && (title.includes(country) || (country.includes('Guinea') && title.includes('Guinea')))) {
                        target = m;
                    }
                });
                if (target) {
                    target.classList.add('active');
                    document.getElementById('partners')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });
    }

    initVideoScroll() {
        const container = document.getElementById('cashew-canvas-container');
        if (!container) return;
        container.innerHTML = '';
        container.style.backgroundColor = '#000';
        const video = document.createElement('video');
        video.src = '/videos/plant-grow-optimized.mp4';
        video.muted = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.preload = "auto";
        video.style.cssText = 'width: 100vw; height: 100vh; object-fit: cover; position: absolute; top:0; left:0;';
        const loader = document.createElement('div');
        loader.innerText = 'Initializing Sequence...';
        loader.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white;';
        container.appendChild(loader);
        container.appendChild(video);
        video.addEventListener('loadedmetadata', () => {
            loader.style.display = 'none';
            ScrollTrigger.create({
                trigger: '#cashew-canvas-container',
                start: 'top top',
                end: '+=800',
                pin: true,
                scrub: 1,
                onUpdate: (self) => { if (video.duration) video.currentTime = video.duration * self.progress; }
            });
        });
    }

    setupFAQ() {
        document.querySelectorAll('.faq-item').forEach(item => {
            item.addEventListener('click', () => {
                const answer = item.querySelector('.faq-answer');
                const isOpen = item.classList.contains('active');
                document.querySelectorAll('.faq-item').forEach(i => {
                    i.classList.remove('active');
                    const ans = i.querySelector('.faq-answer');
                    if (ans) ans.style.maxHeight = null;
                });
                if (!isOpen) {
                    item.classList.add('active');
                    if (answer) answer.style.maxHeight = answer.scrollHeight + "px";
                }
            });
        });
    }

    setupContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const btnText = submitBtn?.querySelector('.btn-text');
            const spinner = submitBtn?.querySelector('.spinner');
            if (submitBtn) submitBtn.disabled = true;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            try {
                const response = await fetch('https://formspree.io/f/xvzzzgjd', {
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (response.ok) {
                    form.reset();
                    if (btnText) btnText.innerText = 'Message Sent!';
                }
            } catch (error) {
                if (btnText) btnText.innerText = 'Error. Try Again.';
            } finally {
                setTimeout(() => {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        if (btnText) btnText.innerText = 'Send Message';
                    }
                }, 3000);
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.productViewer) this.productViewer.render();
        this.scene.render();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
