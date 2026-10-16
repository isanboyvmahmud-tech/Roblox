/**
 * Roblox Portal Main Application Controller
 * Navigation, Catalog, Wallet, Customizer, Promo Codes & Game Launcher
 */

// Global App State
const RobloxState = {
    robux: 2500,
    username: 'ProGamer_Uz',
    ownedItems: ['hat_cap', 'face_smile', 'face_winning', 'shirt_roblox'],
    redeemedPromos: [],
    selectedBodyPart: 'head',
    activeTab: 'home',
    avatarInstance: null,
    gameInstance: null,

    // Predefined Promo Codes
    promoCodes: {
        'ROBLOX2026': { robux: 1000, item: 'hat_valkyrie', name: 'Yangi Yil 2026 Bonusi + Valkyrie Helm' },
        'FREE500': { robux: 500, item: null, name: '500 Bepul Robux' },
        'UZBEKISTAN': { robux: 2000, item: 'hat_crown', name: 'Oltin Toj + 2,000 Robux' },
        'SUPERNOOB': { robux: 300, item: 'face_ninja', name: 'Ninja Yuzi + 300 Robux' }
    },

    // Game Catalog Data
    games: [
        {
            id: 'mega_obby',
            title: "Mega Obby Parkour 3D [YANGILANISH]",
            creator: "RobloxStudioUz",
            category: "obby",
            rating: "98%",
            players: "48.2k",
            badge: "hot",
            isPlayable: true,
            bgColors: ['#FF512F', '#DD2476'],
            icon: '🏃‍♂️',
            description: "To'liq 3D Parkur tajribasi! Lava bloklaridan sakrab o'ting, Robux tangalarini yig'ing va oxirgi marraga yetib boring!"
        },
        {
            id: 'blox_fruits',
            title: "Blox Fruit: Dengiz Sarguzashtlari",
            creator: "GamerFruit Team",
            category: "action",
            rating: "96%",
            players: "89.5k",
            badge: "top",
            isPlayable: true,
            bgColors: ['#1A2980', '#26D0CE'],
            icon: '⚔️',
            description: "Dengiz qaroqchisi bo'ling, mevalarni toping va eng kuchli jangchi unvoniga erishing!"
        },
        {
            id: 'brookhaven_rp',
            title: "Brookhaven RP: Shahar Hayoti",
            creator: "WolfPaq Studio",
            category: "sim",
            rating: "94%",
            players: "120.4k",
            badge: "top",
            isPlayable: true,
            bgColors: ['#11998e', '#38ef7d'],
            icon: '🏙️',
            description: "Orzuingizdagi uyni quring, mashinalarda sayr qiling va do'stlaringiz bilan qiziqarli hayot kechiring!"
        },
        {
            id: 'tower_of_hell',
            title: "Tower of Hell: Cheksiz Minora",
            creator: "YXDev",
            category: "obby",
            rating: "92%",
            players: "34.1k",
            badge: "hot",
            isPlayable: true,
            bgColors: ['#8E2DE2', '#4A00E0'],
            icon: '🗼',
            description: "Hech qanday nazorat nuqtasisiz (checkpoint) baland minorani zabt etishga jur'at qila olasizmi?"
        },
        {
            id: 'pet_simulator',
            title: "Pet Simulator 99: Oltin Hayvonlar",
            creator: "BigGamesUz",
            category: "sim",
            rating: "97%",
            players: "75.8k",
            badge: "new",
            isPlayable: true,
            bgColors: ['#F2994A', '#F2C94C'],
            icon: '🐱',
            description: "Tuxumlarni oching, afsonaviy hayvonlarni to'plang va ulkan olamlarni kashf qiling!"
        },
        {
            id: 'bedwars',
            title: "BedWars: Orol Qal'alari",
            creator: "EasyBlox",
            category: "action",
            rating: "95%",
            players: "52.3k",
            badge: "hot",
            isPlayable: true,
            bgColors: ['#EB3349', '#F45C43'],
            icon: '🛏️',
            description: "O'z to'shagingizni himoya qiling, dushman orollariga hujum qiling va g'alaba qozoning!"
        },
        {
            id: 'speed_run',
            title: "Speed Run 4: Tezkor Poyga",
            creator: "ViperSprint",
            category: "racing",
            rating: "91%",
            players: "19.7k",
            badge: "new",
            isPlayable: true,
            bgColors: ['#00c6ff', '#0072ff'],
            icon: '⚡',
            description: "Musiqa ostida chaqqonlik bilan yuguring va eng qisqa vaqt rekordini o'rnating!"
        },
        {
            id: 'natural_disaster',
            title: "Natural Disaster Survival (Tabiiy Omon Qolish)",
            creator: "Stickmaster",
            category: "survival",
            rating: "93%",
            players: "27.6k",
            badge: "new",
            isPlayable: true,
            bgColors: ['#3A6073', '#3A7BD5'],
            icon: '🌋',
            description: "Tsunami, zilzila, tornado va kislotali yomg'irlardan omon qolish mahoratingizni sinang!"
        }
    ],

    // Catalog Items for Avatar Shop
    catalogItems: {
        hats: [
            { id: 'hat_cap', name: 'Klassik Qizil Kepka', price: 0, icon: '🧢', type: 'cap' },
            { id: 'hat_fedora', name: 'Qora Mafia Fedora', price: 50, icon: '🎩', type: 'fedora' },
            { id: 'hat_crown', name: 'Qirollik Oltin Toji', price: 250, icon: '👑', type: 'crown' },
            { id: 'hat_headphones', name: 'RGB Gamer Naushnik', price: 150, icon: '🎧', type: 'headphones' },
            { id: 'hat_valkyrie', name: 'Afsonaviy Valkyrie', price: 1000, icon: '🪖', type: 'valkyrie' }
        ],
        faces: [
            { id: 'face_smile', name: 'Klassik Tabassum', price: 0, icon: '😊', type: 'smile' },
            { id: 'face_chill', name: 'Chill Kozoynakli Yuz', price: 30, icon: '😎', type: 'chill' },
            { id: 'face_winning', name: 'G\'olib Tabassumi', price: 0, icon: '😃', type: 'winning' },
            { id: 'face_ninja', name: 'Ninja Jangovar Yuz', price: 80, icon: '🥷', type: 'ninja' },
            { id: 'face_beast', name: 'Yirtqich Qahr Yuzi', price: 120, icon: '😈', type: 'beast' }
        ],
        shirts: [
            { id: 'shirt_roblox', name: 'Klassik Roblox Futbolka', price: 0, icon: '👕', type: 'roblox' },
            { id: 'shirt_tuxedo', name: 'Klassik Smoking & Bo\'yinbog\'', price: 60, icon: '🤵', type: 'tuxedo' },
            { id: 'shirt_gamer', name: 'Neon Pro Gamer Xudi', price: 100, icon: '🥼', type: 'gamer' },
            { id: 'shirt_hero', name: 'Superqahramon Kostyumi', price: 180, icon: '🦸', type: 'hero' }
        ],
        back: [
            { id: 'back_none', name: 'Hech narsa', price: 0, icon: '🚫', type: 'none' },
            { id: 'back_sword', name: 'Samuray Qilichi (Katana)', price: 200, icon: '🗡️', type: 'sword' },
            { id: 'back_wings', name: 'Neon Kiber Qanotlar', price: 350, icon: '🪽', type: 'wings' }
        ]
    },

    // Roblox Classic Palette Colors
    colorsPalette: [
        { name: 'Klassik Sariq', hex: '#F5CD2F' },
        { name: 'Klassik Ko\'k', hex: '#0D69AC' },
        { name: 'Klassik Yashil', hex: '#4B974B' },
        { name: 'Qizil', hex: '#C62828' },
        { name: 'Qora', hex: '#1B1B1B' },
        { name: 'Oq', hex: '#F0F0F0' },
        { name: 'To\'q Ko\'k', hex: '#002855' },
        { name: 'Zangori', hex: '#00A2FF' },
        { name: 'Binafsha', hex: '#6A1B9A' },
        { name: 'Pushti', hex: '#E91E63' },
        { name: 'To\'q sariq', hex: '#E65100' },
        { name: 'Kulrang', hex: '#546E7A' }
    ]
};

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    loadSavedState();
    initNavigation();
    initRobuxWallet();
    renderGameShelves();
    initAvatarShop();
    initPromoSystem();
    initGameModal();
    initSidebarToggle();
});

