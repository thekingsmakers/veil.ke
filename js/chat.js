const OPENROUTER_API_KEY = "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";
const CHAT_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

const AiChat = {
    isOpen: false,
    messages: [],
    suggestions: [
        "What sizes do you offer?",
        "Do you ship to Tanzania?",
        "How do I style an abaya?",
        "What fabrics do you use?",
        "Tell me about your collections"
    ],

    init() {
        this.createWidget();
        this.loadHistory();
        this.bindEvents();
    },

    createWidget() {
        if (document.getElementById('aiChatWidget')) return;

        const suggestionsHtml = this.suggestions.map(s =>
            `<button class="chat-suggestion" data-text="${this.escapeHtml(s)}">${this.escapeHtml(s)}</button>`
        ).join('');

        const html = `
            <div id="aiChatWidget" class="ai-chat-widget">
                <button class="ai-chat-toggle" id="aiChatToggle" aria-label="Open AI assistant">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        <line x1="12" y1="8" x2="12" y2="14"/><line x1="9" y1="11" x2="15" y2="11"/>
                    </svg>
                </button>
                <div class="ai-chat-panel" id="aiChatPanel">
                    <div class="ai-chat-header">
                        <div class="ai-chat-header-info">
                            <span class="ai-chat-header-title">Veil.ke Assistant</span>
                            <span class="ai-chat-header-sub">AI Styling Help</span>
                        </div>
                        <div class="ai-chat-header-actions">
                            <button class="ai-chat-clear" id="aiChatClear" aria-label="Clear chat">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                            </button>
                            <button class="ai-chat-close" id="aiChatClose" aria-label="Close chat">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="ai-chat-body" id="aiChatBody">
                        <div class="ai-chat-message ai-chat-bot">
                            <div class="ai-chat-avatar">
                                <svg width="16" height="16" viewBox="0 0 100 100" fill="none">
                                    <path d="M50 10 C25 10 10 30 10 50 C10 70 25 90 50 90 C75 90 90 70 90 50 C90 30 75 10 50 10Z" stroke="#8C6A4A" stroke-width="2" fill="none"/>
                                    <path d="M35 45 Q50 30 65 45 Q70 55 50 65 Q30 55 35 45Z" fill="#8C6A4A"/>
                                </svg>
                            </div>
                            <div class="ai-chat-bubble">
                                <p>Hi! I'm Veil.ke's AI styling assistant. I can help you with:</p>
                                <ul>
                                    <li>Product recommendations</li>
                                    <li>Sizing & fit advice</li>
                                    <li>Styling tips & inspiration</li>
                                    <li>Shipping & ordering info</li>
                                    <li>Fabric & care details</li>
                                </ul>
                                <p>How can I help you today? 💫</p>
                            </div>
                        </div>
                        <div class="chat-suggestions" id="chatSuggestions">
                            ${suggestionsHtml}
                        </div>
                    </div>
                    <div class="ai-chat-footer">
                        <div class="ai-chat-input-wrap">
                            <textarea class="ai-chat-input" id="aiChatInput" rows="1" placeholder="Type a message..." aria-label="Chat message"></textarea>
                            <button class="ai-chat-send" id="aiChatSend" aria-label="Send message">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/>
                                </svg>
                            </button>
                        </div>
                        <div class="ai-chat-footer-note">Responses are AI-generated</div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    },

    bindEvents() {
        const toggle = document.getElementById('aiChatToggle');
        const close = document.getElementById('aiChatClose');
        const clear = document.getElementById('aiChatClear');
        const send = document.getElementById('aiChatSend');
        const input = document.getElementById('aiChatInput');

        toggle?.addEventListener('click', () => this.toggle());
        close?.addEventListener('click', () => this.close());
        clear?.addEventListener('click', () => this.clearChat());
        send?.addEventListener('click', () => this.sendMessage());

        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 120) + 'px';
            });
        }

        document.getElementById('chatSuggestions')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.chat-suggestion');
            if (btn) {
                const text = btn.dataset.text;
                document.getElementById('aiChatInput').value = text;
                this.sendMessage();
            }
        });
    },

    toggle() {
        this.isOpen ? this.close() : this.open();
    },

    open() {
        this.isOpen = true;
        const panel = document.getElementById('aiChatPanel');
        const toggle = document.getElementById('aiChatToggle');
        if (panel) panel.classList.add('active');
        if (toggle) toggle.classList.add('active');
        setTimeout(() => document.getElementById('aiChatInput')?.focus(), 300);
    },

    close() {
        this.isOpen = false;
        const panel = document.getElementById('aiChatPanel');
        const toggle = document.getElementById('aiChatToggle');
        if (panel) panel.classList.remove('active');
        if (toggle) toggle.classList.remove('active');
    },

    clearChat() {
        if (!this.messages.length) return;
        this.messages = [];
        localStorage.removeItem('veilke_chat_history');
        const body = document.getElementById('aiChatBody');
        if (body) {
            const welcome = body.querySelector('.ai-chat-message');
            const suggestions = body.querySelector('.chat-suggestions');
            body.innerHTML = '';
            if (welcome) body.appendChild(welcome.cloneNode(true));
            if (suggestions) body.appendChild(suggestions.cloneNode(true));
        }
    },

    loadHistory() {
        try {
            const data = localStorage.getItem('veilke_chat_history');
            if (data) {
                this.messages = JSON.parse(data);
                this.messages.forEach(m => {
                    if (m.role === 'user' || m.role === 'assistant') {
                        this.renderMessage(m.role, m.content, false);
                    }
                });
            }
        } catch { this.messages = []; }
    },

    saveHistory() {
        try {
            const recent = this.messages.slice(-30);
            localStorage.setItem('veilke_chat_history', JSON.stringify(recent));
        } catch {}
    },

    addMessage(role, content) {
        this.messages.push({ role, content, timestamp: Date.now() });
        this.saveHistory();
    },

    renderMessage(role, content, showTimestamp = true) {
        const body = document.getElementById('aiChatBody');
        if (!body) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const div = document.createElement('div');
        div.className = `ai-chat-message ai-chat-${role === 'user' ? 'user' : 'bot'}`;

        if (role === 'assistant') {
            div.innerHTML = `
                <div class="ai-chat-avatar">
                    <svg width="16" height="16" viewBox="0 0 100 100" fill="none">
                        <path d="M50 10 C25 10 10 30 10 50 C10 70 25 90 50 90 C75 90 90 70 90 50 C90 30 75 10 50 10Z" stroke="#8C6A4A" stroke-width="2" fill="none"/>
                        <path d="M35 45 Q50 30 65 45 Q70 55 50 65 Q30 55 35 45Z" fill="#8C6A4A"/>
                    </svg>
                </div>
                <div class="ai-chat-bubble">
                    ${this.formatResponse(content)}
                    ${showTimestamp ? `<div class="ai-chat-time">${time}</div>` : ''}
                    <button class="chat-copy-btn" aria-label="Copy message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                    </button>
                </div>
            `;
        } else {
            div.innerHTML = `
                <div class="ai-chat-bubble ai-chat-bubble-user">
                    ${this.escapeHtml(content)}
                    ${showTimestamp ? `<div class="ai-chat-time ai-chat-time-user">${time}</div>` : ''}
                </div>
            `;
        }

        const suggestions = body.querySelector('.chat-suggestions');
        if (suggestions) {
            body.insertBefore(div, suggestions);
        } else {
            body.appendChild(div);
        }
        body.scrollTop = body.scrollHeight;

        if (role === 'assistant') {
            const copyBtn = div.querySelector('.chat-copy-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(content).then(() => {
                        copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
                        setTimeout(() => {
                            copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
                        }, 2000);
                    }).catch(() => {});
                });
            }
        }
    },

    showTyping() {
        const body = document.getElementById('aiChatBody');
        if (!body) return;

        this.removeTyping();
        const div = document.createElement('div');
        div.className = 'ai-chat-message ai-chat-bot';
        div.id = 'aiChatTyping';
        div.innerHTML = `
            <div class="ai-chat-avatar">
                <svg width="16" height="16" viewBox="0 0 100 100" fill="none">
                    <path d="M50 10 C25 10 10 30 10 50 C10 70 25 90 50 90 C75 90 90 70 90 50 C90 30 75 10 50 10Z" stroke="#8C6A4A" stroke-width="2" fill="none"/>
                    <path d="M35 45 Q50 30 65 45 Q70 55 50 65 Q30 55 35 45Z" fill="#8C6A4A"/>
                </svg>
            </div>
            <div class="ai-chat-bubble ai-chat-typing">
                <span></span><span></span><span></span>
            </div>
        `;
        const suggestions = body.querySelector('.chat-suggestions');
        if (suggestions) {
            body.insertBefore(div, suggestions);
        } else {
            body.appendChild(div);
        }
        body.scrollTop = body.scrollHeight;
    },

    removeTyping() {
        const el = document.getElementById('aiChatTyping');
        if (el) el.remove();
    },

    async sendMessage() {
        const input = document.getElementById('aiChatInput');
        const text = input?.value?.trim();
        if (!text) return;

        input.value = '';
        input.style.height = 'auto';
        this.addMessage('user', text);
        this.renderMessage('user', text);

        this.showTyping();

        const suggestionsArea = document.getElementById('chatSuggestions');
        if (suggestionsArea) suggestionsArea.style.display = 'none';

        try {
            const systemPrompt = `You are Veil.ke's AI styling assistant — a warm, knowledgeable, and enthusiastic fashion consultant for a premium abaya brand based in Kenya serving East Africa.

BRAND IDENTITY:
- Veil.ke: Premium abayas for the modern Muslim woman
- Based in Nairobi, Kenya — shipping across East Africa (Kenya, Tanzania, Uganda, Rwanda, Burundi, South Sudan, Ethiopia)
- Founded on the belief that modesty and luxury can coexist beautifully
- Values: Elegance in modesty, quality craftsmanship, modern design, exceptional customer care
- The name "Veil.ke" reflects our Kenyan roots and our focus on elegant head-to-toe coverage

CONTACT & SOCIAL:
- WhatsApp ordering: +254 119 973 430 (primary ordering method)
- Instagram: @Veil.ke
- Website: thekingsmaker.org/veil.ke
- Customers can also browse products on the website and contact via WhatsApp to order

PRODUCT LINES:
1. Featured Collection (curated, seasonal pieces — our most精选 designs)
2. New Arrivals (freshly added designs)
3. Premium Collection (luxury fabrics, elevated detailing — our finest)
4. Black Collection (classic black abayas — timeless essentials)
5. Colored Collection (abayas in rose, teal, mauve, sage and other hues)

SIZING & FIT:
- Standard sizing: XS-3XL (generous fit, true to size)
- All abayas are designed with a relaxed, flowy silhouette that flatters all body types
- Length typically ranges from 55-58 inches (ankle-grazing for most heights)
- Custom sizing available on request — just ask!
- For best fit, measure your bust, waist, hips, and height, then compare to the size guide

FABRICS & QUALITY:
- Premium crepe: lightweight, wrinkle-resistant, perfect for daily wear
- Nida fabric: smooth, matte finish with a beautiful drape — ideal for work and events
- Silk blends: luxurious sheen, fluid movement for special occasions
- Velvet: rich texture for winter and evening wear
- All fabrics are breathable and suitable for warm climates
- Each abaya is crafted with reinforced seams, quality zippers, and attention to detail

STYLING TIPS:
- Layer with a belt for a more defined silhouette
- Pair with statement hijab pins and minimalist jewelry for everyday elegance
- For evening events, choose velvet or silk blends with embellished accessories
- Open-front abayas work beautifully over dresses or matching ensembles
- In warmer months, opt for crepe or Nida in lighter colors

SHIPPING & DELIVERY:
- Kenya: 1-3 business days via courier (Nairobi next-day delivery available)
- East Africa: 3-7 business days
- Shipping costs vary by location — confirmed at time of order
- Free delivery in Nairobi for orders above KES 8,000
- Packaging: each abaya arrives in a premium dust bag

ORDERING PROCESS:
1. Browse products on the website or Instagram
2. Contact via WhatsApp with product name and size
3. Receive price, availability, and delivery estimate
4. Confirm order — payment via M-Pesa, bank transfer, or card
5. Track your delivery

CARE INSTRUCTIONS:
- Dry clean recommended for premium and silk blends
- Hand wash cold or gentle machine cycle for crepe and Nida
- Hang dry in shade — avoid direct sunlight
- Iron on medium heat (avoid embellishments)
- Store in the provided dust bag to maintain quality

PRICING:
- Prices vary by collection and fabric
- Premium Collection: higher price point (luxury fabrics, detailed craftsmanship)
- Black & Colored Collections: accessible luxury pricing
- Contact via WhatsApp for current pricing on specific items

PERSONALITY GUIDELINES:
- Be warm, enthusiastic, and genuinely helpful
- Reference specific products and collections when relevant
- Use natural, conversational language — not robotic
- Be knowledgeable about modest fashion and hijab styling
- If asked about something unclear, offer to connect the customer with our team via WhatsApp
- Never make up specific prices — direct to WhatsApp for current pricing
- Always include the WhatsApp number (+254 119 973 430) when suggesting ordering
- Keep responses informative but approachable
- Use occasional emojis sparingly for warmth (✨💫🤍)
- Format longer responses with bullet points for readability`;

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: CHAT_MODEL,
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...this.messages.slice(-10).map(m => ({
                            role: m.role === 'assistant' ? 'assistant' : 'user',
                            content: m.content
                        }))
                    ],
                    max_tokens: 800,
                    temperature: 0.7
                })
            });

            this.removeTyping();

            if (!response.ok) {
                const errText = await response.text().catch(() => '');
                this.renderMessage('assistant', "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or reach out to us directly on **WhatsApp at +254 119 973 430** for immediate assistance. 🤍");
                return;
            }

            const data = await response.json();
            const reply = data?.choices?.[0]?.message?.content || "I'm not sure how to answer that. Could you rephrase, or would you like to speak with our team on **WhatsApp (+254 119 973 430)**?";
            this.addMessage('assistant', reply);
            this.renderMessage('assistant', reply);

        } catch {
            this.removeTyping();
            this.renderMessage('assistant', "Something went wrong. Please try again, or message us on **WhatsApp at +254 119 973 430** and we'll help you right away! 🤍");
        }
    },

    formatResponse(text) {
        let html = this.escapeHtml(text);

        html = html.replace(/### (.+)/g, '<strong>$1</strong><br>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        html = html.replace(/\n{2,}/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');

        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<\/ul><br>/g, '</ul>');
        html = html.replace(/<br><ul>/g, '<ul>');

        return `<p>${html}</p>`;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => AiChat.init());
