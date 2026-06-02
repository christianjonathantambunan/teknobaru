const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// ── Helper: rule-based mood/selera tags ──────────────────────────────────────

const MOOD_TAGS = {
    lapar_berat: ['makanan', 'berkuah', 'berat'],
    santai: ['semua'],
    pengen_coba: ['semua'],
    buru_buru: ['snack', 'minuman'],
};

const SELERA_TAGS = {
    pedas: ['pedas', 'sambal'],
    manis: ['manis', 'es', 'juice', 'teh'],
    gurih: ['gurih', 'ayam', 'soto', 'bakso'],
    segar: ['segar', 'jus', 'es', 'minuman'],
    berkuah: ['soto', 'bakso', 'mie', 'sup'],
};

const KATEGORI_MAP = {
    semua: null,
    makanan: ['makanan', 'nasi', 'mie', 'soto', 'bakso', 'ayam'],
    minuman: ['minuman', 'es', 'jus', 'teh', 'kopi'],
    snack: ['snack', 'gorengan', 'kentang', 'roti'],
};

function parseBudget(budgetValue) {
    const [min, max] = budgetValue.split('-').map(Number);
    return { min: min || 0, max: max || 99999 };
}

function scoreItem(item, tenantName, tags) {
    let score = 0;
    const text = `${item.name} ${item.description || ''} ${tenantName}`.toLowerCase();
    tags.forEach(tag => { if (text.includes(tag)) score++; });
    return score;
}

// ── Rule-based recommendation engine ────────────────────────────────────────

async function getRuleBasedRecommendations(mood, selera, kategori, budgetValue) {
    const { min, max } = parseBudget(budgetValue);

    // Fetch all menu items with tenant info
    const menuItems = await prisma.menuItem.findMany({
        where: { isAvailable: true, price: { gte: min, lte: max } },
        include: {
            category: {
                include: {
                    tenant: { select: { id: true, storeName: true, isOpen: true } },
                },
            },
        },
    });

    // Filter only open tenants
    const openItems = menuItems.filter(item => item.category.tenant.isOpen);

    // Filter by kategori
    const kategoriKeywords = KATEGORI_MAP[kategori] || null;
    const filtered = kategoriKeywords
        ? openItems.filter(item => {
            const text = `${item.name} ${item.description || ''}`.toLowerCase();
            return kategoriKeywords.some(k => text.includes(k));
        })
        : openItems;

    const pool = filtered.length > 0 ? filtered : openItems;

    // Score items
    const moodTags = MOOD_TAGS[mood] || [];
    const seleraTags = SELERA_TAGS[selera] || [];
    const allTags = [...moodTags, ...seleraTags];

    const scored = pool.map(item => ({
        item,
        score: scoreItem(item, item.category.tenant.storeName, allTags),
    }));

    scored.sort((a, b) => b.score - a.score || Math.random() - 0.5);

    return scored.slice(0, 3).map(({ item }) => ({
        itemName: item.name,
        tenantName: item.category.tenant.storeName,
        tenantId: item.category.tenant.id,
        price: item.price,
    }));
}

function buildReply(mood, selera, kategori, budget, recommendations) {
    const MOOD_TEXT = {
        lapar_berat: 'lagi lapar banget',
        santai: 'lagi santai',
        pengen_coba: 'pengen coba yang baru',
        buru_buru: 'lagi buru-buru',
    };
    const SELERA_TEXT = {
        pedas: 'pedas',
        manis: 'manis',
        gurih: 'gurih',
        segar: 'segar / ringan',
        berkuah: 'berkuah',
    };

    const moodText = MOOD_TEXT[mood] || mood;
    const seleraText = SELERA_TEXT[selera] || selera;

    if (recommendations.length === 0) {
        return `Hmm, sepertinya belum ada menu yang cocok dengan preferensimu saat ini. Coba ubah kategori atau budget ya!`;
    }

    const names = recommendations.map(r => `${r.itemName} dari ${r.tenantName}`).join(', ');
    return `Hei! Karena kamu ${moodText} dan suka yang ${seleraText}, aku punya beberapa pilihan yang pas buat kamu nih! 😄\n\nBerikut rekomendasiku: ${names}.\n\nSemua ada dalam budget-mu dan tersedia sekarang. Langsung klik aja untuk pesan! 🍽️`;
}

// ── POST /api/ai/recommend ───────────────────────────────────────────────────

router.post('/recommend', async (req, res) => {
    try {
        const { message } = req.body;

        // Parse preference values from the message string
        // Format: "Mood saya: <moodLabel>. Selera: <seleraLabel>. Kategori ...: <kategoriLabel>. Budget saya: <budgetLabel>."
        const moodMatch = message.match(/Mood saya:\s*(.+?)\./);
        const seleraMatch = message.match(/Selera:\s*(.+?)\./);
        const kategoriMatch = message.match(/Kategori.*?:\s*(.+?)\./);
        const budgetMatch = message.match(/Budget saya:\s*(.+?)\.?$/);

        // Reverse-map labels → values
        const MOOD_VALUES = {
            '😤 lapar banget': 'lapar_berat',
            '😌 santai aja': 'santai',
            '🤩 pengen coba yang baru': 'pengen_coba',
            '⚡ lagi buru-buru': 'buru_buru',
        };
        const SELERA_VALUES = {
            '🌶️ pedas': 'pedas',
            '🍯 manis': 'manis',
            '🧂 gurih': 'gurih',
            '🍃 segar / ringan': 'segar',
            '🍜 berkuah': 'berkuah',
        };
        const KATEGORI_VALUES = {
            '🍽️ semua': 'semua',
            '🍛 makanan berat': 'makanan',
            '🥤 minuman': 'minuman',
            '🍟 snack / gorengan': 'snack',
        };
        const BUDGET_VALUES = {
            '< rp 10.000': '5000-10000',
            'rp 10.000 – 15.000': '10000-15000',
            'rp 15.000 – 20.000': '15000-20000',
            '> rp 20.000': '20000-99999',
        };

        const normalize = str => (str || '').trim().toLowerCase();

        const mood = MOOD_VALUES[normalize(moodMatch?.[1])] || 'santai';
        const selera = SELERA_VALUES[normalize(seleraMatch?.[1])] || 'gurih';
        const kategori = KATEGORI_VALUES[normalize(kategoriMatch?.[1])] || 'semua';
        const budget = BUDGET_VALUES[normalize(budgetMatch?.[1])] || '10000-15000';

        // Get recommendations
        const recommendations = await getRuleBasedRecommendations(mood, selera, kategori, budget);

        // Build natural-language reply
        const reply = buildReply(mood, selera, kategori, budget, recommendations);

        return res.json({ reply, recommendations });

    } catch (error) {
        console.error('AI recommend error:', error);
        res.status(500).json({ error: 'Gagal memproses rekomendasi AI' });
    }
});

module.exports = router;