function loadSavedState() {
    const savedRobux = localStorage.getItem('roblox_wallet_robux');
    if (savedRobux !== null) RobloxState.robux = parseInt(savedRobux, 10);

    const savedItems = localStorage.getItem('roblox_owned_items');
    if (savedItems) {
        try { RobloxState.ownedItems = JSON.parse(savedItems); } catch(e){}
    }

    const savedPromos = localStorage.getItem('roblox_redeemed_promos');
    if (savedPromos) {
        try { RobloxState.redeemedPromos = JSON.parse(savedPromos); } catch(e){}
    }

    updateRobuxDisplay();
}

function saveState() {
    localStorage.setItem('roblox_wallet_robux', RobloxState.robux);
    localStorage.setItem('roblox_owned_items', JSON.stringify(RobloxState.ownedItems));
    localStorage.setItem('roblox_redeemed_promos', JSON.stringify(RobloxState.redeemedPromos));
}

// ==========================================================================
// TOAST NOTIFICATIONS
// ==========================================================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `roblox-toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'gold') icon = '🪙';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ==========================================================================
// NAVIGATION & TABS
// ==========================================================================
function initNavigation() {
    const tabButtons = document.querySelectorAll('[data-nav-target]');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.getAttribute('data-nav-target');
            switchTab(target);
            if (window.robloxAudio) window.robloxAudio.playClick();
        });
    });

    // Global Search Bar Filtering
    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            filterGames(query);
            if (RobloxState.activeTab !== 'discover' && RobloxState.activeTab !== 'home' && query.length > 0) {
                switchTab('discover');
            }
        });
    }

    // Category Chips Filtering in Discover Page
    const chips = document.querySelectorAll('.chip-btn');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const category = chip.getAttribute('data-category');
            renderDiscoverGames(category);
            if (window.robloxAudio) window.robloxAudio.playClick();
        });
    });
}

