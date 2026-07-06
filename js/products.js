const ProductsRenderer = {
    currentProducts: [],
    filteredProducts: [],
    currentPage: 1,
    currentSort: 'newest',
    currentCategory: 'all',
    isLoading: false,
    hasMore: true,
    clickStoreKey: 'veilke_clicks',

    async init() {
        this.currentProducts = await GitHubAPI.loadProducts();
        this.filteredProducts = [...this.currentProducts];

        document.addEventListener('productsUpdated', (e) => {
            this.currentProducts = e.detail;
            this.filteredProducts = [...this.currentProducts];
            this.renderAll();
        });

        this.renderAll();

        if (document.getElementById('productGrid')) {
            this.setupFilters();
            this.applyUrlParams();
            this.render();
        }
    },

    renderAll() {
        const hasFeatured = document.getElementById('featuredProducts');
        const hasBest = document.getElementById('bestSellers');
        const hasNew = document.getElementById('newArrivals');
        const hasPremium = document.getElementById('premiumCollection');
        if (!hasFeatured && !hasBest && !hasNew && !hasPremium) return;

        if (!this.currentProducts.length) return;

        if (hasFeatured) this.renderFeatured();
        if (hasBest) this.renderBestSellers();
        if (hasNew) this.renderNewArrivals();
        if (hasPremium) this.renderPremium();
    },

    applyUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const category = params.get('category');
        if (category) {
            this.currentCategory = category;
            const btn = document.querySelector(`.filter-btn[data-category="${category}"]`);
            if (btn) {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }

            const filterBar = document.querySelector('.shop-filters');
            if (filterBar && btn) {
                setTimeout(() => {
                    btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }, 300);
            }
        }
    },

    getUniqueCategories() {
        const cats = new Set();
        this.currentProducts.forEach(p => {
            if (p.category) cats.add(p.category);
        });
        return Array.from(cats).sort();
    },

    setupFilters() {
        const container = document.getElementById('categoryFilters');
        if (!container) return;

        const categories = this.getUniqueCategories();
        let html = '<button class="filter-btn active" data-category="all">All</button>';

        categories.forEach(cat => {
            const formatted = GitHubAPI.formatCategoryName(cat);
            html += `<button class="filter-btn" data-category="${cat}">${formatted}</button>`;
        });

        container.innerHTML = html;

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;

            container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            this.currentCategory = btn.dataset.category;
            this.currentPage = 1;
            this.applyFilters();

            const newUrl = btn.dataset.category === 'all'
                ? window.location.pathname
                ? `?category=${btn.dataset.category}`
                : window.location.pathname
                : window.location.pathname + `?category=${btn.dataset.category}`;

            if (window.history.replaceState) {
                window.history.replaceState({}, '', newUrl);
            }
        });

        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.currentSort = sortSelect.value;
                this.currentPage = 1;
                this.applyFilters();
            });
        }

        const filterWrap = container.closest('.filter-btns');
        if (filterWrap) {
            let isDown = false;
            let startX = 0;
            let scrollLeft = 0;

            filterWrap.addEventListener('mousedown', (e) => {
                isDown = true;
                startX = e.pageX - filterWrap.offsetLeft;
                scrollLeft = filterWrap.scrollLeft;
                filterWrap.style.cursor = 'grabbing';
            });

            filterWrap.addEventListener('mouseleave', () => {
                isDown = false;
                filterWrap.style.cursor = '';
            });

            filterWrap.addEventListener('mouseup', () => {
                isDown = false;
                filterWrap.style.cursor = '';
            });

            filterWrap.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - filterWrap.offsetLeft;
                const walk = (x - startX) * 2;
                filterWrap.scrollLeft = scrollLeft - walk;
            });
        }
    },

    applyFilters() {
        let filtered = [...this.currentProducts];

        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(p => p.category === this.currentCategory);
        }

        const searchQuery = window.SearchEngine?.getQuery()?.toLowerCase() || '';
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(searchQuery) ||
                p.categoryFormatted?.toLowerCase().includes(searchQuery) ||
                p.name.toLowerCase().includes(searchQuery)
            );
        }

        switch (this.currentSort) {
            case 'newest':
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'oldest':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'az':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'za':
                filtered.sort((a, b) => b.title.localeCompare(a.title));
                break;
        }

        this.filteredProducts = filtered;
        this.currentPage = 1;
        this.hasMore = true;
        this.render();
    },

    render(append = false) {
        const grid = document.getElementById('productGrid');
        if (!grid) return;

        if (!append) {
            grid.innerHTML = '';
            this.currentPage = 1;
        }

        const start = append ? (this.currentPage - 1) * CONFIG.itemsPerPage : 0;
        const end = this.currentPage * CONFIG.itemsPerPage;
        const pageItems = this.filteredProducts.slice(start, end);

        if (pageItems.length === 0 && !append) {
            grid.innerHTML = this.getEmptyState();
            this.hasMore = false;
            return;
        }

        pageItems.forEach(product => {
            grid.appendChild(this.createCard(product));
        });

        this.hasMore = end < this.filteredProducts.length;
        this.updateProductCount();
        this.setupInfiniteScroll();
    },

    loadMore() {
        if (this.isLoading || !this.hasMore) return;
        this.isLoading = true;
        this.currentPage++;
        this.render(true);
        this.isLoading = false;
    },

    setupInfiniteScroll() {
        const sentinel = document.getElementById('scrollSentinel');
        if (!sentinel) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && this.hasMore && !this.isLoading) {
                this.loadMore();
            }
        }, { rootMargin: '200px' });

        if (this._observer) this._observer.disconnect();
        observer.observe(sentinel);
        this._observer = observer;
    },

    updateProductCount() {
        const countEl = document.getElementById('productCount');
        if (!countEl) return;
        const shown = Math.min(this.currentPage * CONFIG.itemsPerPage, this.filteredProducts.length);
        countEl.textContent = `${shown} of ${this.filteredProducts.length} products`;
    },

    getEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                </div>
                <h3>No Products Found</h3>
                <p>Upload abaya images to the <strong>products/</strong> folder in your GitHub repository to see them here.</p>
            </div>
        `;
    },

    createCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('role', 'article');
        card.setAttribute('aria-label', product.title);

        const isWishlisted = WishlistManager.has(product.name);

        card.innerHTML = `
            <div class="product-card-image">
                <img
                    src="${product.url}"
                    alt="${product.title}"
                    loading="lazy"
                    class="product-img"
                    onerror="this.parentElement.innerHTML = '<div class=\\'img-placeholder\\'><svg width=\\'48\\' height=\\'48\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\' ry=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><polyline points=\\'21 15 16 10 5 21\\'/></svg></div>'"
                    onload="this.classList.add('loaded')"
                >
                <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" aria-label="${isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
                <button class="cart-btn" data-product='${this.escapeJson(JSON.stringify(product))}' aria-label="Add to cart">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                </button>
                <div class="product-card-overlay">
                    <button class="quick-view-btn" data-product='${this.escapeJson(JSON.stringify(product))}'>
                        Quick View
                    </button>
                </div>
            </div>
            <div class="product-card-info">
                <span class="product-category">${product.categoryFormatted || 'Collection'}</span>
                <h3 class="product-title">${product.title}</h3>
                ${product.price ? `<span class="product-price">${product.price}</span>` : ''}
                <a href="${product.url}" target="_blank" class="view-btn" rel="noopener noreferrer">
                    View Product
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                    </svg>
                </a>
            </div>
        `;

        const img = card.querySelector('.product-img');
        if (img) {
            img.addEventListener('click', (e) => {
                if (!e.target.closest('.wishlist-btn')) {
                    this.trackClick(product.name);
                    this.openQuickView(product);
                }
            });
        }

        const cardBody = card.querySelector('.product-card-info');
        if (cardBody) {
            cardBody.addEventListener('click', () => {
                this.trackClick(product.name);
                this.openQuickView(product);
            });
        }

        const quickViewBtn = card.querySelector('.quick-view-btn');
        if (quickViewBtn) {
            quickViewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const data = JSON.parse(quickViewBtn.dataset.product);
                this.trackClick(data.name);
                this.openQuickView(data);
            });
        }

        const wishlistBtn = card.querySelector('.wishlist-btn');
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                WishlistManager.toggle(product.name);
                WishlistManager.updateButton(wishlistBtn, product.name);
                wishlistBtn.setAttribute(
                    'aria-label',
                    wishlistBtn.classList.contains('active') ? 'Remove from wishlist' : 'Add to wishlist'
                );
            });
        }

        const cartBtn = card.querySelector('.cart-btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const data = JSON.parse(cartBtn.dataset.product);
                CartManager.add(data);
                cartBtn.classList.add('added');
                setTimeout(() => cartBtn.classList.remove('added'), 800);
            });
        }

        return card;
    },

    trackClick(productName) {
        try {
            const raw = localStorage.getItem(this.clickStoreKey);
            const clicks = raw ? JSON.parse(raw) : {};
            clicks[productName] = (clicks[productName] || 0) + 1;
            localStorage.setItem(this.clickStoreKey, JSON.stringify(clicks));
        } catch {}
    },

    getClickCounts() {
        try {
            const raw = localStorage.getItem(this.clickStoreKey);
            return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
    },

    escapeJson(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    },

    openQuickView(product) {
        const overlay = document.getElementById('quickViewOverlay');
        const modal = document.getElementById('quickViewModal');
        if (!overlay || !modal) return;

        const content = modal.querySelector('.quick-view-content') || modal;
        document.body.style.overflow = 'hidden';

        const isWishlisted = WishlistManager.has(product.name);

        content.innerHTML = `
            <button class="modal-close" aria-label="Close quick view">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
            <div class="quick-view-body">
                <div class="quick-view-image">
                    <img src="${product.url}" alt="${product.title}" class="zoomable-img" id="zoomImg">
                    <div class="quick-view-nav">
                        <span class="product-category-tag">${product.categoryFormatted || 'Collection'}</span>
                    </div>
                </div>
                <div class="quick-view-details">
                    <h2>${product.title}</h2>
                    <span class="quick-view-category">${product.categoryFormatted || 'Collection'}</span>
                    ${product.description ? `<p class="quick-view-desc">${product.description}</p>` : ''}
                    ${product.price ? `<p class="quick-view-price">${product.price}</p>` : ''}
                    <div class="quick-view-actions">
                        <button class="btn btn-primary cart-toggle-btn" data-product='${this.escapeJson(JSON.stringify(product))}'>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                            </svg>
                            <span>Add to Cart</span>
                        </button>
                        <button class="btn btn-outline wishlist-toggle-btn ${isWishlisted ? 'active' : ''}" data-product-name="${product.name}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            <span>${isWishlisted ? 'Wishlisted' : 'Save'}</span>
                        </button>
                        <a href="${product.url}" target="_blank" class="btn btn-outline" rel="noopener noreferrer">
                            View Full Image
                        </a>
                        <button class="btn btn-outline share-btn" aria-label="Share product">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                            </svg>
                            Share
                        </button>
                    </div>
                </div>
            </div>
        `;

        overlay.classList.add('active');
        modal.classList.add('active');

        const closeModal = () => {
            overlay.classList.remove('active');
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };

        overlay.addEventListener('click', closeModal);
        modal.querySelector('.modal-close')?.addEventListener('click', closeModal);

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });

        const cartToggle = modal.querySelector('.cart-toggle-btn');
        if (cartToggle) {
            cartToggle.addEventListener('click', () => {
                const data = JSON.parse(cartToggle.dataset.product);
                CartManager.add(data);
                const text = cartToggle.querySelector('span');
                if (text) {
                    text.textContent = 'Added! ✓';
                    setTimeout(() => { text.textContent = 'Add to Cart'; }, 1500);
                }
            });
        }

        const wishlistToggle = modal.querySelector('.wishlist-toggle-btn');
        if (wishlistToggle) {
            wishlistToggle.addEventListener('click', () => {
                const name = wishlistToggle.dataset.productName;
                WishlistManager.toggle(name);
                const isNow = WishlistManager.has(name);
                wishlistToggle.classList.toggle('active', isNow);
                const icon = wishlistToggle.querySelector('svg');
                const text = wishlistToggle.querySelector('span');
                if (icon) icon.setAttribute('fill', isNow ? 'currentColor' : 'none');
                if (text) text.textContent = isNow ? 'Wishlisted' : 'Save';

                const cardBtn = document.querySelector(`.wishlist-btn[data-product-name="${name}"]`);
                if (cardBtn) WishlistManager.updateButton(cardBtn, name);
            });
        }

        const shareBtn = modal.querySelector('.share-btn');
        if (shareBtn && navigator.share) {
            shareBtn.addEventListener('click', () => {
                navigator.share({
                    title: product.title,
                    url: product.url
                }).catch(() => {});
            });
        } else if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(product.url).then(() => {
                    Toast.show('Link copied to clipboard!', 'success');
                }).catch(() => {});
            });
        }

        const zoomImg = document.getElementById('zoomImg');
        if (zoomImg) {
            zoomImg.addEventListener('mousemove', (e) => {
                const rect = zoomImg.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                zoomImg.style.transformOrigin = `${x}% ${y}%`;
                zoomImg.style.transform = 'scale(2)';
            });
            zoomImg.addEventListener('mouseleave', () => {
                zoomImg.style.transformOrigin = 'center center';
                zoomImg.style.transform = 'scale(1)';
            });

            if (typeof SwipeGesture !== 'undefined') {
                SwipeGesture.on(zoomImg, {
                    onSwipeDown: closeModal,
                    threshold: 80
                });
            }
        }

        if (typeof SwipeGesture !== 'undefined') {
            SwipeGesture.on(modal, {
                onSwipeDown: closeModal,
                threshold: 100
            });
        }
    },

    renderFeatured() {
        const container = document.getElementById('featuredProducts');
        if (!container) return;

        const featured = this.currentProducts
            .filter(p => p.category === 'collections')
            .slice(0, 4);

        const items = featured.length ? featured : this.currentProducts.slice(0, 4);

        container.innerHTML = '';
        items.forEach(product => {
            container.appendChild(this.createCard(product));
        });
    },

    renderBestSellers() {
        const container = document.getElementById('bestSellers');
        if (!container) return;

        const counts = this.getClickCounts();
        const sorted = [...this.currentProducts].sort((a, b) => {
            return (counts[b.name] || 0) - (counts[a.name] || 0);
        });

        const items = sorted.slice(0, 4);

        container.innerHTML = '';
        items.forEach(product => {
            container.appendChild(this.createCard(product));
        });
    },

    renderNewArrivals() {
        const container = document.getElementById('newArrivals');
        if (!container) return;

        const news = this.currentProducts
            .filter(p => p.category === 'new')
            .slice(0, 4);

        const items = news.length ? news : this.currentProducts.slice(0, 4);

        container.innerHTML = '';
        items.forEach(product => {
            container.appendChild(this.createCard(product));
        });
    },

    renderPremium() {
        const container = document.getElementById('premiumCollection');
        if (!container) return;

        const premium = this.currentProducts
            .filter(p => p.category === 'premium')
            .slice(0, 4);

        const items = premium.length ? premium : this.currentProducts.slice(0, 4);

        container.innerHTML = '';
        items.forEach(product => {
            container.appendChild(this.createCard(product));
        });
    }
};
