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
        // Initialize Site-Wide Animations
        this.setupSiteAnimations();

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

        // --- SCROLL-BASED IMAGE SEQUENCE (Video-like) ---
        const initCanvasAnimation = () => {
            const container = document.getElementById('cashew-canvas-container');
            if (!container) return;

            // Clear previous canvas if any
            container.innerHTML = '';

            // Create image containers with reliable sources
            const stages = [
                {
                    src: 'https://images.unsplash.com/photo-1599596636750-7171d9d96c96?auto=format&fit=crop&w=1000&q=80',
                    caption: 'Stage 1: Germination 🌱',
                    desc: 'The journey begins with premium seeds in fertile soil.',
                    fallbackColor: '#8D6E63'
                },
                {
                    src: 'https://images.unsplash.com/photo-1596435061694-8742b8214db2?auto=format&fit=crop&w=1000&q=80',
                    caption: 'Stage 2: Growth 🌿',
                    desc: 'Nurtured by the Guinean sun, saplings grow strong.',
                    fallbackColor: '#4CAF50'
                },
                {
                    src: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Cashew_apples_and_nuts.jpg',
                    caption: 'Stage 3: Fruiting 🍎',
                    desc: 'Vibrant Cashew Apples and raw nuts appear.',
                    fallbackColor: '#ff6b6b'
                },
                {
                    src: 'https://images.unsplash.com/photo-1543202996-339243764b82?auto=format&fit=crop&w=1000&q=80',
                    caption: 'Stage 4: Harvest 🥜',
                    desc: 'Ready for processing and global export.',
                    fallbackColor: '#d97706'
                }
            ];

            // Create DOM elements for images
            stages.forEach((stage, i) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'growth-stage';
                wrapper.style.position = 'absolute';
                wrapper.style.top = '0';
                wrapper.style.left = '0';
                wrapper.style.width = '100%';
                wrapper.style.height = '100%';
                wrapper.style.opacity = i === 0 ? '1' : '0';
                wrapper.style.transition = 'opacity 0.5s ease';
                wrapper.style.display = 'flex';
                wrapper.style.flexDirection = 'column';
                wrapper.style.justifyContent = 'center';
                wrapper.style.alignItems = 'center';
                wrapper.style.overflow = 'hidden';
                wrapper.style.backgroundColor = '#f0f0f0'; // Base background

                // Image
                const img = document.createElement('img');
                img.src = stage.src;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.position = 'absolute';
                img.style.zIndex = '1';

                // Error handling: if image fails, show colored block
                img.onerror = () => {
                    img.style.display = 'none';
                    wrapper.style.backgroundColor = stage.fallbackColor;
                    const errText = document.createElement('div');
                    errText.innerText = '(Image Loading...)';
                    errText.style.color = 'white';
                    errText.style.zIndex = '2';
                    errText.style.position = 'absolute';
                    wrapper.appendChild(errText);
                };

                // Overlay text
                const textOverlay = document.createElement('div');
                textOverlay.style.position = 'absolute';
                textOverlay.style.bottom = '20px';
                textOverlay.style.left = '20px';
                textOverlay.style.zIndex = '10';
                textOverlay.style.background = 'rgba(255,255,255,0.95)';
                textOverlay.style.padding = '15px 25px';
                textOverlay.style.borderRadius = '15px';
                textOverlay.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                textOverlay.style.maxWidth = '80%';
                textOverlay.innerHTML = `
                    <h3 style="color: #d97706; margin:0; font-size: 1.5rem;">${stage.caption}</h3>
                    <p style="margin:5px 0 0; color: #444;">${stage.desc}</p>
                `;

                wrapper.appendChild(img);
                wrapper.appendChild(textOverlay);
                container.appendChild(wrapper);
            });

            // ScrollTrigger logic
            ScrollTrigger.create({
                trigger: '#cashew-canvas-container',
                start: 'top top',
                end: '+=3000', // Long scroll for "video" feel
                pin: true,
                scrub: 0.5,
                onUpdate: (self) => {
                    const progress = self.progress;
                    const index = Math.min(Math.floor(progress * stages.length), stages.length - 1);

                    // Show active stage, hide others
                    const stageEls = container.querySelectorAll('.growth-stage');
                    stageEls.forEach((el, i) => {
                        if (i === index) {
                            el.style.opacity = '1';
                            el.style.transform = 'scale(1)';
                        } else {
                            el.style.opacity = '0';
                            el.style.transform = 'scale(1.1)'; // Slight zoom effect for inactive
                        }
                    });
                }
            });
        };
        // initCanvasAnimation();

        const initVideoScroll = () => {
            const container = document.getElementById('cashew-canvas-container');
            if (!container) return;

            // Clear previous content
            container.innerHTML = '';
            container.style.backgroundColor = '#000';
            container.style.height = '100vh'; // Enforce full screen height for the lock

            // Create Video Element
            const video = document.createElement('video');
            video.src = 'videos/plant grow.mp4';
            video.muted = true;
            video.playsInline = true;
            video.preload = "auto";
            video.style.width = '100vw';
            video.style.height = '100vh';
            video.style.objectFit = 'cover';
            video.style.position = 'absolute';
            video.style.top = '0';
            video.style.left = '0';

            const loader = document.createElement('div');
            loader.innerText = 'Loading Video...';
            loader.style.position = 'absolute';
            loader.style.top = '50%';
            loader.style.left = '50%';
            loader.style.transform = 'translate(-50%, -50%)';
            loader.style.color = 'white';
            loader.style.zIndex = '2';

            container.appendChild(loader);
            container.appendChild(video);

            const startScroll = () => {
                loader.style.display = 'none';
                ScrollTrigger.create({
                    trigger: '#cashew-canvas-container',
                    start: 'top top',
                    end: '+=800', // Faster scrub
                    pin: true,
                    anticipatePin: 1, // Smooth out pin entry
                    scrub: 1,
                    onUpdate: (self) => {
                        if (video.duration) {
                            video.currentTime = video.duration * self.progress;
                        }
                    }
                });
            };

            video.addEventListener('loadedmetadata', startScroll);

            // Fallback
            setTimeout(() => {
                if (loader.style.display !== 'none') startScroll();
            }, 2000);
        };
        initVideoScroll();


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

    setupSiteAnimations() {
        // 1. Generic Section Headers Fade Up
        const headers = gsap.utils.toArray('.section-header');
        headers.forEach(header => {
            gsap.fromTo(header,
                { opacity: 0, y: 50 },
                {
                    scrollTrigger: {
                        trigger: header,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    },
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out'
                }
            );
        });

        // 2. Info Boxes (Partners) - Staggered
        ScrollTrigger.batch('.info-box', {
            start: 'top 85%',
            onEnter: batch => gsap.fromTo(batch,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: 'power2.out' }
            ),
            onLeaveBack: batch => gsap.to(batch, { opacity: 0, y: 30, overwrite: true })
        });

        // 3. Process Steps - Staggered
        ScrollTrigger.batch('.step', {
            start: 'top 85%',
            onEnter: batch => gsap.fromTo(batch,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, stagger: 0.2, duration: 0.6, ease: 'back.out(1.2)' }
            ),
            onLeaveBack: batch => gsap.to(batch, { opacity: 0, y: 50, overwrite: true })
        });

        // 4. Partner Marquee Fade In
        const marquee = document.querySelector('.partner-carousel');
        if (marquee) {
            gsap.fromTo(marquee,
                { opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: marquee,
                        start: 'top 90%',
                        toggleActions: 'play none none reverse'
                    },
                    opacity: 1,
                    duration: 1.5
                }
            );
        }

        // 5. Contact Section
        const contactInfo = document.querySelector('.contact-info');
        if (contactInfo) {
            gsap.fromTo(contactInfo,
                { opacity: 0, x: -50 },
                {
                    scrollTrigger: {
                        trigger: contactInfo,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    },
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    ease: 'power3.out'
                }
            );
        }

        // Ensure Contact Form is also animating (checks if already setup, if not, sets it up)
        const contactForm = document.querySelector('.contact-form-card');
        if (contactForm && !ScrollTrigger.getById('contactFormAnim')) {
            gsap.fromTo(contactForm,
                { opacity: 0, x: 50 },
                {
                    scrollTrigger: {
                        id: 'contactFormAnim',
                        trigger: contactForm,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    },
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    ease: 'power3.out'
                }
            );
        }
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

        // Mobile Menu Toggle
        const hamburger = document.querySelector('.hamburger');
        const mobileMenu = document.querySelector('.mobile-menu-overlay');
        const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

        if (hamburger && mobileMenu) {
            hamburger.addEventListener('click', () => {
                console.log('Hamburger clicked');
                mobileMenu.classList.toggle('active');
                hamburger.classList.toggle('toggle');
            });

            // Close menu when a link is clicked
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                    hamburger.classList.remove('toggle');
                });
            });
        }

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