function switchTab(tabId) {
    RobloxState.activeTab = tabId;

    // Update Nav Buttons
    document.querySelectorAll('[data-nav-target]').forEach(btn => {
        if (btn.getAttribute('data-nav-target') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update Sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });

    const activeSec = document.getElementById(`section-${tabId}`);
    if (activeSec) {
        activeSec.classList.add('active');
    }

    // If entering Avatar Shop, refresh avatar canvas size
    if (tabId === 'avatar' && RobloxState.avatarInstance) {
        setTimeout(() => {
            if (RobloxState.avatarInstance) RobloxState.avatarInstance.resize();
        }, 100);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initSidebarToggle() {
    const toggleBtn = document.getElementById('menuToggleBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-collapsed');
            document.body.classList.toggle('sidebar-open');
            if (window.robloxAudio) window.robloxAudio.playClick();
        });
    }
}

// ==========================================================================
// ROBUX WALLET
// ==========================================================================
function initRobuxWallet() {
    const robuxPill = document.getElementById('robuxPill');
    if (robuxPill) {
        robuxPill.addEventListener('click', () => {
            switchTab('robux');
            if (window.robloxAudio) window.robloxAudio.playClick();
        });
    }

    // Buy pack buttons
    const packButtons = document.querySelectorAll('.pack-buy-btn');
    packButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.getAttribute('data-amount'), 10);
            RobloxState.robux += amount;
            saveState();
            updateRobuxDisplay();
            if (window.robloxAudio) window.robloxAudio.playBuy();
            showToast(`+${amount.toLocaleString()} Robux hisobingizga qo'shildi! 🎉`, 'gold');
        });
    });
}

function updateRobuxDisplay() {
    const displays = document.querySelectorAll('.robux-count');
    displays.forEach(el => {
        el.textContent = RobloxState.robux.toLocaleString() + ' R$';
    });
}

