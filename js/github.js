const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

const GitHubAPI = {
    cacheKey: 'veilke_products_cache',
    metaKey: 'veilke_metadata_cache',
    cacheTimestamp: 'veilke_cache_time',

    getApiUrl(path) {
        return `https://api.github.com/repos/${CONFIG.githubUser}/${CONFIG.repository}/contents/${path}`;
    },

    getRawUrl(path) {
        return `https://raw.githubusercontent.com/${CONFIG.githubUser}/${CONFIG.repository}/${CONFIG.branch}/${path}`;
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

    getCategoryFromPath(path) {
        const parts = path.split('/');
        if (parts.length >= 2) {
            return parts[parts.length - 2];
        }
        return 'uncategorized';
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
        } catch {
            return null;
        }
    },

    setCachedProducts(products) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(products));
            localStorage.setItem(this.cacheTimestamp, Date.now().toString());
        } catch {
            /* storage full */
        }
    },

    getCachedMetadata() {
        try {
            const data = localStorage.getItem(this.metaKey);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },

    setCachedMetadata(meta) {
        try {
            localStorage.setItem(this.metaKey, JSON.stringify(meta));
        } catch {
            /* storage full */
        }
    },

    async fetchFromApi(path) {
        const url = this.getApiUrl(path);
        try {
            const response = await fetch(url, {
                headers: { Accept: 'application/vnd.github.v3+json' }
            });
            if (response.status === 403) {
                console.warn('GitHub API rate limit reached. Using cached data.');
                return null;
            }
            if (!response.ok) return null;
            return await response.json();
        } catch {
            return null;
        }
    },

    async fetchMetadata() {
        const data = await this.fetchFromApi(`${CONFIG.productFolder}/products.json`);
        if (!data || data.type === 'dir') return null;
        try {
            const response = await fetch(data.download_url);
            if (!response.ok) return null;
            const meta = await response.json();
            this.setCachedMetadata(meta);
            return meta;
        } catch {
            return null;
        }
    },

    async scanFolder(path) {
        const items = await this.fetchFromApi(path);
        if (!items || !Array.isArray(items)) return [];

        let images = [];

        for (const item of items) {
            if (item.type === 'dir') {
                const subImages = await this.scanFolder(item.path);
                images = images.concat(subImages);
            } else if (this.isImageFile(item.name)) {
                images.push({
                    name: item.name,
                    path: item.path,
                    url: item.download_url || this.getRawUrl(item.path),
                    category: this.getCategoryFromPath(item.path),
                    categoryFormatted: this.formatCategoryName(this.getCategoryFromPath(item.path)),
                    title: this.filenameToTitle(item.name)
                });
            }
        }

        return images;
    },

    async loadProducts() {
        const cached = this.getCachedProducts();
        if (cached && this.isCacheValid()) {
            return cached;
        }

        if (cached) {
            this.loadProductsFresh().then(products => {
                if (products && products.length) {
                    this.setCachedProducts(products);
                    document.dispatchEvent(new CustomEvent('productsUpdated', { detail: products }));
                }
            });
            return cached;
        }

        const products = await this.loadProductsFresh();
        if (products && products.length) {
            this.setCachedProducts(products);
        }
        return products || [];
    },

    async loadProductsFresh() {
        try {
            const [images, metadata] = await Promise.all([
                this.scanFolder(CONFIG.productFolder),
                this.fetchMetadata()
            ]);

            if (metadata && Array.isArray(metadata)) {
                const metaMap = new Map();
                metadata.forEach(item => {
                    if (item.filename) {
                        metaMap.set(item.filename.toLowerCase(), item);
                    }
                });

                images.forEach(img => {
                    const meta = metaMap.get(img.name.toLowerCase());
                    if (meta) {
                        Object.assign(img, meta);
                    }
                });
            }

            images.sort((a, b) => a.name.localeCompare(b.name));
            return images;
        } catch {
            return [];
        }
    },

    async loadGalleryImages(count = 20) {
        const products = await this.loadProducts();
        const shuffled = [...products].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
};
