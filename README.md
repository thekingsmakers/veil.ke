# Veil.ke

> **Elegance in Modesty**

A premium luxury abaya e-commerce website built for GitHub Pages. Auto-discovers products from uploaded images via the GitHub API.

## Features

- Auto-loads products from GitHub repository
- No HTML editing needed when adding new abayas
- Dark mode with saved preference
- Instant search & category filtering
- Lightbox product viewer with zoom
- Instagram-style masonry gallery
- Fully responsive (desktop, tablet, phone)
- Lazy loading & skeleton loaders
- Floating WhatsApp order button
- SEO optimized with JSON-LD structured data
- Accessibility (ARIA labels, keyboard nav, screen reader support)

## Setup

### 1. Clone / Download

```bash
git clone https://github.com/thekingsmakers/veil.ke.git
cd veil.ke
```

### 2. Configure

Edit `js/config.js`:

```javascript
const CONFIG = {
    githubUser: "thekingsmakers",
    repository: "veil.ke",
    branch: "main",
    productFolder: "products",
    whatsappNumber: "254119973430",
    // ...
};
```

### 3. Upload Products

Add images into the appropriate folder inside `products/`:

```
products/
├── collections/       → Featured Collection (homepage)
│   └── abaya-cream-001.jpg
├── new/               → New Arrivals (homepage)
│   └── new-design-001.webp
├── premium/           → Premium Collection (homepage)
│   └── premium-gold-001.png
├── black/             → Black Collection
│   └── classic-black-001.jpg
└── colored/           → Colored Collection
    └── dusty-rose-001.png
```

**Folder names become categories automatically.**  
**Filenames become product titles.**  
**Best Sellers** are determined by user clicks (tracked locally in the browser).

### 4. Deploy to GitHub Pages

1. Push to GitHub
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch** → `main` → `/ (root)`
4. Save

### Optional: Product Metadata

Create `products/products.json`:

```json
[
    {
        "filename": "abaya-black-001.jpg",
        "price": "KES 4,500",
        "description": "Elegant black abaya with embroidered cuffs.",
        "featured": true,
        "bestSeller": true
    }
]
```

## Folder Structure

```
veil.ke/
├── index.html
├── shop.html
├── about.html
├── contact.html
├── faq.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── css/
│   ├── style.css
│   ├── animations.css
│   └── responsive.css
├── js/
│   ├── config.js
│   ├── github.js
│   ├── products.js
│   ├── search.js
│   ├── gallery.js
│   └── app.js
├── assets/
│   ├── logo/
│   ├── icons/
│   └── banners/
└── products/
    ├── collections/
    ├── new/
    ├── premium/
    ├── black/
    └── colored/
```

## Tech Stack

- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- Google Fonts (Playfair Display + Poppins)
- GitHub API (no backend)

## License

© 2024 Veil.ke — All rights reserved.