// ==========================================================================
// GAME CATALOG & CARD GENERATION
// ==========================================================================
function createGameCardHtml(game) {
    const c1 = game.bgColors[0];
    const c2 = game.bgColors[1];
    
    // Dynamic SVG Roblox Art Card
    const svgThumb = `
        <svg viewBox="0 0 320 180" class="thumb-image" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad_${game.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${c1}" />
                    <stop offset="100%" stop-color="${c2}" />
                </linearGradient>
            </defs>
            <rect width="320" height="180" fill="url(#grad_${game.id})" />
            <!-- Floating Roblox Blocks pattern -->
            <rect x="25" y="25" width="40" height="40" fill="rgba(255,255,255,0.12)" rx="6" />
            <rect x="250" y="80" width="50" height="50" fill="rgba(255,255,255,0.08)" rx="8" />
            <circle cx="280" cy="30" r="15" fill="rgba(255,255,255,0.15)" />
            <!-- Center Icon / Character -->
            <text x="160" y="105" font-size="58" text-anchor="middle" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.4))">${game.icon}</text>
        </svg>
    `;

    return `
        <div class="game-card" data-game-id="${game.id}">
            <div class="game-card-thumb">
                ${svgThumb}
                <span class="game-badge ${game.badge}">${game.badge.toUpperCase()}</span>
                <div class="card-play-overlay">
                    <button class="quick-play-btn" title="O'ynash">▶</button>
                </div>
            </div>
            <div class="game-card-body">
                <div>
                    <h4 class="game-title" title="${game.title}">${game.title}</h4>
                    <p class="game-creator">${game.creator}</p>
                </div>
                <div class="game-stats">
                    <span class="game-rating">👍 ${game.rating}</span>
                    <span class="game-players">👥 ${game.players}</span>
                </div>
            </div>
        </div>
    `;
}

function renderGameShelves() {
    const popularContainer = document.getElementById('popularGamesGrid');
    const recommendedContainer = document.getElementById('recommendedGamesGrid');

    if (popularContainer) {
        popularContainer.innerHTML = RobloxState.games.slice(0, 4).map(g => createGameCardHtml(g)).join('');
    }

    if (recommendedContainer) {
        recommendedContainer.innerHTML = RobloxState.games.slice(4, 8).map(g => createGameCardHtml(g)).join('');
    }

    renderDiscoverGames('all');
    attachGameCardEvents();
}

function renderDiscoverGames(category = 'all') {
    const container = document.getElementById('discoverGamesGrid');
    if (!container) return;

    let filtered = RobloxState.games;
    if (category !== 'all') {
        filtered = RobloxState.games.filter(g => g.category === category);
    }

    container.innerHTML = filtered.map(g => createGameCardHtml(g)).join('');
    attachGameCardEvents();
}

