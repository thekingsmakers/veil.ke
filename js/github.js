const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

const GitHubAPI = {
    cacheKey: 'veilke_products_cache',
    cacheTimestamp: 'veilke_cache_time',

    getRawUrl(path) {
        return `https://raw.githubusercontent.com/${CONFIG.githubUser}/${CONFIG.repository}/${CONFIG.branch}/${path}`;
    },

    getMetadataUrl() {
        return `https://raw.githubusercontent.com/${CONFIG.githubUser}/${CONFIG.repository}/${CONFIG.branch}/${CONFIG.productFolder}/products.json`;
    },

    isImageFile(filename) {
        const ext = filename.split('.').pop()?.toLowerCase();
        return IMAGE_EXTENSIONS.includes(ext);
    },

    filenameToTitle(filename) {
        let name = filename.replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
        let title = name
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase())
            .replace(/\d+/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        const words = title.split(' ');
        if (words.length > 5) {
            title = words.slice(0, 5).join(' ');
        }
        return title || 'Abaya Collection';
    },

    formatCategoryName(category) {
        if (CONFIG.categoryDisplayNames && CONFIG.categoryDisplayNames[category]) {
            return CONFIG.categoryDisplayNames[category];
        }
        return category
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    },

    isCacheValid() {
        const cached = localStorage.getItem(this.cacheTimestamp);
        if (!cached) return false;
        const age = Date.now() - parseInt(cached);
        return age < CONFIG.cacheDuration;
    },

    getCachedProducts() {
        try {
            const data = localStorage.getItem(this.cacheKey);
            return data ? JSON.parse(data) : null;
        } catch { return null; }
    },

    setCachedProducts(products) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(products));
            localStorage.setItem(this.cacheTimestamp, Date.now().toString());
        } catch { /* storage full */ }
    },

    buildProduct(item, category) {
        return {
            name: item.filename,
            path: `${CONFIG.productFolder}/${category}/${item.filename}`,
            url: this.getRawUrl(`${CONFIG.productFolder}/${category}/${item.filename}`),
            category: category,
            categoryFormatted: this.formatCategoryName(category),
            title: item.title || this.filenameToTitle(item.filename),
            price: item.price || null,
            description: item.description || null,
            featured: item.featured || false
        };
    },

    async loadProducts() {
        const forceRefresh = window.location.search.includes('refresh=1');
        if (!forceRefresh) {
            const cached = this.getCachedProducts();
            if (cached && this.isCacheValid()) {
                console.log('[GitHubAPI] Using cached products');
                return cached;
            }
        }

        console.log('[GitHubAPI] Fetching products...');
        const products = await this.loadProductsFresh();
        if (products && products.length) {
            console.log('[GitHubAPI] Loaded', products.length, 'products');
            this.setCachedProducts(products);
            return products;
        }

        console.warn('[GitHubAPI] No products loaded, returning cache');
        return this.getCachedProducts() || [];
    },

    async loadProductsFresh() {
        const treeProducts = await this.loadFromTreeAPI();
        if (treeProducts && treeProducts.length) {
            return treeProducts;
        }
        return this.loadFromProductsJSON();
    },

    async loadFromTreeAPI() {
        try {
            const url = `https://api.github.com/repos/${CONFIG.githubUser}/${CONFIG.repository}/git/trees/${CONFIG.branch}?recursive=1`;
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(url, {
                signal: controller.signal,
                headers: { 'Accept': 'application/vnd.github.v3+json' }
            });
            clearTimeout(timeout);
            if (!response.ok) {
                console.warn('[GitHubAPI] Tree API returned', response.status, '- falling back to products.json');
                return null;
            }

            const data = await response.json();
            if (!data.tree) return null;

            const products = [];
            const imageExts = new Set(IMAGE_EXTENSIONS);

            data.tree.forEach(item => {
                if (item.type !== 'blob') return;
                if (!item.path.startsWith(CONFIG.productFolder + '/')) return;

                const parts = item.path.split('/');
                if (parts.length < 3) return;

                const category = parts[1];
                const filename = parts.slice(2).join('/');

                const ext = filename.split('.').pop()?.toLowerCase();
                if (!ext || !imageExts.has(ext)) return;

                products.push(this.buildProduct({ filename }, category));
            });

            if (!products.length) return null;

            products.sort((a, b) => a.name.localeCompare(b.name));
            return products;
        } catch (err) {
            console.warn('[GitHubAPI] Tree API failed:', err.message, '- falling back to products.json');
            return null;
        }
    },

    async loadFromProductsJSON() {
        try {
            console.log('[GitHubAPI] Fetching products.json...');
            const response = await fetch(this.getMetadataUrl());
            if (!response.ok) {
                console.warn('[GitHubAPI] products.json returned', response.status);
                return [];
            }

            const metadata = await response.json();
            if (!Array.isArray(metadata)) return [];

            const products = metadata
                .filter(item => item.filename && item.category && this.isImageFile(item.filename))
                .map(item => this.buildProduct(item, item.category));

            products.sort((a, b) => a.name.localeCompare(b.name));
            return products;
        } catch (err) {
            console.warn('[GitHubAPI] products.json fetch failed:', err.message);
            return [];
        }
    },

    async loadGalleryImages(count = 20) {
        const products = await this.loadProducts();
        const shuffled = [...products].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
};
