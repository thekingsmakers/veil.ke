const Gallery = {
    async init() {
        const container = document.getElementById('galleryGrid');
        if (!container) return;

        const images = await GitHubAPI.loadGalleryImages(20);
        if (images.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>Upload images to see the gallery</p></div>`;
            return;
        }

        this.renderMasonry(container, images);
    },

    renderMasonry(container, images) {
        container.innerHTML = '';
        container.style.setProperty('--gallery-count', images.length);

        images.forEach((img, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.style.setProperty('--gallery-index', index);
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            item.setAttribute('aria-label', `Gallery image: ${img.title}`);

            item.innerHTML = `
                <div class="gallery-item-inner">
                    <img
                        src="${img.url}"
                        alt="${img.title}"
                        loading="lazy"
                        onload="this.classList.add('loaded')"
                        onerror="this.parentElement.innerHTML = '<div class=\\'img-placeholder\\' style=\\'height:200px\\'></div>'"
                    >
                    <div class="gallery-item-overlay">
                        <span>${img.title}</span>
                    </div>
                </div>
            `;

            item.addEventListener('click', () => this.openGalleryViewer(images, index));
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openGalleryViewer(images, index);
                }
            });

            container.appendChild(item);
        });
    },

    openGalleryViewer(images, startIndex) {
        let currentIndex = startIndex;

        const overlay = document.createElement('div');
        overlay.className = 'gallery-viewer-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-label', 'Image gallery viewer');

        const updateViewer = () => {
            const img = images[currentIndex];
            overlay.innerHTML = `
                <button class="gallery-viewer-close" aria-label="Close gallery viewer">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
                <button class="gallery-viewer-prev" aria-label="Previous image">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </button>
                <button class="gallery-viewer-next" aria-label="Next image">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                </button>
                <div class="gallery-viewer-content">
                    <img src="${img.url}" alt="${img.title}" class="gallery-viewer-img" style="opacity:0;transition:opacity 0.3s" onload="this.style.opacity='1'">
                    <div class="gallery-viewer-info">
                        <span>${img.title}</span>
                        <span>${currentIndex + 1} / ${images.length}</span>
                    </div>
                </div>
                <div class="gallery-thumbnails">
                    ${images.map((thumb, i) => `
                        <div class="gallery-thumb ${i === currentIndex ? 'active' : ''}" data-index="${i}">
                            <img src="${thumb.url}" alt="" loading="lazy">
                        </div>
                    `).join('')}
                </div>
            `;
        };

        updateViewer();
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        setTimeout(() => overlay.classList.add('active'), 10);

        const navigate = (direction) => {
            currentIndex = (currentIndex + direction + images.length) % images.length;
            updateViewer();
            this.attachViewerEvents(overlay, images, currentIndex, navigate);
        };

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeViewer(overlay);
            }
        });

        overlay.querySelector('.gallery-viewer-close')?.addEventListener('click', () => this.closeViewer(overlay));
        overlay.querySelector('.gallery-viewer-prev')?.addEventListener('click', () => navigate(-1));
        overlay.querySelector('.gallery-viewer-next')?.addEventListener('click', () => navigate(1));

        overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeViewer(overlay);
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
        });

        let touchStartX = 0;
        overlay.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        overlay.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(diff) > 50) {
                navigate(diff > 0 ? -1 : 1);
            }
        }, { passive: true });
    },

    attachViewerEvents(overlay, images, currentIndex, navigate) {
        overlay.querySelector('.gallery-viewer-close')?.addEventListener('click', () => this.closeViewer(overlay));
        overlay.querySelector('.gallery-viewer-prev')?.addEventListener('click', () => navigate(-1));
        overlay.querySelector('.gallery-viewer-next')?.addEventListener('click', () => navigate(1));

        overlay.querySelectorAll('.gallery-thumb').forEach(thumb => {
            thumb.addEventListener('click', () => {
                const i = parseInt(thumb.dataset.index);
                if (!isNaN(i)) {
                    currentIndex = i;
                    navigate(0);
                }
            });
        });
    },

    closeViewer(overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = '';
        }, 300);
    }
};
