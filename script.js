/*
 * =========================================
 * CONFIGURAÇÃO GEMINI API
 * =========================================
 */
const apiKey = ""; // Será injetada automaticamente
let generatedSundaeName = "Sundae Personalizado"; // Nome padrão

async function callGeminiAPI(prompt) {
    if (!apiKey) {
        console.warn("API Key not found. Simulating response.");
        return new Promise(resolve => setTimeout(() => resolve("Simulação: A API Key não foi encontrada, mas o app funcionaria assim!"), 1000));
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [{ parts: [{ text: prompt }] }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, meu cérebro congelou! 🍦 Tente novamente.";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Erro ao conectar com o Chef Virtual. Tente mais tarde.";
    }
}

/*
 * =========================================
 * DADOS (Simulando Banco de Dados)
 * =========================================
 */
const products = [
    {
        id: 1,
        name: "Pastel Dream",
        desc: "Sorvete de baunilha com pedaços de algodão doce e granulado rosa.",
        price: 14.90,
        image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        tags: ["bestseller"],
        badges: ["Mais Vendido"]
    },
    {
        id: 2,
        name: "Dark Pistachio",
        desc: "Pistache siciliano autêntico, sem leite. Cremoso e intenso.",
        price: 18.90,
        image: "https://images.unsplash.com/photo-1579954115563-e72bf1381629?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        tags: ["vegan", "lactose-free"],
        badges: ["Vegano", "Sem Lactose"]
    },
    {
        id: 3,
        name: "Berry Blast",
        desc: "Mix de frutas vermelhas à base de água. Refrescante e leve.",
        price: 12.90,
        image: "https://images.unsplash.com/photo-1488900128323-21503983a07e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        tags: ["vegan", "lactose-free"],
        badges: ["Vegano"]
    },
    {
        id: 4,
        name: "Choco Belga",
        desc: "Chocolate belga 70% cacau. Para os amantes de chocolate de verdade.",
        price: 16.90,
        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        tags: ["bestseller"],
        badges: []
    },
    {
        id: 5,
        name: "Cesta de Waffle",
        desc: "Cestinha crocante feita na hora para acompanhar seu sorvete.",
        price: 4.50,
        image: "https://images.unsplash.com/photo-1558500206-8d59d1c9d233?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        tags: ["topping"],
        badges: []
    },
    {
        id: 6,
        name: "Calda de Caramelo",
        desc: "Caramelo salgado artesanal. O toque final perfeito.",
        price: 3.00,
        image: "https://images.unsplash.com/photo-1626244799052-a6e5593c6838?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        tags: ["topping"],
        badges: []
    }
];

/*
 * =========================================
 * ESTADO DA APLICAÇÃO
 * =========================================
 */
let cart = [];
let currentFilter = 'all';

/*
 * =========================================
 * FUNÇÕES DE RENDERIZAÇÃO
 * =========================================
 */
function renderMenu(filter = 'all') {
    const grid = document.getElementById('menuGrid');
    grid.innerHTML = '';
    
    // Atualizar botões de filtro
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.textContent.toLowerCase().includes(filter === 'lactose-free' ? 'lactose' : 
           filter === 'bestseller' ? 'vendidos' : 
           filter === 'topping' ? 'acompanhamentos' :
           filter === 'vegan' ? 'veganos' : 'todos')) {
            btn.classList.add('active');
        }
    });

    const filteredProducts = filter === 'all' 
        ? products 
        : products.filter(p => p.tags.includes(filter));

    filteredProducts.forEach(product => {
        const badgesHtml = product.badges.map(b => {
            let className = 'badge-vegan'; // default fallback
            if (b === 'Mais Vendido') className = 'badge-bestseller';
            if (b === 'Sem Lactose') className = 'badge-lactose';
            return `<span class="badge ${className}">${b}</span>`;
        }).join(' ');

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="card-img" onerror="this.src='https://placehold.co/400x300?text=Sorvete'">
            <div class="card-content">
                <div class="card-header">
                    <h3 class="card-title">${product.name}</h3>
                    <span class="card-price">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
                </div>
                <div style="margin-bottom: 8px; display: flex; gap: 4px; flex-wrap: wrap;">
                    ${badgesHtml}
                </div>
                <p class="card-desc">${product.desc}</p>
                <div class="card-actions">
                    <button class="btn-secondary" onclick="addToCart(${product.id})">
                        <i class="ph ph-plus"></i> Adicionar
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

/*
 * =========================================
 * LÓGICA DO CARRINHO
 * =========================================
 */
function addToCart(id, isCustom = false, customObj = null) {
    let item;
    
    if (isCustom) {
        // Adiciona item customizado (Sundae)
        const existingIndex = cart.findIndex(i => i.isCustom && 
            i.base === customObj.base && 
            i.syrup === customObj.syrup && 
            i.extra === customObj.extra);
        
        if (existingIndex > -1) {
            cart[existingIndex].qty++;
        } else {
            cart.push({ ...customObj, qty: 1, isCustom: true, id: 'custom-'+Date.now() });
        }
    } else {
        // Adiciona produto normal
        const product = products.find(p => p.id === id);
        const existingItem = cart.find(i => i.id === id && !i.isCustom);
        
        if (existingItem) {
            existingItem.qty++;
        } else {
            cart.push({ ...product, qty: 1, isCustom: false });
        }
    }

    updateCartUI();
    showToast('Item adicionado ao carrinho!');
    
    // Pequena animação no ícone do carrinho
    const cartIcon = document.querySelector('.cart-trigger');
    cartIcon.style.transform = 'scale(1.2)';
    setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        removeFromCart(index);
    } else {
        updateCartUI();
    }
}

function updateCartUI() {
    const container = document.getElementById('cartItemsContainer');
    const totalEl = document.getElementById('cartTotal');
    const countEl = document.getElementById('cartCount');
    
    countEl.textContent = cart.reduce((acc, item) => acc + item.qty, 0);
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: #888; margin-top: 20px;">Seu carrinho está vazio 🍦</p>';
        totalEl.textContent = 'R$ 0,00';
        return;
    }

    container.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.qty;
        const img = item.image || 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60';
        
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <img src="${img}" alt="${item.name}">
            <div class="cart-item-info">
                <div style="font-weight: 700; font-size: 0.9rem;">${item.name}</div>
                <div style="font-size: 0.8rem; color: #888;">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                ${item.isCustom ? `<div style="font-size: 0.7rem; color: #aaa;">${item.base}, ${item.syrup}</div>` : ''}
            </div>
            <div class="qty-controls">
                <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                <span style="font-size: 0.8rem; padding: 0 4px;">${item.qty}</span>
                <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
            </div>
        `;
        container.appendChild(itemEl);
    });

    totalEl.textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
}

function toggleCart() {
    const modal = document.getElementById('cartModal');
    modal.classList.toggle('open');
    // Fechar outros modais
    document.getElementById('sundaeOverlay').style.display = 'none';
    document.getElementById('aiChefOverlay').style.display = 'none';
}

/*
 * =========================================
 * SUNDAE BUILDER & GEMINI NAMING
 * =========================================
 */
function openSundaeBuilder() {
    const overlay = document.getElementById('sundaeOverlay');
    overlay.style.display = 'flex';
    
    // Reset state
    document.getElementById('magicNameDisplay').style.display = 'none';
    generatedSundaeName = "Sundae Personalizado";

    setTimeout(() => {
        overlay.querySelector('.custom-sundae-modal').style.display = 'block';
    }, 10);
}

function closeSundaeBuilder() {
    document.getElementById('sundaeOverlay').style.display = 'none';
}

async function generateMagicName() {
    const base = document.getElementById('sundaeBase').value;
    const syrup = document.getElementById('sundaeSyrup').value;
    const extra = document.getElementById('sundaeExtra').value;
    
    const btn = document.querySelector('.btn-ai-small');
    const originalText = btn.innerHTML;
    btn.innerHTML = '✨ Criando Magia...';
    btn.disabled = true;

    const prompt = `Você é um sorveteiro criativo. Crie um nome mágico, curto (max 4 palavras) e divertido, e uma descrição de 1 linha para um sundae com: Base ${base}, Calda ${syrup}, Extra ${extra}. Formato de resposta: Nome|Descrição. Idioma: Português.`;

    const text = await callGeminiAPI(prompt);
    
    try {
        // Tenta fazer parse simples se a IA respeitar o formato, senão usa o texto todo
        let [name, desc] = text.split('|');
        if (!desc) {
             name = "Criação Mágica";
             desc = text;
        }
        
        generatedSundaeName = name.trim().replace(/\*\*/g, ''); // Remove markdown bold
        
        document.getElementById('generatedName').textContent = generatedSundaeName;
        document.getElementById('generatedDesc').textContent = desc.trim();
        document.getElementById('magicNameDisplay').style.display = 'block';
    } catch (e) {
        generatedSundaeName = "Sundae Surpresa";
    }

    btn.innerHTML = originalText;
    btn.disabled = false;
}

function addSundaeToCart() {
    const base = document.getElementById('sundaeBase').value;
    const syrup = document.getElementById('sundaeSyrup').value;
    const extra = document.getElementById('sundaeExtra').value;

    const sundaeObj = {
        name: generatedSundaeName, // Usa o nome gerado pela IA se houver
        price: 22.90,
        base, syrup, extra,
        desc: `${base} com ${syrup} e ${extra}`
    };

    addToCart(null, true, sundaeObj);
    closeSundaeBuilder();
}

/*
 * =========================================
 * AI CHEF FEATURES
 * =========================================
 */
function openAIChef() {
    const overlay = document.getElementById('aiChefOverlay');
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.querySelector('.ai-chef-modal').style.display = 'block';
    }, 10);
}

function closeAIChef() {
    document.getElementById('aiChefOverlay').style.display = 'none';
}

async function askAIChef() {
    const userInput = document.getElementById('aiChefInput').value;
    if(!userInput.trim()) return;

    const loading = document.getElementById('aiChefLoading');
    const resultArea = document.getElementById('aiChefResult');
    const btn = document.querySelector('.ai-chef-modal .btn-ai');

    loading.style.display = 'block';
    resultArea.style.display = 'none';
    btn.disabled = true;

    const prompt = `Você é um chef especialista da 'Gelateria Pastel'. O cliente diz: '${userInput}'. Sugira APENAS UMA opção do nosso menu (Pastel Dream, Dark Pistachio, Berry Blast, Choco Belga) OU uma combinação de sundae. Seja curto (máx 2 frases), doce e acolhedor. Use emojis. Idioma: Português.`;

    const response = await callGeminiAPI(prompt);

    loading.style.display = 'none';
    resultArea.textContent = response;
    resultArea.style.display = 'block';
    btn.disabled = false;
}

/*
 * =========================================
 * CHECKOUT E STATUS
 * =========================================
 */
function checkout() {
    if (cart.length === 0) {
        alert("Adicione itens ao carrinho primeiro!");
        return;
    }

    // Simular processamento
    const btn = document.querySelector('.cart-footer .btn-primary');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Processando...';
    
    setTimeout(() => {
        toggleCart();
        cart = []; // Limpa carrinho
        updateCartUI();
        btn.innerHTML = originalText;
        
        initOrderStatus();
    }, 1500);
}

function initOrderStatus() {
    // Esconde filtros e herói, mostra status
    document.getElementById('heroSection').style.display = 'none';
    document.getElementById('menuFilters').style.display = 'none';
    document.getElementById('orderStatus').style.display = 'block';
    
    // Define horário de entrega (30 min a partir de agora)
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    document.getElementById('deliveryTime').textContent = 
        now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

    // Simula mudança de status
    playSound(); // Som de novo pedido (simulado visualmente com Toast)
    showToast('Pedido recebido! A cozinha já vai começar.');

    // Ciclo de vida do pedido
    setTimeout(() => updateStatus(2), 5000); // 5 seg -> Pronto
    setTimeout(() => updateStatus(3), 10000); // 10 seg -> Entrega
}

function updateStatus(stepNum) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    
    // Ativa todos até o atual
    for(let i=1; i<=stepNum; i++) {
        document.getElementById('step'+i).classList.add('active');
    }

    if(stepNum === 2) showToast('Seu pedido está pronto!');
    if(stepNum === 3) showToast('Saiu para entrega! 🛵');
}

/*
 * =========================================
 * UTILITÁRIOS
 * =========================================
 */
function filterMenu(type) {
    currentFilter = type;
    renderMenu(type);
}

function scrollToMenu() {
    document.getElementById('menuFilters').scrollIntoView({behavior: 'smooth'});
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function playSound() {
    console.log("Beep de notificação");
}

// Event Listeners Globais
document.getElementById('sundaeOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'sundaeOverlay') closeSundaeBuilder();
});
    
document.getElementById('aiChefOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'aiChefOverlay') closeAIChef();
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
});
