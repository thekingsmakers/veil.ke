document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

const App = {
    init() {
        this.initLoadingScreen();
        this.initNavigation();
        this.initDarkMode();
        this.initScrollAnimations();
        this.initSmoothScroll();
        this.initScrollToTop();
        this.initWhatsAppButton();
        this.initMobileMenu();
        this.initNewsletterForm();
        this.countUpAnimation();
        this.setActiveNavLink();
        this.initRippleEffect();
        this.initTouchFeedback();
        this.initSafeArea();

        if (document.getElementById('productGrid') ||
            document.getElementById('featuredProducts') ||
            document.getElementById('bestSellers') ||
            document.getElementById('newArrivals') ||
            document.getElementById('premiumCollection')) {
            typeof ProductsRenderer !== 'undefined' && ProductsRenderer.init();
        }

        typeof SearchEngine !== 'undefined' && SearchEngine.init();

        setTimeout(() => this.hideLoadingScreen(), 800);
    },

    initLoadingScreen() {
        const loader = document.getElementById('loader');
        if (!loader) {
            const div = document.createElement('div');
            div.id = 'loader';
            div.className = 'loader';
            div.innerHTML = `
                <div class="loader-content">
                    <div class="loader-logo">
                        <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
                            <path d="M50 10 C25 10 10 30 10 50 C10 70 25 90 50 90 C75 90 90 70 90 50 C90 30 75 10 50 10Z" stroke="#8C6A4A" stroke-width="2" fill="none" class="loader-ring"/>
                            <path d="M35 45 Q50 30 65 45 Q70 55 50 65 Q30 55 35 45Z" fill="#8C6A4A" class="loader-diamond"/>
                        </svg>
                    </div>
                    <h2 class="loader-text">Veil.ke</h2>
                    <p class="loader-sub">Elegance in Modesty</p>
                    <div class="loader-bar"><div class="loader-bar-fill"></div></div>
                </div>
            `;
            document.body.prepend(div);
        }
    },

    hideLoadingScreen() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('loader-hidden');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    },

    initNavigation() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;

            if (currentScroll > 80) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        }, { passive: true });
    },

    initDarkMode() {
        const toggle = document.getElementById('darkModeToggle');
        if (!toggle) return;

        const saved = localStorage.getItem('veilke_darkmode');
        if (saved === 'true') {
            document.documentElement.setAttribute('data-theme', 'dark');
            toggle.setAttribute('aria-pressed', 'true');
        }

        toggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                toggle.setAttribute('aria-pressed', 'false');
                localStorage.setItem('veilke_darkmode', 'false');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                toggle.setAttribute('aria-pressed', 'true');
                localStorage.setItem('veilke_darkmode', 'true');
            }
        });
    },

    initScrollAnimations() {
        const elements = document.querySelectorAll('.fade-up, .fade-in, .slide-in, .slide-in-right, .stagger-children');

        if (elements.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(el => observer.observe(el));
    },

    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const offset = 100;
                    const top = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        });
    },

    initScrollToTop() {
        const btn = document.getElementById('scrollToTop');
        if (!btn) return;

        const progressRing = btn.querySelector('.scroll-progress-ring circle');
        const circumference = progressRing ? 2 * Math.PI * 18 : 0;

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;

            if (scrollTop > 500) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }

            if (progressRing && docHeight > 0) {
                const offset = circumference - (scrollTop / docHeight) * circumference;
                progressRing.style.strokeDashoffset = offset;
            }
        }, { passive: true });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },

    initWhatsAppButton() {
        const btn = document.getElementById('whatsappBtn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const msg = encodeURIComponent(CONFIG.whatsappMessage);
            window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`, '_blank', 'noopener,noreferrer');
        });
    },

    initMobileMenu() {
        const toggle = document.getElementById('mobileMenuToggle');
        const menu = document.getElementById('navMenu');
        if (!toggle || !menu) return;

        const backdrop = document.createElement('div');
        backdrop.className = 'mobile-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');
        document.body.appendChild(backdrop);

        const closeMenu = () => {
            menu.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            backdrop.classList.remove('active');
            document.body.style.overflow = '';
        };

        const openMenu = () => {
            menu.classList.add('active');
            toggle.classList.add('active');
            toggle.setAttribute('aria-expanded', 'true');
            backdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        toggle.addEventListener('click', () => {
            const isOpen = menu.classList.contains('active');
            isOpen ? closeMenu() : openMenu();
        });

        backdrop.addEventListener('click', closeMenu);

        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && menu.classList.contains('active')) {
                closeMenu();
            }
        });
    },

    initNewsletterForm() {
        const form = document.getElementById('newsletterForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input[type="email"]');
            if (input && input.value) {
                const btn = form.querySelector('button');
                btn.textContent = 'Thank You!';
                btn.disabled = true;
                input.value = '';
                Toast.show('Thank you for subscribing!', 'success');
                setTimeout(() => {
                    btn.textContent = 'Subscribe';
                    btn.disabled = false;
                }, 3000);
            }
        });
    },

    countUpAnimation() {
        const counters = document.querySelectorAll('.count-up');
        if (counters.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.target);
                    const duration = parseInt(el.dataset.duration) || 2000;
                    this.animateCounter(el, target, duration);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(c => observer.observe(c));
    },

    animateCounter(el, target, duration) {
        const start = 0;
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * eased);
            el.textContent = current + (el.dataset.suffix || '');

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target + (el.dataset.suffix || '');
            }
        };

        requestAnimationFrame(update);
    },

    setActiveNavLink() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    initRippleEffect() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn, .filter-btn, .nav-action-btn, .gallery-thumb');
            if (!btn) return;

            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';

            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            btn.appendChild(ripple);

            ripple.addEventListener('animationend', () => {
                ripple.remove();
            });
        });
    },

    initTouchFeedback() {
        document.addEventListener('touchstart', (e) => {
            const card = e.target.closest('.product-card');
            if (card) {
                card.classList.add('touch-pressed');
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            document.querySelectorAll('.product-card.touch-pressed').forEach(c => {
                c.classList.remove('touch-pressed');
            });
        }, { passive: true });
    },

    initSafeArea() {
        if (CSS.supports('padding-bottom', 'env(safe-area-inset-bottom)')) {
            document.documentElement.style.setProperty('--safe-bottom', 'env(safe-area-inset-bottom)');
            document.documentElement.style.setProperty('--safe-top', 'env(safe-area-inset-top)');
        }
    }
};

const Toast = {
    container: null,

    init() {
        if (this.container) return;
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.setAttribute('aria-live', 'polite');
        document.body.appendChild(this.container);
    },

    show(message, type = 'info', duration = 3000) {
        this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');

        let icon = '';
        if (type === 'success') icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
        else if (type === 'error') icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
        else if (type === 'heart') icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

        toast.innerHTML = `${icon}<span>${message}</span>`;
        this.container.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('toast-visible'));

        setTimeout(() => {
            toast.classList.remove('toast-visible');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

const WishlistManager = {
    storageKey: 'veilke_wishlist',

    getAll() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch { return []; }
    },

    has(productName) {
        return this.getAll().includes(productName);
    },

    toggle(productName) {
        let items = this.getAll();
        const index = items.indexOf(productName);

        if (index === -1) {
            items.push(productName);
            localStorage.setItem(this.storageKey, JSON.stringify(items));
            Toast.show('Added to wishlist!', 'heart');
            return true;
        } else {
            items.splice(index, 1);
            localStorage.setItem(this.storageKey, JSON.stringify(items));
            Toast.show('Removed from wishlist', 'info');
            return false;
        }
    },

    updateButton(btn, productName) {
        const isWishlisted = this.has(productName);
        btn.classList.toggle('active', isWishlisted);
        const icon = btn.querySelector('svg');
        if (icon) {
            icon.setAttribute('fill', isWishlisted ? 'currentColor' : 'none');
        }
    }
};

const SwipeGesture = {
    on(el, { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50 }) {
        let startX = 0;
        let startY = 0;

        el.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        el.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = endX - startX;
            const diffY = endY - startY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > threshold) {
                    if (diffX > 0 && onSwipeRight) onSwipeRight(e);
                    else if (diffX < 0 && onSwipeLeft) onSwipeLeft(e);
                }
            } else {
                if (Math.abs(diffY) > threshold) {
                    if (diffY > 0 && onSwipeDown) onSwipeDown(e);
                    else if (diffY < 0 && onSwipeUp) onSwipeUp(e);
                }
            }
        }, { passive: true });
    }
};