function filterGames(query) {
    const container = document.getElementById('discoverGamesGrid');
    if (!container) return;

    if (!query) {
        renderDiscoverGames('all');
        return;
    }

    const filtered = RobloxState.games.filter(g => 
        g.title.toLowerCase().includes(query) || 
        g.creator.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
            <h3>🔍 Hech narsa topilmadi</h3>
            <p>Boshqa so'z bilan qidirib ko'ring yoki bosh sahifaga qayting.</p>
        </div>`;
    } else {
        container.innerHTML = filtered.map(g => createGameCardHtml(g)).join('');
        attachGameCardEvents();
    }
}

function attachGameCardEvents() {
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => {
            if (document.activeElement && typeof document.activeElement.blur === 'function') {
                document.activeElement.blur();
            }
            const gameId = card.getAttribute('data-game-id');
            launchGame(gameId);
        });
    });
}

// ==========================================================================
// AVATAR SHOP & EDITOR
// ==========================================================================
function initAvatarShop() {
    // Initialize 3D Avatar on preview canvas
    const canvas = document.getElementById('avatarPreviewCanvas');
    if (canvas && typeof RobloxAvatar !== 'undefined') {
        RobloxState.avatarInstance = new RobloxAvatar('avatarPreviewCanvas', {
            interactive: true,
            autoRotate: true
        });
    }

    // Emote Buttons
    document.querySelectorAll('[data-emote]').forEach(btn => {
        btn.addEventListener('click', () => {
            const emote = btn.getAttribute('data-emote');
            if (RobloxState.avatarInstance) {
                RobloxState.avatarInstance.playEmote(emote);
                if (window.robloxAudio) window.robloxAudio.playClick();
            }
        });
    });

    // Customizer subtabs (Colors, Hats, Faces, Shirts)
    const subtabs = document.querySelectorAll('.avatar-subtab-btn');
    subtabs.forEach(tab => {
        tab.addEventListener('click', () => {
            subtabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabType = tab.getAttribute('data-subtab');
            document.querySelectorAll('.avatar-tab-content').forEach(c => c.style.display = 'none');
            const targetEl = document.getElementById(`avatarTab-${tabType}`);
            if (targetEl) targetEl.style.display = 'block';

            if (window.robloxAudio) window.robloxAudio.playClick();
        });
    });

    // Body parts selector
    const bodyPartButtons = document.querySelectorAll('.body-part-btn');
    bodyPartButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            bodyPartButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            RobloxState.selectedBodyPart = btn.getAttribute('data-part');
            if (window.robloxAudio) window.robloxAudio.playClick();
        });
    });

    // Color Swatches Grid
    renderColorSwatches();

    // Render items for Hats, Faces, Shirts, Back
    renderAvatarItems('hats', 'avatarItemsHats');
    renderAvatarItems('faces', 'avatarItemsFaces');
    renderAvatarItems('shirts', 'avatarItemsShirts');
    renderAvatarItems('back', 'avatarItemsBack');
}

function renderColorSwatches() {
    const container = document.getElementById('colorSwatchesGrid');
    if (!container) return;

    container.innerHTML = RobloxState.colorsPalette.map(color => `
        <button class="color-swatch" style="background-color: ${color.hex};" title="${color.name}" data-hex="${color.hex}"></button>
    `).join('');

    container.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            const hex = swatch.getAttribute('data-hex');
            if (RobloxState.avatarInstance) {
                RobloxState.avatarInstance.setColor(RobloxState.selectedBodyPart, hex);
                if (window.robloxAudio) window.robloxAudio.playClick();
                showToast(`Rang o'zgartirildi!`, 'info');
            }
        });
    });
}

