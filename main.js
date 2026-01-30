/**
 * EATCHA CAFE - Interactive Website
 * A world-class animated web experience
 */

(function() {
    'use strict';

    // ==========================================================================
    // Configuration
    // ==========================================================================
    const CONFIG = {
        scrollThreshold: 50,
        animationDelay: 100,
        particleCount: 30,
        testimonialAutoplayDelay: 5000,
        toastDuration: 3000
    };

    // ==========================================================================
    // DOM Elements
    // ==========================================================================
    const DOM = {
        // Cursor
        cursorDot: document.getElementById('cursor-dot'),
        cursorOutline: document.getElementById('cursor-outline'),

        // Loader
        loader: document.getElementById('loader'),

        // Header
        header: document.getElementById('header'),
        hamburger: document.getElementById('hamburger'),
        mobileMenu: document.getElementById('mobile-menu'),
        navLinks: document.querySelectorAll('.nav-link, .mobile-nav-links a'),

        // Hero
        heroParticles: document.getElementById('hero-particles'),

        // Menu
        menuCategories: document.querySelectorAll('.menu-category'),
        menuItems: document.querySelectorAll('.menu-item'),

        // Testimonials
        testimonialsTrack: document.getElementById('testimonials-track'),
        testimonialPrev: document.getElementById('testimonial-prev'),
        testimonialNext: document.getElementById('testimonial-next'),
        testimonialDots: document.getElementById('testimonial-dots'),

        // Gallery
        galleryItems: document.querySelectorAll('.gallery-item'),
        lightbox: document.getElementById('lightbox'),
        lightboxImg: document.getElementById('lightbox-img'),
        lightboxClose: document.querySelector('.lightbox-close'),
        lightboxPrev: document.querySelector('.lightbox-prev'),
        lightboxNext: document.querySelector('.lightbox-next'),

        // Forms
        reservationForm: document.getElementById('reservation-form'),
        newsletterForm: document.getElementById('newsletter-form'),

        // Toast
        toast: document.getElementById('toast'),
        toastMessage: document.querySelector('.toast-message'),

        // Scroll elements
        animateElements: document.querySelectorAll('.animate-on-scroll')
    };

    // ==========================================================================
    // State
    // ==========================================================================
    const State = {
        isLoading: true,
        currentTestimonial: 0,
        testimonialCount: 0,
        currentGalleryIndex: 0,
        galleryImages: [],
        mousePosition: { x: 0, y: 0 },
        isScrolling: false
    };

    // ==========================================================================
    // Utility Functions
    // ==========================================================================
    const Utils = {
        debounce(fn, delay) {
            let timeoutId;
            return function (...args) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => fn.apply(this, args), delay);
            };
        },

        throttle(fn, limit) {
            let inThrottle;
            return function (...args) {
                if (!inThrottle) {
                    fn.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        lerp(start, end, factor) {
            return start + (end - start) * factor;
        },

        getScrollPercent() {
            const h = document.documentElement;
            const b = document.body;
            const st = 'scrollTop';
            const sh = 'scrollHeight';
            return (h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100;
        },

        isMobile() {
            return window.innerWidth < 1024;
        },

        isTouchDevice() {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        }
    };

    // ==========================================================================
    // Custom Cursor
    // ==========================================================================
    const Cursor = {
        init() {
            if (Utils.isTouchDevice()) return;

            document.addEventListener('mousemove', this.move.bind(this));
            document.addEventListener('mousedown', this.click.bind(this));
            document.addEventListener('mouseup', this.release.bind(this));

            // Add hover effect to interactive elements
            const interactiveElements = document.querySelectorAll('a, button, .menu-item, .gallery-item, input, textarea, select');
            interactiveElements.forEach(el => {
                el.addEventListener('mouseenter', () => this.hover(true));
                el.addEventListener('mouseleave', () => this.hover(false));
            });

            // Show cursor
            setTimeout(() => {
                DOM.cursorDot.classList.add('visible');
                DOM.cursorOutline.classList.add('visible');
            }, 500);
        },

        move(e) {
            State.mousePosition.x = e.clientX;
            State.mousePosition.y = e.clientY;

            DOM.cursorDot.style.left = `${e.clientX}px`;
            DOM.cursorDot.style.top = `${e.clientY}px`;

            // Smooth follow for outline
            requestAnimationFrame(() => {
                DOM.cursorOutline.style.left = `${e.clientX}px`;
                DOM.cursorOutline.style.top = `${e.clientY}px`;
            });
        },

        hover(isHovering) {
            DOM.cursorOutline.classList.toggle('hover', isHovering);
        },

        click() {
            DOM.cursorOutline.classList.add('clicking');
        },

        release() {
            DOM.cursorOutline.classList.remove('clicking');
        }
    };

    // ==========================================================================
    // Loading Screen
    // ==========================================================================
    const Loader = {
        init() {
            document.body.classList.add('loading');

            window.addEventListener('load', () => {
                setTimeout(() => this.hide(), 2500);
            });

            // Fallback if load event already fired
            if (document.readyState === 'complete') {
                setTimeout(() => this.hide(), 2500);
            }
        },

        hide() {
            State.isLoading = false;
            DOM.loader.classList.add('hidden');
            document.body.classList.remove('loading');

            // Trigger initial animations
            setTimeout(() => {
                ScrollAnimations.checkElements();
            }, 100);
        }
    };

    // ==========================================================================
    // Header
    // ==========================================================================
    const Header = {
        init() {
            window.addEventListener('scroll', Utils.throttle(this.onScroll.bind(this), 100));
            this.onScroll();
        },

        onScroll() {
            const scrolled = window.scrollY > CONFIG.scrollThreshold;
            DOM.header.classList.toggle('scrolled', scrolled);
        }
    };

    // ==========================================================================
    // Mobile Menu
    // ==========================================================================
    const MobileMenu = {
        init() {
            DOM.hamburger.addEventListener('click', this.toggle.bind(this));

            // Close menu on link click
            DOM.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (DOM.mobileMenu.classList.contains('active')) {
                        this.close();
                    }
                });
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && DOM.mobileMenu.classList.contains('active')) {
                    this.close();
                }
            });
        },

        toggle() {
            const isActive = DOM.mobileMenu.classList.contains('active');
            if (isActive) {
                this.close();
            } else {
                this.open();
            }
        },

        open() {
            DOM.hamburger.classList.add('active');
            DOM.mobileMenu.classList.add('active');
            document.body.classList.add('menu-open');
        },

        close() {
            DOM.hamburger.classList.remove('active');
            DOM.mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    };

    // ==========================================================================
    // Navigation
    // ==========================================================================
    const Navigation = {
        init() {
            // Smooth scroll for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const targetId = anchor.getAttribute('href');
                    if (targetId === '#') return;

                    const target = document.querySelector(targetId);
                    if (target) {
                        e.preventDefault();
                        const headerOffset = 80;
                        const elementPosition = target.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.scrollY - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            });

            // Active link highlighting
            window.addEventListener('scroll', Utils.throttle(this.updateActiveLink.bind(this), 100));
        },

        updateActiveLink() {
            const sections = document.querySelectorAll('section[id]');
            const scrollPosition = window.scrollY + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    DOM.navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }
    };

    // ==========================================================================
    // Scroll Animations
    // ==========================================================================
    const ScrollAnimations = {
        init() {
            this.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                            // Optionally unobserve after animation
                            // this.observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                }
            );

            DOM.animateElements.forEach(el => {
                this.observer.observe(el);
            });
        },

        checkElements() {
            DOM.animateElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
                if (isVisible) {
                    el.classList.add('visible');
                }
            });
        }
    };

    // ==========================================================================
    // Particles
    // ==========================================================================
    const Particles = {
        init() {
            if (!DOM.heroParticles) return;

            for (let i = 0; i < CONFIG.particleCount; i++) {
                this.createParticle();
            }
        },

        createParticle() {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 10}s`;
            particle.style.animationDuration = `${8 + Math.random() * 4}s`;
            particle.style.opacity = Math.random() * 0.6 + 0.2;
            particle.style.transform = `scale(${Math.random() * 0.5 + 0.5})`;
            DOM.heroParticles.appendChild(particle);
        }
    };

    // ==========================================================================
    // Parallax Effects
    // ==========================================================================
    const Parallax = {
        init() {
            if (Utils.isMobile()) return;

            window.addEventListener('scroll', Utils.throttle(this.onScroll.bind(this), 16));
            window.addEventListener('mousemove', Utils.throttle(this.onMouseMove.bind(this), 16));
        },

        onScroll() {
            const scrollY = window.scrollY;

            // Parallax for hero layers
            document.querySelectorAll('.hero-parallax-layer').forEach((layer, index) => {
                const speed = (index + 1) * 0.1;
                layer.style.transform = `translateY(${scrollY * speed}px)`;
            });

            // Parallax for floating elements
            document.querySelectorAll('.float-element').forEach((el, index) => {
                const speed = (index + 1) * 0.05;
                el.style.transform = `translateY(${scrollY * speed}px)`;
            });
        },

        onMouseMove(e) {
            const { clientX, clientY } = e;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const moveX = (clientX - centerX) / centerX;
            const moveY = (clientY - centerY) / centerY;

            // Move showcase cards
            document.querySelectorAll('.showcase-card').forEach((card, index) => {
                const factor = (index + 1) * 5;
                card.style.transform = `translateX(${moveX * factor}px) translateY(${moveY * factor}px)`;
            });
        }
    };

    // ==========================================================================
    // Menu Filter
    // ==========================================================================
    const MenuFilter = {
        init() {
            DOM.menuCategories.forEach(btn => {
                btn.addEventListener('click', () => this.filter(btn));
            });
        },

        filter(activeBtn) {
            const category = activeBtn.dataset.category;

            // Update active button
            DOM.menuCategories.forEach(btn => btn.classList.remove('active'));
            activeBtn.classList.add('active');

            // Filter items
            DOM.menuItems.forEach(item => {
                const itemCategory = item.dataset.category;
                const shouldShow = category === 'all' || itemCategory === category;

                if (shouldShow) {
                    item.classList.remove('hidden');
                    item.style.animation = 'fadeInUp 0.5s ease forwards';
                } else {
                    item.classList.add('hidden');
                }
            });
        }
    };

    // ==========================================================================
    // Testimonials Slider
    // ==========================================================================
    const TestimonialsSlider = {
        init() {
            if (!DOM.testimonialsTrack) return;

            const cards = DOM.testimonialsTrack.querySelectorAll('.testimonial-card');
            State.testimonialCount = cards.length;

            // Create dots
            this.createDots();

            // Event listeners
            DOM.testimonialPrev?.addEventListener('click', () => this.prev());
            DOM.testimonialNext?.addEventListener('click', () => this.next());

            // Touch support
            this.initTouch();

            // Autoplay
            this.startAutoplay();

            // Pause on hover
            DOM.testimonialsTrack.addEventListener('mouseenter', () => this.stopAutoplay());
            DOM.testimonialsTrack.addEventListener('mouseleave', () => this.startAutoplay());
        },

        createDots() {
            if (!DOM.testimonialDots) return;

            for (let i = 0; i < State.testimonialCount; i++) {
                const dot = document.createElement('div');
                dot.className = `testimonial-dot ${i === 0 ? 'active' : ''}`;
                dot.addEventListener('click', () => this.goTo(i));
                DOM.testimonialDots.appendChild(dot);
            }
        },

        updateDots() {
            const dots = DOM.testimonialDots?.querySelectorAll('.testimonial-dot');
            dots?.forEach((dot, index) => {
                dot.classList.toggle('active', index === State.currentTestimonial);
            });
        },

        goTo(index) {
            State.currentTestimonial = index;
            this.updateSlider();
        },

        prev() {
            State.currentTestimonial = (State.currentTestimonial - 1 + State.testimonialCount) % State.testimonialCount;
            this.updateSlider();
        },

        next() {
            State.currentTestimonial = (State.currentTestimonial + 1) % State.testimonialCount;
            this.updateSlider();
        },

        updateSlider() {
            const cardWidth = DOM.testimonialsTrack.querySelector('.testimonial-card').offsetWidth;
            const gap = 24; // var(--space-lg)
            const offset = State.currentTestimonial * (cardWidth + gap);
            DOM.testimonialsTrack.style.transform = `translateX(-${offset}px)`;
            this.updateDots();
        },

        initTouch() {
            let startX = 0;
            let isDragging = false;

            DOM.testimonialsTrack.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
            });

            DOM.testimonialsTrack.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
            });

            DOM.testimonialsTrack.addEventListener('touchend', (e) => {
                if (!isDragging) return;
                isDragging = false;

                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;

                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        this.next();
                    } else {
                        this.prev();
                    }
                }
            });
        },

        startAutoplay() {
            this.autoplayInterval = setInterval(() => {
                this.next();
            }, CONFIG.testimonialAutoplayDelay);
        },

        stopAutoplay() {
            clearInterval(this.autoplayInterval);
        }
    };

    // ==========================================================================
    // Gallery Lightbox
    // ==========================================================================
    const Gallery = {
        init() {
            // Collect gallery images
            DOM.galleryItems.forEach((item, index) => {
                const img = item.querySelector('img');
                if (img) {
                    State.galleryImages.push(img.src);
                    item.addEventListener('click', () => this.open(index));
                }
            });

            // Lightbox controls
            DOM.lightboxClose?.addEventListener('click', () => this.close());
            DOM.lightboxPrev?.addEventListener('click', () => this.prev());
            DOM.lightboxNext?.addEventListener('click', () => this.next());

            // Close on background click
            DOM.lightbox?.addEventListener('click', (e) => {
                if (e.target === DOM.lightbox) this.close();
            });

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (!DOM.lightbox?.classList.contains('active')) return;

                if (e.key === 'Escape') this.close();
                if (e.key === 'ArrowLeft') this.prev();
                if (e.key === 'ArrowRight') this.next();
            });
        },

        open(index) {
            State.currentGalleryIndex = index;
            DOM.lightboxImg.src = State.galleryImages[index];
            DOM.lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        close() {
            DOM.lightbox.classList.remove('active');
            document.body.style.overflow = '';
        },

        prev() {
            State.currentGalleryIndex = (State.currentGalleryIndex - 1 + State.galleryImages.length) % State.galleryImages.length;
            DOM.lightboxImg.src = State.galleryImages[State.currentGalleryIndex];
        },

        next() {
            State.currentGalleryIndex = (State.currentGalleryIndex + 1) % State.galleryImages.length;
            DOM.lightboxImg.src = State.galleryImages[State.currentGalleryIndex];
        }
    };

    // ==========================================================================
    // Forms
    // ==========================================================================
    const Forms = {
        init() {
            DOM.reservationForm?.addEventListener('submit', (e) => this.handleReservation(e));
            DOM.newsletterForm?.addEventListener('submit', (e) => this.handleNewsletter(e));
        },

        handleReservation(e) {
            e.preventDefault();
            const form = e.target;
            const btn = form.querySelector('button[type="submit"]');

            // Show loading state
            btn.classList.add('loading');

            // Simulate form submission (replace with actual Firebase logic)
            setTimeout(() => {
                btn.classList.remove('loading');
                Toast.show('Reservation submitted! We\'ll confirm shortly.');
                form.reset();
            }, 1500);
        },

        handleNewsletter(e) {
            e.preventDefault();
            const form = e.target;
            const btn = form.querySelector('button[type="submit"]');
            const input = form.querySelector('input[type="email"]');

            btn.classList.add('loading');

            // Simulate form submission
            setTimeout(() => {
                btn.classList.remove('loading');
                Toast.show('Thanks for subscribing!');
                input.value = '';
            }, 1000);
        }
    };

    // ==========================================================================
    // Toast Notifications
    // ==========================================================================
    const Toast = {
        show(message) {
            DOM.toastMessage.textContent = message;
            DOM.toast.classList.add('show');

            setTimeout(() => {
                this.hide();
            }, CONFIG.toastDuration);
        },

        hide() {
            DOM.toast.classList.remove('show');
        }
    };

    // ==========================================================================
    // Firebase Integration (Placeholder)
    // ==========================================================================
    const Firebase = {
        // Firebase configuration will be added here
        config: {
            // apiKey: "YOUR_API_KEY",
            // authDomain: "YOUR_PROJECT.firebaseapp.com",
            // projectId: "YOUR_PROJECT_ID",
            // storageBucket: "YOUR_PROJECT.appspot.com",
            // messagingSenderId: "YOUR_SENDER_ID",
            // appId: "YOUR_APP_ID"
        },

        init() {
            // Uncomment when Firebase is configured
            // if (typeof firebase !== 'undefined') {
            //     firebase.initializeApp(this.config);
            //     this.db = firebase.firestore();
            //     this.auth = firebase.auth();
            // }
        },

        async submitReservation(data) {
            // Implement Firebase reservation submission
            // return this.db.collection('reservations').add(data);
        },

        async subscribeNewsletter(email) {
            // Implement Firebase newsletter subscription
            // return this.db.collection('newsletter').add({ email, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        }
    };

    // ==========================================================================
    // Performance Optimizations
    // ==========================================================================
    const Performance = {
        init() {
            // Lazy load images
            this.lazyLoadImages();

            // Preload critical images
            this.preloadImages([
                'IMG_8243.PNG',
                'IMG_9574.jpg',
                'IMG_8245.PNG'
            ]);
        },

        lazyLoadImages() {
            const images = document.querySelectorAll('img[loading="lazy"]');

            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src || img.src;
                            imageObserver.unobserve(img);
                        }
                    });
                });

                images.forEach(img => imageObserver.observe(img));
            }
        },

        preloadImages(urls) {
            urls.forEach(url => {
                const img = new Image();
                img.src = url;
            });
        }
    };

    // ==========================================================================
    // Initialize
    // ==========================================================================
    function init() {
        // Core functionality
        Loader.init();
        Cursor.init();
        Header.init();
        MobileMenu.init();
        Navigation.init();
        ScrollAnimations.init();

        // Visual effects
        Particles.init();
        Parallax.init();

        // Interactive components
        MenuFilter.init();
        TestimonialsSlider.init();
        Gallery.init();
        Forms.init();

        // Performance
        Performance.init();

        // Firebase (when configured)
        Firebase.init();

        console.log('🍵 Eatcha Cafe - Website initialized');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
