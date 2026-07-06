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
        this.initCart();

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
    },

    initCart() {
        const html = `
            <button class="cart-fab" id="cartFab" aria-label="Open cart">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <span class="cart-badge" id="cartBadge">0</span>
            </button>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        document.getElementById('cartFab').addEventListener('click', () => CartManager.openPanel());
        CartManager.createPanel();
        CartManager.updateBadge();
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

const CartManager = {
    storageKey: 'veilke_cart',

    getAll() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch { return []; }
    },

    add(product) {
        const key = product.path || product.name;
        let items = this.getAll();
        const existing = items.find(i => i.key === key);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            items.push({
                key: key,
                name: product.name,
                title: product.title,
                category: product.category,
                categoryFormatted: product.categoryFormatted,
                url: product.url,
                quantity: 1
            });
        }
        localStorage.setItem(this.storageKey, JSON.stringify(items));
        this.updateBadge();
        Toast.show('Added to cart! 🛍️', 'success');
    },

    remove(key) {
        let items = this.getAll().filter(i => i.key !== key);
        localStorage.setItem(this.storageKey, JSON.stringify(items));
        this.updateBadge();
        this.renderPanel();
        Toast.show('Removed from cart', 'info');
    },

    clear() {
        localStorage.removeItem(this.storageKey);
        this.updateBadge();
        this.renderPanel();
    },

    getCount() {
        return this.getAll().reduce((sum, i) => sum + (i.quantity || 1), 0);
    },

    isInCart(key) {
        return this.getAll().some(i => i.key === key);
    },

    updateBadge() {
        const badge = document.getElementById('cartBadge');
        if (!badge) return;
        const count = this.getCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    },

    createPanel() {
        if (document.getElementById('cartPanel')) return;
        const html = `
            <div class="cart-overlay" id="cartOverlay"></div>
            <div class="cart-panel" id="cartPanel">
                <div class="cart-panel-header">
                    <h3>Shopping Cart</h3>
                    <button class="cart-close-btn" id="cartClose" aria-label="Close cart">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="cart-panel-body" id="cartPanelBody">
                    <div class="cart-empty">Your cart is empty</div>
                </div>
                <div class="cart-panel-footer" id="cartPanelFooter" style="display:none">
                    <div class="cart-total" id="cartTotal">0 items</div>
                    <button class="btn btn-primary cart-whatsapp-btn" id="cartWhatsappBtn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Send Order via WhatsApp
                    </button>
                    <button class="btn btn-outline cart-clear-btn" id="cartClearBtn">Clear All</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);

        document.getElementById('cartOverlay').addEventListener('click', () => this.closePanel());
        document.getElementById('cartClose').addEventListener('click', () => this.closePanel());
        document.getElementById('cartClearBtn').addEventListener('click', () => this.clear());
        document.getElementById('cartWhatsappBtn').addEventListener('click', () => this.sendToWhatsApp());
    },

    openPanel() {
        this.createPanel();
        this.renderPanel();
        document.getElementById('cartOverlay').classList.add('active');
        document.getElementById('cartPanel').classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closePanel() {
        const overlay = document.getElementById('cartOverlay');
        const panel = document.getElementById('cartPanel');
        if (overlay) overlay.classList.remove('active');
        if (panel) panel.classList.remove('active');
        document.body.style.overflow = '';
    },

    renderPanel() {
        const body = document.getElementById('cartPanelBody');
        const footer = document.getElementById('cartPanelFooter');
        const total = document.getElementById('cartTotal');
        if (!body) return;

        const items = this.getAll();
        if (!items.length) {
            body.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
            if (footer) footer.style.display = 'none';
            return;
        }

        if (footer) footer.style.display = 'block';
        if (total) total.textContent = `${this.getCount()} item${this.getCount() !== 1 ? 's' : ''}`;

        body.innerHTML = items.map((item, i) => `
            <div class="cart-item">
                <img class="cart-item-img" src="${item.url}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-category">${item.categoryFormatted || 'Collection'}</div>
                    <div class="cart-item-qty">Qty: ${item.quantity || 1}</div>
                </div>
                <button class="cart-item-remove" data-key="${item.key}" aria-label="Remove ${item.title}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `).join('');

        body.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => this.remove(btn.dataset.key));
        });
    },

    sendToWhatsApp() {
        const items = this.getAll();
        if (!items.length) return;

        const lines = items.map((item, i) =>
            `${i + 1}. ${item.title} (${item.categoryFormatted || 'Collection'}) - Qty: ${item.quantity || 1}\n   View: ${item.url}`
        );

        const msg = encodeURIComponent(
            `Hi Veil.ke! I'd like to order:\n\n${lines.join('\n\n')}\n\nPlease assist with pricing and availability. 🤍`
        );
        window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`, '_blank', 'noopener,noreferrer');
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
