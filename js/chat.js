const OPENROUTER_API_KEY = "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";
const CHAT_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

const AiChat = {
    isOpen: false,
    messages: [],

    init() {
        this.createWidget();
        this.loadHistory();
        this.bindEvents();
    },

    createWidget() {
        if (document.getElementById('aiChatWidget')) return;

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
                        <button class="ai-chat-close" id="aiChatClose" aria-label="Close chat">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
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
                                Hi! I'm Veil.ke's AI assistant. Ask me about our abayas, styling advice, sizing, or anything else!
                            </div>
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
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    },

    bindEvents() {
        const toggle = document.getElementById('aiChatToggle');
        const close = document.getElementById('aiChatClose');
        const send = document.getElementById('aiChatSend');
        const input = document.getElementById('aiChatInput');

        toggle?.addEventListener('click', () => this.toggle());
        close?.addEventListener('click', () => this.close());
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

    loadHistory() {
        try {
            const data = localStorage.getItem('veilke_chat_history');
            if (data) this.messages = JSON.parse(data);
        } catch { this.messages = []; }
    },

    saveHistory() {
        try {
            const recent = this.messages.slice(-20);
            localStorage.setItem('veilke_chat_history', JSON.stringify(recent));
        } catch {}
    },

    addMessage(role, content) {
        this.messages.push({ role, content });
        this.saveHistory();
        this.renderMessage(role, content);
    },

    renderMessage(role, content) {
        const body = document.getElementById('aiChatBody');
        if (!body) return;

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
                <div class="ai-chat-bubble">${this.formatResponse(content)}</div>
            `;
        } else {
            div.innerHTML = `<div class="ai-chat-bubble ai-chat-bubble-user">${this.escapeHtml(content)}</div>`;
        }

        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
    },

    showTyping() {
        const body = document.getElementById('aiChatBody');
        if (!body) return;

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
        body.appendChild(div);
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

        this.showTyping();

        try {
            const systemPrompt = `You are Veil.ke's AI styling assistant. Veil.ke is a premium abaya brand based in Kenya, serving East Africa.

Brand details:
- Premium abayas for the modern Muslim woman
- Based in Kenya, ships across East Africa
- WhatsApp: +254 119 973 430
- Instagram: @Veil.ke
- Collections: Featured Collection, New Arrivals, Premium, Black Collection, Colored
- Values: Elegance in modesty, quality craftsmanship, modern design

Be helpful, warm, and knowledgeable. Answer questions about products, sizing, styling, shipping, and the brand. If asked about something you don't know, be honest. Keep responses concise and friendly.`;

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
                        ...this.messages.slice(-10)
                    ],
                    max_tokens: 500
                })
            });

            this.removeTyping();

            if (!response.ok) {
                this.addMessage('assistant', "Sorry, I'm having trouble connecting. Please try again or contact us on WhatsApp.");
                return;
            }

            const data = await response.json();
            const reply = data?.choices?.[0]?.message?.content || "I'm not sure how to answer that. Could you rephrase?";
            this.addMessage('assistant', reply);

        } catch {
            this.removeTyping();
            this.addMessage('assistant', "Something went wrong. Please try again or reach out on WhatsApp.");
        }
    },

    formatResponse(text) {
        return this.escapeHtml(text)
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/<p><\/p>/g, '');
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => AiChat.init());