function renderAvatarItems(categoryKey, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const items = RobloxState.catalogItems[categoryKey] || [];
    const currentState = RobloxState.avatarInstance ? RobloxState.avatarInstance.state : {};

    container.innerHTML = items.map(item => {
        const isOwned = RobloxState.ownedItems.includes(item.id) || item.price === 0;
        
        let isEquipped = false;
        if (categoryKey === 'hats' && currentState.hat === item.type) isEquipped = true;
        if (categoryKey === 'faces' && currentState.face === item.type) isEquipped = true;
        if (categoryKey === 'shirts' && currentState.shirt === item.type) isEquipped = true;
        if (categoryKey === 'back' && currentState.backItem === item.type) isEquipped = true;

        let actionText = isEquipped ? 'Kiyilgan ✓' : (isOwned ? 'Kiyish' : `Sotib olish`);
        let priceHtml = item.price === 0 
            ? `<span class="avatar-item-price free">BEPUL</span>`
            : `<span class="avatar-item-price">🪙 ${item.price} R$</span>`;

        return `
            <div class="avatar-item-card ${isEquipped ? 'equipped' : ''}" data-item-id="${item.id}" data-category="${categoryKey}" data-type="${item.type}" data-price="${item.price}">
                <div class="avatar-item-icon">${item.icon}</div>
                <div class="avatar-item-title" title="${item.name}">${item.name}</div>
                ${priceHtml}
                <button class="avatar-item-btn">${actionText}</button>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.avatar-item-card').forEach(card => {
        card.addEventListener('click', () => {
            const itemId = card.getAttribute('data-item-id');
            const category = card.getAttribute('data-category');
            const type = card.getAttribute('data-type');
            const price = parseInt(card.getAttribute('data-price'), 10);

            handleItemInteraction(itemId, category, type, price);
        });
    });
}

function handleItemInteraction(itemId, category, type, price) {
    const isOwned = RobloxState.ownedItems.includes(itemId) || price === 0;

    if (!isOwned) {
        // Buy Item Logic
        if (RobloxState.robux < price) {
            if (window.robloxAudio) window.robloxAudio.playOof();
            showToast(`Robux yetarli emas! Sizda: ${RobloxState.robux} R$, Narxi: ${price} R$`, 'error');
            return;
        }

        // Deduct Robux
        RobloxState.robux -= price;
        RobloxState.ownedItems.push(itemId);
        saveState();
        updateRobuxDisplay();
        if (window.robloxAudio) window.robloxAudio.playBuy();
        showToast(`Muvaffaqiyatli xarid qilindi! 🎉`, 'gold');
    }

    // Equip item on 3D Avatar
    if (RobloxState.avatarInstance) {
        if (category === 'hats') RobloxState.avatarInstance.setHat(type);
        if (category === 'faces') RobloxState.avatarInstance.setFace(type);
        if (category === 'shirts') RobloxState.avatarInstance.setShirt(type);
        if (category === 'back') RobloxState.avatarInstance.setBackItem(type);

        if (window.robloxAudio) window.robloxAudio.playClick();
        showToast(`Avatar yangilandi! ✨`, 'success');
    }

    // Refresh Catalog UI
    renderAvatarItems('hats', 'avatarItemsHats');
    renderAvatarItems('faces', 'avatarItemsFaces');
    renderAvatarItems('shirts', 'avatarItemsShirts');
    renderAvatarItems('back', 'avatarItemsBack');
}

// ==========================================================================
// PROMO CODES SYSTEM
// ==========================================================================
function initPromoSystem() {
    const submitBtn = document.getElementById('promoSubmitBtn');
    const input = document.getElementById('promoCodeInput');

    if (submitBtn && input) {
        const handlePromo = () => {
            const code = input.value.trim().toUpperCase();
            if (!code) return;

            if (RobloxState.redeemedPromos.includes(code)) {
                if (window.robloxAudio) window.robloxAudio.playOof();
                showToast(`Ushbu promo-kod allaqachon ishlatilgan!`, 'error');
                return;
            }

            const promoData = RobloxState.promoCodes[code];
            if (promoData) {
                RobloxState.redeemedPromos.push(code);
                RobloxState.robux += promoData.robux;
                if (promoData.item) {
                    RobloxState.ownedItems.push(promoData.item);
                }
                saveState();
                updateRobuxDisplay();

                if (window.robloxAudio) window.robloxAudio.playWin();
                showToast(`Tabriklaymiz! ${promoData.name} qo'lga kiritildi! 🎁`, 'gold');
                input.value = '';

                // Refresh shop items in case item was unlocked
                renderAvatarItems('hats', 'avatarItemsHats');
                renderAvatarItems('faces', 'avatarItemsFaces');
            } else {
                if (window.robloxAudio) window.robloxAudio.playOof();
                showToast(`Noto'g'ri promo-kod! Mavjud kodlarni ko'ring.`, 'error');
            }
        };

        submitBtn.addEventListener('click', handlePromo);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handlePromo();
        });
    }

    // Quick click on demo promo tags
    document.querySelectorAll('.promo-badge-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const code = tag.getAttribute('data-code');
            if (input) {
                input.value = code;
                if (submitBtn) submitBtn.click();
            }
        });
    });
}

// ==========================================================================
// 3D PLAYABLE GAME LAUNCHER & HUD
// ==========================================================================
let gameTimerInterval = null;
let gameSeconds = 0;

