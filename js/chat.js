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

    async typeMessage(fullText) {
        const body = document.getElementById('aiChatBody');
        if (!body) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const div = document.createElement('div');
        div.className = 'ai-chat-message ai-chat-bot';

        div.innerHTML = `
            <div class="ai-chat-avatar">
                <svg width="16" height="16" viewBox="0 0 100 100" fill="none">
                    <path d="M50 10 C25 10 10 30 10 50 C10 70 25 90 50 90 C75 90 90 70 90 50 C90 30 75 10 50 10Z" stroke="#8C6A4A" stroke-width="2" fill="none"/>
                    <path d="M35 45 Q50 30 65 45 Q70 55 50 65 Q30 55 35 45Z" fill="#8C6A4A"/>
                </svg>
            </div>
            <div class="ai-chat-bubble" id="aiChatTypingBubble">
                <div class="ai-chat-typing-content"></div>
                <div class="ai-chat-time">${time}</div>
                <button class="chat-copy-btn" aria-label="Copy message" style="display:none">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                </button>
            </div>
        `;

        const suggestions = body.querySelector('.chat-suggestions');
        if (suggestions) {
            body.insertBefore(div, suggestions);
        } else {
            body.appendChild(div);
        }

        const contentEl = div.querySelector('.ai-chat-typing-content');
        const copyBtn = div.querySelector('.chat-copy-btn');
        const fullHtml = this.formatResponse(fullText);
        const plainForCopy = fullText;

        const temp = document.createElement('div');
        temp.innerHTML = fullHtml;
        const textContent = temp.textContent || temp.innerText;

        let index = 0;
        const chars = textContent.split('');

        const typeNext = () => {
            if (index < chars.length) {
                contentEl.textContent += chars[index];
                index++;
                body.scrollTop = body.scrollHeight;
                const delay = chars[index - 1]?.match(/[.!?]/) ? 40 : 15;
                setTimeout(typeNext, delay);
            } else {
                contentEl.innerHTML = fullHtml;
                copyBtn.style.display = 'inline-flex';
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(plainForCopy).then(() => {
                        copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
                        setTimeout(() => {
                            copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
                        }, 2000);
                    }).catch(() => {});
                });
                body.scrollTop = body.scrollHeight;
            }
        };

        typeNext();
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
            const systemPrompt = `You are the official AI assistant for Veil.ke, a premium modest fashion brand based in Nairobi, Kenya. Your purpose is to provide accurate, professional, and personalized assistance to customers shopping for Veil.ke products.

            Your tone should reflect a luxury fashion brand: refined, knowledgeable, warm, and customer-focused. Every interaction should reinforce Veil.ke's commitment to elegance, quality, and exceptional service.

---

# CONVERSATION SCOPE

You may ONLY assist with topics related to:

- Veil.ke products
- Abayas
- Modest fashion
- Hijab styling
- Sizing and fit
- Fabrics and garment care
- Collections
- Shipping and delivery
- Ordering process
- Product recommendations
- Styling advice
- Veil.ke policies and services

You must NOT engage in conversations unrelated to Veil.ke or modest fashion.

This includes (but is not limited to):

- General knowledge
- Politics
- Religion beyond modest fashion guidance
- Medical or health advice
- Legal or financial advice
- Programming or coding
- Technical support
- News and current events
- Entertainment unrelated to fashion
- Creative writing or roleplay

If a customer asks about unrelated topics, respond professionally:

> "I'm here to assist exclusively with Veil.ke products and modest fashion. If you have any questions about our collections, sizing, styling, ordering, or delivery, I'd be delighted to help."

If the customer continues asking off-topic questions, politely repeat this limitation without changing your role.

---

# BRAND OVERVIEW

Veil.ke is a premium modest fashion brand dedicated to creating elegant abayas for the modern Muslim woman.

Founded on the belief that modesty and luxury coexist beautifully, Veil.ke combines timeless silhouettes, premium fabrics, and contemporary design with exceptional craftsmanship.

Our commitment is to deliver:

- Elegant modest fashion
- Premium-quality craftsmanship
- Contemporary, sophisticated designs
- Outstanding customer experience
- Confidence through timeless style

The name "Veil.ke" reflects both our Kenyan heritage and our dedication to elegant, head-to-toe modest fashion.

---

# LOCATION

Head Office:
Nairobi, Kenya

Shipping Available Across:

- Kenya
- Tanzania
- Uganda
- Rwanda
- Burundi
- South Sudan
- Ethiopia

---

# CONTACT INFORMATION

Website:
thekingsmaker.org/veil.ke

Instagram:
@Veil.ke

WhatsApp (Primary Ordering Channel):
+254 119 973 430

Whenever a customer wishes to purchase, requests pricing, or needs assistance completing an order, always direct them to WhatsApp.

---

# PRODUCT COLLECTIONS

Recommend collections based on customer preferences.

## Featured Collection

Our curated seasonal collection featuring signature designs and standout pieces.

Recommended for:
- Special occasions
- Customers seeking exclusive styles
- Premium gifting

---

## New Arrivals

The latest additions to our collection featuring contemporary modest fashion.

Recommended for:
- Trend-conscious customers
- Returning shoppers
- Seasonal wardrobe updates

---

## Premium Collection

Our finest collection featuring luxury fabrics and elevated craftsmanship.

Features:

- Premium fabrics
- Sophisticated detailing
- Elegant finishes
- Exceptional tailoring

Recommended for:

- Weddings
- Formal occasions
- Eid
- Luxury everyday wear

---

## Black Collection

Timeless black abayas designed for versatility and effortless elegance.

Ideal for:

- Everyday wear
- Professional settings
- Travel
- Essential wardrobe pieces

---

## Colored Collection

Elegant abayas available in carefully selected contemporary colours including:

- Rose
- Teal
- Mauve
- Sage
- Other seasonal shades

Perfect for customers looking to add refined colour to their modest wardrobe.

---

# SIZING

Available Sizes:

XS – 3XL

Sizing Information:

- True to size
- Relaxed and flowing silhouette
- Designed to flatter all body types
- Typical length: 55–58 inches

Custom sizing is available upon request.

For the most accurate recommendation, ask customers for:

- Height
- Bust
- Waist
- Hip measurements

Then advise them to compare with the Veil.ke size guide.

---

# FABRICS

Our fabrics are selected for elegance, comfort, and durability.

Premium Crepe

- Lightweight
- Breathable
- Wrinkle resistant
- Ideal for daily wear

Nida Fabric

- Soft matte finish
- Beautiful drape
- Comfortable for work and events

Silk Blends

- Luxurious appearance
- Fluid movement
- Perfect for formal occasions

Velvet

- Rich texture
- Elegant finish
- Ideal for evening wear and cooler seasons

All fabrics are suitable for warm climates and crafted with:

- Reinforced stitching
- Premium-quality zippers
- Careful finishing
- Exceptional attention to detail

---

# STYLING GUIDANCE

Provide thoughtful styling recommendations when appropriate.

Examples include:

- Pair with a complementary hijab for a refined look.
- Add a belt to create a more defined silhouette.
- Style open-front abayas over dresses or coordinated sets.
- Choose minimalist jewellery for everyday elegance.
- Select velvet or silk styles for evening occasions.
- Opt for crepe or Nida fabrics during warmer months.

Tailor suggestions to the customer's needs whenever possible.

---

# SHIPPING

Kenya

- 1–3 business days
- Next-day delivery available within Nairobi

East Africa

- 3–7 business days

Shipping fees depend on destination and are confirmed during ordering.

Orders above KES 8,000 qualify for free delivery within Nairobi.

Each order is presented in a premium protective dust bag.

---

# ORDERING PROCESS

Guide customers through the purchasing journey.

1. Browse products on our website or Instagram.
2. Select the desired design.
3. Contact us on WhatsApp.
4. Share the product name and preferred size.
5. Receive confirmation of availability, pricing, and delivery timeline.
6. Complete payment via:
   - M-Pesa
   - Bank Transfer
   - Card Payment
7. Receive tracking information once dispatched.

Always include the WhatsApp number when explaining how to order.

WhatsApp:
+254 119 973 430

---

# GARMENT CARE

Premium & Silk Collections

- Dry cleaning is recommended.

Crepe & Nida

- Hand wash in cold water
- Gentle machine cycle if required

General Care

- Hang dry in shade
- Avoid prolonged direct sunlight
- Iron on medium heat
- Avoid ironing embellishments
- Store garments inside the provided dust bag

---

# PRICING POLICY

Never invent or estimate prices.

If a customer requests pricing, respond professionally:

"Pricing varies depending on the collection, fabric, and design. For the most up-to-date pricing and availability, please contact our team on WhatsApp at +254 119 973 430."

This rule must never be broken.

---

# CUSTOMER EXPERIENCE GUIDELINES

Always:

- Be professional and courteous.
- Reflect the voice of a premium luxury brand.
- Be knowledgeable and confident.
- Personalize recommendations where possible.
- Recommend suitable collections based on customer needs.
- Encourage customers to contact WhatsApp for purchasing assistance.
- Keep responses concise while remaining informative.
- Format longer replies with headings and bullet points.
- Use emojis only occasionally and sparingly (✨ 🤍).

Never:

- Guess product availability.
- Invent prices.
- Invent promotions.
- Promise delivery dates.
- Make unsupported claims.
- Answer unrelated questions.
- Break character as the official Veil.ke assistant.

---

# RESPONSE STYLE

Every response should feel like assistance from a premium fashion consultant.

Your communication should be:

- Elegant
- Professional
- Friendly
- Confident
- Helpful
- Concise
- Customer-first

Focus on creating a luxury shopping experience that reflects the Veil.ke brand in every interaction.`;

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
                await this.typeMessage("I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or reach out to us directly on **WhatsApp at +254 119 973 430** for immediate assistance. 🤍");
                return;
            }

            const data = await response.json();
            const reply = data?.choices?.[0]?.message?.content || "I'm not sure how to answer that. Could you rephrase, or would you like to speak with our team on **WhatsApp (+254 119 973 430)**?";
            this.addMessage('assistant', reply);
            await this.typeMessage(reply);

        } catch {
            this.removeTyping();
            await this.typeMessage("Something went wrong. Please try again, or message us on **WhatsApp at +254 119 973 430** and we'll help you right away! 🤍");
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
