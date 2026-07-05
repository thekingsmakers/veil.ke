const SearchEngine = {
    searchInput: null,
    searchResults: null,
    searchOverlay: null,
    debounceTimer: null,
    currentQuery: '',

    init() {
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.searchOverlay = document.getElementById('searchOverlay');

        if (!this.searchInput) return;

        this.searchInput.addEventListener('input', () => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => this.search(), 300);
        });

        this.searchInput.addEventListener('focus', () => {
            if (this.currentQuery) this.showResults();
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideResults();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideResults();
                this.searchInput?.blur();
            }
            if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
                const active = document.activeElement;
                if (active?.tagName !== 'INPUT' && active?.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    this.searchInput?.focus();
                }
            }
        });
    },

    getQuery() {
        return this.currentQuery;
    },

    setQuery(query) {
        this.currentQuery = query;
        if (this.searchInput) {
            this.searchInput.value = query;
        }
    },

    search() {
        this.currentQuery = this.searchInput?.value?.trim() || '';
        const products = ProductsRenderer.currentProducts;

        if (!this.currentQuery) {
            this.hideResults();
            if (document.getElementById('productGrid')) {
                ProductsRenderer.applyFilters();
            }
            return;
        }

        const query = this.currentQuery.toLowerCase();
        const results = products.filter(p =>
            p.title.toLowerCase().includes(query) ||
            (p.categoryFormatted && p.categoryFormatted.toLowerCase().includes(query)) ||
            p.name.toLowerCase().includes(query)
        );

        this.renderResults(results);

        if (document.getElementById('productGrid')) {
            ProductsRenderer.applyFilters();
        }
    },

    renderResults(results) {
        if (!this.searchResults) return;

        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-result-empty">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <p>No results for "${this.currentQuery}"</p>
                </div>
            `;
        } else {
            this.searchResults.innerHTML = `
                <div class="search-result-header">
                    <span>${results.length} product${results.length !== 1 ? 's' : ''} found</span>
                </div>
                <div class="search-result-list">
                    ${results.slice(0, 8).map(p => `
                        <a href="${p.url}" target="_blank" class="search-result-item" rel="noopener noreferrer">
                            <img src="${p.url}" alt="${p.title}" loading="lazy" onerror="this.style.display='none'">
                            <div class="search-result-info">
                                <span class="search-result-title">${p.title}</span>
                                <span class="search-result-category">${p.categoryFormatted || 'Collection'}</span>
                            </div>
                        </a>
                    `).join('')}
                    ${results.length > 8 ? `<div class="search-result-more">+${results.length - 8} more products</div>` : ''}
                </div>
            `;
        }

        this.showResults();
    },

    showResults() {
        if (this.searchResults) {
            this.searchResults.classList.add('active');
        }
        if (this.searchOverlay) {
            this.searchOverlay.classList.add('active');
        }
    },

    hideResults() {
        if (this.searchResults) {
            this.searchResults.classList.remove('active');
        }
        if (this.searchOverlay) {
            this.searchOverlay.classList.remove('active');
        }
    }
};