function initGameModal() {
    const leaveBtn = document.getElementById('leaveGameBtn');
    const victoryClaimBtn = document.getElementById('victoryClaimBtn');
    const restartBtn = document.getElementById('gameRestartBtn');

    if (leaveBtn) {
        leaveBtn.addEventListener('click', () => closeGame());
    }

    if (victoryClaimBtn) {
        victoryClaimBtn.addEventListener('click', () => {
            // Reward for beating the game!
            const bonus = 250;
            RobloxState.robux += bonus;
            saveState();
            updateRobuxDisplay();
            if (window.robloxAudio) window.robloxAudio.playBuy();
            showToast(`G'alaba bonusi: +${bonus} Robux hisobingizga qo'shildi! 🏆`, 'gold');
            closeGame();
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (document.activeElement && typeof document.activeElement.blur === 'function') {
                document.activeElement.blur();
            }
            if (RobloxState.gameInstance) {
                RobloxState.gameInstance.respawn();
            }
        });
    }

    // On-Screen Jump Button (FAB)
    const screenJumpBtn = document.getElementById('screenJumpBtn');
    if (screenJumpBtn) {
        const triggerJump = (e) => {
            e.preventDefault();
            if (document.activeElement && typeof document.activeElement.blur === 'function') {
                document.activeElement.blur();
            }
            if (RobloxState.gameInstance) {
                RobloxState.gameInstance.jump();
            }
        };
        screenJumpBtn.addEventListener('mousedown', triggerJump);
        screenJumpBtn.addEventListener('touchstart', triggerJump);
    }

    // Hero banner play button
    const heroPlayBtn = document.getElementById('heroPlayBtn');
    if (heroPlayBtn) {
        heroPlayBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (document.activeElement && typeof document.activeElement.blur === 'function') {
                document.activeElement.blur();
            }
            launchGame('mega_obby');
        });
    }
}

function launchGame(gameId) {
    const modal = document.getElementById('gameModal');
    if (!modal) return;

    // Remove focus from any clicked button so Space key does not re-click buttons!
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Start timer
    gameSeconds = 0;
    const timerEl = document.getElementById('gameTimerText');
    if (gameTimerInterval) clearInterval(gameTimerInterval);
    gameTimerInterval = setInterval(() => {
        gameSeconds++;
        const m = String(Math.floor(gameSeconds / 60)).padStart(2, '0');
        const s = String(gameSeconds % 60).padStart(2, '0');
        if (timerEl) timerEl.textContent = `${m}:${s}`;
    }, 1000);

    // Initialize or Reset Game Engine
    if (!RobloxState.gameInstance) {
        RobloxState.gameInstance = new RobloxGame('robloxGameCanvas');
        RobloxState.gameInstance.init();

        // Bind callbacks
        RobloxState.gameInstance.onCoinCollect = (count) => {
            // Collecting coin in game adds +10 R$ to player wallet!
            RobloxState.robux += 10;
            saveState();
            updateRobuxDisplay();
            const coinEl = document.getElementById('inGameCoins');
            if (coinEl) coinEl.textContent = `+${count * 10} R$`;
            showToast(`+10 Robux tangasi olindi! 🪙`, 'gold');
        };

        RobloxState.gameInstance.onCheckpoint = (index) => {
            const cpEl = document.getElementById('gameCheckpointText');
            if (cpEl) cpEl.textContent = `Bosqich ${index + 1} / 5`;
            showToast(`🚩 Nazorat nuqtasi saqlandi! (Bosqich ${index + 1})`, 'success');
        };

        RobloxState.gameInstance.onHealthChange = (hp) => {
            const fill = document.getElementById('gameHealthFill');
            const text = document.getElementById('gameHealthText');
            if (fill) fill.style.width = `${hp}%`;
            if (text) text.textContent = `${hp} / 100`;
        };

        RobloxState.gameInstance.onDeath = () => {
            showToast(`OOF! Qayta tug'ilmoqdasiz... 💀`, 'error');
        };

        RobloxState.gameInstance.onWin = () => {
            const victoryOverlay = document.getElementById('victoryOverlay');
            if (victoryOverlay) victoryOverlay.classList.add('active');
        };

    } else {
        RobloxState.gameInstance.isRunning = true;
        RobloxState.gameInstance.handleResize();
    }

    // Reset HUD
    const cpEl = document.getElementById('gameCheckpointText');
    if (cpEl) cpEl.textContent = `Bosqich 1 / 5`;
    const victoryOverlay = document.getElementById('victoryOverlay');
    if (victoryOverlay) victoryOverlay.classList.remove('active');

    setTimeout(() => {
        if (RobloxState.gameInstance) RobloxState.gameInstance.handleResize();
    }, 60);
}

function closeGame() {
    const modal = document.getElementById('gameModal');
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = 'auto';

    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
        gameTimerInterval = null;
    }

    if (RobloxState.gameInstance) {
        RobloxState.gameInstance.stop();
    }

    if (window.robloxAudio) window.robloxAudio.playClick();
}
